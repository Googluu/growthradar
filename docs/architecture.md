# Arquitectura técnica: radar de crecimiento

> Última actualización: 2026-04-15
> Estado: Fase de diseño (pre-implementación)

---

## Descripción general del sistema

Growth Radar está estructurado como tres motores desacoplados que comparten una capa de datos común.
Cada motor se puede desarrollar, probar e implementar de forma independiente.

```
                        ┌─────────────────────────────────┐
                        │           WEB APP (Next.js)      │
                        │  Dashboard / Reports / Campaign  │
                        └────────────┬────────────────────┘
                                     │ REST / JSON
                        ┌────────────▼────────────────────┐
                        │         API GATEWAY (FastAPI)    │
                        │  Auth · Rate limiting · Routing  │
                        └──┬──────────┬──────────┬────────┘
                           │          │          │
              ┌────────────▼──┐  ┌────▼──────┐  ┌▼──────────────┐
              │ Audit Engine  │  │Lead Engine│  │Outreach Engine│
              │  (scraping +  │  │(discovery │  │(AI messages + │
              │   scoring)    │  │+ ranking) │  │  sending)     │
              └──────┬────────┘  └────┬──────┘  └──────┬────────┘
                     │               │                  │
              ┌──────▼───────────────▼──────────────────▼────────┐
              │                 JOB QUEUE (Celery + Redis)        │
              │         Async task execution + scheduling         │
              └──────────────────────┬────────────────────────────┘
                                     │
              ┌──────────────────────▼────────────────────────────┐
              │              DATABASE (PostgreSQL)                 │
              │   companies · audits · leads · campaigns · users  │
              └────────────────────────────────────────────────────┘
```

---

## Modelos de datos

### Entidades principales

**Company** — el negocio del cliente registrado en la plataforma
```
id, user_id, name, domain, industry, description, location
created_at, updated_at
```

**AuditReport** — instantánea de la salud digital de una empresa en un momento dado
```
id, company_id
health_score (0-100)
seo_score, performance_score, social_score, reputation_score
recommendations (JSON array)
raw_data (JSON — full scraped data for traceability)
created_at
```

**Lead** — un cliente potencial descubierto para una empresa específica
```
id, company_id
name, domain, industry, location
opportunity_score (0-100)
gaps (JSON — what problems this prospect has)
contact_email, contact_form_url
status (discovered | qualified | contacted | replied | converted | disqualified)
created_at
```

**Campaign** — un conjunto de mensajes de divulgación enviados a clientes potenciales.
```
id, company_id
name, channel (email | contact_form)
status (draft | active | paused | completed)
created_at
```

**OutreachMessage** — un mensaje enviado a un cliente potencial
```
id, campaign_id, lead_id
subject, body
ai_reasoning (why this message was written this way)
sent_at, opened_at, replied_at
status (pending | sent | opened | replied | bounced)
```

---

## Especificaciones del motor

### 1. Motor de auditoría

**Responsabilidad:** Dado el dominio de una empresa, crear una imagen completa de su presencia digital.

**Input:** `{ domain: string, company_name: string }`

**Output:** `AuditReport`

**Fuentes de datos (en orden de prioridad):**
| Señal | Fuente | Método |
|--------|--------|--------|
| Rendimiento del sitio web | API de Google PageSpeed ​​Insights | API oficial |
| SEO/datos de palabras clave | SerpAPI o DataForSEO | API paga |
| Presencia en redes sociales | API de plataforma (Instagram, LinkedIn) | Oficial cuando sea posible |
| Reseñas de Google Maps | Punto final SerpAPI de Google Maps | API |
| Datos de vínculo de retroceso | API de Moz/API de Ahrefs | API paga |
| Contenido del sitio web | Raspado sin cabeza del dramaturgo | Autohospedado |
| Presencia en el directorio | Raspado de dramaturgos de directorios clave | Autohospedado |

**Modelo de puntuación:**
```
health_score = promedio ponderado de:
  - performance_score  (weight: 0.25) — Core Web Vitals, Faro
  - seo_score          (weight: 0.30) — Clasificación de palabras clave, vínculos de retroceso, en la página.
  - social_score       (weight: 0.20) — recuento de seguidores, frecuencia de publicación, participación
  - reputation_score   (weight: 0.25) — Calificación de Google, recuento de reseñas, antigüedad de reseñas
```

**Uso de la API de Claude:**
- Toma todos los datos de auditoría sin procesar como entrada
- Genera recomendaciones legibles por humanos clasificadas por impacto
- Identifica las 3 principales "victorias rápidas" frente a mejoras a largo plazo

---

### 2. Motor de descubrimiento de clientes potenciales

**Responsabilidad:** Dado el perfil de una empresa, encuentre empresas que probablemente necesiten sus servicios.

**Input:** `{ company_id, service_description, target_location, filters }`

**Output:** lista de registros `Lead` con puntuaciones de oportunidad

**Estrategia de descubrimiento:**
1. Analizar la descripción del servicio de la empresa → extraer categorías de servicio a través de Claude
2. Mapee las categorías de servicios → lagunas de los clientes potenciales (p. ej., "diseño web" → necesidades de los clientes potenciales: ningún sitio web, sitio web lento, diseño desactualizado)
3. Busque en los directorios de Google Maps + empresas en la ubicación de destino.
4. Para cada candidato potencial → ejecute una miniauditoría (versión ligera de Audit Engine)
5. Califique a cada cliente potencial según qué tan bien sus brechas coinciden con los servicios del cliente.
6. Clasifique por puntaje de oportunidad y filtre hasta el N superior

