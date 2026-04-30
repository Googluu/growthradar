# DataForSEO Service — EDA

Capa de inteligencia digital para el dashboard de EDA. Cuatro endpoints integrados, cada uno con un parser que normaliza la respuesta cruda de DataForSEO en una estructura plana, lista para alimentar componentes de React.

## Resumen de endpoints

| Función | Endpoint DataForSEO | Costo aprox. (USD) | Tiempo aprox. | Input principal |
| --- | --- | --- | --- | --- |
| `get_onpage_data` | `on_page/instant_pages` | $0.000125 | ~7s | URL única |
| `get_domain_rank` | `dataforseo_labs/google/domain_rank_overview/live` | $0.02 | ~0.4s | dominio |
| `get_serp_data` | `serp/google/organic/live/advanced` | $0.002 | ~2s | keyword |
| `get_related_keywords` | `dataforseo_labs/google/related_keywords/live` | $0.02 | ~0.4s | seed keyword |
| `get_search_volume` | `keywords_data/google_ads/search_volume/live` | $0.075 | ~5s | lista de keywords |

Una auditoría completa de EDA para un cliente cuesta aproximadamente **$0.12 USD** por análisis (1 onpage + 1 domain rank + 3 SERPs + 1 related_keywords + 1 search_volume con 50 keywords). Persistir esto en Firestore y servir desde caché para queries repetidas dentro de las primeras 24h.

---

## Mapeo de campos por sección del dashboard

### 1. SERP API → sección `serp`

| Sección dashboard | Campos del parser |
| --- | --- |
| **KPIs principales** | `average_position`, `serp_features_count`, `serp_features`, `total_results_google`, `target_visibility.position` |
| **Tabla de resultados** | `organic_results[]` con `rank_absolute`, `title`, `url`, `domain`, `description`, `breadcrumb`, `is_featured_snippet`, `sitelinks`, `highlighted` |
| **AI Overview** | `ai_overview.markdown` (resumen IA), `ai_overview.references[]` (fuentes citadas), `has_ai_overview` |
| **SERP screenshot / link a Google** | `check_url` (URL real de Google con `&uule=...` para reproducir la SERP) |
| **Distribución de rankings** | `ranking_distribution` (top_3, top_10, top_20, top_100) |
| **Competidores en la SERP** | `top_3_domains`, `top_10_domains`, `featured_snippet_domain` |
| **Visibilidad del cliente** | `target_visibility.{found, position, in_top_3, in_top_10, is_featured_snippet}` |
| **Expansión de keywords** | `related_searches[]`, `perspectives[]` |
| **Operacional** | `cost`, `task_time`, `task_status_code`, `datetime` |

**Importante**: el SERP Volatility Index y los Traffic Trends que menciona la descripción del dashboard **no salen de un solo call**. Necesitas snapshots históricos (guardar el `organic_results` día a día en Firestore y comparar deltas de `rank_absolute` por dominio).

---

### 2. DataForSEO Labs API → sección `labs`

Endpoint usado: `related_keywords/live`. Devuelve hasta 1000 keywords relacionadas a una semilla, con métricas SEO y PPC completas.

| Sección dashboard | Campos del parser |
| --- | --- |
| **KPIs (scorecards superior)** | `total_search_volume`, `avg_cpc`, `avg_difficulty`, `estimated_traffic_value_usd`, `items_count`, `total_count` |
| **Distribución de rankings** *(opportunity-side, no real)* | `difficulty_buckets` (easy / medium / hard / very_hard) |
| **Tabla de keyword research** | `keywords[]` con `keyword`, `search_volume`, `cpc`, `competition_level`, `keyword_difficulty`, `main_intent`, `depth`, `monthly_searches`, `serp_features`, `categories` |
| **Distribución por intención** | `intent_distribution` (informational / commercial / navigational / transactional) — pie chart |
| **Distribución por competencia** | `competition_distribution` (LOW / MEDIUM / HIGH) |
| **Profundidad de relación al seed** | `depth_distribution` (1, 2, 3 — qué tan cercanas son al seed) |
| **Treemap / categorías de mercado** | `top_categories[]` (Google Ads category IDs con frecuencia) |
| **Top keywords destacadas** | `top_keywords_by_volume[]` (ranking horizontal), `low_hanging_fruit[]` (oportunidades alto-volumen-baja-dificultad) |
| **Tendencia global de búsqueda** | `monthly_aggregated[]` (suma mes a mes de todos los keywords) — area chart |
| **Operacional** | `cost`, `task_time`, `task_status_code` |

