"use client";

import { useState } from "react";
import { G, C, COMP_META, Card, SectionTitle } from "./shared";

export function CompetitionDonut({ dist }: { dist: Record<string, number> }) {
  const [hover, setHover] = useState<number | null>(null);
  const entries = ["LOW", "MEDIUM", "HIGH"].map(k => ({ key: k, value: dist[k] || 0, ...COMP_META[k] }));
  const total = entries.reduce((s, e) => s + e.value, 0);
  const cx = 90, cy = 90, r = 72, ir = 48;
  let angle = -Math.PI / 2;

  const arcs = entries.filter(e => e.value > 0).map(e => {
    const a0 = angle;
    const a1 = angle + (e.value / total) * Math.PI * 2;
    angle = a1;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const x0 = cx + Math.cos(a0) * r,  y0 = cy + Math.sin(a0) * r;
    const x1 = cx + Math.cos(a1) * r,  y1 = cy + Math.sin(a1) * r;
    const xi0 = cx + Math.cos(a0) * ir, yi0 = cy + Math.sin(a0) * ir;
    const xi1 = cx + Math.cos(a1) * ir, yi1 = cy + Math.sin(a1) * ir;
    return { ...e, d: `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} L ${xi1} ${yi1} A ${ir} ${ir} 0 ${large} 0 ${xi0} ${yi0} Z` };
  });

  const current = hover != null ? entries[hover] : null;

  return (
    <Card style={{ padding: 24, height: "100%" }}>
      <SectionTitle title="Distribución de competencia" sub="Nivel de competencia publicitaria por keyword"/>
      <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" as const }}>
        <div style={{ position: "relative" as const, width: 180, height: 180, flexShrink: 0 }}>
          <svg width="180" height="180" viewBox="0 0 180 180">
            {arcs.map(a => (
              <path key={a.key} d={a.d} fill={a.color}
                fillOpacity={hover == null || entries[hover]?.key === a.key ? 1 : 0.25}
                stroke={C.bg} strokeWidth="2"
                onMouseEnter={() => setHover(entries.findIndex(e => e.key === a.key))}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: "pointer", transition: "fill-opacity 0.15s" }}/>
            ))}
          </svg>
          <div style={{
            position: "absolute" as const, inset: 0,
            display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center",
            pointerEvents: "none" as const,
          }}>
            <div style={{ fontSize: 11, color: C.text3, fontWeight: 500, marginBottom: 2 }}>
              {current ? current.label : "Total"}
            </div>
            <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 800, fontSize: 30, color: C.text }}>
              {current ? current.value : total}
            </div>
            <div style={{ fontSize: 10.5, color: C.text3 }}>keywords</div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 160, display: "flex", flexDirection: "column" as const, gap: 8 }}>
          {entries.map((e, i) => (
            <div key={e.key}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", borderRadius: 8,
                background: hover === i ? "rgba(255,255,255,0.04)" : "transparent",
                cursor: "default",
              }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: e.color, flexShrink: 0 }}/>
              <span style={{ flex: 1, fontSize: 13, color: C.text2, fontWeight: 500 }}>{e.label}</span>
              <span style={{ fontFamily: "monospace", fontSize: 13, color: C.text, fontWeight: 600 }}>{e.value}</span>
              <span style={{ fontSize: 11, color: C.text3, minWidth: 38, textAlign: "right" as const }}>
                {total ? ((e.value / total) * 100).toFixed(0) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
