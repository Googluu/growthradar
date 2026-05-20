"""
src/routes/public_audits.py

ACTUALIZACIÓN: el endpoint /public/dashboard-audit ahora acepta TODOS los
params del AuditFormData del frontend, no solo {domain, keyword}.

Cambios principales:
  1. DashboardAuditRequest acepta business_name, target_keywords[],
     google_business_keyword, fetch_reviews, location_code, language_code
  2. _build_cache_key() genera hash determinístico de los params para dedup
     correcto (antes solo deduplicaba por dominio → bug si dos requests
     del mismo dominio con keywords distintas)
  3. Pasa todos los params al Celery task run_dashboard_audit

Este archivo SOLO contiene el bloque /dashboard-audit. El resto de los
endpoints (/audit, /business-profile, /discover-prospects) se mantienen
sin cambios — los podés dejar como están.
"""

import hashlib
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.models.dashboard_job import DashboardJob

router = APIRouter(prefix="/public", tags=["public"])

_DASHBOARD_CACHE_TTL = timedelta(hours=24)


def _clean_domain(raw: str) -> str:
    """Normaliza URL o dominio libre → dominio limpio (sin scheme/www/path)."""
    raw = raw.strip().lower()
    for prefix in ("https://", "http://", "www."):
        if raw.startswith(prefix):
            raw = raw[len(prefix):]
    return raw.split("/")[0]


def _build_cache_key(
    domain: str,
    keyword: str,
    business_name: str | None,
    target_keywords: list[str] | None,
    google_business_keyword: str | None,
    fetch_reviews: bool,
    location_code: int,
    language_code: str,
) -> str:
    """
    Cache key determinístico basado en TODOS los params que afectan el resultado.

    Mismos params → mismo cache_key → mismo job (dedup correcto).
    Si cambia cualquier param (ej. otra keyword), genera otro cache_key
    y dispara un job nuevo.
    """
    parts = [
        domain.lower().strip(),
        (business_name or "").lower().strip(),
        keyword.lower().strip(),
        ",".join(sorted((target_keywords or []))).lower(),
        (google_business_keyword or "").lower().strip(),
        str(fetch_reviews),
        str(location_code),
        language_code,
    ]
    raw = "|".join(parts)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


# ── Request / Response schemas ────────────────────────────────────────────────

class DashboardAuditRequest(BaseModel):
    """
    Request body para /public/dashboard-audit.
    Corresponde 1:1 con AuditFormData del frontend.
    """
    domain:                  str
    business_name:           str | None = None
    target_keywords:         list[str] | None = None
    google_business_keyword: str | None = None
    fetch_reviews:           bool = False
    location_code:           int = 2170                # Colombia default
    language_code:           str = "es"

    # Backwards compat: si el frontend manda 'keyword' (legacy) lo aceptamos
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


# ── Endpoints ─────────────────────────────────────────────────────────────────

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
    Encola una auditoría completa DataForSEO + CrUX + Business Data + Claude.

    Dedup: por cache_key (hash de todos los params).
      - Si hay job completado <24h con mismos params → status='completed', cached=True
      - Si hay job en pending/running con mismos params → devuelve el mismo job_id
      - Si no → crea job nuevo
    """
    domain = _clean_domain(body.domain)
    if not domain:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Dominio requerido",
        )

    # keyword principal: primero el del array target_keywords, sino el legacy 'keyword',
    # sino derivamos del dominio
    target_keywords = body.target_keywords or []
    if body.keyword and body.keyword not in target_keywords:
        target_keywords.insert(0, body.keyword)

    primary_keyword = target_keywords[0] if target_keywords else domain.split(".")[0]

    # Cache key con TODOS los params
    cache_key = _build_cache_key(
        domain=domain,
        keyword=primary_keyword,
        business_name=body.business_name,
        target_keywords=target_keywords,
        google_business_keyword=body.google_business_keyword,
        fetch_reviews=body.fetch_reviews,
        location_code=body.location_code,
        language_code=body.language_code,
    )

    cutoff = datetime.now(timezone.utc) - _DASHBOARD_CACHE_TTL

    # ── Cache hit: job completado reciente con mismos params ───────────────
    cached_q = await db.execute(
        select(DashboardJob)
        .where(DashboardJob.cache_key == cache_key)
        .where(DashboardJob.status == "completed")
        .where(DashboardJob.completed_at >= cutoff)
        .order_by(DashboardJob.completed_at.desc())
        .limit(1)
    )
    cached = cached_q.scalar_one_or_none()
    if cached:
        return DashboardAuditStarted(job_id=cached.id, status="completed", cached=True)

    # ── Job en curso con mismos params → dedup ─────────────────────────────
    running_q = await db.execute(
        select(DashboardJob)
        .where(DashboardJob.cache_key == cache_key)
        .where(DashboardJob.status.in_(["pending", "running"]))
        .order_by(DashboardJob.created_at.desc())
        .limit(1)
    )
    running = running_q.scalar_one_or_none()
    if running:
        return DashboardAuditStarted(job_id=running.id, status=running.status, cached=False)

    # ── Job nuevo ──────────────────────────────────────────────────────────
    job = DashboardJob(
        domain=domain,
        keyword=primary_keyword,
        business_name=body.business_name,
        target_keywords=target_keywords or None,
        google_business_keyword=body.google_business_keyword,
        fetch_reviews=body.fetch_reviews,
        location_code=body.location_code,
        language_code=body.language_code,
        cache_key=cache_key,
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)

    # Encolar Celery task con TODOS los params
    from src.tasks.dashboard_audit import run_dashboard_audit
    run_dashboard_audit.delay(str(job.id))  # type: ignore[attr-defined]
    # ↑ El task lee del modelo en DB, no recibe los params por argumento.
    # Esto evita problemas de serialización de Celery con listas opcionales,
    # y permite que el modelo sea la fuente de verdad.

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
