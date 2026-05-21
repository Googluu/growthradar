"use client";

import { useState } from "react";
import type { OnPageData } from "@/types/dashboard";
import { C, RD, AM, Card, Badge, SectionTitle, IconBug, IconWarn, IconChevRight, IconCheck } from "./shared";

type ResourceEntry = OnPageData["resource_errors"][number];

function AccordionSection({
  title, count, icon, color, items, defaultOpen = false,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  items: ResourceEntry[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const errorTone = color === RD ? "red" as const : color === AM ? "amber" as const : "green" as const;

  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: `1px solid ${C.border}`,
      borderRadius: 12, overflow: "hidden",
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 12,
          padding: "14px 18px",
          background: open ? `${color}10` : "transparent",
          border: "none", cursor: "pointer", textAlign: "left",
          color: C.text, transition: "all 0.15s",
        }}
      >
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: `${color}22`,
          border: `1px solid ${color}55`,
          color, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{title}</div>
          <div style={{ fontSize: 11.5, color: C.text3, marginTop: 2 }}>
            {count === 0
              ? "Sin problemas detectados"
              : `${count} encontrado${count === 1 ? "" : "s"}`}
          </div>
        </div>
        <Badge tone={count === 0 ? "green" : errorTone}>{count}</Badge>
        <span style={{
          color: C.text3, display: "inline-flex",
          transition: "transform 0.2s",
          transform: open ? "rotate(90deg)" : "none",
        }}>
          <IconChevRight size={16} />
        </span>
      </button>

      {open && items.length > 0 && (
        <div style={{ borderTop: `1px solid ${C.border}` }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Línea : Col", "Mensaje", "HTTP"].map((h, i) => (
                  <th key={h} style={{
                    padding: "10px 18px", fontSize: 10.5, fontWeight: 600,
                    color: C.text3, letterSpacing: "0.07em", textTransform: "uppercase",
                    textAlign: i === 2 ? "right" : "left",
                    width: i === 0 ? 110 : i === 2 ? 90 : undefined,
                    borderBottom: `1px solid ${C.border}`,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => {
                const httpTone = it.status_code >= 400 || it.status_code === 0 ? "red" as const
                  : it.status_code >= 300 ? "amber" as const : "default" as const;
                return (
                  <tr key={i}>
                    <td style={{
                      padding: "11px 18px",
                      borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : "none",
                      fontFamily: "var(--font-mono), monospace", fontSize: 12, color: C.text2,
                    }}>{it.line}:{it.column}</td>
                    <td style={{
                      padding: "11px 18px",
                      borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : "none",
                      fontFamily: "var(--font-mono), monospace", fontSize: 12, color: C.text, lineHeight: 1.4,
                    }}>{it.message}</td>
                    <td style={{
                      padding: "11px 18px",
                      borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : "none",
                      textAlign: "right",
                    }}>
                      <Badge tone={httpTone} style={{ fontFamily: "var(--font-mono), monospace" }}>
                        {it.status_code || "N/A"}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {open && count === 0 && (
        <div style={{
          padding: "14px 18px", borderTop: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", gap: 8,
          color: "#22c55e", fontSize: 12.5,
        }}>
          <IconCheck size={14} color="#22c55e" />
          Sin problemas detectados
        </div>
      )}
    </div>
  );
}

export function ResourceErrorsCard({
  errors, warnings,
}: {
  errors: OnPageData["resource_errors"];
  warnings: OnPageData["resource_warnings"];
}) {
  if (errors.length === 0 && warnings.length === 0) return null;

  return (
    <Card style={{ padding: 24 }}>
      <SectionTitle
        kicker="Consola"
        title="Errores y advertencias de recursos"
        sub="Problemas detectados al cargar recursos de la página"
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <AccordionSection
          title="Errores"
          count={errors.length}
          items={errors}
          icon={<IconBug size={15} />}
          color={RD}
          defaultOpen
        />
        <AccordionSection
          title="Advertencias"
          count={warnings.length}
          items={warnings}
          icon={<IconWarn size={15} />}
          color={AM}
        />
      </div>
    </Card>
  );
}
