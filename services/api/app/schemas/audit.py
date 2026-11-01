from uuid import UUID
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel

class AuditEventCreate(BaseModel):
    actor_id: Optional[UUID] = None
    project_id: Optional[UUID] = None
    action: str
    metadata_json: Dict[str, Any] = {}

class AuditEventResponse(AuditEventCreate):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
