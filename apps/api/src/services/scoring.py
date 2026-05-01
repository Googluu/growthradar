"""
Health score module — calcula el puntaje de salud digital compuesto (0-100).

Pesos base por dimensión (suman 100):
  seo_score:         35  — mayor impacto en visibilidad para pymes LATAM
  performance_score: 25  — experiencia del usuario y ranking Google
  social_score:      25  — presencia y engagement en redes sociales
  reputation_score:  15  — reseñas y reputación online

Cuando una dimensión no tiene datos (None), su peso se redistribuye
proporcionalmente entre las dimensiones disponibles para que el
health_score siempre refleje el 100% de la información existente.

Las funciones `derive_*` mapean las respuestas crudas de los servicios
(DataForSEO, CrUX, Business Data) a las dimensiones de score. Esto
mantiene la lógica de scoring desacoplada de los providers.
"""

from dataclasses import dataclass

_BASE_WEIGHTS: dict[str, int] = {
    "seo_score":         35,
    "performance_score": 25,
    "social_score":      25,
    "reputation_score":  15,
}


@dataclass
class HealthScoreResult:
    health_score: int
    breakdown: dict[str, dict]   # por dimensión: score, weight_used, weight_base
    available_dimensions: int    # cuántas dimensiones tienen datos
    total_dimensions: int        # total de dimensiones posibles


# ═══════════════════════════════════════════════════════════════════════════════
# COMPOSICIÓN — health_score
# ═══════════════════════════════════════════════════════════════════════════════

def calculate_health_score(scores: dict[str, int | None]) -> HealthScoreResult:
    """
    Calcula el health_score ponderado a partir de los sub-scores.

    Args:
        scores: dict con claves seo_score, performance_score, social_score,
                reputation_score. Los valores None se excluyen del cálculo
                y su peso se redistribuye al resto.
    """
    available = {
        dim: score
        for dim, score in scores.items()
        if dim in _BASE_WEIGHTS and score is not None
    }

    if not available:
        return HealthScoreResult(
            health_score=0,
            breakdown={},
            available_dimensions=0,
            total_dimensions=len(_BASE_WEIGHTS),
        )

    total_base_weight = sum(_BASE_WEIGHTS[dim] for dim in available)

    effective_weights = {
        dim: _BASE_WEIGHTS[dim] / total_base_weight
        for dim in available
    }

    health_score = round(
        sum(score * effective_weights[dim] for dim, score in available.items())
    )

    breakdown = {
        dim: {
            "score": score,
            "weight_base": _BASE_WEIGHTS[dim],
            "weight_used": round(effective_weights[dim] * 100, 1),
        }
        for dim, score in available.items()
    }

    for dim in _BASE_WEIGHTS:
        if dim not in available:
            breakdown[dim] = {
                "score": None,
                "weight_base": _BASE_WEIGHTS[dim],
                "weight_used": 0,
            }

    return HealthScoreResult(
        health_score=health_score,
        breakdown=breakdown,
        available_dimensions=len(available),
        total_dimensions=len(_BASE_WEIGHTS),
    )


# ═══════════════════════════════════════════════════════════════════════════════
# DERIVACIÓN — Mapping providers → sub-scores
# ═══════════════════════════════════════════════════════════════════════════════

def derive_subscores(
    *,
    seo_score: int | None = None,
    crux_data: dict | None = None,
    onpage_data: dict | None = None,
    business_data: dict | None = None,
    social_data: dict | None = None,
) -> dict[str, int | None]:
    """
    Mapea las respuestas crudas de los servicios a las 4 dimensiones del
    health_score. Devuelve un dict listo para pasar a calculate_health_score().

    Args:
        seo_score: precomputado por dataforseo.calculate_seo_score(onpage).
            Pasarlo desde fuera evita imports circulares.
        crux_data: respuesta de crux.query_crux. Si no hay, se usa fallback.
        onpage_data: respuesta de dataforseo.get_onpage_data — se usa solo
            como fallback de performance cuando CrUX no tiene datos.
        business_data: respuesta de Business Data API (futuro). Hoy None.
        social_data: respuesta de APIs sociales (futuro). Hoy None.
    """
    return {
        "seo_score":         seo_score,
        "performance_score": derive_performance_score(crux_data, onpage_data),
        "social_score":      derive_social_score(social_data),
        "reputation_score":  derive_reputation_score(business_data),
    }


