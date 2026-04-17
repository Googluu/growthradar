import uuid
from datetime import datetime

from pydantic import BaseModel


class AuditJobResponse(BaseModel):
    id: uuid.UUID
    company_id: uuid.UUID
    owner_id: str
    status: str
    result: dict | None
    error: str | None
    created_at: datetime
    started_at: datetime | None
    completed_at: datetime | None

    model_config = {"from_attributes": True}


class AuditJobCreated(BaseModel):
    """Response inmediato al disparar una auditoría — antes de que el worker la procese."""
    job_id: uuid.UUID
    status: str
