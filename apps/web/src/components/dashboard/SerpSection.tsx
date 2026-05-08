"use client";

import { useState, useMemo } from "react";
import type {
  SerpData,
  SerpOrganic,
  SerpTargetVisibility,
  SerpAiOverview,
  SerpRankingDistribution,
} from "@/types/dashboard";

// ── EDA color tokens (dark dashboard) ────────────────────────────────────────
const G   = "#5DB848";
const Gs  = "rgba(93,184,72,0.12)";
const Gb  = "rgba(93,184,72,0.35)";

const C = {
  card:        "rgba(255,255,255,0.025)",
  cardHover:   "rgba(255,255,255,0.04)",
  border:      "rgba(255,255,255,0.07)",
  borderStrong:"rgba(255,255,255,0.14)",
  text:        "#fff",
  text2:       "rgba(255,255,255,0.65)",
  text3:       "rgba(255,255,255,0.45)",
  text4:       "rgba(255,255,255,0.3)",
  yellow:      "#fbbf24",
  blue:        "#60a5fa",
};

// ── Utilities ─────────────────────────────────────────────────────────────────
const fav = (domain: string) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

const fmtNum = (n: number) => n.toLocaleString("es-CO");

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

// ── Inline SVG icons ──────────────────────────────────────────────────────────
function Icon({ size = 16, children }: { size?: number; children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"
         strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {children}
    </svg>
  );
}

const IconTrendingUp = ({ size }: { size?: number }) => (
  <Icon size={size}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </Icon>
);
const IconLayers = ({ size }: { size?: number }) => (
  <Icon size={size}>
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </Icon>
);
const IconList = ({ size }: { size?: number }) => (
  <Icon size={size}>
    <line x1="8" y1="6" x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/>
    <line x1="3" y1="18" x2="3.01" y2="18"/>
  </Icon>
);
const IconTarget = ({ size }: { size?: number }) => (
  <Icon size={size}>
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </Icon>
);
const IconBrain = ({ size }: { size?: number }) => (
  <Icon size={size}>
    <path d="M12 2a4 4 0 0 0-4 4v0a4 4 0 0 0-2 7.5A4 4 0 0 0 8 21a4 4 0 0 0 4-2 4 4 0 0 0 4 2 4 4 0 0 0 2-7.5A4 4 0 0 0 16 6a4 4 0 0 0-4-4z"/>
    <path d="M12 6v15"/>
  </Icon>
);
const IconStar = ({ size, filled }: { size?: number; filled?: boolean }) => (
  <svg width={size ?? 16} height={size ?? 16} viewBox="0 0 24 24"
       fill={filled ? C.yellow : "none"} stroke={C.yellow} strokeWidth={1.6}
       strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconSearch = ({ size }: { size?: number }) => (
  <Icon size={size}>
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </Icon>
);
const IconExternal = ({ size }: { size?: number }) => (
  <Icon size={size}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </Icon>
);
const IconClock = ({ size }: { size?: number }) => (
  <Icon size={size}>
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </Icon>
);
const IconDollar = ({ size }: { size?: number }) => (
  <Icon size={size}>
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </Icon>
);
const IconCalendar = ({ size }: { size?: number }) => (
  <Icon size={size}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </Icon>
);
const IconChevronRight = ({ size }: { size?: number }) => (
  <Icon size={size}><polyline points="9 18 15 12 9 6"/></Icon>
);
const IconArrowDown = ({ size }: { size?: number }) => (
  <Icon size={size}>
    <line x1="12" y1="5" x2="12" y2="19"/>
    <polyline points="19 12 12 19 5 12"/>
  </Icon>
);
const IconArrowUp = ({ size }: { size?: number }) => (
  <Icon size={size}>
    <line x1="12" y1="19" x2="12" y2="5"/>
    <polyline points="5 12 12 5 19 12"/>
  </Icon>
);

// ── Building blocks ───────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      ...style,
    }}>
      {children}
    </div>
  );
}

