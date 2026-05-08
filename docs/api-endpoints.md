# API Endpoints — EDA

**Base URL:** `http://localhost:8000`
**Autenticación:** `Authorization: Bearer <JWT>` (solo endpoints protegidos)

El JWT se obtiene al hacer login con Supabase Auth desde el frontend, o se puede generar manualmente para pruebas (ver sección al final).

---

## Health

### `GET /health`
Verifica que la API, PostgreSQL y Redis estén disponibles. **No requiere autenticación.**

**Response 200:**
```json
{
  "status": "ok",
  "db": "connected",
  "redis": "connected"
}
```

---

## Endpoints públicos (sin autenticación)

Usados por la landing page y el dashboard demo. No requieren JWT.
Prefijo común: `/public`.

---

### `POST /public/audit`

Dispara una auditoría ligera para la landing page (CrUX + OnPage + Claude AI).
**Rate limit:** 1 auditoría por IP; la segunda devuelve 429.

**Body:**
```json
{ "url": "misitio.com" }
```

> `url` acepta con o sin `https://` — se normaliza internamente.

**Response 202:**
```json
{
  "job_id": "a1b2c3d4-...",
  "status": "pending"
}
```

**Errores:**
| Código | Motivo |
|--------|--------|
| 429 | La IP ya completó su auditoría de prueba |

**Detalle del 429:**
```json
{
  "detail": {
    "code": "trial_used",
    "message": "Ya usaste tu auditoría de prueba gratuita. Crea una cuenta para auditar más sitios.",
    "register_url": "/register"
  }
}
```

> Si el mismo IP tiene un job `pending` o `running`, el endpoint retorna ese mismo `job_id` (deduplicación) sin crear uno nuevo.

---

### `GET /public/audit/{job_id}`

Consulta el estado de una auditoría pública. El frontend hace polling cada ~4s.

**Params:** `job_id` — UUID retornado por el POST anterior

**Response 200 — en curso:**
```json
{
  "job_id": "a1b2c3d4-...",
  "status": "running",
  "result": null,
  "error": null
}
```

**Response 200 — completada:**
```json
{
  "job_id": "a1b2c3d4-...",
  "status": "completed",
  "result": {
    "health_score": 80,
    "scores": {
      "performance_score": 80,
      "seo_score": 50,
      "social_score": null,
      "reputation_score": null
    },
    "crux": { "lcp": {...}, "fcp": {...}, "cls": {...}, "inp": {...}, "ttfb": {...}, "performance_score": 80 },
    "seo": {
      "onpage": { "title": "...", "has_h1": true, "has_meta_description": false, "..." : "..." },
      "domain_rank": { "rank": 89, "backlinks": 41234, "..." : "..." }
    },
    "recommendations": {
      "ai_summary": "Tu sitio tiene una base técnica sólida...",
      "top_recommendations": [
        {
          "title": "Agrega meta description",
          "problem": "...",
          "action": "...",
          "impact": "+15–30% CTR",
          "effort": "2–4 horas",
          "badge": "QUICK WIN · ALTO IMPACTO",
          "accent": "#5DB848"
        }
      ]
    }
  },
  "error": null
}
```

> `top_recommendations` está limitado a **3 elementos** en el endpoint público.
> El campo `crux` puede ser `null` si el dominio no tiene datos en Chrome UX Report.

**Errores:**
| Código | Motivo |
|--------|--------|
| 404 | Job no encontrado |

---

### `POST /public/dashboard-audit`

Dispara una auditoría completa DataForSEO de 4 secciones (OnPage · SERP · Labs · Keyword Data).
**Sin rate limit por IP.** Dedup de 24h por dominio: si ya existe un job completado reciente, lo retorna directamente sin gastar APIs.

Costo real por auditoría nueva: ~**$0.097 USD**.
Tiempo de ejecución: ~**20–25 segundos** (3 llamadas en paralelo + 1 secuencial).

**Body:**
```json
{
  "domain": "misitio.com",
  "keyword": "mi keyword principal"
}
```

> `domain` acepta con o sin `https://` / `www.` — se normaliza.
> `keyword` es opcional. Si se omite, se deriva del nombre del dominio (ej. `"dian"` para `dian.gov.co`).

**Response 202 — job nuevo:**
```json
{
  "job_id": "7d25791d-...",
  "status": "pending",
  "cached": false
}
```

**Response 202 — cache hit (job completado en las últimas 24h):**
```json
{
  "job_id": "7d25791d-...",
  "status": "completed",
  "cached": true
}
```

> Cuando `cached: true`, el resultado ya está disponible en `GET /public/dashboard-audit/{job_id}` sin necesidad de esperar.

**Errores:**
| Código | Motivo |
|--------|--------|
| 422 | `domain` vacío o ausente |

---

### `GET /public/dashboard-audit/{job_id}`

