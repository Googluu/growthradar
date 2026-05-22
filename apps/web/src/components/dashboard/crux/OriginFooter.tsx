"use client";

import type { CrUXData, CrUXHistoryData } from "@/types/dashboard";
import { C, EG, fmtDate } from "./shared";

export function OriginFooter({ current, history }: { current: CrUXData; history: CrUXHistoryData | null }) {
  return (
    <div style={{
      padding: "14px 18px",
      background: "rgba(255,255,255,0.02)",
      border: `1px solid ${C.border}`, borderRadius: 12,
      display: "flex", justifyContent: "space-between", alignItems: "center",
      gap: 16, flexWrap: "wrap" as const,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: C.text2 }}>
        <span style={{ fontFamily: "var(--font-caveat), cursive", color: EG, fontSize: 16 }}>Origen:</span>
        <span style={{ fontFamily: "monospace", color: C.text, fontWeight: 500 }}>{current.origin}</span>
      </div>
      {history && (
        <div style={{ fontSize: 11.5, color: C.text3 }}>
          {history.data_points_count} puntos · {fmtDate(history.first_date)} → {fmtDate(history.last_date)}
        </div>
      )}
    </div>
  );
}
