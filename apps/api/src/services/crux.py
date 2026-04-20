"""
CrUX API service — Chrome User Experience Report.

Consulta datos reales de performance de campo (p75) para un dominio.
Si el dominio no tiene suficiente tráfico en Chrome → retorna CruxNoDataError.

Docs: https://developer.chrome.com/docs/crux/api
"""

import httpx

from src.config import settings

CRUX_ENDPOINT = "https://chromeuxreport.googleapis.com/v1/records:queryRecord"

# Umbrales oficiales Core Web Vitals (p75)
# https://web.dev/articles/defining-core-web-vitals-thresholds
_THRESHOLDS: dict[str, dict[str, float]] = {
    "largest_contentful_paint":          {"good": 2500, "needs_improvement": 4000},
    "interaction_to_next_paint":         {"good": 200,  "needs_improvement": 500},
    "cumulative_layout_shift":           {"good": 0.10, "needs_improvement": 0.25},
    "first_contentful_paint":            {"good": 1800, "needs_improvement": 3000},
    "experimental_time_to_first_byte":   {"good": 800,  "needs_improvement": 1800},
}

_UNITS: dict[str, str] = {
    "largest_contentful_paint":        "ms",
    "interaction_to_next_paint":       "ms",
    "cumulative_layout_shift":         "score",
    "first_contentful_paint":          "ms",
    "experimental_time_to_first_byte": "ms",
}


class CruxNoDataError(Exception):
    """El dominio no tiene datos en CrUX (404). Se debe usar fallback."""


def _classify(metric_name: str, p75: float) -> str:
    t = _THRESHOLDS[metric_name]
    if p75 <= t["good"]:
        return "good"
    if p75 <= t["needs_improvement"]:
        return "needs_improvement"
    return "poor"


def _extract_p75(metric_data: dict) -> float | None:
    try:
        return float(metric_data["percentiles"]["p75"])
    except (KeyError, TypeError, ValueError):
        return None


def query_crux(origin: str, form_factor: str = "DESKTOP") -> dict:
    """
    Consulta la CrUX API de forma síncrona (para uso desde el worker Celery).

    Returns:
        dict con campos: origin, collection_period, metrics, performance_score

    Raises:
        CruxNoDataError: si el dominio no tiene datos en CrUX (404).
        httpx.HTTPError: si hay un error de red o la API retorna un error inesperado.
    """
    response = httpx.post(
        url=f"{CRUX_ENDPOINT}?key={settings.crux_api_key}",
        json={"origin": origin, "formFactor": form_factor},
        headers={"Content-Type": "application/json"},
        timeout=15.0,
    )

    if response.status_code == 404:
        raise CruxNoDataError(f"No CrUX data for {origin}")

    response.raise_for_status()
    return _parse(response.json(), origin)


def _parse(raw: dict, origin: str) -> dict:
    metrics_raw = raw.get("record", {}).get("metrics", {})
    collection = raw.get("record", {}).get("collectionPeriod", {})

    parsed_metrics: dict[str, dict] = {}
    score_inputs: list[int] = []

    for metric_name in _THRESHOLDS:
        metric_data = metrics_raw.get(metric_name)
        if not metric_data:
            parsed_metrics[metric_name] = {"p75": None, "unit": _UNITS[metric_name], "rating": "no_data"}
            continue

        p75 = _extract_p75(metric_data)
        rating = _classify(metric_name, p75) if p75 is not None else "no_data"
        parsed_metrics[metric_name] = {"p75": p75, "unit": _UNITS[metric_name], "rating": rating}

        if rating == "good":
            score_inputs.append(100)
        elif rating == "needs_improvement":
            score_inputs.append(50)
        elif rating == "poor":
            score_inputs.append(0)

    performance_score = round(sum(score_inputs) / len(score_inputs)) if score_inputs else 0

    def _fmt_date(d: dict) -> str | None:
        if not d:
            return None
        return f"{d.get('year')}-{d.get('month', 0):02d}-{d.get('day', 0):02d}"

    return {
        "origin": origin,
        "collection_period": {
            "from": _fmt_date(collection.get("firstDate")),
            "to": _fmt_date(collection.get("lastDate")),
        },
        "metrics": parsed_metrics,
        "performance_score": performance_score,
    }
