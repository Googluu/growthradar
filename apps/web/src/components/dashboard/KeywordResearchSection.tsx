"use client";

import { useState, useRef, useEffect } from "react";
import type { LabsData, LabsKeyword } from "@/types/dashboard";

const G  = "#5DB848";
const AM = "#f59e0b";
const RD = "#ef4444";
const BL = "#60a5fa";
const PU = "#a78bfa";

const C = {
  card: "rgba(255,255,255,0.025)",
  border: "rgba(255,255,255,0.07)",
  borderStrong: "rgba(255,255,255,0.14)",
  text: "#fff",
  text2: "rgba(255,255,255,0.65)",
  text3: "rgba(255,255,255,0.42)",
  text4: "rgba(255,255,255,0.28)",
  bg: "#0a0a0a",
};

const fmtCompact = (n: number | null | undefined): string => {
  if (n == null) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1) + "K";
  return String(n);
};
const fmtUsd = (n: number): string => "$" + n.toLocaleString("en-US", { maximumFractionDigits: 2 });

function diffColor(d: number) {
  if (d <= 30) return G;
  if (d <= 50) return AM;
  if (d <= 70) return "#f97316";
  return RD;
}

const INTENT_META: Record<string, { label: string; color: string }> = {
  informational: { label: "Informacional", color: BL },
  navigational:  { label: "Navegacional",  color: PU },
  commercial:    { label: "Comercial",     color: G },
  transactional: { label: "Transaccional", color: AM },
};

function Card({ children, style, accent }: { children: React.ReactNode; style?: React.CSSProperties; accent?: boolean }) {
  return (
    <div style={{
      background: accent ? `linear-gradient(180deg, rgba(93,184,72,0.06), ${C.card})` : C.card,
      border: `1px solid ${accent ? "rgba(93,184,72,0.35)" : C.border}`,
      borderRadius: 16, ...style,
    }}>{children}</div>
  );
}

function SectionTitle({ kicker, title, sub, right }: { kicker?: string; title: string; sub?: string; right?: React.ReactNode }) {
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

function KpiGrid({ data }: { data: LabsData }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
      {[
        {
          label: "Volumen Total",
          value: fmtCompact(data.total_search_volume),
          sub: `búsquedas / mes · ${data.items_count} keywords`,
          accent: false,
          icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
        },
        {
          label: "CPC Promedio",
          value: fmtUsd(data.avg_cpc),
          sub: "costo por clic en Google Ads",
          accent: false,
          icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
        },
        {
          label: "Dificultad Promedio",
          value: `${data.avg_difficulty}`,
          sub: data.avg_difficulty < 30 ? "fácil" : data.avg_difficulty < 50 ? "moderada" : data.avg_difficulty < 70 ? "difícil" : "muy difícil",
          accent: false,
          icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M12 14l4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>,
        },
        {
          label: "Valor de Tráfico",
          value: fmtUsd(data.estimated_traffic_value_usd),
          sub: "estimación mensual en USD",
          accent: true,
          icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 16l4-6 4 3 5-8"/></svg>,
        },
      ].map(kpi => (
        <Card key={kpi.label} style={{ padding: "20px 22px" }} accent={kpi.accent}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: kpi.accent ? "rgba(93,184,72,0.12)" : "rgba(255,255,255,0.06)",
              color: kpi.accent ? G : C.text2,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: `1px solid ${kpi.accent ? "rgba(93,184,72,0.35)" : C.border}`,
            }}>{kpi.icon}</div>
            <div style={{ fontSize: 10.5, color: C.text3, letterSpacing: "0.07em", textTransform: "uppercase" as const, fontWeight: 600, textAlign: "right" as const }}>{kpi.label}</div>
          </div>
          <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 800, fontSize: 34, lineHeight: 1, color: kpi.accent ? G : C.text, letterSpacing: "-0.02em" }}>{kpi.value}</div>
          <div style={{ fontSize: 12, color: C.text3, marginTop: 6 }}>{kpi.sub}</div>
        </Card>
      ))}
    </div>
  );
}

