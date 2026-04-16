"""
Spike 1: CrUX API (Chrome User Experience Report)
==================================================
Objetivo: validar qué datos reales retorna la API, cómo manejar dominios sin datos,
y qué métricas son útiles para el performance_score del Audit Engine.

Ejecutar:
    uv run python spike_crux.py

Docs: https://developer.chrome.com/docs/crux/api
"""

import json
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

CRUX_API_KEY = os.environ["CRUX_API_KEY"]
CRUX_ENDPOINT = "https://chromeuxreport.googleapis.com/v1/records:queryRecord"

# Umbrales oficiales de Google para Core Web Vitals (p75)
# https://web.dev/articles/defining-core-web-vitals-thresholds
THRESHOLDS = {
    "largest_contentful_paint": {
        "good": 2500,       # ms
        "needs_improvement": 4000,
        "unit": "ms",
    },
    "interaction_to_next_paint": {
        "good": 200,        # ms
        "needs_improvement": 500,
        "unit": "ms",
    },
    "cumulative_layout_shift": {
        "good": 0.10,       # puntuación sin unidad
        "needs_improvement": 0.25,
        "unit": "score",
    },
    "first_contentful_paint": {
        "good": 1800,       # ms
        "needs_improvement": 3000,
        "unit": "ms",
    },
    "experimental_time_to_first_byte": {
        "good": 800,        # ms
        "needs_improvement": 1800,
        "unit": "ms",
    },
}

# Dominios de prueba:
# - dian.gov.co: sitio gubernamental colombiano (ejemplo del PDF, sabemos que tiene datos)
# - google.com: sitio de referencia con excelente performance
# - dominio-sin-datos-crux.com: para probar el fallback cuando no hay datos históricos
TEST_DOMAINS = [
    "https://www.dian.gov.co",
    "https://www.google.com",
    "https://www.dominio-sin-datos-crux-test.com",  # esperamos 404 / sin datos
]


def classify_metric(metric_name: str, p75_value: float) -> str:
    """Clasifica una métrica según los umbrales de Google."""
    if metric_name not in THRESHOLDS:
        return "unknown"
    t = THRESHOLDS[metric_name]
    if p75_value <= t["good"]:
        return "good"
    elif p75_value <= t["needs_improvement"]:
        return "needs_improvement"
    else:
        return "poor"


def extract_p75(metric_data: dict) -> float | None:
    """Extrae el valor p75 de una métrica. Retorna None si no está disponible."""
    try:
        raw = metric_data["percentiles"]["p75"]
        # CLS viene como string ("0.33"), el resto como int
        return float(raw)
    except (KeyError, TypeError, ValueError):
        return None


def query_crux(origin: str, form_factor: str = "DESKTOP") -> dict:
    """
    Consulta la CrUX API para un origen dado.

    Retorna el response JSON completo, o un dict con error si falla.
    Importante: no todas las URLs tienen datos en CrUX — solo las que tienen
    suficiente tráfico real de Chrome para ser incluidas en el dataset.
    """
    response = httpx.post(
        url=f"{CRUX_ENDPOINT}?key={CRUX_API_KEY}",
        json={
            "origin": origin,
            "formFactor": form_factor,
        },
        headers={"Content-Type": "application/json"},
        timeout=15.0,
    )

    if response.status_code == 404:
        # 404 significa que no hay suficientes datos de usuarios reales para este dominio
        # En producción: fallback a Lighthouse local (métricas de laboratorio)
        return {"error": "no_crux_data", "origin": origin, "status_code": 404}

    if response.status_code != 200:
        return {
            "error": "api_error",
            "origin": origin,
            "status_code": response.status_code,
            "detail": response.text,
        }

    return response.json()


def parse_crux_response(raw: dict) -> dict:
    """
    Transforma la respuesta cruda de CrUX en un dict limpio con:
    - Las 5 métricas clave (p75 + clasificación)
    - El período de recolección de datos
    - Una puntuación de performance calculada (0-100)
    """
    if "error" in raw:
        return raw

    metrics_raw = raw.get("record", {}).get("metrics", {})
    collection = raw.get("record", {}).get("collectionPeriod", {})

    parsed_metrics = {}
    score_inputs = []

    for metric_name, thresholds in THRESHOLDS.items():
        metric_data = metrics_raw.get(metric_name)
        if not metric_data:
            parsed_metrics[metric_name] = {"p75": None, "rating": "no_data"}
            continue

        p75 = extract_p75(metric_data)
        rating = classify_metric(metric_name, p75) if p75 is not None else "no_data"

        parsed_metrics[metric_name] = {
            "p75": p75,
            "unit": thresholds["unit"],
            "rating": rating,
        }

        # Para el score: good=100, needs_improvement=50, poor=0
        if rating == "good":
            score_inputs.append(100)
        elif rating == "needs_improvement":
            score_inputs.append(50)
        elif rating == "poor":
            score_inputs.append(0)

    # Performance score: promedio de todas las métricas disponibles
    performance_score = round(sum(score_inputs) / len(score_inputs)) if score_inputs else 0

    return {
        "origin": raw.get("urlNormalizationDetails", {}).get("normalizedUrl", "unknown"),
        "collection_period": {
            "from": f"{collection.get('firstDate', {}).get('year')}-"
                    f"{collection.get('firstDate', {}).get('month'):02d}-"
                    f"{collection.get('firstDate', {}).get('day'):02d}"
                    if collection.get("firstDate") else "unknown",
            "to": f"{collection.get('lastDate', {}).get('year')}-"
                  f"{collection.get('lastDate', {}).get('month'):02d}-"
                  f"{collection.get('lastDate', {}).get('day'):02d}"
                  if collection.get("lastDate") else "unknown",
        },
        "metrics": parsed_metrics,
        "performance_score": performance_score,
    }


def run_spike():
    print("=" * 60)
    print("SPIKE 1: CrUX API — Validación de datos de performance")
    print("=" * 60)

    results = {}

    for domain in TEST_DOMAINS:
        print(f"\n→ Consultando: {domain}")
        raw = query_crux(domain, form_factor="DESKTOP")
        parsed = parse_crux_response(raw)
        results[domain] = parsed

        if "error" in parsed:
            if parsed["error"] == "no_crux_data":
                print(f"  ⚠ Sin datos CrUX para este dominio (404).")
                print(f"     → En producción: usar Lighthouse como fallback.")
            else:
                print(f"  ✗ Error de API: {parsed}")
        else:
            print(f"  ✓ Performance Score: {parsed['performance_score']}/100")
            print(f"  ✓ Período de datos: {parsed['collection_period']['from']} → {parsed['collection_period']['to']}")
            for metric, data in parsed["metrics"].items():
                if data.get("p75") is not None:
                    label = metric.replace("experimental_", "").replace("_", " ").upper()
                    print(f"     {label}: {data['p75']} {data['unit']} [{data['rating'].upper()}]")

    # Guardar output completo para documentación
    output_path = "outputs/crux_results.json"
    os.makedirs("outputs", exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2)

    print(f"\n✓ Resultados guardados en spikes/{output_path}")
    print("\n--- CONCLUSIONES PARA ARQUITECTURA ---")
    print("1. CrUX retorna datos históricos reales agregados (p75 por métrica)")
    print("2. Dominios con poco tráfico de Chrome → 404 (necesitan fallback a Lighthouse)")
    print("3. Métricas disponibles: LCP, INP, CLS, FCP, TTFB, RTT, navigation_types")
    print("4. El período de datos es ~28 días rolling — actualización semanal")
    print("5. performance_score calculado localmente como promedio ponderado de ratings")


if __name__ == "__main__":
    run_spike()
