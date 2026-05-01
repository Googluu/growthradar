"""
DataForSEO service — capa de inteligencia para Growth Radar.

Endpoints integrados:
  - on_page/instant_pages                                    → auditoría on-page (~7s)
  - dataforseo_labs/google/domain_rank_overview/live         → autoridad de dominio
  - serp/google/organic/live/advanced                        → SERP en vivo (~2s)
  - dataforseo_labs/google/related_keywords/live             → keyword research (~0.4s)
  - keywords_data/google_ads/search_volume/live              → volumen Google Ads exacto

Cada parser devuelve campos normalizados listos para alimentar el dashboard.
El contrato de error es uniforme: dict con "error" cuando algo falla.

Docs: https://docs.dataforseo.com/v3/
"""

from collections import Counter

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
    "images_alt_ok":         10,   # < 10% imágenes sin alt
}

# ─── Clasificación de checks de OnPage ────────────────────────────────────────
# Mapeo nombre_check → etiqueta legible. Si el check está en TRUE, es problema.
_ONPAGE_CRITICAL_ISSUES: dict[str, str] = {
    "is_broken":                       "Página rota",
    "is_4xx_code":                     "Respuesta 4xx",
    "is_5xx_code":                     "Error 5xx del servidor",
    "is_redirect":                     "Página redirige",
    "is_http":                         "No usa HTTPS",
    "https_to_http_links":             "Enlaza desde HTTPS a HTTP",
    "no_doctype":                      "Sin doctype",
    "no_h1_tag":                       "Falta H1",
    "no_title":                        "Falta <title>",
    "no_description":                  "Falta meta description",
    "no_favicon":                      "Sin favicon",
    "no_image_alt":                    "Imágenes sin atributo alt",
    "no_image_title":                  "Imágenes sin atributo title",
    "duplicate_meta_tags":             "Meta tags duplicadas",
    "duplicate_title_tag":             "Etiqueta title duplicada",
    "title_too_long":                  "Título demasiado largo",
    "title_too_short":                 "Título demasiado corto",
    "irrelevant_description":          "Description no coincide con contenido",
    "irrelevant_title":                "Title no coincide con contenido",
    "irrelevant_meta_keywords":        "Meta keywords no coinciden con contenido",
    "deprecated_html_tags":            "Etiquetas HTML deprecadas",
    "has_render_blocking_resources":   "Recursos que bloquean el render",
    "low_content_rate":                "Ratio de contenido bajo",
    "high_content_rate":               "Ratio de contenido excesivo",
    "low_character_count":             "Conteo de caracteres bajo",
    "high_character_count":            "Conteo de caracteres excesivo",
    "small_page_size":                 "Página demasiado pequeña",
    "large_page_size":                 "Página demasiado grande",
    "low_readability_rate":            "Baja legibilidad",
    "size_greater_than_3mb":           "Página > 3MB",
    "high_loading_time":               "Tiempo de carga alto",
    "high_waiting_time":               "Tiempo de espera alto",
    "has_meta_refresh_redirect":       "Usa meta refresh redirect",
    "has_micromarkup_errors":          "Errores en microformatos",
    "no_content_encoding":             "Sin content-encoding",
    "no_encoding_meta_tag":            "Sin meta charset",
    "lorem_ipsum":                     "Contiene lorem ipsum",
    "flash":                           "Usa Flash",
    "frame":                           "Usa frames",
}

# Mapeo nombre_check → etiqueta. Si el check está en TRUE, es positivo.
_ONPAGE_POSITIVE_CHECKS: dict[str, str] = {
    "is_https":                                   "Usa HTTPS",
    "canonical":                                  "Tiene canonical",
    "has_html_doctype":                           "Doctype HTML correcto",
    "has_micromarkup":                            "Usa microformatos",
    "meta_charset_consistency":                   "Charset consistente",
    "seo_friendly_url":                           "URL SEO-friendly",
    "seo_friendly_url_characters_check":          "Caracteres de URL OK",
    "seo_friendly_url_dynamic_check":             "URL no dinámica",
    "seo_friendly_url_keywords_check":            "URL contiene keywords",
    "seo_friendly_url_relative_length_check":     "Longitud de URL OK",
    "from_sitemap":                               "URL en sitemap",
}


