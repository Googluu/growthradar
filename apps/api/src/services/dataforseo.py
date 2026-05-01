"""
DataForSEO service — capa de inteligencia para Growth Radar.

Endpoints integrados:
  - on_page/instant_pages                                    → auditoría on-page (~7s)
  - dataforseo_labs/google/domain_rank_overview/live         → autoridad de dominio
  - serp/google/organic/live/advanced                        → SERP en vivo (~2s)
  - dataforseo_labs/google/related_keywords/live             → keyword research (~0.4s)
  - keywords_data/google_ads/search_volume/live              → volumen Google Ads exacto
  - dataforseo_labs/categories                               → taxonomía Labs (gratis, una vez)
  - business_data/google/my_business_info/live               → perfil GMB del cliente (~1s)
  - business_data/google/reviews/live                        → reseñas Google (~3s)
  - business_data/business_listings/search/live              → discovery de prospectos (~5s)
  - business_data/business_listings/categories               → taxonomía de negocios (gratis)

Cada parser devuelve campos normalizados listos para alimentar el dashboard.
El contrato de error es uniforme: dict con "error" cuando algo falla.

Docs: https://docs.dataforseo.com/v3/
"""

from collections import Counter

import httpx

from src.config import settings

_BASE_URL = "https://api.dataforseo.com/v3"

# Pesos del seo_score — suman 100
_WEIGHTS = {
    "is_https":              15,
    "has_meta_title":        15,
    "has_meta_description":  15,
    "has_h1":                15,
    "has_sitemap":           10,
    "has_robots_txt":        10,
    "title_length_ok":       10,
    "images_alt_ok":         10,
}

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

