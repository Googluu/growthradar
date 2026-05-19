"use client";

import type { CrUXData, CrUXRating } from "@/types/dashboard";

const G  = "#5DB848";
const AM = "#f59e0b";
const RD = "#ef4444";

const C = {
  card: "rgba(255,255,255,0.025)",
  border: "rgba(255,255,255,0.07)",
  text: "#fff",
  text2: "rgba(255,255,255,0.65)",
  text3: "rgba(255,255,255,0.42)",
  text4: "rgba(255,255,255,0.28)",
};

const RATING_COLORS: Record<CrUXRating, string> = {
  good:             G,
  needs_improvement: AM,
  poor:             RD,
  no_data:          C.text3,
};

const RATING_LABELS: Record<CrUXRating, string> = {
  good:             "Bueno",
  needs_improvement: "Mejorable",
  poor:             "Deficiente",
  no_data:          "Sin datos",
};

function scoreColor(score: number) {
  if (score >= 80) return G;
  if (score >= 50) return AM;
  return RD;
}
function scoreLabel(score: number) {
  if (score >= 80) return "Bueno";
  if (score >= 50) return "Mejorable";
  return "Deficiente";
}

const fmtMetric = (value: number | null, unit: string): string => {
  if (value == null) return "—";
  if (unit === "ms") {
    if (value >= 1000) return (value / 1000).toFixed(2).replace(/\.?0+$/, "") + " s";
    return Math.round(value) + " ms";
  }
  if (unit === "score") return value.toFixed(3);
  return String(value);
};

interface MetricConfig {
  key: keyof CrUXData["metrics"];
  name: string;
  short: string;
  description: string;
  goodThreshold: string;
}

const METRICS: MetricConfig[] = [
  {
    key:           "largest_contentful_paint",
    name:          "LCP",
    short:         "Largest Contentful Paint",
    description:   "Tiempo hasta el mayor elemento visible. Google lo mide para rankear.",
    goodThreshold: "< 2.5 s",
  },
  {
    key:           "interaction_to_next_paint",
    name:          "INP",
    short:         "Interaction to Next Paint",
    description:   "Capacidad de respuesta a interacciones del usuario.",
    goodThreshold: "< 200 ms",
  },
  {
    key:           "cumulative_layout_shift",
    name:          "CLS",
    short:         "Cumulative Layout Shift",
    description:   "Estabilidad visual de la página. Evita saltos inesperados.",
    goodThreshold: "< 0.1",
  },
  {
    key:           "first_contentful_paint",
    name:          "FCP",
    short:         "First Contentful Paint",
    description:   "Tiempo hasta el primer contenido visible para el usuario.",
    goodThreshold: "< 1.8 s",
  },
  {
    key:           "experimental_time_to_first_byte",
    name:          "TTFB",
    short:         "Time to First Byte",
    description:   "Velocidad de respuesta del servidor. Base de todo lo demás.",
    goodThreshold: "< 800 ms",
  },
];

function MetricCard({ config, metric }: { config: MetricConfig; metric: CrUXData["metrics"][keyof CrUXData["metrics"]] }) {
  const color  = RATING_COLORS[metric.rating];
  const label  = RATING_LABELS[metric.rating];
  const value  = fmtMetric(metric.p75, metric.unit);

  return (
    <div style={{
      padding: 24, borderRadius: 16,
      background: metric.rating === "no_data" ? C.card : `linear-gradient(160deg, ${color}08, ${C.card})`,
      border: `1px solid ${metric.rating === "no_data" ? C.border : `${color}30`}`,
      display: "flex", flexDirection: "column", gap: 12,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{
            fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
            fontSize: 22, color, letterSpacing: "-0.01em",
          }}>{config.name}</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>{config.short}</div>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 999,
          background: `${color}18`, color, border: `1px solid ${color}40`,
          letterSpacing: "0.04em", textTransform: "uppercase" as const, whiteSpace: "nowrap" as const,
        }}>{label}</span>
      </div>

      <div style={{
        fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
        fontSize: 36, lineHeight: 1, color,
        letterSpacing: "-0.02em",
      }}>{value}</div>

      <div style={{ fontSize: 11.5, color: C.text3 }}>{config.description}</div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: C.text4 }}>Bueno: {config.goodThreshold}</span>
        <span style={{ fontSize: 11, color: C.text4 }}>p75</span>
      </div>

      {/* Status bar */}
      <div style={{ height: 4, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 999,
          width: metric.rating === "good" ? "100%" : metric.rating === "needs_improvement" ? "55%" : metric.rating === "poor" ? "20%" : "0%",
          background: `linear-gradient(90deg, ${color}aa, ${color})`,
          transition: "width 0.8s cubic-bezier(0.2,0.9,0.3,1)",
        }} />
      </div>
    </div>
  );
}

