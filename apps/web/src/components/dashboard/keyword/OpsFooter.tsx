"use client";

import type { LabsData } from "@/types/dashboard";
import { G, C, Card, IconDollar, IconClock, IconLayers, IconExternal } from "./shared";

export function OpsFooter({ data }: { data: LabsData }) {
  return (
    <Card style={{ padding: "16px 22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.text3, fontSize: 12 }}>
            <IconDollar size={14} />
            <span style={{ color: C.text2, fontFamily: "var(--font-mono), monospace" }}>${data.cost.toFixed(4)} USD</span>
            <span>· costo del análisis</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.text3, fontSize: 12 }}>
            <IconClock size={14} />
            <span style={{ color: C.text2, fontFamily: "var(--font-mono), monospace" }}>{data.task_time}</span>
            <span>· tiempo de respuesta</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.text3, fontSize: 12 }}>
            <IconLayers size={14} />
            <span style={{ color: C.text2, fontFamily: "var(--font-mono), monospace" }}>
              {data.items_count} / {data.total_count.toLocaleString("es-CO")}
            </span>
            <span>· keywords analizadas</span>
          </div>
        </div>
        <button style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: G, color: "#0a0a0a", border: "none",
          fontWeight: 700, fontSize: 13, padding: "10px 18px",
          borderRadius: 9, cursor: "pointer", fontFamily: "inherit",
          transition: "all 0.15s",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 6px 20px ${G}40`; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
        >
          Exportar CSV <IconExternal size={13} />
        </button>
      </div>
    </Card>
  );
}
