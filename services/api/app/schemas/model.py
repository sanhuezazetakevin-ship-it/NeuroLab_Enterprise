from uuid import UUID
from datetime import datetime
from typing import Optional, Dict, Any, Literal
from pydantic import BaseModel

ModelStatus = Literal["DRAFT", "REVIEWED", "APPROVED", "RETIRED"]

class ModelVersionResponse(BaseModel):
    id: UUID
    project_id: UUID
    job_id: UUID
    version: str
    storage_key: str
    status: ModelStatus
    checksum: str
    metrics_summary: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

class ModelStatusUpdate(BaseModel):
    status: ModelStatus