def derive_performance_score(
    crux_data: dict | None,
    onpage_data: dict | None = None,
) -> int | None:
    """
    Performance score:
      1. Preferimos CrUX (datos reales de campo, p75 de usuarios reales).
      2. Si no hay CrUX (sitio sin tráfico suficiente en Chrome), usamos
         OnPage timing como proxy (datos sintéticos del crawler de DataForSEO).
      3. Si no hay ninguno → None y el peso se redistribuye.
    """
    if crux_data and isinstance(crux_data, dict) and "error" not in crux_data:
        score = crux_data.get("performance_score")
        if score is not None:
            return score

    # Fallback: TTI sintético del crawler. Heurística simple alineada con
    # los thresholds aproximados de Lighthouse para Time to Interactive.
    if onpage_data and isinstance(onpage_data, dict) and "error" not in onpage_data:
        perf = onpage_data.get("performance") or {}
        tti = perf.get("time_to_interactive_ms")
        if tti is None:
            return None
        if tti < 3800:
            return 90
        if tti < 7300:
            return 60
        return 30

    return None


def derive_reputation_score(business_data: dict | None) -> int | None:
    """
    Reputation score basado en datos de Google My Business
    (Business Data API → my_business_info).

    Espera la estructura normalizada por dataforseo._normalize_business_item:
        {
            "found": bool,
            "reviews": {"rating": {"value", "votes_count"}, ...},
            "status": {"is_claimed", "operating_status"}
        }

    Lógica:
      - Score base = (rating / 5) * 100
      - Penalización × 0.7 si tiene < 10 reviews (poca confianza)
      - Penalización × 0.85 si tiene < 30 reviews
      - Penalización × 0.85 si listing no reclamado (owner no responde)
      - Penalización × 0.3 si negocio cerrado permanentemente
      - Penalización × 0.6 si negocio cerrado temporalmente

    Returns:
        int 0-100, o None si no hay datos suficientes para calcular.
    """
    if not business_data or not isinstance(business_data, dict):
        return None
    if "error" in business_data:
        return None
    if business_data.get("found") is False:
        return None

    # Soporte para shape legacy (rating directo) y shape nuevo (anidado)
    reviews = business_data.get("reviews") or {}
    rating_obj = reviews.get("rating") or business_data.get("rating") or {}
    rating = rating_obj.get("value")
    review_count = rating_obj.get("votes_count", 0) or 0

    if rating is None:
        return None

    base = (rating / 5) * 100

    # Penalización por baja confianza estadística
    if review_count < 10:
        base *= 0.7
    elif review_count < 30:
        base *= 0.85

    status = business_data.get("status") or {}

    # Listing no reclamado: el dueño no puede responder reviews ni
    # actualizar info — señal fuerte de baja madurez digital
    if status.get("is_claimed") is False:
        base *= 0.85

    # Estado operacional: cerrado permanente es fatal, temporal es serio
    operating_status = status.get("operating_status")
    if operating_status == "closed_permanently":
        base *= 0.3
    elif operating_status == "closed_temporarily":
        base *= 0.6

    return min(100, max(0, int(round(base))))


def derive_social_score(social_data: dict | None) -> int | None:
    """
    Social score — pendiente de integración en Phase 2.

    Cuando se integre, debería considerar:
      - Cantidad de plataformas activas (IG, FB, TikTok, LinkedIn, X)
      - Frecuencia de publicación últimos 30 días
      - Engagement rate promedio (likes+comentarios / followers)
      - Crecimiento de followers mes a mes
    """
    if not social_data:
        return None
    return None