Consulta el estado y resultado de un dashboard job. El frontend hace polling cada ~4s hasta `status: completed`.

**Params:** `job_id` — UUID retornado por el POST anterior

**Response 200 — completado:**
```json
{
  "job_id": "7d25791d-...",
  "status": "completed",
  "result": {
    "domain": "dian.gov.co",
    "keyword": "dian",
    "total_cost_usd": 0.097375,
    "sections": {
      "serp": {
        "keyword": "dian",
        "datetime": "2026-05-07T14:23:11Z",
        "check_url": "https://www.google.com/search?q=dian",
        "se_domain": "google.com.co",
        "location_code": 2170,
        "language_code": "es",
        "total_results_google": 4820000,
        "items_count": 22,
        "organic_results_count": 5,
        "average_position": 4.6,
        "serp_features": ["featured_snippet", "knowledge_graph", "site_links"],
        "serp_features_count": 3,
        "has_ai_overview": false,
        "ai_overview": null,
        "ranking_distribution": {
          "top_3": 2,
          "top_10": 5,
          "top_20": 5,
          "top_100": 5
        },
        "top_3_domains": ["dian.gov.co", "gerencie.com", "actualicese.com"],
        "top_10_domains": ["dian.gov.co", "gerencie.com", "actualicese.com", "legis.pe", "gov.co"],
        "featured_snippet_domain": null,
        "target_visibility": {
          "domain": "dian.gov.co",
          "found": true,
          "position": 1,
          "url": "https://www.dian.gov.co",
          "in_top_3": true,
          "in_top_10": true,
          "is_featured_snippet": false
        },
        "organic_results": [
          {
            "rank_absolute": 1,
            "rank_group": 1,
            "position": "left",
            "title": "DIAN - Dirección de Impuestos y Aduanas Nacionales",
            "url": "https://www.dian.gov.co",
            "domain": "dian.gov.co",
            "description": "Servicio tributario del Estado colombiano...",
            "breadcrumb": "dian.gov.co",
            "website_name": "DIAN",
            "is_featured_snippet": false,
            "is_image": false,
            "is_video": false,
            "highlighted": ["DIAN", "impuestos"],
            "sitelinks": [
              { "title": "Consulta RUT", "url": "https://muisca.dian.gov.co", "description": "Consulta y actualización del RUT" },
              { "title": "Declaraciones", "url": "https://www.dian.gov.co/declaraciones", "description": "" }
            ]
          }
        ],
        "related_searches": ["consulta rut dian", "dian factura electronica", "dian muisca"],
        "perspectives": [],
        "perspectives_count": 0,
        "cost": 0.002,
        "task_time": "2.14s",
        "task_status_code": 20000
      },
      "labs": {
        "seed_keyword": "dian",
        "items_count": 100,
        "total_search_volume": 4912830,
        "avg_cpc": 0.51,
        "avg_difficulty": 21.4,
        "estimated_traffic_value_usd": 1026984.18,
        "intent_distribution": { "informational": 45, "navigational": 38, "commercial": 12, "transactional": 5 },
        "difficulty_buckets": { "easy": 72, "medium": 20, "hard": 6, "very_hard": 2 },
        "low_hanging_fruit": [{ "keyword": "dian rut", "search_volume": 201000, "keyword_difficulty": 8, "..." : "..." }],
        "keywords": [{ "keyword": "dian", "search_volume": 1220000, "cpc": 0.51, "keyword_difficulty": 43, "main_intent": "navigational", "..." : "..." }],
        "cost": 0.02,
        "task_time": "0.38s"
      },
      "keyword_data": {
        "keywords_count": 20,
        "total_search_volume": 4717300,
        "avg_cpc": 0.61,
        "max_cpc": 2.4,
        "min_cpc": 0.05,
        "competition_distribution": { "LOW": 8, "MEDIUM": 7, "HIGH": 5 },
        "monthly_aggregated": [{ "year_month": "2026-03", "search_volume": 420000 }],
        "most_seasonal_keywords": [{ "keyword": "declaracion renta dian", "variation": 0.82, "peak_volume": 201000, "trough_volume": 36200 }],
        "top_keywords_by_volume": [{ "keyword": "dian", "search_volume": 1220000, "cpc": 0.51 }],
        "keywords": [{ "keyword": "dian", "search_volume": 1220000, "competition": "MEDIUM", "competition_index": 55, "cpc": 0.51, "monthly_searches": [{ "year": 2026, "month": 3, "search_volume": 1220000 }] }],
        "cost": 0.075,
        "task_time": "4.91s"
      },
      "onpage": {
        "url": "https://www.dian.gov.co",
        "status_code": 200,
        "health": {
          "onpage_score": 92.32,
          "computed_health_score": 65,
          "issues_count": 7,
          "passing_count": 18,
          "is_indexable": false,
          "http_status_class": "2xx"
        },
        "issues": [{ "check": "no_description", "label": "Falta meta description", "severity": "critical" }],
        "passing_checks": [{ "check": "is_https", "label": "HTTPS activo" }],
        "performance": {
          "time_to_interactive_ms": 1240,
          "dom_complete_ms": 980,
          "largest_contentful_paint": 1400,
          "first_input_delay": 62,
          "cumulative_layout_shift": 0.33,
          "total_dom_size_bytes": 125400,
          "page_size_bytes": 342000
        },
        "headings": { "h1": ["DIAN - Dirección de Impuestos"], "h2": ["Servicios", "Noticias"] },
        "content": { "plain_text_word_count": 1240, "flesch_kincaid_readability_index": 48.2 },
        "title": "DIAN - Dirección de Impuestos y Aduanas Nacionales",
        "description": null,
        "cost": 0.000125,
        "task_time": "7.2s"
      }
    },
    "errors": []
  },
  "error": null
}
```

