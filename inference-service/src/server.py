import io
import os
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Any

import numpy as np
import uvicorn
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from ultralytics import YOLO


PORT = int(os.getenv("PORT", "4100"))
MODEL_CONFIDENCE = float(os.getenv("MODEL_CONFIDENCE", "0.25"))
ROOT_DIR = Path(__file__).resolve().parents[2]
MODELS_DIR = ROOT_DIR / "models"

MODEL_REGISTRY = {
    "pothole": {
        "path": MODELS_DIR / "pothole.pt",
        "issueType": "pothole",
        "category": "Road Damage",
        "departmentId": "pwd",
        "severity": "Critical",
        "verificationStatus": "Verified by Model",
        "suggestedCameraId": "CAM-PWD-AUTO",
    },
    "garbage": {
        "path": MODELS_DIR / "garbage.pt",
        "issueType": "garbage",
        "category": "Waste Management",
        "departmentId": "sanitation",
        "severity": "High",
        "verificationStatus": "Verified by Model",
        "suggestedCameraId": "CAM-MS-AUTO",
    },
    "road-flood": {
        "path": MODELS_DIR / "road-flood.pt",
        "issueType": "road-flood",
        "category": "Water Supply",
        "departmentId": "water",
        "severity": "High",
        "verificationStatus": "Verified by Model",
        "suggestedCameraId": "CAM-WS-AUTO",
    },
}

app = FastAPI(title="MapMyCivic Inference Service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

executor = ThreadPoolExecutor(max_workers=3)
loaded_models: dict[str, YOLO] = {}


def load_models() -> None:
    for model_key, model_config in MODEL_REGISTRY.items():
        model_path = model_config["path"]

        if not model_path.exists():
            raise FileNotFoundError(f"Model not found: {model_path}")

        loaded_models[model_key] = YOLO(str(model_path))


def read_image(image_bytes: bytes) -> np.ndarray:
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    return np.array(image)


def run_model(model_key: str, image_array: np.ndarray) -> list[dict[str, Any]]:
    model = loaded_models[model_key]
    model_config = MODEL_REGISTRY[model_key]
    result = model.predict(image_array, conf=MODEL_CONFIDENCE, verbose=False)[0]

    detections: list[dict[str, Any]] = []

    if result.boxes is None:
      return detections

    for box in result.boxes:
        confidence = float(box.conf.item())
        class_index = int(box.cls.item())
        xyxy = [float(value) for value in box.xyxy[0].tolist()]
        label = result.names.get(class_index, model_config["issueType"])

        detections.append(
            {
                "model": model_key,
                "label": label,
                "issueType": model_config["issueType"],
                "category": model_config["category"],
                "departmentId": model_config["departmentId"],
                "severity": model_config["severity"],
                "verificationStatus": model_config["verificationStatus"],
                "suggestedCameraId": model_config["suggestedCameraId"],
                "confidence": round(confidence * 100, 2),
                "bbox": xyxy,
            }
        )

    return detections


def build_response(detections: list[dict[str, Any]]) -> dict[str, Any]:
    if not detections:
        return {
            "departmentId": "pwd",
            "severity": "Medium",
            "verificationStatus": "Needs Manual Review",
            "verificationConfidence": 0,
            "suggestedCameraId": "CAM-REVIEW-AUTO",
            "primaryCategory": "Unverified",
            "primaryIssueType": "unknown",
            "detections": [],
            "detectedIssueTypes": [],
        }

    primary_detection = max(detections, key=lambda item: item["confidence"])

    return {
        "departmentId": primary_detection["departmentId"],
        "severity": primary_detection["severity"],
        "verificationStatus": primary_detection["verificationStatus"],
        "verificationConfidence": primary_detection["confidence"],
        "suggestedCameraId": primary_detection["suggestedCameraId"],
        "primaryCategory": primary_detection["category"],
        "primaryIssueType": primary_detection["issueType"],
        "detections": detections,
        "detectedIssueTypes": sorted(
            {detection["issueType"] for detection in detections}
        ),
    }


@app.on_event("startup")
def startup_event() -> None:
    load_models()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "mapmycivic-inference-service"}


@app.post("/predict")
async def predict(
    image: UploadFile = File(...),
    category: str | None = Form(default=None),
    title: str | None = Form(default=None),
    description: str | None = Form(default=None),
    location: str | None = Form(default=None),
    ward: str | None = Form(default=None),
) -> dict[str, Any]:
    image_bytes = await image.read()
    image_array = read_image(image_bytes)

    futures = [
        executor.submit(run_model, model_key, image_array)
        for model_key in MODEL_REGISTRY
    ]

    detections: list[dict[str, Any]] = []

    for future in futures:
        detections.extend(future.result())

    response = build_response(detections)
    response["requestMeta"] = {
        "category": category,
        "title": title,
        "description": description,
        "location": location,
        "ward": ward,
        "filename": image.filename,
    }

    return response


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT)
