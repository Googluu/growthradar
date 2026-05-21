"use client";

import type { LabsKeyword } from "@/types/dashboard";
import { G, Gs, Gb, C, fmtCompact, fmtUsd, Badge, Card, IconSparkle, IconTrendUp } from "./shared";

export function LowHangingFruit({ items }: { items: LabsKeyword[] }) {
  if (!items || items.length === 0) return null;

  return (
    <Card accent style={{ padding: 28, position: "relative", overflow: "hidden" }}>
      {/* Decorative glow */}
      <div style={{ position: "absolute", top: -80, right: -80, width: 240, height: 240, background: `radial-gradient(circle, ${Gs}, transparent 70%)`, pointerEvents: "none" }} />

      {/* Header */}
      <div style={{ display: "flex", gap: 16, marginBottom: 22, alignItems: "flex-start", position: "relative" }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: Gs, color: G, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${Gb}`, flexShrink: 0 }}>
          <IconSparkle size={22} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
            <h3 style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 19, color: C.text, letterSpacing: "-0.01em" }}>
              Oportunidades fáciles
            </h3>
            <Badge tone="green">Quick wins disponibles</Badge>
          </div>
          <p style={{ fontSize: 13, color: C.text3 }}>Keywords con buen volumen y baja dificultad — empieza por aquí</p>
        </div>
      </div>

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, position: "relative" }}>
        {items.map((k, i) => (
          <div key={k.keyword} style={{
            display: "grid", gridTemplateColumns: "28px 1fr auto auto auto",
            alignItems: "center", gap: 14,
            padding: "12px 16px",
            background: "rgba(255,255,255,0.025)", border: `1px solid ${C.border}`, borderRadius: 12,
          }}>
            <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: 11, color: G, fontWeight: 600 }}>
              {String(i + 1).padStart(2, "0")}
            </div>
            <div style={{ fontSize: 14, color: C.text, fontWeight: 500 }}>{k.keyword}</div>
            <Badge tone="default" style={{ fontFamily: "var(--font-mono), monospace" }}>
              <IconTrendUp size={10} /> {fmtCompact(k.search_volume)}
            </Badge>
            <Badge tone="green" style={{ fontFamily: "var(--font-mono), monospace" }}>
              KD {k.keyword_difficulty ?? "—"}
            </Badge>
            <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12, color: C.text2, minWidth: 50, textAlign: "right" }}>
              {fmtUsd(k.cpc)}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