def _headers() -> dict[str, str]:
    return {
        "Authorization": f"Basic {settings.dataforseo_api_key}",
        "Content-Type": "application/json",
    }


# ═══════════════════════════════════════════════════════════════════════════════
# ON-PAGE INSTANT PAGES
# ═══════════════════════════════════════════════════════════════════════════════

def get_onpage_data(url: str, timeout: float = 25.0) -> dict:
    """
    Auditoría on-page síncrona de una URL.

    Returns:
        dict con campos normalizados para el scoring y el dashboard.
        Mantiene los campos planos legacy + agrega secciones agrupadas.
        Incluye 'error' si la llamada o el parseo falla.
    """
    response = httpx.post(
        url=f"{_BASE_URL}/on_page/instant_pages",
        headers=_headers(),
        json=[{"url": url, "load_resources": True, "enable_javascript": False}],
        timeout=timeout,
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

        result_block = task["result"][0]
        item = result_block["items"][0]
        meta = item.get("meta") or {}
        checks = item.get("checks") or {}
        content = meta.get("content") or {}
        htags = meta.get("htags") or {}
        page_timing = item.get("page_timing") or {}
        resource_errors = item.get("resource_errors") or {}

        title = meta.get("title") or ""
        description = meta.get("description") or ""
        h1_list = htags.get("h1") or []
        images_count = meta.get("images_count", 0)
        # 'images_without_alt_count' viene en el item raíz en algunas versiones
        images_without_alt = item.get("images_without_alt_count", 0)

        # ── Clasificar checks en issues / passing ─────────────────────────────
        issues = [
            {"check": name, "label": _ONPAGE_CRITICAL_ISSUES[name], "severity": "critical"}
            for name, label in _ONPAGE_CRITICAL_ISSUES.items()
            if checks.get(name) is True
        ]
        passing = [
            {"check": name, "label": _ONPAGE_POSITIVE_CHECKS[name]}
            for name in _ONPAGE_POSITIVE_CHECKS
            if checks.get(name) is True
        ]

        # ── Salud general (proporción passing / total relevante) ──────────────
        relevant_checks = (
            len(_ONPAGE_CRITICAL_ISSUES) + len(_ONPAGE_POSITIVE_CHECKS)
        )
        health_score = round(
            ((len(_ONPAGE_CRITICAL_ISSUES) - len(issues)) + len(passing))
            / relevant_checks * 100,
            1,
        )

        return {
            # ── Campos legacy (usados por calculate_seo_score) ────────────────
            "title": title,
            "title_length": len(title),
            "description": description,
            "description_length": len(description),
            "h1_count": len(h1_list),
            "h1_text": h1_list,
            "canonical": meta.get("canonical"),
            "internal_links_count": meta.get("internal_links_count", 0),
            "external_links_count": meta.get("external_links_count", 0),
            "images_count": images_count,
            "images_without_alt": images_without_alt,
            "has_meta_title": bool(title),
            "has_meta_description": bool(description),
            "has_h1": len(h1_list) > 0,
            "is_https": checks.get("is_https", False),
            "has_sitemap": checks.get("from_sitemap", False),
            "has_robots_txt": checks.get("robots_txt", False),
            "page_size_bytes": item.get("size", 0),
            "onpage_score_dataforseo": item.get("onpage_score", 0),

            # ── URL y status básicos ──────────────────────────────────────────
            "url": item.get("url"),
            "status_code": item.get("status_code"),
            "fetch_time": item.get("fetch_time"),
            "media_type": item.get("media_type"),
            "server": item.get("server"),
            "content_encoding": item.get("content_encoding"),
            "click_depth": item.get("click_depth"),

            # ── Sección 1 dashboard: salud del sitio ─────────────────────────
            "health": {
                "onpage_score": item.get("onpage_score", 0),     # 0-100 de DataForSEO
                "computed_health_score": health_score,           # 0-100 propio
                "issues_count": len(issues),
                "issues_critical_count": len(issues),            # todos son critical aquí
                "passing_count": len(passing),
                "is_indexable": (
                    not checks.get("is_redirect", False)
                    and not checks.get("is_4xx_code", False)
                    and not checks.get("is_5xx_code", False)
                    and not checks.get("is_broken", False)
                    and bool(meta.get("canonical"))
                ),
                "http_status_class": (
                    "2xx" if 200 <= (item.get("status_code") or 0) < 300
                    else "3xx" if 300 <= (item.get("status_code") or 0) < 400
                    else "4xx" if 400 <= (item.get("status_code") or 0) < 500
                    else "5xx" if 500 <= (item.get("status_code") or 0) < 600
                    else "unknown"
                ),
            },

            # ── Sección 2 dashboard: auditoría técnica ────────────────────────
            "issues": issues,
            "passing_checks": passing,
            "broken_resources": item.get("broken_resources", False),
            "broken_links": item.get("broken_links", False),
            "duplicate_title": item.get("duplicate_title", False),
            "duplicate_description": item.get("duplicate_description", False),
            "duplicate_content": item.get("duplicate_content", False),
            "duplicate_meta_tags": meta.get("duplicate_meta_tags") or [],
            "deprecated_tags": meta.get("deprecated_tags"),
            "resource_errors_count": len(resource_errors.get("errors") or []),
            "resource_warnings_count": len(resource_errors.get("warnings") or []),
            "resource_errors": resource_errors.get("errors") or [],
            "resource_warnings": resource_errors.get("warnings") or [],

            # ── Sección 3 dashboard: rendimiento (page timing) ────────────────
            "performance": {
                "time_to_interactive_ms":     page_timing.get("time_to_interactive"),
                "dom_complete_ms":            page_timing.get("dom_complete"),
                "largest_contentful_paint":   page_timing.get("largest_contentful_paint"),
                "first_input_delay":          page_timing.get("first_input_delay"),
                "cumulative_layout_shift":    meta.get("cumulative_layout_shift"),
                "connection_time_ms":         page_timing.get("connection_time"),
                "time_to_secure_connection":  page_timing.get("time_to_secure_connection"),
                "waiting_time_ms":            page_timing.get("waiting_time"),
                "download_time_ms":           page_timing.get("download_time"),
                "duration_time_ms":           page_timing.get("duration_time"),
                "total_dom_size_bytes":       item.get("total_dom_size", 0),
                "page_size_bytes":            item.get("size", 0),
                "encoded_size_bytes":         item.get("encoded_size", 0),
                "total_transfer_size_bytes":  item.get("total_transfer_size", 0),
            },

            # ── Sección 4 dashboard: contenido y estructura ───────────────────
            "headings": {
                "h1": htags.get("h1") or [],
                "h2": htags.get("h2") or [],
                "h3": htags.get("h3") or [],
                "h4": htags.get("h4") or [],
                "h5": htags.get("h5") or [],
                "h6": htags.get("h6") or [],
            },
            "headings_count": {
                "h1": len(htags.get("h1") or []),
                "h2": len(htags.get("h2") or []),
                "h3": len(htags.get("h3") or []),
                "h4": len(htags.get("h4") or []),
                "h5": len(htags.get("h5") or []),
                "h6": len(htags.get("h6") or []),
            },
            "content": {
                "plain_text_size":                       content.get("plain_text_size"),
                "plain_text_rate":                       content.get("plain_text_rate"),
                "plain_text_word_count":                 content.get("plain_text_word_count"),
                "automated_readability_index":           content.get("automated_readability_index"),
                "coleman_liau_readability_index":        content.get("coleman_liau_readability_index"),
                "dale_chall_readability_index":          content.get("dale_chall_readability_index"),
                "flesch_kincaid_readability_index":      content.get("flesch_kincaid_readability_index"),
                "smog_readability_index":                content.get("smog_readability_index"),
                "title_to_content_consistency":          content.get("title_to_content_consistency"),
                "description_to_content_consistency":    content.get("description_to_content_consistency"),
                "meta_keywords_to_content_consistency":  content.get("meta_keywords_to_content_consistency"),
            },
            "resources_breakdown": {
                "scripts_count":                  meta.get("scripts_count", 0),
                "scripts_size":                   meta.get("scripts_size", 0),
                "stylesheets_count":              meta.get("stylesheets_count", 0),
                "stylesheets_size":               meta.get("stylesheets_size", 0),
                "images_count":                   images_count,
                "images_size":                    meta.get("images_size", 0),
                "render_blocking_scripts_count":  meta.get("render_blocking_scripts_count", 0),
                "render_blocking_stylesheets_count": meta.get("render_blocking_stylesheets_count", 0),
            },
            "social_media_tags": meta.get("social_media_tags") or {},
            "favicon": meta.get("favicon"),
            "meta_keywords": meta.get("meta_keywords"),

            # ── Operacional ───────────────────────────────────────────────────
            "cost": task.get("cost"),
            "task_time": task.get("time"),
            "task_status_code": task.get("status_code"),
            "raw_checks": checks,  # acceso completo si el dashboard lo necesita
        }

    except (KeyError, IndexError, TypeError) as exc:
        return {"error": "parse_error", "detail": str(exc)}


# ═══════════════════════════════════════════════════════════════════════════════
# DOMAIN RANK OVERVIEW
# ═══════════════════════════════════════════════════════════════════════════════

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


# ═══════════════════════════════════════════════════════════════════════════════
# seo_score
# ═══════════════════════════════════════════════════════════════════════════════

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
        "title_length_ok":      40 <= title_length <= 60,
        "images_alt_ok": (
            images_count == 0
            or (images_without_alt / images_count) < 0.10
        ),
    }

    score = sum(_WEIGHTS[k] for k, ok in signals.items() if ok)
    return score