> Si una sección falla (sitio bloqueado, timeout), su valor en `sections` es `{"error": "unreachable", "detail": "..."}` y el job igualmente termina en `completed`. El array `errors` registra cuáles secciones fallaron.

**Ciclo de vida de `status`:**
| Valor | Significado |
|-------|-------------|
| `pending` | Job encolado, worker aún no lo tomó |
| `running` | Worker procesando las 4 secciones |
| `completed` | Todas las secciones procesadas (algunas pueden tener error parcial) |
| `failed` | Error fatal — leer `error` |

**Errores:**
| Código | Motivo |
|--------|--------|
| 404 | Job no encontrado |

---

## Auth

### `GET /auth/me`
Retorna el perfil del usuario autenticado extraído del JWT.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "user_id": "uuid-del-usuario",
  "email": "usuario@ejemplo.com",
  "role": "authenticated"
}
```

**Errores:**
| Código | Motivo |
|--------|--------|
| 401 | No se envió token |
| 403 | Token inválido o expirado |

---

## Companies

Todos los endpoints requieren `Authorization: Bearer <token>`.
Cada usuario solo puede ver y modificar sus propias empresas.

---

### `POST /companies`
Crea una nueva empresa asociada al usuario autenticado.

**Body:**
```json
{
  "name": "Diseños Modernos SAS",
  "domain": "disenosmodernos.com.co",
  "description": "Agencia de diseño web",
  "location": "Bogotá, Colombia"
}
```
> `domain` acepta con o sin `https://` — se normaliza automáticamente.
> `description` y `location` son opcionales.

**Response 201:**
```json
{
  "id": "b414ccc9-457a-46c4-adf7-fbe650c9c37f",
  "owner_id": "uuid-del-usuario",
  "name": "Diseños Modernos SAS",
  "domain": "disenosmodernos.com.co",
  "description": null,
  "location": "Bogotá, Colombia",
  "created_at": "2026-04-17T02:38:31.200478Z",
  "updated_at": "2026-04-17T02:38:31.200478Z"
}
```

---

### `GET /companies`
Lista todas las empresas del usuario autenticado, ordenadas por fecha de creación (más reciente primero).

**Response 200:**
```json
[
  {
    "id": "b414ccc9-457a-46c4-adf7-fbe650c9c37f",
    "owner_id": "uuid-del-usuario",
    "name": "Diseños Modernos SAS",
    "domain": "disenosmodernos.com.co",
    "description": null,
    "location": "Bogotá, Colombia",
    "created_at": "2026-04-17T02:38:31.200478Z",
    "updated_at": "2026-04-17T02:38:31.200478Z"
  }
]
```

---

### `GET /companies/{id}`
Obtiene una empresa por su UUID.

**Params:** `id` — UUID de la empresa

**Response 200:** mismo schema que POST.

**Errores:**
| Código | Motivo |
|--------|--------|
| 404 | La empresa no existe o no pertenece al usuario |

---

### `PATCH /companies/{id}`
Actualiza solo los campos enviados (partial update).

**Params:** `id` — UUID de la empresa

**Body** (todos los campos son opcionales):
```json
{
  "name": "Nuevo nombre",
  "domain": "nuevo-dominio.com",
  "description": "Nueva descripción",
  "location": "Medellín, Colombia"
}
```

**Response 200:** empresa actualizada con el mismo schema que POST.

**Errores:**
| Código | Motivo |
|--------|--------|
| 404 | La empresa no existe o no pertenece al usuario |

---

## Audits

Todos los endpoints requieren `Authorization: Bearer <token>`.
Una auditoría es un **job asíncrono**: se dispara con POST y el resultado
se consulta con GET haciendo polling hasta que `status` sea `completed` o `failed`.