def get_onpage_data(url: str, timeout: float = 30.0) -> dict:
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

        item = task["result"][0]["items"][0]
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
        images_without_alt = item.get("images_without_alt_count", 0)

        issues = [
            {"check": name, "label": _ONPAGE_CRITICAL_ISSUES[name], "severity": "critical"}
            for name in _ONPAGE_CRITICAL_ISSUES
            if checks.get(name) is True
        ]
        passing = [
            {"check": name, "label": _ONPAGE_POSITIVE_CHECKS[name]}
            for name in _ONPAGE_POSITIVE_CHECKS
            if checks.get(name) is True
        ]

        relevant_checks = (
            len(_ONPAGE_CRITICAL_ISSUES) + len(_ONPAGE_POSITIVE_CHECKS)
        )
        health_score = round(
            ((len(_ONPAGE_CRITICAL_ISSUES) - len(issues)) + len(passing))
            / relevant_checks * 100,
            1,
        )

        return {
            # Legacy (consumido por calculate_seo_score)
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

            "url": item.get("url"),
            "status_code": item.get("status_code"),
            "fetch_time": item.get("fetch_time"),
            "media_type": item.get("media_type"),
            "server": item.get("server"),
            "content_encoding": item.get("content_encoding"),
            "click_depth": item.get("click_depth"),

            "health": {
                "onpage_score": item.get("onpage_score", 0),
                "computed_health_score": health_score,
                "issues_count": len(issues),
                "issues_critical_count": len(issues),
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

            "cost": task.get("cost"),
            "task_time": task.get("time"),
            "task_status_code": task.get("status_code"),
            "raw_checks": checks,
        }

    except (KeyError, IndexError, TypeError) as exc:
        return {"error": "parse_error", "detail": str(exc)}


# ═══════════════════════════════════════════════════════════════════════════════
# DOMAIN RANK OVERVIEW
# ═══════════════════════════════════════════════════════════════════════════════

def get_domain_rank(domain: str) -> dict:
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

    return sum(_WEIGHTS[k] for k, ok in signals.items() if ok)


# ═══════════════════════════════════════════════════════════════════════════════
# SERP — Google Organic Live Advanced
# ═══════════════════════════════════════════════════════════════════════════════

def get_serp_data(
    keyword: str,
    location_code: int = 2170,
    language_code: str = "es",
    device: str = "desktop",
    os_name: str = "windows",
    depth: int = 10,
    target_domain: str | None = None,
) -> dict:
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
        ai_overview_item = next((i for i in items if i.get("type") == "ai_overview"), None)
        related_searches_item = next((i for i in items if i.get("type") == "related_searches"), None)
        perspectives_item = next((i for i in items if i.get("type") == "perspectives"), None)

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

        serp_features = sorted({
            i.get("type") for i in items
            if i.get("type") and i.get("type") != "organic"
        })

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
            (r["domain"] for r in organic_results if r.get("is_featured_snippet")), None
        )

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
                "in_top_3": bool(target_match and target_match["rank_absolute"] and target_match["rank_absolute"] <= 3),
                "in_top_10": bool(target_match and target_match["rank_absolute"] and target_match["rank_absolute"] <= 10),
                "is_featured_snippet": bool(target_match and target_match.get("is_featured_snippet")),
            }

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
    depth: int = 3,
    limit: int = 100,
    include_seed_keyword: bool = False,
    include_serp_info: bool = False,
    include_clickstream_data: bool = False,
    ignore_synonyms: bool = False,
    replace_with_core_keyword: bool = False,
) -> dict:
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

        volumes = [k["search_volume"] for k in keywords if k["search_volume"]]
        cpcs = [k["cpc"] for k in keywords if k["cpc"]]
        difficulties = [k["keyword_difficulty"] for k in keywords if k["keyword_difficulty"] is not None]

        intent_dist = Counter(k["main_intent"] for k in keywords if k["main_intent"])
        comp_dist = Counter(k["competition_level"] for k in keywords if k["competition_level"])
        depth_dist = Counter(k["depth"] for k in keywords if k["depth"] is not None)

        diff_buckets = {"easy": 0, "medium": 0, "hard": 0, "very_hard": 0}
        for d in difficulties:
            if d <= 30:    diff_buckets["easy"] += 1
            elif d <= 50:  diff_buckets["medium"] += 1
            elif d <= 70:  diff_buckets["hard"] += 1
            else:          diff_buckets["very_hard"] += 1

        all_categories = []
        for k in keywords:
            all_categories.extend(k["categories"] or [])
        top_categories = [
            {"category_id": cat, "count": count}
            for cat, count in Counter(all_categories).most_common(10)
        ]

        top_by_volume = sorted(
            [k for k in keywords if k["search_volume"]],
            key=lambda x: x["search_volume"], reverse=True,
        )[:10]

        low_hanging = sorted(
            [
                k for k in keywords
                if k["search_volume"] and k["keyword_difficulty"] is not None
                and k["keyword_difficulty"] <= 40 and k["search_volume"] >= 100
            ],
            key=lambda x: x["search_volume"] / (x["keyword_difficulty"] + 1),
            reverse=True,
        )[:10]

        monthly_agg: dict[str, int] = {}
        for k in keywords:
            for m in k["monthly_searches"]:
                key = f"{m['year']}-{m['month']:02d}"
                monthly_agg[key] = monthly_agg.get(key, 0) + (m.get("search_volume") or 0)
        monthly_aggregated = [
            {"year_month": k, "search_volume": v}
            for k, v in sorted(monthly_agg.items())
        ]

        estimated_traffic_value = round(
            sum((k["search_volume"] or 0) * (k["cpc"] or 0) * 0.3 for k in keywords),
            2,
        )

        return {
            "seed_keyword": result.get("seed_keyword"),
            "seed_keyword_data": result.get("seed_keyword_data"),
            "location_code": result.get("location_code"),
            "language_code": result.get("language_code"),
            "total_count": result.get("total_count"),
            "items_count": result.get("items_count"),
            "keywords": keywords,
            "total_search_volume": sum(volumes),
            "avg_search_volume": int(sum(volumes) / len(volumes)) if volumes else 0,
            "avg_cpc": round(sum(cpcs) / len(cpcs), 2) if cpcs else 0,
            "max_cpc": max(cpcs) if cpcs else 0,
            "avg_difficulty": round(sum(difficulties) / len(difficulties), 1) if difficulties else 0,
            "estimated_traffic_value_usd": estimated_traffic_value,
            "competition_distribution": dict(comp_dist),
            "intent_distribution": dict(intent_dist),
            "depth_distribution": dict(depth_dist),
            "difficulty_buckets": diff_buckets,
            "top_categories": top_categories,
            "top_keywords_by_volume": top_by_volume,
            "low_hanging_fruit": low_hanging,
            "monthly_aggregated": monthly_aggregated,
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
    sort_by: str = "relevance",
    search_partners: bool = False,
    date_from: str | None = None,
    date_to: str | None = None,
) -> dict:
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

        volumes = [k["search_volume"] for k in keywords if k["search_volume"]]
        cpcs = [k["cpc"] for k in keywords if k["cpc"]]

        comp_dist = Counter(k["competition"] for k in keywords if k["competition"])

        top_by_volume = sorted(
            [k for k in keywords if k["search_volume"]],
            key=lambda x: x["search_volume"], reverse=True,
        )[:10]
        top_by_cpc = sorted(
            [k for k in keywords if k["cpc"]],
            key=lambda x: x["cpc"], reverse=True,
        )[:10]

        monthly_agg: dict[str, int] = {}
        for k in keywords:
            for m in k["monthly_searches"]:
                key = f"{m['year']}-{m['month']:02d}"
                monthly_agg[key] = monthly_agg.get(key, 0) + (m.get("search_volume") or 0)
        monthly_aggregated = [
            {"year_month": k, "search_volume": v}
            for k, v in sorted(monthly_agg.items())
        ]

        total_ppc_cost_estimate = round(sum(k["cpc"] or 0 for k in keywords), 2)

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
            "total_search_volume": sum(volumes),
            "avg_search_volume": int(sum(volumes) / len(volumes)) if volumes else 0,
            "avg_cpc": round(sum(cpcs) / len(cpcs), 2) if cpcs else 0,
            "max_cpc": max(cpcs) if cpcs else 0,
            "min_cpc": min(cpcs) if cpcs else 0,
            "total_ppc_cost_estimate_usd": total_ppc_cost_estimate,
            "competition_distribution": dict(comp_dist),
            "top_keywords_by_volume": top_by_volume,
            "top_keywords_by_cpc": top_by_cpc,
            "monthly_aggregated": monthly_aggregated,
            "most_seasonal_keywords": seasonality_scores[:5],
            "cost": task.get("cost"),
            "task_time": task.get("time"),
            "task_status_code": task.get("status_code"),
        }

    except (KeyError, IndexError, TypeError) as exc:
        return {"error": "parse_error", "detail": str(exc)}


