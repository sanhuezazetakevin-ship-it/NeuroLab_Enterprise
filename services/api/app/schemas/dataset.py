from uuid import UUID
from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel

class DatasetBase(BaseModel):
    name: str
    version: str = "v1.0"
    metadata_json: Dict[str, Any] = {}

class DatasetCreate(DatasetBase):
    storage_key: str

class DatasetResponse(DatasetBase):
    id: UUID
    project_id: UUID
    storage_key: str
    created_at: datetime

    class Config:
        from_attributes = True
