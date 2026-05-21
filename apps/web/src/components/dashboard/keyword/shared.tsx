"use client";

import React from "react";

// ── Design tokens ──────────────────────────────────────────────────────────
export const G  = "#22c55e";
export const Gs = "rgba(34,197,94,0.15)";
export const Gb = "rgba(34,197,94,0.35)";
export const AM = "#f59e0b";
export const RD = "#ef4444";
export const BL = "#60a5fa";
export const PU = "#a78bfa";
export const OR = "#f97316";

export const C = {
  bg:          "#0a0a0a",
  card:        "rgba(255,255,255,0.025)",
  cardHover:   "rgba(255,255,255,0.045)",
  border:      "rgba(255,255,255,0.07)",
  borderStrong:"rgba(255,255,255,0.14)",
  text:        "#fff",
  text2:       "rgba(255,255,255,0.65)",
  text3:       "rgba(255,255,255,0.45)",
  text4:       "rgba(255,255,255,0.28)",
};

// ── Helpers ────────────────────────────────────────────────────────────────
export const diffColor = (n: number | null): string => {
  if (n == null) return C.text4;
  if (n < 30) return G;
  if (n < 50) return AM;
  if (n < 70) return OR;
  return RD;
};

export const fmtCompact = (n: number | null | undefined): string => {
  if (n == null) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1) + "K";
  return String(n);
};

export const fmtUsd = (n: number | null | undefined): string =>
  n == null ? "—" : "$" + n.toLocaleString("en-US", { maximumFractionDigits: 2 });

export const INTENT_META: Record<string, { label: string; icon: string; color: string }> = {
  informational: { label: "Informacional", icon: "💡", color: BL },
  commercial:    { label: "Comercial",     icon: "💰", color: AM },
  navigational:  { label: "Navegacional",  icon: "🔍", color: PU },
  transactional: { label: "Transaccional", icon: "🛒", color: G },
};

// ── Icons ──────────────────────────────────────────────────────────────────
function Ico({ size = 16, sw = 1.6, children }: { size?: number; sw?: number; children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {children}
    </svg>
  );
}

export const IconTrendUp   = ({ size }: { size?: number }) => <Ico size={size}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></Ico>;
export const IconDollar    = ({ size }: { size?: number }) => <Ico size={size}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></Ico>;
export const IconGauge     = ({ size }: { size?: number }) => <Ico size={size}><path d="M12 14l4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></Ico>;
export const IconTraffic   = ({ size }: { size?: number }) => <Ico size={size}><path d="M3 3v18h18"/><path d="M7 16l4-6 4 3 5-8"/></Ico>;
export const IconSparkle   = ({ size }: { size?: number }) => <Ico size={size}><path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3z"/></Ico>;
export const IconClock     = ({ size }: { size?: number }) => <Ico size={size}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Ico>;
export const IconExternal  = ({ size }: { size?: number }) => <Ico size={size}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></Ico>;
export const IconFilter    = ({ size }: { size?: number }) => <Ico size={size}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></Ico>;
export const IconLayers    = ({ size }: { size?: number }) => <Ico size={size}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></Ico>;
export const IconArrowUp   = ({ size }: { size?: number }) => <Ico size={size}><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></Ico>;
export const IconArrowDown = ({ size }: { size?: number }) => <Ico size={size}><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></Ico>;

// ── Badge ──────────────────────────────────────────────────────────────────
type BadgeTone = "default" | "green" | "yellow" | "orange" | "red" | "blue" | "purple";

const BADGE_TONES: Record<BadgeTone, { bg: string; fg: string; br: string }> = {
  default: { bg: "rgba(255,255,255,0.06)", fg: C.text2,   br: "rgba(255,255,255,0.1)" },
  green:   { bg: Gs,                       fg: G,          br: Gb },
  yellow:  { bg: "rgba(251,191,36,0.12)", fg: AM,         br: "rgba(251,191,36,0.3)" },
  orange:  { bg: "rgba(249,115,22,0.12)", fg: OR,         br: "rgba(249,115,22,0.3)" },
  red:     { bg: "rgba(239,68,68,0.12)",  fg: RD,         br: "rgba(239,68,68,0.3)" },
  blue:    { bg: "rgba(96,165,250,0.12)", fg: BL,         br: "rgba(96,165,250,0.3)" },
  purple:  { bg: "rgba(167,139,250,0.12)",fg: PU,         br: "rgba(167,139,250,0.3)" },
};

export function Badge({
  children, tone = "default", style,
}: {
  children: React.ReactNode; tone?: BadgeTone; style?: React.CSSProperties;
}) {
  const t = BADGE_TONES[tone] ?? BADGE_TONES.default;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: t.bg, color: t.fg, border: `1px solid ${t.br}`,
      fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
      letterSpacing: "0.01em", whiteSpace: "nowrap", ...style,
    }}>{children}</span>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────
export function Card({
  children, style, accent,
}: {
  children: React.ReactNode; style?: React.CSSProperties; accent?: boolean;
}) {
  return (
    <div style={{
      background: accent ? `linear-gradient(180deg, ${Gs}, ${C.card})` : C.card,
      border: `1px solid ${accent ? Gb : C.border}`,
      borderRadius: 16,
      ...style,
    }}>{children}</div>
  );
}

// ── SectionTitle ───────────────────────────────────────────────────────────
export function SectionTitle({
  kicker, title, sub, right,
}: {
  kicker?: string; title: string; sub?: string; right?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 16, flexWrap: "wrap" }}>
      <div>
        {kicker && <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 17, marginBottom: 4 }}>{kicker}</div>}
        <h2 style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 22, color: C.text, letterSpacing: "-0.015em" }}>{title}</h2>
        {sub && <p style={{ fontSize: 13, color: C.text3, marginTop: 4 }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}
