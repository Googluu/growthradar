# EDA — Integración DataForSEO + CrUX + Claude

> Documento de arquitectura. Cómo encajan los tres skipes en el bucle **Evalúa → Descubre → Alcanza**, qué playgrounds añadir para el MVP, cómo se ve el dashboard, y prompts listos para generar los componentes nuevos con Claude design.

---

## 1. ¿Qué playground falta para el MVP?

Mirando los 10 playgrounds disponibles vs. tus 3 pilares, los 4 que tienes integrados (SERP, Labs, Keyword Data, OnPage) cubren bien **Evalúa**, pero **Descubre** y **Alcanza** están huérfanos por el lado de DataForSEO. Ese es el hueco que un MVP de EDA tiene que tapar antes de salir.

### Tier 1 — Agregar para MVP

**1. Categories endpoint (gratis, integrado en este turn)**

Llamada GET, sin costo, una vez cada 2-3 meses. Mapea los IDs numéricos del campo `categories` que retorna `get_related_keywords` (ej. `10021`) a nombres legibles (`"Apparel"`). Sin esto, el treemap de Labs muestra `Cat 10021` en lugar de `Apparel`. Ya lo tienes en `dataforseo.get_labs_categories()`.

**2. Business Data API (recomendación crítica, no integrada todavía)**

Esta es la pieza que cierra dos huecos a la vez:

- *Llena `reputation_score`* en tu `scoring.py` que hoy queda en `None` y por eso solo aportan 60% de los pesos al health_score.
- *Activa el pilar "Descubre"*: el sub-endpoint `business_data/business_listings/locations/live` permite buscar negocios por categoría + ubicación, devolviendo NAP, website, rating y horarios. Eso ES el motor de descubrimiento de prospectos para SMBs LATAM. Sin esto, "Descubre" depende de scraping a mano.

Sub-endpoints prioritarios:

| Endpoint | Uso en EDA |
| --- | --- |
| `business_data/google/my_business_info/live` | Datos del cliente para `reputation_score` |
| `business_data/google/reviews/live` | Reseñas para análisis de sentimiento con Claude |
| `business_data/business_listings/locations/live` | Pilar "Descubre" — encontrar prospectos |
| `business_data/business_listings/categories` | Taxonomía de categorías de negocio |

Costo: ~$0.005-0.02 por llamada. La auditoría completa pasa de ~$0.05 USD a ~$0.15 USD por cliente y desbloquea entero el pilar "Descubre".

### Tier 2 — Phase 2

- **Backlinks** ($0.02/100 backlinks): importante en teoría, pero los SMBs LATAM típicamente tienen 0-10 backlinks. Vale la pena cuando subas a clientes mid-market.
- **Domain Analytics**: ~70% solapamiento con `domain_rank` que ya usas.
- **Content Analysis**: tracking de menciones de marca; útil cuando los clientes ya tienen tráfico.

### Tier 3 — Skip para LATAM SMB

- **App Data**: la mayoría de tus prospectos no tienen app móvil.
- **AI Optimization**: forward-looking (track de menciones por LLMs); no resuelve un dolor actual.

---

## 2. Arquitectura integrada de los tres skipes

```
                          ┌─────────────────┐
   POST /audits  ────────▶│  audit_engine   │
   (Celery task)          │  run_full_audit │
                          └────────┬────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
     ┌──────────────┐     ┌────────────────┐    ┌──────────────┐
     │  DataForSEO  │     │     CrUX       │    │   Claude     │
     │   (skipe 1)  │     │   (skipe 2)    │    │  (skipe 3)   │
     ├──────────────┤     ├────────────────┤    ├──────────────┤
     │ get_onpage   │     │ query_crux     │    │ generate_    │
     │ get_domain   │     │ query_crux_    │    │ recommend.   │
     │ get_serp     │     │   history      │    │              │
     │ get_related  │     │                │    │              │
     │ get_volume   │     │                │    │              │
     │ get_categs   │     │                │    │              │
     └──────┬───────┘     └────────┬───────┘    └──────┬───────┘
            │                      │                    │
            ▼                      ▼                    │
     ┌──────────────┐     ┌────────────────┐           │
     │ calculate_   │     │ performance_   │           │
     │ seo_score    │     │ score (real)   │           │
     │ (35% peso)   │     │ (25% peso)     │           │
     └──────┬───────┘     └────────┬───────┘           │
            └──────────┬───────────┘                   │
                       ▼                               │
              ┌────────────────┐                       │
              │   scoring.py   │                       │
              │ derive_sub-    │◀──────────────────────┘
              │ scores +       │   (recommendations
              │ calculate_     │    leen sub_scores y
              │ health_score   │    los datos crudos)
              └────────┬───────┘
                       │
                       ▼
              ┌────────────────┐
              │ Audit dict     │  → Firestore / DB
              │ completo       │  → Frontend dashboard
              └────────────────┘
```

