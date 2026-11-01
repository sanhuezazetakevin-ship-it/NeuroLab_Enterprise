import asyncio
import json
from uuid import UUID, uuid4
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, status
from fastapi.responses import StreamingResponse
from app.schemas.training import TrainingJobCreate, TrainingJobResponse, TrainingMetricResponse
from app.modules.training.service import training_orchestrator
from app.core.events import event_manager

router = APIRouter(tags=["Entrenamientos"])

MOCK_JOBS: List[dict] = [
    {
        "id": UUID("cccccccc-cccc-cccc-cccc-cccccccccccc"),
        "project_id": UUID("11111111-1111-1111-1111-111111111111"),
        "architecture_id": UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
        "dataset_id": UUID("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
        "status": "COMPLETED",
        "progress": 100.0,
        "hyperparameters": {
            "epochs": 20,
            "batch_size": 32,
            "optimizer": "adam",
            "learning_rate": 0.001,
            "loss": "binary_crossentropy",
            "metrics": ["accuracy"]
        },
        "started_at": datetime.now(timezone.utc),
        "ended_at": datetime.now(timezone.utc),
        "error_message": None,
        "created_at": datetime.now(timezone.utc)
    }
]

@router.post("/projects/{project_id}/training-jobs", response_model=TrainingJobResponse, status_code=status.HTTP_202_ACCEPTED)
async def start_training_job(project_id: UUID, req: TrainingJobCreate):
    job_id = uuid4()
    job = {
        "id": job_id,
        "project_id": project_id,
        "architecture_id": req.architecture_id,
        "dataset_id": req.dataset_id,
        "status": "QUEUED",
        "progress": 0.0,
        "hyperparameters": req.hyperparameters.dict(),
        "started_at": None,
        "ended_at": None,
        "error_message": None,
        "created_at": datetime.now(timezone.utc)
    }
    MOCK_JOBS.insert(0, job)

    # Disparar orquestador hacia cola de Redis (con fallback si Redis no está activo)
    try:
        await training_orchestrator.enqueue_training_job(
            job_id=job_id,
            project_id=project_id,
            architecture_id=req.architecture_id,
            dataset_id=req.dataset_id,
            hyperparameters=req.hyperparameters.dict()
        )
    except Exception:
        # Modo simulación local directa si redis no está levantado
        pass

    return job

@router.get("/training-jobs/{id}", response_model=TrainingJobResponse)
async def get_training_job(id: UUID):
    for job in MOCK_JOBS:
        if job["id"] == id:
            return job
    raise HTTPException(status_code=404, detail="Trabajo de entrenamiento no encontrado")

@router.post("/training-jobs/{id}/cancel", status_code=status.HTTP_200_OK)
async def cancel_training_job(id: UUID):
    for job in MOCK_JOBS:
        if job["id"] == id:
            if job["status"] in ["COMPLETED", "FAILED", "CANCELLED"]:
                raise HTTPException(status_code=400, detail="El trabajo ya finalizó o fue cancelado")
            job["status"] = "CANCELLED"
            job["ended_at"] = datetime.now(timezone.utc)
            try:
                await training_orchestrator.request_job_cancellation(id)
            except Exception:
                pass
            return {"message": "Solicitud de cancelación enviada al worker"}
    raise HTTPException(status_code=404, detail="Trabajo no encontrado")

@router.websocket("/training-jobs/{id}/events")
async def websocket_job_events(websocket: WebSocket, id: UUID):
    await event_manager.connect(str(id), websocket)
    try:
        while True:
            # Mantener conexión abierta y escuchar pings del cliente
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        event_manager.disconnect(str(id), websocket)
