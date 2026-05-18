# Sidebar Dashboard — Tasks

> Implementación del sidebar de navegación del dashboard EDA. Basado en el mockup acordado: 6 items principales agrupados por pilar (E·D·A) + sección utilidad. Estructura desktop con colapso lateral + drawer mobile.

---

## 0. Decisiones de scope (MVP)

- [x] Estructura consolidada: 6 items principales + utilidad (no 8 granulares)
- [x] Sub-vistas como pestañas internas, no como rutas separadas en nav
- [x] "Sitio web", "Mi perfil de Google", "Investigación de mercado" agrupan 2 sub-secciones cada uno
- [x] Pilar Actúa entra con badge `[BETA]` o `[Próximamente]`
- [x] Contexto del negocio actual: tanto en header como en sidebar (con timestamp del último audit)
- [ ] Dropdown multi-negocio: DIFERIDO — diseñar la API para soportarlo pero no implementar UI todavía

---

## 1. Setup & dependencies

- [ ] Verificar que `shadcn/ui` esté instalado con los componentes: `Sheet`, `Tooltip`, `Button`, `Badge`, `Separator`, `Avatar`, `DropdownMenu`
- [ ] Si falta alguno: `npx shadcn-ui@latest add sheet tooltip badge separator avatar dropdown-menu`
- [ ] Instalar `lucide-react` si no está
- [ ] Configurar fuente `Caveat` en `app/layout.tsx` (Google Fonts) para los separadores de pilar
- [ ] Configurar `Geist Sans` como font-family por defecto si aún no está
- [ ] Confirmar que `tailwind.config.ts` expone los tokens del design system EDA (`eda-green`, `eda-green-dark`, `bg-primary`, `bg-secondary`, `text-muted`, etc.)
- [ ] Verificar breakpoints: `md: 768px` para conmutación desktop ↔ mobile

---

## 2. Rutas (Next.js App Router)

- [ ] Crear `app/dashboard/layout.tsx` — wrapper compartido por todas las páginas del dashboard. Renderiza `<Sidebar />` + `<Header />` + `{children}`
- [ ] Mover el contenido actual de `/dashboard/page.tsx` (SERP) a `app/dashboard/posicionamiento/page.tsx`
- [ ] Crear `app/dashboard/page.tsx` nuevo → Resumen (placeholder: health score + recomendaciones)
- [ ] Crear `app/dashboard/sitio-web/page.tsx` con estructura de tabs (`Auditoría técnica` / `Velocidad real`)
- [ ] Crear `app/dashboard/perfil-google/page.tsx` con tabs (`Perfil` / `Reseñas`)
- [ ] Crear `app/dashboard/investigacion-mercado/page.tsx` con tabs (`Términos relacionados` / `Volumen de búsqueda`)
- [ ] Crear `app/dashboard/prospectos/page.tsx`
- [ ] Crear `app/dashboard/automatizaciones/page.tsx` (placeholder con copy "Pronto")
- [ ] Crear `app/dashboard/historial/page.tsx`
- [ ] Crear `app/dashboard/configuracion/page.tsx`

---

## 3. Componentes — estructura de archivos

- [ ] `components/dashboard/Sidebar.tsx` — root del sidebar
- [ ] `components/dashboard/SidebarHeader.tsx` — logo EDA + botón colapsar
- [ ] `components/dashboard/BusinessContextBlock.tsx` — nombre negocio + dominio + "Auditado hace X"
- [ ] `components/dashboard/NavItem.tsx` — un item de nav reutilizable
- [ ] `components/dashboard/PillarSeparator.tsx` — separador "· EVALÚA ·" / "· DESCUBRE ·" / "· ACTÚA ·"
- [ ] `components/dashboard/SidebarFooter.tsx` — info del usuario logged-in + logout
- [ ] `components/dashboard/MobileDrawer.tsx` — wrapper para `<Sheet>` en mobile
- [ ] `components/dashboard/Header.tsx` — top header con breadcrumb + "Nueva búsqueda" (refactor del actual)

---

## 4. NavItem — implementación

- [ ] Props: `icon` (lucide component), `label` (string), `href` (string), `badge?` (string opcional), `isCollapsed?` (boolean)
- [ ] Usar `usePathname()` de `next/navigation` para detectar estado activo
- [ ] Match exacto del pathname para activar el item correcto
- [ ] Renderizar con `<Link>` de `next/link` (no anchor crudo) para client-side routing
- [ ] Layout: icono (20px) + label (text-sm) + badge opcional (alineado a la derecha)
- [ ] Aplicar clases condicionales para active state (ver sección 6)
- [ ] Tooltip al hover SOLO cuando `isCollapsed === true` mostrando el label

