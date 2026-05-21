"use client";

import type { OnPageData } from "@/types/dashboard";
import { G, Gs, Gb, C, RD, AM, Card, Badge, SectionTitle, IconAlert, IconWarn } from "./shared";

const SIZES:   Record<string, number> = { h1: 22, h2: 17, h3: 14, h4: 12 };
const INDENTS: Record<string, number> = { h1: 0,  h2: 20, h3: 40, h4: 60 };
const TONES:   Record<string, string> = { h1: G,  h2: C.text, h3: C.text2, h4: C.text3 };

export function HeadingsHierarchy({
  headings, headingsCount,
}: {
  headings: OnPageData["headings"];
  headingsCount: OnPageData["headings_count"];
}) {
  const rows: Array<{ level: string; text: string }> = [];
  (["h1", "h2", "h3", "h4"] as const).forEach(level => {
    (headings[level] ?? []).forEach(text => rows.push({ level, text }));
  });

  return (
    <Card style={{ padding: 24, height: "100%" }}>
      <SectionTitle
        title="Jerarquía de headings"
        sub="Estructura semántica de la página"
        right={
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(["h1", "h2", "h3", "h4", "h5", "h6"] as const).map(l => (
              <Badge
                key={l}
                tone={
                  headingsCount[l] === 0 ? "default"
                  : l === "h1" && headingsCount[l] !== 1 ? "red"
                  : "default"
                }
                style={{ fontFamily: "var(--font-mono), monospace" }}
              >
                {l.toUpperCase()} {headingsCount[l]}
              </Badge>
            ))}
          </div>
        }
      />

      {headingsCount.h1 === 0 && (
        <div style={{
          marginBottom: 14, padding: "10px 14px", borderRadius: 9,
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.25)",
          color: RD, fontSize: 12.5,
          display: "inline-flex", alignItems: "center", gap: 8,
        }}>
          <IconAlert size={14} />
          La página no contiene H1 — Google necesita al menos uno
        </div>
      )}
      {headingsCount.h1 > 1 && (
        <div style={{
          marginBottom: 14, padding: "10px 14px", borderRadius: 9,
          background: "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.25)",
          color: AM, fontSize: 12.5,
          display: "inline-flex", alignItems: "center", gap: 8,
        }}>
          <IconWarn size={14} />
          Múltiples H1 detectados — usar solo uno por página
        </div>
      )}

      <div style={{
        background: "rgba(0,0,0,0.25)",
        border: `1px solid ${C.border}`,
        borderRadius: 12, padding: 16,
      }}>
        {rows.length === 0 ? (
          <div style={{ color: C.text3, fontSize: 13, textAlign: "center", padding: 24 }}>
            No se detectaron headings.
          </div>
        ) : rows.map((row, i) => {
          const indent = INDENTS[row.level] ?? 0;
          const isH1 = row.level === "h1";
          return (
            <div key={i} style={{ position: "relative", paddingLeft: indent, marginBottom: 8 }}>
              {!isH1 && (
                <div style={{
                  position: "absolute", left: indent - 12, top: 0, bottom: "50%",
                  width: 1, background: "rgba(255,255,255,0.1)",
                }} />
              )}
              {!isH1 && (
                <div style={{
                  position: "absolute", left: indent - 12, top: "50%",
                  width: 8, height: 1, background: "rgba(255,255,255,0.1)",
                }} />
              )}
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 10, color: TONES[row.level] ?? C.text3, fontWeight: 700,
                  background: isH1 ? Gs : "rgba(255,255,255,0.04)",
                  border: isH1 ? `1px solid ${Gb}` : `1px solid ${C.border}`,
                  padding: "1px 5px", borderRadius: 4, flexShrink: 0,
                }}>
                  {row.level.toUpperCase()}
                </span>
                <span style={{
                  fontFamily: isH1 ? "var(--font-syne), sans-serif" : "var(--font-inter), sans-serif",
                  fontSize: SIZES[row.level] ?? 12,
                  fontWeight: isH1 ? 700 : row.level === "h2" ? 600 : 500,
                  color: TONES[row.level] ?? C.text3,
                  letterSpacing: isH1 ? "-0.015em" : 0,
                  lineHeight: 1.3,
                }}>
                  {row.text || <em style={{ color: C.text4 }}>(vacío)</em>}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
