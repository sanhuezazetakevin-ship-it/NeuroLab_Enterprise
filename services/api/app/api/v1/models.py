from uuid import UUID, uuid4
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, HTTPException, status
from app.schemas.model import ModelVersionResponse, ModelStatusUpdate

router = APIRouter(tags=["Model Registry"])

MOCK_MODELS: List[dict] = [
    {
        "id": UUID("dddddddd-dddd-dddd-dddd-dddddddddddd"),
        "project_id": UUID("11111111-1111-1111-1111-111111111111"),
        "job_id": UUID("cccccccc-cccc-cccc-cccc-cccccccccccc"),
        "version": "1.0.0",
        "storage_key": "models/11111111/model_v1.0.0.keras",
        "status": "APPROVED",
        "checksum": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "metrics_summary": {
            "accuracy": 0.942,
            "loss": 0.168,
            "val_accuracy": 0.925,
            "val_loss": 0.194,
            "f1_score": 0.912
        },
        "created_at": datetime.now(timezone.utc)
    }
]

@router.get("/projects/{project_id}/models", response_model=List[ModelVersionResponse])
async def list_models(project_id: UUID):
    return [m for m in MOCK_MODELS if m["project_id"] == project_id]

@router.patch("/models/{id}/status", response_model=ModelVersionResponse)
async def update_model_status(id: UUID, req: ModelStatusUpdate):
    for m in MOCK_MODELS:
        if m["id"] == id:
            m["status"] = req.status
            return m
    raise HTTPException(status_code=404, detail="Versión de modelo no encontrada")
