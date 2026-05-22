"use client";

import React from "react";
import type { CrUXRating, CrUXTrend } from "@/types/dashboard";

// ─── Design tokens ─────────────────────────────────────────────────────────────
export const EG = "#22c55e"; // EDA green

export const C = {
  bg:           "#0a0a0a",
  card:         "rgba(255,255,255,0.025)",
  border:       "rgba(255,255,255,0.07)",
  borderStrong: "rgba(255,255,255,0.14)",
  text:         "#fff",
  text2:        "rgba(255,255,255,0.65)",
  text3:        "rgba(255,255,255,0.45)",
  text4:        "rgba(255,255,255,0.28)",
  cwvGood:      "#0cce6b",
  cwvAmber:     "#ffa400",
  cwvPoor:      "#ff4e42",
  cwvGray:      "#9aa0a6",
};

export const RATING: Record<CrUXRating, { label: string; color: string }> = {
  good:              { label: "Bueno",           color: C.cwvGood  },
  needs_improvement: { label: "Necesita mejora", color: C.cwvAmber },
  poor:              { label: "Pobre",           color: C.cwvPoor  },
  no_data:           { label: "Sin datos",       color: C.cwvGray  },
};

export const TREND: Record<CrUXTrend, { label: string; color: string }> = {
  improving: { label: "Mejorando",  color: C.cwvGood  },
  degrading: { label: "Empeorando", color: C.cwvPoor  },
  stable:    { label: "Estable",    color: C.cwvGray  },
  no_data:   { label: "Sin datos",  color: C.cwvGray  },
};

export const THRESHOLDS: Record<string, { good: number; poor: number; unit: string }> = {
  largest_contentful_paint:        { good: 2500, poor: 4000, unit: "ms"    },
  interaction_to_next_paint:       { good: 200,  poor: 500,  unit: "ms"    },
  cumulative_layout_shift:         { good: 0.1,  poor: 0.25, unit: "score" },
  first_contentful_paint:          { good: 1800, poor: 3000, unit: "ms"    },
  experimental_time_to_first_byte: { good: 800,  poor: 1800, unit: "ms"    },
};

export const METRIC_META: Record<string, { short: string; name: string; description: string }> = {
  largest_contentful_paint: {
    short: "LCP",
    name:  "Pintado de Contenido Más Grande",
    description: "Tiempo que tarda el elemento más grande visible (imagen, video o bloque de texto) en aparecer. Mide cuándo percibe el usuario que la página ha terminado de cargar.",
  },
  interaction_to_next_paint: {
    short: "INP",
    name:  "Interacción al Próximo Paint",
    description: "Latencia entre que el usuario interactúa (clic, tap, tecla) y el siguiente frame visible. Reemplazó a FID en marzo 2024 como métrica oficial de interactividad.",
  },
  cumulative_layout_shift: {
    short: "CLS",
    name:  "Cambio Acumulativo de Layout",
    description: "Suma de todos los desplazamientos inesperados de elementos visuales durante la vida de la página. Mide la estabilidad visual percibida.",
  },
  first_contentful_paint: {
    short: "FCP",
    name:  "Pintado de Contenido Inicial",
    description: "Momento en que el primer contenido (texto, imagen, SVG) se renderiza. Indica cuándo el usuario percibe que algo está pasando.",
  },
  experimental_time_to_first_byte: {
    short: "TTFB",
    name:  "Tiempo al Primer Byte",
    description: "Tiempo que tarda el navegador en recibir el primer byte de respuesta del servidor. Indica la velocidad del backend y la red.",
  },
};

export const METRIC_ORDER = [
  "largest_contentful_paint",
  "interaction_to_next_paint",
  "cumulative_layout_shift",
  "first_contentful_paint",
  "experimental_time_to_first_byte",
] as const;

export type MetricKey = typeof METRIC_ORDER[number];

export const isCoreVital = (k: string): boolean =>
  ["largest_contentful_paint", "interaction_to_next_paint", "cumulative_layout_shift"].includes(k);

// ─── Formatters ────────────────────────────────────────────────────────────────
export const fmtMetric = (v: number | null, unit: string): string => {
  if (v == null) return "—";
  if (unit === "score") return v.toFixed(3).replace(/\.?0+$/, "") || "0";
  if (v >= 1000) return (v / 1000).toFixed(2).replace(/\.?0+$/, "") + " s";
  return Math.round(v) + " ms";
};

export const fmtP75Value = (v: number | null, unit: string): string => {
  if (v == null) return "—";
  if (unit === "score") return v.toFixed(3).replace(/\.?0+$/, "") || "0";
  if (v >= 1000) return (v / 1000).toFixed(2).replace(/\.?0+$/, "");
  return String(Math.round(v));
};

export const fmtP75Unit = (v: number | null, unit: string): string => {
  if (v == null || unit === "score") return "";
  return v >= 1000 ? "s" : "ms";
};

