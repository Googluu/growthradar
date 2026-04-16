"""
Spike 2: DataForSEO API (SEO + On-Page)
========================================
Objetivo: validar qué datos retorna DataForSEO para on-page SEO,
entender el costo por llamada en paid tier, y decidir qué endpoints
usar en el Audit Engine.

Ejecutar:
    uv run python spike_dataforseo.py

Docs: https://docs.dataforseo.com/v3/
Endpoints probados:
    1. On-Page Instant Pages — análisis on-page inmediato de una URL
    2. Domain Rank Overview  — métricas de autoridad y tráfico estimado del dominio
"""

import json
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

# DataForSEO usa HTTP Basic Auth con el valor ya en Base64 (email:password)
DATAFORSEO_API_KEY = os.environ["DATAFORSEO_API_KEY"]
BASE_URL = "https://api.dataforseo.com/v3"

# Mismo dominio del ejemplo del PDF para poder comparar resultados
TEST_DOMAIN = "dian.gov.co"
TEST_URL = "https://www.dian.gov.co"


def get_headers() -> dict:
    """Headers de autenticación para DataForSEO."""
    return {
        "Authorization": f"Basic {DATAFORSEO_API_KEY}",
        "Content-Type": "application/json",
    }


# ─── Endpoint 1: On-Page Instant Pages ───────────────────────────────────────
# Retorna análisis on-page de una URL: meta tags, headings, canonical, robots,
# velocidad de carga, links internos/externos, imágenes sin alt, etc.
# Costo: ~$0.0015 por URL en paid tier (muy bajo para el MVP)
# Docs: https://docs.dataforseo.com/v3/on_page/instant_pages/

def get_onpage_instant(url: str) -> dict:
    """
    Análisis on-page inmediato de una URL.
    A diferencia del crawl completo, este endpoint es síncrono — retorna en ~5s.
    """
    payload = [
        {
            "url": url,
            "load_resources": True,     # incluye recursos (CSS, JS, imágenes)
            "enable_javascript": False,  # sin JS para este spike (más rápido)
        }
    ]

    response = httpx.post(
        url=f"{BASE_URL}/on_page/instant_pages",
        headers=get_headers(),
        json=payload,
        timeout=30.0,
    )

    return response.json()


def parse_onpage_result(raw: dict) -> dict:
    """
    Extrae los campos relevantes para el seo_score del Audit Engine.
    Descarta la mayoría del payload (DataForSEO retorna ~150 campos por URL).
    """
    try:
        task = raw["tasks"][0]
        status_code = task.get("status_code")

        if status_code != 20000:
            return {
                "error": "task_failed",
                "status_message": task.get("status_message"),
                "status_code": status_code,
            }

        item = task["result"][0]["items"][0]
        meta = item.get("meta", {})
        checks = item.get("checks", {})

        return {
            # Meta básico
            "title": meta.get("title"),
            "title_length": len(meta.get("title") or ""),
            "description": meta.get("description"),
            "description_length": len(meta.get("description") or ""),
            "h1_count": len(meta.get("htags", {}).get("h1", [])),
            "h1_text": meta.get("htags", {}).get("h1", []),
            "canonical": meta.get("canonical"),
            "robots": meta.get("robots"),

            # Estructura de links
            "internal_links_count": item.get("internal_links_count", 0),
            "external_links_count": item.get("external_links_count", 0),
            "broken_links": checks.get("broken_links", False),

            # Imágenes
            "images_count": item.get("images_count", 0),
            "images_without_alt": item.get("images_without_alt_count", 0),

            # Checks automáticos de DataForSEO (booleanos)
            "has_meta_title": bool(meta.get("title")),
            "has_meta_description": bool(meta.get("description")),
            "has_h1": len(meta.get("htags", {}).get("h1", [])) > 0,
            "is_https": checks.get("is_https", False),
            "has_sitemap": checks.get("sitemap", False),
            "has_robots_txt": checks.get("robots_txt", False),

            # Tamaño de página
            "page_size_bytes": item.get("page_size", 0),
            "onpage_score": item.get("onpage_score", 0),  # score 0-100 de DataForSEO
        }

    except (KeyError, IndexError, TypeError) as e:
        return {"error": "parse_error", "detail": str(e), "raw_keys": list(raw.keys())}


# ─── Endpoint 2: Domain Rank Overview ─────────────────────────────────────────
# Retorna: backlinks count, domain rank, organic traffic estimate, keywords count.
# Útil para el seo_score (autoridad de dominio) y el reputation_score.
# Costo: ~$0.002 por dominio en paid tier
# Docs: https://docs.dataforseo.com/v3/dataforseo_labs/google/domain_rank_overview/live/