**Notas**:
- El campo `categories` devuelve IDs numéricos de Google Ads (ej. `[10007, 11498]`). Si quieres mostrar nombres en el treemap, necesitas mapearlos contra la [tabla oficial de categorías](https://docs.dataforseo.com/v3/keywords_data/google_ads/categories) — descargable como CSV una vez y cacheada en tu DB.
- La sección **"Inteligencia Competitiva"** (Venn diagrams de intersección de dominios) requiere endpoints adicionales que no integré aquí: `domain_intersection/live` y `competitors_domain/live`. Se pueden añadir con la misma estructura del parser.
- **App Store Optimization (ASO)** mencionada en la descripción requiere endpoints separados (`app_data/google/listings/live` y `app_data/apple/listings/live`). No los integré porque no aplican al uso típico de Growth Radar para SMBs LATAM (que mayormente no tienen apps).

---

### 3. Keyword Data API → sección `keyword_data`

Endpoint usado: `google_ads/search_volume/live`. Datos **exactos** de Google Ads (no estimaciones), para hasta 1000 keywords.

| Sección dashboard | Campos del parser |
| --- | --- |
| **KPIs** | `total_search_volume`, `avg_cpc`, `max_cpc`, `min_cpc`, `total_ppc_cost_estimate_usd`, `keywords_count` |
| **Tabla PPC core** | `keywords[]` con `keyword`, `search_volume`, `competition`, `competition_index` (0-100), `cpc`, `low_top_of_page_bid`, `high_top_of_page_bid` |
| **Histórico de volumen** | `keywords[].monthly_searches[]` (12 meses por keyword) — line chart por keyword |
| **Tendencia agregada** | `monthly_aggregated[]` — area chart sumando todos los keywords |
| **Distribución de competencia** | `competition_distribution` (LOW / MEDIUM / HIGH) — pie chart |
| **Top keywords** | `top_keywords_by_volume[]`, `top_keywords_by_cpc[]` |
| **Detección de estacionalidad** | `most_seasonal_keywords[]` — keywords con mayor `(max - min) / max` de volumen mensual |
| **Operacional** | `cost`, `task_time`, `task_status_code` |

**Notas**:
- Sin `location_code` y `language_code` el endpoint devuelve volumen **global**. Para Growth Radar siempre conviene pasar al menos `location_code=2170` (Colombia) o `2484` (México).
- Los datos de **Google Trends / demografía / mapas geográficos** mencionados en la descripción requieren endpoints distintos: `keywords_data/google_trends/explore/live`. Se puede añadir con la misma plantilla si el cliente lo necesita.
- **Clickstream data** (mayor precisión combinando datos reales de navegación) requiere endpoint específico `clickstream_data/dataforseo_search_volume/live`. Es más caro (~$0.10 / 1000 kws) pero más preciso para nichos donde Google Ads subestima volumen.

---

### 4. OnPage API → sección `onpage`

Endpoint usado: `instant_pages`. Auditoría de URL única en ~7 segundos. El parser preserva los campos legacy (los que usa `calculate_seo_score`) y agrega secciones agrupadas para el dashboard.

| Sección dashboard | Campos del parser |
| --- | --- |
| **KPIs de salud** | `health.onpage_score` (de DataForSEO, 0-100), `health.computed_health_score` (propio, 0-100), `health.issues_count`, `health.passing_count`, `health.is_indexable`, `health.http_status_class` |
| **Status code class (donut)** | `health.http_status_class` (`2xx` / `3xx` / `4xx` / `5xx`) |
| **Auditoría técnica — issues** | `issues[]` (array de problemas con `check`, `label`, `severity`), `passing_checks[]` (array de checks que pasan) |
| **Tabla de errores de recursos** | `resource_errors[]`, `resource_warnings[]`, `resource_errors_count`, `resource_warnings_count` |
| **Duplicados** | `duplicate_title`, `duplicate_description`, `duplicate_content`, `duplicate_meta_tags[]`, `broken_resources`, `broken_links` |
| **Page Speed (gauge charts)** | `performance.time_to_interactive_ms`, `performance.dom_complete_ms`, `performance.largest_contentful_paint`, `performance.first_input_delay`, `performance.cumulative_layout_shift` |
| **Peso por tipo de recurso** | `resources_breakdown.scripts_count/size`, `resources_breakdown.stylesheets_count/size`, `resources_breakdown.images_count/size`, `performance.total_dom_size_bytes`, `performance.page_size_bytes` |
| **Análisis de contenido** | `content.plain_text_word_count`, `content.flesch_kincaid_readability_index`, `content.title_to_content_consistency`, `content.description_to_content_consistency` |
| **Jerarquía de encabezados** | `headings.h1[]`, `headings.h2[]`, ..., `headings_count.{h1, h2, ...}` |
| **Open Graph / Twitter** | `social_media_tags` (dict completo) |
| **Metadatos** | `title`, `title_length`, `description`, `description_length`, `canonical`, `meta_keywords`, `favicon` |
| **Operacional** | `cost`, `task_time`, `task_status_code`, `fetch_time` |

**Notas críticas**:
- El endpoint `instant_pages` analiza **una sola URL**. Para "Total de Páginas Rastreadas" o "% de páginas indexables del sitio" como dice la descripción del dashboard, necesitas el endpoint asíncrono `on_page/task_post` + `task_get/summary` que rastrea el sitio completo. Cuesta $0.001 por página y devuelve resumen agregado.
- Los **Lighthouse scores reales** (Performance, Accessibility, Best Practices, SEO en escala 0-100) requieren `on_page/lighthouse/live/json`, no `instant_pages`. El `onpage_score` de instant_pages es un proxy interno de DataForSEO, no Lighthouse oficial.
- Las **capturas de pantalla** mencionadas en la descripción requieren el endpoint `on_page/page_screenshot` (asíncrono, ~$0.0006 por captura).
- `has_robots_txt` siempre devuelve `False` desde `instant_pages` porque ese check no existe en esta respuesta. Para verificar robots.txt necesitas `on_page/raw_html` apuntando a `dominio.com/robots.txt` o el crawl completo.

---

## Notas de implementación

### Persistencia y caché

Cada llamada cuesta dinero, así que conviene una capa de caché en Firestore con TTL diferenciado:

| Tipo de dato | TTL recomendado |
| --- | --- |
| OnPage de URLs específicas | 7 días |
| Domain rank overview | 7 días |
| SERP por keyword + ubicación | 24 horas (cambia rápido) |
| Related keywords | 30 días (estable) |
| Search volume (Google Ads) | 30 días (Google actualiza mensual) |

Estructura sugerida de Firestore:

```
growth_radar/
  audits/
    {audit_id}/
      onpage: { ...respuesta de get_onpage_data }
      serp: [{ keyword, data }, ...]
      labs: { ...respuesta de get_related_keywords }
      keyword_data: { ...respuesta de get_search_volume }
      created_at
      total_cost_usd
      client_id
```

### Tendencias y comparativa entre auditorías

Para los gráficos de "evolución entre auditorías" del dashboard (Auditoría A vs. B, Volatility Index, Traffic Trends), guarda cada auditoría completa con timestamp y luego en el frontend hace `diff` entre la actual y la anterior:

- **Volatility de SERP**: porcentaje de dominios que cambiaron de posición entre dos snapshots de la misma keyword.
- **Health delta**: `health.computed_health_score` actual vs anterior.
- **Position delta**: `target_visibility.position` actual vs anterior por keyword.

### Manejo de errores

Todos los parsers devuelven `{"error": ...}` en lugar de lanzar excepción. En el frontend:

```typescript
if ('error' in data) {
  // Muestra estado de error en la card específica, no rompas todo el dashboard
}
```

Los errores comunes son `task_failed` (cuota agotada, dominio bloqueado, keyword inválido) y `parse_error` (cambio de schema de DataForSEO — reportar al equipo).

### Costos en producción

El parser expone `cost` por cada llamada. Suma estos valores en una colección `usage_logs` de Firestore con `client_id`, `endpoint`, `cost`, `timestamp`. Esto alimenta directamente la sección "Monitorización Operativa" del dashboard.

---

## Stack frontend recomendado

### Librerías core

| Librería | Versión | Uso |
| --- | --- | --- |
| `recharts` | ^2.15 | Line / area / bar / pie / radial bar charts (90% de los gráficos del dashboard) |
| `@tanstack/react-table` | ^8.x | Tablas de keywords/results con sort, filter, paginación virtualizada |
| `shadcn/ui` | latest | `Card`, `Table`, `Dialog`, `Tabs`, `Badge`, `Button`, `Tooltip` |
| `lucide-react` | latest | Iconografía consistente (TrendingUp, AlertTriangle, ExternalLink, etc.) |
| `react-markdown` | ^9.x | Renderizar `ai_overview.markdown` con formato |

### Para visualizaciones específicas

| Visualización | Librería | Notas |
| --- | --- | --- |
| Treemap de categorías (Labs) | `@nivo/treemap` o `recharts` Treemap | Recharts ya lo trae si quieres una sola dep |
| Word cloud (related searches, keywords) | `react-wordcloud` o `@visx/wordcloud` | Visx pesa menos pero requiere más config |
| Gauge charts (page speed) | `recharts` `RadialBarChart` | No necesitas librería extra |
| Mapas geográficos (Google Trends) | `react-simple-maps` + GeoJSON | Solo si integras Trends API |
| Diagramas de Venn (Labs competitive) | `venn.js` + d3 | Solo si integras `domain_intersection` |
| SERP screenshot preview | `<iframe sandbox>` apuntando al `check_url` o `on_page/page_screenshot` | iframe es gratis pero Google bloquea; para algo robusto, screenshot endpoint |

### Decisiones de UX

- **Loading states**: las llamadas tardan 2-7s. Usa skeleton screens (shadcn `Skeleton`) por sección, no un spinner global.
- **Errores parciales**: si una sección falla (`{"error": ...}`), muestra un estado vacío con botón "Reintentar" en esa card sin bloquear el resto.
- **Densidad de datos**: la tabla de Labs puede tener 100-1000 filas. Usa `@tanstack/react-virtual` para virtualización.
- **Filtros globales**: ubicación, idioma, dispositivo y keyword(s) van en un panel sticky superior. Cada cambio dispara nuevas llamadas y persiste en URL params (`useSearchParams`).
- **Exportación**: agrega botones "Exportar a CSV" en cada tabla y "Generar PDF" del dashboard completo (con `react-to-pdf` o un endpoint backend que use Playwright).

---

## Prompts para Claude design

Estos prompts están listos para pegar en claude.ai (modelo Claude Opus o Sonnet) para generar componentes React de cada sección. Asumen que ya pasas el JSON del parser correspondiente como prop `data`.

### Prompt 1 — Sección SERP

```
Build a React + TypeScript component for a SERP analysis dashboard section using shadcn/ui, recharts, and lucide-react.

The component receives a `data` prop with this shape (from a DataForSEO SERP API parser):

interface SerpData {
  keyword: string;
  datetime: string;
  check_url: string;
  total_results_google: number;
  organic_results_count: number;
  serp_features: string[];
  serp_features_count: number;
  has_ai_overview: boolean;
  average_position: number | null;
  ranking_distribution: { top_3: number; top_10: number; top_20: number; top_100: number };
  top_3_domains: string[];
  top_10_domains: string[];
  featured_snippet_domain: string | null;
  target_visibility: { domain: string; found: boolean; position: number | null; url: string | null; in_top_3: boolean; in_top_10: boolean; is_featured_snippet: boolean } | null;
  organic_results: Array<{
    rank_absolute: number; title: string; url: string; domain: string;
    description: string; breadcrumb: string; is_featured_snippet: boolean;
    sitelinks: Array<{ title: string; url: string; description: string }>;
    highlighted: string[];
  }>;
  ai_overview: { markdown: string; references: Array<{ domain: string; url: string; title: string; source: string }>; references_count: number } | null;
  related_searches: string[];
  perspectives: Array<{ title: string; url: string; domain: string; source: string; date: string }>;
  cost: number;
  task_time: string;
}

Layout:
1. Top row of 4 KPI cards: Average Position, SERP Features Count, Organic Results Count, and (if target_visibility exists) "Tu Posición" with the position number prominent. If target not found, show "No rankeas aún". Use lucide-react icons.
2. Below: a 2-column grid. Left column: ranking distribution as a horizontal bar chart (recharts BarChart). Right column: top 10 domains as a numbered list with favicon (use https://www.google.com/s2/favicons?domain=X).
3. AI Overview section (only if has_ai_overview): a Card with a brain icon, the markdown rendered with react-markdown, and references as a horizontal scrolling chip list below.
4. Main organic results table using @tanstack/react-table. Columns: Rank (badge), Domain (with favicon), Title (linkable, with breadcrumb subtitle), Description (with `highlighted` terms wrapped in <mark>), Sitelinks count. Highlight rows where domain matches target_visibility.domain. Featured snippet shows a star icon next to rank.
5. Right sidebar (or below table on mobile): related searches as clickable chips that call an `onSearchAgain(keyword)` prop.
6. Footer: small operational stats — cost in USD, response time, datetime, and a Button "Ver SERP en Google" that opens check_url in new tab.

Style: clean, minimal, Stripe-like dashboard aesthetic. Use neutral grays with a single accent color (#225bb6) for positive states and amber for warnings. Mobile responsive. All text in Spanish.
```

### Prompt 2 — Sección Labs (keyword research)

```
Build a React + TypeScript component for a keyword research section using shadcn/ui, recharts, lucide-react, and @tanstack/react-table.

Data shape from DataForSEO Labs related_keywords parser:

interface LabsData {
  seed_keyword: string;
  total_count: number;
  items_count: number;
  total_search_volume: number;
  avg_cpc: number;
  avg_difficulty: number;
  estimated_traffic_value_usd: number;
  competition_distribution: Record<'LOW' | 'MEDIUM' | 'HIGH', number>;
  intent_distribution: Record<'informational' | 'commercial' | 'navigational' | 'transactional', number>;
  difficulty_buckets: { easy: number; medium: number; hard: number; very_hard: number };
  top_categories: Array<{ category_id: number; count: number }>;
  monthly_aggregated: Array<{ year_month: string; search_volume: number }>;
  top_keywords_by_volume: Array<KeywordItem>;
  low_hanging_fruit: Array<KeywordItem>;
  keywords: Array<KeywordItem>;
  cost: number;
  task_time: string;
}

interface KeywordItem {
  keyword: string;
  depth: number;
  search_volume: number | null;
  competition_level: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  cpc: number | null;
  keyword_difficulty: number | null;
  main_intent: string | null;
  monthly_searches: Array<{ year: number; month: number; search_volume: number }>;
  serp_features: string[];
  categories: number[];
  related_keywords_sub: string[];
}

Layout:
1. Header showing seed keyword in large font with a "Analyzed N keywords" subtitle (items_count / total_count).
2. KPI row: 4 cards — Total Volume (formatted with K/M), Avg CPC ($), Avg Difficulty (out of 100, with progress bar), Estimated Traffic Value (USD/month).
3. Aggregated monthly trend: area chart (recharts AreaChart) of monthly_aggregated showing total search volume over the last 12 months.
4. Three-column grid:
   - Intent distribution as a donut (recharts PieChart) with custom legend.
   - Competition distribution as a stacked horizontal bar.
   - Difficulty buckets as a 4-segment horizontal bar with colors green/yellow/orange/red for easy/medium/hard/very_hard.
5. "Low-hanging fruit" highlighted Card: top 5 from low_hanging_fruit list, each showing keyword, volume badge, difficulty pill (green if <30), CPC. Lead this card with a sparkle icon and copy "Oportunidades fáciles de capturar".
6. Main keywords table (@tanstack/react-table) with columns:
   - Keyword (sortable, with sub-keywords expandable on click)
   - Volume (with mini-sparkline of monthly_searches using recharts <Sparkline>)
   - Difficulty (colored pill)
   - CPC ($)
   - Competition (badge)
   - Intent (icon: 💡 informational, 💰 commercial, 🔍 navigational, 🛒 transactional)
   - SERP features (stacked badges)
7. Below table: a treemap of top_categories using recharts Treemap (the category_id needs to be displayed as a placeholder name like "Cat 10007" for now; map to real names later).

Filters: above the table, allow filtering by intent, competition_level, difficulty_buckets, depth.

Style: data-dense but readable. Use generous white space between sections. Spanish.
```

### Prompt 3 — Sección Keyword Data (volumen Google Ads)

```
Build a React + TypeScript component for a Google Ads keyword volume section using shadcn/ui, recharts, lucide-react, @tanstack/react-table.

Data shape from DataForSEO Keyword Data search_volume parser:

interface KeywordVolumeData {
  keywords_count: number;
  total_search_volume: number;
  avg_cpc: number;
  max_cpc: number;
  min_cpc: number;
  total_ppc_cost_estimate_usd: number;
  competition_distribution: Record<'LOW' | 'MEDIUM' | 'HIGH', number>;
  top_keywords_by_volume: Array<KeywordItem>;
  top_keywords_by_cpc: Array<KeywordItem>;
  monthly_aggregated: Array<{ year_month: string; search_volume: number }>;
  most_seasonal_keywords: Array<{ keyword: string; variation: number; peak_volume: number; trough_volume: number }>;
  keywords: Array<KeywordItem>;
  cost: number;
  task_time: string;
}

interface KeywordItem {
  keyword: string;
  search_volume: number | null;
  competition: string | null;
  competition_index: number | null;  // 0-100
  cpc: number | null;
  low_top_of_page_bid: number | null;
  high_top_of_page_bid: number | null;
  monthly_searches: Array<{ year: number; month: number; search_volume: number }>;
}

Layout:
1. KPI row: 4 cards — Total Volume, Avg CPC, Max/Min CPC range (one card showing both), Total PPC Cost Estimate (with tooltip explaining "1 click per keyword at max CPC").
2. Two-column row:
   - Aggregated monthly trend (recharts AreaChart) using monthly_aggregated.
   - Competition distribution as a donut chart.
3. "Estacionalidad detectada" card: list most_seasonal_keywords as rows with keyword + a sparkline showing peak/trough markers + the variation percentage as a badge. Use a TrendingUp icon.
4. Top performers row of 2 cards:
   - "Top por volumen" — top 5 from top_keywords_by_volume as ranked list with volume bars.
   - "Más caros (PPC)" — top 5 from top_keywords_by_cpc as ranked list with $ amounts and bid range.
5. Main table (@tanstack/react-table) of all keywords with columns: Keyword, Volume (with sparkline), Competition (badge), Competition Index (0-100 progress bar), CPC ($), Bid Range (low → high), View Trend (button opens a dialog with the full 12-month line chart for that keyword).
6. Below the table: a "Comparativa de keywords" multi-line chart where the user can toggle keywords from the table to overlay their monthly_searches series.

Filters: search input, min/max volume, competition multi-select.

Aesthetic: PPC/financial-dashboard feel — money-green accents, dollar signs, formatted numbers (Intl.NumberFormat 'es-CO'). Spanish.
```

### Prompt 4 — Sección OnPage (auditoría técnica)

```
Build a React + TypeScript component for an on-page SEO audit section using shadcn/ui, recharts, lucide-react.

Data shape from DataForSEO OnPage instant_pages parser:

interface OnPageData {
  url: string;
  status_code: number;
  health: {
    onpage_score: number;          // DataForSEO 0-100
    computed_health_score: number; // own 0-100
    issues_count: number;
    passing_count: number;
    is_indexable: boolean;
    http_status_class: '2xx' | '3xx' | '4xx' | '5xx' | 'unknown';
  };
  issues: Array<{ check: string; label: string; severity: 'critical' }>;
  passing_checks: Array<{ check: string; label: string }>;
  performance: {
    time_to_interactive_ms: number;
    dom_complete_ms: number;
    largest_contentful_paint: number;
    first_input_delay: number;
    cumulative_layout_shift: number;
    total_dom_size_bytes: number;
    page_size_bytes: number;
  };
  resources_breakdown: {
    scripts_count: number; scripts_size: number;
    stylesheets_count: number; stylesheets_size: number;
    images_count: number; images_size: number;
    render_blocking_scripts_count: number;
  };
  headings: { h1: string[]; h2: string[]; h3: string[]; h4: string[] };
  headings_count: { h1: number; h2: number; h3: number; h4: number; h5: number; h6: number };
  content: {
    plain_text_word_count: number;
    flesch_kincaid_readability_index: number;
    title_to_content_consistency: number;       // 0-1
    description_to_content_consistency: number; // 0-1
  };
  social_media_tags: Record<string, string>;
  title: string;
  description: string;
  canonical: string | null;
  duplicate_title: boolean;
  duplicate_description: boolean;
  resource_errors: Array<{ line: number; column: number; message: string; status_code: number }>;
  resource_warnings: Array<{ line: number; column: number; message: string; status_code: number }>;
  cost: number;
  task_time: string;
}

Layout:
1. Top hero card with the URL, the computed_health_score as a large radial progress (recharts RadialBarChart) sized prominently, and 3 small KPIs to the right: Issues found (red badge), Checks passing (green badge), Indexable (Yes/No with check or X icon). Color the radial: green ≥80, amber 50-79, red <50.
2. HTTP status indicator: a horizontal donut showing the http_status_class (just one slice colored, the rest gray, with the actual status_code in the center).
3. Two-column row:
   - "Issues críticos" Card listing issues[] as rows with a red AlertTriangle icon and the label. Show first 5 with "Ver todos (N)" button to expand.
   - "Checks aprobados" Card listing passing_checks[] with green CheckCircle icons.
4. Performance gauges row: 4 gauge charts (recharts RadialBarChart with single segment) for TTI, DOM Complete, LCP, FID. Color thresholds based on Google's Core Web Vitals (LCP good <2500ms amber <4000 red >, FID good <100 amber <300 red >, CLS good <0.1 amber <0.25 red >).
5. "Peso de recursos" stacked horizontal bar: scripts vs stylesheets vs images vs total page size. Show absolute KB values.
6. Headings hierarchy visualizer: render headings.h1 as <h1>-styled rows, h2 indented, h3 more indented, etc. (visual outline).
7. Content metrics card: word count, readability index (with explanation tooltip — Flesch-Kincaid 0-30 hard, 60-70 plain English, 90+ very easy), title/description consistency as progress bars (0-100%).
8. Resource errors table: collapsible Accordion showing resource_errors and resource_warnings as separate sections.
9. Social media preview: side-by-side cards mocking how the page appears as Open Graph (Facebook/LinkedIn) and Twitter Card, populated from social_media_tags.

Aesthetic: technical-audit feel similar to PageSpeed Insights or Ahrefs Site Audit. Use traffic-light colors consistently (green/amber/red) for severity. Spanish.
```

---

## Próximos pasos sugeridos

1. **Endpoints adicionales valiosos** que no integré pero puedes añadir con la misma plantilla:
   - `dataforseo_labs/google/competitors_domain/live` — top 10 competidores orgánicos del dominio del cliente.
   - `dataforseo_labs/google/domain_intersection/live` — keywords compartidas entre el cliente y un competidor (para Venn diagrams).
   - `keywords_data/google_trends/explore/live` — interés geográfico y temporal por keyword.
   - `on_page/lighthouse/live/json` — Performance / Accessibility / Best Practices / SEO scores oficiales de Lighthouse.

2. **Job de snapshots diarios** con Cloud Scheduler → Cloud Run que reejecute `get_serp_data` para las top 20 keywords del cliente y guarde resultados en Firestore. Eso desbloquea Volatility Index, Position Tracking y Traffic Trends en el dashboard.

3. **Capa de mapeo de category IDs** — descargar una vez la tabla de Google Ads categories de DataForSEO y cachearla para que el treemap de Labs muestre nombres legibles en lugar de IDs.