# ═══════════════════════════════════════════════════════════════════════════════
# DATAFORSEO LABS — Categories (taxonomy bootstrap)
# ═══════════════════════════════════════════════════════════════════════════════

def get_labs_categories() -> dict:
    """
    Lista completa de categorías de DataForSEO Labs (~3180 nodos).

    Llamada GRATIS y estable. Es la taxonomía que mapea los IDs numéricos
    devueltos por get_related_keywords (campo `categories`) a nombres legibles
    como "Apparel" o "Online Communities". Cachéala en tu DB una vez y
    refresca cada par de meses.

    Returns:
        dict con la lista plana, lookup por ID y árbol jerárquico.
    """
    response = httpx.get(
        url=f"{_BASE_URL}/dataforseo_labs/categories",
        headers=_headers(),
        timeout=30.0,
    )
    response.raise_for_status()
    return _parse_categories(response.json())


def _parse_categories(raw: dict) -> dict:
    try:
        task = raw["tasks"][0]
        if task.get("status_code") != 20000:
            return {
                "error": "task_failed",
                "status_message": task.get("status_message"),
                "status_code": task.get("status_code"),
            }

        items = task.get("result") or []

        # Lookup directo: ID → datos
        by_id: dict[int, dict] = {
            item["category_code"]: {
                "name": item.get("category_name"),
                "parent_id": item.get("category_code_parent"),
            }
            for item in items
            if item.get("category_code") is not None
        }

        # Construir el árbol jerárquico
        children_map: dict[int | None, list[dict]] = {}
        for item in items:
            parent_id = item.get("category_code_parent")
            children_map.setdefault(parent_id, []).append(item)

        def _build_node(item: dict) -> dict:
            return {
                "category_code": item.get("category_code"),
                "category_name": item.get("category_name"),
                "children": [
                    _build_node(c)
                    for c in children_map.get(item.get("category_code"), [])
                ],
            }

        roots = children_map.get(None, [])
        tree = [_build_node(r) for r in roots]

        return {
            "categories_flat": items,
            "categories_by_id": by_id,
            "tree": tree,
            "total_count": len(items),
            "roots_count": len(roots),
            "cost": task.get("cost", 0),
            "task_time": task.get("time"),
            "task_status_code": task.get("status_code"),
        }

    except (KeyError, IndexError, TypeError) as exc:
        return {"error": "parse_error", "detail": str(exc)}


