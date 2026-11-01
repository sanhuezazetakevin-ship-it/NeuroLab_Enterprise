from uuid import UUID
from datetime import datetime
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field

JobStatus = Literal["QUEUED", "PREPARING", "RUNNING", "COMPLETED", "FAILED", "CANCELLED"]

class HyperparametersConfig(BaseModel):
    epochs: int = Field(default=30, ge=1, le=1000)
    batch_size: int = Field(default=32, ge=1, le=1024)
    optimizer: str = Field(default="adam") # adam, sgd, rmsprop
    learning_rate: float = Field(default=0.001, gt=0.0)
    loss: str = Field(default="sparse_categorical_crossentropy")
    metrics: List[str] = Field(default=["accuracy"])

class TrainingJobCreate(BaseModel):
    architecture_id: UUID
    dataset_id: UUID
    hyperparameters: HyperparametersConfig

class TrainingMetricResponse(BaseModel):
    id: int
    job_id: UUID
    epoch: int
    metric_name: str
    metric_value: float
    recorded_at: datetime

    class Config:
        from_attributes = True

class TrainingJobResponse(BaseModel):
    id: UUID
    project_id: UUID
    architecture_id: UUID
    dataset_id: UUID
    status: JobStatus
    progress: float
    hyperparameters: Dict[str, Any]
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    error_message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
