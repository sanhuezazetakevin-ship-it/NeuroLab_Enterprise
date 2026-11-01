from uuid import UUID, uuid4
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, HTTPException, status
from app.schemas.dataset import DatasetCreate, DatasetResponse

router = APIRouter(prefix="/projects/{project_id}/datasets", tags=["Datasets"])

MOCK_DATASETS: List[dict] = [
    {
        "id": UUID("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
        "project_id": UUID("11111111-1111-1111-1111-111111111111"),
        "name": "Dataset de Clientes Sintético (Tabular)",
        "version": "v1.0",
        "storage_key": "datasets/11111111/churn_data_v1.csv",
        "metadata_json": {
            "samples": 10000,
            "features_count": 16,
            "target_column": "churn",
            "train_split": 0.7,
            "val_split": 0.15,
            "test_split": 0.15
        },
        "created_at": datetime.now(timezone.utc)
    }
]

@router.get("", response_model=List[DatasetResponse])
async def list_datasets(project_id: UUID):
    return [d for d in MOCK_DATASETS if d["project_id"] == project_id]

@router.post("", response_model=DatasetResponse, status_code=status.HTTP_201_CREATED)
async def create_dataset(project_id: UUID, dataset: DatasetCreate):
    new_ds = {
        "id": uuid4(),
        "project_id": project_id,
        "name": dataset.name,
        "version": dataset.version,
        "storage_key": dataset.storage_key,
        "metadata_json": dataset.metadata_json,
        "created_at": datetime.now(timezone.utc)
    }
    MOCK_DATASETS.append(new_ds)
    return new_ds