# ═══════════════════════════════════════════════════════════════════════════════
# SERP — Google Organic Live Advanced
# ═══════════════════════════════════════════════════════════════════════════════

def get_serp_data(
    keyword: str,
    location_code: int = 2170,        # Colombia (2840 = US, 2484 = México)
    language_code: str = "es",
    device: str = "desktop",          # 'desktop' | 'mobile'
    os_name: str = "windows",         # 'windows' | 'macos' | 'android' | 'ios'
    depth: int = 10,                  # 10 | 20 | 30 | 50 | 100
    target_domain: str | None = None,
) -> dict:
    """
    SERP de Google en vivo (modo Advanced) para un keyword.

    Args:
        keyword: término de búsqueda a analizar.
        location_code: código de ubicación DataForSEO (2170 = Colombia).
        language_code: idioma ISO 639-1 ('es', 'en', ...).
        device: dispositivo simulado.
        os_name: sistema operativo simulado.
        depth: cantidad de resultados orgánicos a traer.
        target_domain: si se provee, calcula la visibilidad del dominio
            en esta SERP (posición, top_3, top_10, featured snippet).

    Returns:
        dict con campos normalizados para el dashboard.
        Incluye 'error' si la llamada o el parseo falla.
    """
    response = httpx.post(
        url=f"{_BASE_URL}/serp/google/organic/live/advanced",
        headers=_headers(),
        json=[{
            "keyword": keyword,
            "location_code": location_code,
            "language_code": language_code,
            "device": device,
            "os": os_name,
            "depth": depth,
        }],
        timeout=30.0,
    )
    response.raise_for_status()
    return _parse_serp(response.json(), target_domain=target_domain)


