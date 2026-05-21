"use client";

import { useState } from "react";
import type { OnPageData } from "@/types/dashboard";
import { G, C, Card, Badge, SectionTitle, IconCheck, IconChevDown } from "./shared";

export function PassingChecksCard({ checks }: { checks: OnPageData["passing_checks"] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? checks : checks.slice(0, 8);

  return (
    <Card style={{ padding: 24, height: "100%" }}>
      <SectionTitle
        title="Checks aprobados"
        sub="Lo que estás haciendo bien"
        right={
          <Badge tone="green" style={{ fontSize: 12, padding: "4px 10px" }}>
            {checks.length} aprobados
          </Badge>
        }
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {visible.map((check, i) => (
          <div key={check.check + i} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "8px 12px", borderRadius: 9,
            background: "rgba(34,197,94,0.04)",
            border: "1px solid rgba(34,197,94,0.12)",
          }}>
            <IconCheck size={16} color={G} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: C.text, fontWeight: 500, flex: 1 }}>
              {check.label}
            </span>
          </div>
        ))}

        {checks.length === 0 && (
          <div style={{
            fontSize: 13, color: C.text3, padding: "20px 12px", textAlign: "center",
          }}>
            Sin checks aprobados aún.
          </div>
        )}
      </div>

      {checks.length > 8 && (
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            marginTop: 12, width: "100%",
            padding: "10px 14px", borderRadius: 9,
            background: "rgba(255,255,255,0.03)",
            border: `1px solid ${C.border}`,
            color: C.text2, fontSize: 12.5, fontWeight: 500,
            cursor: "pointer", display: "inline-flex",
            alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          {expanded ? "Mostrar solo los primeros 8" : `Ver todos (${checks.length})`}
          <IconChevDown size={12} style={{ transform: expanded ? "rotate(180deg)" : "none" }} />
        </button>
      )}
    </Card>
  );
}
