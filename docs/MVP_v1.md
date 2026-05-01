# EDA — MVP Backend Completo

> Integración de los tres skipes (DataForSEO + CrUX + Claude) cubriendo los pilares **Evalúa**, **Descubre** y la base para **Alcanza**. Este documento registra cómo encajan, qué endpoints están integrados, costos, latencias, y prompts listos para Claude design.

---

## 1. Estado del MVP — qué cubre cada pilar

| Pilar | Estado | Endpoints clave | Output del backend |
| --- | --- | --- | --- |
| **Evalúa** (auditoría del cliente) | ✅ Listo | OnPage, Domain Rank, SERP, Labs, Keyword Data, CrUX, my_business_info, reviews | `audit_engine.run_full_audit(...)` retorna dict completo con scores + recomendaciones de Claude |
| **Descubre** (prospect discovery) | ✅ Listo | business_listings/search/live | `audit_engine.discover_prospects(...)` retorna prospectos rankeados por opportunity_score |
| **Alcanza** (outreach) | ⏳ Pendiente | (nuevo módulo `outreach.py`) | Generar mensaje personalizado con Claude + envío Resend/SES + tracking |

---

## 2. Endpoints integrados — referencia completa

| Función | Endpoint DataForSEO | Costo USD | Latencia | Pilar |
| --- | --- | --- | --- | --- |
| `get_onpage_data` | `on_page/instant_pages` | $0.000125 | ~7s | Evalúa |
| `get_domain_rank` | `dataforseo_labs/google/domain_rank_overview/live` | $0.02 | ~0.4s | Evalúa |
| `get_serp_data` | `serp/google/organic/live/advanced` | $0.002 | ~2s | Evalúa |
| `get_related_keywords` | `dataforseo_labs/google/related_keywords/live` | $0.02 | ~0.4s | Evalúa |
| `get_search_volume` | `keywords_data/google_ads/search_volume/live` | $0.075 | ~5s | Evalúa |
| `get_labs_categories` | `dataforseo_labs/categories` | $0 | ~60ms | (helper) |
| `get_my_business_info` | `business_data/google/my_business_info/live` | $0.0054 | ~1s | Evalúa |
| `get_google_reviews` | `business_data/google/reviews/live` | ~$0.013 / 10 | ~3s | Evalúa |
| `get_business_listings_search` | `business_data/business_listings/search/live` | ~$0.05 / 100 | ~5s | Descubre |
| `get_business_listings_categories` | `business_data/business_listings/categories` | $0 | ~80ms | (helper) |
| `query_crux` (CrUX API) | Google Chrome UX Report | $0 | ~2s | Evalúa |
| `query_crux_history` (CrUX History) | Google CrUX History | $0 | ~2s | Evalúa |
| `generate_recommendations` (Claude) | `claude-sonnet-4-6` | ~$0.005 | ~40s | Evalúa |

### Costos típicos

| Configuración | Costo USD | Latencia |
| --- | --- | --- |
| MVP mínimo (onpage + domain + crux + claude) | ~$0.025 | ~55s |
| MVP típico (+ 3 SERPs + my_business_info) | ~$0.045 | ~75s |
| MVP rico (+ 20 reviews + related_keywords) | ~$0.07 | ~85s |
| Discovery 100 prospectos | ~$0.05 | ~5s |

---

## 3. Arquitectura del flujo

