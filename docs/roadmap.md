# Hoja de ruta del producto: radar de crecimiento

> Última actualización: 2026-04-15
> Formato: cada fase envía un incremento de producto completo y demostrable

---

## Principio rector

Cada fase finaliza con un producto que puedes **mostrarle a un usuario real y cobrarle**.
Ninguna fase termina con un backend a medio construir esperando en un frontend, o viceversa.

---

## Fase 1: "Mírate a ti mismo" (motor de auditoría digital)
**Objetivo:** Una empresa puede ver exactamente dónde se encuentra su presencia digital.
**Objetivo:** MVP funcional listo para los primeros clientes que pagan.

### Entregables
- Registro de empresa + incorporación
- Auditoría digital completa: rendimiento, SEO, redes sociales, reputación.
- Puntuación de salud con recomendaciones generadas por IA
- Historial de auditoría + comparación
- Exportación de informes en PDF

### Métricas clave (éxito = ✓ todas estas)
- La auditoría se completa en < 3 minutos para el 95% de los dominios
- Las recomendaciones de Claude fueron calificadas como "útiles" por más del 80% de los usuarios de la prueba.
- Los primeros 5 usuarios externos completan una auditoría sin pedir ayuda (barra de usabilidad)

### Hitos tecnológicos
- [] Docker Compose entorno de desarrollo local funcionando
- [] FastAPI + Celery + PostgreSQL + Redis ejecutándose localmente
- [] Integración de Google PageSpeed en vivo
- [] Integración de Claude API para recomendaciones
- [] Panel de control de Next.js que muestra el primer informe de auditoría real
- [ ] Implementado en Ferrocarril (puesta en escena)

**Alcance estimado:** 6-8 semanas de desarrollo enfocado

---

## Fase 2: "Ver oportunidades" (motor de descubrimiento líder)
**Objetivo:** Una empresa puede ver una lista seleccionada de prospectos que necesitan sus servicios.
**Requisito previo:** Fase 1 completa y estable.

### Entregables
- Configuración del perfil de servicio: el usuario describe lo que ofrece su empresa.
- Trabajo de descubrimiento de clientes potenciales: la IA encuentra clientes potenciales según el perfil del servicio y la ubicación.
- Puntuación de oportunidad por cliente potencial con explicación ("por qué este cliente potencial")
- Gestión de clientes potenciales: listar, filtrar, ordenar, marcar estado
- Vista previa de la miniauditoría por cliente potencial (3 brechas principales)

### Métricas clave
- El trabajo de descubrimiento devuelve al menos 20 clientes potenciales calificados por ejecución
- Más del 70% de los clientes potenciales presentados calificados como "plausibles" por el cliente
- La puntuación de oportunidad promedio se correlaciona con la tasa de conversión real del cliente (validada después de la Fase 3)

### Hitos tecnológicos
- [ ] Entidad líder y CRUD en base de datos
- [] Descripción del servicio Claude → mensaje de estrategia de búsqueda
- [] Google Maps + extracción de directorios para el descubrimiento de prospectos
- [] Mini-audit runner (versión liviana de Audit Engine)
- [] Modelo de puntuación de oportunidades v1
- [] UI de lista de clientes potenciales con filtros y gestión de estado

**Alcance estimado:** 6-8 semanas

---

## Fase 3: "Conéctese con ellos" (motor de extensión)
**Objetivo:** Una empresa puede contactar a clientes potenciales calificados con mensajes personalizados con un solo clic.
**Requisito previo:** Fase 2 completa y al menos 10 usuarios activos usando listas de clientes potenciales.

### Entregables
- Creación de campaña: seleccionar leads, elegir canal (correo electrónico/formulario de contacto)
- Mensaje personalizado generado por IA por cliente potencial (vista previa antes de enviar)
- Envío masivo con limitación de tarifa por día
- Seguimiento: tasas de apertura, respuestas, conversiones.
- Gestión de listas de supresión (exclusión voluntaria)
- Panel de análisis de campaña

### Métricas clave
- Tasa de apertura de correo electrónico en frío > 30 % (el promedio de la industria es ~20 %)
- Tasa de respuesta > 5% (el promedio de la industria es ~1-3%)
- Cero incidentes de cumplimiento (sin informes de spam, sin listas negras de dominios)

