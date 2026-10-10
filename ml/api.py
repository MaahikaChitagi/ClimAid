"""API that classifies one disaster photo. See openapi.yaml for the response shape."""

from io import BytesIO
from pathlib import Path

import httpx
import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel, HttpUrl

from dataset import preprocess_image
from model import DISASTER_TYPES, MODEL_NAME, SEVERITIES, load_model

CHECKPOINT = Path(__file__).resolve().parent / "checkpoints" / "disaster_cnn.pt"

app = FastAPI(title="ClimAid Disaster CNN", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_model = None
_device = torch.device("cpu")


class ClassifyUrl(BaseModel):
    imageUrl: HttpUrl


def get_model():
    global _model
    if _model is None:
        if not CHECKPOINT.exists():
            raise HTTPException(status_code=503, detail="Model checkpoint missing. Run python train.py in ml/.")
        _model, _ = load_model(CHECKPOINT, _device)
    return _model


def score(image: Image.Image):
    model = get_model()
    batch = preprocess_image(image).to(_device)
    with torch.no_grad():
        type_probs, severity_probs = model.predict_proba(batch)
    type_probs = type_probs[0].tolist()
    severity_probs = severity_probs[0].tolist()
    type_index = int(max(range(len(type_probs)), key=type_probs.__getitem__))
    severity_index = int(max(range(len(severity_probs)), key=severity_probs.__getitem__))
    disaster = {name: round(value, 4) for name, value in zip(DISASTER_TYPES, type_probs)}
    severity = {name: round(value, 4) for name, value in zip(SEVERITIES, severity_probs)}
    return {
        "disasterType": DISASTER_TYPES[type_index],
        "disasterConfidence": round(type_probs[type_index], 4),
        "severity": SEVERITIES[severity_index],
        "severityConfidence": round(severity_probs[severity_index], 4),
        "probabilities": {"disaster": disaster, "severity": severity},
        "model": MODEL_NAME,
    }


def open_bytes(raw: bytes) -> Image.Image:
    try:
        return Image.open(BytesIO(raw)).convert("RGB")
    except UnidentifiedImageError as exc:
        raise HTTPException(status_code=422, detail="File is not a readable image.") from exc


@app.get("/api/health")
def health():
    loaded = _model is not None
    return {"status": "ok", "modelLoaded": CHECKPOINT.exists(), "model": MODEL_NAME if loaded or CHECKPOINT.exists() else None}


@app.post("/api/classify")
async def classify(file: UploadFile = File(...)):
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")
    return score(open_bytes(raw))


@app.post("/api/classify-url")
async def classify_url(body: ClassifyUrl):
    try:
        async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
            response = await client.get(str(body.imageUrl))
            response.raise_for_status()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=422, detail="Could not download imageUrl.") from exc
    return score(open_bytes(response.content))
