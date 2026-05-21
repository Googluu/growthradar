"use client";

import { useState, useRef, useEffect } from "react";

// ── Tokens ─────────────────────────────────────────────────────────────────────
export const G  = "#22c55e";
export const Gs = "rgba(34,197,94,0.15)";
export const Gb = "rgba(34,197,94,0.35)";
export const AM = "#fbbf24";
export const RD = "#ef4444";
export const BL = "#60a5fa";
export const PU = "#a78bfa";
export const OR = "#fb923c";

export const C = {
  bg:          "#0a0a0a",
  card:        "rgba(255,255,255,0.025)",
  border:      "rgba(255,255,255,0.07)",
  borderStr:   "rgba(255,255,255,0.14)",
  text:        "#fff",
  text2:       "rgba(255,255,255,0.65)",
  text3:       "rgba(255,255,255,0.45)",
  text4:       "rgba(255,255,255,0.28)",
  greenSoft:   Gs,
  greenBorder: Gb,
};

export type Tone = "default" | "green" | "yellow" | "orange" | "red" | "blue";

export const COMP_META: Record<string, { label: string; tone: Tone; color: string }> = {
  LOW:    { label: "Baja",  tone: "green",  color: G  },
  MEDIUM: { label: "Media", tone: "yellow", color: AM },
  HIGH:   { label: "Alta",  tone: "red",    color: RD },
};

export const SERIES_COLORS = [G, BL, PU, OR, "#f472b6", AM, "#34d399", "#fb7185"];

// ── Formatters ─────────────────────────────────────────────────────────────────
export const fmtCompact = (n: number | null): string => {
  if (n == null) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, "") + "K";
  return String(n);
};

export const usd = (n: number | null, d = 2): string => {
  if (n == null) return "—";
  return "$" + new Intl.NumberFormat("es-CO", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
};

export const intCO = new Intl.NumberFormat("es-CO");
export const fmtPct = (n: number): string => (n >= 0 ? "+" : "") + (n * 100).toFixed(0) + "%";
export const monthShort = (ym: string): string => {
  const [y, m] = ym.split("-");
  return new Date(+y, +m - 1, 1).toLocaleString("es-CO", { month: "short" });
};

// ── Icons ──────────────────────────────────────────────────────────────────────
function Icon({ size = 16, sw = 1.6, children, style }: {
  size?: number; sw?: number; children: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}>
      {children}
    </svg>
  );
}

