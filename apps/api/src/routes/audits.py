import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.middleware.auth import get_current_user
from src.models.audit_job import AuditJob
from src.models.company import Company
from src.schemas.audit_job import AuditJobCreated, AuditJobResponse

router = APIRouter(tags=["audits"])


@router.post(
    "/companies/{company_id}/audits",
    response_model=AuditJobCreated,
    status_code=status.HTTP_202_ACCEPTED,
)
async def trigger_audit(
    company_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Encola una auditoría para la empresa. Retorna inmediatamente con job_id."""
    # Verificar que la empresa existe y pertenece al usuario
    result = await db.execute(
        select(Company).where(Company.id == company_id, Company.owner_id == user["sub"])
    )
    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empresa no encontrada")

    job = AuditJob(company_id=company_id, owner_id=user["sub"])
    db.add(job)
    await db.commit()
    await db.refresh(job)

    # Encolar en Celery — import local para evitar que el módulo tasks
    # se cargue antes de que Celery esté inicializado
    from src.tasks.audit import run_audit
    run_audit.delay(str(job.id))  # type: ignore[attr-defined]  # stubs de Celery no exponen .delay()

    return AuditJobCreated(job_id=job.id, status=job.status)


@router.get("/audits/{job_id}", response_model=AuditJobResponse)
async def get_audit_status(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Retorna el estado actual del job. El frontend hace polling hasta status == completed."""
    result = await db.execute(
        select(AuditJob).where(AuditJob.id == job_id, AuditJob.owner_id == user["sub"])
    )
    job = result.scalar_one_or_none()
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Auditoría no encontrada")
    return job


@router.get("/companies/{company_id}/audits", response_model=list[AuditJobResponse])
async def list_audits(
    company_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Historial de auditorías de una empresa, más reciente primero."""
    result = await db.execute(
        select(Company).where(Company.id == company_id, Company.owner_id == user["sub"])
    )
    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empresa no encontrada")

    jobs = await db.execute(
        select(AuditJob)
        .where(AuditJob.company_id == company_id)
        .order_by(AuditJob.created_at.desc())
    )
    return jobs.scalars().all()
