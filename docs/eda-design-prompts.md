# EDA — Design Prompts

> Documento canónico con todos los prompts de diseño para EDA. Cada prompt está listo para pegarse directo en claude.ai (modelo Opus o Sonnet) y producir un componente React + TypeScript completo.
>
> **Brand**: EDA — *Evalúa. Descubre. Alcanza.*
> **Audiencia**: pymes de Latinoamérica.
> **Stack**: Next.js 14 + TypeScript + Tailwind + shadcn/ui + recharts + lucide-react.

---

## 1. Brand & Design System

Esta sección define el lenguaje visual compartido. Cada prompt de abajo asume estos valores; sin necesidad de repetirlos en el prompt individual, le dices a Claude design "respeta el design system de EDA descrito en la sección 1" y se ahorra repetición.

### Identidad

- **Nombre**: EDA
- **Tagline**: "Evalúa. Descubre. Alcanza."
- **Pronunciación**: "É-da" (2 sílabas, fácil en español)
- **Concepto**: el acrónimo es a la vez el nombre y la promesa del producto.
- **Logo**: forma circular dibujada a mano (estilo orgánico, líneas ligeras), con un brote verde creciendo desde abajo y una flecha-brújula apuntando hacia arriba-derecha. Mezcla las metáforas de **crecimiento** (planta), **dirección** (flecha-brújula) y **detección/radar** (círculo concéntrico).

### Paleta de color

| Token | Valor | Uso |
| --- | --- | --- |
| `eda-green` | `#22c55e` | Acento principal, CTAs, badges positivos, elementos de marca |
| `eda-green-dark` | `#16a34a` | Hover states, énfasis fuerte |
| `eda-green-soft` | `#bbf7d0` | Backgrounds suaves, highlights |
| `bg-primary` | `#0a0a0a` | Background principal del tema oscuro (landing, dashboard hero) |
| `bg-secondary` | `#171717` | Cards, secciones secundarias en oscuro |
| `bg-light` | `#fafafa` | Background del tema claro (dashboard data-heavy) |
| `text-primary-dark` | `#fafafa` | Texto principal sobre oscuro |
| `text-primary-light` | `#0a0a0a` | Texto principal sobre claro |
| `text-muted` | `#737373` | Texto secundario |
| `border-subtle` | `#262626` (dark) / `#e5e5e5` (light) | Bordes |
| `success` | `#10b981` | Estados "good" / "passing" |
| `warning` | `#f59e0b` | Estados "needs improvement" |
| `error` | `#ef4444` | Estados "poor" / errores críticos |
| `cwv-good` | `#0CCE6B` | Color oficial Google Core Web Vitals "good" |
| `cwv-amber` | `#FFA400` | Color oficial CWV "needs improvement" |
| `cwv-poor` | `#FF4E42` | Color oficial CWV "poor" |

### Tipografía

- **Sans principal**: Geist Sans (o Inter como fallback). `font-feature-settings: "cv11"` activado.
- **Sans display** (hero / headlines grandes): Geist Sans `font-weight: 700`, `letter-spacing: -0.04em`.
- **Mono** (números, métricas, badges técnicos): Geist Mono o JetBrains Mono.
- **Acento manuscrito** (kickers en landing, etiquetas decorativas): Caveat o Sloop Script. **Usar con moderación** — solo en landing y headers grandes para conectar con la estética hand-drawn del logo.

### Vibe / dirección de diseño

- Inspiración: **mezcla de Linear (limpieza técnica) + Cal.com (cercanía) + un toque hand-drawn que conecta con el logo**.
- Backgrounds dominantemente oscuros en landing y zonas hero del dashboard. Backgrounds claros en zonas data-heavy del dashboard (tablas, dashboards de keywords) para reducir fatiga visual.
- Bordes redondeados consistentes: `rounded-2xl` para cards grandes, `rounded-lg` para inputs y elementos pequeños.
- **Generosa cantidad de white space** — nada de UIs apretadas. SMBs LATAM se asustan con dashboards que parecen Bloomberg.
- Microinteracciones suaves (hover, transiciones). Nada de animaciones agresivas.
- Iconografía: `lucide-react` exclusivamente. Stroke width 1.5 para tamaños grandes, 2 para pequeños.
- Cuando un componente conecta visualmente con la marca, considera elementos sutiles que evoquen el logo: líneas dibujadas a mano como divisores, un brote verde como ornamento, círculos concéntricos sutiles en backgrounds.

### Voz y copy

