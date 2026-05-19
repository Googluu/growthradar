"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import type { KeywordData, KeywordDataItem } from "@/types/dashboard";

const G  = "#22c55e";
const AM = "#fbbf24";
const OR = "#fb923c";
const RD = "#ef4444";
const BL = "#60a5fa";

const C = {
  card:        "rgba(255,255,255,0.025)",
  border:      "rgba(255,255,255,0.07)",
  borderStr:   "rgba(255,255,255,0.14)",
  text:        "#fff",
  text2:       "rgba(255,255,255,0.65)",
  text3:       "rgba(255,255,255,0.45)",
  text4:       "rgba(255,255,255,0.28)",
  greenSoft:   "rgba(34,197,94,0.15)",
  greenBorder: "rgba(34,197,94,0.35)",
  bg:          "#0a0a0a",
};

const COMP_META: Record<string, { label: string; tone: string; color: string }> = {
  LOW:    { label: "Baja",  tone: "green",  color: G  },
  MEDIUM: { label: "Media", tone: "yellow", color: AM },
  HIGH:   { label: "Alta",  tone: "red",    color: RD },
};

const SERIES_COLORS = [G, BL, "#a78bfa", OR, "#f472b6", AM, "#34d399", "#fb7185"];

// ── Formatters ────────────────────────────────────────────────────────────────
const fmtCompact = (n: number | null): string => {
  if (n == null) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, "") + "K";
  return String(n);
};

const usd = (n: number | null, d = 2): string => {
  if (n == null) return "—";
  return "$" + new Intl.NumberFormat("es-CO", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
};

const intCO = new Intl.NumberFormat("es-CO");

const fmtPct = (n: number): string => (n >= 0 ? "+" : "") + (n * 100).toFixed(0) + "%";

const monthShort = (ym: string): string => {
  const [y, m] = ym.split("-");
  return new Date(+y, +m - 1, 1).toLocaleString("es-CO", { month: "short" });
};

// ── Icon primitives ───────────────────────────────────────────────────────────
function Icon({ size = 16, sw = 1.6, children, style }: { size?: number; sw?: number; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}>
      {children}
    </svg>
  );
}

