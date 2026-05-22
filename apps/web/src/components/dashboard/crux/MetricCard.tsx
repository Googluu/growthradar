"use client";

import type { CrUXMetric, CrUXHistoryMetric } from "@/types/dashboard";
import {
  C, RATING, METRIC_META, isCoreVital,
  fmtP75Value, fmtP75Unit,
  Badge, Sparkline, TrendChip, IconInfo,
} from "./shared";

export function MetricCard({
  metricKey, current, history, onClick,
}: {
  metricKey: string;
  current:   CrUXMetric;
  history:   CrUXHistoryMetric | undefined;
  onClick:   () => void;
}) {
  const meta   = METRIC_META[metricKey];
  const rating = RATING[current.rating] ?? RATING.no_data;
  const core   = isCoreVital(metricKey);

  return (
    <div
      onClick={onClick}
      style={{
        padding: 22,
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        cursor: "pointer",
        position: "relative" as const,
        overflow: "hidden" as const,
        transition: "border-color 0.15s, transform 0.15s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${rating.color}50`;
        e.currentTarget.style.transform   = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.transform   = "translateY(0)";
      }}
    >
      {/* Rating accent strip */}
      <div style={{
        position: "absolute" as const, top: 0, left: 0, right: 0, height: 3,
        background: rating.color, opacity: 0.7,
      }}/>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontFamily: "monospace", fontSize: 11.5,
            color: rating.color, fontWeight: 700,
            background: `${rating.color}15`, padding: "3px 7px",
            border: `1px solid ${rating.color}40`,
            borderRadius: 6, letterSpacing: "0.02em",
          }}>{meta.short}</span>
          {core && (
            <span style={{
              fontSize: 9.5, fontWeight: 700,
              color: C.text3, background: "rgba(255,255,255,0.04)",
              border: `1px solid ${C.border}`,
              padding: "2px 6px", borderRadius: 4,
              letterSpacing: "0.06em", textTransform: "uppercase" as const,
            }}>Core</span>
          )}
        </div>
        <Badge color={rating.color}>
          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: rating.color }}/>
          {rating.label}
        </Badge>
      </div>

      {/* Metric name */}
      <div style={{ fontSize: 12, color: C.text3, lineHeight: 1.35, marginBottom: 14, minHeight: 32 }}>
        {meta.name}
      </div>

      {/* Big p75 */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
        <span style={{
          fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
          fontSize: 36, lineHeight: 1,
          color: rating.color, letterSpacing: "-0.025em",
          fontVariantNumeric: "tabular-nums" as const,
        }}>
          {fmtP75Value(current.p75, current.unit)}
        </span>
        <span style={{ fontSize: 14, color: C.text3, fontWeight: 500 }}>
          {fmtP75Unit(current.p75, current.unit)}
        </span>
        <span style={{ fontSize: 10.5, color: C.text4, marginLeft: "auto", fontFamily: "monospace" }}>p75</span>
      </div>

      {/* Sparkline + trend */}
      <div style={{ paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
        {history ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <Sparkline
              ts={history.timeseries}
              color={rating.color}
              w={130} h={36}
              uid={`cwv-${metricKey}`}
            />
            <TrendChip trend={history.trend} delta={history.delta_pct}/>
          </div>
        ) : (
          <div style={{ fontSize: 11, color: C.text4, fontStyle: "italic", display: "flex", alignItems: "center", gap: 6 }}>
            <IconInfo size={11}/> Sin historial disponible
          </div>
        )}
      </div>
    </div>
  );
}
