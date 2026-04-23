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


def calculate_health_score(scores: dict[str, int | None]) -> HealthScoreResult:
    """
    Calcula el health_score ponderado a partir de los sub-scores.

    Args:
        scores: dict con claves seo_score, performance_score, social_score,
                reputation_score. Los valores None se excluyen del cálculo.

    Returns:
        HealthScoreResult con health_score, breakdown y metadatos.
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

    # Suma de pesos base de las dimensiones disponibles
    total_base_weight = sum(_BASE_WEIGHTS[dim] for dim in available)

    # Peso efectivo de cada dimensión disponible (redistribuido al 100%)
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

    # Dimensiones sin datos — anotadas para transparencia
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