- **Idioma**: español neutro de LATAM (sin modismos regionales).
- **Tratamiento**: tú, siempre. Nunca "usted".
- **Tono**: directo, claro, confiado. Sin marketing-speak vacío. Sin emojis decorativos en UI; sí permitidos en marketing y onboarding.
- **Ejemplos del tono**:
  - ✅ "Tu salud digital es 65/100. Hay 3 cosas que están limitando tu visibilidad."
  - ❌ "Empower your business with cutting-edge AI-driven insights."
  - ✅ "Reclama tu listing de Google. Toma 10 minutos."
  - ❌ "Optimize your local SEO presence with our advanced toolkit."

### Componentes shadcn/ui usados

`Button`, `Card`, `Badge`, `Dialog`, `Drawer`, `Tabs`, `Tooltip`, `Alert`, `Skeleton`, `Progress`, `Popover`, `Select`, `Slider`, `Switch`, `Table`, `Toast`. Instalar todos con CLI antes de pegar prompts.

---

## 2. Prompt — Sección SERP del dashboard

```
Build a React + TypeScript component for a SERP analysis dashboard section in EDA (a SaaS for LATAM SMBs). Use shadcn/ui, recharts, lucide-react, and @tanstack/react-table. Apply the EDA design system: dark theme acceptable, eda-green (#22c55e) as primary accent, generous white space.

The component receives a `data` prop with this shape:

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
2. Below: 2-column grid. Left: ranking distribution as horizontal bar chart (recharts BarChart). Right: top 10 domains as numbered list with favicon (https://www.google.com/s2/favicons?domain=X).
3. AI Overview section (only if has_ai_overview): a Card with a brain icon, the markdown rendered with react-markdown, and references as horizontal scrolling chip list below.
4. Main organic results table using @tanstack/react-table. Columns: Rank (badge), Domain (with favicon), Title (linkable, with breadcrumb subtitle), Description (with `highlighted` terms wrapped in <mark>), Sitelinks count. Highlight rows where domain matches target_visibility.domain. Featured snippet shows a star icon next to rank.
5. Right sidebar (or below table on mobile): related searches as clickable chips that call onSearchAgain(keyword) prop.
6. Footer: small operational stats — cost in USD, response time, datetime, and a Button "Ver SERP en Google" opening check_url.

All copy in Spanish. Mobile responsive.
```

---

## 3. Prompt — Sección DataForSEO Labs (keyword research)

```
Build a React + TypeScript component for a keyword research section in EDA dashboard. Use shadcn/ui, recharts, lucide-react, and @tanstack/react-table. Apply the EDA design system.

Data shape:

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
  top_categories: Array<{ category_id: number; count: number; category_name?: string }>;
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
1. Header showing seed keyword in large font with subtitle "Analizadas N keywords" (items_count / total_count).
2. KPI row: 4 cards — Volumen Total (formatted K/M), CPC Promedio ($), Dificultad Promedio (out of 100, with progress bar), Valor de Tráfico Estimado (USD/mes).
3. Aggregated monthly trend: area chart (recharts AreaChart) of monthly_aggregated showing total search volume over last 12 months.
4. Three-column grid:
   - Intent distribution as donut (recharts PieChart) with custom legend.
   - Competition distribution as stacked horizontal bar.
   - Difficulty buckets as 4-segment horizontal bar with colors green/yellow/orange/red for easy/medium/hard/very_hard.
5. "Oportunidades fáciles" highlighted Card: top 5 from low_hanging_fruit, each showing keyword, volume badge, difficulty pill (eda-green if <30), CPC. Lead with sparkle icon and copy "Quick wins disponibles".
6. Main keywords table (@tanstack/react-table) with columns:
   - Keyword (sortable, with sub-keywords expandable on click)
   - Volume (with mini-sparkline of monthly_searches using recharts)
   - Difficulty (colored pill)
   - CPC ($)
   - Competition (badge)
   - Intent (icon: 💡 informational, 💰 commercial, 🔍 navigational, 🛒 transactional)
   - SERP features (stacked badges)
7. Below table: treemap of top_categories using recharts Treemap.

Filters above table: by intent, competition_level, difficulty_buckets, depth.

All copy in Spanish. Generous white space between sections.
```

---

## 4. Prompt — Sección Keyword Data (volumen Google Ads)

