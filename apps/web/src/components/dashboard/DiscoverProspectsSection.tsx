"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import type { DiscoverProspectsData, ProspectData } from "@/types/dashboard";

const G  = "#22c55e";
const AM = "#f59e0b";
const OR = "#fb923c";
const RD = "#ef4444";
const BL = "#60a5fa";
const PU = "#a78bfa";
const YL = "#fbbf24";

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

const WEAKNESS_LABELS: Record<string, string> = {
  no_logo:            "Sin logo",
  no_main_image:      "Sin foto portada",
  no_description:     "Sin descripción",
  no_phone:           "Sin teléfono",
  no_website:         "Sin sitio web",
  unclaimed:          "No reclamado",
  low_rating:         "Rating bajo",
  few_reviews:        "Pocas reseñas",
  incomplete_address: "Dirección incompleta",
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  open:               { label: "Abierto",           color: G  },
  closed_temporarily: { label: "Cerrado temporal",  color: AM },
  closed_permanently: { label: "Cerrado permanente",color: RD },
  unknown:            { label: "Desconocido",       color: C.text3 },
};

function opportunityTier(s: number | null) {
  if (s == null) return { color: C.text3, bg: "rgba(255,255,255,0.05)", label: "—" };
  if (s >= 80)   return { color: BL, bg: "rgba(96,165,250,0.15)",  label: "Hot"  };
  if (s >= 60)   return { color: G,  bg: C.greenSoft,              label: "Alta" };
  if (s >= 40)   return { color: AM, bg: "rgba(245,158,11,0.15)",  label: "Media"};
  return            { color: RD, bg: "rgba(239,68,68,0.15)",   label: "Baja" };
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function Icon({ size = 16, sw = 1.6, fill = "none", children, style }: {
  size?: number; sw?: number; fill?: string; children: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
      stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}>
      {children}
    </svg>
  );
}

const IconSearch  = (p: any) => <Icon {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></Icon>;
const IconShield  = (p: any) => <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Icon>;
const IconGlobe   = (p: any) => <Icon {...p}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></Icon>;
const IconFire    = (p: any) => <Icon {...p}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></Icon>;
const IconStar    = (p: any) => <Icon {...p} fill="currentColor" sw={0}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></Icon>;
const IconArrowUp = (p: any) => <Icon {...p}><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></Icon>;
const IconArrowDn = (p: any) => <Icon {...p}><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></Icon>;
const IconPhone   = (p: any) => <Icon {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></Icon>;
const IconPin     = (p: any) => <Icon {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Icon>;
const IconX       = (p: any) => <Icon {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Icon>;

// ── Score badge ───────────────────────────────────────────────────────────────
function ScoreBadge({ score }: { score: number | null }) {
  const t = opportunityTier(score);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: t.bg, color: t.color, border: `1px solid ${t.color}55`,
      fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
      fontSize: 13, padding: "3px 10px", borderRadius: 999, whiteSpace: "nowrap" as const,
    }}>
      {score ?? "—"} <span style={{ fontSize: 10, fontWeight: 600 }}>{t.label}</span>
    </span>
  );
}

// ── Stars ─────────────────────────────────────────────────────────────────────
function Stars({ value, size = 11 }: { value: number | null; size?: number }) {
  if (value == null) return <span style={{ color: C.text4 }}>—</span>;
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[0, 1, 2, 3, 4].map(i => (
        <span key={i} style={{ color: value - i >= 0.5 ? YL : C.text4 }}>
          <IconStar size={size}/>
        </span>
      ))}
    </span>
  );
}

// ── Prospect avatar ───────────────────────────────────────────────────────────
function Avatar({ name, size = 40 }: { name: string | null; size?: number }) {
  const n = name || "?";
  const hash = [...n].reduce((s, c) => s + c.charCodeAt(0), 0);
  const palette = [G, BL, PU, OR, "#f472b6", AM];
  const col = palette[hash % palette.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: 9, flexShrink: 0,
      background: `linear-gradient(135deg, ${col}55, ${col}22), #1a1a1a`,
      border: `1px solid ${col}40`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
      color: col, fontSize: size * 0.42, letterSpacing: "-0.04em",
    }}>{n.charAt(0).toUpperCase()}</div>
  );
}

