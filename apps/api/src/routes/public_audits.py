"""
Endpoints públicos — sin autenticación.

/public/audit          — auditoría landing page (rate limit 1/IP)
/public/dashboard-audit — auditoría completa DataForSEO (dedup 24h por dominio)
"""

import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.models.dashboard_job import DashboardJob
from src.models.public_audit_job import PublicAuditJob

router = APIRouter(prefix="/public", tags=["public"])

_DASHBOARD_CACHE_TTL = timedelta(hours=24)


def _clean_domain(raw: str) -> str:
    """Normaliza URL o dominio libre → dominio limpio (sin scheme/www/path)."""
    raw = raw.strip().lower()
    for prefix in ("https://", "http://", "www."):
        if raw.startswith(prefix):
            raw = raw[len(prefix):]
    return raw.split("/")[0]


def _get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


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
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Encola una auditoría pública (sin cuenta). 1 auditoría por IP."""
    url = body.url.strip()
    if not url:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="URL requerida")

    client_ip = _get_client_ip(request)

    # Buscar jobs previos de esta IP
    existing_q = await db.execute(
        select(PublicAuditJob)
        .where(PublicAuditJob.client_ip == client_ip)
        .order_by(PublicAuditJob.created_at.desc())
        .limit(1)
    )
    existing = existing_q.scalar_one_or_none()

    if existing is not None:
        if existing.status == "completed":
            # Ya usó su auditoría de prueba
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "code": "trial_used",
                    "message": "Ya usaste tu auditoría de prueba gratuita. Crea una cuenta para auditar más sitios.",
                    "register_url": "/register",
                },
            )
        # Job en pending/running — devolver el mismo job_id (deduplicación)
        return PublicAuditStarted(job_id=existing.id, status=existing.status)

    job = PublicAuditJob(url=url, client_ip=client_ip)
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


# ── Dashboard audit ────────────────────────────────────────────────────────────

class DashboardAuditRequest(BaseModel):
    domain: str
    keyword: str | None = None


class DashboardAuditStarted(BaseModel):
    job_id: uuid.UUID
    status: str
    cached: bool = False


class DashboardAuditStatusResponse(BaseModel):
    job_id: uuid.UUID
    status: str
    result: dict | None
    error: str | None

    model_config = {"from_attributes": True}


@router.post(
    "/dashboard-audit",
    response_model=DashboardAuditStarted,
    status_code=status.HTTP_202_ACCEPTED,
)
async def trigger_dashboard_audit(
    body: DashboardAuditRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Encola una auditoría completa DataForSEO (OnPage + SERP + Labs + Keyword Data).
    Dedup 24h por dominio: si ya existe un job completado reciente, lo devuelve directamente.
    """
    domain = _clean_domain(body.domain)
    if not domain:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Dominio requerido",
        )
    keyword = body.keyword or domain.split(".")[0]

    cutoff = datetime.now(timezone.utc) - _DASHBOARD_CACHE_TTL

    # Job completado reciente → cache hit
    cached_q = await db.execute(
        select(DashboardJob)
        .where(DashboardJob.domain == domain)
        .where(DashboardJob.status == "completed")
        .where(DashboardJob.completed_at >= cutoff)
        .order_by(DashboardJob.completed_at.desc())
        .limit(1)
    )
    cached = cached_q.scalar_one_or_none()
    if cached:
        return DashboardAuditStarted(job_id=cached.id, status="completed", cached=True)

    # Job en curso → dedup
    running_q = await db.execute(
        select(DashboardJob)
        .where(DashboardJob.domain == domain)
        .where(DashboardJob.status.in_(["pending", "running"]))
        .order_by(DashboardJob.created_at.desc())
        .limit(1)
    )
    running = running_q.scalar_one_or_none()
    if running:
        return DashboardAuditStarted(job_id=running.id, status=running.status, cached=False)

    # Job nuevo
    job = DashboardJob(domain=domain, keyword=keyword)
    db.add(job)
    await db.commit()
    await db.refresh(job)

    from src.tasks.dashboard_audit import run_dashboard_audit
    run_dashboard_audit.delay(str(job.id), domain, keyword)  # type: ignore[attr-defined]

    return DashboardAuditStarted(job_id=job.id, status=job.status, cached=False)


@router.get("/dashboard-audit/{job_id}", response_model=DashboardAuditStatusResponse)
async def get_dashboard_audit_status(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Polling del estado del dashboard job."""
    result = await db.execute(
        select(DashboardJob).where(DashboardJob.id == job_id)
    )
    job = result.scalar_one_or_none()
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job no encontrado")

    return DashboardAuditStatusResponse(
        job_id=job.id,
        status=job.status,
        result=job.result,
        error=job.error,
    )


# ── Business Profile ───────────────────────────────────────────────────────────

class BusinessProfileRequest(BaseModel):
    keyword: str
    location_code: int = 2170


@router.post("/business-profile", status_code=200)
async def get_business_profile(body: BusinessProfileRequest):
    """
    Trae el perfil de Google Business de un negocio.
    keyword puede ser nombre libre ("Restaurante Mario Bogotá") o CID ("cid:123456789").
    """
    from src.services.dataforseo import get_my_business_info
    try:
        data = get_my_business_info(body.keyword, location_code=body.location_code)
        return data
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ── Discover Prospects ─────────────────────────────────────────────────────────

class DiscoverRequest(BaseModel):
    categories: list[str] | None = None
    description: str | None = None
    title: str | None = None
    location_country: str | None = None
    location_coordinate: str | None = None  # "lat,lng,radius_km"
    limit: int = 50


@router.post("/discover-prospects", status_code=200)
async def discover_prospects(body: DiscoverRequest):
    """
    Descubre prospectos en la base de Business Listings de DataForSEO.
    Retorna hasta `limit` negocios ordenados por opportunity_score desc.
    """
    from src.services.dataforseo import get_business_listings_search
    try:
        data = get_business_listings_search(
            categories=body.categories,
            description=body.description,
            title=body.title,
            location_country=body.location_country,
            location_coordinate=body.location_coordinate,
            limit=body.limit,
        )
        return data
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
