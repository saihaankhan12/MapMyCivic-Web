import express from "express";
import cors from "cors";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { createToken, requireAdminAuth } from "./auth.js";
import { config } from "./config.js";
import { healthcheck } from "./repository.js";
import {
  attachCctvFrames,
  authenticateUser,
  createCitizenIssue,
  createIssueDetection,
  createIssueUpload,
  createNotice,
  getChecklist,
  getDepartments,
  getIssueById,
  getIssues,
  getNotices,
  linkUploadToIssue,
  updateIssueNotes,
  updateIssueStatus,
} from "./repository.js";
import { inferIssue } from "./inferenceClient.js";

const app = express();
const uploadsDir = path.resolve("uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_request, file, callback) => {
    const safeName = file.originalname.replace(/\s+/g, "-");
    callback(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({ storage });

function groupDetectionsByIssueType(detections) {
  const grouped = new Map();

  for (const detection of detections) {
    const existing = grouped.get(detection.issueType);

    if (!existing || detection.confidence > existing.confidence) {
      grouped.set(detection.issueType, detection);
    }
  }

  return [...grouped.values()];
}

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

app.get("/api/health", async (_request, response) => {
  await healthcheck();
  response.json({ status: "ok", service: "mapmycivic-backend" });
});

app.post("/api/auth/login", async (request, response) => {
  const { email, password, departmentId } = request.body;

  if (!email || !password || !departmentId) {
    response.status(400).json({ message: "Email, password, and department are required." });
    return;
  }

  const user = await authenticateUser(email, password, departmentId);

  if (!user) {
    response.status(401).json({
      message: "Invalid credentials for the selected department.",
    });
    return;
  }

  const token = createToken({
    sub: user.id,
    role: user.role,
    departmentId: user.departmentId,
    email: user.email,
  });

  response.json({ token, user });
});

app.get("/api/bootstrap", async (_request, response) => {
  const [departments, issues, notices, cctvChecklist] = await Promise.all([
    getDepartments(),
    getIssues(),
    getNotices(),
    getChecklist(),
  ]);

  response.json({ departments, issues, notices, cctvChecklist });
});

app.get("/api/departments", async (_request, response) => {
  response.json(await getDepartments());
});

app.get("/api/departments/:departmentId/issues", async (request, response) => {
  response.json(await getIssues({ departmentId: request.params.departmentId }));
});

app.get("/api/issues", async (_request, response) => {
  response.json(await getIssues());
});

app.get("/api/issues/:issueId", async (request, response) => {
  const issue = await getIssueById(request.params.issueId);

  if (!issue) {
    response.status(404).json({ message: "Issue not found." });
    return;
  }

  response.json(issue);
});

app.post("/api/issues", upload.single("image"), async (request, response) => {
  const { category, title, description, location, ward, lat, lng } = request.body;

  if (!category || !title || !description || !location || !ward) {
    response.status(400).json({ message: "Missing required issue fields." });
    return;
  }

  if (!request.file) {
    response.status(400).json({ message: "Issue image is required." });
    return;
  }

  const inference = await inferIssue({
    category,
    title,
    description,
    location,
    ward,
    imagePath: request.file?.path,
    imageFilename: request.file?.originalname,
  });

  const uploadId = await createIssueUpload({
    originalFilename: request.file.originalname,
    storedFilename: request.file.filename,
    filePath: `/uploads/${request.file.filename}`,
    contentType: request.file.mimetype,
  });

  const groupedDetections = groupDetectionsByIssueType(inference.detections);

  const issueInputs =
    groupedDetections.length > 0
      ? groupedDetections.map((detection) => ({
          ...request.body,
          category: detection.category,
          departmentId: detection.departmentId,
          severity: detection.severity,
          verificationStatus: detection.verificationStatus,
          verificationConfidence: Math.round(detection.confidence),
          cctvCameraId: request.body.cctvCameraId ?? detection.suggestedCameraId,
          evidenceCount: request.body.evidenceCount ?? 1,
          lat: Number(lat ?? 19.076),
          lng: Number(lng ?? 72.8777),
        }))
      : [
          {
            ...request.body,
            category:
              inference.primaryCategory !== "Unverified"
                ? inference.primaryCategory
                : category,
            departmentId: inference.departmentId,
            severity: inference.severity,
            verificationStatus: inference.verificationStatus,
            verificationConfidence: Math.round(inference.verificationConfidence),
            cctvCameraId: request.body.cctvCameraId ?? inference.suggestedCameraId,
            evidenceCount: request.body.evidenceCount ?? 1,
            lat: Number(lat ?? 19.076),
            lng: Number(lng ?? 72.8777),
          },
        ];

  const issues = [];

  for (const input of issueInputs) {
    const createdIssue = await createCitizenIssue(input);
    issues.push(createdIssue);
    await linkUploadToIssue(uploadId, createdIssue.id);
  }

  for (const detection of inference.detections) {
    const matchingIssue = issues.find(
      (issue) =>
        issue.category === detection.category &&
        issue.departmentId === detection.departmentId
    );

    await createIssueDetection({
      uploadId,
      issueId: matchingIssue?.id ?? null,
      detection,
    });
  }

  const refreshedIssues = await Promise.all(
    issues.map((issue) => getIssueById(issue.id))
  );

  response.status(201).json({
    issues: refreshedIssues,
    upload: {
      id: uploadId,
      originalFilename: request.file.originalname,
      storedFilename: request.file.filename,
      filePath: `/uploads/${request.file.filename}`,
    },
    detections: inference.detections,
    detectedIssueTypes: inference.detectedIssueTypes,
  });
});

app.post("/api/issues/:issueId/notes", requireAdminAuth, async (request, response) => {
  const issue = await updateIssueNotes(request.params.issueId, request.body.notes ?? "");

  if (!issue) {
    response.status(404).json({ message: "Issue not found." });
    return;
  }

  response.json(issue);
});

app.patch("/api/issues/:issueId/status", requireAdminAuth, async (request, response) => {
  const issue = await updateIssueStatus(request.params.issueId, request.body);

  if (!issue) {
    response.status(404).json({ message: "Issue not found." });
    return;
  }

  response.json(issue);
});

app.post("/api/issues/:issueId/cctv-clip", requireAdminAuth, upload.single("clip"), async (request, response) => {
  if (!request.file) {
    response.status(400).json({ message: "CCTV clip is required." });
    return;
  }

  const issue = await attachCctvFrames(request.params.issueId, request.file.filename);

  if (!issue) {
    response.status(404).json({ message: "Issue not found." });
    return;
  }

  response.json({
    issue,
    uploadedClip: {
      filename: request.file.filename,
      originalName: request.file.originalname,
      path: `/uploads/${request.file.filename}`,
    },
  });
});

app.get("/api/notices", async (_request, response) => {
  response.json(await getNotices());
});

app.post("/api/notices", requireAdminAuth, async (request, response) => {
  const { title, departmentId, description } = request.body;

  if (!title || !departmentId || !description) {
    response.status(400).json({ message: "Missing required notice fields." });
    return;
  }

  response.status(201).json(await createNotice(request.body));
});

async function start() {
  await healthcheck();

  app.listen(config.port, () => {
    console.log(`MapMyCivic backend listening on http://localhost:${config.port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start backend.", error);
  process.exit(1);
});
