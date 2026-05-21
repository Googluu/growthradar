"use client";

import { useEffect, useState } from "react";
import type { ReactNode, CSSProperties } from "react";

// ── Design tokens ──────────────────────────────────────────────────────────────
export const G  = "#22c55e";
export const Gs = "rgba(34,197,94,0.15)";
export const Gb = "rgba(34,197,94,0.35)";
export const AM = "#f59e0b";
export const RD = "#ef4444";
export const BL = "#60a5fa";
export const PR = "#a78bfa";

export const C = {
  bg:          "#0a0a0a",
  card:        "rgba(255,255,255,0.025)",
  border:      "rgba(255,255,255,0.07)",
  borderStrong:"rgba(255,255,255,0.14)",
  text:        "#fff",
  text2:       "rgba(255,255,255,0.65)",
  text3:       "rgba(255,255,255,0.45)",
  text4:       "rgba(255,255,255,0.28)",
} as const;

// ── Scoring helpers ────────────────────────────────────────────────────────────
export const scoreColor = (s: number): string => s >= 80 ? G : s >= 50 ? AM : RD;
export const scoreLabel = (s: number): string => s >= 80 ? "Excelente" : s >= 50 ? "Mejorable" : "Crítico";

export const cwvColor = (metric: string, v: number | null): string => {
  if (v == null) return C.text4;
  if (metric === "LCP") return v < 2500 ? G : v < 4000 ? AM : RD;
  if (metric === "FID") return v < 100  ? G : v < 300  ? AM : RD;
  if (metric === "CLS") return v < 0.1  ? G : v < 0.25 ? AM : RD;
  if (metric === "TTI") return v < 3800 ? G : v < 7300 ? AM : RD;
  if (metric === "DOM") return v < 2000 ? G : v < 4000 ? AM : RD;
  return C.text3;
};

export const cwvLabel = (metric: string, v: number | null): string => {
  if (v == null) return "Sin datos";
  if (metric === "LCP") return v < 2500 ? "Bueno" : v < 4000 ? "Mejorable" : "Pobre";
  if (metric === "FID") return v < 100  ? "Bueno" : v < 300  ? "Mejorable" : "Pobre";
  if (metric === "CLS") return v < 0.1  ? "Bueno" : v < 0.25 ? "Mejorable" : "Pobre";
  return v < 3800 ? "Rápido" : v < 7300 ? "Promedio" : "Lento";
};

// ── Format helpers ─────────────────────────────────────────────────────────────
export function fmtMs(n: number | null): string {
  if (n == null) return "—";
  if (n >= 1000) return (n / 1000).toFixed(2).replace(/\.?0+$/, "") + " s";
  return Math.round(n) + " ms";
}

export function fmtBytes(n: number | null): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2).replace(/\.00$/, "") + " MB";
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, "")     + " KB";
  return n + " B";
}

// ── Count-up hook ──────────────────────────────────────────────────────────────
export function useCountUp(target: number, durationMs = 1200): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t0 = Date.now();
    let raf = 0;
    const tick = () => {
      const elapsed = Date.now() - t0;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return val;
}

// ── Icons ──────────────────────────────────────────────────────────────────────
export interface IconProps { size?: number; color?: string; style?: CSSProperties }

function Ic({ size = 16, children, style }: { size?: number; children: ReactNode; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
         style={{ flexShrink: 0, ...style }}>
      {children}
    </svg>
  );
}