```
Build a React + TypeScript component for a Google Ads keyword volume section in EDA dashboard. Use shadcn/ui, recharts, lucide-react, @tanstack/react-table. Apply EDA design system.

Data shape:

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
  competition_index: number | null;
  cpc: number | null;
  low_top_of_page_bid: number | null;
  high_top_of_page_bid: number | null;
  monthly_searches: Array<{ year: number; month: number; search_volume: number }>;
}

Layout:
1. KPI row: 4 cards — Volumen Total, CPC Promedio, Rango CPC (Max/Min en una sola card), Costo PPC Estimado (with tooltip "1 click por keyword al CPC máximo").
2. Two-column row:
   - Tendencia mensual agregada (recharts AreaChart) using monthly_aggregated.
   - Distribución de competencia as donut chart.
3. "Estacionalidad detectada" card: list most_seasonal_keywords as rows with keyword + sparkline showing peak/trough markers + variation percentage as badge. Use TrendingUp icon.
4. Top performers row of 2 cards:
   - "Top por volumen" — top 5 from top_keywords_by_volume as ranked list with volume bars.
   - "Más caros (PPC)" — top 5 from top_keywords_by_cpc as ranked list with $ amounts and bid range.
5. Main table (@tanstack/react-table) of all keywords with columns: Keyword, Volume (with sparkline), Competition (badge), Competition Index (0-100 progress bar), CPC ($), Bid Range (low → high), Ver Tendencia (button opens Dialog with full 12-month line chart for that keyword).
6. Below table: "Comparativa de keywords" multi-line chart where user can toggle keywords from table to overlay their monthly_searches series.

Filters: search input, min/max volume, competition multi-select.

Aesthetic: financial-dashboard feel, eda-green accents, dollar signs, formatted numbers (Intl.NumberFormat 'es-CO'). Spanish.
```

---

## 5. Prompt — Sección OnPage (auditoría técnica)

```
Build a React + TypeScript component for an on-page SEO audit section in EDA dashboard. Use shadcn/ui, recharts, lucide-react. Apply EDA design system.

Data shape:

interface OnPageData {
  url: string;
  status_code: number;
  health: {
    onpage_score: number;
    computed_health_score: number;
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
    title_to_content_consistency: number;
    description_to_content_consistency: number;
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
1. Top hero card: URL on left, computed_health_score as large radial progress (recharts RadialBarChart) prominent in center, 3 small KPIs to right: Issues found (red badge), Checks passing (eda-green badge), Indexable (Yes/No with check or X icon). Color radial: eda-green ≥80, amber 50-79, red <50.
2. HTTP status indicator: horizontal donut showing http_status_class (only one slice colored, rest gray, status_code in center).
3. Two-column row:
   - "Issues críticos" Card listing issues[] as rows with red AlertTriangle icon and label. First 5 with "Ver todos (N)" expandable.
   - "Checks aprobados" Card listing passing_checks[] with eda-green CheckCircle icons.
4. Performance gauges row: 4 gauge charts (recharts RadialBarChart single segment) for TTI, DOM Complete, LCP, FID. Color thresholds based on Google Core Web Vitals (LCP good <2500ms amber <4000 red >, FID good <100 amber <300 red >, CLS good <0.1 amber <0.25 red >).
5. "Peso de recursos" stacked horizontal bar: scripts vs stylesheets vs images vs total page size. Show absolute KB values.
6. Headings hierarchy visualizer: render headings.h1 as h1-styled rows, h2 indented, h3 more indented (visual outline).
7. Content metrics card: word count, readability index (with explanation tooltip — Flesch-Kincaid 0-30 hard, 60-70 plain English, 90+ very easy), title/description consistency as progress bars (0-100%).
8. Resource errors table: collapsible Accordion showing resource_errors and resource_warnings as separate sections.
9. Social media preview: side-by-side cards mocking how page appears as Open Graph (FB/LinkedIn) and Twitter Card, populated from social_media_tags.

Aesthetic: technical-audit feel similar to PageSpeed Insights or Ahrefs Site Audit. Traffic-light colors (green/amber/red) for severity. Spanish.
```

---

## 6. Prompt — Sección Health Score (hero del dashboard)