```
                        ┌─────────────────────────┐
   POST /audits  ──────▶│  audit_engine           │
   (Celery task)        │  run_full_audit()       │
                        └──────┬──────────────────┘
                               │
        ┌──────────────────────┼──────────────────────────┐
        ▼                      ▼                          ▼
  ┌───────────┐         ┌──────────────┐          ┌─────────────┐
  │DataForSEO │         │    CrUX      │          │   Claude    │
  ├───────────┤         ├──────────────┤          ├─────────────┤
  │ onpage    │         │ query_crux   │          │ generate_   │
  │ domain    │         │ query_crux_  │          │ recommend.  │
  │ serps×N   │         │   history    │          │             │
  │ business_ │         │              │          │             │
  │   info    │         │              │          │             │
  │ reviews   │         │              │          │             │
  └─────┬─────┘         └──────┬───────┘          └──────┬──────┘
        │                      │                          │
        ▼                      ▼                          │
  ┌───────────┐         ┌──────────────┐                  │
  │seo_score  │         │performance_  │                  │
  │(35% peso) │         │score (25%)   │                  │
  └─────┬─────┘         └──────┬───────┘                  │
        │                      │                          │
        ▼                      ▼                          │
  ┌───────────┐                                          │
  │reputation │                                          │
  │_score(15%)│◀─── business_info (rating + claimed +    │
  └─────┬─────┘     operating_status)                    │
        │                                                │
        └──────────────┬─────────────────────────────────┘
                       ▼
              ┌────────────────┐
              │   scoring.py   │
              │ derive_sub-    │
              │ scores +       │
              │ calculate_     │
              │ health_score   │
              └────────┬───────┘
                       │
                       ▼
              ┌────────────────┐
              │ Audit dict     │  → Postgres / Firestore
              │ completo       │  → Frontend dashboard
              └────────────────┘


   Pilar DESCUBRE — flujo separado:

   POST /discover ──▶ audit_engine.discover_prospects(
                        categories=["italian_restaurant"],
                        location_coordinate="4.71,-74.07,10",
                        only_unclaimed=True,
                        min_rating=3.0, max_rating=4.7
                      )
                        │
                        ▼
                   business_listings/search/live
                        │
                        ▼
                   100 prospectos rankeados por
                   opportunity_score desc
```

---

## 4. Business Data API — detalle de la integración

### `get_my_business_info(keyword, location_code, language_code)`

Acepta:
- `keyword="cid:194604053573767737"` (más preciso)
- `keyword="Pizzeria Mario Bogotá"` (texto libre)

Output normalizado (estructura nueva, anidada por dominio):

```python
{
  "found": True,                          # False si no hubo match
  "name": "Pizzicato",
  "original_name": "Ескаргот",            # solo si difiere de name
  "is_renamed": True,
  "description": None,
  "category": {"primary": "French restaurant", "ids": [...], "additional": []},
  "ids": {"cid": "...", "place_id": "...", "feature_id": "..."},
  "contact": {
    "phone": "+359...",
    "website_url": None,
    "domain": None,
    "contact_url": None,
    "book_online_url": None,
    "contributor_url": None
  },
  "location": {
    "address": "...", "borough": "...", "street": "...",
    "city": "Varna", "zip": "9000", "country_code": "BG",
    "latitude": 43.21, "longitude": 27.91
  },
  "media": {"logo_url": None, "main_image_url": "...", "total_photos": 114},
  "status": {
    "is_claimed": False,
    "operating_status": "closed_permanently",   # normalizado
    "current_status_raw": "closed_forever",     # como vino de DataForSEO
    "price_level": "moderate",
    "is_directory_item": False
  },
  "reviews": {
    "rating": {"value": 4.2, "votes_count": 515, "type": "Max5", "max": null},
    "rating_distribution": {"1": 23, "2": 27, ..., "5": 281},
    "rating_distribution_pct": {"1": 4.5, "2": 5.2, ..., "5": 54.6},
    "place_topics": [                       # ordenado desc
      {"topic": "pizza", "mentions": 12},
      {"topic": "food", "mentions": 9},
      ...
    ],
    "questions_and_answers_count": null
  },
  "attributes": {
    "available": {"service_options": [...], "offerings": [...]},
    "unavailable": null
  },
  "popular_times": null,
  "rank_absolute": 1,
  "profile_completeness": {
    "score": 45,                            # 0-100, mayor = más completo
    "missing": [
      {"field": "description", "label": "Descripción del negocio", "weight": 10},
      {"field": "website",     "label": "Sitio web vinculado",     "weight": 15},
      {"field": "logo",        "label": "Logo subido",             "weight": 10},
      {"field": "claimed",     "label": "Listing reclamado",       "weight": 15},
      ...
    ],
    "present": [...]
  }
}
```

**Detalle clave**: `profile_completeness.missing[]` se traduce directamente en recomendaciones accionables. Cada campo missing es un quick-win priorizable por peso. El frontend puede renderizar esto como un checklist con botones "Cómo arreglar esto".

### `get_google_reviews(keyword, ..., depth, sort_by)`

`sort_by`: `"newest"` (default) | `"most_relevant"` | `"highest_rating"` | `"lowest_rating"`. Por costo, traer 20 reviews ordenadas por `newest` da contexto suficiente.

