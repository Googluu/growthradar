"use client";

import { useCountUp } from "@/hooks/useCountUp";

interface Props {
  label: string;
  score: number | null;
  color: string;
  badge: string;
  active: boolean;
  onClick: () => void;
  started: boolean;
}

export function ScoreCard({ label, score, color, badge, active, onClick, started }: Props) {
  const animated = useCountUp(score ?? 0, 1200, started);

  return (
    <div
      onClick={onClick}
      className="rounded-xl p-5 cursor-pointer transition-all duration-200"
      style={{
        background: active ? "var(--bg3)" : "var(--bg2)",
        border: `1px solid ${active ? color : "var(--border)"}`,
        boxShadow: active ? `0 0 0 1px ${color}44` : "none",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium text-[15px]" style={{ color: "var(--txt)" }}>{label}</span>
        <span
          className="text-[12px] font-semibold px-3 py-0.5 rounded-full border"
          style={{ background: color + "22", color, borderColor: color + "44" }}
        >{badge}</span>
      </div>

      {score !== null ? (
        <>
          <div className="flex items-baseline gap-1 mb-2">
            <span style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 32, color }}>
              {animated}
            </span>
            <span className="text-sm" style={{ color: "var(--txt-muted)" }}>/ 100</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg3)" }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${(animated / 100) * 100}%`, background: color }}
            />
          </div>
        </>
      ) : (
        <div style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 32, color: "var(--txt-faint)" }}>
          N/A
        </div>
      )}
    </div>
  );
}
