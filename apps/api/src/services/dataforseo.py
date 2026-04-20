"""
DataForSEO service — SEO on-page + domain authority.

Endpoints usados:
  - on_page/instant_pages          → análisis on-page síncrono (~5s)
  - dataforseo_labs/domain_rank_overview/live → keywords + tráfico estimado

seo_score (0-100) calculado con señales propias — no usamos el onpage_score
de DataForSEO directamente para tener control total del modelo de scoring.

Docs: https://docs.dataforseo.com/v3/
"""

import httpx

from src.config import settings

_BASE_URL = "https://api.dataforseo.com/v3"

# Pesos del seo_score — suma 100
_WEIGHTS = {
    "is_https":              15,
    "has_meta_title":        15,
    "has_meta_description":  15,
    "has_h1":                15,
    "has_sitemap":           10,
    "has_robots_txt":        10,
    "title_length_ok":       10,   # 40-60 caracteres
    "images_alt_ok":         10,   # 0% imágenes sin alt
}


def _headers() -> dict[str, str]:
    return {
        "Authorization": f"Basic {settings.dataforseo_api_key}",
        "Content-Type": "application/json",
    }


# ─── On-Page Instant Pages ────────────────────────────────────────────────────

def get_onpage_data(url: str) -> dict:
    """
    Análisis on-page síncrono de una URL.

    Returns:
        dict con campos normalizados para el scoring.
        Incluye 'error' si la llamada o el parseo falla.
    """
    response = httpx.post(
        url=f"{_BASE_URL}/on_page/instant_pages",
        headers=_headers(),
        json=[{"url": url, "load_resources": True, "enable_javascript": False}],
        timeout=30.0,
    )
    response.raise_for_status()
    return _parse_onpage(response.json())


def _parse_onpage(raw: dict) -> dict:
    try:
        task = raw["tasks"][0]
        if task.get("status_code") != 20000:
            return {
                "error": "task_failed",
                "status_message": task.get("status_message"),
                "status_code": task.get("status_code"),
            }

        item = task["result"][0]["items"][0]
        meta = item.get("meta", {})
        checks = item.get("checks", {})
        title = meta.get("title") or ""
        description = meta.get("description") or ""
        images_count = item.get("images_count", 0)
        images_without_alt = item.get("images_without_alt_count", 0)

        return {
            "title": title,
            "title_length": len(title),
            "description": description,
            "description_length": len(description),
            "h1_count": len(meta.get("htags", {}).get("h1", [])),
            "h1_text": meta.get("htags", {}).get("h1", []),
            "canonical": meta.get("canonical"),
            "internal_links_count": item.get("internal_links_count", 0),
            "external_links_count": item.get("external_links_count", 0),
            "images_count": images_count,
            "images_without_alt": images_without_alt,
            "has_meta_title": bool(title),
            "has_meta_description": bool(description),
            "has_h1": len(meta.get("htags", {}).get("h1", [])) > 0,
            "is_https": checks.get("is_https", False),
            "has_sitemap": checks.get("sitemap", False),
            "has_robots_txt": checks.get("robots_txt", False),
            "page_size_bytes": item.get("page_size", 0),
            "onpage_score_dataforseo": item.get("onpage_score", 0),
        }

    except (KeyError, IndexError, TypeError) as exc:
        return {"error": "parse_error", "detail": str(exc)}


# ─── Domain Rank Overview ─────────────────────────────────────────────────────

def get_domain_rank(domain: str) -> dict:
    """
    Métricas de autoridad orgánica y tráfico estimado del dominio.

    Returns:
        dict con etv, count, posiciones en top 1/3/10.
        Incluye 'error' si falla.
    """
    response = httpx.post(
        url=f"{_BASE_URL}/dataforseo_labs/google/domain_rank_overview/live",
        headers=_headers(),
        json=[{"target": domain, "language_name": "Spanish", "location_name": "Colombia"}],
        timeout=30.0,
    )
    response.raise_for_status()
    return _parse_domain_rank(response.json())


def _parse_domain_rank(raw: dict) -> dict:
    try:
        task = raw["tasks"][0]
        if task.get("status_code") != 20000:
            return {
                "error": "task_failed",
                "status_message": task.get("status_message"),
                "status_code": task.get("status_code"),
            }

        metrics = task["result"][0]["items"][0]["metrics"].get("organic", {})
        return {
            "etv": metrics.get("etv", 0),
            "count": metrics.get("count", 0),
            "pos_1": metrics.get("pos_1", 0),
            "pos_2_3": metrics.get("pos_2_3", 0),
            "pos_4_10": metrics.get("pos_4_10", 0),
            "pos_11_20": metrics.get("pos_11_20", 0),
        }

    except (KeyError, IndexError, TypeError) as exc:
        return {"error": "parse_error", "detail": str(exc)}


# ─── seo_score ────────────────────────────────────────────────────────────────

def calculate_seo_score(onpage: dict) -> int:
    """
    Calcula el seo_score (0-100) a partir de los datos on-page.
    No depende de domain_rank — ese dato va al resultado como contexto adicional.
    """
    if "error" in onpage:
        return 0

    images_count = onpage.get("images_count", 0)
    images_without_alt = onpage.get("images_without_alt", 0)
    title_length = onpage.get("title_length", 0)

    signals = {
        "is_https":             onpage.get("is_https", False),
        "has_meta_title":       onpage.get("has_meta_title", False),
        "has_meta_description": onpage.get("has_meta_description", False),
        "has_h1":               onpage.get("has_h1", False),
        "has_sitemap":          onpage.get("has_sitemap", False),
        "has_robots_txt":       onpage.get("has_robots_txt", False),
        # Título entre 40-60 chars es óptimo para Google
        "title_length_ok":      40 <= title_length <= 60,
        # Sin imágenes rotas en alt o ratio < 10%
        "images_alt_ok": (
            images_count == 0
            or (images_without_alt / images_count) < 0.10
        ),
    }

    score = sum(_WEIGHTS[k] for k, ok in signals.items() if ok)
    return score
