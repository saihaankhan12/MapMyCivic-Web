import { config } from "./config.js";
import fs from "node:fs/promises";

export async function inferIssue(payload) {
  const formData = new FormData();

  if (payload.imagePath) {
    const buffer = await fs.readFile(payload.imagePath);
    const filename = payload.imageFilename ?? "issue-image.jpg";
    formData.append("image", new Blob([buffer]), filename);
  }

  for (const [key, value] of Object.entries(payload)) {
    if (value == null || key === "imagePath" || key === "imageFilename") {
      continue;
    }

    formData.append(key, String(value));
  }

  const response = await fetch(`${config.inferenceServiceUrl}/predict`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Inference service request failed.");
  }

  return response.json();
}