Salida normalizada:

```python
{
  "reviews": [
    {
      "author_name": "...",
      "author_image_url": "...",
      "rating": 5,
      "review_text": "...",
      "review_highlights": ["pizza", "atmosphere"],
      "timestamp": 1714521600,
      "datetime_iso": "2 weeks ago",
      "owner_responded": False,
      "owner_response": null,
      "reviews_count_by_author": 12,
      "photos_count_by_author": 0,
      "local_guide": True
    },
    ...
  ],
  "items_count": 20,
  "total_count": 515,                       # total de reviews del negocio
  "avg_rating_in_sample": 4.3,
  "owner_response_rate": 35.0,              # % de reviews respondidas por owner
  "reviews_with_text_count": 18,
  "rating_distribution": {1: 1, 2: 0, 3: 2, 4: 5, 5: 12},
  "negative_reviews": [...],                 # rating <= 2
  "negative_reviews_count": 1,
  "cost": 0.0125
}
```

**Cómo EDA lo usa**: la lista de `negative_reviews` con texto se pasa a Claude para que genere recomendaciones específicas ("3 clientes mencionaron tiempo de espera lento — considera un sistema de reservas online").

### `get_business_listings_search(...)`

La pieza que activa **Descubre**. Cada listing se devuelve con estructura idéntica a `my_business_info` + un campo extra `opportunity_score`:

```python
{
  ...campos de business_info...,
  "opportunity_score": {
    "score": 75,                            # 0-100, mayor = mejor prospecto
    "weakness_signals": [
      "description", "website", "logo", "claimed", "additional_categories"
    ]
  }
}
```

**Lógica del opportunity_score**:
- Base = `100 − profile_completeness.score` (menos completo = más oportunidad)
- +10 si rating en sweet spot 3.0–4.5 (motivado a mejorar)
- +5 si tiene 30+ reviews (negocio activo)
- −30 si está temporalmente cerrado
- 0 si está permanentemente cerrado
- 10 si tiene <5 reviews (sin tracción → mal prospecto)

El parser ya **rankea los prospectos por opportunity_score desc**, así que el primer scroll del dashboard muestra los mejores targets para outreach.

### `get_business_listings_categories()`

Gratis. Cachea en Postgres una tabla `business_categories(slug)`. El frontend usa esto como dropdown autocompletable cuando el usuario configura un filtro de Descubre.

---

## 5. `scoring.py` actualizado

### `derive_reputation_score(business_data)` — lógica nueva

```python
base = (rating / 5) * 100

# Penalización por baja confianza
if review_count < 10:    base *= 0.7    # < 10 reviews → -30%
elif review_count < 30:  base *= 0.85   # < 30 reviews → -15%

# Penalización por listing no reclamado
if is_claimed is False:  base *= 0.85

# Penalización fuerte si negocio está cerrado
if operating_status == "closed_permanently":  base *= 0.3
elif operating_status == "closed_temporarily": base *= 0.6
```

Test del ejemplo del usuario (Pizzicato — 4.2 stars, 515 reviews, unclaimed, **closed_permanently**):

```
4.2/5 * 100 = 84
84 * 0.85 (unclaimed) = 71.4
71.4 * 0.3 (closed) = 21.4
→ reputation_score = 21
```

Esto refleja correctamente que aunque el rating numérico es bueno, el negocio en realidad está muerto — EDA no debería desperdiciar tiempo recomendando mejoras a un sitio cerrado.

### Health score combinado

Con seo=70, performance=85, reputation=92, social=None:

```
Available dimensions: 3/4
Weights used:  seo 46.7% + performance 33.3% + reputation 20% = 100%
Health score = 70*0.467 + 85*0.333 + 92*0.20 = 79
```

El peso de social_score (25%) se redistribuye proporcionalmente entre las 3 dimensiones disponibles. Cuando integres APIs sociales en Phase 2, los pesos vuelven a ser 35/25/15/25 sin cambios en `audit_engine.py`.

---

## 6. Mapeo de campos por sección del dashboard — nuevo: Business Data

Las secciones para SERP / Labs / Keyword Data / OnPage del documento anterior se mantienen. Estas son las nuevas:

### Sección "Business Profile" (cliente — pilar Evalúa)

Fuente: `audit.data.business_info`

| Sección | Campos |
| --- | --- |
| **Header del negocio** | `name`, `original_name`, `is_renamed`, `category.primary`, `status.price_level`, `check_url` (botón "Ver en Google Maps") |
| **Estado crítico** | `status.is_claimed`, `status.operating_status`, alertas si `closed_*` o `is_renamed` |
| **Profile Completeness** | `profile_completeness.score` (radial gauge), `profile_completeness.missing[]` (checklist con `label` + `weight`), `present[]` |
| **Rating breakdown** | `reviews.rating.value`, `reviews.rating.votes_count`, `reviews.rating_distribution`, `reviews.rating_distribution_pct` (5 barras horizontales) |
| **Voice of customer** | `reviews.place_topics[]` (top 10, word cloud o chips ordenados por `mentions`) |
| **Datos de contacto** | `contact.phone`, `contact.website_url`, `contact.book_online_url`, `location.address` |
| **Media** | `media.logo_url`, `media.main_image_url`, `media.total_photos` |
| **Mapa** | `location.latitude`, `location.longitude` (Mapbox / Google Maps embed) |
| **Atributos** | `attributes.available.service_options`, `offerings`, `dining_options` (chips agrupados) |

### Sección "Reviews" (cliente — pilar Evalúa)

Fuente: `audit.data.reviews`

| Sección | Campos |
| --- | --- |
| **KPIs** | `avg_rating_in_sample`, `owner_response_rate` (%, gauge), `negative_reviews_count`, `total_count` |
| **Lista de reviews** | `reviews[]` con `author_name`, `rating`, `review_text`, `datetime_iso`, `owner_responded`, badge "Local Guide" si `local_guide` |
| **Filtros** | rating (1-5), con/sin owner response, con/sin texto |
| **Highlight bar** | `negative_reviews[]` destacadas en rojo en el top de la lista |

### Sección "Discover Prospects" (pilar Descubre)

Fuente: `audit_engine.discover_prospects(...)` → `result.prospects[]` y `result.high_opportunity[]`

| Sección | Campos |
| --- | --- |
| **KPIs filtros aplicados** | `result.items_count`, `unclaimed_count`, `unclaimed_pct`, `no_website_count`, `high_opportunity_count` |
| **Filtros sticky** | categories (multi-select), location_coordinate (mapa o input radius), only_unclaimed (toggle), min/max rating (slider), min reviews |
| **Vista mapa** | `prospects[]` con `location.latitude/longitude` como pins, color por `opportunity_score` |
| **Tabla principal** | columnas: name, primary category, city, rating + votes_count, opportunity_score (badge colored), weakness_signals (chips), is_claimed (✓/✗), website (✓/✗), action button "Generar outreach" |
| **Distribución** | `top_categories[]` (treemap o bar chart), `operating_status_distribution` (donut) |

---

## 7. Stack frontend — confirmado para MVP

| Librería | Versión | Uso |
| --- | --- | --- |
| `recharts` | ^2.15 | Charts (line, area, bar, pie, radial bar, treemap) |
| `@tanstack/react-table` | ^8.x | Tablas de keywords, prospectos, reviews con sort/filter/virtualización |
| `@tanstack/react-virtual` | ^3.x | Virtualización para listas largas (1000+ prospectos) |
| `shadcn/ui` | latest | Card, Table, Dialog, Tabs, Badge, Tooltip, Alert, Skeleton |
| `lucide-react` | latest | Iconos (Star, MapPin, Phone, Globe, AlertTriangle, etc.) |
| `react-markdown` | ^9.x | Renderizar `ai_overview.markdown` |
| `mapbox-gl` o `@react-google-maps/api` | latest | Mapa interactivo para Discover y Business Profile |
| `react-wordcloud` o chips simples | latest | `place_topics` |

Para el Discover map, recomiendo Mapbox por costo + libertad de styling. Google Maps queda mejor para el embed simple del Business Profile (es Google Business al fin).

---

## 8. Prompts para Claude design — secciones nuevas

Los 4 prompts del documento anterior (SERP / Labs / Keyword Data / OnPage / Health Score / CrUX) siguen vigentes. Estos son los nuevos para Business Data:

### Prompt 7 — Business Profile section (cliente)