function MonthlyChart({ data }: { data: LabsData }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  const [hover, setHover] = useState<number | null>(null);
  const h = 220;

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(() => {
      if (wrapRef.current) setWidth(wrapRef.current.getBoundingClientRect().width || 800);
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const pts = data.monthly_aggregated;
  if (!pts || pts.length === 0) return null;
  const pad = { l: 48, r: 12, t: 16, b: 32 };
  const iw = width - pad.l - pad.r;
  const ih = h - pad.t - pad.b;
  const max = Math.max(...pts.map(p => p.search_volume)) * 1.15 || 1;
  const xAt = (i: number) => pad.l + (i / Math.max(pts.length - 1, 1)) * iw;
  const yAt = (v: number) => pad.t + ih - (v / max) * ih;
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(p.search_volume).toFixed(1)}`).join(" ");
  const area = `${line} L ${xAt(pts.length - 1)} ${pad.t + ih} L ${xAt(0)} ${pad.t + ih} Z`;

  return (
    <Card style={{ padding: 24 }}>
      <SectionTitle
        kicker="Tendencia"
        title="Volumen mensual"
        sub="Suma de todas las keywords · últimos 12 meses"
        right={
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: "rgba(93,184,72,0.12)", color: G, border: "1px solid rgba(93,184,72,0.35)",
            fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 999,
          }}>
            {fmtCompact(data.total_search_volume)} / mes
          </span>
        }
      />
      <div ref={wrapRef} style={{ width: "100%", position: "relative" }}>
        <svg width={width} height={h} style={{ display: "block", cursor: "crosshair" }}
          onMouseMove={e => {
            const r = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - r.left;
            const i = Math.round(((x - pad.l) / iw) * (pts.length - 1));
            setHover(i >= 0 && i < pts.length ? i : null);
          }}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="kg-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={G} stopOpacity="0.35" />
              <stop offset="100%" stopColor={G} stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
            <g key={i}>
              <line x1={pad.l} x2={width - pad.r} y1={yAt(max * t)} y2={yAt(max * t)} stroke="rgba(255,255,255,0.05)" strokeDasharray="2 4" />
              <text x={pad.l - 6} y={yAt(max * t) + 4} textAnchor="end" fontSize={10} fontFamily="monospace" fill={C.text3}>{fmtCompact(max * t)}</text>
            </g>
          ))}
          <path d={area} fill="url(#kg-area)" />
          <path d={line} fill="none" stroke={G} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${G}66)` }} />
          {pts.map((p, i) => (
            <circle key={i} cx={xAt(i)} cy={yAt(p.search_volume)} r={hover === i ? 5 : 3} fill={C.bg} stroke={G} strokeWidth={2} />
          ))}
          {pts.map((p, i) => (
            <text key={i} x={xAt(i)} y={h - pad.b + 16} textAnchor="middle" fontSize={10} fontFamily="Inter, sans-serif" fill={C.text3}>
              {new Date(p.year_month + "-01").toLocaleString("es-CO", { month: "short" })}
            </text>
          ))}
          {hover != null && <line x1={xAt(hover)} x2={xAt(hover)} y1={pad.t} y2={pad.t + ih} stroke={G} strokeOpacity="0.4" strokeDasharray="3 3" />}
        </svg>
        {hover != null && (
          <div style={{
            position: "absolute",
            left: Math.min(width - 160, Math.max(8, xAt(hover) + 12)),
            top: yAt(pts[hover].search_volume) - 60,
            background: "rgba(20,20,20,0.95)", border: `1px solid ${C.borderStrong}`,
            backdropFilter: "blur(8px)", borderRadius: 10, padding: "8px 12px",
            pointerEvents: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}>
            <div style={{ fontSize: 11, color: C.text3, marginBottom: 2 }}>
              {new Date(pts[hover].year_month + "-01").toLocaleString("es-CO", { month: "long", year: "numeric" })}
            </div>
            <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 18, color: G }}>
              {pts[hover].search_volume.toLocaleString("es-CO")}
            </div>
            <div style={{ fontSize: 10.5, color: C.text3 }}>búsquedas</div>
          </div>
        )}
      </div>
    </Card>
  );
}

