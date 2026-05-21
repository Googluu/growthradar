"use client";

import { useState } from "react";
import type { OnPageData } from "@/types/dashboard";
import { C, RD, Card, Badge, SectionTitle, IconAlert, IconChevDown } from "./shared";

export function IssuesCard({ issues }: { issues: OnPageData["issues"] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? issues : issues.slice(0, 5);

  return (
    <Card style={{ padding: 24, height: "100%" }}>
      <SectionTitle
        title="Issues críticos"
        sub="Problemas que afectan tu posicionamiento en Google"
        right={
          <Badge tone="red" style={{ fontSize: 12, padding: "4px 10px" }}>
            {issues.length} críticos
          </Badge>
        }
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {visible.map((issue, i) => (
          <div key={issue.check + i} style={{
            display: "flex", alignItems: "flex-start", gap: 12,
            padding: "12px 14px", borderRadius: 10,
            background: "rgba(239,68,68,0.05)",
            border: "1px solid rgba(239,68,68,0.18)",
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.35)",
              color: RD, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <IconAlert size={14} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, color: C.text, fontWeight: 500, lineHeight: 1.4 }}>
                {issue.label}
              </div>
              <div style={{
                fontSize: 10.5, color: C.text3, marginTop: 3,
                fontFamily: "var(--font-mono), monospace",
              }}>{issue.check}</div>
            </div>
          </div>
        ))}

        {issues.length === 0 && (
          <div style={{
            padding: "24px 20px", textAlign: "center",
            background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)",
            borderRadius: 10, color: "#22c55e", fontSize: 13, fontWeight: 600,
          }}>
            ✓ Sin issues críticos detectados
          </div>
        )}
      </div>

      {issues.length > 5 && (
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
            transition: "all 0.15s",
          }}
        >
          {expanded ? "Mostrar solo los primeros 5" : `Ver todos (${issues.length})`}
          <IconChevDown size={12} style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
        </button>
      )}
    </Card>
  );
}