```
Build a React + TypeScript "Google Business Profile" dashboard section using shadcn/ui, recharts, lucide-react, and Mapbox GL.

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

1. Hero card. Left: hero image (media.main_image_url) with the logo overlaid bottom-left if present. Right: name in large font. Below name: original_name in muted italic if is_renamed (with a tag "Renombrado"). Below: primary category as a Badge, price_level as $ symbols (e.g., $$ for moderate). Below: rating (4.2 ★) + "(515 reseñas)". Top right corner: a CTA button "Ver en Google Maps" linking to check_url.

2. Critical alerts row (only if any apply). Use shadcn Alert with destructive variant:
   - If status.operating_status === 'closed_permanently': "Este negocio está marcado como cerrado permanentemente en Google."
   - If status.operating_status === 'closed_temporarily': "Cerrado temporalmente — actualiza el horario en Google Business."
   - If !status.is_claimed: "Este listing no ha sido reclamado. Reclámalo en business.google.com para tomar control."
   - If is_renamed: "El nombre cambió de '{original_name}' a '{name}'. Considera comunicarlo a clientes."

3. Two-column row:

   LEFT — "Completitud del perfil" Card:
   - Big radial gauge (recharts RadialBarChart) showing profile_completeness.score (0-100), color green ≥80, amber 50-79, red <50.
   - Below: a checklist. For each item in profile_completeness.missing, show a row with red XCircle icon + label + Badge with "+{weight} pts". For each item in present, show with green CheckCircle icon + label.
   - Hover on a missing row → tooltip with "Cómo arreglar esto" (a placeholder text).

   RIGHT — "Lo que dicen tus clientes" Card (place_topics):
   - Header: "Temas más mencionados en reseñas"
   - Large chips/tags list, sized by mentions count (use font-size scaling 12-24px based on relative mentions).
   - Click on a chip → could filter the reviews section (placeholder onClick for now).

4. "Distribución de calificaciones" Card with horizontal bar chart:
   - 5 rows for 5★, 4★, 3★, 2★, 1★
   - Each row: stars on left, horizontal bar (width = rating_distribution_pct[N]%), count on right
   - Bars colored: 5★ = green, 4★ = lime, 3★ = amber, 2★ = orange, 1★ = red

5. Contact card (compact list):
   - Phone with Phone icon (clickable tel:)
   - Website with Globe icon (or "No vinculado" muted if null) — show "Vincular sitio web" button if null
   - Book online with Calendar icon (only if book_online_url)
   - Address with MapPin icon

6. Map card (Mapbox or Google Maps embed) sized 400x300, pin at location.latitude/longitude. Click pin → opens check_url.

7. Attributes card (only if attributes.available exists): grouped chips by category — "Opciones de servicio", "Ofertas", "Opciones de comida", etc. Each attribute is a Badge.

Style:
- Modern, Stripe-like aesthetic
- Spanish throughout
- Mobile responsive (single column stack on <md)
- All actionable items (CTAs, broken fields) use #225bb6 accent
- Generous use of CheckCircle / AlertTriangle icons for status
```

### Prompt 8 — Discover Prospects section (pilar Descubre)

