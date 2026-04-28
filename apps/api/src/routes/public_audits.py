"""
Endpoints públicos de auditoría — sin autenticación.
Usados por la landing page para el flujo de scan anónimo.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.models.public_audit_job import PublicAuditJob

router = APIRouter(prefix="/public", tags=["public"])


class PublicAuditRequest(BaseModel):
    url: str


class PublicAuditStarted(BaseModel):
    job_id: uuid.UUID
    status: str


class PublicAuditStatusResponse(BaseModel):
    job_id: uuid.UUID
    status: str
    result: dict | None
    error: str | None

    model_config = {"from_attributes": True}


@router.post(
    "/audit",
    response_model=PublicAuditStarted,
    status_code=status.HTTP_202_ACCEPTED,
)
async def trigger_public_audit(
    body: PublicAuditRequest,
    db: AsyncSession = Depends(get_db),
):
    """Encola una auditoría pública (sin cuenta). Retorna job_id para hacer polling."""
    url = body.url.strip()
    if not url:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="URL requerida")

    job = PublicAuditJob(url=url)
    db.add(job)
    await db.commit()
    await db.refresh(job)

    from src.tasks.public_audit import run_public_audit
    run_public_audit.delay(str(job.id), url)  # type: ignore[attr-defined]

    return PublicAuditStarted(job_id=job.id, status=job.status)


@router.get("/audit/{job_id}", response_model=PublicAuditStatusResponse)
async def get_public_audit_status(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Retorna el estado del job. El frontend hace polling hasta status == completed | failed."""
    result = await db.execute(
        select(PublicAuditJob).where(PublicAuditJob.id == job_id)
    )
    job = result.scalar_one_or_none()
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job no encontrado")

    return PublicAuditStatusResponse(
        job_id=job.id,
        status=job.status,
        result=job.result,
        error=job.error,
    )
