"use client";

import type { OnPageData } from "@/types/dashboard";
import { G, C, Card, IconDollar, IconClock, IconExternal } from "./shared";

export function OpsFooter({ data }: { data: OnPageData }) {
  return (
    <Card style={{ padding: "16px 22px", marginTop: 36 }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", gap: 24, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap" }}>
          {data.cost != null && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.text3, fontSize: 12 }}>
              <IconDollar size={14} />
              <span style={{ color: C.text2, fontFamily: "var(--font-mono), monospace" }}>
                ${data.cost.toFixed(4)} USD
              </span>
              <span>· costo del análisis</span>
            </div>
          )}
          {data.task_time && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.text3, fontSize: 12 }}>
              <IconClock size={14} />
              <span style={{ color: C.text2, fontFamily: "var(--font-mono), monospace" }}>
                {data.task_time}
              </span>
              <span>· tiempo de respuesta</span>
            </div>
          )}
        </div>
        <a
          href={data.url}
          target="_blank" rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: G, color: C.bg, border: "none",
            fontFamily: "var(--font-inter), sans-serif",
            fontWeight: 700, fontSize: 13, padding: "10px 18px",
            borderRadius: 9, cursor: "pointer",
            textDecoration: "none", transition: "all 0.15s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 6px 20px ${G}40`;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
          }}
        >
          Abrir página <IconExternal size={13} />
        </a>
      </div>
    </Card>
  );
}
