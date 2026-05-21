"use client";

import type { LabsData } from "@/types/dashboard";
import { G, AM, OR, RD, C, Card, SectionTitle } from "./shared";

export function DifficultyBuckets({ buckets }: { buckets: LabsData["difficulty_buckets"] }) {
  const items = [
    { key: "easy",      label: "Fácil",       range: "0-29",  value: buckets.easy      ?? 0, color: G  },
    { key: "medium",    label: "Media",       range: "30-49", value: buckets.medium    ?? 0, color: AM },
    { key: "hard",      label: "Difícil",     range: "50-69", value: buckets.hard      ?? 0, color: OR },
    { key: "very_hard", label: "Muy difícil", range: "70+",   value: buckets.very_hard ?? 0, color: RD },
  ];
  const total = items.reduce((s, i) => s + i.value, 0);

  return (
    <Card style={{ padding: 24, height: "100%" }}>
      <SectionTitle title="Dificultad de ranking" sub="Cuán difícil es posicionar cada keyword" />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map(s => {
          const pct = total > 0 ? (s.value / total) * 100 : 0;
          return (
            <div key={s.key}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                  <span style={{ fontSize: 12.5, color: C.text2, fontWeight: 500 }}>{s.label}</span>
                  <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 10.5, color: C.text3 }}>{s.range}</span>
                </div>
                <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12, color: C.text, fontWeight: 600 }}>
                  {s.value}{" "}
                  <span style={{ color: C.text3, fontWeight: 400 }}>· {pct.toFixed(0)}%</span>
                </span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 999, height: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{
                  width: `${pct}%`, height: "100%",
                  background: `linear-gradient(90deg, ${s.color}cc, ${s.color})`,
                  borderRadius: 999, boxShadow: `0 0 12px ${s.color}40`,
                  transition: "width 0.6s cubic-bezier(0.2,0.9,0.3,1)",
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
