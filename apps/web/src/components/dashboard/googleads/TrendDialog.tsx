"use client";

import { useEffect } from "react";
import type { KeywordDataItem } from "@/types/dashboard";
import { G, RD, C, COMP_META, fmtCompact, usd, Badge, AreaChart, IconX, type Tone } from "./shared";

export function TrendDialog({ kw, onClose }: { kw: KeywordDataItem | null; onClose: () => void }) {
  useEffect(() => {
    if (!kw) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [kw, onClose]);

  if (!kw) return null;

  const chartData = kw.monthly_searches.map(m => ({
    year_month: `${m.year}-${String(m.month).padStart(2, "0")}`,
    search_volume: m.search_volume,
  }));
  const vols   = kw.monthly_searches.map(m => m.search_volume);
  const peak   = Math.max(...vols);
  const trough = Math.min(...vols);
  const avg    = Math.round(vols.reduce((s, v) => s + v, 0) / vols.length);

  return (
    <div onClick={onClose} style={{
      position: "fixed" as const, inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#0f0f0f", border: `1px solid ${C.borderStr}`,
        borderRadius: 18, padding: 28, width: "100%", maxWidth: 880,
        boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 17, marginBottom: 4 }}>
              Tendencia detallada
            </div>
            <h2 style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 22, color: C.text, letterSpacing: "-0.015em" }}>
              &ldquo;{kw.keyword}&rdquo;
            </h2>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`,
            color: C.text2, width: 32, height: 32, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}><IconX size={15}/></button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 22 }}>
          {[
            { label: "Volumen",   value: fmtCompact(kw.search_volume), color: C.text  },
            { label: "Pico 12m",  value: fmtCompact(peak),             color: G       },
            { label: "Valle 12m", value: fmtCompact(trough),           color: RD      },
            { label: "Promedio",  value: fmtCompact(avg),              color: C.text2 },
          ].map((s, i) => (
            <div key={i} style={{
              padding: "12px 14px", borderRadius: 10,
              background: "rgba(255,255,255,0.025)", border: `1px solid ${C.border}`,
            }}>
              <div style={{ fontSize: 10.5, color: C.text3, letterSpacing: "0.06em", textTransform: "uppercase" as const, fontWeight: 600 }}>
                {s.label}
              </div>
              <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 20, color: s.color, marginTop: 4 }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        <AreaChart data={chartData} height={280} gradId="gads-dialog-area"/>

        <div style={{
          marginTop: 18, padding: "14px 16px",
          background: "rgba(255,255,255,0.025)", border: `1px solid ${C.border}`, borderRadius: 12,
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" as const,
        }}>
          <div>
            <div style={{ fontSize: 11, color: C.text3, letterSpacing: "0.06em", textTransform: "uppercase" as const, fontWeight: 600, marginBottom: 4 }}>
              CPC y rango de puja
            </div>
            <div style={{ fontSize: 13, color: C.text2 }}>
              CPC medio <strong style={{ color: C.text }}>{usd(kw.cpc)}</strong>
              {" · puja "}
              <span style={{ color: G, fontFamily: "monospace" }}>{usd(kw.low_top_of_page_bid)}</span>
              {" → "}
              <span style={{ color: RD, fontFamily: "monospace" }}>{usd(kw.high_top_of_page_bid)}</span>
            </div>
          </div>
          {kw.competition && COMP_META[kw.competition] && (
            <Badge tone={COMP_META[kw.competition].tone as Tone}>
              Competencia {COMP_META[kw.competition].label} · idx {kw.competition_index}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