def resolve_category_names(
    category_ids: list[int],
    categories_by_id: dict,
) -> list[dict]:
    """
    Helper para mapear IDs a nombres legibles en el dashboard.

    Ejemplo de uso:
        cats = get_labs_categories()  # cachear en DB
        kw_data = get_related_keywords("seo")
        for kw in kw_data["keywords"]:
            named = resolve_category_names(kw["categories"], cats["categories_by_id"])
    """
    return [
        {
            "category_id": cid,
            "name": (categories_by_id.get(cid) or {}).get("name") or f"Cat {cid}",
        }
        for cid in category_ids
    ]


# ═══════════════════════════════════════════════════════════════════════════════
# BUSINESS DATA — Helpers compartidos
# ═══════════════════════════════════════════════════════════════════════════════
#
# Los endpoints my_business_info y business_listings/search devuelven items
# con la misma estructura de "negocio Google". Centralizamos la normalización.
# ═══════════════════════════════════════════════════════════════════════════════

# Pesos de cada campo en el cálculo de profile_completeness (suman 100)
_PROFILE_COMPLETENESS_CHECKS: list[tuple[str, int, str]] = [
    # (nombre_campo, peso, etiqueta_es)
    ("description",            10, "Descripción del negocio"),
    ("website",                15, "Sitio web vinculado"),
    ("logo",                   10, "Logo subido"),
    ("main_image",              5, "Imagen principal"),
    ("phone",                  10, "Teléfono"),
    ("photos",                 10, "5+ fotos"),
    ("claimed",                15, "Listing reclamado"),
    ("attributes",              5, "Atributos (servicios/opciones)"),
    ("place_topics",            5, "Temas mencionados en reviews"),
    ("rating",                 10, "10+ reseñas"),
    ("additional_categories",   5, "Categorías secundarias"),
]


def _normalize_operating_status(work_time: dict | None) -> str:
    """
    Normaliza el campo work_time → estado operativo.

    Returns:
        'open' | 'closed_permanently' | 'closed_temporarily' | 'unknown'
    """
    if not work_time:
        return "unknown"
    raw = (work_time.get("work_hours") or {}).get("current_status")
    if not raw:
        return "open"  # asumimos abierto si Google no flagea otra cosa
    if raw in ("closed_forever", "permanently_closed"):
        return "closed_permanently"
    if raw == "closed_temporarily":
        return "closed_temporarily"
    if raw in ("open", "open_now", "opens_soon", "closes_soon"):
        return "open"
    return raw


def _compute_profile_completeness(item: dict) -> dict:
    """
    Evalúa qué tan completo está el perfil de Google Business.
    Score 0-100 + listas de campos missing/present con etiquetas en español.
    """
    rating = item.get("rating") or {}
    attrs = item.get("attributes") or {}
    available_attrs = attrs.get("available_attributes")

    field_checks = {
        "description":            bool(item.get("description")),
        "website":                bool(item.get("url") or item.get("domain")),
        "logo":                   bool(item.get("logo")),
        "main_image":             bool(item.get("main_image")),
        "phone":                  bool(item.get("phone")),
        "photos":                 (item.get("total_photos") or 0) >= 5,
        "claimed":                item.get("is_claimed") is True,
        "attributes":             bool(available_attrs),
        "place_topics":           bool(item.get("place_topics")),
        "rating":                 (rating.get("votes_count") or 0) >= 10,
        "additional_categories":  bool(item.get("additional_categories")),
    }

    score = 0
    missing = []
    present = []
    for field_name, weight, label in _PROFILE_COMPLETENESS_CHECKS:
        if field_checks.get(field_name):
            score += weight
            present.append({"field": field_name, "label": label, "weight": weight})
        else:
            missing.append({"field": field_name, "label": label, "weight": weight})

    return {
        "score": score,
        "missing": missing,
        "present": present,
    }