### Flujo del orquestador (`audit_engine.run_full_audit`)

1. **Evalúa** (recolección, ~30-50s):
   - `get_onpage_data(origin)` → 7s
   - `get_domain_rank(domain)` → 0.4s
   - `query_crux(origin)` → 2s (puede no tener data → fallback)
   - `query_crux_history(origin)` → 2s (idem)
   - 0-5 SERPs por keyword target → 2s cada uno
2. **Score** (~50ms): `derive_subscores` mapea los datos crudos a las 4 dimensiones; `calculate_health_score` redistribuye pesos para las dimensiones disponibles.
3. **Recomienda** (~40-50s): Claude recibe scores + datos comprimidos (`_strip_for_prompt`, `_summarize_serps_for_prompt`) y devuelve JSON estructurado.

Cada paso aislado por `_safe_call` — un fallo de CrUX no rompe la auditoría completa.

### Costo y latencia esperados

| Configuración | Costo USD | Latencia |
| --- | --- | --- |
| MVP mínimo (onpage + domain + crux + 0 serps + claude) | ~$0.025 | ~55s |
| MVP típico (+ 3 SERPs) | ~$0.035 | ~70s |
| MVP+ (con Business Data) | ~$0.15 | ~80s |
| Auditoría rica (5 SERPs + related_keywords + Business Data) | ~$0.20 | ~90s |

Persistencia: cachea audits completas en Firestore con `client_id + domain` como key. TTL de 7 días para datos de auditoría general; los SERPs en 24h aparte.

---

## 3. CrUX en el dashboard — los 4 ángulos

Los 4 ángulos que mencionaste mapean a este plan:

### Ángulo 1 — "Datos de CrUX como los muestra PageSpeed Insights"

Esto es UI/UX, no API nueva. PSI muestra los Core Web Vitals con el patrón **good / needs-improvement / poor** usando los thresholds oficiales. Toda esa data ya está en el output de `query_crux`:

```typescript
{
  origin: "https://example.com",
  collection_period: { from, to },
  metrics: {
    largest_contentful_paint: { p75: 2400, unit: "ms", rating: "good" },
    interaction_to_next_paint: { p75: 250, unit: "ms", rating: "needs_improvement" },
    cumulative_layout_shift: { p75: 0.08, unit: "score", rating: "good" },
    first_contentful_paint: { p75: 1600, unit: "ms", rating: "good" },
    experimental_time_to_first_byte: { p75: 900, unit: "ms", rating: "needs_improvement" }
  },
  performance_score: 80
}
```

El componente solo tiene que renderizar cada métrica con un badge de color según `rating`. Idéntico look-and-feel a PSI: un componente "Web Vitals Assessment" arriba con el resumen pasa/no-pasa de los 3 Core Web Vitals (LCP, INP, CLS), debajo los detalles por métrica.

### Ángulo 2 — Snapshot actual (CrUX API)

Ya tienes `query_crux`. Lo que muestra: el p75 último periodo de 28 días para cada métrica. Es lo más reciente que CrUX ofrece.

### Ángulo 3 — Tendencia 6 meses (CrUX History API)

Recién integrado en `query_crux_history`. Devuelve hasta 25 puntos semanales por métrica:

```typescript
{
  origin, form_factor,
  data_points_count: 25,
  first_date: "2025-10-31",
  last_date: "2026-04-23",
  metrics: {
    largest_contentful_paint: {
      unit: "ms",
      timeseries: [
        { date_from, date_to, p75: 2300, rating: "good" },
        { date_from, date_to, p75: 2400, rating: "good" },
        ...
      ],
      current_p75: 2400,
      previous_p75: 2350,
      current_rating: "good",
      trend: "stable" | "improving" | "degrading",
      delta_pct: -2.5  // negativo = mejora (todas las CWV: menor es mejor)
    },
    ...
  }
}
```

Visualización: un line chart por métrica con bandas de color de fondo (verde 0→good, ámbar good→needs_improvement, rojo needs_improvement→∞). Muestra la línea del p75 viajando por las bandas. Ideal: pequeños sparklines en una grid de 5, con clic para expandir cualquiera al detalle completo.

### Ángulo 4 — BigQuery (Phase 2, no MVP)

El BigQuery dataset es el archivo histórico mensual público de CrUX, agregable por país + categoría de sitio + form factor. Usos del dataset:

- **Benchmarks de industria**: "tu LCP es 3.2s, la mediana de e-commerce en México es 2.8s".
- **Histórico largo**: meses 7-24 hacia atrás (la History API solo ofrece 6 meses).
- **Análisis competitivo**: comparar tu LCP vs. competidores específicos.

Para MVP, **no lo integres**. Requiere setup de BigQuery + costo de queries + un job batch mensual para refrescar benchmarks. Es trabajo de Phase 2 cuando ya tengas 50+ clientes y necesites diferenciación con datos comparativos.

---

## 4. Mejoras a `scoring.py` — qué cubre cada dimensión hoy

`scoring.py` ahora tiene `derive_subscores`, `derive_performance_score`, `derive_reputation_score`, `derive_social_score`. Estado actual:

| Dimensión | Peso base | Fuente de datos | Estado MVP |
| --- | --- | --- | --- |
| `seo_score` | 35% | `dataforseo.calculate_seo_score(onpage)` | ✅ Listo |
| `performance_score` | 25% | `crux.query_crux` (preferido) → fallback OnPage TTI | ✅ Listo |
| `reputation_score` | 15% | Business Data API (`my_business_info`) | ⏳ Pendiente integración Business Data |
| `social_score` | 25% | APIs sociales (IG/FB/TikTok/LinkedIn) | ⏳ Phase 2 |

La lógica de redistribución de pesos en `calculate_health_score` ya maneja correctamente las dimensiones faltantes: si `social_score` y `reputation_score` son `None`, los 40% de peso "huérfanos" se redistribuyen proporcionalmente entre `seo_score` (que pasa de 35% efectivo a ~58%) y `performance_score` (de 25% a ~42%).

**Esto significa que el MVP puede lanzar HOY** con solo seo + performance, y el `health_score` será matemáticamente correcto y honesto sobre las dimensiones cubiertas (vía `available_dimensions` y `total_dimensions` en el resultado).

Cuando integres Business Data en sprint siguiente, solo necesitas pasar `business_data` a `derive_subscores` — el resto del pipeline no cambia.

---

## 5. Stack frontend para las secciones nuevas

Las recomendaciones del documento anterior (recharts + TanStack Table + shadcn/ui + lucide-react) se mantienen. Para las secciones nuevas (CrUX y Health Score) se usan estas mismas:

| Sección | Componentes | Notas |
| --- | --- | --- |
| **Health Score (composite)** | `RadialBarChart` para el score grande, `BarChart` horizontal stacked para el breakdown por dimensión | Centrar el `health_score` con el número grande; mostrar solo dimensiones con datos en el stack |
| **CrUX Web Vitals (PSI-style)** | Cards con `Badge` de color, lucide icons (CheckCircle, AlertTriangle, XCircle), `RadialBarChart` para el performance_score | 5 métricas en grid 3+2 |
| **CrUX History (trends)** | `LineChart` o `AreaChart` por métrica con `ReferenceArea` para las bandas de color | Sparklines compactos, click expande modal con vista grande |
| **Indexabilidad / status** | `Badge`, no chart | Es binario, no merece visualización compleja |

Para los charts con bandas de color de fondo en el line chart de CrUX history, usa `<ReferenceArea>` de recharts:

```jsx
<LineChart data={timeseries}>
  <ReferenceArea y1={0} y2={2500} fill="#10b98133" />        {/* verde good */}
  <ReferenceArea y1={2500} y2={4000} fill="#f59e0b33" />     {/* ámbar needs_improvement */}
  <ReferenceArea y1={4000} y2={maxY} fill="#ef444433" />     {/* rojo poor */}
  <Line dataKey="p75" stroke="#1e40af" />
</LineChart>
```

---

## 6. Prompts para Claude design — secciones nuevas

### Prompt 5 — Health Score Overview (top del dashboard)

```
Build a React + TypeScript "Digital Health Score" hero component using shadcn/ui, recharts, and lucide-react. This is the very top of the Growth Radar audit dashboard.

Data shape (from audit.scores):

interface ScoreData {
  health_score: number;              // 0-100
  available_dimensions: number;      // 1-4
  total_dimensions: number;          // always 4
  breakdown: {
    seo_score: { score: number | null; weight_base: number; weight_used: number };
    performance_score: { score: number | null; weight_base: number; weight_used: number };
    social_score: { score: number | null; weight_base: number; weight_used: number };
    reputation_score: { score: number | null; weight_base: number; weight_used: number };
  };
}

Layout:
1. Left side (40% width): a large radial gauge using recharts RadialBarChart showing the composite health_score (0-100). Color: green ≥80, amber 50-79, red <50. The number itself is centered inside the radial in very large font (4xl-6xl). Below: small label "Salud Digital" and a sub-line "N de 4 dimensiones evaluadas" using available_dimensions/total_dimensions.

2. Right side (60% width): the breakdown. Title: "Cómo se compone tu puntaje". Below: 4 horizontal rows, one per dimension (SEO, Performance, Social, Reputation):
   - Each row has the dimension name + lucide icon (Search, Zap, Users, Star)
   - Score number on the right (or "Sin datos" if null)
   - Horizontal progress bar showing the score (0-100), colored by score (red/amber/green)
   - Below the bar, a small label showing weight_used "(58% del puntaje)" or "(no contribuye)"
   - Dimensions with null score should be visually muted (60% opacity) and show a "Próximamente" pill

3. Below both: a thin alert/info bar (use shadcn Alert component) only if available_dimensions < 4: "Tu puntaje se calcula con N de 4 dimensiones. Activa Business Data API para incluir reputation_score." with a CTA button.

Style:
- Background: very subtle gradient
- Use #225bb6 as primary accent
- Generous padding
- Responsive: stack vertically on mobile (radial on top, breakdown below)
- All copy in Spanish
- Smooth fade-in animation when data loads
```

### Prompt 6 — CrUX Web Vitals Section (PSI-style + history)

