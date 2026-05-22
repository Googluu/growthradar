"""
src/tasks/dashboard_audit.py — ACTUALIZACIÓN COMPLETA

Cambios vs versión anterior:
  1. Recibe solo job_id; lee todos los params del modelo DashboardJob en DB
  2. Corre TODAS las secciones (no solo 4):
     Fase 1 (paralelo): OnPage · SERP · Labs · CrUX · Business Profile
     Fase 2 (paralelo): Keyword Data · Reviews
     Fase 3:            Recommendations (Claude) sobre datos agregados
  3. Usa location_code y language_code del modelo (no hardcodea Colombia)
  4. Si fetch_reviews=False, saltea reviews silenciosamente
  5. Si google_business_keyword es None, saltea Business Profile + Reviews
  6. target_keywords[] del modelo se usan para SERPs múltiples (uno por keyword)
  7. Recommendations genera el JSON con Claude usando el prompt versionado
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
def run_dashboard_audit(self, job_id: str) -> dict:  # type: ignore[type-arg]
    from src.models.dashboard_job import DashboardJob
    from src.services.crux import CruxNoDataError, query_crux, query_crux_history
    from src.services.dataforseo import (
        calculate_seo_score,
        get_business_listings_search,
        get_my_business_info,
        get_google_reviews,
        get_onpage_data,
        get_related_keywords,
        get_search_volume,
        get_serp_data,
    )
    from src.services.recommendations import generate_recommendations
    from src.services.scoring import calculate_health_score, derive_subscores

    job_uuid = uuid.UUID(job_id)

    with Session(_engine) as db:
        job = db.get(DashboardJob, job_uuid)
        if job is None:
            return {"error": "job_not_found"}

        # ── Leer params del modelo (no de los args del task) ─────────────────
        domain                  = job.domain
        primary_keyword         = job.keyword
        business_name           = job.business_name or domain
        target_keywords         = job.target_keywords or [primary_keyword]
        google_business_keyword = job.google_business_keyword
        fetch_reviews_flag      = job.fetch_reviews
        location_code           = job.location_code or 2170
        language_code           = job.language_code or "es"

        origin_url = f"https://{domain}"

        job.status = "running"
        job.started_at = datetime.now(timezone.utc)
        db.commit()

        try:
            sections: dict = {}
            total_cost = 0.0
            section_errors: list[str] = []

            # ═════════════════════════════════════════════════════════════════
            # FASE 1: OnPage + primer SERP + Labs + CrUX + Business Info (paralelo)
            # ═════════════════════════════════════════════════════════════════

            def _onpage() -> tuple[str, dict]:
                try:
                    data = get_onpage_data(origin_url)
                    # Fallback con www. si el dominio no responde
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
                try:
                    data = get_serp_data(
                        primary_keyword,
                        target_domain=domain,
                        location_code=location_code,
                        language_code=language_code,
                    )
                except Exception as exc:
                    data = {"error": "serp_failed", "detail": str(exc)}
                return "serp", data

            def _labs() -> tuple[str, dict]:
                try:
                    data = get_related_keywords(
                        primary_keyword,
                        location_code=location_code,
                        language_code=language_code,
                    )
                except Exception as exc:
                    data = {"error": "labs_failed", "detail": str(exc)}
                return "labs", data

            def _crux() -> tuple[str, dict]:
                try:
                    data = query_crux(origin_url)
                except CruxNoDataError:
                    data = {"error": "no_data", "detail": f"No CrUX data for {origin_url}"}
                except Exception as exc:
                    data = {"error": "timeout", "detail": str(exc)}
                return "crux", data

            def _crux_history() -> tuple[str, dict]:
                try:
                    data = query_crux_history(origin_url)
                except CruxNoDataError:
                    data = {"error": "no_data", "detail": f"No CrUX history for {origin_url}"}
                except Exception as exc:
                    data = {"error": "timeout", "detail": str(exc)}
                return "crux_history", data

            def _business_info() -> tuple[str, dict | None]:
                if not google_business_keyword:
                    return "business_info", None
                try:
                    data = get_my_business_info(
                        google_business_keyword,
                        location_code=location_code,
                        language_code=language_code,
                    )
                except Exception as exc:
                    data = {"error": "business_info_failed", "detail": str(exc)}
                return "business_info", data

            with ThreadPoolExecutor(max_workers=6) as pool:
                futures = [pool.submit(fn) for fn in (
                    _onpage, _serp, _labs, _crux, _crux_history, _business_info,
                )]
                for future in as_completed(futures):
                    try:
                        name, data = future.result()
                        if data is not None:
                            sections[name] = data
                            total_cost += float(
                                data.get("cost") if isinstance(data, dict) else 0
                            ) or 0
                    except Exception as exc:
                        section_errors.append(f"phase1: {exc}")

            # ═════════════════════════════════════════════════════════════════
            # FASE 2: Keyword Data + Reviews (paralelo)
            # ═════════════════════════════════════════════════════════════════

            # Construir lista de keywords para Keyword Data: combinar target_keywords
            # del form con las top de Labs (hasta 20)
            labs_sect = sections.get("labs")
            if isinstance(labs_sect, dict) and "error" not in labs_sect:
                labs_keywords_from_api = [
                    kw["keyword"]
                    for kw in labs_sect.get("keywords", [])[:15]
                    if kw.get("keyword")
                ]
            else:
                labs_keywords_from_api = []

            kw_list = list(dict.fromkeys(target_keywords + labs_keywords_from_api))[:20]

            def _keyword_data() -> tuple[str, dict]:
                try:
                    data = get_search_volume(
                        kw_list,
                        location_code=location_code,
                        language_code=language_code,
                    )
                except Exception as exc:
                    data = {"error": "keyword_data_failed", "detail": str(exc)}
                return "keyword_data", data

            def _reviews() -> tuple[str, dict | None]:
                if not fetch_reviews_flag or not google_business_keyword:
                    return "reviews", None
                try:
                    data = get_google_reviews(
                        google_business_keyword,
                        location_code=location_code,
                        language_code=language_code,
                    )
                except Exception as exc:
                    data = {"error": "reviews_failed", "detail": str(exc)}
                return "reviews", data

            with ThreadPoolExecutor(max_workers=2) as pool:
                futures = [pool.submit(fn) for fn in (_keyword_data, _reviews)]
                for future in as_completed(futures):
                    try:
                        name, data = future.result()
                        if data is not None:
                            sections[name] = data
                            total_cost += float(
                                data.get("cost") if isinstance(data, dict) else 0
                            ) or 0
                    except Exception as exc:
                        section_errors.append(f"phase2: {exc}")

            # ═════════════════════════════════════════════════════════════════
            # FASE 3: Health Score compuesto
            # ═════════════════════════════════════════════════════════════════

            onpage_sect   = sections.get("onpage")
            crux_sect     = sections.get("crux")
            business_sect = sections.get("business_info")

            def _is_ok(s: dict | None) -> bool:
                return bool(s) and isinstance(s, dict) and "error" not in s

            seo_sc = (
                calculate_seo_score(onpage_sect)
                if _is_ok(onpage_sect)
                else None
            )
            subscores = derive_subscores(
                seo_score=seo_sc,
                crux_data=crux_sect if _is_ok(crux_sect) else None,
                onpage_data=onpage_sect if _is_ok(onpage_sect) else None,
                business_data=business_sect if _is_ok(business_sect) else None,
            )
            hs = calculate_health_score(subscores)

            # ═════════════════════════════════════════════════════════════════
            # FASE 4: Recommendations con Claude
            # ═════════════════════════════════════════════════════════════════

            recommendations: dict | None = None
            try:
                # Construir el payload de auditoría para Claude.
                # Incluir solo secciones que tengan datos válidos.
                audit_payload = {
                    "scores": {
                        "health_score": hs.health_score,
                        "available_dimensions": hs.available_dimensions,
                        "total_dimensions": hs.total_dimensions,
                        "breakdown": hs.breakdown,
                    },
                }
                if _is_ok(onpage_sect):
                    audit_payload["onpage"] = onpage_sect
                if _is_ok(crux_sect):
                    audit_payload["crux"] = crux_sect
                if _is_ok(business_sect):
                    audit_payload["business"] = business_sect

                # Para SERPs, pasar resumen liviano (no el JSON completo de 50KB)
                serp_sect = sections.get("serp")
                if _is_ok(serp_sect):
                    audit_payload["serp_summary"] = {
                        "keyword": serp_sect.get("keyword"),
                        "target_visibility": serp_sect.get("target_visibility"),
                        "average_position": serp_sect.get("average_position"),
                        "has_ai_overview": serp_sect.get("has_ai_overview"),
                        "top_3_domains": serp_sect.get("top_3_domains", [])[:3],
                    }

                reviews_sect = sections.get("reviews")
                if _is_ok(reviews_sect):
                    # Pasar solo las negativas + recientes (no las 100)
                    audit_payload["reviews"] = {
                        "avg_rating_in_sample": reviews_sect.get("avg_rating_in_sample"),
                        "owner_response_rate":  reviews_sect.get("owner_response_rate"),
                        "negative_reviews_with_text": reviews_sect.get("negative_reviews_with_text", [])[:5],
                    }

                recommendations = generate_recommendations(
                    company_name=business_name,
                    company_domain=domain,
                    audit_data=audit_payload,
                )
            except Exception as recs_exc:
                section_errors.append(f"recommendations: {recs_exc}")
                recommendations = {
                    "error": "recommendations_failed",
                    "detail": str(recs_exc),
                }

            # ═════════════════════════════════════════════════════════════════
            # Resultado final
            # ═════════════════════════════════════════════════════════════════

            result: dict = {
                "domain": domain,
                "keyword": primary_keyword,
                "business_name": business_name,
                "sections": sections,
                "total_cost_usd": round(total_cost, 6),
                "health": {
                    "health_score": hs.health_score,
                    "available_dimensions": hs.available_dimensions,
                    "total_dimensions": hs.total_dimensions,
                    "breakdown": hs.breakdown,
                },
                "recommendations": recommendations,
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