def get_domain_rank_overview(domain: str) -> dict:
    """Métricas de autoridad y visibilidad orgánica del dominio."""
    payload = [
        {
            "target": domain,
            "language_name": "Spanish",
            "location_name": "Colombia",  # contexto LATAM
        }
    ]

    response = httpx.post(
        url=f"{BASE_URL}/dataforseo_labs/google/domain_rank_overview/live",
        headers=get_headers(),
        json=payload,
        timeout=30.0,
    )

    return response.json()


def parse_domain_rank(raw: dict) -> dict:
    """Extrae las métricas clave de autoridad del dominio."""
    try:
        task = raw["tasks"][0]
        if task.get("status_code") != 20000:
            return {
                "error": "task_failed",
                "status_message": task.get("status_message"),
                "status_code": task.get("status_code"),
            }

        # La estructura es: result[0]["items"][0]["metrics"]
        metrics = task["result"][0]["items"][0]["metrics"].get("organic", {})
        return {
            "etv": metrics.get("etv", 0),           # estimated traffic value (mensual)
            "count": metrics.get("count", 0),         # keywords en top 100
            "pos_1": metrics.get("pos_1", 0),         # keywords en posición #1
            "pos_2_3": metrics.get("pos_2_3", 0),
            "pos_4_10": metrics.get("pos_4_10", 0),
            "pos_11_20": metrics.get("pos_11_20", 0),
        }

    except (KeyError, IndexError, TypeError) as e:
        return {"error": "parse_error", "detail": str(e)}


# ─── Runner principal ──────────────────────────────────────────────────────────

def run_spike():
    print("=" * 60)
    print("SPIKE 2: DataForSEO API — Validación SEO On-Page")
    print("=" * 60)

    results = {}

    # --- Test 1: On-Page Instant Pages ---
    print(f"\n→ On-Page Instant Pages: {TEST_URL}")
    raw_onpage = get_onpage_instant(TEST_URL)
    parsed_onpage = parse_onpage_result(raw_onpage)
    results["onpage"] = parsed_onpage

    if "error" in parsed_onpage:
        print(f"  ✗ Error: {parsed_onpage}")
    else:
        print(f"  ✓ On-Page Score (DataForSEO): {parsed_onpage['onpage_score']}/100")
        print(f"  ✓ Title: {parsed_onpage['title']!r} ({parsed_onpage['title_length']} chars)")
        print(f"  ✓ Description: {parsed_onpage['description_length']} chars")
        print(f"  ✓ H1 tags: {parsed_onpage['h1_count']} → {parsed_onpage['h1_text']}")
        print(f"  ✓ HTTPS: {parsed_onpage['is_https']} | Sitemap: {parsed_onpage['has_sitemap']} | robots.txt: {parsed_onpage['has_robots_txt']}")
        print(f"  ✓ Imágenes sin alt: {parsed_onpage['images_without_alt']} / {parsed_onpage['images_count']}")
        print(f"  ✓ Links internos: {parsed_onpage['internal_links_count']} | externos: {parsed_onpage['external_links_count']}")

    # --- Test 2: Domain Rank Overview ---
    print(f"\n→ Domain Rank Overview: {TEST_DOMAIN}")
    raw_rank = get_domain_rank_overview(TEST_DOMAIN)
    parsed_rank = parse_domain_rank(raw_rank)
    results["domain_rank"] = parsed_rank

    if "error" in parsed_rank:
        print(f"  ✗ Error: {parsed_rank}")
    else:
        print(f"  ✓ Keywords rankeando: {parsed_rank['count']}")
        print(f"  ✓ Keywords en #1: {parsed_rank['pos_1']}")
        print(f"  ✓ Keywords en top 10: {parsed_rank['pos_4_10'] + parsed_rank['pos_2_3'] + parsed_rank['pos_1']}")
        print(f"  ✓ Tráfico estimado mensual: {parsed_rank['etv']}")

    # Guardar output completo para documentación
    output_path = "outputs/dataforseo_results.json"
    os.makedirs("outputs", exist_ok=True)

    # Guardar raw + parsed para comparar
    with open(output_path, "w") as f:
        json.dump({
            "parsed": results,
            "raw": {
                "onpage": raw_onpage,
                "domain_rank": raw_rank,
            }
        }, f, indent=2)

    print(f"\n✓ Resultados guardados en spikes/{output_path}")
    print("\n--- CONCLUSIONES PARA ARQUITECTURA ---")
    print("1. On-Page Instant Pages: síncrono, ~5s, ideal para auditorías del MVP")
    print("2. Domain Rank Overview: da keywords + tráfico estimado por región")
    print("3. onpage_score de DataForSEO es útil como señal, pero calcularemos nuestro propio seo_score")
    print("4. Costo estimado por auditoría: ~$0.004 (on-page + rank overview)")
    print("5. 100 auditorías/mes ≈ $0.40 — costo negligible para el MVP")


if __name__ == "__main__":
    run_spike()
