"use client";

import { useState, useEffect, useRef } from "react";
import type { CrUXMetric, CrUXHistoryMetric } from "@/types/dashboard";
import {
  C, EG, RATING, TREND, THRESHOLDS, METRIC_META, isCoreVital,
  fmtMetric, fmtDateShort,
  Badge, IconX, IconInfo,
} from "./shared";

// ─── History area chart ────────────────────────────────────────────────────────
function HistoryChart({ metricKey, hist }: { metricKey: string; hist: CrUXHistoryMetric }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(700);
  const [hover, setHover] = useState<number | null>(null);
  const H = 300;

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(() => {
      if (wrapRef.current) {
        setW(Math.max(400, wrapRef.current.getBoundingClientRect().width));
      }
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const data      = hist.timeseries;
  const threshold = THRESHOLDS[metricKey];
  const allVals   = data.map(d => d.p75).filter((v): v is number => v != null);

  if (!allVals.length) {
    return (
      <div style={{ height: H, display: "flex", alignItems: "center", justifyContent: "center", color: C.text3, fontSize: 14 }}>
        Sin datos disponibles
      </div>
    );
  }

  const dataMax = Math.max(...allVals);
  const yMax    = Math.max(dataMax * 1.15, threshold.poor * 1.2);
  const yMin    = 0;

  const pad = { l: 60, r: 20, t: 18, b: 36 };
  const iw  = w - pad.l - pad.r;
  const ih  = H - pad.t - pad.b;

  const xAt = (i: number) => pad.l + (i / (data.length - 1 || 1)) * iw;
  const yAt = (v: number) => pad.t + ih - ((v - yMin) / (yMax - yMin)) * ih;

  // Reference bands
  const goodBot  = yAt(0);
  const goodTop  = yAt(threshold.good);
  const needsBot = yAt(threshold.good);
  const needsTop = yAt(threshold.poor);
  const poorBot  = pad.t + ih;
  const poorTop  = yAt(threshold.poor);

  // Line path (skip null segments)
  let needsMove = true;
  const lineParts: string[] = [];
  data.forEach((d, i) => {
    if (d.p75 == null) { needsMove = true; return; }
    lineParts.push(`${needsMove ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(d.p75).toFixed(1)}`);
    needsMove = false;
  });
  const linePath = lineParts.join(" ");

  const yTicks    = [0, 0.25, 0.5, 0.75, 1].map(t => yMax * t);
  const xTickIdx  = data.map((_, i) => i).filter((_, i, arr) =>
    i === 0 || i === arr.length - 1 ||
    i === Math.floor(arr.length / 2) ||
    i === Math.floor(arr.length / 4) ||
    i === Math.floor(3 * arr.length / 4)
  );
  const fmtY = (v: number): string =>
    metricKey === "cumulative_layout_shift"
      ? v.toFixed(2)
      : v >= 1000
        ? (v / 1000).toFixed(1) + "s"
        : Math.round(v) + "ms";

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * w;
    const i = Math.round(((x - pad.l) / iw) * (data.length - 1));
    setHover(i >= 0 && i < data.length ? i : null);
  };

  const hoverData = hover != null ? data[hover] : null;

  return (
    <div ref={wrapRef} style={{ width: "100%", position: "relative" as const }}>
      <svg width={w} height={H}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        style={{ display: "block", cursor: "crosshair" }}
      >
        {/* Reference bands */}
        <rect x={pad.l} y={goodTop}  width={iw} height={goodBot - goodTop}   fill={C.cwvGood}  fillOpacity="0.08"/>
        <rect x={pad.l} y={needsTop} width={iw} height={needsBot - needsTop} fill={C.cwvAmber} fillOpacity="0.08"/>
        <rect x={pad.l} y={poorTop}  width={iw} height={poorBot - poorTop}   fill={C.cwvPoor}  fillOpacity="0.08"/>

        {/* Threshold dashed lines */}
        <line x1={pad.l} x2={w - pad.r} y1={yAt(threshold.good)} y2={yAt(threshold.good)}
          stroke={C.cwvGood} strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.5"/>
        <line x1={pad.l} x2={w - pad.r} y1={yAt(threshold.poor)} y2={yAt(threshold.poor)}
          stroke={C.cwvPoor} strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.5"/>

        {/* Threshold labels */}
        <text x={w - pad.r - 4} y={yAt(threshold.good) - 4} textAnchor="end"
          fontSize="10" fontFamily="monospace" fill={C.cwvGood} fontWeight="600">
          ≤ {fmtY(threshold.good)} bueno
        </text>
        <text x={w - pad.r - 4} y={yAt(threshold.poor) - 4} textAnchor="end"
          fontSize="10" fontFamily="monospace" fill={C.cwvPoor} fontWeight="600">
          &gt; {fmtY(threshold.poor)} pobre
        </text>

        {/* Y axis */}
        {yTicks.map((t, i) => (
          <text key={i} x={pad.l - 8} y={yAt(t) + 4} textAnchor="end"
            fontSize="10.5" fontFamily="monospace" fill={C.text3}>
            {fmtY(t)}
          </text>
        ))}

        {/* X axis */}
        {xTickIdx.map(i => (
          <text key={i} x={xAt(i)} y={H - pad.b + 18} textAnchor="middle"
            fontSize="10.5" fontFamily="sans-serif" fill={C.text3}>
            {fmtDateShort(data[i].date_from)}
          </text>
        ))}

        {/* Line */}
        {linePath && (
          <path d={linePath} stroke={EG} strokeWidth="2.2" fill="none"
            strokeLinecap="round" strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 6px ${EG}66)` }}/>
        )}

        {/* Data points */}
        {data.map((d, i) => {
          if (d.p75 == null) return null;
          const r = RATING[d.rating] ?? RATING.no_data;
          return (
            <circle key={i} cx={xAt(i)} cy={yAt(d.p75)} r={hover === i ? 5 : 3}
              fill={r.color} stroke={C.bg} strokeWidth="1.5"/>
          );
        })}

        {/* Hover crosshair */}
        {hover != null && (
          <line x1={xAt(hover)} x2={xAt(hover)} y1={pad.t} y2={pad.t + ih}
            stroke={C.text3} strokeOpacity="0.4" strokeDasharray="3 3"/>
        )}
      </svg>

      {/* Hover tooltip */}
      {hoverData && hoverData.p75 != null && (() => {
        const r = RATING[hoverData.rating] ?? RATING.no_data;
        return (
          <div style={{
            position: "absolute" as const,
            left: Math.min(w - 220, Math.max(8, xAt(hover!) + 14)),
            top:  yAt(hoverData.p75) - 70,
            background: "rgba(16,16,16,0.97)",
            border: `1px solid ${C.borderStrong}`,
            borderRadius: 10, padding: "10px 14px",
            pointerEvents: "none" as const, minWidth: 200,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}>
            <div style={{ fontSize: 10.5, color: C.text3, marginBottom: 4 }}>
              {fmtDateShort(hoverData.date_from)} → {fmtDateShort(hoverData.date_to)}
            </div>
            <div style={{
              fontFamily: "var(--font-syne), sans-serif", fontWeight: 700,
              fontSize: 20, color: r.color, fontVariantNumeric: "tabular-nums" as const,
            }}>
              {fmtMetric(hoverData.p75, hist.unit)}
            </div>
            <div style={{ fontSize: 11, color: r.color, marginTop: 2, fontWeight: 500 }}>
              {r.label}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ─── Dialog ────────────────────────────────────────────────────────────────────
export function MetricDialog({
  open, metricKey, current, history, onClose,
}: {
  open:      boolean;
  metricKey: string | null;
  current:   CrUXMetric | null;
  history:   CrUXHistoryMetric | null;
  onClose:   () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !metricKey || !current) return null;

  const meta = METRIC_META[metricKey];
  const r    = RATING[current.rating] ?? RATING.no_data;
  const core = isCoreVital(metricKey);
  const th   = THRESHOLDS[metricKey];

  const statBoxes = history
    ? [
        { label: "p75 actual",   value: fmtMetric(history.current_p75,  history.unit), color: r.color },
        { label: "p75 anterior", value: fmtMetric(history.previous_p75, history.unit), color: C.text },
        {
          label: "Delta",
          value: history.delta_pct != null
            ? (history.delta_pct >= 0 ? "+" : "") + history.delta_pct.toFixed(1) + "%"
            : "—",
          color: TREND[history.trend]?.color ?? C.cwvGray,
        },
        {
          label: "Tendencia",
          value: TREND[history.trend]?.label ?? "—",
          color: TREND[history.trend]?.color ?? C.cwvGray,
          small: true,
        },
      ]
    : [];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed" as const, inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#0f0f0f",
          border: `1px solid ${C.borderStrong}`,
          borderRadius: 18, padding: 28,
          width: "100%", maxWidth: 760, maxHeight: "92vh",
          overflowY: "auto" as const,
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{
                fontFamily: "monospace", fontSize: 12, color: r.color, fontWeight: 700,
                background: `${r.color}18`, padding: "3px 8px",
                border: `1px solid ${r.color}40`, borderRadius: 6,
              }}>{meta.short}</span>
              <Badge color={r.color}>
                <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: r.color }}/>
                {r.label}
              </Badge>
              {core && (
                <span style={{
                  fontSize: 9.5, fontWeight: 700, color: C.text3,
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${C.border}`,
                  padding: "2px 7px", borderRadius: 4,
                  letterSpacing: "0.06em", textTransform: "uppercase" as const,
                }}>Core Web Vital</span>
              )}
            </div>
            <h2 style={{
              fontFamily: "var(--font-syne), sans-serif", fontWeight: 700,
              fontSize: 22, color: C.text, letterSpacing: "-0.01em",
            }}>{meta.name}</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`,
              color: C.text2, width: 32, height: 32, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}
          ><IconX size={15}/></button>
        </div>

        {/* Chart or empty state */}
        {history ? (
          <>
            <div style={{ padding: "4px 0 16px" }}>
              <div style={{
                fontSize: 11, color: C.text3, fontWeight: 600,
                letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 12,
              }}>
                Histórico ({history.timeseries.length} semanas)
              </div>
              <HistoryChart metricKey={metricKey} hist={history}/>
            </div>

            {/* Stat boxes */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 18 }}>
              {statBoxes.map((s, i) => (
                <div key={i} style={{
                  padding: "12px 14px", borderRadius: 10,
                  background: "rgba(255,255,255,0.025)", border: `1px solid ${C.border}`,
                }}>
                  <div style={{
                    fontSize: 10.5, color: C.text3,
                    letterSpacing: "0.06em", textTransform: "uppercase" as const, fontWeight: 600,
                  }}>{s.label}</div>
                  <div style={{
                    fontFamily: "var(--font-syne), sans-serif", fontWeight: 700,
                    fontSize: s.small ? 15 : 20,
                    color: s.color, marginTop: 4, lineHeight: 1.1,
                    fontVariantNumeric: "tabular-nums" as const,
                  }}>{s.value}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{
            padding: "40px 24px", textAlign: "center" as const,
            background: "rgba(255,255,255,0.02)",
            border: `1px dashed ${C.border}`, borderRadius: 12,
          }}>
            <div style={{ color: C.text3, fontSize: 14 }}>Sin historial disponible para este sitio.</div>
          </div>
        )}

        {/* Description footer */}
        <div style={{
          marginTop: 18, padding: "14px 16px", borderRadius: 12,
          background: "rgba(96,165,250,0.06)",
          border: "1px solid rgba(96,165,250,0.2)",
          display: "flex", gap: 12, alignItems: "flex-start",
        }}>
          <div style={{ color: C.text2, flexShrink: 0, marginTop: 1 }}>
            <IconInfo size={16}/>
          </div>
          <div>
            <div style={{ fontSize: 12, color: C.text, fontWeight: 600, marginBottom: 4 }}>¿Qué mide?</div>
            <div style={{ fontSize: 12.5, color: C.text2, lineHeight: 1.55 }}>{meta.description}</div>
            <div style={{
              fontSize: 11, color: C.text3, marginTop: 8, fontFamily: "monospace",
              display: "flex", gap: 12, flexWrap: "wrap" as const,
            }}>
              <span><span style={{ color: C.cwvGood }}>●</span> Bueno ≤ {fmtMetric(th.good, th.unit)}</span>
              <span><span style={{ color: C.cwvAmber }}>●</span> Mejora ≤ {fmtMetric(th.poor, th.unit)}</span>
              <span><span style={{ color: C.cwvPoor }}>●</span> Pobre &gt; {fmtMetric(th.poor, th.unit)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
