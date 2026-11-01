from uuid import UUID, uuid4
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, HTTPException, status
from app.schemas.architecture import (
    ArchitectureCreate, ArchitectureResponse, ArchitectureValidationResult, NetworkTopology
)
from app.modules.architectures.validator import ArchitectureValidator

router = APIRouter(prefix="/projects/{project_id}/architectures", tags=["Arquitecturas"])

MOCK_ARCHITECTURES: List[dict] = [
    {
        "id": UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
        "project_id": UUID("11111111-1111-1111-1111-111111111111"),
        "name": "MLP Feedforward Base (Semana 11)",
        "family": "FEEDFORWARD",
        "config_json": {
            "input_shape": [16],
            "layers": [
                {"type": "Dense", "units": 64, "activation": "relu"},
                {"type": "Dropout", "rate": 0.2},
                {"type": "Dense", "units": 32, "activation": "relu"},
                {"type": "Dense", "units": 1, "activation": "sigmoid"}
            ]
        },
        "version": 1,
        "created_at": datetime.now(timezone.utc)
    }
]

@router.post("/validate", response_model=ArchitectureValidationResult)
async def validate_architecture(topology: NetworkTopology, family: str = "FEEDFORWARD"):
    """
    Valida la topología y calcula el total de parámetros y forma del tensor resultante.
    """
    return ArchitectureValidator.validate_topology(topology, family)

@router.get("", response_model=List[ArchitectureResponse])
async def list_architectures(project_id: UUID):
    return [a for a in MOCK_ARCHITECTURES if a["project_id"] == project_id]

@router.post("", response_model=ArchitectureResponse, status_code=status.HTTP_201_CREATED)
async def create_architecture(project_id: UUID, architecture: ArchitectureCreate):
    # Validar primero en backend
    val_result = ArchitectureValidator.validate_topology(architecture.config_json, architecture.family)
    if not val_result.valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": "Arquitectura inválida", "errors": val_result.errors}
        )

    new_arch = {
        "id": uuid4(),
        "project_id": project_id,
        "name": architecture.name,
        "family": architecture.family,
        "config_json": architecture.config_json.dict(),
        "version": 1,
        "created_at": datetime.now(timezone.utc)
    }
    MOCK_ARCHITECTURES.append(new_arch)
    return new_arch
