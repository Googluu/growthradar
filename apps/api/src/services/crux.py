"""
CrUX API service — Chrome User Experience Report.

Endpoints integrados:
  - records:queryRecord         → snapshot actual (p75 último periodo)
  - records:queryHistoryRecord  → timeseries semanal de los últimos ~6 meses

Si el dominio no tiene suficiente tráfico en Chrome → CruxNoDataError.

Docs: https://developer.chrome.com/docs/crux/api
"""

from urllib.parse import urlparse

import httpx

from src.config import settings

_CRUX_QUERY_ENDPOINT = "https://chromeuxreport.googleapis.com/v1/records:queryRecord"
_CRUX_HISTORY_ENDPOINT = "https://chromeuxreport.googleapis.com/v1/records:queryHistoryRecord"

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


def _candidate_origins(origin: str) -> list[str]:
    """
    Devuelve una lista de origins a intentar, de más específico a más genérico.

    CrUX indexa por origen registrable y a menudo tiene datos para el dominio
    .com raíz pero no para la variante con TLD de país (ej. .com.co, .com.mx).

    Ejemplos:
      https://mercadolibre.com.co → [https://mercadolibre.com.co, https://mercadolibre.com]
      https://amazon.com.br       → [https://amazon.com.br, https://amazon.com]
      https://google.com          → [https://google.com]
    """
    parsed = urlparse(origin)
    hostname = parsed.hostname or ""
    parts = hostname.split(".")
    candidates: list[str] = [origin]

    # Detecta el patrón name.com.cc donde cc es un TLD de país (2 letras).
    # Ejemplo: mercadolibre.com.co → partes [-1]='co' (2 chars) → fallback: mercadolibre.com
    if len(parts) >= 3 and len(parts[-1]) == 2:
        fallback_host = ".".join(parts[:-1])
        candidates.append(f"{parsed.scheme}://{fallback_host}")

    return candidates


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


def _fmt_date(d: dict | None) -> str | None:
    if not d:
        return None
    return f"{d.get('year')}-{d.get('month', 0):02d}-{d.get('day', 0):02d}"


# ═══════════════════════════════════════════════════════════════════════════════
# CrUX — Snapshot actual
# ═══════════════════════════════════════════════════════════════════════════════

def query_crux(origin: str, form_factor: str = "DESKTOP") -> dict:
    """
    Consulta la CrUX API de forma síncrona (para uso desde el worker Celery).

    Intenta primero con el origin exacto; si recibe 404, reintenta con el
    dominio raíz sin TLD de país (ej. mercadolibre.com.co → mercadolibre.com).

    Returns:
        dict con campos: origin, collection_period, metrics, performance_score

    Raises:
        CruxNoDataError: si ningún candidate tiene datos en CrUX.
        httpx.HTTPError: si hay un error de red o la API retorna un error inesperado.
    """
    last_exc: Exception = CruxNoDataError(f"No CrUX data for {origin}")

    for candidate in _candidate_origins(origin):
        response = httpx.post(
            url=f"{_CRUX_QUERY_ENDPOINT}?key={settings.crux_api_key}",
            json={"origin": candidate, "formFactor": form_factor},
            headers={"Content-Type": "application/json"},
            timeout=15.0,
        )
        if response.status_code == 404:
            last_exc = CruxNoDataError(f"No CrUX data for {candidate}")
            continue
        response.raise_for_status()
        return _parse(response.json(), candidate, form_factor)

    raise last_exc


