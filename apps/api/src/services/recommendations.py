"""
Recommendations service — genera recomendaciones accionables con Claude API.

El prompt se carga desde el archivo versionado en:
  packages/audit-engine/prompts/recommendations_v1.md

El servicio es síncrono (para uso desde el worker Celery).
Latencia esperada: 40-50s — razón por la que las auditorías son async jobs.
"""

import json
from pathlib import Path

import anthropic

from src.config import settings

_MODEL = "claude-sonnet-4-6"
_MAX_TOKENS = 4096
# En el container: /app/src/services/recommendations.py → parents[2] = /app
_PROMPT_PATH = Path(__file__).parents[2] / "packages/audit-engine/prompts/recommendations_v1.md"


def _load_prompt() -> tuple[str, str]:
    """Carga y parsea el prompt en (system_prompt, user_prompt_template)."""
    if not _PROMPT_PATH.exists():
        raise FileNotFoundError(f"Prompt no encontrado: {_PROMPT_PATH}")

    template = _PROMPT_PATH.read_text(encoding="utf-8")

    parts = template.split("## SYSTEM PROMPT")
    after_system = parts[1].split("## USER PROMPT TEMPLATE")
    system_prompt = after_system[0].strip()
    user_prompt_template = after_system[1].strip()

    return system_prompt, user_prompt_template


def _strip_markdown(text: str) -> str:
    """Elimina bloques ```json ... ``` que Claude a veces añade aunque el prompt pida JSON crudo."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        cleaned = "\n".join(lines[1:-1]).strip()
    return cleaned


def generate_recommendations(
    company_name: str,
    company_domain: str,
    audit_data: dict,
) -> dict:
    """
    Llama a Claude con los datos de auditoría y retorna el JSON de recomendaciones.

    Returns:
        dict con executive_summary, top_recommendations, score_context.
        Si el parseo falla, retorna {"error": "json_parse_failed", "raw": <texto>}.

    Raises:
        anthropic.APIError: si la llamada a la API falla.
    """
    system_prompt, user_template = _load_prompt()

    user_prompt = (
        user_template
        .replace("{company_name}", company_name)
        .replace("{company_domain}", company_domain)
        .replace("{audit_data_json}", json.dumps(audit_data, indent=2, ensure_ascii=False))
    )

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    message = client.messages.create(
        model=_MODEL,
        max_tokens=_MAX_TOKENS,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}],
    )

    block = message.content[0]
    if not isinstance(block, anthropic.types.TextBlock):
        return {"error": "unexpected_response_type", "block_type": type(block).__name__}
    raw_text = block.text
    cleaned = _strip_markdown(raw_text)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        return {"error": "json_parse_failed", "detail": str(exc), "raw": raw_text}
