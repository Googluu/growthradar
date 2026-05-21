"use client";

import type { OnPageData } from "@/types/dashboard";
import { C, AM, BL, PR, fmtBytes, Card, Badge, SectionTitle, IconCode, IconBrush, IconImg, IconLayers, IconWarn } from "./shared";

export function ResourcesBar({
  rb, pageSize,
}: {
  rb: OnPageData["resources_breakdown"];
  pageSize: number;
}) {
  const segs = [
    { key: "scripts",     label: "Scripts",     count: rb.scripts_count,     size: rb.scripts_size,     color: AM, icon: <IconCode size={13} /> },
    { key: "stylesheets", label: "Stylesheets", count: rb.stylesheets_count, size: rb.stylesheets_size, color: PR, icon: <IconBrush size={13} /> },
    { key: "images",      label: "Imágenes",    count: rb.images_count,      size: rb.images_size,      color: BL, icon: <IconImg size={13} /> },
  ];

  const known = segs.reduce((s, x) => s + x.size, 0);
  const other = Math.max(0, pageSize - known);
  const otherColor = "rgba(255,255,255,0.18)";
  if (other > 0) {
    segs.push({ key: "other", label: "Otros", count: 0, size: other, color: otherColor, icon: <IconLayers size={13} /> });
  }
  const total = segs.reduce((s, x) => s + x.size, 0);
  const sizeTone = pageSize > 2_000_000 ? "red" as const : pageSize > 1_000_000 ? "amber" as const : "green" as const;

  return (
    <Card style={{ padding: 24 }}>
      <SectionTitle
        kicker="Recursos"
        title="Peso de la página"
        sub={`Total ${fmtBytes(pageSize)} — desglose por tipo de recurso`}
        right={
          <Badge tone={sizeTone}>
            {pageSize > 2_000_000 ? "Pesada" : pageSize > 1_000_000 ? "Moderada" : "Ligera"}
          </Badge>
        }
      />

      {/* Stacked bar */}
      <div style={{
        display: "flex", width: "100%", height: 40,
        borderRadius: 10, overflow: "hidden",
        border: `1px solid ${C.border}`, marginBottom: 18,
      }}>
        {segs.map((s, i) => {
          const pct = total > 0 ? (s.size / total) * 100 : 0;
          if (pct < 0.5) return null;
          const isOther = s.color === otherColor;
          return (
            <div
              key={s.key}
              title={`${s.label}: ${fmtBytes(s.size)} (${pct.toFixed(1)}%)`}
              style={{
                width: `${pct}%`,
                background: isOther ? s.color : `linear-gradient(180deg, ${s.color}, ${s.color}cc)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: isOther ? C.text : C.bg,
                fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 12,
                borderRight: i < segs.length - 1 ? "1px solid rgba(0,0,0,0.2)" : "none",
                whiteSpace: "nowrap",
              }}
            >
              {pct >= 7 ? `${pct.toFixed(0)}%` : ""}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
        {segs.map(s => {
          const isOther = s.color === otherColor;
          return (
            <div key={s.key} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 10,
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${C.border}`,
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: isOther ? "rgba(255,255,255,0.06)" : `${s.color}22`,
                color: isOther ? C.text3 : s.color,
                border: `1px solid ${isOther ? C.border : `${s.color}55`}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>{s.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontSize: 12.5, color: C.text, fontWeight: 600 }}>{s.label}</span>
                  {s.count > 0 && (
                    <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 10.5, color: C.text3 }}>
                      ×{s.count}
                    </span>
                  )}
                </div>
                <div style={{
                  fontFamily: "var(--font-mono), monospace", fontSize: 12, color: C.text2, marginTop: 2,
                }}>{fmtBytes(s.size)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {(rb.render_blocking_scripts_count + rb.render_blocking_stylesheets_count) > 0 && (() => {
        const totalBlocking = rb.render_blocking_scripts_count + rb.render_blocking_stylesheets_count;
        const parts = [
          rb.render_blocking_scripts_count > 0 && `${rb.render_blocking_scripts_count} scripts`,
          rb.render_blocking_stylesheets_count > 0 && `${rb.render_blocking_stylesheets_count} stylesheets`,
        ].filter(Boolean).join(" + ");
        return (
          <div style={{
            marginTop: 14, padding: "10px 14px", borderRadius: 9,
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.25)",
            color: AM, fontSize: 12.5,
            display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            <IconWarn size={14} />
            <strong style={{ fontWeight: 600 }}>{parts} ({totalBlocking} recursos)</strong>
            <span style={{ color: "rgba(245,158,11,0.85)" }}>bloquean el renderizado inicial</span>
          </div>
        );
      })()}
    </Card>
  );
}
