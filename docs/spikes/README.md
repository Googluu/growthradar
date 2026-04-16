# Spikes Técnicos — Fase 1

> Hallazgos documentados con datos reales. Ejecutados el 2026-04-16.

---

## Spike 1: CrUX API — Performance

**Script:** `spikes/spike_crux.py`
**Status:** [x] Completado

### Hallazgos

**Métricas disponibles (por dominio, formFactor DESKTOP o MOBILE):**
| Métrica | Clave API | Unidad | Umbral GOOD |
|---------|-----------|--------|-------------|
| Largest Contentful Paint | `largest_contentful_paint` | ms | < 2500 |
| Interaction to Next Paint | `interaction_to_next_paint` | ms | < 200 |
| Cumulative Layout Shift | `cumulative_layout_shift` | score | < 0.10 |
| First Contentful Paint | `first_contentful_paint` | ms | < 1800 |
| Time to First Byte | `experimental_time_to_first_byte` | ms | < 800 |

**Resultados reales (DESKTOP):**
| Dominio | Performance Score | LCP | INP | CLS | FCP | TTFB |
|---------|-------------------|-----|-----|-----|-----|------|
| dian.gov.co | 80/100 | 1367ms ✅ | 62ms ✅ | 0.33 ❌ | 1156ms ✅ | 439ms ✅ |
| google.com | 100/100 | 896ms ✅ | 64ms ✅ | 0.00 ✅ | 406ms ✅ | 225ms ✅ |
| dominio-sin-datos | N/A (404) | — | — | — | — | — |

**Dominios sin datos:**
- La API retorna HTTP 404 cuando el dominio no tiene suficiente tráfico real de Chrome.
- Para el MVP: cualquier dominio que retorne 404 necesita **fallback a Lighthouse local** (métricas de laboratorio).
- Estimado: ~40-50% de pymes LATAM probablemente no tendrán datos en CrUX.

**Período de datos:** 28 días rolling (se actualiza cada semana aprox.)

### Decisiones de Arquitectura
- Intentar CrUX primero (datos reales) → si 404, ejecutar Lighthouse headless local
- Guardar en cache por 7 días (los datos cambian semanalmente)
- `performance_score` calculado como promedio de ratings: good=100, needs_improvement=50, poor=0
- Usar siempre percentil p75 (estándar de Google para Core Web Vitals)

---

## Spike 2: DataForSEO API — SEO On-Page

**Script:** `spikes/spike_dataforseo.py`
**Status:** [x] Completado

### Hallazgos

**Endpoint 1: `POST /v3/on_page/instant_pages`**
- Retorna análisis on-page síncrono (~3-5s por URL)
- Datos útiles para el `seo_score`: `onpage_score`, `meta.title`, `meta.description`, H1 count, `is_https`, `has_sitemap`, `has_robots_txt`, `images_without_alt_count`
- Estructura: `tasks[0].result[0].items[0]`
- Bug encontrado: el campo `custom_js` no es válido en esta versión de la API → eliminado

**Endpoint 2: `POST /v3/dataforseo_labs/google/domain_rank_overview/live`**
- Retorna métricas de autoridad orgánica del dominio (keywords, posiciones, tráfico estimado)
- Estructura: `tasks[0].result[0].items[0].metrics.organic` (no `result[0].metrics`)
- Datos útiles: `count` (total keywords), `pos_1`, `pos_2_3`, `pos_4_10`, `etv` (tráfico estimado)

**Resultados reales (dian.gov.co):**
- On-Page Score: 92.32 / 100
- Title: `Dirección de Impuestos y Aduanas Nacionales - DIAN` (50 chars) ✅
- Meta Description: ❌ ausente
- H1 tags: ❌ 0
- HTTPS: ✅ | Sitemap: ❌ | robots.txt: ❌
- Imágenes sin alt: 0 / 0 ✅
- Keywords rankeando: 44,868 | Keywords en #1: 3,639
- Tráfico mensual estimado: 6,158,226 visitas

**Costo real por auditoría:**
- On-Page Instant: ~$0.0015/URL
- Domain Rank Overview: ~$0.0101/dominio
- **Total por auditoría completa: ~$0.012**
- Proyección 100 auditorías/mes: **~$1.20**

### Decisiones de Arquitectura
- Usar `on_page/instant_pages` en vez del crawl completo (async) — es suficiente para el MVP y más rápido
- El `onpage_score` de DataForSEO es una señal útil pero calcularemos nuestro propio `seo_score` basado en los campos específicos
- `domain_rank_overview` da contexto sobre visibilidad SEO general — incluirlo en el reporte
- Costo es negligible — no necesitamos caching agresivo para el MVP

---

## Spike 3: Claude API — Prompt de Recomendaciones v1

**Script:** `spikes/spike_claude.py`
**Prompt:** `packages/audit-engine/prompts/recommendations_v1.md`
**Status:** [x] Completado

### Hallazgos

**Uso de tokens (promedio de 3 llamadas):**
| | Tokens | Costo |
|--|--------|-------|
| Input | ~1,321 | $0.004 |
| Output | ~2,400 | $0.036 |
| **Total** | **~3,700** | **~$0.040** |

**Proyección 100 auditorías/mes: ~$4.00**

**Latencia:** 40-50 segundos (por el volumen de texto generado en español)

**Calidad del output (evaluación manual):**
- JSON válido tras strip de markdown: ✅
- Recomendaciones específicas (no genéricas): ✅ 5/5
- Lenguaje apropiado para dueño de negocio LATAM: ✅
- Quick wins vs estratégico correctamente clasificados: ✅
- Contexto de scores explicado con claridad: ✅

**Problema encontrado:**
- Claude envuelve el JSON en bloque markdown ` ```json ``` ` aunque el prompt pide solo JSON
- **Solución implementada:** strip de markdown en el script antes del `json.loads()`
- Alternativa futura: usar `system` prompt más explícito ("Responde SOLO con JSON crudo, sin bloques de código markdown")

### Decisiones de Arquitectura
- `max_tokens=4096` es el mínimo recomendado para 5 recomendaciones detalladas en español
- La latencia de 40-50s hace que sea **obligatorio usar jobs async** — el usuario no puede esperar esto en tiempo real
- Para el dashboard: mostrar progress indicator mientras el job corre → render del reporte cuando esté listo
- Evaluar **streaming** en una iteración futura para mostrar el texto de recomendaciones mientras se genera
- El prompt v1 está listo para producción — no necesita cambios para la primera versión del Audit Engine

---

## Resumen: Decisiones de Arquitectura Post-Spike

| Pregunta | Decisión | Razón |
|----------|----------|-------|
| Fallback para dominios sin CrUX | Lighthouse headless local | ~40-50% de pymes LATAM no tendrán datos CrUX |
| Cachear CrUX? | Sí, 7 días | Los datos se actualizan semanalmente |
| On-Page: sync o async crawl? | Sync (instant_pages) | Más rápido, suficiente para MVP |
| onpage_score de DataForSEO | Usar como señal, calcular el nuestro | Queremos control total del score final |
| Claude max_tokens | 4096 | 5 recs detalladas en español = ~2,500 tokens output |
| Claude JSON sin bloques markdown | Strip en código | Más robusto que depender solo del prompt |
| Mostrar resultado en tiempo real | No — jobs async + progress bar | La llamada a Claude tarda 40-50s |
| Costo total por auditoría | ~$0.05 (CrUX gratis + DataForSEO $0.012 + Claude $0.040) | Escala sin problemas hasta miles de auditorías/mes |