export const fmtDate = (s: string | null): string => {
  if (!s) return "";
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
};

export const fmtDateShort = (s: string | null): string => {
  if (!s) return "";
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
};

// ─── Icons ─────────────────────────────────────────────────────────────────────
interface IconProps { size?: number; sw?: number; style?: React.CSSProperties }

function Ic({ size = 16, sw = 1.6, children, style }: IconProps & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}>
      {children}
    </svg>
  );
}

export const IconCheck   = (p: IconProps) => <Ic {...p}><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 9.5"/></Ic>;
export const IconXCircle = (p: IconProps) => <Ic {...p}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></Ic>;
export const IconX       = (p: IconProps) => <Ic {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Ic>;
export const IconUp      = (p: IconProps) => <Ic {...p}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></Ic>;
export const IconDown    = (p: IconProps) => <Ic {...p}><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></Ic>;
export const IconMinus   = (p: IconProps) => <Ic {...p}><line x1="5" y1="12" x2="19" y2="12"/></Ic>;
export const IconMobile  = (p: IconProps) => <Ic {...p}><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></Ic>;
export const IconMonitor = (p: IconProps) => <Ic {...p}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></Ic>;
export const IconInfo    = (p: IconProps) => <Ic {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></Ic>;
export const IconWarn    = (p: IconProps) => <Ic {...p}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></Ic>;
export const IconExternal = (p: IconProps) => <Ic {...p}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></Ic>;

// ─── Primitives ────────────────────────────────────────────────────────────────
export function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: `${color}18`, color,
      border: `1px solid ${color}40`,
      fontSize: 11, fontWeight: 600,
      padding: "3px 9px", borderRadius: 999,
      letterSpacing: "0.01em", whiteSpace: "nowrap" as const,
    }}>{children}</span>
  );
}

// ─── PerfScore gauge ──────────────────────────────────────────────────────────
export function PerfScore({ score, size = 110 }: { score: number; size?: number }) {
  const color = score >= 90 ? C.cwvGood : score >= 50 ? C.cwvAmber : C.cwvPoor;
  const r = (size - 12) / 2;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const off = circ * (1 - score / 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
          <circle cx={cx} cy={cy} r={r} fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={circ} strokeDashoffset={off}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color}66)`, transition: "stroke-dashoffset 0.8s cubic-bezier(0.2,0.9,0.3,1)" }}/>
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 800, fontSize: 28, color, lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: 9.5, color: C.text3, marginTop: 2 }}>/ 100</div>
        </div>
      </div>
      <div style={{
        fontSize: 10.5, color: C.text3, fontWeight: 600,
        letterSpacing: "0.06em", textTransform: "uppercase" as const,
        textAlign: "center" as const,
      }}>
        Performance<br/>Score
      </div>
    </div>
  );
}

// ─── Sparkline ─────────────────────────────────────────────────────────────────
export function Sparkline({
  ts, color, w = 130, h = 36, uid,
}: {
  ts: Array<{ p75: number | null }>;
  color: string;
  w?: number;
  h?: number;
  uid: string;
}) {
  const vs = ts.map(p => p.p75).filter((v): v is number => v != null);
  if (!vs.length) {
    return <div style={{ height: h, color: C.text4, fontSize: 11, display: "flex", alignItems: "center" }}>—</div>;
  }

  const max = Math.max(...vs), min = Math.min(...vs);
  const range = max - min || 1;
  const padT = 3, padB = 3;
  const xAt = (i: number) => (i / (vs.length - 1 || 1)) * w;
  const yAt = (v: number) => padT + (h - padT - padB) - ((v - min) / range) * (h - padT - padB);

  const linePath = vs.map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(" ");
  const areaPath = linePath + ` L ${w} ${h} L 0 ${h} Z`;
  const lastX = xAt(vs.length - 1);
  const lastY = yAt(vs[vs.length - 1]);
  const gid = `cwv-spk-${uid}`;

  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gid})`}/>
      <path d={linePath} stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx={lastX} cy={lastY} r="2.5" fill={color} stroke={C.bg} strokeWidth="1.2"/>
    </svg>
  );
}

// ─── TrendChip ─────────────────────────────────────────────────────────────────
export function TrendChip({ trend, delta }: { trend: CrUXTrend; delta: number | null }) {
  const t = TREND[trend] ?? TREND.no_data;
  const IconC = trend === "improving" ? IconDown : trend === "degrading" ? IconUp : IconMinus;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 8px", borderRadius: 999,
      background: `${t.color}15`, color: t.color,
      border: `1px solid ${t.color}40`,
      fontSize: 11, fontWeight: 600, fontFamily: "monospace",
    }}>
      <IconC size={11}/>
      {delta != null ? (delta >= 0 ? "+" : "") + delta.toFixed(1) + "%" : t.label}
    </div>
  );
}