type BadgeTone = "default" | "green" | "yellow" | "red" | "blue";
function Badge({ children, tone = "default", style }: {
  children: React.ReactNode;
  tone?: BadgeTone;
  style?: React.CSSProperties;
}) {
  const tones: Record<BadgeTone, { bg: string; fg: string; br: string }> = {
    default: { bg: "rgba(255,255,255,0.06)", fg: C.text2, br: "rgba(255,255,255,0.1)" },
    green:   { bg: Gs, fg: G, br: Gb },
    yellow:  { bg: "rgba(251,191,36,0.12)", fg: C.yellow, br: "rgba(251,191,36,0.3)" },
    red:     { bg: "rgba(239,68,68,0.12)", fg: "#ef4444", br: "rgba(239,68,68,0.3)" },
    blue:    { bg: "rgba(96,165,250,0.12)", fg: C.blue, br: "rgba(96,165,250,0.3)" },
  };
  const t = tones[tone];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: t.bg, color: t.fg,
      border: `1px solid ${t.br}`,
      fontSize: 11, fontWeight: 600,
      padding: "3px 9px", borderRadius: 999,
      letterSpacing: "0.01em",
      fontFamily: "var(--font-inter), sans-serif",
      ...style,
    }}>
      {children}
    </span>
  );
}

// ── KPI cards ─────────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, accent }: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <Card style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14, minHeight: 132 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: accent ? Gs : "rgba(255,255,255,0.06)",
          color: accent ? G : C.text2,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: `1px solid ${accent ? Gb : C.border}`,
        }}>
          {icon}
        </div>
        <div style={{
          fontFamily: "var(--font-inter), sans-serif", fontSize: 11,
          color: C.text3, letterSpacing: "0.06em",
          textTransform: "uppercase", fontWeight: 600, textAlign: "right",
        }}>
          {label}
        </div>
      </div>
      <div style={{ marginTop: "auto" }}>
        <div style={{
          fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
          fontSize: 36, lineHeight: 1,
          color: accent ? G : C.text,
          letterSpacing: "-0.02em",
        }}>
          {value}
        </div>
        {sub && (
          <div style={{ fontSize: 12, color: C.text3, marginTop: 6, fontFamily: "var(--font-inter), sans-serif" }}>
            {sub}
          </div>
        )}
      </div>
    </Card>
  );
}

function KpiRow({ data }: { data: SerpData }) {
  const tv = data.target_visibility;

  const targetCard = (() => {
    if (!tv) return null;
    if (!tv.found) {
      return (
        <KpiCard
          icon={<IconTarget size={18} />}
          label="Tu posición"
          value={<span style={{ fontSize: 20, fontFamily: "var(--font-syne)", fontWeight: 700 }}>No ranqueas</span>}
          sub={tv.domain}
        />
      );
    }
    const sub = tv.in_top_3
      ? "En el top 3 — excelente"
      : tv.in_top_10
      ? "En la primera página"
      : "Fuera del top 10";
    return (
      <KpiCard
        icon={<IconTarget size={18} />}
        label="Tu posición"
        value={`#${tv.position}`}
        sub={sub}
        accent
      />
    );
  })();

  return (
    <div className="serp-kpi-grid">
      <KpiCard
        icon={<IconTrendingUp size={18} />}
        label="Posición promedio"
        value={data.average_position?.toFixed(1) ?? "—"}
        sub="entre los resultados orgánicos"
      />
      <KpiCard
        icon={<IconLayers size={18} />}
        label="Funciones SERP"
        value={data.serp_features_count}
        sub={data.serp_features.slice(0, 2).map(f => f.replace(/_/g, " ")).join(" · ")}
      />
      <KpiCard
        icon={<IconList size={18} />}
        label="Resultados orgánicos"
        value={data.organic_results_count}
        sub={`${fmtNum(data.total_results_google)} resultados en Google`}
      />
      {targetCard}
    </div>
  );
}

