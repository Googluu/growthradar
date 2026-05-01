"""
Audit engine — orquestador del bucle "Evalúa → Descubre → Alcanza".

Combina los tres skipes en una auditoría completa:
  - DataForSEO  → SEO técnico, on-page, autoridad, SERPs, keywords, GMB
  - CrUX        → performance real (Core Web Vitals + tendencia 6 meses)
  - Claude API  → recomendaciones priorizadas y accionables

Síncrono por diseño: invocable desde un Celery worker. Latencia esperada para
una auditoría completa con 3 keywords + GMB: ~70-90s.

Funciones principales:
  - run_full_audit(...)     → pilar EVALÚA (auditoría del cliente)
  - discover_prospects(...) → pilar DESCUBRE (encontrar prospectos)

Costo aproximado:
  - Auditoría sin Business Data:   ~$0.05 USD
  - Auditoría con my_business_info: ~$0.06 USD
  - Auditoría con my_business_info + reviews: ~$0.07 USD
  - Discovery de 100 prospectos:    ~$0.05 USD
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


# ═══════════════════════════════════════════════════════════════════════════════
# EVALÚA — Auditoría completa del cliente
# ═══════════════════════════════════════════════════════════════════════════════

def run_full_audit(
    company_name: str,
    company_domain: str,
    target_keywords: list[str] | None = None,
    google_business_keyword: str | None = None,
    fetch_reviews: bool = False,
    location_code: int = 2170,   # Colombia
    language_code: str = "es",
) -> dict:
    """
    Ejecuta la auditoría completa para un cliente.

    Args:
        company_name: nombre comercial visible.
        company_domain: dominio sin protocolo (ej. "miempresa.com.co").
        target_keywords: keywords a trackear en SERP (max 5 internamente).
        google_business_keyword: identificador GMB. Puede ser:
            - "cid:194604053573767737" (más preciso)
            - texto libre tipo "Pizzeria Mario Bogotá"
            Si es None, reputation_score quedará en None y su peso se
            redistribuirá entre las dimensiones disponibles.
        fetch_reviews: si True, también trae las reseñas Google (cuesta
            +$0.0125 pero mejora dramáticamente las recomendaciones de Claude).
        location_code: código DataForSEO (2170=CO, 2484=MX, 2840=US).
        language_code: idioma para SERPs y respuestas.

    Returns:
        dict completo de auditoría — listo para persistir o para responder
        del endpoint API. Estructura:
            {
                company_name, company_domain, started_at, completed_at,
                duration_seconds, total_cost_usd,
                scores: {health_score, breakdown, available_dimensions},
                data: {
                    onpage, domain_rank, crux, crux_history, serps,
                    business_info, reviews
                },
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

    # Business Data — solo si el cliente nos dio un identificador GMB
    if google_business_keyword:
        audit["data"]["business_info"] = _safe_call(
            "business_info",
            lambda: dataforseo.get_my_business_info(
                keyword=google_business_keyword,
                location_code=location_code,
                language_code=language_code,
            ),
        )
        if fetch_reviews:
            audit["data"]["reviews"] = _safe_call(
                "reviews",
                lambda: dataforseo.get_google_reviews(
                    keyword=google_business_keyword,
                    location_code=location_code,
                    language_code=language_code,
                    depth=20,
                ),
            )
        else:
            audit["data"]["reviews"] = None
    else:
        audit["data"]["business_info"] = None
        audit["data"]["reviews"] = None

    # ─── 2. SCORING — Sub-scores → health_score ───────────────────────────────
    onpage_data = audit["data"]["onpage"]
    crux_data = audit["data"]["crux"]
    business_data = audit["data"]["business_info"]

    seo_score = _compute_seo_score(onpage_data)
    sub_scores = derive_subscores(
        seo_score=seo_score,
        crux_data=crux_data,
        onpage_data=onpage_data,
        business_data=business_data,
        social_data=None,   # TODO Phase 2+: integrar APIs sociales
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
                "business": _strip_business_for_prompt(business_data),
                "reviews": _strip_reviews_for_prompt(audit["data"]["reviews"]),
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
# DESCUBRE — Búsqueda de prospectos calificados
# ═══════════════════════════════════════════════════════════════════════════════

def discover_prospects(
    *,
    categories: list[str] | None = None,
    description: str | None = None,
    location_coordinate: str | None = None,    # "lat,lng,radius_km"
    location_country: str | None = None,
    only_unclaimed: bool = False,
    min_rating: float | None = 3.0,
    max_rating: float | None = 4.7,
    min_reviews: int = 5,
    limit: int = 100,
) -> dict:
    """
    Pilar 'Descubre' — encuentra negocios calificados como prospectos para
    Growth Radar.

    Filtros razonados:
      - min_rating 3.0 / max_rating 4.7: el sweet spot de "negocio activo
        que está dispuesto a invertir en mejorar". <3.0 es probablemente
        zombie; >4.7 ya no necesita Growth Radar.
      - min_reviews 5: excluye negocios sin tracción.
      - only_unclaimed: TRUE filtra solo listings sin reclamar (alta
        oportunidad de outreach: "tu listing está abandonado").

    Returns:
        dict con prospectos rankeados por opportunity_score desc, agregaciones
        y metadata. Listo para alimentar el dashboard de Descubre.
    """
    started_at = datetime.now(timezone.utc)

    # Construimos filtros para el endpoint de DataForSEO
    df_filters = []
    if min_rating is not None:
        df_filters.append(["rating.value", ">=", min_rating])
    if max_rating is not None:
        df_filters.append(["rating.value", "<=", max_rating])
    if min_reviews:
        df_filters.append(["rating.votes_count", ">=", min_reviews])

    is_claimed_filter = False if only_unclaimed else None

    listings = _safe_call(
        "business_listings_search",
        lambda: dataforseo.get_business_listings_search(
            categories=categories,
            description=description,
            is_claimed=is_claimed_filter,
            location_coordinate=location_coordinate,
            location_country=location_country,
            limit=limit,
            order_by=["rating.value,desc"],
            filters=df_filters if df_filters else None,
        ),
    )

    completed_at = datetime.now(timezone.utc)

    return {
        "started_at": started_at.isoformat(),
        "completed_at": completed_at.isoformat(),
        "duration_seconds": round((completed_at - started_at).total_seconds(), 2),
        "filters_applied": {
            "categories": categories,
            "description": description,
            "location_coordinate": location_coordinate,
            "location_country": location_country,
            "only_unclaimed": only_unclaimed,
            "min_rating": min_rating,
            "max_rating": max_rating,
            "min_reviews": min_reviews,
            "limit": limit,
        },
        "result": listings,
        "total_cost_usd": (
            listings.get("cost") if isinstance(listings, dict) else 0
        ) or 0,
    }


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
    """Reduce onpage data a lo esencial para el prompt de Claude."""
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


def _strip_business_for_prompt(business_data: dict | None) -> dict | None:
    """
    Compacta business_info para Claude. Mantenemos las señales que más
    impactan recomendaciones: claim status, completeness, place_topics
    (qué dicen los clientes), rating, gaps.
    """
    if not business_data or not isinstance(business_data, dict):
        return None
    if "error" in business_data or business_data.get("found") is False:
        return business_data

    return {
        "name": business_data.get("name"),
        "description": business_data.get("description"),
        "category": business_data.get("category"),
        "contact": business_data.get("contact"),
        "location": {
            "city": (business_data.get("location") or {}).get("city"),
            "country_code": (business_data.get("location") or {}).get("country_code"),
        },
        "media": business_data.get("media"),
        "status": business_data.get("status"),
        "reviews": {
            "rating": (business_data.get("reviews") or {}).get("rating"),
            "rating_distribution_pct": (
                (business_data.get("reviews") or {}).get("rating_distribution_pct")
            ),
            "place_topics_top10": (
                (business_data.get("reviews") or {}).get("place_topics") or []
            )[:10],
        },
        "profile_completeness": business_data.get("profile_completeness"),
    }


def _strip_reviews_for_prompt(reviews_data: dict | None) -> dict | None:
    """
    Compacta reviews para Claude — solo le pasamos las negativas y las más
    recientes con texto. Es donde está la señal de mejora.
    """
    if not reviews_data or not isinstance(reviews_data, dict):
        return None
    if "error" in reviews_data:
        return reviews_data

    all_reviews = reviews_data.get("reviews") or []

    # Reviews negativas con texto (donde están las quejas accionables)
    negative_with_text = [
        {
            "rating": r.get("rating"),
            "text": (r.get("review_text") or "")[:500],
            "owner_responded": r.get("owner_responded"),
            "datetime": r.get("datetime_iso") or r.get("timestamp"),
        }
        for r in all_reviews
        if r.get("rating") is not None and r.get("rating") <= 3 and r.get("review_text")
    ][:8]

    # 5 reviews más recientes con texto (cualquier rating)
    recent = [
        {
            "rating": r.get("rating"),
            "text": (r.get("review_text") or "")[:300],
            "owner_responded": r.get("owner_responded"),
            "datetime": r.get("datetime_iso") or r.get("timestamp"),
        }
        for r in all_reviews if r.get("review_text")
    ][:5]

    return {
        "avg_rating_in_sample": reviews_data.get("avg_rating_in_sample"),
        "owner_response_rate": reviews_data.get("owner_response_rate"),
        "negative_reviews_count": reviews_data.get("negative_reviews_count"),
        "negative_reviews_with_text": negative_with_text,
        "recent_reviews": recent,
    }


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