export const IconCheck     = ({ size, color, style }: IconProps) => <Ic size={size} style={{ color, ...style }}><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 9.5"/></Ic>;
export const IconAlert     = ({ size, color, style }: IconProps) => <Ic size={size} style={{ color, ...style }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></Ic>;
export const IconX         = ({ size, color, style }: IconProps) => <Ic size={size} style={{ color, ...style }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Ic>;
export const IconExternal  = ({ size, color, style }: IconProps) => <Ic size={size} style={{ color, ...style }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></Ic>;
export const IconChevDown  = ({ size, color, style }: IconProps) => <Ic size={size} style={{ color, ...style }}><polyline points="6 9 12 15 18 9"/></Ic>;
export const IconChevRight = ({ size, color, style }: IconProps) => <Ic size={size} style={{ color, ...style }}><polyline points="9 18 15 12 9 6"/></Ic>;
export const IconClock     = ({ size, color, style }: IconProps) => <Ic size={size} style={{ color, ...style }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Ic>;
export const IconDollar    = ({ size, color, style }: IconProps) => <Ic size={size} style={{ color, ...style }}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></Ic>;
export const IconInfo      = ({ size, color, style }: IconProps) => <Ic size={size} style={{ color, ...style }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></Ic>;
export const IconImg       = ({ size, color, style }: IconProps) => <Ic size={size} style={{ color, ...style }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></Ic>;
export const IconCode      = ({ size, color, style }: IconProps) => <Ic size={size} style={{ color, ...style }}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></Ic>;
export const IconBrush     = ({ size, color, style }: IconProps) => <Ic size={size} style={{ color, ...style }}><path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/></Ic>;
export const IconLayers    = ({ size, color, style }: IconProps) => <Ic size={size} style={{ color, ...style }}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></Ic>;
export const IconText      = ({ size, color, style }: IconProps) => <Ic size={size} style={{ color, ...style }}><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></Ic>;
export const IconBug       = ({ size, color, style }: IconProps) => <Ic size={size} style={{ color, ...style }}><rect x="8" y="6" width="8" height="14" rx="4"/><path d="m19 7-3 2"/><path d="m5 7 3 2"/><path d="m19 19-3-2"/><path d="m5 19 3-2"/><path d="M20 13h-4"/><path d="M4 13h4"/></Ic>;
export const IconWarn      = ({ size, color, style }: IconProps) => <Ic size={size} style={{ color, ...style }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></Ic>;
export const IconShield    = ({ size, color, style }: IconProps) => <Ic size={size} style={{ color, ...style }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Ic>;
export const IconGlobe     = ({ size, color, style }: IconProps) => <Ic size={size} style={{ color, ...style }}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></Ic>;

// ── Primitives ─────────────────────────────────────────────────────────────────
export type BadgeTone = "default" | "green" | "amber" | "red" | "blue" | "yellow";

const TONES: Record<BadgeTone, { bg: string; fg: string; br: string }> = {
  default: { bg: "rgba(255,255,255,0.06)", fg: C.text2, br: "rgba(255,255,255,0.1)" },
  green:   { bg: Gs,                        fg: G,      br: Gb },
  amber:   { bg: "rgba(245,158,11,0.14)",   fg: AM,     br: "rgba(245,158,11,0.32)" },
  red:     { bg: "rgba(239,68,68,0.14)",    fg: RD,     br: "rgba(239,68,68,0.32)" },
  blue:    { bg: "rgba(96,165,250,0.14)",   fg: BL,     br: "rgba(96,165,250,0.32)" },
  yellow:  { bg: "rgba(251,191,36,0.14)",   fg: "#fbbf24", br: "rgba(251,191,36,0.32)" },
};

export function Badge({
  children, tone = "default", style,
}: {
  children: ReactNode; tone?: BadgeTone; style?: CSSProperties;
}) {
  const t = TONES[tone];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: t.bg, color: t.fg, border: `1px solid ${t.br}`,
      fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 999,
      letterSpacing: "0.01em", whiteSpace: "nowrap", ...style,
    }}>{children}</span>
  );
}

export function Card({
  children, style,
}: {
  children: ReactNode; style?: CSSProperties;
}) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 16, ...style,
    }}>{children}</div>
  );
}

export function SectionTitle({
  kicker, title, sub, right,
}: {
  kicker?: string; title: string; sub?: string; right?: ReactNode;
}) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      marginBottom: 20, gap: 16, flexWrap: "wrap",
    }}>
      <div>
        {kicker && (
          <div style={{
            fontFamily: "var(--font-caveat), cursive",
            color: G, fontSize: 17, marginBottom: 4,
          }}>{kicker}</div>
        )}
        <h2 style={{
          fontFamily: "var(--font-syne), sans-serif", fontWeight: 700,
          fontSize: 22, color: C.text, letterSpacing: "-0.015em", margin: 0,
        }}>{title}</h2>
        {sub && <p style={{ fontSize: 13, color: C.text3, marginTop: 4 }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}