// ── Ranking distribution ──────────────────────────────────────────────────────
function RankingDistribution({ dist, total }: {
  dist: SerpRankingDistribution;
  total: number;
}) {
  const rows = [
    { label: "Top 3",   value: dist.top_3,   color: G },
    { label: "Top 10",  value: dist.top_10,  color: "#4ade80" },
    { label: "Top 20",  value: dist.top_20,  color: "#86efac" },
    { label: "Top 100", value: dist.top_100, color: "rgba(255,255,255,0.25)" },
  ];
  const max = Math.max(...rows.map(r => r.value), 1);

  return (
    <Card style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={{
            fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 17,
            color: C.text, letterSpacing: "-0.01em", marginBottom: 4,
          }}>
            Distribución de ranking
          </h3>
          <p style={{ fontSize: 12, color: C.text3 }}>
            Cuántos resultados aparecen en cada rango
          </p>
        </div>
        <Badge>{total} resultados</Badge>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {rows.map((r, i) => {
          const pct = (r.value / max) * 100;
          return (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 1fr 32px", gap: 12, alignItems: "center" }}>
              <div style={{
                fontSize: 12, color: C.text2, fontWeight: 500,
                fontFamily: "var(--font-mono), monospace",
              }}>
                {r.label}
              </div>
              <div style={{
                background: "rgba(255,255,255,0.04)", borderRadius: 6, height: 28,
                overflow: "hidden", position: "relative",
                border: "1px solid rgba(255,255,255,0.05)",
              }}>
                <div style={{
                  width: `${pct}%`, height: "100%",
                  background: `linear-gradient(90deg, ${r.color}cc, ${r.color})`,
                  borderRadius: 5,
                  boxShadow: r.color === G ? `0 0 24px ${r.color}40` : "none",
                }} />
              </div>
              <div style={{
                fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 16,
                color: C.text, textAlign: "right",
                fontVariantNumeric: "tabular-nums",
              }}>
                {r.value}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ── Top 10 domains ────────────────────────────────────────────────────────────
function TopDomains({ domains, target, top3 }: {
  domains: string[];
  target: SerpTargetVisibility | null;
  top3: string[];
}) {
  return (
    <Card style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h3 style={{
          fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 17,
          color: C.text, letterSpacing: "-0.01em", marginBottom: 4,
        }}>
          Top 10 dominios
        </h3>
        <p style={{ fontSize: 12, color: C.text3 }}>
          Quiénes ocupan las primeras posiciones para esta keyword
        </p>
      </div>

      <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6, padding: 0, margin: 0 }}>
        {domains.map((d, i) => {
          const isTarget = target?.found && d === target.domain;
          const isTop3 = top3.includes(d);
          return (
            <li key={d} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "8px 12px", borderRadius: 8,
              background: isTarget ? Gs : "transparent",
              border: `1px solid ${isTarget ? Gb : "transparent"}`,
              transition: "background 0.15s",
            }}>
              <div style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 11, fontWeight: 600,
                width: 22, textAlign: "right",
                color: isTop3 ? G : C.text3,
                fontVariantNumeric: "tabular-nums",
              }}>
                {String(i + 1).padStart(2, "0")}
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={fav(d)} alt="" width={16} height={16} style={{ borderRadius: 3, flexShrink: 0 }} />
              <span style={{
                fontSize: 13, color: isTarget ? G : C.text,
                fontWeight: isTarget ? 600 : 500,
                fontFamily: "var(--font-inter), sans-serif",
                flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {d}
              </span>
              {isTarget && <Badge tone="green" style={{ fontSize: 10, padding: "2px 7px" }}>Tú</Badge>}
              {isTop3 && !isTarget && <Badge style={{ fontSize: 10, padding: "2px 7px" }}>Top 3</Badge>}
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

// ── AI Overview ───────────────────────────────────────────────────────────────
function renderMarkdown(md: string): React.ReactNode {
  const paragraphs = md.split(/\n\n+/);
  return paragraphs.map((p, i) => {
    const parts = p.split(/(\*\*[^*]+\*\*)/g).map((seg, j) => {
      if (seg.startsWith("**") && seg.endsWith("**")) {
        return <strong key={j} style={{ color: C.text, fontWeight: 600 }}>{seg.slice(2, -2)}</strong>;
      }
      return <span key={j}>{seg}</span>;
    });
    return (
      <p key={i} style={{ marginBottom: i < paragraphs.length - 1 ? 12 : 0 }}>
        {parts}
      </p>
    );
  });
}

function AIOverview({ ai }: { ai: SerpAiOverview }) {
  return (
    <Card style={{
      padding: 28,
      background: `linear-gradient(180deg, rgba(93,184,72,0.04), ${C.card})`,
      border: `1px solid ${Gb}`,
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: -100, right: -100,
        width: 300, height: 300,
        background: `radial-gradient(circle, ${Gs}, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <div style={{ display: "flex", gap: 16, marginBottom: 18, alignItems: "flex-start", position: "relative" }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: Gs, color: G,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: `1px solid ${Gb}`, flexShrink: 0,
        }}>
          <IconBrain size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h3 style={{
              fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 18,
              color: C.text, letterSpacing: "-0.01em",
            }}>
              AI Overview de Google
            </h3>
            <Badge tone="green">Detectado</Badge>
          </div>
          <p style={{ fontSize: 12, color: C.text3 }}>
            Respuesta generada por IA que aparece arriba de los resultados orgánicos
          </p>
        </div>
      </div>

      <div style={{
        fontSize: 14.5, lineHeight: 1.7, color: C.text2,
        fontFamily: "var(--font-inter), sans-serif", position: "relative",
        paddingLeft: 16, borderLeft: `2px solid ${Gb}`,
      }}>
        {renderMarkdown(ai.markdown)}
      </div>

      {ai.references.length > 0 && (
        <div style={{ marginTop: 22, position: "relative" }}>
          <div style={{
            fontSize: 11, color: C.text3, fontWeight: 600,
            letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10,
            fontFamily: "var(--font-inter), sans-serif",
          }}>
            Fuentes citadas · {ai.references_count}
          </div>
          <div className="chip-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {ai.references.map((r, i) => (
              <a key={i} href={r.url} target="_blank" rel="noreferrer" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "8px 12px",
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${C.border}`,
                borderRadius: 999, textDecoration: "none",
                flexShrink: 0, transition: "all 0.15s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = C.borderStrong;
                e.currentTarget.style.background = C.cardHover;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={fav(r.domain)} alt="" width={14} height={14} style={{ borderRadius: 2 }} />
                <span style={{ fontSize: 12, color: C.text2, fontWeight: 500, whiteSpace: "nowrap", fontFamily: "var(--font-inter), sans-serif" }}>
                  {r.source}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

// ── Organic results table ─────────────────────────────────────────────────────
type SortKey = "rank_absolute" | "domain" | "title" | "sitelinks";

function highlightText(text: string, terms: string[]): React.ReactNode {
  if (!terms.length) return text;
  const escaped = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(re);
  return parts.map((p, i) =>
    re.test(p) ? <mark key={i}>{p}</mark> : <span key={i}>{p}</span>
  );
}

function ResultsTable({ rows, target }: {
  rows: SerpOrganic[];
  target: SerpTargetVisibility | null;
}) {
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "rank_absolute", dir: "asc" });
  const [expanded, setExpanded] = useState<number | null>(null);

  const sorted = useMemo(() => {
    const arr = [...rows];
    arr.sort((a, b) => {
      if (sort.key === "sitelinks") {
        const va = a.sitelinks.length, vb = b.sitelinks.length;
        return sort.dir === "asc" ? va - vb : vb - va;
      }
      if (sort.key === "domain" || sort.key === "title") {
        return sort.dir === "asc"
          ? String(a[sort.key]).localeCompare(String(b[sort.key]))
          : String(b[sort.key]).localeCompare(String(a[sort.key]));
      }
      const va = a[sort.key] as number, vb = b[sort.key] as number;
      return sort.dir === "asc" ? va - vb : vb - va;
    });
    return arr;
  }, [rows, sort]);

  const toggleSort = (key: SortKey) => {
    setSort(s => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });
  };

  function SortHead({ k, children, w, align }: { k: SortKey; children: React.ReactNode; w?: number | string; align?: string }) {
    return (
      <th style={{
        textAlign: (align ?? "left") as React.CSSProperties["textAlign"],
        width: w, padding: "14px 16px", fontSize: 11,
        fontWeight: 600, color: C.text3,
        letterSpacing: "0.06em", textTransform: "uppercase",
        borderBottom: `1px solid ${C.border}`,
        cursor: "pointer", userSelect: "none", whiteSpace: "nowrap",
        fontFamily: "var(--font-inter), sans-serif",
      }} onClick={() => toggleSort(k)}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          {children}
          {sort.key === k && (sort.dir === "asc" ? <IconArrowUp size={11} /> : <IconArrowDown size={11} />)}
        </span>
      </th>
    );
  }

  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div style={{
        padding: "20px 24px", borderBottom: `1px solid ${C.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <h3 style={{
            fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 17,
            color: C.text, letterSpacing: "-0.01em",
          }}>
            Resultados orgánicos
          </h3>
          <p style={{ fontSize: 12, color: C.text3, marginTop: 4 }}>
            {rows.length} resultados — clic en una fila para ver detalles
          </p>
        </div>
        {target?.found && (
          <Badge tone="green">Tu sitio aparece en posición #{target.position}</Badge>
        )}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="serp-results-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <SortHead k="rank_absolute" w={70} align="center">#</SortHead>
              <SortHead k="domain" w={200}>Dominio</SortHead>
              <SortHead k="title">Título y descripción</SortHead>
              <SortHead k="sitelinks" w={90} align="center">Sitelinks</SortHead>
            </tr>
          </thead>
          <tbody>
            {sorted.map(r => {
              const isTarget = target?.found && r.domain === target.domain;
              const isExp = expanded === r.rank_absolute;
              return (
                <>
                  <tr key={r.rank_absolute} style={{
                    background: isTarget ? "rgba(93,184,72,0.05)" : "transparent",
                    borderLeft: isTarget ? `2px solid ${G}` : "2px solid transparent",
                    cursor: "pointer", transition: "background 0.15s",
                  }}
                  onClick={() => setExpanded(isExp ? null : r.rank_absolute)}
                  onMouseEnter={e => { if (!isTarget) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                  onMouseLeave={e => { if (!isTarget) e.currentTarget.style.background = "transparent"; }}>

                    {/* Rank */}
                    <td style={{ padding: 16, borderBottom: `1px solid ${C.border}`, textAlign: "center", verticalAlign: "top" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <div style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          minWidth: 32, height: 28, padding: "0 8px", borderRadius: 8,
                          background: r.rank_absolute <= 3 ? Gs : "rgba(255,255,255,0.06)",
                          border: `1px solid ${r.rank_absolute <= 3 ? Gb : C.border}`,
                          fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 13,
                          color: r.rank_absolute <= 3 ? G : C.text2,
                        }}>
                          {r.rank_absolute}
                        </div>
                        {r.is_featured_snippet && (
                          <span title="Featured snippet"><IconStar size={14} filled /></span>
                        )}
                      </div>
                    </td>

                    {/* Domain */}
                    <td style={{ padding: 16, borderBottom: `1px solid ${C.border}`, verticalAlign: "top" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={fav(r.domain)} alt="" width={20} height={20} style={{ borderRadius: 4, flexShrink: 0 }} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            fontSize: 13, fontWeight: 600,
                            color: isTarget ? G : C.text,
                            fontFamily: "var(--font-inter), sans-serif",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {r.domain}
                          </div>
                          {isTarget && (
                            <div style={{
                              fontSize: 10, color: G, fontWeight: 600,
                              letterSpacing: "0.04em", textTransform: "uppercase", marginTop: 2,
                              fontFamily: "var(--font-inter), sans-serif",
                            }}>
                              Tu sitio
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Title + description */}
                    <td style={{ padding: 16, borderBottom: `1px solid ${C.border}`, verticalAlign: "top" }}>
                      <a href={r.url} target="_blank" rel="noreferrer"
                         onClick={e => e.stopPropagation()}
                         style={{
                           display: "block", fontSize: 14, fontWeight: 500,
                           color: isTarget ? G : "#a3c3ff",
                           textDecoration: "none", marginBottom: 4,
                           fontFamily: "var(--font-inter), sans-serif",
                           overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                         }}
                         onMouseEnter={e => { e.currentTarget.style.textDecoration = "underline"; }}
                         onMouseLeave={e => { e.currentTarget.style.textDecoration = "none"; }}>
                        {r.title}
                      </a>
                      {r.breadcrumb && (
                        <div style={{
                          fontSize: 11, color: C.text3, marginBottom: 6,
                          fontFamily: "var(--font-mono), monospace",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {r.breadcrumb}
                        </div>
                      )}
                      <div style={{
                        fontSize: 13, lineHeight: 1.5, color: C.text2,
                        display: "-webkit-box",
                        WebkitLineClamp: isExp ? 99 : 2,
                        WebkitBoxOrient: "vertical" as const,
                        overflow: "hidden",
                      }}>
                        {r.description ? highlightText(r.description, r.highlighted) : null}
                      </div>
                    </td>

                    {/* Sitelinks count */}
                    <td style={{ padding: 16, borderBottom: `1px solid ${C.border}`, textAlign: "center", verticalAlign: "top" }}>
                      {r.sitelinks.length > 0
                        ? <Badge tone="blue">{r.sitelinks.length}</Badge>
                        : <span style={{ color: C.text4, fontSize: 12 }}>—</span>}
                    </td>
                  </tr>

                  {/* Expanded sitelinks */}
                  {isExp && r.sitelinks.length > 0 && (
                    <tr key={`${r.rank_absolute}-exp`} style={{ background: "rgba(255,255,255,0.015)" }}>
                      <td colSpan={4} style={{ padding: "16px 24px 20px 64px", borderBottom: `1px solid ${C.border}` }}>
                        <div style={{
                          fontSize: 11, color: C.text3, fontWeight: 600,
                          letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10,
                          fontFamily: "var(--font-inter), sans-serif",
                        }}>
                          Sitelinks
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                          {r.sitelinks.map((sl, j) => (
                            <a key={j} href={sl.url} target="_blank" rel="noreferrer" style={{
                              padding: "10px 12px", borderRadius: 8,
                              background: "rgba(255,255,255,0.03)",
                              border: `1px solid ${C.border}`,
                              textDecoration: "none", display: "block",
                            }}>
                              <div style={{ fontSize: 13, color: "#a3c3ff", fontWeight: 500, marginBottom: 2, fontFamily: "var(--font-inter), sans-serif" }}>
                                {sl.title}
                              </div>
                              {sl.description && (
                                <div style={{ fontSize: 11, color: C.text3, fontFamily: "var(--font-inter), sans-serif" }}>
                                  {sl.description}
                                </div>
                              )}
                            </a>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ── Related searches sidebar ──────────────────────────────────────────────────
function RelatedSearches({ items, onSearchAgain }: {
  items: string[];
  onSearchAgain: (q: string) => void;
}) {
  return (
    <Card style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <h3 style={{
          fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 16,
          color: C.text, letterSpacing: "-0.01em",
        }}>
          Búsquedas relacionadas
        </h3>
        <p style={{ fontSize: 12, color: C.text3, marginTop: 3, fontFamily: "var(--font-inter), sans-serif" }}>
          Clic para analizar otra keyword
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((q, i) => (
          <button key={i} onClick={() => onSearchAgain(q)} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 8,
            background: "rgba(255,255,255,0.025)",
            border: `1px solid ${C.border}`,
            color: C.text2, fontSize: 13, fontWeight: 500,
            fontFamily: "var(--font-inter), sans-serif",
            cursor: "pointer", textAlign: "left", transition: "all 0.15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = Gs;
            e.currentTarget.style.borderColor = Gb;
            e.currentTarget.style.color = G;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.025)";
            e.currentTarget.style.borderColor = C.border;
            e.currentTarget.style.color = C.text2;
          }}>
            <IconSearch size={13} />
            <span style={{ flex: 1 }}>{q}</span>
            <IconChevronRight size={13} />
          </button>
        ))}
      </div>
    </Card>
  );
}

// ── Ops footer ────────────────────────────────────────────────────────────────
function OpsFooter({ data }: { data: SerpData }) {
  return (
    <Card style={{ padding: "16px 22px", marginTop: 28 }}>
      <div className="serp-footer-stats">
        <div style={{ display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.text3, fontSize: 12 }}>
            <IconDollar size={14} />
            <span style={{ color: C.text2, fontFamily: "var(--font-mono), monospace" }}>
              ${data.cost.toFixed(4)} USD
            </span>
            <span>· costo del análisis</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.text3, fontSize: 12 }}>
            <IconClock size={14} />
            <span style={{ color: C.text2, fontFamily: "var(--font-mono), monospace" }}>{data.task_time}</span>
            <span>· tiempo de respuesta</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.text3, fontSize: 12 }}>
            <IconCalendar size={14} />
            <span style={{ color: C.text2, fontFamily: "var(--font-inter), sans-serif" }}>{fmtDate(data.datetime)}</span>
          </div>
        </div>
        <a href={data.check_url} target="_blank" rel="noreferrer" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: G, color: "#0a0a0a",
          fontWeight: 700, fontSize: 13, padding: "10px 18px",
          borderRadius: 9, textDecoration: "none",
          fontFamily: "var(--font-inter), sans-serif", transition: "all 0.15s",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = `0 6px 20px rgba(93,184,72,0.4)`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}>
          Ver SERP en Google <IconExternal size={13} />
        </a>
      </div>
    </Card>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function SerpSection({ data, onSearchAgain }: {
  data: SerpData;
  onSearchAgain: (keyword: string) => void;
}) {
  return (
    <div>
      {/* Header */}
      <header style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 18 }}>
            Análisis SERP
          </div>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.text4 }} />
          <div style={{ fontSize: 12, color: C.text3, fontFamily: "var(--font-inter), sans-serif" }}>
            Cómo ranquea Google para tu keyword
          </div>
        </div>
        <h1 style={{
          fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
          fontSize: "clamp(28px, 4vw, 44px)", lineHeight: 1.1,
          color: C.text, letterSpacing: "-0.025em", marginBottom: 14,
        }}>
          <span style={{ color: C.text3 }}>"</span>
          {data.keyword}
          <span style={{ color: C.text3 }}>"</span>
        </h1>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {data.has_ai_overview && (
            <Badge tone="green"><IconBrain size={11} /> AI Overview</Badge>
          )}
          {data.featured_snippet_domain && (
            <Badge tone="yellow"><IconStar size={11} filled /> Featured snippet</Badge>
          )}
          {data.serp_features.includes("local_pack") && (
            <Badge tone="blue">Pack local</Badge>
          )}
          {data.serp_features.includes("people_also_ask") && (
            <Badge>People also ask</Badge>
          )}
          {data.serp_features.includes("knowledge_graph") && (
            <Badge>Knowledge Graph</Badge>
          )}
        </div>
      </header>

      {/* KPIs */}
      <KpiRow data={data} />

      {/* Ranking distribution + top domains */}
      <div className="serp-ranking-grid">
        <RankingDistribution dist={data.ranking_distribution} total={data.organic_results_count} />
        <TopDomains domains={data.top_10_domains} target={data.target_visibility} top3={data.top_3_domains} />
      </div>

      {/* AI Overview */}
      {data.has_ai_overview && data.ai_overview && (
        <div style={{ marginBottom: 28 }}>
          <AIOverview ai={data.ai_overview} />
        </div>
      )}

      {/* Results table + sidebar */}
      <div className="serp-main-grid">
        <ResultsTable rows={data.organic_results} target={data.target_visibility} />
        {data.related_searches.length > 0 && (
          <div style={{ position: "sticky", top: 16 }}>
            <RelatedSearches items={data.related_searches} onSearchAgain={onSearchAgain} />
          </div>
        )}
      </div>

      {/* Ops footer */}
      <OpsFooter data={data} />
    </div>
  );
}
