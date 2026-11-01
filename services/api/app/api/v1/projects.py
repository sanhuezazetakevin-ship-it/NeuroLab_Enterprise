from uuid import UUID, uuid4
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from app.core.security import get_current_user_token_payload

router = APIRouter(prefix="/projects", tags=["Proyectos de IA"])

# In-memory store for immediate prototype / development execution
MOCK_PROJECTS: List[dict] = [
    {
        "id": UUID("11111111-1111-1111-1111-111111111111"),
        "name": "Clasificador de Clientes - Red Feedforward",
        "description": "Modelo predictivo para determinar propensión de fuga mediante una red neuronal multicapa densa.",
        "owner_id": UUID("c138d879-112e-4b44-b0db-6e1d283626fa"),
        "status": "ACTIVE",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "architectures_count": 3,
        "datasets_count": 2,
        "jobs_count": 5
    },
    {
        "id": UUID("22222222-2222-2222-2222-222222222222"),
        "name": "Reconocimiento de Patrones Visuales (CNN)",
        "description": "Red neuronal convolucional para inspección automatizada de defectos en componentes de manufactura.",
        "owner_id": UUID("c138d879-112e-4b44-b0db-6e1d283626fa"),
        "status": "ACTIVE",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "architectures_count": 2,
        "datasets_count": 1,
        "jobs_count": 2
    }
]

@router.get("", response_model=List[ProjectResponse])
async def list_projects():
    return MOCK_PROJECTS

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(project: ProjectCreate):
    new_project = {
        "id": uuid4(),
        "name": project.name,
        "description": project.description,
        "owner_id": UUID("c138d879-112e-4b44-b0db-6e1d283626fa"),
        "status": "ACTIVE",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "architectures_count": 0,
        "datasets_count": 0,
        "jobs_count": 0
    }
    MOCK_PROJECTS.insert(0, new_project)
    return new_project

@router.get("/{id}", response_model=ProjectResponse)
async def get_project(id: UUID):
    for p in MOCK_PROJECTS:
        if p["id"] == id:
            return p
    raise HTTPException(status_code=404, detail="Proyecto no encontrado")