```
Build a React + TypeScript "Salud Digital" hero component using shadcn/ui, recharts, lucide-react. This is the very top of the EDA audit dashboard.

Data shape (from audit.scores):

interface ScoreData {
  health_score: number;              // 0-100
  available_dimensions: number;      // 1-4
  total_dimensions: number;          // 4
  breakdown: {
    seo_score: { score: number | null; weight_base: number; weight_used: number };
    performance_score: { score: number | null; weight_base: number; weight_used: number };
    social_score: { score: number | null; weight_base: number; weight_used: number };
    reputation_score: { score: number | null; weight_base: number; weight_used: number };
  };
}

Layout:
1. Left side (40% width): large radial gauge using recharts RadialBarChart showing composite health_score (0-100). Color: eda-green ≥80, amber 50-79, red <50. The number itself centered inside radial in very large font (4xl-6xl). Below: "Salud Digital" label + "N de 4 dimensiones evaluadas" using available_dimensions/total_dimensions.

2. Right side (60% width): the breakdown. Title: "Cómo se compone tu puntaje". Below: 4 horizontal rows, one per dimension (SEO, Rendimiento, Social, Reputación):
   - Each row: dimension name + lucide icon (Search, Zap, Users, Star)
   - Score number on right (or "Sin datos" if null)
   - Horizontal progress bar showing score (0-100), colored by score
   - Below bar, small label showing weight_used "(58% del puntaje)" or "(no contribuye)"
   - Dimensions with null score visually muted (60% opacity), show "Próximamente" pill

3. Below both: thin alert/info bar (shadcn Alert) only if available_dimensions < 4: "Tu puntaje se calcula con N de 4 dimensiones. Activa más fuentes para un panorama completo." with a CTA button.

Style:
- Background: subtle gradient on bg-secondary (#171717)
- Use eda-green (#22c55e) as primary accent
- Generous padding
- Responsive: stack vertically on mobile (radial top, breakdown below)
- Smooth fade-in animation when data loads
```

---

## 7. Prompt — Sección CrUX Core Web Vitals

```
Build a React + TypeScript "Core Web Vitals" component for the EDA dashboard. Combines current CrUX data + 6-month history. Uses shadcn/ui, recharts, lucide-react. Apply EDA design system.

Data shape:

interface CruxData {
  origin: string;
  collection_period: { from: string; to: string };
  performance_score: number;
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

Component receives both: { current: CruxData | null; history: CruxHistoryData | null }. When current is null, show "Este sitio no tiene suficiente tráfico en Chrome para reportar datos reales de UX. Mostramos métricas sintéticas del crawler como fallback."

Layout:

1. Header: "Core Web Vitals" title + subtitle showing collection_period dates + Badge showing form_factor (Desktop/Mobile).

2. Hero "Web Vitals Assessment" card (PSI-style): Big card showing whether site PASSES Core Web Vitals (LCP, INP, CLS all need to be 'good' or 'needs_improvement' — only 'poor' fails). Big icon (CheckCircle eda-green or XCircle red), "PASA Core Web Vitals" or "NO PASA Core Web Vitals" text, and 3 key metrics inline as small badges with their ratings.

3. 5-metric grid (3 cols desktop, 2 tablet, 1 mobile). Each metric card:
   - Metric name in Spanish (LCP="Pintado de Contenido Más Grande", INP="Interacción al Próximo Paint", CLS="Cambio Acumulativo de Layout", FCP="Pintado de Contenido Inicial", TTFB="Tiempo al Primer Byte")
   - Big p75 value with unit
   - Rating badge (eda-green "Bueno" / amber "Necesita mejora" / red "Pobre" / gray "Sin datos")
   - Tiny sparkline (if history available) showing last 25 weekly p75 values, line color matching current rating
   - Trend indicator: TrendingUp/TrendingDown/Minus icon + delta_pct, colored eda-green if 'improving', red if 'degrading', gray if 'stable'
   - Click card → opens Dialog with full history chart

4. Full history chart Dialog:
   - Title: metric name + current rating
   - LineChart (recharts) sized 600x300:
     - X axis: weekly dates from timeseries
     - Y axis: p75 values
     - Line: stroke eda-green, dataKey "p75"
     - Background bands using ReferenceArea: cwv-good band 0→good_threshold, cwv-amber band good→needs_improvement, cwv-poor band needs_improvement→max
     - Tooltip showing date_from + date_to + p75 + rating
   - Below chart: 4 stat boxes — current p75, previous p75, delta_pct, trend label
   - Footer: small explanatory text in Spanish about what this metric measures

5. Performance Score gauge top right: small RadialBarChart showing performance_score (0-100), labeled "Performance Score".

Use the official Core Web Vitals colors (cwv-good, cwv-amber, cwv-poor) for ratings — not eda-green for good states in CWV cards (this aligns visual language with PageSpeed Insights which users may know).

Special handling:
- If history null but current not null: hide sparklines and trends, show basic metric cards.
- If both null: empty state with "no traffic" message + fallback to OnPage performance.

Spanish throughout.
```

---

## 8. Prompt — Sección Business Profile (Google Business)

