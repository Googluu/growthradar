"use client";

import { useState } from "react";
import type { OnPageData } from "@/types/dashboard";

const G  = "#5DB848";
const AM = "#f59e0b";
const RD = "#ef4444";
const BL = "#60a5fa";

const C = {
  card: "rgba(255,255,255,0.025)",
  border: "rgba(255,255,255,0.07)",
  borderStrong: "rgba(255,255,255,0.14)",
  text: "#fff",
  text2: "rgba(255,255,255,0.65)",
  text3: "rgba(255,255,255,0.42)",
  text4: "rgba(255,255,255,0.28)",
};

function scoreColor(s: number) {
  if (s >= 80) return G;
  if (s >= 50) return AM;
  return RD;
}
function scoreLabel(s: number) {
  if (s >= 80) return "Excelente";
  if (s >= 50) return "Mejorable";
  return "Crítico";
}

const fmtBytes = (n: number | null | undefined) => {
  if (n == null) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2).replace(/\.?0+$/, "") + " MB";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + " KB";
  return n + " B";
};
const fmtMs = (n: number | null | undefined) => {
  if (n == null) return "—";
  if (n >= 1000) return (n / 1000).toFixed(2).replace(/\.?0+$/, "") + " s";
  return Math.round(n) + " ms";
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

function Badge({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "green" | "red" | "amber" | "blue" }) {
  const tones = {
    default: { bg: "rgba(255,255,255,0.06)", fg: C.text2, br: "rgba(255,255,255,0.1)" },
    green:   { bg: "rgba(93,184,72,0.12)",   fg: G,       br: "rgba(93,184,72,0.35)" },
    red:     { bg: "rgba(239,68,68,0.12)",   fg: RD,      br: "rgba(239,68,68,0.32)" },
    amber:   { bg: "rgba(245,158,11,0.12)",  fg: AM,      br: "rgba(245,158,11,0.32)" },
    blue:    { bg: "rgba(96,165,250,0.12)",  fg: BL,      br: "rgba(96,165,250,0.32)" },
  }[tone];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: tones.bg, color: tones.fg, border: `1px solid ${tones.br}`,
      fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 999,
      letterSpacing: "0.01em", whiteSpace: "nowrap",
    }}>{children}</span>
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

function RadialScore({ score }: { score: number }) {
  const color = scoreColor(score);
  const size = 200, stroke = 18;
  const r = (size - stroke) / 2;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const sweep = 270;
  const dashArr = `${(sweep / 360) * circ} ${circ}`;
  const dashOff = (1 - score / 100) * (sweep / 360) * circ;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(135deg)", display: "block" }}>
        <defs>
          <linearGradient id="op-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
          <filter id="op-glow">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}
          strokeDasharray={dashArr} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke="url(#op-grad)" strokeWidth={stroke}
          strokeDasharray={dashArr} strokeDashoffset={dashOff}
          strokeLinecap="round" filter="url(#op-glow)"
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.2,0.9,0.3,1)" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}>
        <div style={{
          fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
          fontSize: 52, color, lineHeight: 1, letterSpacing: "-0.04em",
        }}>{score}</div>
        <div style={{ fontSize: 12, color: C.text3, fontWeight: 500, marginTop: 4 }}>/ 100</div>
        <div style={{
          fontFamily: "var(--font-inter), sans-serif", fontSize: 12, fontWeight: 600,
          color, marginTop: 8, letterSpacing: "0.04em", textTransform: "uppercase",
        }}>{scoreLabel(score)}</div>
      </div>
    </div>
  );
}