---

## 5. Lista de NavItems — configuración

Crear array de configuración en `lib/dashboard-nav.ts` para evitar hardcode:

```typescript
export const NAV_ITEMS: NavItem[] = [
  { id: 'resumen', label: 'Resumen', icon: 'LayoutDashboard', href: '/dashboard' },
  // pillar: EVALÚA
  { id: 'posicionamiento', label: 'Posicionamiento', icon: 'Search', href: '/dashboard/posicionamiento', pillar: 'evalua' },
  { id: 'sitio-web', label: 'Sitio web', icon: 'Monitor', href: '/dashboard/sitio-web', pillar: 'evalua' },
  { id: 'perfil-google', label: 'Mi perfil de Google', icon: 'MapPin', href: '/dashboard/perfil-google', pillar: 'evalua' },
  { id: 'investigacion', label: 'Investigación de mercado', icon: 'BarChart3', href: '/dashboard/investigacion-mercado', pillar: 'evalua' },
  // pillar: DESCUBRE
  { id: 'prospectos', label: 'Prospectos', icon: 'Target', href: '/dashboard/prospectos', pillar: 'descubre' },
  // pillar: ACTÚA
  { id: 'automatizaciones', label: 'Automatizaciones', icon: 'Zap', href: '/dashboard/automatizaciones', pillar: 'actua', badge: 'BETA' },
  // utilidad
  { id: 'historial', label: 'Historial', icon: 'History', href: '/dashboard/historial', group: 'utility' },
  { id: 'configuracion', label: 'Configuración', icon: 'Settings', href: '/dashboard/configuracion', group: 'utility' },
];
```

- [ ] Crear este archivo y tipo `NavItem`
- [ ] Importar y mapear en `Sidebar.tsx`
- [ ] Renderizar `PillarSeparator` antes de cada cambio de `pillar`
- [ ] Renderizar un `<Separator />` antes del grupo `utility`

---

## 6. Active state, hover y estilos

### Active state (item seleccionado)

