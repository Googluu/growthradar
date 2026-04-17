"""
Celery task: run_audit

Placeholder que simula el flujo completo de una auditoría.
En tareas siguientes se reemplaza el mock por llamadas reales a:
  - CrUX API      → performance_score
  - DataForSEO    → seo_score
  - Playwright    → social_score (próximamente)
  - Claude API    → recomendaciones

El task recibe el job_id (str) y se encarga de:
  1. Marcar el job como "running"
  2. Ejecutar la auditoría (ahora: sleep 5s + resultado mock)
  3. Guardar el resultado y marcar como "completed" (o "failed" si hay error)
"""

import time
import uuid
from datetime import datetime, timezone

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from src.config import settings
from src.worker import celery_app

# Celery workers son síncronos — usamos el engine síncrono (psycopg2)
# La URL async usa asyncpg; para el worker reemplazamos el driver
_sync_db_url = settings.database_url.replace(
    "postgresql+asyncpg://", "postgresql+psycopg2://"
)
_engine = create_engine(_sync_db_url, pool_pre_ping=True)


@celery_app.task(name="audit.run_audit", bind=True, max_retries=2)
def run_audit(self: "run_audit", job_id: str) -> dict:  # type: ignore[type-arg]
    """
    Ejecuta una auditoría completa para el job dado.
    bind=True permite acceder a self.retry() si algo falla.
    """
    from src.models.audit_job import AuditJob  # import local para evitar circular

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
            # ── Fase 2: auditoría (placeholder) ───────────────────────────
            # TODO: reemplazar con CrUX + DataForSEO + Claude en tareas siguientes
            time.sleep(5)

            mock_result = {
                "health_score": 47,
                "scores": {
                    "performance_score": 72,
                    "seo_score": 31,
                    "social_score": 18,
                    "reputation_score": 55,
                },
                "note": "Resultado mock — integración real pendiente",
            }

            # ── Fase 3: guardar resultado ─────────────────────────────────
            job.status = "completed"
            job.result = mock_result
            job.completed_at = datetime.now(timezone.utc)
            db.commit()

            return mock_result

        except Exception as exc:
            job.status = "failed"
            job.error = str(exc)
            job.completed_at = datetime.now(timezone.utc)
            db.commit()
            raise