```
Build a React + TypeScript "Perfil de Google Business" dashboard section in EDA. Use shadcn/ui, recharts, lucide-react, and Mapbox GL. Apply EDA design system.

Data shape (from audit.data.business_info):

interface BusinessInfo {
  found: boolean;
  name: string;
  original_name: string | null;
  is_renamed: boolean;
  description: string | null;
  category: { primary: string; ids: string[]; additional: string[] };
  ids: { cid: string; place_id: string; feature_id: string };
  contact: {
    phone: string | null;
    website_url: string | null;
    domain: string | null;
    contact_url: string | null;
    book_online_url: string | null;
  };
  location: {
    address: string;
    city: string | null;
    country_code: string | null;
    latitude: number;
    longitude: number;
  };
  media: { logo_url: string | null; main_image_url: string | null; total_photos: number };
  status: {
    is_claimed: boolean;
    operating_status: 'open' | 'closed_permanently' | 'closed_temporarily' | 'unknown';
    price_level: 'free' | 'inexpensive' | 'moderate' | 'expensive' | 'very_expensive' | null;
  };
  reviews: {
    rating: { value: number; votes_count: number };
    rating_distribution: Record<string, number>;
    rating_distribution_pct: Record<string, number>;
    place_topics: Array<{ topic: string; mentions: number }>;
  };
  attributes: { available: Record<string, string[]> | null };
  profile_completeness: {
    score: number;
    missing: Array<{ field: string; label: string; weight: number }>;
    present: Array<{ field: string; label: string; weight: number }>;
  };
  check_url: string;
}

Layout:

1. Hero card. Left: hero image (media.main_image_url) with logo overlaid bottom-left if present. Right: name large. Below name: original_name in muted italic if is_renamed (with tag "Renombrado"). Below: primary category as Badge, price_level as $ symbols. Below: rating (4.2 ★) + "(515 reseñas)". Top right: CTA "Ver en Google Maps" → check_url.

2. Critical alerts row (only if applicable). shadcn Alert destructive variant:
   - operating_status === 'closed_permanently': "Este negocio está marcado como cerrado permanentemente en Google."
   - operating_status === 'closed_temporarily': "Cerrado temporalmente — actualiza el horario en Google Business."
   - !is_claimed: "Este listing no ha sido reclamado. Reclámalo en business.google.com para tomar control."
   - is_renamed: "El nombre cambió de '{original_name}' a '{name}'. Considera comunicarlo a clientes."

3. Two-column row:

   LEFT — "Completitud del perfil" Card:
   - Big radial gauge (recharts RadialBarChart) showing profile_completeness.score, color eda-green ≥80, amber 50-79, red <50.
   - Below: checklist. For each item in profile_completeness.missing, row with red XCircle + label + Badge "+{weight} pts". For each in present, eda-green CheckCircle + label.
   - Hover on missing row → tooltip "Cómo arreglar esto".

   RIGHT — "Lo que dicen tus clientes" Card (place_topics):
   - Header: "Temas más mencionados en reseñas"
   - Large chips/tags list, sized by mentions (font-size scaling 12-24px based on relative mentions).
   - Click chip → could filter reviews section (placeholder onClick).

4. "Distribución de calificaciones" Card with horizontal bar chart:
   - 5 rows for 5★, 4★, 3★, 2★, 1★
   - Each row: stars left, horizontal bar (width = rating_distribution_pct[N]%), count right
   - Bars colored: 5★=eda-green, 4★=lime, 3★=amber, 2★=orange, 1★=red

5. Contact card (compact list):
   - Phone with Phone icon (clickable tel:)
   - Website with Globe icon (or "No vinculado" muted if null) — show "Vincular sitio web" button if null
   - Book online with Calendar icon (only if book_online_url)
   - Address with MapPin icon

6. Map card (Mapbox or Google Maps embed) 400x300, pin at lat/lng. Click pin → opens check_url.

7. Attributes card (only if attributes.available exists): grouped chips by category — "Opciones de servicio", "Ofertas", etc. Each attribute is a Badge.

Spanish throughout. Mobile responsive.
```

---

## 9. Prompt — Sección Discover Prospects (pilar Descubre)