- [ ] Borde izquierdo de 3px sólido en `eda-green` (#22c55e), pegado al edge del sidebar
- [ ] Background de la fila: `eda-green` al 8% opacidad (`bg-green-500/8`)
- [ ] Texto del label en blanco puro (`text-white`)
- [ ] Icono en `eda-green`
- [ ] El item activo NO tiene transición — se siente "anclado"

### Hover state (item NO activo)

- [ ] Background al 4% blanco (`hover:bg-white/4`)
- [ ] Transición suave de 150ms en background y color de texto
- [ ] Texto pasa de `text-muted` a `text-white/80`
- [ ] Icono pasa de `text-muted` a `text-white/80`

### Default state (item NO activo, sin hover)

- [ ] Background transparente
- [ ] Texto y icono en `text-muted` (#737373)
- [ ] Sin borde izquierdo

---

## 7. PillarSeparator (· EVALÚA ·)

- [ ] Tipografía: `Caveat`, 11px, peso normal
- [ ] Color: `eda-green` al 60% opacidad
- [ ] Letter-spacing: amplio (~0.15em)
- [ ] Text-align center
- [ ] Padding vertical generoso (16px top, 8px bottom)
- [ ] Renderizar el texto rodeado de puntos: `· EVALÚA ·`
- [ ] Ocultar el texto cuando el sidebar está colapsado, dejar solo una línea horizontal corta verde de 12px de ancho centrada

### Nice-to-have decorativo

- [ ] Considerar agregar una línea SVG hand-drawn debajo de cada separador (5-6px de alto, ~80% del ancho del sidebar, color `eda-green/30`). Esto conecta visualmente con la estética del logo. Si toma >30 min implementarlo, déjalo para v2.

---

## 8. BusinessContextBlock

Bloque arriba del sidebar (debajo del logo, encima del primer nav item):

- [ ] Mostrar `<Avatar>` con la inicial del negocio + bg `eda-green/20`
- [ ] Nombre del negocio (text-sm, font-medium, blanco)
- [ ] Dominio (text-xs, `text-muted`)
- [ ] "Auditado hace X" (text-xs, `text-muted`) — calcular relativo usando `date-fns` o nativo
- [ ] Si no hay audit activo: mostrar CTA "Nueva auditoría →" en su lugar
- [ ] En estado colapsado: mostrar SOLO el avatar centrado, los textos se ocultan
- [ ] Cuando lleguen multi-business: este bloque se convierte en `<DropdownMenu>` trigger (DIFERIDO, dejar el componente preparado pero no implementar dropdown todavía)

---

## 9. SidebarHeader — logo + botón colapsar

- [ ] Logo EDA a la izquierda (`<Image>` con `/logo-eda.png`, 32×32)
- [ ] Texto "EDA" al lado del logo (font-bold, blanco) — oculto cuando colapsado
- [ ] Botón circular en la esquina derecha con icono `ChevronsLeft` (lucide)
- [ ] Al hacer click: alternar estado `isCollapsed`
- [ ] El icono rota a `ChevronsRight` cuando está colapsado
- [ ] Persistir el estado en `localStorage` con key `eda:sidebar-collapsed`
- [ ] Restaurar el estado en mount (con guard para SSR)

---

## 10. SidebarFooter — usuario

- [ ] Avatar pequeño (28px) con la inicial del email del usuario
- [ ] Email truncado con ellipsis si es muy largo
- [ ] Click → dropdown con: "Mi cuenta", "Plan y facturación", "Cerrar sesión"
- [ ] En estado colapsado: solo el avatar, sin texto

---

## 11. Colapso desktop

- [ ] Ancho expandido: 264px
- [ ] Ancho colapsado: 64px
- [ ] Transición de width: 200ms ease-out
- [ ] Todos los elementos con texto se ocultan con `opacity-0 + width-0` cuando `isCollapsed`
- [ ] Mantener los íconos centrados horizontalmente en el espacio colapsado
- [ ] Tooltip en TODOS los nav items cuando colapsado (mostrar el label)
- [ ] El `BusinessContextBlock` colapsa al avatar circular centrado
- [ ] Los `PillarSeparator` colapsan a una línea verde corta horizontal

---

## 12. Mobile drawer

- [ ] Detectar viewport `<768px` y ocultar el sidebar fixed
- [ ] Renderizar botón hamburger (icono `Menu` de lucide) en la esquina izq del header en mobile
- [ ] Al hacer click: abrir `<Sheet side="left">` con el contenido del sidebar
- [ ] Sheet overlay con `bg-black/60 backdrop-blur-sm`
- [ ] Ancho del drawer: 280px o 80vw (lo que sea menor)
- [ ] Al hacer click en cualquier `NavItem`: cerrar drawer + navegar
- [ ] Swipe-to-close gesture (shadcn lo maneja por defecto)
- [ ] Tap fuera del drawer también cierra

---

## 13. Header (refactor del actual)

- [ ] Mantener el breadcrumb: `EDA › MercadoLibre › mercadolibre.com.co`
- [ ] Mantener botón `+ Nueva búsqueda` a la derecha
- [ ] Agregar botón hamburger a la izquierda SOLO en mobile (`md:hidden`)
- [ ] En desktop con sidebar colapsado, el header NO necesita el hamburger
- [ ] El "EDA" del breadcrumb se vuelve clickeable → home del dashboard
- [ ] Considerar mover el `+ Nueva búsqueda` a un `<Button>` con icono `Plus` que sea sólido para más prominencia

---

## 14. Tabs internas por sección

### Sitio web (`/dashboard/sitio-web`)
- [ ] Tab 1: "Auditoría técnica" → componente OnPage del Prompt 5
- [ ] Tab 2: "Velocidad real" → componente CrUX del Prompt 7
- [ ] Default tab: "Auditoría técnica"
- [ ] Persist tab en query param `?tab=tecnica` o `?tab=velocidad`

### Mi perfil de Google (`/dashboard/perfil-google`)
- [ ] Tab 1: "Perfil" → componente Business Profile del Prompt 8
- [ ] Tab 2: "Reseñas" → componente Reviews (a construir)
- [ ] Default tab: "Perfil"

### Investigación de mercado (`/dashboard/investigacion-mercado`)
- [ ] Tab 1: "Términos relacionados" → componente Labs del Prompt 3
- [ ] Tab 2: "Volumen de búsqueda" → componente Keyword Data del Prompt 4
- [ ] Default tab: "Términos relacionados"

### Implementación común para tabs
- [ ] Usar `<Tabs>` de shadcn con `value` controlado por query param
- [ ] Estilo: tabs con borde inferior animado (no pill style), align izquierda
- [ ] Active tab: borde inferior `eda-green` de 2px + texto blanco
- [ ] Inactive tab: texto `text-muted`, sin borde

---

## 15. Estados vacíos / placeholders

- [ ] `/dashboard` (Resumen): si no hay audit aún → empty state con CTA "Hacer mi primera auditoría →"
- [ ] `/dashboard/posicionamiento`: ya tiene contenido, no tocar
- [ ] `/dashboard/sitio-web`: empty state mientras no integres OnPage/CrUX → "Próximamente: auditoría técnica y velocidad real"
- [ ] `/dashboard/perfil-google`: empty state → "Conecta tu perfil de Google para ver esta sección" + CTA
- [ ] `/dashboard/investigacion-mercado`: empty state → "Próximamente"
- [ ] `/dashboard/prospectos`: empty state → "Pronto vas a poder descubrir negocios que necesitan lo que ofreces"
- [ ] `/dashboard/automatizaciones`: empty state distintivo con badge BETA grande, copy "Estamos preparando esto. Mientras tanto, agenda una llamada con nosotros para automatizar manualmente." + Calendly embed
- [ ] `/dashboard/historial`: empty state si no hay audits → "Tus auditorías pasadas aparecerán aquí"
- [ ] `/dashboard/configuracion`: form básico (perfil, plan, integraciones) o placeholder

---

## 16. Accesibilidad

- [ ] Todos los `NavItem` con `aria-label` cuando el label visual está oculto (estado colapsado)
- [ ] Botón colapsar con `aria-label="Colapsar sidebar"` / `"Expandir sidebar"`
- [ ] Botón hamburger con `aria-label="Abrir menú de navegación"`
- [ ] `aria-current="page"` en el `NavItem` activo
- [ ] Focus visible: outline verde de 2px en todos los items clickeables
- [ ] Tab key navega por: hamburger → logo → nav items en orden → footer
- [ ] Escape cierra el mobile drawer
- [ ] `role="navigation"` en el `<nav>` del sidebar

---

## 17. Polish & QA

- [ ] Smooth transitions en hover, active, collapse — nada se siente "salto"
- [ ] Scroll del sidebar funcional si los items sobrepasan la altura (raro pero por si acaso)
- [ ] El sidebar es `position: sticky` o `fixed` con `height: 100vh` — no scrollea con la página
- [ ] Verificar que el active state se refleja correctamente al hacer click rápido entre items (sin lag)
- [ ] En mobile, el drawer se cierra al cambiar de orientación del device
- [ ] Lighthouse audit del `/dashboard` → A11y >95, Performance no debe bajar
- [ ] Probar en Chrome, Safari, Firefox
- [ ] Probar en iOS Safari (la fuente Caveat a veces se ve raro ahí)

---

## 18. Diferido — NO hacer en esta iteración

- [ ] Dropdown de multi-business en el `BusinessContextBlock` — preparar la estructura del componente pero sin lógica
- [ ] Search bar dentro del sidebar para filtrar nav items (no es necesario con 9 items)
- [ ] Notifications badge en items que tengan alerts pendientes (ej. "Posicionamiento (1)")
- [ ] Sub-items expandibles en el nav (ya decidimos usar tabs internas en su lugar)
- [ ] Tema claro (light mode) — solo dark theme para MVP
- [ ] Keyboard shortcuts (Cmd+K para command palette, Cmd+1-9 para saltar a items)

---

## Estimación

| Bloque | Esfuerzo |
| --- | --- |
| Componentes core (Sidebar, NavItem, separadores, contexto, footer) | 4-6h |
| Rutas + layout compartido | 1-2h |
| Estados (active, hover, collapsed) + persistencia | 2h |
| Mobile drawer | 1h |
| Refactor del header existente | 1h |
| Empty states de las secciones nuevas | 1-2h |
| QA + accesibilidad + polish | 2h |
| **Total estimado MVP** | **12-15h** |

---

## Orden de implementación sugerido

1. Setup + rutas (sección 1 + 2)
2. Componentes vacíos (sección 3) — esqueletos primero
3. Layout compartido `/dashboard/layout.tsx` con header + sidebar mockeados
4. NavItem + lista + active state (secciones 4, 5, 6)
5. PillarSeparator (sección 7)
6. BusinessContextBlock + SidebarFooter (secciones 8, 10)
7. Colapso desktop (secciones 9, 11)
8. Mobile drawer (sección 12)
9. Empty states de secciones nuevas (sección 15)
10. Tabs internas donde corresponda (sección 14)
11. Accesibilidad + QA (secciones 16, 17)