export function OnPageAuditSection({ data }: { data: OnPageData }) {
  const [issuesOpen,  setIssuesOpen]  = useState(true);
  const [passingOpen, setPassingOpen] = useState(false);
  const [resOpen,     setResOpen]     = useState(false);
  const { health } = data;
  const statusTone = health.http_status_class === "2xx" ? "green" : health.http_status_class === "3xx" ? "blue" : "red";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Hero card ── */}
      <Card style={{ padding: 28, position: "relative", overflow: "hidden" }} accent>
        <div style={{
          position: "absolute", top: -100, right: -100,
          width: 280, height: 280,
          background: `radial-gradient(circle, ${scoreColor(health.computed_health_score)}22, transparent 70%)`,
          pointerEvents: "none",
        }} />
        <div style={{
          display: "grid", gridTemplateColumns: "1fr auto auto",
          gap: 28, alignItems: "center", position: "relative",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 18 }}>Auditoría On-Page</div>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: C.text4, display: "inline-block" }} />
              <div style={{ fontSize: 12, color: C.text3 }}>Salud técnica de la página</div>
            </div>
            <h1 style={{
              fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
              fontSize: "clamp(16px, 2vw, 26px)", lineHeight: 1.2,
              color: C.text, letterSpacing: "-0.02em", marginBottom: 12, wordBreak: "break-all",
            }}>
              <span style={{ color: C.text3 }}>{data.url?.split("://")[0]}://</span>
              {data.url?.split("://")[1]}
            </h1>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              <Badge tone={statusTone as "green" | "blue" | "red"}>HTTP {data.status_code}</Badge>
              {data.canonical && <Badge tone="default">Canonical ✓</Badge>}
              <Badge tone="default">OnPage score {health.onpage_score}</Badge>
              <Badge tone={health.is_indexable ? "green" : "red"}>
                {health.is_indexable ? "Indexable" : "No indexable"}
              </Badge>
            </div>
            <a href={data.url} target="_blank" rel="noreferrer" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
              color: C.text2, fontSize: 13, fontWeight: 500,
              padding: "8px 14px", borderRadius: 9, textDecoration: "none",
            }}>
              Abrir página
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          </div>

          {/* Radial */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <RadialScore score={health.computed_health_score} />
            <div style={{ fontSize: 10.5, color: C.text3, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>
              Health Score
            </div>
          </div>

          {/* KPI mini-cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Issues", value: health.issues_count, tone: RD, icon: "⚠" },
              { label: "Checks OK", value: health.passing_count, tone: G, icon: "✓" },
              { label: "TTI", value: fmtMs(data.performance?.time_to_interactive_ms), tone: AM, icon: "⚡" },
            ].map(kpi => (
              <div key={kpi.label} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", borderRadius: 10,
                background: `${kpi.tone}08`, border: `1px solid ${kpi.tone}25`,
              }}>
                <span style={{ fontSize: 18, width: 28, textAlign: "center" }}>{kpi.icon}</span>
                <div>
                  <div style={{ fontSize: 10, color: C.text3, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>{kpi.label}</div>
                  <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 800, fontSize: 20, color: kpi.tone }}>{kpi.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Two-col: issues + passing ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Issues */}
        <Card style={{ padding: 24 }}>
          <button
            onClick={() => setIssuesOpen(o => !o)}
            style={{
              width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
              background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: issuesOpen ? 16 : 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={RD} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 16, color: C.text }}>
                  Issues ({health.issues_count})
                </div>
                <div style={{ fontSize: 12, color: C.text3 }}>Problemas críticos encontrados</div>
              </div>
            </div>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.text3} strokeWidth={1.6} strokeLinecap="round" style={{ transform: issuesOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {issuesOpen && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 360, overflowY: "auto" }}>
              {data.issues.length === 0 ? (
                <div style={{ fontSize: 13, color: C.text3, padding: "8px 0" }}>Sin issues críticos ✓</div>
              ) : data.issues.map((issue, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "9px 12px", borderRadius: 8,
                  background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)",
                }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={RD} strokeWidth={2} strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  <span style={{ fontSize: 13, color: C.text2, lineHeight: 1.5 }}>{issue.label}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Passing checks */}
        <Card style={{ padding: 24 }}>
          <button
            onClick={() => setPassingOpen(o => !o)}
            style={{
              width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
              background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: passingOpen ? 16 : 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(93,184,72,0.1)", border: `1px solid ${G}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 9.5"/>
                </svg>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 16, color: C.text }}>
                  Pasados ({health.passing_count})
                </div>
                <div style={{ fontSize: 12, color: C.text3 }}>Checks que sí cumplen</div>
              </div>
            </div>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.text3} strokeWidth={1.6} strokeLinecap="round" style={{ transform: passingOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {passingOpen && (
            <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 360, overflowY: "auto" }}>
              {data.passing_checks.map((check, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "8px 10px", borderRadius: 7,
                  background: "rgba(93,184,72,0.05)", border: "1px solid rgba(93,184,72,0.15)",
                }}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth={2} strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span style={{ fontSize: 13, color: C.text2 }}>{check.label}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Meta info ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {[
          { label: "Título", value: data.title || "—", sub: `${data.title_length} chars`, ok: data.title_length >= 40 && data.title_length <= 60 },
          { label: "Meta description", value: data.description || "—", sub: `${data.description_length} chars`, ok: data.description_length >= 100 && data.description_length <= 160 },
          { label: "H1", value: data.h1_text[0] || "—", sub: `${data.h1_count} etiquetas`, ok: data.h1_count === 1 },
        ].map(item => (
          <Card key={item.label} style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: C.text3, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>{item.label}</span>
              <Badge tone={item.ok ? "green" : "amber"}>{item.ok ? "OK" : "Revisar"}</Badge>
            </div>
            <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
              {item.value}
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: C.text4 }}>{item.sub}</div>
          </Card>
        ))}
      </div>

      {/* ── Performance ── */}
      <Card style={{ padding: 24 }}>
        <SectionTitle kicker="Rendimiento" title="Métricas de carga" sub="Tiempos medidos por el crawler de DataForSEO" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {[
            { label: "TTI",        value: fmtMs(data.performance?.time_to_interactive_ms) },
            { label: "DOM Complete", value: fmtMs(data.performance?.dom_complete_ms) },
            { label: "Waiting",    value: fmtMs(data.performance?.waiting_time_ms) },
            { label: "Tamaño",     value: fmtBytes(data.page_size_bytes) },
          ].map(m => (
            <div key={m.label} style={{
              padding: "16px 18px", borderRadius: 12,
              background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`,
            }}>
              <div style={{ fontSize: 10.5, color: C.text3, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>{m.label}</div>
              <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 800, fontSize: 22, color: C.text }}>{m.value}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Resources ── */}
      <Card style={{ padding: 24 }}>
        <button
          onClick={() => setResOpen(o => !o)}
          style={{
            width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: resOpen ? 20 : 0,
          }}
        >
          <SectionTitle
            title={`Recursos ${data.resource_errors.length > 0 ? `· ${data.resource_errors.length} errores` : ""}`}
            sub="Scripts, estilos e imágenes"
          />
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.text3} strokeWidth={1.6} strokeLinecap="round" style={{ transform: resOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        {resOpen && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              { label: "Scripts",    count: data.resources_breakdown?.scripts_count, size: fmtBytes(data.resources_breakdown?.scripts_size) },
              { label: "Estilos",    count: data.resources_breakdown?.stylesheets_count, size: fmtBytes(data.resources_breakdown?.stylesheets_size) },
              { label: "Imágenes",   count: data.resources_breakdown?.images_count, size: fmtBytes(data.resources_breakdown?.images_size) },
            ].map(r => (
              <div key={r.label} style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 12, color: C.text3, marginBottom: 6 }}>{r.label}</div>
                <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 800, fontSize: 22, color: C.text }}>{r.count ?? "—"}</div>
                <div style={{ fontSize: 11, color: C.text4, marginTop: 2 }}>{r.size}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