**Uso de la API de Claude:**
- Descripción del servicio → estrategia de búsqueda (qué tipos de negocios buscar, qué brechas señalan oportunidades)
- Datos de prospectos sin procesar → puntaje de oportunidad con razonamiento
- Esta es la capa central de inteligencia: aquí la precisión determina el valor del producto.

**Restricciones importantes:**
- Tasa de trabajos de descubrimiento de límites para evitar prohibiciones de IP
- Almacenar en caché los datos de los clientes potenciales durante 7 días (no volver a extraer el mismo dominio con frecuencia)
- Respeta el archivo robots.txt para todos los scraping.

---

### 3. Motor de divulgación

**Responsabilidad:** Escribir y enviar un mensaje personalizado a un prospecto específico en nombre del cliente.

**Input:** `{ company (client), lead (prospect), channel, campaign_id }`

**Output:** envió `OutreachMessage` con seguimiento

**Generación de mensajes (Claude API):**
```
Contexto proporcionado a Claude:
- Empresa cliente: nombre, servicios, ubicación, propuesta de valor
- Prospecto: nombre, industria, ubicación, brechas específicas encontradas en su mini-auditoría
- Canal: correo electrónico o formulario de contacto (afecta al tono y la extensión)
- Normas de cumplimiento: sin afirmaciones engañosas, exclusión voluntaria clara, remitente identificado

Claude genera:
- Línea de asunto (solo correo electrónico)
- Cuerpo del mensaje (personalizado, referencias al problema específico)
- Razonamiento interno (almacenado como ai_reasoning - para depuración y revisión de calidad)
```

**Infraestructura de envío:**
- Correo electrónico: reenviar API con dominio personalizado por cliente (para capacidad de entrega)
- Formulario de contacto: el dramaturgo completa y envía el formulario de contacto del cliente potencial.
- Límite de velocidad: máximo 50 mensajes/día por cuenta de cliente (MVP) para proteger la capacidad de entrega

**Capa de cumplimiento:**
- Cada correo electrónico incluye un enlace para cancelar la suscripción.
- Lista de supresión mantenida por cliente.
- Gestión de exclusión voluntaria compatible con CAN-SPAM/RGPD
---

## API Design (FastAPI)

**Base URL:** `/api/v1/`

**Auth:** JWT a través de Supabase Auth: todos los puntos finales requieren un token de portador válido

**Key endpoints:**

```
POST   /companies                      — registrar una empresa
GET    /companies/:id                  — Obtener detalles de la empresa

POST   /companies/:id/audits           — Activar nueva auditoría (trabajo asíncrono)
GET    /companies/:id/audits/latest    — Obtenga el último informe de auditoría

POST   /companies/:id/leads/discover   — Activar el descubrimiento de clientes potenciales (trabajo asíncrono)
GET    /companies/:id/leads            — Listar clientes potenciales descubiertos
PATCH  /leads/:id                      — Actualizar el estado del cliente potencial

POST   /campaigns                      — Crear campaña de divulgación
POST   /campaigns/:id/send             — Enviar mensajes a clientes potenciales seleccionados
GET    /campaigns/:id/stats            — Estadísticas de rendimiento de la campaña

GET    /jobs/:id                       — Sondear el estado del trabajo asíncrono
```

---

## Patrón de trabajo asíncrono

Las operaciones de larga duración (auditoría, descubrimiento de clientes potenciales) se manejan como trabajos asíncronos:

1. El cliente llega al punto final → el servidor crea un registro de trabajo → regresa `{ job_id, status: "queued" }`
2. Celery worker picks up job → ejecuta el motor → actualiza el registro del trabajo + crea el resultado
3. El cliente sondea `GET /jobs/:id` o recibe el webhook cuando finaliza
4. La interfaz muestra un indicador de progreso durante el procesamiento.

Este patrón mantiene la API receptiva y maneja la realidad de que el raspado puede tardar entre 30 y 120 segundos.

---

## Entornos de desarrollo

| Medio ambiente | Propósito | Infraestructura |
|------------|---------|---------------|
| `local` | Desarrollo día a día | Docker Compose (todos los servicios localmente) |
| `puesta en escena` | Pruebas de integración, demostraciones | Ferrocarril (espejos de configuración de producción) |
| `producción` | Clientes en vivo | Ferrocarril (MVP) → AWS ECS (escala) |

**Objetivo de configuración local:** `docker compose up` debería iniciar cada servicio sin configuración adicional.
---

## Consideraciones de seguridad

- Todo el scraping se realiza a través de servidores proxy rotativos (nunca de IP orientadas al cliente)
- Claves API para servicios de terceros almacenadas en variables de entorno, nunca en código
- Los datos de contacto del cliente potencial solo se almacenan si se guardan explícitamente en una campaña (intención GDPR)
- El envío de correo electrónico utiliza un subdominio separado del dominio principal para proteger la reputación de la marca.
- Claude API llama a la entrada/salida del registro para una revisión de calidad (PII eliminada antes del registro)

---

## Preguntas abiertas (para resolver antes de la implementación)

1. **Proveedor de enriquecimiento de datos:** Apollo.io vs Hunter.io vs Clearbit para el descubrimiento de correo electrónico de contacto: evalúe la relación costo/precisión
2. **Infraestructura de scraping:** Playwright autohospedado frente a Browserless.io (administrado): costo frente a control
3. **Capacidad de entrega del correo electrónico:** Reenvío, Sendgrid y Amazon SES: evaluación del caso de uso de divulgación en frío
4. **Base de datos de prospectos:** Crear nuestro propio índice de prospectos en lugar de depender completamente del scraping bajo demanda: afecta la latencia y el costo.
5. **Directorios específicos de LATAM:** Identifique directorios de empresas locales clave por país para los mercados objetivo iniciales.
