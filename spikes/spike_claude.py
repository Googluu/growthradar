"""
Spike 3: Claude API — Generación de Recomendaciones
=====================================================
Objetivo: validar el prompt v1 de recomendaciones con datos simulados de una
auditoría real. Medir: calidad del output, tokens usados por llamada (costo),
y latencia.

Ejecutar:
    uv run python spike_claude.py

El prompt se carga desde packages/audit-engine/prompts/recommendations_v1.md
para mantenerlo bajo control de versiones separado del código.
"""

import json
import os
import time
from pathlib import Path
import anthropic
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.environ["ANTHROPIC_API_KEY"]

# Modelo a usar — claude-sonnet-4-6 es el punto óptimo calidad/costo para este caso
MODEL = "claude-sonnet-4-6"

# Ruta al prompt — relativa a la raíz del repo
# En producción, el Audit Engine lo cargará desde esta misma ruta
PROMPT_PATH = Path(__file__).parent.parent / "packages/audit-engine/prompts/recommendations_v1.md"

# ─── Datos simulados de auditoría ─────────────────────────────────────────────
# Representa una agencia de diseño web colombiana con problemas típicos de LATAM:
# buen rendimiento pero SEO y redes sociales débiles.
MOCK_AUDIT_DATA = {
    "company_name": "Diseños Modernos SAS",
    "company_domain": "disenosmodernos.com.co",
    "audit_date": "2026-04-15",
    "health_score": 47,
    "scores": {
        "performance_score": 72,
        "seo_score": 31,
        "social_score": 18,
        "reputation_score": 55,
    },
    "performance": {
        "source": "crux",
        "lcp_ms": 2890,
        "lcp_rating": "needs_improvement",
        "inp_ms": 145,
        "inp_rating": "good",
        "cls_score": 0.08,
        "cls_rating": "good",
        "fcp_ms": 1650,
        "fcp_rating": "good",
        "ttfb_ms": 920,
        "ttfb_rating": "needs_improvement",
        "note": "El sitio carga bien en desktop pero el LCP es lento — posiblemente por imágenes sin optimizar",
    },
    "seo": {
        "has_meta_title": True,
        "title": "Diseños Modernos - Agencia de Diseño Web",
        "title_length": 42,
        "has_meta_description": False,  # PROBLEMA: sin descripción
        "description": None,
        "h1_count": 0,         # PROBLEMA: sin H1
        "has_sitemap": False,  # PROBLEMA: sin sitemap
        "has_robots_txt": True,
        "is_https": True,
        "images_without_alt": 14,  # PROBLEMA: 14 imágenes sin texto alternativo
        "images_count": 22,
        "internal_links_count": 8,
        "onpage_score": 38,
        "organic_keywords_count": 3,   # Casi sin visibilidad orgánica
        "estimated_monthly_traffic": 45,
    },
    "social": {
        "instagram": {
            "found": True,
            "followers": 312,
            "last_post_days_ago": 67,   # PROBLEMA: sin publicar desde hace >2 meses
        },
        "facebook": {
            "found": False,   # PROBLEMA: sin Facebook
        },
        "linkedin": {
            "found": False,   # PROBLEMA: sin LinkedIn
        },
        "tiktok": {
            "found": False,
        },
    },
    "reputation": {
        "google_maps_found": True,
        "google_rating": 4.1,
        "review_count": 7,        # Muy pocas reseñas
        "responded_to_reviews": False,  # PROBLEMA: no responde reseñas
        "last_review_days_ago": 45,
    },
}


def load_prompt_template() -> str:
    """
    Carga el prompt desde el archivo de versión controlada.
    Si el archivo no existe, lanza un error claro — el prompt NO debe estar hardcodeado aquí.
    """
    if not PROMPT_PATH.exists():
        raise FileNotFoundError(
            f"Prompt no encontrado en: {PROMPT_PATH}\n"
            "Asegúrate de correr este script desde la raíz del repo."
        )
    return PROMPT_PATH.read_text(encoding="utf-8")


def extract_system_and_user_prompts(template: str) -> tuple[str, str]:
    """
    Parsea el archivo de prompt que tiene secciones ## SYSTEM PROMPT y ## USER PROMPT TEMPLATE.
    Retorna (system_prompt, user_prompt_template).
    """
    parts = template.split("## SYSTEM PROMPT")
    if len(parts) < 2:
        raise ValueError("El archivo de prompt no tiene sección ## SYSTEM PROMPT")

    after_system = parts[1].split("## USER PROMPT TEMPLATE")
    if len(after_system) < 2:
        raise ValueError("El archivo de prompt no tiene sección ## USER PROMPT TEMPLATE")

    system_prompt = after_system[0].strip()
    user_prompt_template = after_system[1].strip()

    return system_prompt, user_prompt_template