export const IconBars      = (p: any) => <Icon {...p}><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></Icon>;
export const IconDollar    = (p: any) => <Icon {...p}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></Icon>;
export const IconArrowsUD  = (p: any) => <Icon {...p}><path d="m17 5-5-3-5 3"/><path d="m17 19-5 3-5-3"/><line x1="12" y1="2" x2="12" y2="22"/></Icon>;
export const IconCoins     = (p: any) => <Icon {...p}><circle cx="9" cy="9" r="7"/><path d="M22 14a7 7 0 0 1-7 7"/><path d="M22 14a7 7 0 0 0-7-7"/><path d="M15 14a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></Icon>;
export const IconTrendUp   = (p: any) => <Icon {...p}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></Icon>;
export const IconSearch    = (p: any) => <Icon {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></Icon>;
export const IconFilter    = (p: any) => <Icon {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></Icon>;
export const IconExternal  = (p: any) => <Icon {...p}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></Icon>;
export const IconX         = (p: any) => <Icon {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Icon>;
export const IconChart     = (p: any) => <Icon {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></Icon>;
export const IconInfo      = (p: any) => <Icon {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></Icon>;
export const IconArrowUp   = (p: any) => <Icon {...p}><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></Icon>;
export const IconArrowDown = (p: any) => <Icon {...p}><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></Icon>;
export const IconClock     = (p: any) => <Icon {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Icon>;
export const IconLayers    = (p: any) => <Icon {...p}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></Icon>;
export const IconCheck     = (p: any) => <Icon {...p}><polyline points="20 6 9 17 4 12"/></Icon>;

// ── Badge ──────────────────────────────────────────────────────────────────────
const TONES: Record<Tone, { bg: string; fg: string; br: string }> = {
  default: { bg: "rgba(255,255,255,0.06)", fg: C.text2, br: "rgba(255,255,255,0.1)" },
  green:   { bg: Gs, fg: G,  br: Gb },
  yellow:  { bg: "rgba(251,191,36,0.12)",  fg: AM, br: "rgba(251,191,36,0.3)"  },
  orange:  { bg: "rgba(251,146,60,0.12)",  fg: OR, br: "rgba(251,146,60,0.3)"  },
  red:     { bg: "rgba(239,68,68,0.12)",   fg: RD, br: "rgba(239,68,68,0.3)"   },
  blue:    { bg: "rgba(96,165,250,0.12)",  fg: BL, br: "rgba(96,165,250,0.3)"  },
};

export function Badge({ children, tone = "default", style, title }: {
  children: React.ReactNode; tone?: Tone; style?: React.CSSProperties; title?: string;
}) {
  const t = TONES[tone] ?? TONES.default;
  return (
    <span title={title} style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: t.bg, color: t.fg, border: `1px solid ${t.br}`,
      fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
      letterSpacing: "0.01em", whiteSpace: "nowrap" as const, ...style,
    }}>{children}</span>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────────
export function Card({ children, style, accent }: {
  children: React.ReactNode; style?: React.CSSProperties; accent?: boolean;
}) {
  return (
    <div style={{
      background: accent ? `linear-gradient(180deg, rgba(34,197,94,0.06), ${C.card})` : C.card,
      border: `1px solid ${accent ? Gb : C.border}`,
      borderRadius: 16, ...style,
    }}>{children}</div>
  );
}

// ── SectionTitle ───────────────────────────────────────────────────────────────
export function SectionTitle({ kicker, title, sub, right }: {
  kicker?: string; title: string; sub?: string; right?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 16, flexWrap: "wrap" as const }}>
      <div>
        {kicker && <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 17, marginBottom: 4 }}>{kicker}</div>}
        <h2 style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 22, color: C.text, letterSpacing: "-0.015em" }}>{title}</h2>
        {sub && <p style={{ fontSize: 13, color: C.text3, marginTop: 4 }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}

// ── Tooltip ────────────────────────────────────────────────────────────────────
export function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      {children}
      {open && (
        <span style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(20,20,20,0.96)", border: `1px solid ${C.borderStr}`,
          color: C.text2, fontSize: 11.5, padding: "8px 12px",
          borderRadius: 8, whiteSpace: "nowrap" as const,
          pointerEvents: "none", zIndex: 10,
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)", fontWeight: 500,
        }}>{content}</span>
      )}
    </span>
  );
}

