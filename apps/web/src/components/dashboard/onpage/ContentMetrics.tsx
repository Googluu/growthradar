"use client";

import type { OnPageData } from "@/types/dashboard";
import { G, Gs, Gb, C, RD, AM, Card, Badge, SectionTitle, IconText, IconWarn } from "./shared";

// ── ConsistencyBar ─────────────────────────────────────────────────────────────
function ConsistencyBar({ label, value }: { label: string; value: number | null }) {
  const pct = value == null ? null : Math.round(value * 100);
  const color = pct == null ? C.text4 : pct >= 70 ? G : pct >= 40 ? AM : RD;

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 12.5, color: C.text2, fontWeight: 500 }}>{label}</span>
        <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12, color, fontWeight: 600 }}>
          {pct == null ? "—" : `${pct}%`}
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
        {pct != null && (
          <div style={{
            width: `${Math.min(pct, 100)}%`, height: "100%",
            background: `linear-gradient(90deg, ${color}cc, ${color})`,
            borderRadius: 999,
            transition: "width 0.6s cubic-bezier(0.2,0.9,0.3,1)",
          }} />
        )}
      </div>
    </div>
  );
}

// ── ContentMetrics ─────────────────────────────────────────────────────────────
export function ContentMetrics({ content }: { content: OnPageData["content"] }) {
  const wc  = content.plain_text_word_count ?? 0;
  const fk  = content.flesch_kincaid_readability_index; // 0-100, higher = easier
  const isLow = wc < 300;

  // Flesch-Kincaid Reading Ease: 90-100 very easy, 60-70 plain English, 0-30 very difficult
  const readLabel = fk == null ? "—"
    : fk >= 70 ? "Muy fácil"
    : fk >= 60 ? "Plain English"
    : fk >= 30 ? "Difícil"
    : "Muy difícil";

  const readColor = fk == null ? C.text4
    : fk >= 60 ? G
    : fk >= 30 ? AM
    : RD;

  return (
    <Card style={{ padding: 24, height: "100%" }}>
      <SectionTitle title="Contenido" sub="Análisis lingüístico y métricas de texto" />

      {/* Word count */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: isLow ? "rgba(239,68,68,0.15)" : Gs,
          border: `1px solid ${isLow ? "rgba(239,68,68,0.35)" : Gb}`,
          color: isLow ? RD : G,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <IconText size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 11, color: C.text3, letterSpacing: "0.06em",
            textTransform: "uppercase", fontWeight: 600,
          }}>Palabras</div>
          <div style={{
            fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
            fontSize: 28, color: isLow ? RD : C.text, lineHeight: 1.1,
          }}>{wc}</div>
        </div>
        {isLow && <Badge tone="red"><IconWarn size={11} /> Bajo</Badge>}
      </div>

      {/* Flesch-Kincaid readability bar */}
      {fk != null && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: C.text2, fontWeight: 500 }}>
              Legibilidad (Flesch)
            </span>
            <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 14, color: readColor, fontWeight: 600 }}>
              {fk.toFixed(0)}
            </span>
          </div>
          <div style={{
            height: 8, borderRadius: 999, background: "rgba(255,255,255,0.05)",
            overflow: "hidden", position: "relative",
          }}>
            {/* Markers at 30 (very difficult→difficult) and 60 (difficult→plain English) */}
            <div style={{ position: "absolute", left: "30%", top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.15)" }} />
            <div style={{ position: "absolute", left: "60%", top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.15)" }} />
            <div style={{
              width: `${Math.min(fk, 100)}%`, height: "100%",
              background: `linear-gradient(90deg, ${readColor}cc, ${readColor})`,
              borderRadius: 999,
              boxShadow: `0 0 12px ${readColor}40`,
            }} />
          </div>
          <div style={{
            display: "flex", justifyContent: "space-between", marginTop: 6,
            fontSize: 10, color: C.text3, fontFamily: "var(--font-mono), monospace",
          }}>
            <span>Muy difícil</span>
            <span>Plain English</span>
            <span>Muy fácil</span>
          </div>
          <div style={{
            marginTop: 10, fontSize: 12, color: readColor, fontWeight: 600,
            display: "inline-flex", alignItems: "center", gap: 6,
          }}>{readLabel}</div>
        </div>
      )}

      {/* Consistency bars (returned by DataForSEO) */}
      <ConsistencyBar
        label="Consistencia título ↔ contenido"
        value={content.title_to_content_consistency}
      />
      <ConsistencyBar
        label="Consistencia descripción ↔ contenido"
        value={content.description_to_content_consistency}
      />
    </Card>
  );
}
