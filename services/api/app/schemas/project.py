from uuid import UUID
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class ProjectMemberSchema(BaseModel):
    user_id: UUID
    role: str
    added_at: datetime

    class Config:
        from_attributes = True

class ProjectResponse(ProjectBase):
    id: UUID
    owner_id: UUID
    status: str
    created_at: datetime
    updated_at: datetime
    architectures_count: Optional[int] = 0
    datasets_count: Optional[int] = 0
    jobs_count: Optional[int] = 0

    class Config:
        from_attributes = True
