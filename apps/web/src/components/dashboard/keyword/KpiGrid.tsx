"use client";

import type { LabsData } from "@/types/dashboard";
import {
  G, Gs, Gb, C,
  fmtCompact, fmtUsd, diffColor,
  Card, IconTrendUp, IconDollar, IconGauge, IconTraffic,
} from "./shared";

export function KpiGrid({ data }: { data: LabsData }) {
  const dc = diffColor(data.avg_difficulty);
  const diffLabel = data.avg_difficulty < 30 ? "fácil"
    : data.avg_difficulty < 50 ? "moderada"
    : data.avg_difficulty < 70 ? "difícil"
    : "muy difícil";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>

      {/* Volumen Total */}
      <Card style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12, minHeight: 148 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.06)", color: C.text2, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${C.border}` }}>
            <IconTrendUp size={18} />
          </div>
          <div style={{ fontSize: 10.5, color: C.text3, letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 600, textAlign: "right" }}>Volumen Total</div>
        </div>
        <div style={{ marginTop: "auto" }}>
          <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 800, fontSize: 34, lineHeight: 1, color: C.text, letterSpacing: "-0.02em" }}>
            {fmtCompact(data.total_search_volume)}
          </div>
          <div style={{ fontSize: 12, color: C.text3, marginTop: 6 }}>búsquedas / mes · {data.items_count} keywords</div>
        </div>
      </Card>

      {/* CPC Promedio */}
      <Card style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12, minHeight: 148 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.06)", color: C.text2, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${C.border}` }}>
            <IconDollar size={18} />
          </div>
          <div style={{ fontSize: 10.5, color: C.text3, letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 600, textAlign: "right" }}>CPC Promedio</div>
        </div>
        <div style={{ marginTop: "auto" }}>
          <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 800, fontSize: 34, lineHeight: 1, color: C.text, letterSpacing: "-0.02em" }}>
            {fmtUsd(data.avg_cpc)}
          </div>
          <div style={{ fontSize: 12, color: C.text3, marginTop: 6 }}>costo por clic en Google Ads</div>
        </div>
      </Card>

      {/* Dificultad Promedio */}
      <Card style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12, minHeight: 148 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.06)", color: C.text2, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${C.border}` }}>
            <IconGauge size={18} />
          </div>
          <div style={{ fontSize: 10.5, color: C.text3, letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 600, textAlign: "right" }}>Dificultad Promedio</div>
        </div>
        <div style={{ marginTop: "auto" }}>
          <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 800, fontSize: 34, lineHeight: 1, color: C.text, letterSpacing: "-0.02em" }}>
            {data.avg_difficulty}
          </div>
          <div style={{ fontSize: 12, color: C.text3, marginTop: 6 }}>/ 100 — {diffLabel}</div>
          <div style={{ marginTop: 10, background: "rgba(255,255,255,0.05)", borderRadius: 999, height: 6, overflow: "hidden" }}>
            <div style={{
              width: `${data.avg_difficulty}%`, height: "100%",
              background: `linear-gradient(90deg, ${dc}cc, ${dc})`,
              borderRadius: 999, transition: "width 0.6s cubic-bezier(0.2,0.9,0.3,1)",
            }} />
          </div>
        </div>
      </Card>

      {/* Valor de Tráfico */}
      <Card accent style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12, minHeight: 148 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: Gs, color: G, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${Gb}` }}>
            <IconTraffic size={18} />
          </div>
          <div style={{ fontSize: 10.5, color: C.text3, letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 600, textAlign: "right" }}>Valor de Tráfico</div>
        </div>
        <div style={{ marginTop: "auto" }}>
          <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 800, fontSize: 34, lineHeight: 1, color: G, letterSpacing: "-0.02em" }}>
            {fmtUsd(data.estimated_traffic_value_usd)}
          </div>
          <div style={{ fontSize: 12, color: C.text3, marginTop: 6 }}>estimación mensual en USD</div>
        </div>
      </Card>

    </div>
  );
}