def _compute_opportunity_score(item: dict, completeness: dict) -> dict:
    """
    Score 0-100 indicando qué tan buen prospecto es este negocio para
    Growth Radar. Filosofía:
      - Negocio activo (con reviews) + perfil incompleto = alta oportunidad
      - Negocio cerrado = sin oportunidad
      - Negocio sin tracción (pocas reviews) = baja oportunidad
      - Rating en sweet spot 3.0-4.5 = motivado para mejorar
    """
    operating = _normalize_operating_status(item.get("work_time"))
    if operating == "closed_permanently":
        return {"score": 0, "reason": "business_closed", "weakness_signals": []}

    rating_obj = item.get("rating") or {}
    review_count = rating_obj.get("votes_count") or 0
    rating_value = rating_obj.get("value") or 0

    if review_count < 5:
        return {"score": 10, "reason": "no_traction", "weakness_signals": []}

    base = 100 - completeness["score"]

    if 3.0 <= rating_value <= 4.5:
        base += 10
    if review_count >= 30:
        base += 5
    if operating == "closed_temporarily":
        base -= 30

    return {
        "score": max(0, min(100, base)),
        "weakness_signals": [m["field"] for m in completeness["missing"]],
    }


def _normalize_business_item(item: dict, *, with_opportunity: bool = False) -> dict:
    """
    Normaliza un item Google Business Data a estructura plana y consistente.
    Compartido por my_business_info y business_listings/search.

    Args:
        with_opportunity: si True, incluye opportunity_score (para discovery).
    """
    address_info = item.get("address_info") or {}
    rating = item.get("rating") or {}
    rating_distribution = item.get("rating_distribution") or {}
    place_topics_raw = item.get("place_topics") or {}
    attributes = item.get("attributes") or {}

    # Computar % de cada calificación 1-5
    total_votes = sum(rating_distribution.values()) if rating_distribution else 0
    rating_distribution_pct = {}
    if total_votes > 0:
        rating_distribution_pct = {
            star: round(count / total_votes * 100, 1)
            for star, count in rating_distribution.items()
        }

    # Place topics → lista ordenada por menciones desc
    place_topics = sorted(
        [{"topic": topic, "mentions": count} for topic, count in place_topics_raw.items()],
        key=lambda x: x["mentions"],
        reverse=True,
    )

    name = item.get("title")
    original_name = item.get("original_title")
    is_renamed = bool(original_name and original_name != name)

    completeness = _compute_profile_completeness(item)
    operating_status = _normalize_operating_status(item.get("work_time"))

    normalized = {
        "name": name,
        "original_name": original_name if is_renamed else None,
        "is_renamed": is_renamed,
        "description": item.get("description"),

        "category": {
            "primary": item.get("category"),
            "ids": item.get("category_ids") or [],
            "additional": item.get("additional_categories") or [],
        },

        "ids": {
            "cid": item.get("cid"),
            "place_id": item.get("place_id"),
            "feature_id": item.get("feature_id"),
        },

        "contact": {
            "phone": item.get("phone"),
            "website_url": item.get("url"),
            "domain": item.get("domain"),
            "contact_url": item.get("contact_url"),
            "book_online_url": item.get("book_online_url"),
            "contributor_url": item.get("contributor_url"),
        },

        "location": {
            "address": item.get("address"),
            "borough": address_info.get("borough"),
            "street": address_info.get("address"),
            "city": address_info.get("city"),
            "zip": address_info.get("zip"),
            "region": address_info.get("region"),
            "country_code": address_info.get("country_code"),
            "latitude": item.get("latitude"),
            "longitude": item.get("longitude"),
        },

        "media": {
            "logo_url": item.get("logo"),
            "main_image_url": item.get("main_image"),
            "total_photos": item.get("total_photos") or 0,
        },

        "status": {
            "is_claimed": item.get("is_claimed", False),
            "operating_status": operating_status,
            "current_status_raw": (
                (item.get("work_time") or {}).get("work_hours", {}).get("current_status")
            ),
            "price_level": item.get("price_level"),
            "is_directory_item": item.get("is_directory_item", False),
        },

        "reviews": {
            "rating": {
                "value": rating.get("value"),
                "votes_count": rating.get("votes_count") or 0,
                "type": rating.get("rating_type"),
                "max": rating.get("rating_max"),
            },
            "rating_distribution": rating_distribution,
            "rating_distribution_pct": rating_distribution_pct,
            "place_topics": place_topics,
            "questions_and_answers_count": item.get("questions_and_answers_count"),
        },

        "attributes": {
            "available": attributes.get("available_attributes"),
            "unavailable": attributes.get("unavailable_attributes"),
        },

        "popular_times": item.get("popular_times"),
        "rank_absolute": item.get("rank_absolute"),
        "profile_completeness": completeness,
    }

    if with_opportunity:
        normalized["opportunity_score"] = _compute_opportunity_score(item, completeness)

    return normalized


