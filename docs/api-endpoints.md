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
