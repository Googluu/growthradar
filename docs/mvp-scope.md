# Alcance de MVP: radar de crecimiento

> Última actualización: 2026-04-15
> Fase: Fase 1 — Motor de auditoría digital (el "momento sorpresa")

---

## Filosofía MVP

El MVP ofrece **una porción vertical completa** del producto:

> Una empresa ingresa a su dominio → obtiene un informe de salud digital completo en menos de 3 minutos.

Este es elegido como MVP porque:
- Ofrece valor inmediato y tangible (sin esperar clientes potenciales o campañas)
- No tiene riesgo legal ni de cumplimiento.
- Crea el "momento sorpresa" que justifica registrarse y pagar
- Construye la base de datos de la que dependen las fases 2 y 3.

---

## ¿Qué hay en el MVP?

### Funciones orientadas al usuario

**1. Registro de empresa**
- Registro de usuario (correo electrónico + contraseña)
- Introduce el nombre de la empresa y el dominio del sitio web.
- Opcionalmente: descripción de servicios, ubicación de destino.

**2. Auditoría Digital**
- Activar auditoría con un clic
- Indicador de progreso asíncrono mientras se ejecuta la auditoría (30-90 segundos)
- Página de informe completo con: 
- Puntuación de salud general (0-100) con indicador visual 
- Cuatro subpuntuaciones: Rendimiento, SEO, Presencia Social, Reputación 
- Desglose por sección con puntos de datos específicos 
- Lista de recomendaciones ordenadas por impacto (Quick Wins primero) 
- Contexto competitivo: cómo se compara la puntuación con el promedio de la industria (si hay datos disponibles)

**3. Historial de auditoría**
- Lista de todas las auditorías pasadas de una empresa.
- Comparar dos auditorías una al lado de la otra (puntuación delta)

**4. Exportación de informes**
- Descargue la auditoría como PDF (para compartir con el equipo o los clientes)

### Alcance técnico

**Puntos de datos recopilados por auditoría:**

| Categoría | Puntos de datos | Fuente |
|----------|------------|--------|
| Rendimiento | Puntuación de PageSpeed(Usaremos API de CrUX), LCP, FID, CLS, dispositivos móviles frente a computadoras de escritorio | API de velocidad de página de Google |
| SEO | Metaetiquetas, estructura H1, robots.txt, presencia en el mapa del sitio, títulos de página | Playwright + analizador personalizado |
| SEO | Señales de clasificación de palabras clave, tráfico estimado | SerpAPI (o DataForSEO) |
| Vínculos de retroceso | Recuento de dominios de referencia, autoridad del dominio | API de Moz (nivel gratuito) |
| Sociales | Recuento de seguidores de Instagram, fecha de la última publicación | API de visualización básica de Instagram |
| Sociales | Presencia en la página de empresa de LinkedIn | Rasguño del Playwright |
| Reputación | Calificación de Google Maps, recuento de reseñas, tasa de respuesta | SerpAPI Google Maps |

**Integración de API de Claude:**
- Toma todos los datos recopilados como entrada estructurada
- Genera: resumen ejecutivo (2-3 oraciones), 5 recomendaciones principales con explicaciones, clasificación de ganancias rápidas versus mejoras estratégicas.
- El mensaje está controlado por versión en `packages/audit-engine/prompts/`

---

## Ideas para fases futuras

> Ideas surgidas durante el desarrollo que tienen potencial de producto pero se difieren
> para no romper el alcance del MVP.

---

### Vista dual de resultados: Dueño vs Desarrollador

**Idea:** El reporte de auditoría ofrece dos modos de visualización intercambiables:

**Vista "Dueño de negocio"** (actual — lenguaje natural)
- Explicaciones en español claro sin jerga técnica
- Impacto en términos de clientes, ventas y visibilidad
- Recomendaciones priorizadas por quick wins
- Generada por Claude con el prompt actual

**Vista "Desarrollador"** (futura)
- Problemas técnicos específicos con el código o configuración exacta a cambiar
- Referencias a archivos, etiquetas HTML, headers HTTP o configuración del servidor
- Ejemplos de código "antes/después" para cada fix
- Ordenado por severidad técnica, no por impacto de negocio
- Requiere un prompt separado de Claude orientado a developers

**Por qué vale la pena:**
- Una pyme típica tiene un dueño que no sabe de código y un dev freelance que sí sabe
- Hoy el dueño ve el reporte y se lo manda al dev → el dev no sabe cómo mapear las recomendaciones a código
- Con la vista dev, el dev puede actuar directamente sin interpretación
- Potencial de monetización: la vista dev podría ser un tier de pago superior

**Implementación sugerida:**
- Nuevo campo `mode: "owner" | "developer"` en el endpoint de recomendaciones
- Prompt separado `recommendations_developer_v1.md` en `packages/audit-engine/prompts/`
- Toggle en la UI del reporte — mismo job, distinta presentación
- No requiere re-auditar: es un post-procesamiento del resultado ya guardado

---

