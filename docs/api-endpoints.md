# API Endpoints — Growth Radar

**Base URL:** `http://localhost:8000`
**Autenticación:** `Authorization: Bearer <JWT>`

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
