"""
Audit engine — orquestador del bucle "Evalúa → Descubre → Alcanza".

Combina los tres skipes en una auditoría completa:
  - DataForSEO  → SEO técnico, on-page, autoridad de dominio, SERPs, keywords
  - CrUX        → performance real (Core Web Vitals + tendencia 6 meses)
  - Claude API  → recomendaciones priorizadas y accionables

Síncrono por diseño: invocable desde un Celery worker. Latencia esperada para
una auditoría completa con 3 keywords de target: ~60-90s.

Costo aproximado por auditoría completa (sin Business Data): ~$0.05 USD.
Con Business Data + 5 SERPs: ~$0.15 USD.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from src.services import crux, dataforseo, recommendations
from src.services.scoring import (
    HealthScoreResult,
    calculate_health_score,
    derive_subscores,
)

logger = logging.getLogger(__name__)


def run_full_audit(
    company_name: str,
    company_domain: str,
    target_keywords: list[str] | None = None,
    location_code: int = 2170,   # Colombia
    language_code: str = "es",
) -> dict:
    """
    Ejecuta la auditoría completa para un cliente.

    Args:
        company_name: nombre comercial visible.
        company_domain: dominio sin protocolo (ej. "miempresa.com.co").
        target_keywords: keywords a trackear en SERP. Limitado a 5 internamente
            para controlar costo (~$0.002 USD por keyword).
        location_code: código de ubicación DataForSEO (2170=CO, 2484=MX, 2840=US).
        language_code: idioma para SERPs.

    Returns:
        dict completo de auditoría — listo para persistir en Firestore o en
        tu modelo Audit. Estructura:
            {
                company_name, company_domain, started_at, completed_at,
                duration_seconds, total_cost_usd,
                scores: {health_score, breakdown, available_dimensions},
                data: {onpage, domain_rank, crux, crux_history, serps},
                recommendations: {executive_summary, top_recommendations, ...}
            }
    """
    started_at = datetime.now(timezone.utc)
    origin = _to_origin(company_domain)

    audit: dict = {
        "company_name": company_name,
        "company_domain": company_domain,
        "started_at": started_at.isoformat(),
        "data": {},
        "scores": None,
        "recommendations": None,
    }

    # ─── 1. EVALÚA — Recolección de datos crudos ──────────────────────────────
    audit["data"]["onpage"] = _safe_call(
        "onpage",
        lambda: dataforseo.get_onpage_data(origin),
    )

    audit["data"]["domain_rank"] = _safe_call(
        "domain_rank",
        lambda: dataforseo.get_domain_rank(company_domain),
    )

    audit["data"]["crux"] = _safe_crux(
        lambda: crux.query_crux(origin),
        label="crux_current",
    )

    audit["data"]["crux_history"] = _safe_crux(
        lambda: crux.query_crux_history(origin),
        label="crux_history",
    )

    audit["data"]["serps"] = _run_serps(
        company_domain,
        target_keywords or [],
        location_code,
        language_code,
    )

    # ─── 2. SCORING — Sub-scores → health_score ───────────────────────────────
    onpage_data = audit["data"]["onpage"]
    crux_data = audit["data"]["crux"]

    seo_score = _compute_seo_score(onpage_data)
    sub_scores = derive_subscores(
        seo_score=seo_score,
        crux_data=crux_data,
        onpage_data=onpage_data,
        business_data=None,   # TODO Phase 2: integrar Business Data API
        social_data=None,     # TODO Phase 2+: integrar APIs sociales
    )

    health: HealthScoreResult = calculate_health_score(sub_scores)
    audit["scores"] = {
        "health_score": health.health_score,
        "breakdown": health.breakdown,
        "available_dimensions": health.available_dimensions,
        "total_dimensions": health.total_dimensions,
    }

    # ─── 3. RECOMENDACIONES — Claude prioriza y explica ───────────────────────
    audit["recommendations"] = _safe_call(
        "recommendations",
        lambda: recommendations.generate_recommendations(
            company_name=company_name,
            company_domain=company_domain,
            audit_data={
                "scores": audit["scores"],
                "onpage": _strip_for_prompt(onpage_data),
                "domain_rank": audit["data"]["domain_rank"],
                "crux": crux_data,
                "serps": _summarize_serps_for_prompt(audit["data"]["serps"]),
            },
        ),
    )

    # ─── Metadata ─────────────────────────────────────────────────────────────
    completed_at = datetime.now(timezone.utc)
    audit["completed_at"] = completed_at.isoformat()
    audit["duration_seconds"] = round((completed_at - started_at).total_seconds(), 2)
    audit["total_cost_usd"] = _sum_costs(audit["data"])

    return audit


# ═══════════════════════════════════════════════════════════════════════════════
# Helpers internos
# ═══════════════════════════════════════════════════════════════════════════════

def _to_origin(domain: str) -> str:
    """Asegura que el dominio tenga schema https:// (CrUX lo requiere)."""
    if domain.startswith(("http://", "https://")):
        return domain.rstrip("/")
    return f"https://{domain.rstrip('/')}"


