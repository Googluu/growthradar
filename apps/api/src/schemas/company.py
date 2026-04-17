import uuid
from datetime import datetime

from pydantic import BaseModel, HttpUrl, field_validator


class CompanyCreate(BaseModel):
    name: str
    domain: str
    description: str | None = None
    location: str | None = None

    @field_validator("domain")
    @classmethod
    def strip_protocol(cls, v: str) -> str:
        """Normaliza el dominio — acepta 'ejemplo.com' o 'https://ejemplo.com'."""
        return v.removeprefix("https://").removeprefix("http://").rstrip("/")


class CompanyUpdate(BaseModel):
    name: str | None = None
    domain: str | None = None
    description: str | None = None
    location: str | None = None

    @field_validator("domain")
    @classmethod
    def strip_protocol(cls, v: str | None) -> str | None:
        if v is None:
            return v
        return v.removeprefix("https://").removeprefix("http://").rstrip("/")


class CompanyResponse(BaseModel):
    id: uuid.UUID
    owner_id: str
    name: str
    domain: str
    description: str | None
    location: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
