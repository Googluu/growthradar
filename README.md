# Radar de crecimiento

> Escanea tu presencia digital. Detectar oportunidades de crecimiento. Conéctate con ellos.

---

## Visión

Growth Radar es una plataforma B2B SaaS que brinda a cualquier empresa una capa de inteligencia completa sobre su presencia digital y su canal de ventas, sin necesidad de un equipo de marketing ni experiencia técnica.

**El bucle central:**
1. Una empresa ingresa el nombre o dominio de su empresa.
2. La plataforma audita automáticamente toda su huella digital.
3. La IA muestra prospectos específicos que necesitan exactamente lo que ofrece esa empresa.
4. Con un clic, la plataforma envía un mensaje de divulgación personalizado a cada cliente potencial.

Esto equivale a tener un analista de inteligencia empresarial, un experto en SEO y un representante de desarrollo de ventas, todos trabajando las 24 horas del día, los 7 días de la semana, disponibles desde el primer día.

---

## Los tres pilares

### Pilar 1: motor de auditoría digital
Escanea y califica automáticamente la presencia en línea de una empresa:
- Rendimiento del sitio web (velocidad, móvil, Core Web Vitals)
- Salud SEO (palabras clave, vínculos de retroceso, en la página)
- Presencia y participación en redes sociales.
- Google Maps/reseñas de reputación
- Posicionamiento competitivo

**Resultado:** Una "Puntuación de salud digital" con recomendaciones priorizadas y procesables.

### Pilar 2: motor de descubrimiento de clientes potenciales
Dado lo que hace una empresa, la plataforma encuentra empresas que probablemente necesiten ese servicio:
- Identifica prospectos con brechas específicas que el cliente puede llenar.
- Clasifica a los prospectos por puntaje de oportunidad (cuánto necesitan ayuda)
- Referencias cruzadas de datos públicos: Google Maps, directorios, señales de presencia web.

**Resultado:** Una lista seleccionada de clientes potenciales calificados con una explicación de *por qué* cada uno es adecuado.

### Pilar 3: motor de divulgación
Convierte un cliente potencial calificado en una conversación real:
- La IA escribe un correo electrónico/mensaje personalizado por cliente potencial (no una plantilla, un argumento razonado)
- Hace referencia al problema específico que tiene el cliente potencial y cómo lo resuelve esta empresa.
- Envíos por correo electrónico (alcance en frío), formularios de contacto o futuros canales sociales
- Realiza un seguimiento de las aperturas, las respuestas y la conversión por campaña.

**Salida:** Conversaciones reales con clientes potenciales, iniciadas automáticamente.

---

## Diferenciador

Las herramientas existentes cubren piezas individuales:
| Herramienta | Qué hace | Lo que le falta |
|------|-------------|---------------|
| SEMrush/Ubersuggest | Auditoría SEO | Demasiado complejo, sin generación de leads |
| Apolo.io | Base de datos principal | Sin auditoría de empresa, sin comparación de IA |
| Al instante.ai | Envío de correo electrónico en frío | Sin descubrimiento de clientes potenciales, mensajes genéricos |

**Growth Radar es la única plataforma que cierra el ciclo completo**: auditoría → coincidencia → alcance, creada para propietarios de empresas, no para especialistas en marketing.

El verdadero foso es la **capa de coincidencia de IA**: el sistema comprende tanto las capacidades del cliente como las brechas del cliente potencial, luego escribe un alcance que se siente hecho a mano, no un rociado y oración, sino un alcance de francotirador.

---

## Mercado objetivo

**Principal (MVP):** Pymes de América Latina (agencias, consultores, proveedores de servicios) que carecen de un equipo de ventas/marketing dedicado y dependen del boca a boca.

**Por qué LATAM primero:**
- Desatendido por las herramientas existentes (creadas para los mercados de habla inglesa)
- Alta densidad de negocios informales con escasa presencia digital
- Mercado sensible al precio → alto valor percibido de la automatización
- Menor competencia de Apollo/Instantáneamente en la divulgación en el idioma local

---

## Pila de tecnología

| Capa | Tecnología | Por qué |
|-------|-----------|-----|
| API de back-end | Python + API rápida | Ecosistema de raspado/IA rico y asincrónico primero |
| Interfaz | Next.js 14 + TypeScript + Viento de cola | Iteración rápida del panel, SSR para rendimiento |
| Base de datos | PostgreSQL | Estructura relacional para empresas, leads, campañas |
| Cola de trabajos | Apio + Redis | Trabajos de extensión y scraping asíncrono |
| IA / Máster en Derecho | Claude API (Antrópico) | El mejor razonamiento de su clase para análisis y generación de mensajes |
| Raspado | Dramaturgo + httpx | Cobertura de página dinámica y estática |
| Envío de correo electrónico | Reenviar / Amazon SES | Capacidad de entrega confiable |
| Autenticación | Autenticación de Supabase | Rápido de implementar, escalable |
| Alojamiento | Ferrocarril (MVP) → AWS (escala) | Ruta de implementación sencilla |

---

## Estructura del repositorio

```
radar de crecimiento/
├── README.md # Este archivo: visión y descripción general del proyecto
├── documentos/
│ ├── arquitectura.md # Arquitectura técnica en profundidad
│ ├── mvp-scope.md # Definición de características de MVP y criterios de aceptación
│ └── roadmap.md # Fases de desarrollo e hitos
├── aplicaciones/
│ ├── api/ # motor FastAPI
│ └── web/ # Interfaz Next.js
├── paquetes/
│ ├── motor de auditoría / # Lógica de puntuación y raspado de auditoría digital
│ ├── motor líder/ # Lógica de clasificación y descubrimiento de clientes potenciales
│ └── motor de extensión/ # lógica de envío y generación de mensajes de IA
└── infra/ # Docker, CI/CD, configuraciones de entorno
```

---

## Filosofía del Desarrollo

- **Claridad sobre velocidad**: cada decisión, modelo de datos y contrato API se documenta antes de escribir el código.
- **Software que funciona sobre abstracciones**: sin ingeniería excesiva; construir exactamente lo que necesita la fase actual
- **Cortes verticales**: cada fase ofrece una función completa y demostrable, no una capa parcial.
- **Documente a medida que crea**: los comentarios del código explican *por qué*, no *qué*; LÉAME permanece actualizado

---

## Gestión de proyectos

- **GitHub** — fuente de verdad para el código y las decisiones técnicas (problemas, relaciones públicas)
- **Noción**: visión del producto, investigación de usuarios, tablero Kanban, notas de reuniones
- **README / docs/** — referencia técnica siempre actualizada
- **Comentarios de código**: contexto en línea para decisiones no obvias

---

## Estado

**Fase actual:** Predesarrollo: visión definida, arquitectura en diseño

Consulte [docs/mvp-scope.md](docs/mvp-scope.md) para conocer lo que estamos creando primero.
Consulte [docs/roadmap.md](docs/roadmap.md) para conocer el plan de fase completo.