// ── KPI Row ───────────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, accent, accentColor }: {
  icon: React.ReactNode; label: string; value: React.ReactNode; sub?: React.ReactNode;
  accent?: boolean; accentColor?: string;
}) {
  const ac = accentColor || G;
  return (
    <div style={{
      padding: "20px 22px", display: "flex", flexDirection: "column" as const, gap: 12,
      background: C.card, border: `1px solid ${accent ? `${ac}50` : C.border}`, borderRadius: 16, minHeight: 130,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: accent ? `${ac}22` : "rgba(255,255,255,0.06)",
          color: accent ? ac : C.text2, border: `1px solid ${accent ? `${ac}50` : C.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{icon}</div>
        <div style={{ fontSize: 10.5, color: C.text3, letterSpacing: "0.07em", textTransform: "uppercase" as const, fontWeight: 600, textAlign: "right" as const }}>
          {label}
        </div>
      </div>
      <div style={{ marginTop: "auto" }}>
        <div style={{
          fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
          fontSize: 34, lineHeight: 1, color: accent ? ac : C.text, letterSpacing: "-0.025em",
        }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: C.text3, marginTop: 6 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Top opportunity list ──────────────────────────────────────────────────────
function TopOpportunityList({ prospects, onSelect }: { prospects: ProspectData[]; onSelect: (p: ProspectData) => void }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
      height: 500, display: "flex", flexDirection: "column" as const,
    }}>
      <div style={{
        padding: "14px 18px", borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      }}>
        <div>
          <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 16, marginBottom: 2 }}>Top oportunidades</div>
          <div style={{ fontSize: 13, color: C.text2 }}>Score ≥ 60 — empieza por aquí</div>
        </div>
        <span style={{
          background: C.greenSoft, color: G, border: `1px solid ${C.greenBorder}`,
          fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999,
          display: "inline-flex", alignItems: "center", gap: 5,
        }}>
          <IconFire size={11}/> {prospects.length}
        </span>
      </div>
      <div style={{ flex: 1, overflowY: "auto" as const, padding: 8 }}>
        {prospects.slice(0, 20).map((p, i) => {
          const t = opportunityTier(p.opportunity_score.score);
          const weaknesses = p.opportunity_score.weakness_signals.slice(0, 3);
          return (
            <div key={`${p.name}-${i}`}
              onClick={() => onSelect(p)}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                marginBottom: 4,
              }}>
              <div style={{ fontFamily: "monospace", fontSize: 10, color: t.color, fontWeight: 700, width: 18, textAlign: "right" as const }}>
                {i + 1}
              </div>
              <Avatar name={p.name}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13.5, color: C.text, fontWeight: 600, marginBottom: 3,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const,
                }}>{p.name || "Sin nombre"}</div>
                <div style={{ fontSize: 11, color: C.text3, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" as const }}>
                  {p.category.primary && <span>{p.category.primary}</span>}
                  <Stars value={p.reviews.rating.value} size={10}/>
                  {p.reviews.rating.votes_count > 0 && (
                    <span style={{ color: C.text4, fontFamily: "monospace" }}>({p.reviews.rating.votes_count})</span>
                  )}
                </div>
                {weaknesses.length > 0 && (
                  <div style={{ display: "flex", gap: 4, marginTop: 5, flexWrap: "wrap" as const }}>
                    {weaknesses.map(w => (
                      <span key={w} style={{
                        fontSize: 9.5, color: C.text2, fontWeight: 500,
                        padding: "2px 6px", borderRadius: 4,
                        background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
                      }}>{WEAKNESS_LABELS[w] || w}</span>
                    ))}
                    {p.opportunity_score.weakness_signals.length > 3 && (
                      <span style={{ fontSize: 9.5, color: C.text3, padding: "2px 4px" }}>
                        +{p.opportunity_score.weakness_signals.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <ScoreBadge score={p.opportunity_score.score}/>
            </div>
          );
        })}
        {prospects.length === 0 && (
          <div style={{ padding: "60px 24px", textAlign: "center" as const, color: C.text3 }}>
            Sin prospectos de alta oportunidad
          </div>
        )}
      </div>
    </div>
  );
}

// ── Categories treemap ────────────────────────────────────────────────────────
type Rect = { label: string; value: number; color: string; x: number; y: number; w: number; h: number };

function squarify(values: Array<{ label: string; value: number; color: string }>, width: number, height: number): Rect[] {
  if (!values.length) return [];
  const total = values.reduce((s, v) => s + v.value, 0);
  if (total <= 0) return [];
  const items = values.map(v => ({ ...v, area: (v.value / total) * width * height })).sort((a, b) => b.area - a.area);
  const result: Rect[] = [];
  let x = 0, y = 0, w = width, h = height, i = 0;
  const worst = (row: typeof items, side: number) => {
    const sum = row.reduce((a, b) => a + b.area, 0);
    const max = Math.max(...row.map(r => r.area));
    const min = Math.min(...row.map(r => r.area));
    return Math.max((side * side * max) / (sum * sum), (sum * sum) / (side * side * min));
  };
  while (i < items.length) {
    const remaining = items.slice(i);
    const horizontal = w >= h;
    const side = horizontal ? h : w;
    let row: typeof items = [];
    for (const it of remaining) {
      const cand = [...row, it];
      if (row.length === 0 || worst(cand, side) < worst(row, side)) row = cand;
      else break;
    }
    const rowSum = row.reduce((a, b) => a + b.area, 0);
    const thick = rowSum / side;
    let cursor = horizontal ? y : x;
    for (const it of row) {
      const len = it.area / thick;
      result.push({ ...it, x: horizontal ? x : cursor, y: horizontal ? cursor : y, w: horizontal ? thick : len, h: horizontal ? len : thick });
      cursor += len;
    }
    if (horizontal) { x += thick; w -= thick; } else { y += thick; h -= thick; }
    i += row.length;
  }
  return result;
}

const PALETTE = [G, "#4ade80", BL, PU, AM, OR, "#f472b6", "#34d399"];

function CategoriesTreemap({ categories }: { categories: Array<{ category: string; count: number }> }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 600, h: 280 });

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(() => {
      const r = wrapRef.current!.getBoundingClientRect();
      setSize({ w: Math.max(280, r.width), h: 280 });
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const values = categories.map((c, i) => ({ label: c.category, value: c.count, color: PALETTE[i % PALETTE.length] }));
  const rects = useMemo(() => squarify(values, size.w, size.h), [values, size.w, size.h]);
  const total = values.reduce((s, v) => s + v.value, 0);

  return (
    <div style={{ padding: 24, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 16, marginBottom: 2 }}>Categorías</div>
        <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 18, color: C.text }}>
          Tipos de negocio en la zona
        </div>
      </div>
      <div ref={wrapRef} style={{ width: "100%" }}>
        <svg width={size.w} height={size.h} style={{ display: "block" }}>
          {rects.map((r, i) => {
            const pct = (r.value / total) * 100;
            const showLabel = r.w > 80 && r.h > 40;
            return (
              <g key={i}>
                <rect x={r.x + 2} y={r.y + 2} width={Math.max(0, r.w - 4)} height={Math.max(0, r.h - 4)}
                  rx={8} fill={r.color} fillOpacity={0.2} stroke={r.color} strokeOpacity={0.45} strokeWidth={1}/>
                {showLabel ? (
                  <>
                    <text x={r.x + 12} y={r.y + 24} fontSize="12" fontFamily="sans-serif" fontWeight="600" fill={C.text}>{r.label}</text>
                    <text x={r.x + 12} y={r.y + 50} fontSize="22" fontFamily="var(--font-syne)" fontWeight="800" fill={r.color}>{r.value}</text>
                    {r.h > 74 && (
                      <text x={r.x + 12} y={r.y + 66} fontSize="10.5" fontFamily="monospace" fill={C.text3}>{pct.toFixed(0)}%</text>
                    )}
                  </>
                ) : r.w > 32 && r.h > 32 && (
                  <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 5} fontSize="13"
                    fontFamily="var(--font-syne)" fontWeight="700" fill={C.text} textAnchor="middle">
                    {r.value}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ── Operating status donut ────────────────────────────────────────────────────
function StatusDonut({ dist }: { dist: Record<string, number> }) {
  const [hover, setHover] = useState<number | null>(null);
  const entries = Object.entries(dist).filter(([, v]) => v > 0)
    .map(([k, v]) => ({ key: k, value: v, ...(STATUS_META[k] || { label: k, color: C.text3 }) }));
  const total = entries.reduce((s, e) => s + e.value, 0);
  const cx = 90, cy = 90, r = 72, ir = 48;
  let angle = -Math.PI / 2;
  const arcs = entries.map(e => {
    const a0 = angle, a1 = angle + (e.value / total) * Math.PI * 2;
    angle = a1;
    const lg = a1 - a0 > Math.PI ? 1 : 0;
    const x0 = cx + Math.cos(a0) * r, y0 = cy + Math.sin(a0) * r;
    const x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r;
    const xi0 = cx + Math.cos(a0) * ir, yi0 = cy + Math.sin(a0) * ir;
    const xi1 = cx + Math.cos(a1) * ir, yi1 = cy + Math.sin(a1) * ir;
    return { ...e, d: `M ${x0} ${y0} A ${r} ${r} 0 ${lg} 1 ${x1} ${y1} L ${xi1} ${yi1} A ${ir} ${ir} 0 ${lg} 0 ${xi0} ${yi0} Z` };
  });
  const cur = hover != null ? entries[hover] : null;

  return (
    <div style={{ padding: 24, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, height: "100%" }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 16, marginBottom: 2 }}>Operación</div>
        <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 18, color: C.text }}>Estado operativo</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" as const }}>
        <div style={{ position: "relative" as const, width: 180, height: 180, flexShrink: 0 }}>
          <svg width="180" height="180" viewBox="0 0 180 180">
            {arcs.map((a, i) => (
              <path key={a.key} d={a.d} fill={a.color}
                fillOpacity={hover == null || hover === i ? 1 : 0.25}
                stroke={C.bg} strokeWidth="2"
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
                style={{ cursor: "pointer", transition: "fill-opacity 0.15s" }}/>
            ))}
          </svg>
          <div style={{
            position: "absolute" as const, inset: 0,
            display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center",
            pointerEvents: "none" as const,
          }}>
            <div style={{ fontSize: 11, color: C.text3, fontWeight: 500 }}>{cur?.label || "Total"}</div>
            <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 800, fontSize: 30, color: cur?.color || C.text }}>
              {cur?.value ?? total}
            </div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 130, display: "flex", flexDirection: "column" as const, gap: 8 }}>
          {entries.map((e, i) => (
            <div key={e.key}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8,
                background: hover === i ? "rgba(255,255,255,0.04)" : "transparent", cursor: "default",
              }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: e.color, flexShrink: 0 }}/>
              <span style={{ flex: 1, fontSize: 12.5, color: C.text2, fontWeight: 500 }}>{e.label}</span>
              <span style={{ fontFamily: "monospace", fontSize: 13, color: C.text, fontWeight: 600 }}>{e.value}</span>
              <span style={{ fontSize: 11, color: C.text3, minWidth: 36, textAlign: "right" as const }}>
                {((e.value / total) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Prospect detail panel ─────────────────────────────────────────────────────
function ProspectPanel({ prospect, onClose }: { prospect: ProspectData; onClose: () => void }) {
  const t = opportunityTier(prospect.opportunity_score.score);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{
      position: "fixed" as const, inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#0f0f0f", border: `1px solid ${C.borderStr}`,
        borderRadius: 18, padding: 28, width: "100%", maxWidth: 600,
        boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <Avatar name={prospect.name} size={52}/>
            <div>
              <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 800, fontSize: 20, color: C.text, marginBottom: 4 }}>
                {prospect.name || "Sin nombre"}
              </div>
              <div style={{ fontSize: 12, color: C.text3 }}>{prospect.category.primary} · {prospect.location.city}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <ScoreBadge score={prospect.opportunity_score.score}/>
            <button onClick={onClose} style={{
              background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`,
              color: C.text2, width: 32, height: 32, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}><IconX size={15}/></button>
          </div>
        </div>

        {/* Quick facts */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Rating", value: prospect.reviews.rating.value?.toFixed(1) ?? "—", sub: `${prospect.reviews.rating.votes_count} reseñas` },
            { label: "Completitud", value: `${prospect.profile_completeness.score}%`, sub: "perfil Google" },
            { label: "Estado", value: STATUS_META[prospect.status.operating_status]?.label ?? prospect.status.operating_status,
              sub: prospect.status.is_claimed ? "Reclamado" : "Sin reclamar" },
          ].map(f => (
            <div key={f.label} style={{
              padding: "12px 14px", borderRadius: 10,
              background: "rgba(255,255,255,0.025)", border: `1px solid ${C.border}`,
            }}>
              <div style={{ fontSize: 10.5, color: C.text3, textTransform: "uppercase" as const, fontWeight: 600, marginBottom: 4 }}>{f.label}</div>
              <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 18, color: C.text }}>{f.value}</div>
              <div style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>{f.sub}</div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8, marginBottom: 20 }}>
          {prospect.contact.phone && (
            <a href={`tel:${prospect.contact.phone}`} style={{
              display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", borderRadius: 10,
              background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`, textDecoration: "none",
            }}>
              <IconPhone size={14} style={{ color: G }}/><span style={{ fontSize: 13, color: C.text2 }}>{prospect.contact.phone}</span>
            </a>
          )}
          {prospect.contact.website_url && (
            <a href={prospect.contact.website_url} target="_blank" rel="noreferrer" style={{
              display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", borderRadius: 10,
              background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`, textDecoration: "none",
            }}>
              <IconGlobe size={14} style={{ color: G }}/><span style={{ fontSize: 13, color: C.text2 }}>{prospect.contact.domain || prospect.contact.website_url}</span>
            </a>
          )}
          {prospect.location.address && (
            <div style={{
              display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", borderRadius: 10,
              background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`,
            }}>
              <IconPin size={14} style={{ color: G }}/><span style={{ fontSize: 13, color: C.text2 }}>{prospect.location.address}</span>
            </div>
          )}
        </div>

        {/* Weakness signals */}
        {prospect.opportunity_score.weakness_signals.length > 0 && (
          <div>
            <div style={{ fontSize: 11, color: C.text3, textTransform: "uppercase" as const, fontWeight: 600, letterSpacing: "0.06em", marginBottom: 10 }}>
              Señales de debilidad · {prospect.opportunity_score.weakness_signals.length}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
              {prospect.opportunity_score.weakness_signals.map(w => (
                <span key={w} style={{
                  fontSize: 12, fontWeight: 500, color: C.text2,
                  padding: "4px 10px", borderRadius: 999,
                  background: `${t.color}10`, border: `1px solid ${t.color}30`,
                }}>{WEAKNESS_LABELS[w] || w}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Full prospects table ──────────────────────────────────────────────────────
type SortKey = "name" | "rating" | "opportunity_score";

function ProspectsTable({ prospects, onSelect }: { prospects: ProspectData[]; onSelect: (p: ProspectData) => void }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "opportunity_score", dir: "desc" });

  const sorted = useMemo(() => {
    const arr = [...prospects];
    const dir = sort.dir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      let va: any, vb: any;
      if (sort.key === "name") { va = a.name; vb = b.name; }
      else if (sort.key === "rating") { va = a.reviews.rating.value; vb = b.reviews.rating.value; }
      else { va = a.opportunity_score.score; vb = b.opportunity_score.score; }
      if (typeof va === "string") return va.localeCompare(vb) * dir;
      return ((va ?? 0) - (vb ?? 0)) * dir;
    });
    return arr;
  }, [prospects, sort]);

  const toggleSort = (key: SortKey) => setSort(s => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" });

  const thStyle: React.CSSProperties = {
    padding: "14px 16px", fontSize: 10.5, fontWeight: 600, color: C.text3,
    letterSpacing: "0.07em", textTransform: "uppercase",
    borderBottom: `1px solid ${C.border}`,
    background: "rgba(255,255,255,0.02)", cursor: "pointer", userSelect: "none",
    whiteSpace: "nowrap", position: "sticky" as const, top: 0, zIndex: 1,
  };

  const SortHead = ({ k, children, align }: { k: SortKey; children: React.ReactNode; align?: string }) => (
    <th style={{ ...thStyle, textAlign: (align || "left") as any }} onClick={() => toggleSort(k)}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
        {children}
        {sort.key === k && (sort.dir === "asc" ? <IconArrowUp size={11}/> : <IconArrowDn size={11}/>)}
      </span>
    </th>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 17, marginBottom: 4 }}>Tabla maestra</div>
          <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 20, color: C.text }}>
            Todos los prospectos · {prospects.length}
          </div>
        </div>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ overflowX: "auto", maxHeight: 560 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, cursor: "default", width: 40 }}>#</th>
                <SortHead k="name">Negocio</SortHead>
                <th style={{ ...thStyle, cursor: "default" }}>Categoría</th>
                <th style={{ ...thStyle, cursor: "default" }}>Ubicación</th>
                <SortHead k="rating" align="center">Rating</SortHead>
                <th style={{ ...thStyle, cursor: "default", textAlign: "center" }}>Web</th>
                <th style={{ ...thStyle, cursor: "default", textAlign: "center" }}>Reclamado</th>
                <SortHead k="opportunity_score" align="center">Score</SortHead>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, i) => {
                const t = opportunityTier(p.opportunity_score.score);
                return (
                  <tr key={`${p.name}-${i}`}
                    onClick={() => onSelect(p)}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; (e.currentTarget as HTMLElement).style.cursor = "pointer"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                    <td style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, fontFamily: "monospace", fontSize: 11, color: C.text4 }}>
                      {i + 1}
                    </td>
                    <td style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar name={p.name} size={32}/>
                        <span style={{ fontSize: 13.5, color: C.text, fontWeight: 600 }}>{p.name || "—"}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: 12, color: C.text2 }}>{p.category.primary || "—"}</span>
                    </td>
                    <td style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: 12, color: C.text3 }}>{p.location.city || "—"}</span>
                    </td>
                    <td style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, textAlign: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 2 }}>
                        <Stars value={p.reviews.rating.value} size={11}/>
                        <span style={{ fontFamily: "monospace", fontSize: 10.5, color: C.text3 }}>
                          {p.reviews.rating.value?.toFixed(1) ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, textAlign: "center" }}>
                      {p.contact.website_url ? (
                        <span style={{ color: G, fontSize: 11, fontWeight: 600 }}>✓</span>
                      ) : (
                        <span style={{ color: RD, fontSize: 11, fontWeight: 600 }}>✗</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, textAlign: "center" }}>
                      {p.status.is_claimed ? (
                        <span style={{ color: G, fontSize: 11, fontWeight: 600 }}>✓</span>
                      ) : (
                        <span style={{ color: RD, fontSize: 11, fontWeight: 600 }}>✗</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, textAlign: "center" }}>
                      <ScoreBadge score={p.opportunity_score.score}/>
                    </td>
                  </tr>
                );
              })}
              {sorted.length === 0 && (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: C.text3 }}>Sin prospectos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function DiscoverProspectsSection({ data }: { data: DiscoverProspectsData }) {
  const [selected, setSelected] = useState<ProspectData | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        <KpiCard
          icon={<IconSearch size={17}/>}
          label="Prospectos encontrados"
          value={data.items_count}
          sub={`de ${data.total_count.toLocaleString("es-CO")} en la zona`}
        />
        <KpiCard
          icon={<IconShield size={17}/>}
          label="No reclamados"
          value={data.unclaimed_count}
          sub={<span><strong style={{ color: RD, fontFamily: "monospace" }}>{data.unclaimed_pct.toFixed(0)}%</strong> del total · oportunidad</span>}
          accent accentColor={RD}
        />
        <KpiCard
          icon={<IconGlobe size={17}/>}
          label="Sin sitio web"
          value={data.no_website_count}
          sub={<span><strong style={{ color: AM, fontFamily: "monospace" }}>{data.no_website_pct.toFixed(0)}%</strong> del total</span>}
          accent accentColor={AM}
        />
        <KpiCard
          icon={<IconFire size={17}/>}
          label="Alta oportunidad"
          value={data.high_opportunity_count}
          sub={<span style={{ display: "inline-flex", gap: 6 }}>Score ≥ 60</span>}
          accent accentColor={G}
        />
      </div>

      {/* ── Top list + status donut */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, alignItems: "start" }}>
        <TopOpportunityList prospects={data.high_opportunity} onSelect={setSelected}/>
        <StatusDonut dist={data.operating_status_distribution}/>
      </div>

      {/* ── Categories treemap */}
      {data.top_categories?.length > 0 && <CategoriesTreemap categories={data.top_categories}/>}

      {/* ── Full table */}
      <ProspectsTable prospects={data.prospects} onSelect={setSelected}/>

      {/* ── Detail panel */}
      {selected && <ProspectPanel prospect={selected} onClose={() => setSelected(null)}/>}
    </div>
  );
}
