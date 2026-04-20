"""
Celery task: run_audit

Ejecuta la auditoría completa de una empresa:
  Fase 1 (esta tarea): CrUX → performance_score
  Fase 2 (próxima):    DataForSEO → seo_score
  Fase 3:              Claude API → recomendaciones

El task recibe el job_id (str) y:
  1. Marca el job como "running"
  2. Consulta CrUX para obtener performance_score real
  3. Guarda el resultado y marca como "completed" (o "failed")
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from src.config import settings
from src.worker import celery_app

# Celery workers son síncronos — usamos el engine síncrono (psycopg2)
_sync_db_url = settings.database_url.replace(
    "postgresql+asyncpg://", "postgresql+psycopg2://"
)
_engine = create_engine(_sync_db_url, pool_pre_ping=True)


@celery_app.task(name="audit.run_audit", bind=True, max_retries=2)
def run_audit(self: "run_audit", job_id: str) -> dict:  # type: ignore[type-arg]
    from src.models.audit_job import AuditJob
    from src.models.company import Company
    from src.services.crux import CruxNoDataError, query_crux
    from src.services.dataforseo import calculate_seo_score, get_domain_rank, get_onpage_data

    job_uuid = uuid.UUID(job_id)

    with Session(_engine) as db:
        job = db.get(AuditJob, job_uuid)
        if job is None:
            return {"error": "job_not_found"}

        # ── Fase 1: marcar como running ───────────────────────────────────
        job.status = "running"
        job.started_at = datetime.now(timezone.utc)
        db.commit()

        try:
            company = db.get(Company, job.company_id)
            domain = company.domain if company else ""  # type: ignore[union-attr]
            url = f"https://{domain}"

            # ── Fase 2: CrUX → performance_score ─────────────────────────
            crux_data: dict | None = None
            performance_score: int | None = None
            crux_note: str | None = None

            try:
                crux_data = query_crux(url)
                performance_score = crux_data["performance_score"]
            except CruxNoDataError:
                crux_note = "no_crux_data — fallback pendiente"
            except Exception as crux_exc:
                crux_note = f"crux_error: {crux_exc}"

            # ── Fase 3: DataForSEO → seo_score ───────────────────────────
            onpage_data: dict | None = None
            domain_rank_data: dict | None = None
            seo_score: int | None = None
            seo_note: str | None = None

            try:
                onpage_data = get_onpage_data(url)
                domain_rank_data = get_domain_rank(domain)
                seo_score = calculate_seo_score(onpage_data)
            except Exception as seo_exc:
                seo_note = f"dataforseo_error: {seo_exc}"

            # ── Fase 4: construir resultado ───────────────────────────────
            result: dict = {
                "scores": {
                    "performance_score": performance_score,
                    "seo_score": seo_score,
                    "social_score": None,    # Playwright — pendiente
                    "reputation_score": None,
                },
                "crux": crux_data,
                "seo": {
                    "onpage": onpage_data,
                    "domain_rank": domain_rank_data,
                },
            }
            if crux_note:
                result["crux_note"] = crux_note
            if seo_note:
                result["seo_note"] = seo_note

            available = [s for s in result["scores"].values() if s is not None]
            result["health_score"] = round(sum(available) / len(available)) if available else None

            job.status = "completed"
            job.result = result
            job.completed_at = datetime.now(timezone.utc)
            db.commit()

            return result

        except Exception as exc:
            job.status = "failed"
            job.error = str(exc)
            job.completed_at = datetime.now(timezone.utc)
            db.commit()
            raise
