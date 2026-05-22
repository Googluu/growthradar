"use client";

import { useState } from "react";
import type { CrUXData, CrUXHistoryData } from "@/types/dashboard";
import { C, EG, METRIC_ORDER, Badge, PerfScore, fmtDate, IconMobile, IconMonitor } from "./crux/shared";
import { CWVAssessmentHero } from "./crux/CWVAssessmentHero";
import { MetricCard }        from "./crux/MetricCard";
import { MetricDialog }      from "./crux/MetricDialog";
import { OriginFooter }      from "./crux/OriginFooter";
import { NoDataFallback }    from "./crux/NoDataFallback";

export function CoreWebVitalsSection({
  current,
  history,
}: {
  current: CrUXData | null;
  history: CrUXHistoryData | null;
}) {
  const [open, setOpen] = useState<string | null>(null);

  if (!current && !history) return <NoDataFallback/>;

  const currentMetric = open && current
    ? current.metrics[open as keyof CrUXData["metrics"]]
    : null;
  const historyMetric = open && history
    ? history.metrics[open as keyof CrUXHistoryData["metrics"]]
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header */}
      <header style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        gap: 24, flexWrap: "wrap" as const,
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ fontFamily: "var(--font-caveat), cursive", color: EG, fontSize: 18 }}>
              Datos reales de usuarios
            </div>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.text4 }}/>
            <div style={{ fontSize: 12, color: C.text3 }}>Chrome UX Report (CrUX)</div>
          </div>
          <h1 style={{
            fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
            fontSize: "clamp(28px, 4vw, 40px)", lineHeight: 1.05,
            color: C.text, letterSpacing: "-0.025em", marginBottom: 10,
          }}>
            Core Web Vitals
          </h1>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" as const }}>
            {current?.collection_period && (
              <span style={{ fontSize: 13, color: C.text3 }}>
                Período:{" "}
                <strong style={{ color: C.text2, fontFamily: "monospace", fontWeight: 600 }}>
                  {fmtDate(current.collection_period.from)} → {fmtDate(current.collection_period.to)}
                </strong>
              </span>
            )}
            {current?.form_factor && (
              <Badge color={EG}>
                {current.form_factor === "PHONE" ? <IconMobile size={11}/> : <IconMonitor size={11}/>}
                {current.form_factor === "PHONE" ? "Móvil" : "Escritorio"}
              </Badge>
            )}
          </div>
        </div>
        {current && <PerfScore score={current.performance_score}/>}
      </header>

      {/* PASA / NO PASA assessment */}
      {current && <CWVAssessmentHero current={current}/>}

      {/* 3-col metric grid (5 cards, last row has 2 + 1 empty) */}
      {current && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {METRIC_ORDER.map(key => (
            <MetricCard
              key={key}
              metricKey={key}
              current={current.metrics[key]}
              history={history?.metrics[key]}
              onClick={() => setOpen(key)}
            />
          ))}
        </div>
      )}

      {/* Origin + history period footer */}
      {current && <OriginFooter current={current} history={history}/>}

      {/* Metric detail dialog */}
      <MetricDialog
        open={open != null}
        metricKey={open}
        current={currentMetric ?? null}
        history={historyMetric ?? null}
        onClose={() => setOpen(null)}
      />
    </div>
  );
}