```
Build a React + TypeScript "Descubrir Prospectos" dashboard section in EDA. Use shadcn/ui, @tanstack/react-table, lucide-react, recharts, Mapbox GL. Apply EDA design system.

Data shape (from audit_engine.discover_prospects → result):

interface DiscoverResult {
  items_count: number;
  total_count: number;
  prospects: Array<Prospect>;          // sorted by opportunity_score desc
  high_opportunity: Array<Prospect>;
  high_opportunity_count: number;
  unclaimed_count: number;
  unclaimed_pct: number;
  no_website_count: number;
  no_website_pct: number;
  operating_status_distribution: Record<string, number>;
  top_categories: Array<{ category: string; count: number }>;
}

interface Prospect {
  name: string;
  category: { primary: string; ids: string[] };
  contact: { phone: string | null; website_url: string | null };
  location: { city: string; latitude: number; longitude: number; address: string };
  media: { main_image_url: string | null; total_photos: number };
  status: { is_claimed: boolean; operating_status: string; price_level: string | null };
  reviews: { rating: { value: number; votes_count: number } };
  profile_completeness: { score: number; missing: Array<{ field: string; label: string }> };
  opportunity_score: { score: number; weakness_signals: string[] };
}

Layout:

1. Top filter bar (sticky):
   - Categories multi-select (autocomplete from /business-categories endpoint)
   - Location: input "lat,lng,radius_km" OR button "Usar mapa" toggling Mapbox circle drawer
   - Filters row: "Solo no reclamados" toggle, "Min rating" slider (0-5), "Min reviews" input
   - Apply button triggers re-fetch.

2. KPI row of 4 cards:
   - "Prospectos encontrados" → items_count + subtitle "de N en la zona"
   - "No reclamados" → unclaimed_count + unclaimed_pct% (highlighted as opportunity)
   - "Sin sitio web" → no_website_count + no_website_pct%
   - "Alta oportunidad" → high_opportunity_count + Badge "Score ≥ 60"

3. Two-column row:
   LEFT — Mapbox map (60% width, 500px tall):
   - All prospects as pins, colored by opportunity_score (gradient red→amber→eda-green)
   - Click pin → popup with name, score, link to detail
   - Cluster pins when zoomed out

   RIGHT — Top 20 high opportunity list (40% width, scrollable):
   - Each row: thumbnail (main_image_url) + name + category + opportunity_score badge + rating + key weakness chips (top 3 from weakness_signals)
   - Click row → opens prospect detail Drawer
   - Action: "Generar outreach" button calling onGenerateOutreach(prospect)

4. Distribution row of 2 cards:
   - "Categorías" — treemap of top_categories (recharts Treemap)
   - "Estado operativo" — donut of operating_status_distribution

5. Full prospects table (@tanstack/react-table) below. Columns:
   - Name (avatar from main_image_url, address subtitle)
   - Category (Badge)
   - City
   - Rating (★ + count)
   - Opportunity Score (large colored badge: red 0-39, amber 40-59, eda-green 60-79, blue 80+)
   - Weaknesses (chips with labels of missing fields, max 3 visible + "+N")
   - Claimed (Yes/No icon)
   - Website (✓ / "—")
   - Action: "Generar outreach" button per row
   - Sortable by opportunity_score, rating, name
   - Virtualized with @tanstack/react-virtual (lists can be 100-1000 rows)
   - Selection checkboxes for bulk actions

6. Bulk action footer (when rows selected): "Generar outreach para N prospectos" big primary button.

Color the opportunity_score badges consistently across map pins, list, and table.

Spanish throughout. Mobile: collapse map below KPIs, hide some columns.
```

---

## 10. Prompt — Landing Page de EDA (NUEVO)

