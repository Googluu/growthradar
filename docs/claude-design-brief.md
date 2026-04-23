# Brief para Claude Design — EDA

> Copia el contenido de la sección "PROMPT" y pégalo en claude.ai/design como "High fidelity"

---

## PROMPT

Diseña un prototipo de alta fidelidad para **EDA**, una plataforma SaaS B2B que audita la presencia digital de pequeñas y medianas empresas en América Latina. El nombre es un acrónimo que representa los 3 pilares del producto: **Evalúa. Descubre. Alcanza.** El producto genera un reporte automático con scores reales de performance, SEO y recomendaciones accionables en lenguaje natural.

---

### Identidad visual

**Nombre:** EDA
**Dominio:** useeda.com
**Tagline:** "Evalúa. Descubre. Alcanza."
**Subtítulo:** "Conoce el estado digital de tu negocio en minutos"
**Audiencia:** Dueños de pymes LATAM (no técnicos) y agencias digitales

**Paleta de colores:**
- Fondo principal: `#0F1117` (negro azulado, sensación de dashboard de datos)
- Tarjetas / panels: `#1A1D27`
- Borde sutil: `#2D3148`
- Acento primario: `#6366F1` (índigo — moderno, tech)
- Acento secundario: `#8B5CF6` (violeta para gradientes)
- Score BUENO (70-100): `#10B981` (verde esmeralda)
- Score REGULAR (40-69): `#F59E0B` (ámbar)
- Score MALO (0-39): `#EF4444` (rojo)
- Texto principal: `#F9FAFB`
- Texto secundario: `#9CA3AF`

**Tipografía:** Inter (sans-serif, limpia, datos)
**Estilo general:** Dark mode, data dashboard, profesional pero accesible — similar a Vercel Analytics o Linear, no a un SaaS genérico

---

### Pantallas a diseñar

#### 1. Dashboard principal
Lista de empresas registradas por el usuario. Cada empresa muestra su último health score con color según rango. Botón "Nueva auditoría" prominente. Header con logo **EDA** y avatar de usuario.

Empresa de ejemplo:
- **DIAN** · dian.gov.co · Health Score: **65/100** (color ámbar) · Última auditoría: hace 3 días

#### 2. Trigger de auditoría + Loading state
Pantalla intermedia que aparece al disparar una auditoría. Muestra:
- El dominio que se está analizando
- Indicador de progreso animado — algo visual que evoque los 3 pilares de EDA: pulsos o anillos que se expanden
- Pasos en vivo: "✓ Evaluando performance (CrUX)..." → "✓ Auditando SEO..." → "⟳ Generando recomendaciones con IA..."
- Tiempo estimado: "~45 segundos"

#### 3. Reporte de auditoría — vista principal (la pantalla más importante)

Usa estos datos reales:

**Empresa:** DIAN · www.dian.gov.co
**Health Score:** 65 / 100

**Sub-scores:**
| Dimensión | Score | Estado |
|-----------|-------|--------|
| Performance | 80/100 | Bueno |
| SEO | 50/100 | Regular |
| Redes Sociales | — | Sin datos |
| Reputación | — | Sin datos |

**Datos de performance (CrUX reales):**
- LCP: 1,380ms ✅ bueno
- INP: 63ms ✅ bueno
- CLS: 0.34 ❌ pobre
- FCP: 1,161ms ✅ bueno
- TTFB: 443ms ✅ bueno

**Datos SEO:**
- HTTPS: ✅ | Meta título: ✅ (50 chars) | Meta descripción: ❌ | H1: ❌ | Sitemap: ❌ | robots.txt: ❌
- Keywords en Google: 39,704 | Posición #1: 2,692 | Tráfico estimado: 5.1M/mes

**Resumen ejecutivo (texto real generado por IA):**
> "Tu sitio web obtiene un puntaje de salud digital de 65 sobre 100, lo que indica oportunidades importantes de mejora. El problema más urgente es el SEO: tu sitio carece de descripción meta, encabezado principal y otras señales clave que Google necesita para posicionarte correctamente. Tu mayor fortaleza es el rendimiento técnico — la velocidad de carga es buena y responde rápido para la mayoría de los usuarios."

**Recomendaciones (ordenadas por impacto):**

1. ⚡ QUICK WIN · Alto impacto · SEO
   **"Agrega una descripción meta a tu página principal"**
   Tu sitio no tiene descripción meta — el texto corto que aparece en Google bajo el título. Sin él, Google genera uno automáticamente y muchas veces queda confuso.
   → Acción: Agregar `<meta name="description">` con 140-160 caracteres

2. ⚡ QUICK WIN · Alto impacto · SEO
   **"Agrega un encabezado H1 visible en tu página"**
   Tu página principal no tiene ningún H1. Google lo usa para entender el tema central del sitio.

3. ⚡ QUICK WIN · Alto impacto · SEO
   **"Crea y publica un archivo sitemap.xml"**
   Sin sitemap, Google puede tardar más en indexar tu contenido o ignorar páginas clave.

4. ⚡ QUICK WIN · Medio impacto · SEO
   **"Publica un archivo robots.txt"**

5. 🎯 ESTRATÉGICO · Medio impacto · Performance
   **"Corrige el desplazamiento visual (CLS 0.34 → meta: < 0.10)"**
   Elementos que se mueven al cargar generan clics en el lugar equivocado.

#### 4. Vista de historial de auditorías
Lista cronológica de auditorías de una empresa. Cada fila: fecha, health score, delta vs anterior (ej. +8 puntos ↑ verde, -3 puntos ↓ rojo). Botón "Comparar" entre dos auditorías seleccionadas.

---

### Componentes clave a incluir

**Health Score Gauge:** Medidor circular grande (tipo velocímetro o arco) con el número en el centro. Color dinámico según rango (rojo/ámbar/verde). Es el elemento hero del reporte.

**Score Cards:** 4 tarjetas para los sub-scores. Cada una: ícono de la categoría, nombre, número/100, barra de progreso coloreada, estado en texto ("Bueno" / "Necesita mejora" / "Sin datos aún").

**Recommendation Cards:** Cards con badge de tipo (⚡ Quick Win / 🎯 Estratégico), badge de impacto (Alto/Medio/Bajo), categoría con color, título, descripción del problema en lenguaje natural, sección expandible con la acción concreta.

**CrUX Metrics Grid:** Grid de 5 métricas técnicas de Core Web Vitals. Cada una: nombre en español, valor numérico, unidad, chip de estado (verde/amarillo/rojo).

---

### Tono del producto

- Serio pero accesible — habla como un consultor, no como un chatbot
- Los textos en español LATAM (Colombia/México como mercados primarios)
- No usar jerga técnica en la UI sin explicación
- El reporte debe sentirse como un "diagnóstico médico digital" — confiable, claro, accionable
- El nombre EDA aparece siempre en mayúsculas