def _parse_serp(raw: dict, target_domain: str | None = None) -> dict:
    try:
        task = raw["tasks"][0]
        if task.get("status_code") != 20000:
            return {
                "error": "task_failed",
                "status_message": task.get("status_message"),
                "status_code": task.get("status_code"),
            }

        result = task["result"][0]
        items = result.get("items") or []

        organic_items = [i for i in items if i.get("type") == "organic"]
        ai_overview_item = next(
            (i for i in items if i.get("type") == "ai_overview"), None
        )
        related_searches_item = next(
            (i for i in items if i.get("type") == "related_searches"), None
        )
        perspectives_item = next(
            (i for i in items if i.get("type") == "perspectives"), None
        )

        # ── Tabla principal: resultados orgánicos ─────────────────────────────
        organic_results = [
            {
                "rank_absolute": item.get("rank_absolute"),
                "rank_group": item.get("rank_group"),
                "position": item.get("position"),
                "title": item.get("title"),
                "url": item.get("url"),
                "domain": item.get("domain"),
                "description": item.get("description"),
                "breadcrumb": item.get("breadcrumb"),
                "website_name": item.get("website_name"),
                "is_featured_snippet": item.get("is_featured_snippet", False),
                "is_image": item.get("is_image", False),
                "is_video": item.get("is_video", False),
                "highlighted": item.get("highlighted") or [],
                "sitelinks": [
                    {
                        "title": link.get("title"),
                        "url": link.get("url"),
                        "description": link.get("description"),
                    }
                    for link in (item.get("links") or [])
                    if link.get("type") == "link_element"
                ],
            }
            for item in organic_items
        ]

        # ── AI Overview ───────────────────────────────────────────────────────
        ai_overview = None
        if ai_overview_item:
            references = ai_overview_item.get("references") or []
            ai_overview = {
                "markdown": ai_overview_item.get("markdown"),
                "references": [
                    {
                        "domain": ref.get("domain"),
                        "url": ref.get("url"),
                        "title": ref.get("title"),
                        "source": ref.get("source"),
                    }
                    for ref in references
                ],
                "references_count": len(references),
            }

        # ── SERP features ─────────────────────────────────────────────────────
        serp_features = sorted({
            i.get("type") for i in items
            if i.get("type") and i.get("type") != "organic"
        })

        # ── KPIs derivados ────────────────────────────────────────────────────
        ranks = [
            i.get("rank_absolute") for i in organic_items
            if i.get("rank_absolute") is not None
        ]
        average_position = round(sum(ranks) / len(ranks), 2) if ranks else None

        ranking_distribution = {
            "top_3":   sum(1 for r in ranks if r <= 3),
            "top_10":  sum(1 for r in ranks if r <= 10),
            "top_20":  sum(1 for r in ranks if r <= 20),
            "top_100": sum(1 for r in ranks if r <= 100),
        }

        top_3_domains = [r["domain"] for r in organic_results[:3] if r.get("domain")]
        top_10_domains = [r["domain"] for r in organic_results[:10] if r.get("domain")]

        featured_snippet_domain = next(
            (r["domain"] for r in organic_results if r.get("is_featured_snippet")),
            None,
        )

        # ── Visibilidad del cliente (opcional) ────────────────────────────────
        target_visibility = None
        if target_domain:
            target_norm = target_domain.replace("www.", "").lower()
            target_match = next(
                (
                    r for r in organic_results
                    if (r.get("domain") or "").replace("www.", "").lower() == target_norm
                ),
                None,
            )
            target_visibility = {
                "domain": target_domain,
                "found": target_match is not None,
                "position": target_match["rank_absolute"] if target_match else None,
                "url": target_match["url"] if target_match else None,
                "in_top_3": bool(
                    target_match and target_match["rank_absolute"] and target_match["rank_absolute"] <= 3
                ),
                "in_top_10": bool(
                    target_match and target_match["rank_absolute"] and target_match["rank_absolute"] <= 10
                ),
                "is_featured_snippet": bool(
                    target_match and target_match.get("is_featured_snippet")
                ),
            }

        # ── Perspectives (foros, videos, redes que aparecen en SERP) ──────────
        perspectives = []
        if perspectives_item:
            for p in perspectives_item.get("items") or []:
                perspectives.append({
                    "title": p.get("title"),
                    "url": p.get("url"),
                    "domain": p.get("domain"),
                    "source": p.get("source"),
                    "date": p.get("date"),
                    "timestamp": p.get("timestamp"),
                })

        return {
            "keyword": result.get("keyword"),
            "se_domain": result.get("se_domain"),
            "location_code": result.get("location_code"),
            "language_code": result.get("language_code"),
            "datetime": result.get("datetime"),
            "check_url": result.get("check_url"),
            "total_results_google": result.get("se_results_count"),
            "items_count": result.get("items_count"),
            "organic_results_count": len(organic_items),
            "organic_results": organic_results,
            "average_position": average_position,
            "serp_features": serp_features,
            "serp_features_count": len(serp_features),
            "has_ai_overview": ai_overview_item is not None,
            "ai_overview": ai_overview,
            "ranking_distribution": ranking_distribution,
            "top_3_domains": top_3_domains,
            "top_10_domains": top_10_domains,
            "featured_snippet_domain": featured_snippet_domain,
            "target_visibility": target_visibility,
            "related_searches": (
                related_searches_item.get("items") if related_searches_item else []
            ) or [],
            "perspectives": perspectives,
            "perspectives_count": len(perspectives),
            "cost": task.get("cost"),
            "task_time": task.get("time"),
            "task_status_code": task.get("status_code"),
        }

    except (KeyError, IndexError, TypeError) as exc:
        return {"error": "parse_error", "detail": str(exc)}


