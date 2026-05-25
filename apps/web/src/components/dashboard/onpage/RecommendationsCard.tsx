"use client";

import { useState } from "react";
import type { Recommendation, RecommendationCategory } from "@/types/dashboard";
import {
  C, G, AM, RD, BL, PR,
  Card, SectionTitle, Badge,
  IconChevDown, IconChevRight, IconClock, IconCheck,
} from "./shared";

// ── Category meta ─────────────────────────────────────────────────────────────
const CAT_META: Record<RecommendationCategory, { label: string; color: string; bg: string; border: string }> = {
  critical:    { label: "Crítico",     color: RD,          bg: "rgba(239,68,68,0.12)",    border: "rgba(239,68,68,0.3)"    },
  seo:         { label: "SEO",         color: BL,          bg: "rgba(96,165,250,0.12)",   border: "rgba(96,165,250,0.3)"   },
  performance: { label: "Rendimiento", color: AM,          bg: "rgba(245,158,11,0.12)",   border: "rgba(245,158,11,0.3)"   },
  content:     { label: "Contenido",   color: PR,          bg: "rgba(167,139,250,0.12)",  border: "rgba(167,139,250,0.3)"  },
  local:       { label: "Local",       color: G,           bg: "rgba(34,197,94,0.12)",    border: "rgba(34,197,94,0.3)"    },
  reputation:  { label: "Reputación",  color: "#fbbf24",   bg: "rgba(251,191,36,0.12)",   border: "rgba(251,191,36,0.3)"   },
};

const IMPACT_COLOR: Record<string, string> = {
  high: G, medium: AM, low: C.text3,
};
const EFFORT_COLOR: Record<string, string> = {
  low: G, medium: AM, high: RD,
};
const PRIORITY_COLOR: Record<string, string> = {
  critical: RD, high: "#f97316", medium: AM, low: C.text3,
};

// ── Single recommendation row ─────────────────────────────────────────────────
function RecRow({ rec, defaultOpen = false }: { rec: Recommendation; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const cat = CAT_META[rec.category] ?? CAT_META.seo;

  return (
    <div style={{
      borderRadius: 12,
      border: `1px solid ${open ? cat.border : C.border}`,
      background: open ? cat.bg : "rgba(255,255,255,0.02)",
      transition: "border-color 0.2s, background 0.2s",
      overflow: "hidden",
    }}>
      {/* Header row */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 12,
          padding: "14px 16px", background: "none", border: "none",
          cursor: "pointer", textAlign: "left",
        }}
      >
        {/* Rank badge */}
        <div style={{
          width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: cat.bg, border: `1px solid ${cat.border}`,
          fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
          fontSize: 13, color: cat.color,
        }}>
          {rec.rank}
        </div>

        {/* Category chip */}
        <span style={{
          flexShrink: 0, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em",
          textTransform: "uppercase", color: cat.color,
          background: cat.bg, border: `1px solid ${cat.border}`,
          padding: "2px 8px", borderRadius: 999,
        }}>
          {cat.label}
        </span>

        {/* Title */}
        <span style={{
          flex: 1, fontSize: 14, fontWeight: 600, color: C.text,
          lineHeight: 1.35,
        }}>
          {rec.title}
        </span>

        {/* Chips: impact · effort · time */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <Chip label="Impacto" value={rec.impact} color={IMPACT_COLOR[rec.impact]} />
          <Chip label="Esfuerzo" value={rec.effort} color={EFFORT_COLOR[rec.effort]} />
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: C.text3 }}>
            <IconClock size={12} />
            {rec.estimated_time}
          </span>
        </div>

        {/* Chevron */}
        <div style={{ color: C.text3, flexShrink: 0 }}>
          {open
            ? <IconChevDown size={16} />
            : <IconChevRight size={16} />
          }
        </div>
      </button>

      {/* Expanded body */}
      {open && (
        <div style={{
          padding: "0 16px 18px 16px",
          display: "flex", flexDirection: "column", gap: 16,
          borderTop: `1px solid ${cat.border}`,
          marginTop: 0, paddingTop: 16,
        }}>
          {/* Evidence */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}>
            <EvidenceBox label="Estado actual" value={rec.evidence.current_value} color={RD} />
            <EvidenceBox label="Objetivo" value={rec.evidence.target_value} color={G} />
          </div>

          {/* Why it matters */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.text3, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
              Por qué importa
            </div>
            <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.6, margin: 0 }}>
              {rec.why_it_matters}
            </p>
          </div>

          {/* What to do */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.text3, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
              Pasos a seguir
            </div>
            <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
              {rec.what_to_do.map((step, i) => (
                <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{
                    flexShrink: 0, width: 20, height: 20, borderRadius: "50%",
                    background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700, color: G, marginTop: 1,
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 13, color: C.text2, lineHeight: 1.55 }}>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Expected outcome */}
          <div style={{
            display: "flex", gap: 10, alignItems: "flex-start",
            background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: 10, padding: "10px 14px",
          }}>
            <IconCheck size={15} color={G} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 13, color: C.text2, lineHeight: 1.55 }}>
              <strong style={{ color: G }}>Resultado esperado: </strong>
              {rec.expected_outcome}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helper sub-components ─────────────────────────────────────────────────────
function Chip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <span style={{ fontSize: 11, color: C.text3 }}>
      {label}: <strong style={{ color }}>{value}</strong>
    </span>
  );
}

function EvidenceBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      padding: "10px 12px", borderRadius: 8,
      background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`,
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.text3, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color, lineHeight: 1.4 }}>
        {value}
      </div>
    </div>
  );
}

// ── Main card ─────────────────────────────────────────────────────────────────
export function RecommendationsCard({ recommendations }: { recommendations: Recommendation[] }) {
  if (!recommendations.length) return null;

  const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = [...recommendations].sort(
    (a, b) => (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9)
  );

  return (
    <Card style={{ padding: 24 }}>
      <SectionTitle
        kicker="Acciones prioritarias"
        title="Recomendaciones"
        sub={`${sorted.length} mejora${sorted.length !== 1 ? "s" : ""} identificada${sorted.length !== 1 ? "s" : ""} en esta auditoría`}
        right={
          <Badge tone="amber" style={{ fontSize: 12 }}>
            {sorted.filter(r => r.priority === "high" || r.priority === "critical").length} de alta prioridad
          </Badge>
        }
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.map((rec, i) => (
          <RecRow key={rec.rank} rec={rec} defaultOpen={i === 0} />
        ))}
      </div>
    </Card>
  );
}