def _compute_seo_score(onpage_data: dict | None) -> int | None:
    if not onpage_data or not isinstance(onpage_data, dict):
        return None
    if "error" in onpage_data:
        return None
    return dataforseo.calculate_seo_score(onpage_data)


def _safe_call(label: str, fn) -> dict:
    """Ejecuta una función que retorna dict y captura excepciones."""
    try:
        return fn()
    except Exception as exc:
        logger.exception("Audit step '%s' failed", label)
        return {"error": "request_failed", "detail": str(exc)}


def _safe_crux(fn, label: str) -> dict | None:
    """
    Variante específica para CrUX:
      - CruxNoDataError → None (no es un error real, solo significa que no
        hay tráfico suficiente en Chrome para reportar p75).
      - Cualquier otra excepción → dict con error.
    """
    try:
        return fn()
    except crux.CruxNoDataError:
        logger.info("No %s data available", label)
        return None
    except Exception as exc:
        logger.exception("CrUX step '%s' failed", label)
        return {"error": "request_failed", "detail": str(exc)}


def _run_serps(
    company_domain: str,
    keywords: list[str],
    location_code: int,
    language_code: str,
) -> list[dict]:
    """Ejecuta hasta 5 SERPs en serie. Cada error se aísla por keyword."""
    serps = []
    for kw in keywords[:5]:
        result = _safe_call(
            f"serp:{kw}",
            lambda kw=kw: dataforseo.get_serp_data(
                keyword=kw,
                location_code=location_code,
                language_code=language_code,
                target_domain=company_domain,
            ),
        )
        if "error" in result:
            result["keyword"] = kw
        serps.append(result)
    return serps


def _strip_for_prompt(onpage_data: dict | None) -> dict | None:
    """
    Reduce el onpage data a lo esencial para el prompt de Claude.
    Eliminamos campos verbosos que solo sirven al frontend (raw_checks,
    headings completos, social_media_tags) para no quemar tokens.
    """
    if not onpage_data or "error" in onpage_data:
        return onpage_data

    keep = {
        "url", "status_code", "title", "title_length", "description",
        "description_length", "h1_text", "canonical", "is_https",
        "internal_links_count", "external_links_count", "images_count",
        "images_without_alt", "page_size_bytes", "onpage_score_dataforseo",
        "health", "issues", "passing_checks", "duplicate_title",
        "duplicate_description", "performance", "headings_count", "content",
        "resources_breakdown",
    }
    return {k: v for k, v in onpage_data.items() if k in keep}


def _summarize_serps_for_prompt(serps: list[dict]) -> list[dict]:
    """Compactación de SERPs para Claude — 100+ items por SERP es ruido."""
    summary = []
    for s in serps:
        if not isinstance(s, dict) or "error" in s:
            continue

        target = s.get("target_visibility") or {}
        client_domain_norm = (target.get("domain") or "").replace("www.", "").lower()

        ai_overview = s.get("ai_overview") or {}
        ai_refs = ai_overview.get("references") or []
        ai_mentions_client = bool(client_domain_norm) and any(
            (ref.get("domain") or "").replace("www.", "").lower() == client_domain_norm
            for ref in ai_refs
        )

        summary.append({
            "keyword": s.get("keyword"),
            "average_position_serp": s.get("average_position"),
            "client_position": target.get("position"),
            "client_in_top_10": target.get("in_top_10"),
            "client_is_featured_snippet": target.get("is_featured_snippet"),
            "top_3_competitors": s.get("top_3_domains", []),
            "has_ai_overview": s.get("has_ai_overview"),
            "ai_overview_mentions_client": ai_mentions_client,
            "serp_features": s.get("serp_features", []),
        })
    return summary


def _sum_costs(data: dict) -> float:
    """Suma todos los `cost` reportados por DataForSEO en el dict de data."""
    total = 0.0
    for value in data.values():
        if isinstance(value, dict) and value.get("cost") is not None:
            total += value["cost"]
        elif isinstance(value, list):
            for item in value:
                if isinstance(item, dict) and item.get("cost") is not None:
                    total += item["cost"]
    return round(total, 6)