# ═══════════════════════════════════════════════════════════════════════════════
# DATAFORSEO LABS — Related Keywords
# ═══════════════════════════════════════════════════════════════════════════════

def get_related_keywords(
    keyword: str,
    location_code: int = 2170,
    language_code: str = "es",
    depth: int = 3,                          # 0 a 4 — qué tan lejos del seed
    limit: int = 100,                        # máx 1000
    include_seed_keyword: bool = False,
    include_serp_info: bool = False,
    include_clickstream_data: bool = False,
    ignore_synonyms: bool = False,
    replace_with_core_keyword: bool = False,
) -> dict:
    """
    Keywords relacionadas a un seed con métricas completas de SEO/PPC.

    Args:
        keyword: keyword semilla.
        depth: profundidad del árbol de relación (3 = hasta 3 niveles).
        limit: máximo de keywords a retornar (hasta 1000).

    Returns:
        dict con lista de keywords + agregaciones para KPIs del dashboard.
    """
    response = httpx.post(
        url=f"{_BASE_URL}/dataforseo_labs/google/related_keywords/live",
        headers=_headers(),
        json=[{
            "keyword": keyword,
            "location_code": location_code,
            "language_code": language_code,
            "depth": depth,
            "limit": limit,
            "include_seed_keyword": include_seed_keyword,
            "include_serp_info": include_serp_info,
            "include_clickstream_data": include_clickstream_data,
            "ignore_synonyms": ignore_synonyms,
            "replace_with_core_keyword": replace_with_core_keyword,
        }],
        timeout=60.0,
    )
    response.raise_for_status()
    return _parse_related_keywords(response.json())