```
Build a complete responsive landing page for EDA — a SaaS that audits, discovers prospects, and automates outreach for LATAM small businesses. Stack: Next.js 14 App Router + TypeScript + Tailwind CSS + shadcn/ui + lucide-react + Framer Motion (for subtle scroll animations).

Apply the EDA design system (see context). Brand summary:
- Name: EDA (pronounced "É-da")
- Tagline: "Evalúa. Descubre. Alcanza."
- Logo: hand-drawn green sprout + compass-arrow inside a circular form (placeholder /logo-eda.png — user will provide)
- Audience: dueños de pymes en LATAM (Colombia, México, Perú, Chile, Argentina), sin equipo de marketing dedicado
- Voice: tú (informal), directo, sin marketing-speak

# Visual direction

- Dark theme dominant (bg-primary #0a0a0a) with eda-green (#22c55e) as accent
- Hand-drawn motifs as decorative elements (sketchy lines, leaf shapes, organic dividers) inspired by the logo
- Bold display typography for hero, generous white space
- Subtle background grid or gradient blob in eda-green at low opacity behind hero
- Smooth scroll, fade-in on viewport enter (Framer Motion `whileInView`)
- Mobile-first, fully responsive

# Sections (in order)

## 1. Sticky Navbar
- Logo on left (clickable home)
- Center: links to "Producto", "Precios", "Casos", "Blog"
- Right: "Iniciar sesión" (ghost), "Empezar gratis" (primary, eda-green)
- Background: blur backdrop on scroll, transparent at top
- Mobile: hamburger menu

## 2. Hero
- Layout: 2-column on desktop, stacked on mobile
- Left column (text):
  - Small kicker (Caveat or similar handwritten font, eda-green): "Para pymes de Latinoamérica"
  - Headline (Geist Sans Bold, 5xl-7xl, tight tracking): something like "Tu negocio en Google. Auditado, optimizado, conectado." (suggest 2-3 alternative headlines as comments — keep it under 10 words, outcome-focused, NOT "empower" / "AI-powered" / "next-gen")
  - Subhead (xl, muted): explica en 1-2 oraciones qué hace EDA en términos del dueño del negocio. Algo como "EDA escanea tu presencia digital, encuentra clientes potenciales que necesitan lo que ofreces, y los contacta por ti — todo en automático."
  - Primary CTA: "Audita tu negocio gratis" → eda-green button
  - Secondary CTA: "Ver demo" → ghost button con icono Play
  - Below CTAs: small line "Sin tarjeta de crédito · Resultados en 90 segundos"
- Right column: a mockup of the dashboard (use a placeholder /dashboard-mockup.png — but design the image area to look like a tilted/floating browser window with a soft shadow and a subtle eda-green glow behind it). On the placeholder mockup show simulated cards like "Salud Digital: 65/100", "12 prospectos encontrados", "3 mensajes enviados".

## 3. The 3 Pillars (E.D.A. unfolded)
- Three large cards in a row (stacked on mobile)
- Each card has:
  - Large letter (E / D / A) in Caveat or hand-drawn style, eda-green, 8xl, slight rotation for organic feel
  - Title in Spanish: "Evalúa", "Descubre", "Alcanza"
  - One-sentence description:
    - Evalúa: "Auditamos tu sitio, redes y reseñas. Sabe exactamente cómo te ven Google y tus clientes."
    - Descubre: "Encontramos negocios en tu zona y categoría que probablemente necesitan lo que ofreces."
    - Alcanza: "Generamos y enviamos un mensaje personalizado a cada prospecto. Conversaciones reales, automáticas."
  - Visual element per card (use lucide icons: Telescope for Evalúa, Compass for Descubre, Send for Alcanza)
  - Subtle hand-drawn divider line between cards (SVG)

## 4. How It Works (Cómo funciona)
- Title: "Tres pasos. 90 segundos."
- 3 horizontal steps with connecting hand-drawn arrow lines:
  - Paso 1: "Conecta tu negocio" — input field mockup showing "miempresa.com.co" with eda-green submit
  - Paso 2: "EDA hace su magia" — animated dots / scanning visual (simulated, stylized) with overlapping cards: "Analizando SEO...", "Buscando prospectos...", "Generando mensajes..."
  - Paso 3: "Recibe tu reporte" — preview of dashboard or email mockup
- Below: small CTA "Probarlo ahora →"

## 5. Feature Spotlights (3 sections, alternating layout)
- Each feature spotlight = one full-width section with:
  - Title (lg)
  - Description paragraph
  - Bullet list of 3-4 sub-features (with eda-green Check icons)
  - Visual mockup on opposite side (alternating left-right per section)

Sections:
- Spotlight 1 ("Auditoría completa en 90 segundos"): mock dashboard image, bullets like "Core Web Vitals reales · SEO técnico · Perfil de Google · Reseñas analizadas con IA · Recomendaciones priorizadas"
- Spotlight 2 ("Tu base de prospectos siempre fresca"): mock map+list image, bullets like "Filtrado por categoría y zona · Score de oportunidad por negocio · Información de contacto verificada · Actualización continua"
- Spotlight 3 ("Outreach que se siente humano"): mock email/WhatsApp message image, bullets like "Mensaje personalizado por prospecto · Referencia datos específicos · Seguimiento de aperturas y respuestas · Compatible con email y formularios de contacto"

## 6. Social Proof / Testimonials
- Title: "Negocios que ya están creciendo con EDA"
- Logo strip (placeholder logos of 6-8 fictitious companies — use simple monochrome SVG placeholders)
- 3 testimonial cards in a row (mobile stack):
  - Quote in italic
  - Author photo (placeholder), name, role, company
  - Use realistic placeholder copy like: "Reclamamos nuestro perfil de Google y agregamos 5 fotos. La semana siguiente recibimos 40% más llamadas." — María, dueña de Pizzeria Mario, Bogotá
- Note in code: testimonios reales se cargarán dinámicamente desde CMS

## 7. Pricing
- Title: "Precios simples"
- Subtitle: "Empieza gratis. Crece a tu ritmo."
- 3 plan cards side by side (stack on mobile):
  - **Free**: $0 / mes, 1 auditoría/mes, ver prospectos, sin outreach. CTA "Empezar gratis"
  - **Starter**: $29 USD / mes, 10 auditorías, 100 prospectos, 50 mensajes outreach, soporte chat. CTA "Probar 14 días gratis". Badge "Más popular" en eda-green.
  - **Growth**: $79 USD / mes, 50 auditorías, 1000 prospectos, 500 mensajes, integraciones (CRM, WhatsApp Business), prioridad. CTA "Hablar con ventas"
- Below: small line "Precios en USD. Facturación mensual o anual (15% descuento). Cancela cuando quieras."
- FAQ-style note: "¿Necesitas algo a medida? Tenemos plan Agencia (multi-cliente, white-label) — contáctanos."

## 8. FAQ
- Title: "Preguntas frecuentes"
- Use shadcn Accordion. 6-8 preguntas:
  - "¿Cómo funciona la auditoría?"
  - "¿De dónde sacan los datos de mi negocio?"
  - "¿El outreach por correo es legal en mi país?" (importante: aborda LFPDPPP en MX, Habeas Data en CO, etc — sin ser exhaustivo, decir "EDA cumple con las regulaciones de privacidad de cada país y solo contacta negocios con información pública")
  - "¿Puedo cancelar cuando quiera?"
  - "¿Qué pasa si no tengo sitio web?"
  - "¿Cuántos clientes necesito tener para que valga la pena?"
  - "¿Funciona para mi categoría de negocio?"
  - "¿Tienen integración con WhatsApp?"
- Espacio para que el usuario complete las respuestas tras revisar.

## 9. Final CTA
- Full-width section, dark background with subtle eda-green glow
- Big text: "Empieza a crecer en 90 segundos."
- Subtitle: "Tu primera auditoría es gratis. No necesitas tarjeta."
- Big primary button "Audita tu negocio →"

## 10. Footer
- 4-column on desktop, stacked on mobile:
  - Col 1: Logo + tagline + small description
  - Col 2: "Producto" — links a Características, Precios, Cambios, Roadmap
  - Col 3: "Empresa" — Sobre nosotros, Blog, Casos de éxito, Contacto
  - Col 4: "Legal" — Términos, Privacidad, Cookies, GDPR/LFPDPPP/Habeas Data
- Bottom strip: copyright "© 2026 EDA · Hecho en Latinoamérica 🌎" + social icons (X, LinkedIn, YouTube)

# Technical requirements

- Next.js 14 App Router structure: `app/page.tsx` for the landing
- Use `"use client"` only where needed (Framer Motion components, interactive nav)
- Server-render the rest for SEO
- Add proper meta tags (title, description, OG, Twitter card) — use Next.js Metadata API
- Add structured data JSON-LD for Organization
- Lighthouse: aim for 90+ Performance and 95+ SEO
- Lazy-load images with next/image
- Use `'sr-only'` labels appropriately
- Spanish HTML lang attribute: `<html lang="es">`

# Code organization

Create components in:
- `components/landing/Navbar.tsx`
- `components/landing/Hero.tsx`
- `components/landing/Pillars.tsx`
- `components/landing/HowItWorks.tsx`
- `components/landing/FeatureSpotlight.tsx` (parametrized, reused 3 times)
- `components/landing/SocialProof.tsx`
- `components/landing/Pricing.tsx`
- `components/landing/FAQ.tsx`
- `components/landing/FinalCTA.tsx`
- `components/landing/Footer.tsx`

Keep all copy in Spanish. Headlines in Geist Sans Bold with negative letter-spacing. Body in Geist Sans Regular. Handwritten accents (kickers above headlines) in Caveat.

# Final notes

- Don't try to be cute with copy — be specific. Numbers > adjectives. "12 prospectos por semana" > "many prospects".
- Mention LATAM cities sparingly but explicitly: "Bogotá", "Ciudad de México", "Lima" — give the page a local feel.
- Avoid generic stock photography. If using imagery, prefer abstract illustrations with hand-drawn character matching the logo, or actual product mockups.
- Keep the page under 3MB total. Optimize images.
```

---

## Notas finales sobre el sistema completo

Cada uno de los 9 prompts anteriores produce un componente independiente. Los 8 primeros componen el dashboard de auditoría completo. El último (sección 10) genera la landing pública.

Para mantener consistencia entre todos:

1. **Crea primero `app/globals.css`** con las CSS variables de la paleta de color de la sección 1.
2. **Configura `tailwind.config.ts`** para exponer `eda-green`, `eda-green-dark`, etc. como utilities.
3. **Comparte los tipos TypeScript** en `types/audit.ts` y `types/business.ts` para que cada sección importe en lugar de redefinir.
4. **Usa el mismo wrapper de skeleton** en todas las secciones cuando los datos están cargando.
5. Cuando un prompt genere copy en español, valida que respete el tratamiento "tú" y la voz directa.