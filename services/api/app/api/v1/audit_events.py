from uuid import UUID, uuid4
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter
from app.schemas.audit import AuditEventResponse

router = APIRouter(tags=["Auditoría"])

MOCK_AUDIT: List[dict] = [
    {
        "id": uuid4(),
        "actor_id": UUID("c138d879-112e-4b44-b0db-6e1d283626fa"),
        "project_id": UUID("11111111-1111-1111-1111-111111111111"),
        "action": "MODEL_APPROVED",
        "metadata_json": {
            "model_version": "1.0.0",
            "approver": "engineer@neurolab.enterprise",
            "validation_accuracy": 0.925
        },
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": uuid4(),
        "actor_id": UUID("c138d879-112e-4b44-b0db-6e1d283626fa"),
        "project_id": UUID("11111111-1111-1111-1111-111111111111"),
        "action": "TRAIN_JOB_COMPLETED",
        "metadata_json": {
            "job_id": "cccccccc-cccc-cccc-cccc-cccccccccccc",
            "epochs": 20,
            "final_loss": 0.168
        },
        "created_at": datetime.now(timezone.utc)
    }
]

@router.get("/projects/{project_id}/audit-events", response_model=List[AuditEventResponse])
async def list_audit_events(project_id: UUID):
    return [e for e in MOCK_AUDIT if e["project_id"] == project_id]