// ── Sparkline ──────────────────────────────────────────────────────────────────
export function Sparkline({ data, w = 140, h = 40, markPeakTrough = false, color = G, uid }: {
  data: Array<{ search_volume: number }>; w?: number; h?: number;
  markPeakTrough?: boolean; color?: string; uid?: string;
}) {
  if (!data?.length) return null;
  const vs = data.map(d => d.search_volume);
  const max = Math.max(...vs), min = Math.min(...vs);
  const range = max - min || 1;
  const padT = 4, padB = 4;
  const xAt = (i: number) => (i / (vs.length - 1)) * w;
  const yAt = (v: number) => padT + (h - padT - padB) - ((v - min) / range) * (h - padT - padB);
  const linePath = vs.map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(" ");
  const areaPath = linePath + ` L ${w} ${h} L 0 ${h} Z`;
  const peakIdx = vs.indexOf(max);
  const troughIdx = vs.indexOf(min);
  const gid = uid || `gads-spk-${Math.round(Math.random() * 1e6)}`;
  return (
    <svg width={w} height={h} style={{ display: "block", flexShrink: 0 }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gid})`}/>
      <path d={linePath} stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
      {markPeakTrough && (
        <>
          <circle cx={xAt(peakIdx)} cy={yAt(max)} r="3.5" fill={G} stroke={C.bg} strokeWidth="1.5"/>
          <circle cx={xAt(troughIdx)} cy={yAt(min)} r="3.5" fill={RD} stroke={C.bg} strokeWidth="1.5"/>
        </>
      )}
    </svg>
  );
}

// ── AreaChart ──────────────────────────────────────────────────────────────────
export function AreaChart({ data, height = 240, gradId = "gads-area" }: {
  data: Array<{ year_month: string; search_volume: number }>;
  height?: number; gradId?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(640);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(() => {
      if (wrapRef.current) {
        const r = wrapRef.current.getBoundingClientRect();
        setW(Math.max(300, r.width));
      }
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const pad = { l: 56, r: 16, t: 18, b: 36 };
  const iw = w - pad.l - pad.r;
  const ih = height - pad.t - pad.b;
  const max = Math.max(...data.map(d => d.search_volume)) * 1.15;
  const xAt = (i: number) => pad.l + (i / (data.length - 1)) * iw;
  const yAt = (v: number) => pad.t + ih - (v / max) * ih;
  const linePath = data.map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(p.search_volume).toFixed(1)}`).join(" ");
  const areaPath = linePath + ` L ${xAt(data.length - 1)} ${pad.t + ih} L ${xAt(0)} ${pad.t + ih} Z`;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => max * t);

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * w;
    const i = Math.round(((x - pad.l) / iw) * (data.length - 1));
    setHover(i >= 0 && i < data.length ? i : null);
  };

  return (
    <div ref={wrapRef} style={{ width: "100%", position: "relative" }}>
      <svg width={w} height={height} onMouseMove={onMove} onMouseLeave={() => setHover(null)}
        style={{ display: "block", cursor: "crosshair" }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={G} stopOpacity="0.4"/>
            <stop offset="100%" stopColor={G} stopOpacity="0"/>
          </linearGradient>
        </defs>
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={pad.l} x2={w - pad.r} y1={yAt(t)} y2={yAt(t)} stroke="rgba(255,255,255,0.05)" strokeDasharray="2 4"/>
            <text x={pad.l - 8} y={yAt(t) + 4} textAnchor="end" fontSize="10.5" fontFamily="monospace" fill={C.text3}>
              {fmtCompact(t)}
            </text>
          </g>
        ))}
        <path d={areaPath} fill={`url(#${gradId})`}/>
        <path d={linePath} fill="none" stroke={G} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 6px ${G}66)` }}/>
        {data.map((p, i) => (
          <circle key={i} cx={xAt(i)} cy={yAt(p.search_volume)} r={hover === i ? 5 : 3} fill={C.bg} stroke={G} strokeWidth="2"/>
        ))}
        {data.map((p, i) => (
          <text key={`x-${i}`} x={xAt(i)} y={height - pad.b + 18} textAnchor="middle" fontSize="10.5" fontFamily="sans-serif" fill={C.text3}>
            {monthShort(p.year_month)}
          </text>
        ))}
        {hover != null && (
          <line x1={xAt(hover)} x2={xAt(hover)} y1={pad.t} y2={pad.t + ih} stroke={G} strokeOpacity="0.4" strokeDasharray="3 3"/>
        )}
      </svg>
      {hover != null && (
        <div style={{
          position: "absolute",
          left: Math.min(w - 170, Math.max(8, xAt(hover) + 12)),
          top: Math.max(4, yAt(data[hover].search_volume) - 56),
          background: "rgba(20,20,20,0.96)", border: `1px solid ${C.borderStr}`,
          borderRadius: 10, padding: "8px 12px", pointerEvents: "none",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        }}>
          <div style={{ fontSize: 11, color: C.text3, marginBottom: 2 }}>
            {new Date(data[hover].year_month + "-01").toLocaleString("es-CO", { month: "long", year: "numeric" })}
          </div>
          <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 18, color: G }}>
            {intCO.format(data[hover].search_volume)}
          </div>
          <div style={{ fontSize: 10.5, color: C.text3, marginTop: 1 }}>búsquedas totales</div>
        </div>
      )}
    </div>
  );
}