def _parse(raw: dict, origin: str, form_factor: str) -> dict:
    metrics_raw = raw.get("record", {}).get("metrics", {})
    collection = raw.get("record", {}).get("collectionPeriod", {})

    parsed_metrics: dict[str, dict] = {}
    score_inputs: list[int] = []

    for metric_name in _THRESHOLDS:
        metric_data = metrics_raw.get(metric_name)
        if not metric_data:
            parsed_metrics[metric_name] = {
                "p75": None,
                "unit": _UNITS[metric_name],
                "rating": "no_data",
            }
            continue

        p75 = _extract_p75(metric_data)
        rating = _classify(metric_name, p75) if p75 is not None else "no_data"
        parsed_metrics[metric_name] = {
            "p75": p75,
            "unit": _UNITS[metric_name],
            "rating": rating,
        }

        if rating == "good":
            score_inputs.append(100)
        elif rating == "needs_improvement":
            score_inputs.append(50)
        elif rating == "poor":
            score_inputs.append(0)

    performance_score = round(sum(score_inputs) / len(score_inputs)) if score_inputs else 0

    return {
        "origin": origin,
        "form_factor": form_factor,
        "collection_period": {
            "from": _fmt_date(collection.get("firstDate")),
            "to": _fmt_date(collection.get("lastDate")),
        },
        "metrics": parsed_metrics,
        "performance_score": performance_score,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# CrUX History — Timeseries semanal (~6 meses)
# ═══════════════════════════════════════════════════════════════════════════════

def query_crux_history(origin: str, form_factor: str = "DESKTOP") -> dict:
    """
    Consulta la CrUX History API.

    Devuelve hasta 25 puntos semanales (~6 meses) por métrica, permitiendo
    visualizar tendencias y detectar regresiones de performance en el tiempo.

    Aplica el mismo fallback de dominio raíz que query_crux.

    Raises:
        CruxNoDataError: si ningún candidate tiene datos históricos en CrUX.
    """
    last_exc: Exception = CruxNoDataError(f"No CrUX history data for {origin}")

    for candidate in _candidate_origins(origin):
        response = httpx.post(
            url=f"{_CRUX_HISTORY_ENDPOINT}?key={settings.crux_api_key}",
            json={"origin": candidate, "formFactor": form_factor},
            headers={"Content-Type": "application/json"},
            timeout=20.0,
        )
        if response.status_code == 404:
            last_exc = CruxNoDataError(f"No CrUX history data for {candidate}")
            continue
        response.raise_for_status()
        return _parse_history(response.json(), candidate, form_factor)

    raise last_exc


def _parse_history(raw: dict, origin: str, form_factor: str) -> dict:
    record = raw.get("record", {})
    metrics_raw = record.get("metrics", {})
    collection_periods = record.get("collectionPeriods", []) or []

    # Lista ordenada de fechas correspondiente a cada índice del timeseries
    dates_to = [_fmt_date(p.get("lastDate")) for p in collection_periods]
    dates_from = [_fmt_date(p.get("firstDate")) for p in collection_periods]

    parsed_metrics: dict[str, dict] = {}

    for metric_name in _THRESHOLDS:
        metric_data = metrics_raw.get(metric_name)
        if not metric_data:
            parsed_metrics[metric_name] = {
                "unit": _UNITS[metric_name],
                "timeseries": [],
                "current_p75": None,
                "previous_p75": None,
                "current_rating": "no_data",
                "trend": "no_data",
                "delta_pct": None,
            }
            continue

        p75_series = (metric_data.get("percentilesTimeseries") or {}).get("p75s") or []

        timeseries = []
        for i, raw_value in enumerate(p75_series):
            # La API a veces devuelve None para semanas sin tráfico suficiente
            value = float(raw_value) if raw_value is not None else None
            rating = _classify(metric_name, value) if value is not None else "no_data"
            timeseries.append({
                "date_from": dates_from[i] if i < len(dates_from) else None,
                "date_to": dates_to[i] if i < len(dates_to) else None,
                "p75": value,
                "rating": rating,
            })

        valid_values = [t["p75"] for t in timeseries if t["p75"] is not None]
        current_p75 = valid_values[-1] if valid_values else None
        previous_p75 = valid_values[-2] if len(valid_values) >= 2 else None

        # Tendencia: comparar primer cuartil vs último cuartil de la serie
        # Para todas las métricas CWV, menor es mejor → delta negativo = mejora.
        trend = "stable"
        delta_pct: float | None = None
        if len(valid_values) >= 4:
            q = max(len(valid_values) // 4, 1)
            first_avg = sum(valid_values[:q]) / q
            last_avg = sum(valid_values[-q:]) / q
            if first_avg > 0:
                delta_pct = round((last_avg - first_avg) / first_avg * 100, 1)
                if delta_pct < -5:
                    trend = "improving"
                elif delta_pct > 5:
                    trend = "degrading"

        parsed_metrics[metric_name] = {
            "unit": _UNITS[metric_name],
            "timeseries": timeseries,
            "current_p75": current_p75,
            "previous_p75": previous_p75,
            "current_rating": _classify(metric_name, current_p75) if current_p75 is not None else "no_data",
            "trend": trend,
            "delta_pct": delta_pct,
        }

    return {
        "origin": origin,
        "form_factor": form_factor,
        "data_points_count": len(collection_periods),
        "first_date": dates_from[0] if dates_from else None,
        "last_date": dates_to[-1] if dates_to else None,
        "metrics": parsed_metrics,
    }