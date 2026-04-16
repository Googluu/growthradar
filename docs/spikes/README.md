# Spikes Técnicos — Fase 1

> Este directorio documenta los hallazgos de cada spike técnico.
> Cada archivo se completa DESPUÉS de correr el script y revisar los resultados reales.

---

## Spike 1: CrUX API

**Script:** `spikes/spike_crux.py`
**Ejecutar:** `cd spikes && uv run python spike_crux.py`
**Status:** [ ] Pendiente de ejecución

### Preguntas a responder
- [ ] ¿Qué métricas exactas retorna la API? (LCP, INP, CLS, FCP, TTFB, ...)
- [ ] ¿Qué porcentaje de dominios LATAM tienen datos en CrUX?
- [ ] ¿Qué sucede cuando un dominio no tiene datos? (código de error, estructura)
- [ ] ¿Cuánto tarda la llamada? (latencia promedio)
- [ ] ¿La API diferencia entre móvil y desktop?

### Hallazgos
> (Completar después de correr el spike)

**Métricas disponibles:**
- TBD

**Dominios sin datos (fallback necesario):**
- TBD — % estimado para dominios LATAM

**Decisión de arquitectura:**
- TBD

---

## Spike 2: DataForSEO API

**Script:** `spikes/spike_dataforseo.py`
**Ejecutar:** `cd spikes && uv run python spike_dataforseo.py`
**Status:** [ ] Pendiente de ejecución

### Preguntas a responder
- [ ] ¿Qué campos retorna On-Page Instant Pages?
- [ ] ¿Qué tan preciso es el `onpage_score` de DataForSEO?
- [ ] ¿Domain Rank Overview funciona con dominios `.com.co` y `.com.mx`?
- [ ] ¿Cuánto tarda cada endpoint? ¿Es apto para ser parte de una auditoría < 3 min?
- [ ] ¿Qué pasa cuando se agotan los créditos del free tier?

### Hallazgos
> (Completar después de correr el spike)

**Endpoints validados:**
- [ ] `POST /v3/on_page/instant_pages` — TBD
- [ ] `POST /v3/dataforseo_labs/google/domain_rank_overview/live` — TBD

**Costo real por auditoría:**
- TBD

**Decisión de arquitectura:**
- TBD

---

## Spike 3: Claude API — Prompt de Recomendaciones

**Script:** `spikes/spike_claude.py`
**Prompt:** `packages/audit-engine/prompts/recommendations_v1.md`
**Ejecutar:** `cd spikes && uv run python spike_claude.py`
**Status:** [ ] Pendiente de ejecución

### Preguntas a responder
- [ ] ¿El output es JSON válido en el 100% de las llamadas?
- [ ] ¿Las recomendaciones son específicas y relevantes (no genéricas)?
- [ ] ¿El lenguaje es apropiado para un dueño de negocio LATAM?
- [ ] ¿Cuántos tokens usa por llamada? ¿Cuál es el costo real?
- [ ] ¿La latencia es aceptable para mostrar en UI (< 10s)?

### Hallazgos
> (Completar después de correr el spike)

**Tokens promedio por llamada:**
- Input: TBD
- Output: TBD
- Costo estimado: TBD

**Calidad del output:**
- JSON válido: TBD
- Recomendaciones específicas: TBD/5
- Lenguaje apropiado para LATAM: TBD

**Ajustes al prompt necesarios:**
- TBD

**Decisión de arquitectura:**
- TBD

---

## Decisiones de Arquitectura Post-Spike

> (Completar después de los 3 spikes)

| Pregunta | Decisión | Razón |
|----------|----------|-------|
| ¿Fallback para dominios sin CrUX? | TBD | — |
| ¿Cachear resultados CrUX? | TBD | — |
| ¿Usar onpage_score de DataForSEO o calcular el nuestro? | TBD | — |
| ¿Streaming en el response de Claude o esperar el JSON completo? | TBD | — |
| ¿Prompt v1 listo para producción o necesita iteración? | TBD | — |