# ═══════════════════════════════════════════════════════════════════════════════
# BUSINESS DATA — Google My Business Info
# ═══════════════════════════════════════════════════════════════════════════════

def get_my_business_info(
    keyword: str,
    location_code: int = 2170,    # Colombia
    language_code: str = "es",
) -> dict:
    """
    Trae el perfil de Google Business del cliente.

    Args:
        keyword: identificador del negocio. Puede ser:
            - "cid:194604053573767737" (más preciso, recomendado)
            - texto libre tipo "Pizzeria Mario Bogotá"
        location_code: ubicación (2170=CO, 2484=MX, 2840=US).
        language_code: idioma de la respuesta.

    Returns:
        dict normalizado del negocio. Si no hay match, devuelve
        {"found": False, "keyword": ..., ...}. Incluye 'error' si la
        llamada o el parseo falla.
    """
    response = httpx.post(
        url=f"{_BASE_URL}/business_data/google/my_business_info/live",
        headers=_headers(),
        json=[{
            "keyword": keyword,
            "location_code": location_code,
            "language_code": language_code,
        }],
        timeout=30.0,
    )
    response.raise_for_status()
    return _parse_my_business_info(response.json())


def _parse_my_business_info(raw: dict) -> dict:
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

        base_meta = {
            "keyword": result.get("keyword"),
            "check_url": result.get("check_url"),
            "datetime": result.get("datetime"),
            "location_code": result.get("location_code"),
            "language_code": result.get("language_code"),
            "cost": task.get("cost"),
            "task_time": task.get("time"),
            "task_status_code": task.get("status_code"),
        }

        if not items:
            return {**base_meta, "found": False}

        normalized = _normalize_business_item(items[0], with_opportunity=False)
        return {**base_meta, "found": True, **normalized}

    except (KeyError, IndexError, TypeError) as exc:
        return {"error": "parse_error", "detail": str(exc)}


# ═══════════════════════════════════════════════════════════════════════════════
# BUSINESS DATA — Google Reviews
# ═══════════════════════════════════════════════════════════════════════════════

def get_google_reviews(
    keyword: str,
    location_code: int = 2170,
    language_code: str = "es",
    depth: int = 20,                  # cantidad de reviews (10/20/30/...)
    sort_by: str = "newest",          # newest | most_relevant | highest_rating | lowest_rating
) -> dict:
    """
    Trae las reseñas de Google del negocio.

    Útil para alimentar a Claude con contexto cualitativo de qué dicen los
    clientes — esto enriquece dramáticamente la calidad de las recomendaciones
    de Growth Radar.

    Costo aproximado: $0.0125 por 10 reviews.
    """
    response = httpx.post(
        url=f"{_BASE_URL}/business_data/google/reviews/live",
        headers=_headers(),
        json=[{
            "keyword": keyword,
            "location_code": location_code,
            "language_code": language_code,
            "depth": depth,
            "sort_by": sort_by,
        }],
        timeout=60.0,
    )
    response.raise_for_status()
    return _parse_google_reviews(response.json())