function IntentChart({ dist }: { dist: Record<string, number> }) {
  const entries = Object.entries(dist).map(([k, v]) => ({ key: k, value: v, ...(INTENT_META[k] || { label: k, color: C.text3 }) }));
  const total = entries.reduce((s, e) => s + e.value, 0);
  const [hover, setHover] = useState<number | null>(null);
  const size = 160, cx = 80, cy = 80, r = 65, innerR = 42;
  let angle = -Math.PI / 2;

  const arcs = entries.map(e => {
    const a0 = angle;
    const a1 = angle + (e.value / total) * Math.PI * 2;
    angle = a1;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const x0 = cx + Math.cos(a0) * r, y0 = cy + Math.sin(a0) * r;
    const x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r;
    const xi0 = cx + Math.cos(a0) * innerR, yi0 = cy + Math.sin(a0) * innerR;
    const xi1 = cx + Math.cos(a1) * innerR, yi1 = cy + Math.sin(a1) * innerR;
    return { ...e, d: `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} L ${xi1} ${yi1} A ${innerR} ${innerR} 0 ${large} 0 ${xi0} ${yi0} Z`, a0, a1 };
  });

  return (
    <Card style={{ padding: 24, height: "100%" }}>
      <SectionTitle title="Intent de búsqueda" sub="Qué quiere el usuario" />
      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {arcs.map((a, i) => (
              <path key={i} d={a.d} fill={a.color}
                fillOpacity={hover == null || hover === i ? 1 : 0.3}
                stroke={C.bg} strokeWidth={2}
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
                style={{ cursor: "pointer", transition: "fill-opacity 0.15s" }} />
            ))}
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{ fontSize: 11, color: C.text3 }}>{hover != null ? arcs[hover].label : "Total"}</div>
            <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 800, fontSize: 26, color: C.text }}>{hover != null ? arcs[hover].value : total}</div>
            <div style={{ fontSize: 10, color: C.text3 }}>keywords</div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 150, display: "flex", flexDirection: "column", gap: 6 }}>
          {entries.map((e, i) => (
            <div key={e.key}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", borderRadius: 7, background: hover === i ? "rgba(255,255,255,0.04)" : "transparent", cursor: "default" }}
            >
              <span style={{ width: 8, height: 8, borderRadius: 2, background: e.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 12, color: C.text2 }}>{e.label}</span>
              <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12, color: C.text, fontWeight: 600 }}>{e.value}</span>
              <span style={{ fontSize: 10.5, color: C.text3, minWidth: 28, textAlign: "right" as const }}>{((e.value / total) * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function DifficultyChart({ buckets }: { buckets: LabsData["difficulty_buckets"] }) {
  const items = [
    { key: "easy",      label: "Fácil",     color: G,       value: buckets.easy },
    { key: "medium",    label: "Media",     color: AM,      value: buckets.medium },
    { key: "hard",      label: "Difícil",   color: "#f97316", value: buckets.hard },
    { key: "very_hard", label: "Muy difícil", color: RD,    value: buckets.very_hard },
  ];
  const total = items.reduce((s, i) => s + i.value, 0);

  return (
    <Card style={{ padding: 24, height: "100%" }}>
      <SectionTitle title="Dificultad" sub="Distribución de dificultad SEO" />
      <div style={{ display: "flex", height: 28, borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
        {items.filter(i => i.value > 0).map(item => (
          <div key={item.key} style={{
            width: `${(item.value / total) * 100}%`, background: item.color,
            transition: "width 0.8s cubic-bezier(0.2,0.9,0.3,1)",
          }} />
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map(item => (
          <div key={item.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: item.color, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 13, color: C.text2 }}>{item.label}</span>
            <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 13, color: C.text, fontWeight: 600 }}>{item.value}</span>
            <span style={{ fontSize: 11, color: C.text3, minWidth: 32, textAlign: "right" as const }}>{total ? ((item.value / total) * 100).toFixed(0) : 0}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function KeywordsTable({ keywords, title, sub }: { keywords: LabsKeyword[]; title: string; sub?: string }) {
  const [query, setQuery] = useState("");
  const filtered = keywords.filter(k => !query || k.keyword?.toLowerCase().includes(query.toLowerCase()));

  return (
    <Card style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 22, color: C.text, letterSpacing: "-0.015em" }}>{title}</h2>
          {sub && <p style={{ fontSize: 13, color: C.text3, marginTop: 4 }}>{sub}</p>}
        </div>
        <input
          value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Filtrar keywords…"
          style={{
            padding: "8px 14px", background: "rgba(255,255,255,0.04)",
            border: `1px solid ${C.border}`, borderRadius: 8, color: C.text,
            fontFamily: "var(--font-inter), sans-serif", fontSize: 13, outline: "none",
          }}
        />
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Keyword", "Volumen", "KD", "CPC", "Intent", "Competencia"].map(h => (
                <th key={h} style={{ textAlign: "left" as const, padding: "10px 12px", fontSize: 11, fontWeight: 600, color: C.text3, letterSpacing: "0.06em", textTransform: "uppercase" as const, borderBottom: `1px solid ${C.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 30).map((kw, i) => {
              const intentMeta = kw.main_intent ? (INTENT_META[kw.main_intent] || { label: kw.main_intent, color: C.text3 }) : null;
              const kd = kw.keyword_difficulty;
              return (
                <tr key={i} style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                  <td style={{ padding: "10px 12px", fontSize: 13, color: C.text, fontWeight: 500 }}>{kw.keyword}</td>
                  <td style={{ padding: "10px 12px", fontSize: 13, color: C.text2, fontFamily: "var(--font-mono), monospace" }}>{fmtCompact(kw.search_volume)}</td>
                  <td style={{ padding: "10px 12px" }}>
                    {kd != null ? (
                      <span style={{ fontSize: 12, fontWeight: 600, color: diffColor(kd), fontFamily: "var(--font-mono), monospace" }}>{kd}</span>
                    ) : <span style={{ fontSize: 12, color: C.text4 }}>—</span>}
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 12, color: C.text2, fontFamily: "var(--font-mono), monospace" }}>{kw.cpc != null ? fmtUsd(kw.cpc) : "—"}</td>
                  <td style={{ padding: "10px 12px" }}>
                    {intentMeta ? (
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: `${intentMeta.color}18`, color: intentMeta.color, border: `1px solid ${intentMeta.color}40` }}>{intentMeta.label}</span>
                    ) : <span style={{ fontSize: 11, color: C.text4 }}>—</span>}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {kw.competition_level ? (
                      <span style={{ fontSize: 12, color: kw.competition_level === "LOW" ? G : kw.competition_level === "MEDIUM" ? AM : RD }}>{kw.competition_level}</span>
                    ) : <span style={{ fontSize: 12, color: C.text4 }}>—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ padding: "24px", textAlign: "center" as const, color: C.text3, fontSize: 14 }}>Sin resultados para "{query}"</div>}
      </div>
    </Card>
  );
}

export function KeywordResearchSection({ data }: { data: LabsData }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 18, marginBottom: 4 }}>Investigación de mercado</div>
        <h1 style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 800, fontSize: 28, color: C.text, letterSpacing: "-0.02em" }}>
          Keywords relacionadas con "{data.seed_keyword}"
        </h1>
        <p style={{ fontSize: 13, color: C.text3, marginTop: 6 }}>
          {data.total_count?.toLocaleString() ?? data.items_count} keywords analizadas · Colombia · Español
        </p>
      </div>

      <KpiGrid data={data} />
      <MonthlyChart data={data} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <IntentChart dist={data.intent_distribution} />
        <DifficultyChart buckets={data.difficulty_buckets} />
      </div>

      <KeywordsTable
        keywords={data.low_hanging_fruit}
        title="Fruta al alcance"
        sub="Keywords con bajo KD y buen volumen — las más fáciles de posicionar"
      />
      <KeywordsTable
        keywords={data.top_keywords_by_volume}
        title="Top por volumen"
        sub="Las keywords con mayor demanda de búsqueda"
      />
    </div>
  );
}