### Flujo completo
```
1. POST /companies/{id}/audits   → recibe job_id (status: pending)
2. GET  /audits/{job_id}         → polling cada ~3s hasta status: completed
3. Leer result del GET anterior  → health_score, scores, recomendaciones
```

---

### `POST /companies/{company_id}/audits`
Dispara una nueva auditoría para la empresa. El job se encola en Celery y la
API responde **de inmediato** con el `job_id` — sin esperar a que termine.

> Usa HTTP 202 Accepted (no 201) para indicar que la tarea fue aceptada pero aún no completada.

**Params:** `company_id` — UUID de la empresa

**Response 202:**
```json
{
  "job_id": "ea7b936b-4189-4c9e-9587-e7dc2dd71509",
  "status": "pending"
}
```

**Errores:**
| Código | Motivo |
|--------|--------|
| 404 | La empresa no existe o no pertenece al usuario |

---

### `GET /audits/{job_id}`
Consulta el estado actual de una auditoría. El frontend llama este endpoint
cada ~3 segundos hasta que `status` cambia a `completed` o `failed`.

**Params:** `job_id` — UUID retornado por el POST anterior

**Response 200 — mientras corre:**
```json
{
  "id": "ea7b936b-4189-4c9e-9587-e7dc2dd71509",
  "company_id": "b414ccc9-457a-46c4-adf7-fbe650c9c37f",
  "owner_id": "uuid-del-usuario",
  "status": "running",
  "result": null,
  "error": null,
  "created_at": "2026-04-17T17:42:54.123Z",
  "started_at": "2026-04-17T17:42:55.456Z",
  "completed_at": null
}
```

**Response 200 — cuando termina:**
```json
{
  "id": "ea7b936b-4189-4c9e-9587-e7dc2dd71509",
  "company_id": "b414ccc9-457a-46c4-adf7-fbe650c9c37f",
  "owner_id": "uuid-del-usuario",
  "status": "completed",
  "result": {
    "health_score": 47,
    "scores": {
      "performance_score": 72,
      "seo_score": 31,
      "social_score": 18,
      "reputation_score": 55
    },
    "note": "Resultado mock — integración real pendiente"
  },
  "error": null,
  "created_at": "2026-04-17T17:42:54.123Z",
  "started_at": "2026-04-17T17:42:55.456Z",
  "completed_at": "2026-04-17T17:43:00.400Z"
}
```

**Ciclo de vida del campo `status`:**
| Valor | Significado |
|-------|-------------|
| `pending` | Job encolado, worker aún no lo tomó |
| `running` | Worker procesando la auditoría |
| `completed` | Auditoría lista — leer `result` |
| `failed` | Error durante la auditoría — leer `error` |

**Errores:**
| Código | Motivo |
|--------|--------|
| 404 | El job no existe o no pertenece al usuario |

---

### `GET /companies/{company_id}/audits`
Lista el historial completo de auditorías de una empresa, ordenado de más
reciente a más antiguo. Útil para la vista de historial y comparación de scores.

**Params:** `company_id` — UUID de la empresa

**Response 200:**
```json
[
  {
    "id": "ea7b936b-4189-4c9e-9587-e7dc2dd71509",
    "company_id": "b414ccc9-457a-46c4-adf7-fbe650c9c37f",
    "owner_id": "uuid-del-usuario",
    "status": "completed",
    "result": { "health_score": 47, "scores": { ... } },
    "error": null,
    "created_at": "2026-04-17T17:42:54.123Z",
    "started_at": "2026-04-17T17:42:55.456Z",
    "completed_at": "2026-04-17T17:43:00.400Z"
  }
]
```

**Errores:**
| Código | Motivo |
|--------|--------|
| 404 | La empresa no existe o no pertenece al usuario |

---

## Generar token de prueba (desarrollo local)

Para probar con Postman sin tener el frontend listo, genera un JWT manualmente con el script en la raíz:

```bash
cd apps/api
.venv/bin/python -c "
import os, time
from dotenv import load_dotenv
from jose import jwt

load_dotenv()
secret = os.environ['SUPABASE_JWT_SECRET']
payload = {
    'sub': 'mi-user-id-de-prueba',
    'email': 'test@ejemplo.com',
    'role': 'authenticated',
    'iat': int(time.time()),
    'exp': int(time.time()) + 3600,
}
print(jwt.encode(payload, secret, algorithm='HS256'))
"
```

Copia el token generado y úsalo en Postman como `Bearer Token` en la pestaña **Authorization**.

> En producción el token lo emite Supabase Auth automáticamente al hacer login.

---

## Configuración rápida en Postman

1. Crea una **Collection** llamada `Growth Radar`
2. En la pestaña **Variables** de la collection agrega:
   - `base_url` = `http://localhost:8000`
   - `token` = `<pega aquí el token generado>`
3. En cada request usa `{{base_url}}/companies` y en Authorization: `Bearer {{token}}`