def _parse_google_reviews(raw: dict) -> dict:
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

        reviews = []
        for it in items:
            owner_answer = it.get("owner_answer")
            reviews.append({
                "author_name": it.get("profile_name") or it.get("author_title"),
                "author_image_url": it.get("profile_image_url"),
                "rating": (it.get("rating") or {}).get("value"),
                "review_text": it.get("review_text"),
                "review_highlights": it.get("review_highlights") or [],
                "timestamp": it.get("timestamp"),
                "datetime_iso": it.get("time_descriptor"),
                "review_url": it.get("review_url"),
                "owner_responded": bool(owner_answer),
                "owner_response": owner_answer,
                "reviews_count_by_author": it.get("reviews_count"),
                "photos_count_by_author": it.get("photos_count"),
                "local_guide": it.get("local_guide", False),
            })

        # Agregaciones para KPIs
        ratings = [r["rating"] for r in reviews if r["rating"] is not None]
        responded = [r for r in reviews if r["owner_responded"]]
        with_text = [r for r in reviews if r["review_text"]]

        rating_dist = Counter(int(r) for r in ratings)

        return {
            "keyword": result.get("keyword"),
            "check_url": result.get("check_url"),
            "datetime": result.get("datetime"),
            "items_count": result.get("items_count"),
            "total_count": result.get("total_count"),
            "reviews": reviews,

            # KPIs
            "avg_rating_in_sample": (
                round(sum(ratings) / len(ratings), 2) if ratings else None
            ),
            "owner_response_rate": (
                round(len(responded) / len(reviews) * 100, 1) if reviews else 0
            ),
            "reviews_with_text_count": len(with_text),
            "rating_distribution": dict(rating_dist),
            "negative_reviews": [
                r for r in reviews
                if r["rating"] is not None and r["rating"] <= 2
            ],
            "negative_reviews_count": sum(1 for r in ratings if r <= 2),

            "cost": task.get("cost"),
            "task_time": task.get("time"),
            "task_status_code": task.get("status_code"),
        }

    except (KeyError, IndexError, TypeError) as exc:
        return {"error": "parse_error", "detail": str(exc)}


# ═══════════════════════════════════════════════════════════════════════════════
# BUSINESS DATA — Business Listings Search (pilar "Descubre")
# ═══════════════════════════════════════════════════════════════════════════════

def get_business_listings_search(
    categories: list[str] | None = None,
    description: str | None = None,
    title: str | None = None,
    is_claimed: bool | None = None,
    location_coordinate: str | None = None,   # "lat,lng,radius_km" ej "4.71,-74.07,10"
    location_country: str | None = None,
    limit: int = 100,
    offset: int = 0,
    order_by: list[str] | None = None,
    filters: list | None = None,
) -> dict:
    """
    Búsqueda de negocios en la base de Business Listings de DataForSEO.

    Esta es la pieza que activa el pilar "Descubre" de Growth Radar:
    encuentra negocios en la categoría/zona del cliente, filtra los que
    tienen perfiles incompletos, y devuelve cada prospecto con un
    opportunity_score listo para rankear y atacar con outreach.

    Args:
        categories: lista de categorías ej ["italian_restaurant", "barbershop"].
            Usar IDs del endpoint business_listings/categories.
        description: keyword libre adicional, ej "pizza".
        is_claimed: filtrar por reclamado (True) o no reclamado (False).
            None = ambos.
        location_coordinate: "lat,lng,radius_km" para búsqueda geográfica.
        limit: máx 1000 por request.
        order_by: ej ["rating.value,desc"], ["business_listings.name,asc"].
        filters: ej [["rating.value", ">=", 3.5]].

    Costo aproximado: $0.05 por 100 listings retornados.
    """
    payload: dict = {"limit": limit, "offset": offset}
    if categories:
        payload["categories"] = categories
    if description:
        payload["description"] = description
    if title:
        payload["title"] = title
    if is_claimed is not None:
        payload["is_claimed"] = is_claimed
    if location_coordinate:
        payload["location_coordinate"] = location_coordinate
    if location_country:
        payload["location_country"] = location_country
    if order_by:
        payload["order_by"] = order_by
    if filters:
        payload["filters"] = filters

    response = httpx.post(
        url=f"{_BASE_URL}/business_data/business_listings/search/live",
        headers=_headers(),
        json=[payload],
        timeout=60.0,
    )
    response.raise_for_status()
    return _parse_business_listings_search(response.json())


