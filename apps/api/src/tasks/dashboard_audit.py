"""
Celery task: run_dashboard_audit

Ejecuta las 4 secciones DataForSEO para un dominio:
  Fase 1 (paralela)  — OnPage · SERP · Labs
  Fase 2 (secuencial) — Keyword Data con las keywords top de Labs
"""

import uuid
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from src.config import settings
from src.worker import celery_app

_sync_db_url = settings.database_url.replace(
    "postgresql+asyncpg://", "postgresql+psycopg2://"
)
_engine = create_engine(_sync_db_url, pool_pre_ping=True)


@celery_app.task(name="dashboard.run_dashboard_audit", bind=True, max_retries=1)
def run_dashboard_audit(self, job_id: str, domain: str, keyword: str) -> dict:  # type: ignore[type-arg]
    from src.models.dashboard_job import DashboardJob
    from src.services.dataforseo import (
        get_onpage_data,
        get_related_keywords,
        get_search_volume,
        get_serp_data,
    )

    job_uuid = uuid.UUID(job_id)
    origin_url = f"https://{domain}"

    with Session(_engine) as db:
        job = db.get(DashboardJob, job_uuid)
        if job is None:
            return {"error": "job_not_found"}

        job.status = "running"
        job.started_at = datetime.now(timezone.utc)
        db.commit()

        try:
            sections: dict = {}
            total_cost = 0.0
            section_errors: list[str] = []

            # ── Fase 1: OnPage + SERP + Labs en paralelo ──────────────────
            def _onpage() -> tuple[str, dict]:
                try:
                    data = get_onpage_data(origin_url)
                    # status 40501 = "Domain Not Found" → reintenta con www (timeout reducido)
                    # No se reintenta en timeout/network errors para no duplicar la espera
                    if data.get("status_code") == 40501:
                        try:
                            data = get_onpage_data(f"https://www.{domain}", timeout=12.0)
                        except Exception as www_exc:
                            data = {
                                "error": "unreachable",
                                "detail": str(www_exc),
                                "urls_tried": [origin_url, f"https://www.{domain}"],
                            }
                except Exception as exc:
                    data = {"error": "timeout", "detail": str(exc)}
                return "onpage", data

            def _serp() -> tuple[str, dict]:
                return "serp", get_serp_data(keyword, target_domain=domain)

            def _labs() -> tuple[str, dict]:
                return "labs", get_related_keywords(keyword)

            with ThreadPoolExecutor(max_workers=3) as pool:
                futures = [pool.submit(fn) for fn in (_onpage, _serp, _labs)]
                for future in as_completed(futures):
                    try:
                        name, data = future.result()
                        sections[name] = data
                        total_cost += float(data.get("cost") or 0)
                    except Exception as exc:
                        section_errors.append(f"phase1: {exc}")

            # ── Fase 2: Keyword Data con keywords de Labs ──────────────────
            labs_keywords = [
                kw["keyword"]
                for kw in sections.get("labs", {}).get("keywords", [])[:20]
                if kw.get("keyword")
            ]
            if keyword not in labs_keywords:
                labs_keywords.insert(0, keyword)

            try:
                kw_data = get_search_volume(
                    labs_keywords[:20],
                    location_code=2170,   # Colombia
                    language_code="es",
                )
                sections["keyword_data"] = kw_data
                total_cost += float(kw_data.get("cost") or 0)
            except Exception as exc:
                section_errors.append(f"keyword_data: {exc}")

            result: dict = {
                "domain": domain,
                "keyword": keyword,
                "sections": sections,
                "total_cost_usd": round(total_cost, 6),
            }
            if section_errors:
                result["errors"] = section_errors

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
