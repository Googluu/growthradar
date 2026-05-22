"use client";

import type { CrUXData } from "@/types/dashboard";
import { C, RATING, METRIC_META, fmtMetric, IconCheck, IconXCircle } from "./shared";

export function CWVAssessmentHero({ current }: { current: CrUXData }) {
  const cores = [
    { key: "largest_contentful_paint",  m: current.metrics.largest_contentful_paint  },
    { key: "interaction_to_next_paint", m: current.metrics.interaction_to_next_paint },
    { key: "cumulative_layout_shift",   m: current.metrics.cumulative_layout_shift   },
  ];

  const failures = cores.filter(c => c.m.rating === "poor").length;
  const passing  = failures === 0;
  const hasUnknown = cores.some(c => c.m.rating === "no_data");
  const heroColor  = passing ? C.cwvGood : C.cwvPoor;

  return (
    <div style={{
      padding: 28, borderRadius: 16,
      background: `linear-gradient(180deg, ${heroColor}10, ${C.card})`,
      border: `1px solid ${heroColor}40`,
      position: "relative" as const, overflow: "hidden" as const,
    }}>
      {/* glow */}
      <div style={{
        position: "absolute" as const, top: -100, left: -100,
        width: 320, height: 320,
        background: `radial-gradient(circle, ${heroColor}22, transparent 70%)`,
        pointerEvents: "none",
      }}/>

      <div style={{
        display: "flex", alignItems: "center", gap: 24,
        position: "relative" as const, flexWrap: "wrap" as const,
      }}>
        {/* Icon + verdict */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, flex: 1, minWidth: 280 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 18,
            background: `${heroColor}20`, border: `1px solid ${heroColor}50`,
            color: heroColor, display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, boxShadow: `0 0 32px ${heroColor}30`,
          }}>
            {passing ? <IconCheck size={42} sw={2}/> : <IconXCircle size={42} sw={2}/>}
          </div>
          <div>
            <div style={{
              fontSize: 11, color: C.text3, fontWeight: 600,
              letterSpacing: "0.07em", textTransform: "uppercase" as const, marginBottom: 4,
            }}>
              Veredicto · Web Vitals Assessment
            </div>
            <h2 style={{
              fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
              fontSize: "clamp(22px, 3vw, 30px)", lineHeight: 1.1,
              color: heroColor, letterSpacing: "-0.02em",
            }}>
              {passing ? "PASA" : "NO PASA"} Core Web Vitals
            </h2>
            <p style={{ fontSize: 13, color: C.text2, marginTop: 6, maxWidth: 480 }}>
              {passing
                ? "Tu sitio cumple con los umbrales de Google para experiencia de usuario en los 3 indicadores principales."
                : `${failures} de 3 métricas centrales están en estado "Pobre". Google penaliza esto en ranking móvil.`}
              {hasUnknown && " Algunas métricas no tienen datos suficientes en CrUX."}
            </p>
          </div>
        </div>

        {/* 3 core metric pills */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}>
          {cores.map(c => {
            const r = RATING[c.m.rating] ?? RATING.no_data;
            const short = METRIC_META[c.key].short;
            return (
              <div key={c.key} style={{
                padding: "12px 16px",
                background: "rgba(0,0,0,0.3)",
                border: `1px solid ${r.color}40`,
                borderRadius: 12,
                display: "flex", flexDirection: "column" as const, gap: 4,
                minWidth: 100,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: C.text3, fontWeight: 600 }}>{short}</span>
                  <span style={{
                    display: "block", width: 8, height: 8, borderRadius: "50%",
                    background: r.color, boxShadow: `0 0 6px ${r.color}`,
                  }}/>
                </div>
                <div style={{
                  fontFamily: "var(--font-syne), sans-serif", fontWeight: 700,
                  fontSize: 20, color: r.color, lineHeight: 1, letterSpacing: "-0.01em",
                }}>
                  {fmtMetric(c.m.p75, c.m.unit)}
                </div>
                <div style={{ fontSize: 10.5, color: r.color, fontWeight: 500, letterSpacing: "0.02em" }}>
                  {r.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