def _parse_related_keywords(raw: dict) -> dict:
    try:
        task = raw["tasks"][0]
        if task.get("status_code") != 20000:
            return {
                "error": "task_failed",
                "status_message": task.get("status_message"),
                "status_code": task.get("status_code"),
            }

        result = task["result"][0]
        items = result.get("items") or []

        # ── Normalizar cada keyword ───────────────────────────────────────────
        keywords = []
        for item in items:
            kd = item.get("keyword_data") or {}
            ki = kd.get("keyword_info") or {}
            kp = kd.get("keyword_properties") or {}
            si = kd.get("search_intent_info") or {}
            sp = kd.get("serp_info") or {}
            bl = kd.get("avg_backlinks_info") or {}

            keywords.append({
                "keyword": kd.get("keyword"),
                "depth": item.get("depth"),
                "search_volume": ki.get("search_volume"),
                "competition": ki.get("competition"),
                "competition_level": ki.get("competition_level"),
                "cpc": ki.get("cpc"),
                "low_top_of_page_bid": ki.get("low_top_of_page_bid"),
                "high_top_of_page_bid": ki.get("high_top_of_page_bid"),
                "categories": ki.get("categories") or [],
                "monthly_searches": ki.get("monthly_searches") or [],
                "search_volume_trend": ki.get("search_volume_trend") or {},
                "keyword_difficulty": kp.get("keyword_difficulty"),
                "main_intent": si.get("main_intent"),
                "foreign_intent": si.get("foreign_intent") or [],
                "serp_features": sp.get("serp_item_types") or [],
                "se_results_count": sp.get("se_results_count"),
                "check_url": sp.get("check_url"),
                "avg_backlinks": bl.get("backlinks"),
                "avg_referring_domains": bl.get("referring_domains"),
                "avg_domain_rank": bl.get("rank"),
                "related_keywords_sub": item.get("related_keywords") or [],
            })

        # ── Agregaciones para KPIs ────────────────────────────────────────────
        volumes = [k["search_volume"] for k in keywords if k["search_volume"]]
        cpcs = [k["cpc"] for k in keywords if k["cpc"]]
        difficulties = [
            k["keyword_difficulty"] for k in keywords
            if k["keyword_difficulty"] is not None
        ]

        intent_dist = Counter(k["main_intent"] for k in keywords if k["main_intent"])
        comp_dist = Counter(k["competition_level"] for k in keywords if k["competition_level"])
        depth_dist = Counter(k["depth"] for k in keywords if k["depth"] is not None)

        # Difficulty buckets
        diff_buckets = {"easy": 0, "medium": 0, "hard": 0, "very_hard": 0}
        for d in difficulties:
            if d <= 30:
                diff_buckets["easy"] += 1
            elif d <= 50:
                diff_buckets["medium"] += 1
            elif d <= 70:
                diff_buckets["hard"] += 1
            else:
                diff_buckets["very_hard"] += 1

        # Top categorías (Google Ads category IDs)
        all_categories = []
        for k in keywords:
            all_categories.extend(k["categories"] or [])
        top_categories = [
            {"category_id": cat, "count": count}
            for cat, count in Counter(all_categories).most_common(10)
        ]

        # Top keywords por volumen
        top_by_volume = sorted(
            [k for k in keywords if k["search_volume"]],
            key=lambda x: x["search_volume"],
            reverse=True,
        )[:10]

        # Low-hanging fruit: difficulty <= 40 y volumen >= 100
        low_hanging = sorted(
            [
                k for k in keywords
                if k["search_volume"] and k["keyword_difficulty"] is not None
                and k["keyword_difficulty"] <= 40 and k["search_volume"] >= 100
            ],
            key=lambda x: x["search_volume"] / (x["keyword_difficulty"] + 1),
            reverse=True,
        )[:10]

        # Volumen mensual agregado (suma de todos los keywords mes a mes)
        monthly_agg: dict[str, int] = {}
        for k in keywords:
            for m in k["monthly_searches"]:
                key = f"{m['year']}-{m['month']:02d}"
                monthly_agg[key] = monthly_agg.get(key, 0) + (m.get("search_volume") or 0)
        monthly_aggregated = [
            {"year_month": k, "search_volume": v}
            for k, v in sorted(monthly_agg.items())
        ]

        # Tráfico estimado si rankearas #1 en todas (CTR ~30%)
        estimated_traffic_value = round(
            sum(
                (k["search_volume"] or 0) * (k["cpc"] or 0) * 0.3
                for k in keywords
            ),
            2,
        )

        return {
            "seed_keyword": result.get("seed_keyword"),
            "seed_keyword_data": result.get("seed_keyword_data"),
            "location_code": result.get("location_code"),
            "language_code": result.get("language_code"),
            "total_count": result.get("total_count"),
            "items_count": result.get("items_count"),

            # Tabla principal
            "keywords": keywords,

            # KPIs
            "total_search_volume": sum(volumes),
            "avg_search_volume": int(sum(volumes) / len(volumes)) if volumes else 0,
            "avg_cpc": round(sum(cpcs) / len(cpcs), 2) if cpcs else 0,
            "max_cpc": max(cpcs) if cpcs else 0,
            "avg_difficulty": round(sum(difficulties) / len(difficulties), 1) if difficulties else 0,
            "estimated_traffic_value_usd": estimated_traffic_value,

            # Distribuciones
            "competition_distribution": dict(comp_dist),
            "intent_distribution": dict(intent_dist),
            "depth_distribution": dict(depth_dist),
            "difficulty_buckets": diff_buckets,

            # Top lists
            "top_categories": top_categories,
            "top_keywords_by_volume": top_by_volume,
            "low_hanging_fruit": low_hanging,
            "monthly_aggregated": monthly_aggregated,

            # Operacional
            "cost": task.get("cost"),
            "task_time": task.get("time"),
            "task_status_code": task.get("status_code"),
        }

    except (KeyError, IndexError, TypeError) as exc:
        return {"error": "parse_error", "detail": str(exc)}


