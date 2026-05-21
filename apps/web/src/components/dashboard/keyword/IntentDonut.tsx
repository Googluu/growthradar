"use client";

import { useState } from "react";
import { C, INTENT_META, Card, SectionTitle } from "./shared";

export function IntentDonut({ dist }: { dist: Record<string, number> }) {
  const entries = Object.entries(dist)
    .map(([k, v]) => ({ key: k, value: v, ...(INTENT_META[k] ?? { label: k, icon: "•", color: C.text3 }) }))
    .filter(e => e.value > 0);
  const total = entries.reduce((s, e) => s + e.value, 0);
  const [hover, setHover] = useState<number | null>(null);

  const cx = 90, cy = 90, r = 70, ir = 46;
  let angle = -Math.PI / 2;

  const arcs = entries.map(e => {
    const a0 = angle;
    const a1 = angle + (e.value / total) * Math.PI * 2;
    angle = a1;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const x0 = cx + Math.cos(a0) * r,  y0 = cy + Math.sin(a0) * r;
    const x1 = cx + Math.cos(a1) * r,  y1 = cy + Math.sin(a1) * r;
    const xi0 = cx + Math.cos(a0) * ir, yi0 = cy + Math.sin(a0) * ir;
    const xi1 = cx + Math.cos(a1) * ir, yi1 = cy + Math.sin(a1) * ir;
    return {
      ...e,
      d: `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} L ${xi1} ${yi1} A ${ir} ${ir} 0 ${large} 0 ${xi0} ${yi0} Z`,
    };
  });

  const cur = hover != null ? entries[hover] : null;

  return (
    <Card style={{ padding: 24, height: "100%" }}>
      <SectionTitle title="Intent de búsqueda" sub="Qué quiere el usuario al buscar" />
      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>

        {/* Donut */}
        <div style={{ position: "relative", width: 180, height: 180, flexShrink: 0 }}>
          <svg width="180" height="180" viewBox="0 0 180 180">
            {arcs.map((a, i) => (
              <path key={i} d={a.d} fill={a.color}
                fillOpacity={hover == null || hover === i ? 1 : 0.3}
                stroke={C.bg} strokeWidth={2}
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
                style={{ cursor: "pointer", transition: "fill-opacity 0.15s" }} />
            ))}
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{ fontSize: 11, color: C.text3, fontWeight: 500, marginBottom: 2 }}>{cur ? cur.label : "Total"}</div>
            <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 800, fontSize: 28, color: C.text }}>{cur ? cur.value : total}</div>
            <div style={{ fontSize: 10.5, color: C.text3 }}>keywords</div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ flex: 1, minWidth: 180, display: "flex", flexDirection: "column", gap: 8 }}>
          {entries.map((e, i) => (
            <div key={e.key}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", borderRadius: 8, background: hover === i ? "rgba(255,255,255,0.04)" : "transparent", cursor: "default" }}
            >
              <span style={{ fontSize: 15 }}>{e.icon}</span>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: e.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 12.5, color: C.text2, fontWeight: 500 }}>{e.label}</span>
              <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12, color: C.text, fontWeight: 600 }}>{e.value}</span>
              <span style={{ fontSize: 10.5, color: C.text3, minWidth: 32, textAlign: "right" }}>
                {((e.value / total) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