```
Build a React + TypeScript "Core Web Vitals" component for a SEO audit dashboard. Combines current CrUX data + 6-month history. Uses shadcn/ui, recharts, and lucide-react.

Data shape:

interface CruxData {
  origin: string;
  collection_period: { from: string; to: string };
  performance_score: number;  // 0-100
  metrics: {
    [key in 'largest_contentful_paint' | 'interaction_to_next_paint' | 'cumulative_layout_shift' | 'first_contentful_paint' | 'experimental_time_to_first_byte']: {
      p75: number | null;
      unit: 'ms' | 'score';
      rating: 'good' | 'needs_improvement' | 'poor' | 'no_data';
    };
  };
}

interface CruxHistoryData {
  origin: string;
  data_points_count: number;
  first_date: string;
  last_date: string;
  metrics: {
    [key: string]: {
      unit: string;
      timeseries: Array<{ date_from: string; date_to: string; p75: number | null; rating: string }>;
      current_p75: number | null;
      previous_p75: number | null;
      current_rating: string;
      trend: 'improving' | 'degrading' | 'stable' | 'no_data';
      delta_pct: number | null;
    };
  };
}

Component receives both: { current: CruxData | null; history: CruxHistoryData | null }. When current is null, show "Este sitio no tiene suficiente tráfico en Chrome para reportar datos reales de UX. Mostramos métricas sintéticas del crawler como fallback." (the parent will pass a fallback prop).

Layout:

1. Header row: "Core Web Vitals" title + small subtitle showing the collection_period dates + a Badge showing form_factor (Desktop/Mobile).

2. Hero "Web Vitals Assessment" card (PSI-style): Big card showing whether the site PASSES the Core Web Vitals (LCP, INP, CLS all need to be 'good' or 'needs_improvement' — only 'poor' fails). Big icon (CheckCircle green or XCircle red), "PASA Core Web Vitals" or "NO PASA Core Web Vitals" text, and the 3 key metrics inline as small badges with their ratings.

3. 5-metric grid (3 columns on desktop, 2 on tablet, 1 on mobile). Each metric card:
   - Metric name in Spanish (LCP = "Pintado de Contenido Más Grande", INP = "Interacción al Próximo Paint", CLS = "Cambio Acumulativo de Layout", FCP = "Pintado de Contenido Inicial", TTFB = "Tiempo al Primer Byte")
   - Big p75 value with unit
   - Rating badge (green "Bueno" / amber "Necesita mejora" / red "Pobre" / gray "Sin datos")
   - Tiny sparkline (if history available) showing the last 25 weekly p75 values, with the line color matching the current rating
   - Trend indicator: TrendingUp/TrendingDown/Minus icon + "+5.2%" delta_pct, colored green if 'improving', red if 'degrading', gray if 'stable'
   - Click on card → opens Dialog with full history chart for that metric

4. Full history chart Dialog (only shown when user clicks a metric card):
   - Title: metric name + current rating
   - LineChart (recharts) sized 600x300:
     - X axis: weekly dates from timeseries
     - Y axis: p75 values
     - Line: stroke #1e40af, dataKey "p75"
     - Background bands using ReferenceArea: green band 0→good_threshold, amber band good→needs_improvement, red band needs_improvement→max
     - Tooltip showing date_from + date_to + p75 value + rating
   - Below chart: 4 stat boxes — current p75, previous p75, delta_pct, trend label
   - Footer: small explanatory text in Spanish about what this metric measures and what good means

5. Performance Score gauge at the very top right of the section: another small RadialBarChart showing performance_score (0-100), labeled "Performance Score". Same color logic.

Visual references:
- The PSI-style "Web Vitals Assessment" card should look like the one Google PSI shows.
- Use the official Core Web Vitals colors: good = #0CCE6B, needs_improvement = #FFA400, poor = #FF4E42.
- Spanish throughout.

Special handling:
- If history is null but current is not null: hide the sparklines and trend indicators, just show the basic metric cards with current values.
- If both are null: show an empty state with the "no traffic" message above and a fallback callout to OnPage performance.
```

---

## 7. Próximos pasos

1. **Integrar Business Data API** — esto desbloquea `reputation_score` (15% del peso) Y activa el pilar "Descubre" (búsqueda de prospectos por categoría + ubicación). Mismo patrón que los otros endpoints de DataForSEO; ~3-5 horas de trabajo.

2. **Job de snapshots periódicos** — Cloud Scheduler → Cloud Run que reejecuta `query_crux_history` y `get_serp_data` semanal o quincenalmente. Eso desbloquea:
   - SERP Volatility Index (necesita histórico de SERPs)
   - Comparativa entre auditorías (Audit A vs Audit B)
   - Alertas de regresión de performance ("tu LCP empeoró 15% esta semana")

3. **Persistencia de Categories en DB** — Llama una vez `get_labs_categories()`, guarda el `categories_by_id` en Postgres o Firestore, y usa `resolve_category_names` desde el frontend. Refresca cada 60-90 días.

4. **Lighthouse oficial** (opcional) — el `onpage_score` de DataForSEO es un proxy interno. Si necesitas los 4 scores oficiales de Lighthouse (Performance / Accessibility / Best Practices / SEO), añade `on_page/lighthouse/live/json`. Más caro y más lento (~10s) pero scores Google-oficiales.

5. **Pilar "Alcanza"** — el outreach engine. No tocado en este sprint. Necesita su propio módulo: `outreach.py` con generación de mensaje (Claude), envío (Resend / SES) y tracking (open/reply via webhooks).