### Hitos tecnológicos
- [] Reenviar integración de API para envío de correo electrónico
- [] Configuración de dominio de envío personalizado por cliente
- [] Mensaje de divulgación de Claude (con ai_reasoning almacenado)
- [] Rellenar el formulario de contacto del dramaturgo
- [ ] Entidad de campaña + entidad de mensaje de divulgación en la base de datos
- [] Seguimiento de píxeles/detección de respuesta
- [] Middleware limitador de velocidad para enviar trabajos
- [] Interfaz de usuario de análisis de campaña

**Alcance estimado:** 8-10 semanas

---

## Fase 4: "Crecer con ello" (Retención + Monetización)
**Objetivo:** Convertir el producto en un negocio sustentable.
**Requisito previo:** Fase 3 completa con al menos 3 clientes utilizando activamente la divulgación.

### Entregables
- Facturación de suscripción (Stripe)
- Planes escalonados: Starter (solo auditoría) / Growth (+ leads) / Pro (+ alcance)
- Re-auditorías programadas (auditoría automática semanal/mensual)
- Resumen por correo electrónico: "Su puntuación de salud cambió, esto es lo que sucedió"
- Modo de agencia: administre varias empresas de clientes en una sola cuenta
- UI en español (enfoque en LATAM)

### Hitos tecnológicos
- [] Stripe Checkout + integración de webhook
- [] Middleware de control de funciones basado en planes
- [] Apio programado superó trabajos para auditorías recurrentes
- [ ] Sistema de notificación por correo electrónico (auditoría completa, nuevos clientes potenciales, respuestas)
- [ ] Estructura de cuentas multiempresa
- [ ] configuración de i18n para español

**Alcance estimado:** 4-6 semanas

---

## Exploración futura (posterior a la fase 4)

Estos no están comprometidos; evalúelos según los comentarios y la tracción de los usuarios:

- **Extensión del navegador**: audite el sitio de cualquier competidor con un solo clic
- **Integración CRM**: sincroniza clientes potenciales y contactos con HubSpot, Pipedrive
- **Automatización de redes sociales**: programa publicaciones para mejorar la puntuación social
- **Seguimiento de la competencia**: alerta cuando la puntuación de un competidor mejora significativamente
- **Marketplace**: conecta empresas con proveedores de servicios verificados para solucionar brechas específicas
- **Marca blanca**: las agencias revenden Growth Radar bajo su propia marca.
---

## Registro de riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|------|------------|--------|------------|
| Límites de velocidad de la API de Google PageSpeed ​​| Medio | Alto | Resultados en caché, solicitud de aumento de cuota |
| Los costos de SerpAPI aumentan inesperadamente | Medio | Alto | Establezca límites estrictos de gasto y evalúe DataForSEO como una alternativa más barata |
| La capacidad de entrega del correo electrónico frío se degrada | Alto | Crítico | Dominios de envío dedicados, límites de velocidad estrictos, secuencias de calentamiento |
| Raspado de bloques de LinkedIn/Instagram | Alto | Medio | Utilice API oficiales cuando estén disponibles, falle con gracia |
| Reto legal por correo electrónico frío | Bajo | Crítico | Cumplimiento total de CAN-SPAM/RGPD desde el día 1, revisión legal antes del lanzamiento de la Fase 3 |
| La latencia de la API de Claude aumenta durante las auditorías | Bajo | Medio | La arquitectura basada en colas absorbe picos y monitoreo de SLA |

---

## Registro de decisiones

Decisiones tomadas y por qué, para evitar volver a examinar cuestiones ya resueltas.

| Fecha | Decisión | Justificación |
|------|----------|-----------|
| 2026-04-15 | Python + FastAPI para backend | El mejor ecosistema para tareas de IA/scraping, nativo asíncrono |
| 2026-04-15 | Comience únicamente con la Fase 1 (auditoría) | Valor inmediato, sin riesgo legal, valida la recopilación de datos básicos |
| 2026-04-15 | Apunte primero al mercado LATAM | Desatendidos, tolerantes a los precios y con menor competencia por las herramientas inglesas |
| 2026-04-15 | Claude API para todas las tareas de IA | El mejor razonamiento para análisis + generación de mensajes, coincide con el entorno de desarrollo |
| 2026-04-15 | Ferrocarril para alojamiento inicial | La ruta más rápida desde el código hasta la URL implementada sin gastos generales de DevOps |