function PerformanceScoreGauge({ score }: { score: number }) {
  const color = scoreColor(score);
  const size  = 180;
  const stroke = 16;
  const r = (size - stroke) / 2;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const sweep = 270;
  const arcLen = (sweep / 360) * circ;
  const dashOff = (1 - score / 100) * arcLen;

  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      <div style={{
        position: "absolute", inset: -16,
        background: `radial-gradient(circle, ${color}20, transparent 70%)`,
        borderRadius: "50%", pointerEvents: "none",
      }} />
      <svg width={size} height={size} style={{ transform: "rotate(135deg)", display: "block" }}>
        <defs>
          <linearGradient id="cwv-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
          <filter id="cwv-glow">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}
          strokeDasharray={`${arcLen} ${circ}`} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke="url(#cwv-grad)" strokeWidth={stroke}
          strokeDasharray={`${arcLen} ${circ}`} strokeDashoffset={dashOff}
          strokeLinecap="round" filter="url(#cwv-glow)"
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.2,0.9,0.3,1)" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", pointerEvents: "none",
      }}>
        <div style={{
          fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
          fontSize: 48, lineHeight: 0.95, color, letterSpacing: "-0.04em",
        }}>{score}</div>
        <div style={{ fontSize: 11, color: C.text3, marginTop: 6 }}>/ 100</div>
        <div style={{
          fontFamily: "var(--font-inter), sans-serif", fontSize: 11, fontWeight: 700, color,
          marginTop: 8, letterSpacing: "0.08em", textTransform: "uppercase" as const,
          padding: "3px 10px", background: `${color}18`, border: `1px solid ${color}40`, borderRadius: 999,
        }}>{scoreLabel(score)}</div>
      </div>
    </div>
  );
}

export function CoreWebVitalsSection({ data }: { data: CrUXData }) {
  const goodCount = Object.values(data.metrics).filter(m => m.rating === "good").length;
  const poorCount = Object.values(data.metrics).filter(m => m.rating === "poor").length;
  const niCount   = Object.values(data.metrics).filter(m => m.rating === "needs_improvement").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Hero ── */}
      <div style={{
        display: "grid", gridTemplateColumns: "auto 1fr", gap: 0,
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, overflow: "hidden",
      }}>
        <div style={{
          padding: "40px 48px",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          borderRight: `1px solid ${C.border}`,
          background: `radial-gradient(ellipse 120% 100% at 50% 50%, ${scoreColor(data.performance_score)}08, transparent 70%)`,
        }}>
          <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 17, marginBottom: 6 }}>
            Velocidad real
          </div>
          <PerformanceScoreGauge score={data.performance_score} />
          <div style={{ marginTop: 16, fontSize: 12, color: C.text3, textAlign: "center" }}>
            Datos de campo de Chrome
          </div>
        </div>

        <div style={{ padding: "40px 40px" }}>
          <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 17, marginBottom: 6 }}>Core Web Vitals</div>
          <h2 style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 24, color: C.text, letterSpacing: "-0.015em", marginBottom: 8 }}>
            {data.origin}
          </h2>
          <p style={{ fontSize: 13, color: C.text3, marginBottom: 24 }}>
            Período: {data.collection_period.from} → {data.collection_period.to} · {data.form_factor}
          </p>

          {/* Summary badges */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { count: goodCount, label: "Bueno", color: G },
              { count: niCount,   label: "Mejorable", color: AM },
              { count: poorCount, label: "Deficiente", color: RD },
            ].map(b => (
              <div key={b.label} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 20px", borderRadius: 12,
                background: `${b.color}10`, border: `1px solid ${b.color}30`,
              }}>
                <div style={{
                  fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
                  fontSize: 28, color: b.color,
                }}>{b.count}</div>
                <div style={{ fontSize: 13, color: C.text2 }}>{b.label}</div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 12, color: C.text4, marginTop: 20, lineHeight: 1.6 }}>
            Los Core Web Vitals son métricas reales de campo (p75) recolectadas por Chrome de usuarios reales.
            Google los usa como factor de ranking desde 2021.
          </p>
        </div>
      </div>

      {/* ── Metric cards grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {METRICS.slice(0, 3).map(cfg => (
          <MetricCard key={cfg.key} config={cfg} metric={data.metrics[cfg.key]} />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
        {METRICS.slice(3).map(cfg => (
          <MetricCard key={cfg.key} config={cfg} metric={data.metrics[cfg.key]} />
        ))}
      </div>
    </div>
  );
}
