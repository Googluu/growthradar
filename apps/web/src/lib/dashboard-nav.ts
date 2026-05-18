export type Pillar = "evalua" | "descubre" | "actua";
export type NavGroup = "main" | "utility";

export interface NavItemConfig {
  id: string;
  label: string;
  icon: string;
  href: string;
  pillar?: Pillar;
  group?: NavGroup;
  badge?: string;
}

export const NAV_ITEMS: NavItemConfig[] = [
  { id: "resumen",          label: "Resumen",                  icon: "LayoutDashboard", href: "/dashboard",                       group: "main"    },
  // ── EVALÚA ──
  { id: "posicionamiento",  label: "Posicionamiento",           icon: "Search",          href: "/dashboard/posicionamiento",        pillar: "evalua" },
  { id: "sitio-web",        label: "Sitio web",                 icon: "Monitor",         href: "/dashboard/sitio-web",              pillar: "evalua" },
  { id: "perfil-google",    label: "Mi perfil de Google",       icon: "MapPin",          href: "/dashboard/perfil-google",          pillar: "evalua" },
  { id: "investigacion",    label: "Investigación de mercado",  icon: "BarChart3",       href: "/dashboard/investigacion-mercado",  pillar: "evalua" },
  // ── DESCUBRE ──
  { id: "prospectos",       label: "Prospectos",                icon: "Target",          href: "/dashboard/prospectos",             pillar: "descubre" },
  // ── ACTÚA ──
  { id: "automatizaciones", label: "Automatizaciones",          icon: "Zap",             href: "/dashboard/automatizaciones",       pillar: "actua", badge: "BETA" },
  // ── UTILIDAD ──
  { id: "historial",        label: "Historial",                 icon: "History",         href: "/dashboard/historial",              group: "utility" },
  { id: "configuracion",    label: "Configuración",             icon: "Settings",        href: "/dashboard/configuracion",          group: "utility" },
];

export const PILLAR_LABELS: Record<Pillar, string> = {
  evalua:   "· EVALÚA ·",
  descubre: "· DESCUBRE ·",
  actua:    "· ACTÚA ·",
};