# ═══════════════════════════════════════════════════════════════════════════════
# KEYWORD DATA — Google Ads Search Volume
# ═══════════════════════════════════════════════════════════════════════════════

def get_search_volume(
    keywords: list[str],
    location_code: int | None = None,
    language_code: str | None = None,
    sort_by: str = "relevance",       # relevance | search_volume | competition_index | cpc
    search_partners: bool = False,
    date_from: str | None = None,     # YYYY-MM-DD para volumen histórico
    date_to: str | None = None,
) -> dict:
    """
    Volumen exacto de Google Ads para una lista de keywords (hasta 1000).

    Datos directos de Google Ads, no estimaciones. location_code y language_code
    son opcionales; sin ellos retorna volumen global.

    Returns:
        dict con métricas por keyword + agregaciones para KPIs.
    """
    payload: dict = {
        "keywords": keywords,
        "sort_by": sort_by,
        "search_partners": search_partners,
    }
    if location_code is not None:
        payload["location_code"] = location_code
    if language_code is not None:
        payload["language_code"] = language_code
    if date_from:
        payload["date_from"] = date_from
    if date_to:
        payload["date_to"] = date_to

    response = httpx.post(
        url=f"{_BASE_URL}/keywords_data/google_ads/search_volume/live",
        headers=_headers(),
        json=[payload],
        timeout=60.0,
    )
    response.raise_for_status()
    return _parse_search_volume(response.json())


