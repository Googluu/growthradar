"use client";

import type { KeywordData } from "@/types/dashboard";
import { G, C, Gb, Card, IconDollar, IconClock, IconLayers, IconExternal } from "./shared";

export function OpsFooter({ data }: { data: KeywordData }) {
  return (
    <Card style={{ padding: "16px 22px" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 24, flexWrap: "wrap" as const,
      }}>
        <div style={{ display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap" as const }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.text3, fontSize: 12 }}>
            <IconDollar size={14}/>
            <span style={{ color: C.text2, fontFamily: "monospace" }}>${data.cost.toFixed(4)} USD</span>
            <span>· costo del análisis</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.text3, fontSize: 12 }}>
            <IconClock size={14}/>
            <span style={{ color: C.text2, fontFamily: "monospace" }}>{data.task_time}</span>
            <span>· tiempo de respuesta</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.text3, fontSize: 12 }}>
            <IconLayers size={14}/>
            <span style={{ color: C.text2, fontFamily: "monospace" }}>{data.keywords_count}</span>
            <span>· keywords con datos de volumen</span>
          </div>
        </div>
        <button style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: G, color: C.bg, border: "none",
          fontWeight: 700, fontSize: 13, padding: "10px 18px",
          borderRadius: 9, cursor: "pointer",
        }}
        onMouseEnter={e => { const b = e.currentTarget; b.style.transform = "translateY(-1px)"; b.style.boxShadow = `0 6px 20px ${Gb}`; }}
        onMouseLeave={e => { const b = e.currentTarget; b.style.transform = "translateY(0)"; b.style.boxShadow = "none"; }}>
          Exportar a Google Ads <IconExternal size={13}/>
        </button>
      </div>
    </Card>
  );
}
