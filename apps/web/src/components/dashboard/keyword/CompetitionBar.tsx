"use client";

import { G, AM, RD, C, Card, SectionTitle } from "./shared";

export function CompetitionBar({ dist }: { dist: Record<string, number> }) {
  const total = Object.values(dist).reduce((a, b) => a + b, 0);
  const segs = [
    { key: "LOW",    label: "Baja",  value: dist["LOW"]    ?? 0, color: G  },
    { key: "MEDIUM", label: "Media", value: dist["MEDIUM"] ?? 0, color: AM },
    { key: "HIGH",   label: "Alta",  value: dist["HIGH"]   ?? 0, color: RD },
  ];

  return (
    <Card style={{ padding: 24, height: "100%", display: "flex", flexDirection: "column" }}>
      <SectionTitle title="Nivel de competencia" sub="Distribución del nivel de competencia publicitaria" />

      <div style={{ marginTop: "auto" }}>
        {/* Stacked bar */}
        <div style={{ display: "flex", height: 36, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}`, marginBottom: 16 }}>
          {segs.map((s, i) => (
            <div key={s.key} title={`${s.label}: ${s.value}`}
              style={{
                width: `${total > 0 ? (s.value / total) * 100 : 0}%`,
                background: `linear-gradient(180deg, ${s.color}, ${s.color}cc)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#0a0a0a", fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 14,
                borderRight: i < segs.length - 1 ? "1px solid rgba(0,0,0,0.2)" : "none",
              }}>
              {s.value >= 2 ? s.value : ""}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {segs.map(s => (
            <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: C.text2, fontWeight: 500 }}>{s.label}</span>
              <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 11.5, color: C.text3 }}>
                {total > 0 ? ((s.value / total) * 100).toFixed(0) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