def _parse_search_volume(raw: dict) -> dict:
    try:
        task = raw["tasks"][0]
        if task.get("status_code") != 20000:
            return {
                "error": "task_failed",
                "status_message": task.get("status_message"),
                "status_code": task.get("status_code"),
            }

        # En este endpoint, result es una lista plana de keywords (no anidada)
        results = task.get("result") or []

        keywords = [
            {
                "keyword": r.get("keyword"),
                "search_volume": r.get("search_volume"),
                "competition": r.get("competition"),
                "competition_index": r.get("competition_index"),
                "cpc": r.get("cpc"),
                "low_top_of_page_bid": r.get("low_top_of_page_bid"),
                "high_top_of_page_bid": r.get("high_top_of_page_bid"),
                "monthly_searches": r.get("monthly_searches") or [],
                "spell": r.get("spell"),
                "location_code": r.get("location_code"),
                "language_code": r.get("language_code"),
            }
            for r in results
        ]

        # ── Agregaciones ──────────────────────────────────────────────────────
        volumes = [k["search_volume"] for k in keywords if k["search_volume"]]
        cpcs = [k["cpc"] for k in keywords if k["cpc"]]

        comp_dist = Counter(k["competition"] for k in keywords if k["competition"])

        # Top by volume / CPC
        top_by_volume = sorted(
            [k for k in keywords if k["search_volume"]],
            key=lambda x: x["search_volume"],
            reverse=True,
        )[:10]
        top_by_cpc = sorted(
            [k for k in keywords if k["cpc"]],
            key=lambda x: x["cpc"],
            reverse=True,
        )[:10]

        # Volumen mensual agregado para gráfico de tendencia global
        monthly_agg: dict[str, int] = {}
        for k in keywords:
            for m in k["monthly_searches"]:
                key = f"{m['year']}-{m['month']:02d}"
                monthly_agg[key] = monthly_agg.get(key, 0) + (m.get("search_volume") or 0)
        monthly_aggregated = [
            {"year_month": k, "search_volume": v}
            for k, v in sorted(monthly_agg.items())
        ]

        # Costo PPC estimado (1 click por keyword al CPC)
        total_ppc_cost_estimate = round(sum(k["cpc"] or 0 for k in keywords), 2)

        # Detección de estacionalidad: keyword con mayor variación mes a mes
        seasonality_scores = []
        for k in keywords:
            ms = [m.get("search_volume", 0) or 0 for m in k["monthly_searches"]]
            if len(ms) >= 6 and max(ms) > 0:
                variation = (max(ms) - min(ms)) / max(ms)
                seasonality_scores.append({
                    "keyword": k["keyword"],
                    "variation": round(variation, 2),
                    "peak_volume": max(ms),
                    "trough_volume": min(ms),
                })
        seasonality_scores.sort(key=lambda x: x["variation"], reverse=True)

        return {
            "keywords": keywords,
            "keywords_count": len(keywords),

            # KPIs
            "total_search_volume": sum(volumes),
            "avg_search_volume": int(sum(volumes) / len(volumes)) if volumes else 0,
            "avg_cpc": round(sum(cpcs) / len(cpcs), 2) if cpcs else 0,
            "max_cpc": max(cpcs) if cpcs else 0,
            "min_cpc": min(cpcs) if cpcs else 0,
            "total_ppc_cost_estimate_usd": total_ppc_cost_estimate,

            # Distribuciones
            "competition_distribution": dict(comp_dist),

            # Top lists
            "top_keywords_by_volume": top_by_volume,
            "top_keywords_by_cpc": top_by_cpc,

            # Tendencias agregadas
            "monthly_aggregated": monthly_aggregated,
            "most_seasonal_keywords": seasonality_scores[:5],

            # Operacional
            "cost": task.get("cost"),
            "task_time": task.get("time"),
            "task_status_code": task.get("status_code"),
        }

    except (KeyError, IndexError, TypeError) as exc:
        return {"error": "parse_error", "detail": str(exc)}