"use client";

import type { OnPageData } from "@/types/dashboard";
import { C, cwvColor, cwvLabel, fmtMs, Card, Badge, SectionTitle, IconLayers } from "./shared";

// ── Single gauge ───────────────────────────────────────────────────────────────
function Gauge({
  metric, value, label, format, goodThreshold, poorThreshold,
}: {
  metric: string;
  value: number | null;
  label: string;
  format: (v: number) => string;
  goodThreshold: number;
  poorThreshold: number;
}) {
  const color = cwvColor(metric, value);
  const ratingLabel = cwvLabel(metric, value);

  const pct = value == null ? 0 : Math.min(100, Math.max(0, (value / poorThreshold) * 100));

  const size = 130, stroke = 12;
  const r = (size - stroke) / 2;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const sweep = 270;
  const dashArr = `${(sweep / 360) * circ} ${circ}`;
  const dashOff = (1 - pct / 100) * (sweep / 360) * circ;

  return (
    <Card style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{
        fontSize: 11, color: C.text3, letterSpacing: "0.06em",
        textTransform: "uppercase", fontWeight: 600,
      }}>{label}</div>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(135deg)" }}>
          <circle cx={cx} cy={cy} r={r} fill="none"
            stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}
            strokeDasharray={`${(sweep / 360) * circ} ${circ}`} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={r} fill="none"
            stroke={color} strokeWidth={stroke}
            strokeDasharray={dashArr} strokeDashoffset={dashOff}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 6px ${color}66)`,
              transition: "stroke-dashoffset 0.8s cubic-bezier(0.2,0.9,0.3,1)",
            }} />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
            fontSize: 22, color, lineHeight: 1, letterSpacing: "-0.02em",
          }}>
            {value == null ? "—" : format(value)}
          </div>
          <div style={{
            fontSize: 10, color, fontWeight: 600, marginTop: 4,
            letterSpacing: "0.04em", textTransform: "uppercase",
          }}>
            {value == null ? "Sin datos" : ratingLabel}
          </div>
        </div>
      </div>
      <div style={{
        fontSize: 10.5, color: C.text3,
        fontFamily: "var(--font-mono), monospace",
      }}>
        umbral &lt; {format(goodThreshold)}
      </div>
    </Card>
  );
}

// ── PerformanceGauges ──────────────────────────────────────────────────────────
export function PerformanceGauges({ perf }: { perf: OnPageData["performance"] }) {
  const cls = perf.cumulative_layout_shift;
  const clsColor = cwvColor("CLS", cls);
  const clsTone = clsColor === "#22c55e" ? "green" as const : clsColor === "#f59e0b" ? "amber" as const : "red" as const;

  return (
    <div>
      <SectionTitle
        kicker="Rendimiento"
        title="Core Web Vitals"
        sub="Métricas de Google que afectan ranking y experiencia de usuario"
      />
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14,
      }}>
        <Gauge metric="TTI" label="Time to Interactive"
          value={perf.time_to_interactive_ms} format={fmtMs}
          goodThreshold={3800} poorThreshold={7300} />
        <Gauge metric="DOM" label="DOM Complete"
          value={perf.dom_complete_ms} format={fmtMs}
          goodThreshold={2000} poorThreshold={4000} />
        <Gauge metric="LCP" label="Largest Contentful Paint"
          value={perf.largest_contentful_paint} format={fmtMs}
          goodThreshold={2500} poorThreshold={4000} />
        <Gauge metric="FID" label="First Input Delay"
          value={perf.first_input_delay} format={fmtMs}
          goodThreshold={100} poorThreshold={300} />
      </div>

      {/* CLS as horizontal card */}
      <Card style={{ marginTop: 14, padding: "16px 22px", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: `${clsColor}22`,
          border: `1px solid ${clsColor}55`,
          color: clsColor,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <IconLayers size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 11, color: C.text3, letterSpacing: "0.06em",
            textTransform: "uppercase", fontWeight: 600, marginBottom: 3,
          }}>
            Cumulative Layout Shift (CLS)
          </div>
          <div style={{ fontSize: 13, color: C.text2 }}>
            Mide cuánto se desplaza visualmente el contenido durante la carga
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{
            fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
            fontSize: 28, color: clsColor, lineHeight: 1,
          }}>
            {cls == null ? "—" : cls.toFixed(2)}
          </div>
          <Badge tone={clsTone} style={{ marginTop: 6 }}>
            {cwvLabel("CLS", cls)}
          </Badge>
        </div>
      </Card>
    </div>
  );
}