def build_user_prompt(template: str, company_name: str, company_domain: str, audit_data: dict) -> str:
    """Rellena el template con los datos reales de la auditoría."""
    return (
        template
        .replace("{company_name}", company_name)
        .replace("{company_domain}", company_domain)
        .replace("{audit_data_json}", json.dumps(audit_data, indent=2, ensure_ascii=False))
    )


def call_claude(system_prompt: str, user_prompt: str) -> dict:
    """
    Llama a Claude y retorna el response junto con métricas de uso.
    Usamos json mode implícito — le pedimos JSON en el prompt y parseamos la respuesta.
    """
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    start = time.time()

    message = client.messages.create(
        model=MODEL,
        max_tokens=2048,
        system=system_prompt,
        messages=[
            {"role": "user", "content": user_prompt}
        ],
    )

    latency_ms = round((time.time() - start) * 1000)

    raw_text = message.content[0].text

    # Intentar parsear como JSON — si falla, hay un problema con el prompt
    try:
        parsed_output = json.loads(raw_text)
        parse_success = True
    except json.JSONDecodeError as e:
        parsed_output = {"error": "json_parse_failed", "detail": str(e), "raw": raw_text}
        parse_success = False

    return {
        "output": parsed_output,
        "parse_success": parse_success,
        "usage": {
            "input_tokens": message.usage.input_tokens,
            "output_tokens": message.usage.output_tokens,
            "total_tokens": message.usage.input_tokens + message.usage.output_tokens,
            # Precios claude-sonnet-4-6: $3/M input, $15/M output (mayo 2026)
            "estimated_cost_usd": round(
                (message.usage.input_tokens / 1_000_000 * 3.0) +
                (message.usage.output_tokens / 1_000_000 * 15.0),
                6
            ),
        },
        "latency_ms": latency_ms,
        "model": MODEL,
    }


def run_spike():
    print("=" * 60)
    print("SPIKE 3: Claude API — Prompt de Recomendaciones v1")
    print("=" * 60)

    # 1. Cargar y parsear el prompt
    print(f"\n→ Cargando prompt desde: {PROMPT_PATH}")
    template = load_prompt_template()
    system_prompt, user_prompt_template = extract_system_and_user_prompts(template)
    print(f"  ✓ Prompt cargado ({len(template)} chars)")

    # 2. Construir el prompt con los datos de auditoría
    user_prompt = build_user_prompt(
        template=user_prompt_template,
        company_name=MOCK_AUDIT_DATA["company_name"],
        company_domain=MOCK_AUDIT_DATA["company_domain"],
        audit_data=MOCK_AUDIT_DATA,
    )

    # 3. Llamar a Claude
    print(f"\n→ Llamando a {MODEL}...")
    result = call_claude(system_prompt, user_prompt)

    # 4. Mostrar resultados
    print(f"\n  ✓ Latencia: {result['latency_ms']}ms")
    print(f"  ✓ Tokens: {result['usage']['input_tokens']} input + {result['usage']['output_tokens']} output = {result['usage']['total_tokens']} total")
    print(f"  ✓ Costo estimado por llamada: ${result['usage']['estimated_cost_usd']}")
    cost_100 = result['usage']['estimated_cost_usd'] * 100
    print(f"  ✓ Proyección 100 auditorías/mes: ${cost_100:.4f}")

    if not result["parse_success"]:
        print(f"\n  ✗ El output NO es JSON válido — revisar el prompt")
        print(f"  Raw output:\n{result['output'].get('raw', '')}")
    else:
        output = result["output"]
        print(f"\n  ✓ JSON válido. Estructura del output:")
        print(f"\n  RESUMEN EJECUTIVO:")
        print(f"  {output.get('executive_summary', 'N/A')}")

        print(f"\n  RECOMENDACIONES ({len(output.get('top_recommendations', []))}):")
        for rec in output.get("top_recommendations", []):
            type_label = "⚡ QUICK WIN" if rec.get("type") == "quick_win" else "🎯 ESTRATÉGICO"
            print(f"\n  [{rec['rank']}] {type_label} | {rec.get('impact','').upper()} IMPACTO")
            print(f"      Título: {rec.get('title')}")
            print(f"      Problema: {rec.get('problem')}")
            print(f"      Acción: {rec.get('action')}")

    # 5. Guardar output completo
    output_path = "outputs/claude_results.json"
    os.makedirs("outputs", exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"\n✓ Resultados guardados en spikes/{output_path}")
    print("\n--- CONCLUSIONES PARA ARQUITECTURA ---")
    print("1. El prompt se carga desde archivo — versión controlada y fácil de iterar")
    print("2. El costo por auditoría es muy bajo — escala sin problemas para el MVP")
    print("3. Si JSON parse falla → significa que el prompt necesita más instrucción de formato")
    print("4. La latencia determina cuándo mostrar el resultado en la UI (considerar streaming)")


if __name__ == "__main__":
    run_spike()