const IconBars    = (p: any) => <Icon {...p}><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></Icon>;
const IconDollar  = (p: any) => <Icon {...p}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></Icon>;
const IconArrowsUD = (p: any) => <Icon {...p}><path d="m17 5-5-3-5 3"/><path d="m17 19-5 3-5-3"/><line x1="12" y1="2" x2="12" y2="22"/></Icon>;
const IconCoins   = (p: any) => <Icon {...p}><circle cx="9" cy="9" r="7"/><path d="M22 14a7 7 0 0 1-7 7"/><path d="M22 14a7 7 0 0 0-7-7"/><path d="M15 14a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></Icon>;
const IconSearch  = (p: any) => <Icon {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></Icon>;
const IconFilter  = (p: any) => <Icon {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></Icon>;
const IconX       = (p: any) => <Icon {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Icon>;
const IconChart   = (p: any) => <Icon {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></Icon>;
const IconTrendUp = (p: any) => <Icon {...p}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></Icon>;
const IconArrowUp = (p: any) => <Icon {...p}><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></Icon>;
const IconArrowDn = (p: any) => <Icon {...p}><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></Icon>;
const IconCheck   = (p: any) => <Icon {...p}><polyline points="20 6 9 17 4 12"/></Icon>;

// ── Badge ─────────────────────────────────────────────────────────────────────
type Tone = "default" | "green" | "yellow" | "orange" | "red" | "blue";

const TONES: Record<Tone, { bg: string; fg: string; br: string }> = {
  default: { bg: "rgba(255,255,255,0.06)", fg: C.text2, br: "rgba(255,255,255,0.1)" },
  green:   { bg: C.greenSoft, fg: G, br: C.greenBorder },
  yellow:  { bg: "rgba(251,191,36,0.12)", fg: AM, br: "rgba(251,191,36,0.3)" },
  orange:  { bg: "rgba(251,146,60,0.12)", fg: OR, br: "rgba(251,146,60,0.3)" },
  red:     { bg: "rgba(239,68,68,0.12)", fg: RD, br: "rgba(239,68,68,0.3)" },
  blue:    { bg: "rgba(96,165,250,0.12)", fg: BL, br: "rgba(96,165,250,0.3)" },
};

function Badge({ children, tone = "default" as Tone, style }: { children: React.ReactNode; tone?: Tone; style?: React.CSSProperties }) {
  const t = TONES[tone];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: t.bg, color: t.fg, border: `1px solid ${t.br}`,
      fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
      letterSpacing: "0.01em", whiteSpace: "nowrap" as const, ...style,
    }}>{children}</span>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub: string; accent?: boolean }) {
  return (
    <div style={{
      padding: "20px 22px", display: "flex", flexDirection: "column" as const, gap: 12,
      background: C.card, border: `1px solid ${accent ? C.greenBorder : C.border}`, borderRadius: 16,
      minHeight: 140,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: accent ? C.greenSoft : "rgba(255,255,255,0.06)",
          color: accent ? G : C.text2,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: `1px solid ${accent ? C.greenBorder : C.border}`,
        }}>{icon}</div>
        <div style={{
          fontSize: 10.5, color: C.text3, letterSpacing: "0.07em",
          textTransform: "uppercase" as const, fontWeight: 600, textAlign: "right" as const,
        }}>{label}</div>
      </div>
      <div style={{ marginTop: "auto" }}>
        <div style={{
          fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
          fontSize: 32, lineHeight: 1, color: accent ? G : C.text,
          letterSpacing: "-0.02em",
        }}>{value}</div>
        <div style={{ fontSize: 12, color: C.text3, marginTop: 6 }}>{sub}</div>
      </div>
    </div>
  );
}

// ── Area Chart ────────────────────────────────────────────────────────────────
function AreaChart({ data, height = 240 }: { data: Array<{ year_month: string; search_volume: number }>; height?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(640);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(() => {
      const r = wrapRef.current!.getBoundingClientRect();
      setW(Math.max(300, r.width));
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
          <linearGradient id="gads-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={G} stopOpacity="0.4"/>
            <stop offset="100%" stopColor={G} stopOpacity="0"/>
          </linearGradient>
        </defs>
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={pad.l} x2={w - pad.r} y1={yAt(t)} y2={yAt(t)} stroke="rgba(255,255,255,0.05)" strokeDasharray="2 4"/>
            <text x={pad.l - 8} y={yAt(t) + 4} textAnchor="end" fontSize="10.5" fontFamily="monospace" fill={C.text3}>{fmtCompact(t)}</text>
          </g>
        ))}
        <path d={areaPath} fill="url(#gads-area)"/>
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
          borderRadius: 10, padding: "8px 12px", pointerEvents: "none" as const,
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

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ data, w = 140, h = 40, markPeakTrough = false, color = G, uid }:
  { data: Array<{ search_volume: number }>; w?: number; h?: number; markPeakTrough?: boolean; color?: string; uid?: string }) {
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
  const gid = uid || `spk-${Math.round(Math.random() * 1e6)}`;

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

// ── Competition Donut ─────────────────────────────────────────────────────────
function CompetitionDonut({ dist }: { dist: Record<string, number> }) {
  const [hover, setHover] = useState<number | null>(null);
  const entries = ["LOW", "MEDIUM", "HIGH"].map(k => ({ key: k, value: dist[k] || 0, ...COMP_META[k] }));
  const total = entries.reduce((s, e) => s + e.value, 0);
  const cx = 90, cy = 90, r = 72, ir = 48;
  let angle = -Math.PI / 2;

  const arcs = entries.filter(e => e.value > 0).map(e => {
    const a0 = angle;
    const a1 = angle + (e.value / total) * Math.PI * 2;
    angle = a1;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const x0 = cx + Math.cos(a0) * r,  y0 = cy + Math.sin(a0) * r;
    const x1 = cx + Math.cos(a1) * r,  y1 = cy + Math.sin(a1) * r;
    const xi0 = cx + Math.cos(a0) * ir, yi0 = cy + Math.sin(a0) * ir;
    const xi1 = cx + Math.cos(a1) * ir, yi1 = cy + Math.sin(a1) * ir;
    return { ...e, d: `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} L ${xi1} ${yi1} A ${ir} ${ir} 0 ${large} 0 ${xi0} ${yi0} Z` };
  });

  const current = hover != null ? entries[hover] : null;

  return (
    <div style={{ padding: 24, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16 }}>
      <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 17, color: C.text, marginBottom: 4 }}>
        Distribución de competencia
      </div>
      <div style={{ fontSize: 12, color: C.text3, marginBottom: 20 }}>Nivel de competencia publicitaria</div>
      <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" as const }}>
        <div style={{ position: "relative" as const, width: 180, height: 180, flexShrink: 0 }}>
          <svg width="180" height="180" viewBox="0 0 180 180">
            {arcs.map((a, i) => (
              <path key={a.key} d={a.d} fill={a.color}
                fillOpacity={hover == null || entries[hover]?.key === a.key ? 1 : 0.25}
                stroke={C.bg} strokeWidth="2"
                onMouseEnter={() => setHover(entries.findIndex(e => e.key === a.key))}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: "pointer", transition: "fill-opacity 0.15s" }}/>
            ))}
          </svg>
          <div style={{
            position: "absolute" as const, inset: 0,
            display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center",
            pointerEvents: "none" as const,
          }}>
            <div style={{ fontSize: 11, color: C.text3, fontWeight: 500, marginBottom: 2 }}>
              {current ? current.label : "Total"}
            </div>
            <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 800, fontSize: 30, color: C.text }}>
              {current ? current.value : total}
            </div>
            <div style={{ fontSize: 10.5, color: C.text3 }}>keywords</div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 140, display: "flex", flexDirection: "column" as const, gap: 8 }}>
          {entries.map((e, i) => (
            <div key={e.key}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", borderRadius: 8,
                background: hover === i ? "rgba(255,255,255,0.04)" : "transparent",
                cursor: "default",
              }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: e.color, flexShrink: 0 }}/>
              <span style={{ flex: 1, fontSize: 13, color: C.text2, fontWeight: 500 }}>{e.label}</span>
              <span style={{ fontFamily: "monospace", fontSize: 13, color: C.text, fontWeight: 600 }}>{e.value}</span>
              <span style={{ fontSize: 11, color: C.text3, minWidth: 38, textAlign: "right" as const }}>
                {total ? ((e.value / total) * 100).toFixed(0) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Seasonality ───────────────────────────────────────────────────────────────
function SeasonalitySection({ items }: { items: KeywordData["most_seasonal_keywords"] }) {
  if (!items?.length) return null;
  return (
    <div style={{ padding: 28, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap" as const, gap: 12 }}>
        <div>
          <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 17, marginBottom: 4 }}>Estacionalidad</div>
          <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 20, color: C.text }}>
            Estacionalidad detectada
          </div>
          <div style={{ fontSize: 12, color: C.text3, marginTop: 4 }}>Keywords con mayor variación entre pico y valle</div>
        </div>
        <Badge tone="green" style={{ fontSize: 12, padding: "4px 10px" }}>
          <IconTrendUp size={11}/> {items.length} con patrón claro
        </Badge>
      </div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
        {items.map((k, i) => {
          const varPct = (k.variation * 100).toFixed(0);
          const tone: Tone = k.variation > 1 ? "red" : k.variation > 0.5 ? "orange" : "yellow";
          return (
            <div key={k.keyword} style={{
              display: "grid", gridTemplateColumns: "24px 1fr auto auto",
              alignItems: "center", gap: 16,
              padding: "12px 16px",
              background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`, borderRadius: 12,
            }}>
              <div style={{ fontFamily: "monospace", fontSize: 11, color: C.text3, fontWeight: 600 }}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <div>
                <div style={{ fontSize: 14, color: C.text, fontWeight: 500, marginBottom: 3 }}>{k.keyword}</div>
                <div style={{ fontSize: 11, color: C.text3, display: "flex", gap: 12, fontFamily: "monospace" }}>
                  <span><span style={{ color: G }}>▲</span> {fmtCompact(k.peak_volume)}</span>
                  <span><span style={{ color: RD }}>▼</span> {fmtCompact(k.trough_volume)}</span>
                </div>
              </div>
              <Badge tone={tone}>
                <IconTrendUp size={10}/> +{varPct}%
              </Badge>
              <div style={{ fontSize: 11, color: C.text3 }}>variación</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Top By Volume ─────────────────────────────────────────────────────────────
function TopByVolume({ items }: { items: KeywordDataItem[] }) {
  const max = Math.max(...items.map(k => k.search_volume ?? 0));
  return (
    <div style={{ padding: 24, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 17, color: C.text }}>Top por volumen</div>
          <div style={{ fontSize: 12, color: C.text3, marginTop: 3 }}>Más búsquedas/mes</div>
        </div>
        <IconBars size={18} style={{ color: G }}/>
      </div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
        {items.map((k, i) => (
          <div key={k.keyword} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              fontFamily: "monospace", fontSize: 11,
              color: i === 0 ? G : C.text3, fontWeight: 700, width: 20, flexShrink: 0,
            }}>{i + 1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                <span style={{
                  fontSize: 13, color: C.text, fontWeight: 500,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, maxWidth: "60%",
                }}>{k.keyword}</span>
                <span style={{ fontFamily: "monospace", fontSize: 12, color: C.text, fontWeight: 600 }}>
                  {fmtCompact(k.search_volume)}
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
                <div style={{
                  width: `${((k.search_volume ?? 0) / max) * 100}%`, height: "100%",
                  background: `linear-gradient(90deg, ${G}, ${G}cc)`, borderRadius: 999,
                  boxShadow: i === 0 ? `0 0 12px ${G}40` : "none",
                }}/>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Top By CPC ────────────────────────────────────────────────────────────────
function TopByCpc({ items }: { items: KeywordDataItem[] }) {
  return (
    <div style={{ padding: 24, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 17, color: C.text }}>Más caros (PPC)</div>
          <div style={{ fontSize: 12, color: C.text3, marginTop: 3 }}>Mayor CPC en Google Ads</div>
        </div>
        <IconDollar size={18} style={{ color: RD }}/>
      </div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
        {items.map((k, i) => (
          <div key={k.keyword} style={{
            display: "grid", gridTemplateColumns: "20px 1fr auto", alignItems: "center", gap: 12,
            padding: "10px 12px", borderRadius: 10,
            background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`,
          }}>
            <div style={{ fontFamily: "monospace", fontSize: 11, color: i === 0 ? RD : C.text3, fontWeight: 700 }}>{i + 1}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 13, color: C.text, fontWeight: 500,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, marginBottom: 3,
              }}>{k.keyword}</div>
              <div style={{ fontSize: 11, color: C.text3, fontFamily: "monospace" }}>
                puja <span style={{ color: G }}>{usd(k.low_top_of_page_bid)}</span>
                {" → "}
                <span style={{ color: RD }}>{usd(k.high_top_of_page_bid)}</span>
              </div>
            </div>
            <div style={{
              fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 18,
              color: i === 0 ? RD : C.text,
            }}>{usd(k.cpc)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Trend Dialog ──────────────────────────────────────────────────────────────
function TrendDialog({ kw, onClose }: { kw: KeywordDataItem | null; onClose: () => void }) {
  useEffect(() => {
    if (!kw) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [kw, onClose]);

  if (!kw) return null;

  const chartData = kw.monthly_searches.map(m => ({
    year_month: `${m.year}-${String(m.month).padStart(2, "0")}`,
    search_volume: m.search_volume,
  }));
  const vols = kw.monthly_searches.map(m => m.search_volume);
  const peak = Math.max(...vols);
  const trough = Math.min(...vols);
  const avg = Math.round(vols.reduce((s, v) => s + v, 0) / vols.length);

  return (
    <div onClick={onClose} style={{
      position: "fixed" as const, inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#0f0f0f", border: `1px solid ${C.borderStr}`,
        borderRadius: 18, padding: 28, width: "100%", maxWidth: 880,
        boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 17, marginBottom: 4 }}>
              Tendencia detallada
            </div>
            <h2 style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 22, color: C.text }}>
              &ldquo;{kw.keyword}&rdquo;
            </h2>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`,
            color: C.text2, width: 32, height: 32, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}><IconX size={15}/></button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 22 }}>
          {[
            { label: "Volumen", value: fmtCompact(kw.search_volume), color: C.text },
            { label: "Pico 12m",  value: fmtCompact(peak),   color: G  },
            { label: "Valle 12m", value: fmtCompact(trough),  color: RD },
            { label: "Promedio",  value: fmtCompact(avg),     color: C.text2 },
          ].map((s, i) => (
            <div key={i} style={{
              padding: "12px 14px", borderRadius: 10,
              background: "rgba(255,255,255,0.025)", border: `1px solid ${C.border}`,
            }}>
              <div style={{ fontSize: 10.5, color: C.text3, letterSpacing: "0.06em", textTransform: "uppercase" as const, fontWeight: 600 }}>
                {s.label}
              </div>
              <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 20, color: s.color, marginTop: 4 }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        <AreaChart data={chartData} height={280}/>

        <div style={{
          marginTop: 18, padding: "14px 16px",
          background: "rgba(255,255,255,0.025)", border: `1px solid ${C.border}`, borderRadius: 12,
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" as const,
        }}>
          <div>
            <div style={{ fontSize: 11, color: C.text3, letterSpacing: "0.06em", textTransform: "uppercase" as const, fontWeight: 600, marginBottom: 4 }}>
              CPC y rango de puja
            </div>
            <div style={{ fontSize: 13, color: C.text2 }}>
              CPC medio <strong style={{ color: C.text }}>{usd(kw.cpc)}</strong>
              {" · puja "}
              <span style={{ color: G, fontFamily: "monospace" }}>{usd(kw.low_top_of_page_bid)}</span>
              {" → "}
              <span style={{ color: RD, fontFamily: "monospace" }}>{usd(kw.high_top_of_page_bid)}</span>
            </div>
          </div>
          {kw.competition && (
            <Badge tone={(COMP_META[kw.competition]?.tone as Tone) || "default"}>
              Competencia {COMP_META[kw.competition]?.label} · idx {kw.competition_index}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Keywords Table ────────────────────────────────────────────────────────────
function KeywordsTable({ keywords, onOpenTrend }: {
  keywords: KeywordDataItem[];
  onOpenTrend: (k: KeywordDataItem) => void;
}) {
  const [sort, setSort] = useState<{ key: keyof KeywordDataItem; dir: "asc" | "desc" }>({ key: "search_volume", dir: "desc" });
  const [search, setSearch] = useState("");
  const [minVol, setMinVol] = useState("");
  const [maxVol, setMaxVol] = useState("");
  const [compFilter, setCompFilter] = useState<string[]>([]);

  const filtered = useMemo(() => keywords.filter(k => {
    if (search && !k.keyword.toLowerCase().includes(search.toLowerCase())) return false;
    if (compFilter.length && k.competition && !compFilter.includes(k.competition)) return false;
    const v = k.search_volume ?? 0;
    if (minVol && v < +minVol) return false;
    if (maxVol && v > +maxVol) return false;
    return true;
  }), [keywords, search, minVol, maxVol, compFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sort.dir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      const va = (a as any)[sort.key], vb = (b as any)[sort.key];
      if (va == null) return 1; if (vb == null) return -1;
      if (typeof va === "string") return va.localeCompare(vb) * dir;
      return (va - vb) * dir;
    });
    return arr;
  }, [filtered, sort]);

  const toggleSort = (key: keyof KeywordDataItem) =>
    setSort(s => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" });

  const hasFilters = !!(search || minVol || maxVol || compFilter.length);

  const thStyle: React.CSSProperties = {
    padding: "14px 16px", fontSize: 10.5, fontWeight: 600, color: C.text3,
    letterSpacing: "0.07em", textTransform: "uppercase",
    borderBottom: `1px solid ${C.border}`,
    background: "rgba(255,255,255,0.02)", cursor: "pointer", userSelect: "none",
    whiteSpace: "nowrap",
  };

  const SortHead = ({ k, children, align }: { k: keyof KeywordDataItem; children: React.ReactNode; align?: string }) => (
    <th style={{ ...thStyle, textAlign: (align || "left") as any }} onClick={() => toggleSort(k)}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
        {children}
        {sort.key === k && (sort.dir === "asc" ? <IconArrowUp size={11}/> : <IconArrowDn size={11}/>)}
      </span>
    </th>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap" as const, gap: 12 }}>
        <div>
          <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 17, marginBottom: 4 }}>Tabla maestra</div>
          <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 20, color: C.text }}>
            {filtered.length} keywords
          </div>
          <div style={{ fontSize: 12, color: C.text3, marginTop: 4 }}>Ordenar por columna · Ver tendencia detallada</div>
        </div>
        <Badge tone="default" style={{ fontSize: 12, padding: "4px 10px" }}>
          {keywords.length} totales
        </Badge>
      </div>

      {/* Filter bar */}
      <div style={{
        display: "flex", gap: 10, alignItems: "center",
        padding: "12px 14px", background: "rgba(255,255,255,0.02)",
        borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 14, flexWrap: "wrap" as const,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 8,
          background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, flex: 1, minWidth: 200,
        }}>
          <IconSearch size={14} style={{ color: C.text3 }}/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar keyword..." style={{
              flex: 1, fontSize: 13, color: C.text, background: "none", border: "none", outline: "none",
            }}/>
          {search && (
            <button onClick={() => setSearch("")} style={{ background: "transparent", border: "none", color: C.text3, cursor: "pointer", display: "inline-flex", padding: 0 }}>
              <IconX size={13}/>
            </button>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, color: C.text3 }}>Volumen:</span>
          {(["Min", "Max"] as const).map(p => (
            <input key={p} value={p === "Min" ? minVol : maxVol}
              onChange={e => { const v = e.target.value.replace(/\D/g, ""); p === "Min" ? setMinVol(v) : setMaxVol(v); }}
              placeholder={p} inputMode="numeric" style={{
                width: 72, fontSize: 12.5, color: C.text, padding: "7px 10px", borderRadius: 8,
                background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
                fontFamily: "monospace", outline: "none",
              }}/>
          ))}
        </div>

        {/* Competition filter */}
        <div style={{ display: "flex", gap: 6 }}>
          {["LOW", "MEDIUM", "HIGH"].map(lvl => {
            const m = COMP_META[lvl];
            const active = compFilter.includes(lvl);
            return (
              <button key={lvl} onClick={() => setCompFilter(f => active ? f.filter(x => x !== lvl) : [...f, lvl])}
                style={{
                  padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer",
                  background: active ? `${m.color}20` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${active ? m.color + "60" : C.border}`,
                  color: active ? m.color : C.text2,
                }}>{m.label}</button>
            );
          })}
        </div>

        {hasFilters && (
          <button onClick={() => { setSearch(""); setMinVol(""); setMaxVol(""); setCompFilter([]); }}
            style={{ background: "transparent", border: "none", color: C.text3, fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>
            Limpiar filtros
          </button>
        )}
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr>
                <SortHead k="keyword">Keyword</SortHead>
                <SortHead k="search_volume">Volumen</SortHead>
                <SortHead k="competition" align="center">Competencia</SortHead>
                <SortHead k="competition_index">Índice</SortHead>
                <SortHead k="cpc" align="right">CPC</SortHead>
                <SortHead k="high_top_of_page_bid">Rango puja</SortHead>
                <th style={{ ...thStyle, textAlign: "center", cursor: "default" }}>Tendencia</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(k => {
                const compMeta = k.competition ? COMP_META[k.competition] : null;
                return (
                  <tr key={k.keyword}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                    <td style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: 14, color: C.text, fontWeight: 500 }}>{k.keyword}</span>
                    </td>
                    <td style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontFamily: "monospace", fontSize: 13, color: C.text, fontWeight: 600, minWidth: 52 }}>
                          {fmtCompact(k.search_volume)}
                        </span>
                        {k.monthly_searches?.length > 1 && (
                          <Sparkline data={k.monthly_searches} w={70} h={22} uid={`spk-${k.keyword.replace(/\s/g,"")}`}/>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, textAlign: "center" }}>
                      {compMeta ? <Badge tone={compMeta.tone as Tone}>{compMeta.label}</Badge> : <span style={{ color: C.text4 }}>—</span>}
                    </td>
                    <td style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
                      {k.competition_index != null ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ flex: 1, height: 6, borderRadius: 999, background: "rgba(255,255,255,0.05)", overflow: "hidden", maxWidth: 100 }}>
                            <div style={{
                              width: `${k.competition_index}%`, height: "100%", borderRadius: 999,
                              background: k.competition_index >= 70 ? RD : k.competition_index >= 40 ? AM : G,
                            }}/>
                          </div>
                          <span style={{ fontFamily: "monospace", fontSize: 11, color: C.text2, fontWeight: 600, minWidth: 24, textAlign: "right" as const }}>
                            {k.competition_index}
                          </span>
                        </div>
                      ) : <span style={{ color: C.text4 }}>—</span>}
                    </td>
                    <td style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, textAlign: "right" }}>
                      <span style={{ fontFamily: "monospace", fontSize: 13, color: C.text, fontWeight: 600 }}>
                        {usd(k.cpc)}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "monospace", fontSize: 12 }}>
                        <span style={{ color: G }}>{usd(k.low_top_of_page_bid)}</span>
                        <span style={{ color: C.text4 }}>→</span>
                        <span style={{ color: RD }}>{usd(k.high_top_of_page_bid)}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, textAlign: "center" }}>
                      {k.monthly_searches?.length > 0 && (
                        <button onClick={() => onOpenTrend(k)} style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
                          color: C.text2, fontSize: 12, fontWeight: 500,
                          padding: "6px 10px", borderRadius: 7, cursor: "pointer",
                        }}>
                          <IconChart size={11}/> Ver
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {sorted.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: C.text3 }}>
                  No hay keywords que coincidan con los filtros.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function GoogleAdsVolumeSection({ data }: { data: KeywordData }) {
  const [trendKw, setTrendKw] = useState<KeywordDataItem | null>(null);

  const first = data.monthly_aggregated[0]?.search_volume;
  const last = data.monthly_aggregated[data.monthly_aggregated.length - 1]?.search_volume;
  const delta = first && last ? (last - first) / first : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        <KpiCard
          icon={<IconBars size={18}/>}
          label="Volumen total"
          value={fmtCompact(data.total_search_volume)}
          sub={`${intCO.format(data.total_search_volume)} búsquedas/mes`}
          accent
        />
        <KpiCard
          icon={<IconDollar size={18}/>}
          label="CPC promedio"
          value={usd(data.avg_cpc)}
          sub={`${data.keywords_count} keywords analizadas`}
        />
        <KpiCard
          icon={<IconArrowsUD size={18}/>}
          label="Rango CPC"
          value={
            <span style={{ display: "inline-flex", alignItems: "baseline", gap: 8, lineHeight: 1 }}>
              <span style={{ color: G }}>{usd(data.min_cpc)}</span>
              <span style={{ color: C.text4, fontSize: 18, fontWeight: 400 }}>→</span>
              <span style={{ color: RD }}>{usd(data.max_cpc)}</span>
            </span>
          }
          sub="puja mínima → máxima top de página"
        />
        <KpiCard
          icon={<IconCoins size={18}/>}
          label="Costo PPC estimado"
          value={usd(data.total_ppc_cost_estimate_usd, 0)}
          sub="suma de pujas máximas"
        />
      </div>

      {/* ── Monthly trend */}
      <div style={{ padding: 24, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap" as const, gap: 12 }}>
          <div>
            <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 20, color: C.text }}>
              Tendencia mensual agregada
            </div>
            <div style={{ fontSize: 12, color: C.text3, marginTop: 4 }}>Volumen total de búsqueda · últimos 12 meses</div>
          </div>
          {first && last && (
            <Badge tone={delta >= 0 ? "green" : "red"} style={{ fontSize: 12, padding: "4px 10px" }}>
              {delta >= 0 ? <IconArrowUp size={11}/> : <IconArrowDn size={11}/>}
              {fmtPct(delta)} YoY
            </Badge>
          )}
        </div>
        <AreaChart data={data.monthly_aggregated}/>
      </div>

      {/* ── Competition donut + top by CPC */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <CompetitionDonut dist={data.competition_distribution}/>
        <TopByCpc items={data.top_keywords_by_cpc}/>
      </div>

      {/* ── Top by volume + seasonality */}
      {(data.top_keywords_by_volume?.length > 0 || data.most_seasonal_keywords?.length > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {data.top_keywords_by_volume?.length > 0 && <TopByVolume items={data.top_keywords_by_volume}/>}
          {data.most_seasonal_keywords?.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <SeasonalitySection items={data.most_seasonal_keywords}/>
            </div>
          )}
        </div>
      )}

      {/* ── Full keywords table */}
      <KeywordsTable keywords={data.keywords} onOpenTrend={setTrendKw}/>

      {/* ── Trend dialog */}
      {trendKw && <TrendDialog kw={trendKw} onClose={() => setTrendKw(null)}/>}
    </div>
  );
}
