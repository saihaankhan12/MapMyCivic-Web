import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4100);

app.use(cors());
app.use(express.json());

function pickDepartment(text) {
  const normalized = text.toLowerCase();

  if (normalized.includes("garbage") || normalized.includes("waste")) {
    return {
      departmentId: "sanitation",
      severity: "High",
      verificationStatus: "Verified by Model",
      verificationConfidence: 91,
      suggestedCameraId: "CAM-MS-AUTO",
    };
  }

  if (normalized.includes("water") || normalized.includes("pipeline")) {
    return {
      departmentId: "water",
      severity: "High",
      verificationStatus: "Verified by Model",
      verificationConfidence: 89,
      suggestedCameraId: "CAM-WS-AUTO",
    };
  }

  if (normalized.includes("light") || normalized.includes("streetlight") || normalized.includes("dark")) {
    return {
      departmentId: "electricity",
      severity: "Medium",
      verificationStatus: "Needs Manual Review",
      verificationConfidence: 69,
      suggestedCameraId: "CAM-EL-AUTO",
    };
  }

  if (normalized.includes("traffic") || normalized.includes("signal")) {
    return {
      departmentId: "traffic",
      severity: "Critical",
      verificationStatus: "Verified by Model",
      verificationConfidence: 95,
      suggestedCameraId: "CAM-TR-AUTO",
    };
  }

  return {
    departmentId: "pwd",
    severity: normalized.includes("drain") || normalized.includes("pothole")
      ? "Critical"
      : "Medium",
    verificationStatus: "Verified by Model",
    verificationConfidence: 86,
    suggestedCameraId: "CAM-PWD-AUTO",
  };
}

app.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "mapmycivic-inference-service" });
});

app.post("/predict", (request, response) => {
  const combinedText = [
    request.body.category,
    request.body.title,
    request.body.description,
    request.body.location,
    request.body.ward,
  ]
    .filter(Boolean)
    .join(" ");

  response.json(pickDepartment(combinedText));
});

app.listen(port, () => {
  console.log(`Inference service listening on http://localhost:${port}`);
});