```
Build a React + TypeScript "Descubrir Prospectos" dashboard section using shadcn/ui, @tanstack/react-table, lucide-react, recharts, and Mapbox GL.

Data shape (from audit_engine.discover_prospects → result):

interface DiscoverResult {
  items_count: number;
  total_count: number;
  prospects: Array<Prospect>;          // full list, sorted by opportunity_score desc
  high_opportunity: Array<Prospect>;   // top 20 with score >= 60
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

1. Top filter bar (sticky). Three sections:
   - Categories multi-select (autocomplete, fed by /business-categories endpoint)
   - Location: input field for "lat,lng,radius_km" OR a button "Usar mapa" that toggles to a Mapbox map where you draw a circle
   - Filters row: "Solo no reclamados" toggle, "Min rating" slider (0-5), "Min reviews" input
   - Apply button triggers a re-fetch.

2. KPI row of 4 cards:
   - "Prospectos encontrados" → items_count (with total_count subtitle "de N en la zona")
   - "No reclamados" → unclaimed_count + unclaimed_pct% (highlighted as opportunity)
   - "Sin sitio web" → no_website_count + no_website_pct%
   - "Alta oportunidad" → high_opportunity_count (badge "Score ≥ 60")

3. Two-column row:
   LEFT — Mapbox map (60% width, 500px tall):
   - All prospects as pins, colored by opportunity_score (gradient red → green → blue, where blue = highest score)
   - Click pin → opens a popup with name, score, link to detail
   - Cluster pins when zoomed out

   RIGHT — Top 20 high opportunity list (40% width, scrollable):
   - Each row: thumbnail (main_image_url) + name + category + opportunity_score badge + rating + key weakness chips (top 3 from weakness_signals)
   - Click row → opens prospect detail Drawer (out of scope for this prompt)
   - Right-side action: "Generar outreach" button that calls onGenerateOutreach(prospect)

4. Distribution row of 2 cards:
   - "Categorías" — treemap of top_categories (recharts Treemap)
   - "Estado operativo" — donut of operating_status_distribution

5. Full prospects table (@tanstack/react-table) below. Columns:
   - Name (with avatar from main_image_url, address subtitle)
   - Category (Badge)
   - City
   - Rating (★ + count, e.g., "4.2 ★ (515)")
   - Opportunity Score (large colored badge: red 0-39, amber 40-59, green 60-79, blue 80+)
   - Weaknesses (chips with the labels of missing fields, max 3 visible + "+N")
   - Claimed (Yes/No icon)
   - Website (✓ / "—")
   - Action: "Generar outreach" button per row
   - Sortable by opportunity_score, rating, name

   Virtualized with react-virtual since lists can have 100-1000 rows. Selection checkboxes on the left for bulk actions.

6. Bulk action footer (only when rows selected): "Generar outreach para N prospectos" big primary button.

Style:
- Color the opportunity_score badges consistently across map pins, list items, and table
- Use a light blue accent for "high opportunity" highlighting (#225bb6)
- Spanish throughout
- Mobile: collapse map below the KPIs, hide some columns
```

---

## 9. Persistencia recomendada

Todo permanece como antes pero añadiendo Business Data:

```
Postgres (o Firestore)
├── companies/                        # cliente que se registró
├── audits/                           # cada run de run_full_audit
│   └── {audit_id}: { ...full dict }  # TTL 7 días para cache
├── prospects/                        # cada run de discover_prospects
│   └── {discovery_id}: { result }    # TTL 7-30 días
├── business_categories/              # de get_business_listings_categories (1 vez)
└── labs_categories/                  # de get_labs_categories (1 vez)
```

Para campañas activas, los prospectos seleccionados se promueven a una tabla separada `outreach_targets` con su own lifecycle (pending → message_sent → opened → replied → converted).

---

## 10. Próximos pasos

1. **Pilar "Alcanza" (outreach engine)** — el siguiente sprint. Necesita:
   - `outreach.py` con `generate_outreach_message(prospect, client_audit)` que genera mensaje personalizado con Claude usando los datos del cliente + las weakness_signals del prospecto. El mensaje debe sentirse hand-crafted.
   - Integración con Resend o Amazon SES para envío.
   - Webhooks para tracking (open/reply/bounce).
   - Tabla `outreach_campaigns` y `outreach_messages` en Postgres.
   - Compliance: rate limiting, opt-out, cumplimiento de regulaciones LATAM.

2. **APIs sociales (Phase 2)** — Instagram Basic Display, Facebook Graph, TikTok API. Esto activa el `social_score` (25% del peso) y completa las 4 dimensiones del health_score.

3. **Snapshots periódicos** — Cloud Scheduler que reejecute `query_crux_history` y `get_serp_data` semanal, persistiendo en una tabla `audit_snapshots`. Eso desbloquea SERP Volatility Index, Traffic Trends, alertas de regresión de performance.

4. **Lighthouse oficial** — `on_page/lighthouse/live/json` (~$0.0025/call, ~10s) para Performance/Accessibility/Best Practices/SEO scores oficiales de Google. Útil cuando los clientes quieren los números exactos que ven en PageSpeed Insights.

5. **CrUX BigQuery** — para benchmarks de industria ("tu LCP es 3.2s, mediana de e-commerce México es 2.8s"). Cuando ya tengas ≥50 clientes para que valga la pena el setup de BigQuery + costos de queries.