## Lo que NO está en el MVP

Estos se difieren explícitamente para evitar cambios en el alcance:

- Lead Discovery Engine (Fase 2)
- Motor de divulgación (Fase 3)
- Soporte multiempresa por cuenta (Fase 2+)
- Análisis profundo de la competencia
- Sugerencias de publicación en redes sociales.
- Funciones de marca blanca/agencia
- Aplicación móvil
- Integraciones Zapier/API

---

## Criterios de aceptación

El MVP está "listo" cuando se cumple todo lo siguiente:

### Funcional
- [ ] Un nuevo usuario puede registrarse y registrar su empresa en menos de 2 minutos
- [] La auditoría se completa y el informe está disponible en menos de 3 minutos para cualquier dominio
- [] El informe muestra las 4 categorías de subpuntuación con datos específicos
- [ ] Las recomendaciones generadas por Claude son relevantes y específicas para la empresa.
- [] El usuario puede descargar el informe como PDF
- [] El usuario puede activar una nueva auditoría y ver los cambios en la puntuación respecto a la anterior

### Calidad
- [] La auditoría funciona correctamente para al menos el 95% de los dominios (maneja los errores con elegancia)
- [] Los datos de PageSpeed son precisos (verificados con la propia herramienta de Google)
- [] No se exponen datos confidenciales en las respuestas de la API (otras auditorías de usuarios, claves sin procesar)
- [] La interfaz de usuario responde en dispositivos móviles y de escritorio.

### Rendimiento
- [] El trabajo de auditoría se completa en menos de 3 minutos para el percentil 95 de los dominios
- [] Tiempo de respuesta de API inferior a 300 ms para todos los puntos finales que no activan trabajos
- [] Puntaje de Frontend Lighthouse superior a 85

---

## Historias de usuarios

**US-001 — Primera auditoría**
> Como propietario de un negocio, quiero ingresar a mi sitio web y obtener una puntuación de salud de inmediato.
> para poder entender cómo se compara mi presencia digital con los estándares de la industria.

**US-002 — Comprensión de las recomendaciones**
> Como propietario de un negocio sin experiencia en marketing, quiero que se me explique cada recomendación.
> en lenguaje sencillo con una razón clara de por qué es importante, para saber qué solucionar primero.

**US-003 — Nueva auditoría después de mejoras**
> Como propietario de una empresa que realizó cambios en el sitio web, quiero realizar una nueva auditoría y comparar
> al anterior, para poder ver si mis mejoras tuvieron un impacto.

**US-004 — Compartiendo el informe**
> Como propietario de una agencia, quiero descargar la auditoría en formato PDF.
> para poder compartirlo con mi cliente en un formato profesional.

---

## Tareas Técnicas (ordenadas)

### backend
1. Andamiaje del proyecto: aplicación FastAPI, Docker Compose, PostgreSQL, Redis
2. Integración de autenticación: middleware Supabase Auth JWT
3. Modelo de empresa + puntos finales CRUD
4. Modelo de trabajo de auditoría + configuración del trabajador de apio
5. Integración de la API de PageSpeed + extracción de puntuación
6. Scraper de Playwright: contenido del sitio web, metaetiquetas, conceptos básicos de SEO
7. Integración SerpAPI: señales de palabras clave + datos de Google Maps
8. Integración de la API de Moz: datos de vínculo de retroceso
9. Módulo de cálculo de puntuación (promedio ponderado, por categoría)
10. Integración de Claude API: mensaje de generación de recomendaciones + análisis de respuestas
11. Auditar los puntos finales del informe (crear, obtener lo último, enumerar, comparar)
12. Generación de informes en PDF (exportación en PDF WeasyPrint o Playwright)

### Interfaz
1. Andamiaje del proyecto: Next.js 14, TypeScript, Tailwind, Shadcn/ui
2. Páginas de autenticación: registrarse, iniciar sesión, restablecer contraseña
3. Asistente de registro de empresas
4. Activador de auditoría + interfaz de usuario de sondeo de progreso
5. Panel de informes: indicador de puntuación de salud, tarjetas de puntuación secundaria
6. Lista de recomendaciones con expandir/contraer
7. Historial de auditoría + vista comparativa
8. Botón de descarga de PDF

### Infraestructura
1. Docker Compose para desarrollo local (API + trabajador + DB + Redis + web)
2. Gestión de variables de entorno (.env.ejemplo documentado)
3. Configuración de implementación ferroviaria para preparación

---

## Definición de Listo (antes de iniciar una tarea)

Una tarea está lista para ser trabajada cuando:
- El modelo de datos del que depende está definido y documentado.
- La API externa que utiliza se ha probado de forma aislada (mediante un script de pico)
- Los criterios de aceptación están escritos.

## Definición de Listo (para una tarea)

Una tarea se realiza cuando:
- La función funciona de un extremo a otro en el entorno local.
- El código se revisa y se fusiona con "principal".
- Los documentos relevantes están actualizados.
- No se introducen nuevos errores de tipo/pelusa