def _parse_business_listings_search(raw: dict) -> dict:
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

        # Normalizar cada listing con opportunity_score incluido
        prospects = [_normalize_business_item(it, with_opportunity=True) for it in items]

        # Ordenar por opportunity_score desc para que los mejores prospectos
        # vengan primero en el dashboard de Descubre
        prospects.sort(
            key=lambda p: (p.get("opportunity_score") or {}).get("score", 0),
            reverse=True,
        )

        # Agregaciones útiles para el dashboard
        unclaimed_count = sum(
            1 for p in prospects if p["status"]["is_claimed"] is False
        )
        no_website_count = sum(
            1 for p in prospects if not p["contact"]["website_url"]
        )
        operating_dist = Counter(
            p["status"]["operating_status"] for p in prospects
        )
        category_dist = Counter(
            p["category"]["primary"] for p in prospects if p["category"]["primary"]
        )

        # Top 20 prospectos de alta oportunidad para el primer scroll del dashboard
        high_opportunity = [
            p for p in prospects
            if (p.get("opportunity_score") or {}).get("score", 0) >= 60
        ][:20]

        return {
            "items_count": result.get("items_count"),
            "total_count": result.get("total_count"),
            "offset": result.get("offset", 0),

            "prospects": prospects,
            "high_opportunity": high_opportunity,
            "high_opportunity_count": len(high_opportunity),

            # Métricas agregadas
            "unclaimed_count": unclaimed_count,
            "unclaimed_pct": (
                round(unclaimed_count / len(prospects) * 100, 1) if prospects else 0
            ),
            "no_website_count": no_website_count,
            "no_website_pct": (
                round(no_website_count / len(prospects) * 100, 1) if prospects else 0
            ),
            "operating_status_distribution": dict(operating_dist),
            "top_categories": [
                {"category": cat, "count": cnt}
                for cat, cnt in category_dist.most_common(10)
            ],

            "cost": task.get("cost"),
            "task_time": task.get("time"),
            "task_status_code": task.get("status_code"),
        }

    except (KeyError, IndexError, TypeError) as exc:
        return {"error": "parse_error", "detail": str(exc)}


# ═══════════════════════════════════════════════════════════════════════════════
# BUSINESS DATA — Business Listings Categories (taxonomía de negocios)
# ═══════════════════════════════════════════════════════════════════════════════

def get_business_listings_categories() -> dict:
    """
    Lista de categorías de negocios (gratis). Es la taxonomía que aceptan
    los filtros de business_listings/search/live.

    Devuelve strings tipo "italian_restaurant", "barbershop", etc.
    Cachear en DB. Refresca cada par de meses.
    """
    response = httpx.post(
        url=f"{_BASE_URL}/business_data/business_listings/categories",
        headers=_headers(),
        json=[],
        timeout=30.0,
    )
    response.raise_for_status()
    return _parse_business_listings_categories(response.json())


def _parse_business_listings_categories(raw: dict) -> dict:
    try:
        task = raw["tasks"][0]
        if task.get("status_code") != 20000:
            return {
                "error": "task_failed",
                "status_message": task.get("status_message"),
                "status_code": task.get("status_code"),
            }

        result = task.get("result") or []

        # La respuesta puede venir como lista de strings o lista de dicts.
        # Normalizamos a lista de strings para uso simple en filtros.
        categories: list[str] = []
        for entry in result:
            if isinstance(entry, str):
                categories.append(entry)
            elif isinstance(entry, dict):
                code = entry.get("category") or entry.get("name") or entry.get("category_code")
                if code:
                    categories.append(str(code))

        return {
            "categories": categories,
            "total_count": len(categories),
            "cost": task.get("cost", 0),
            "task_time": task.get("time"),
            "task_status_code": task.get("status_code"),
        }

    except (KeyError, IndexError, TypeError) as exc:
        return {"error": "parse_error", "detail": str(exc)}