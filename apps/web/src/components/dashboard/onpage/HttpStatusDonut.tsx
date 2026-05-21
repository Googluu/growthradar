"use client";

import { C, G, AM, RD, BL, Card, SectionTitle, IconCheck } from "./shared";

const CLASSES = [
  { key: "2xx", label: "OK",           color: G  },
  { key: "3xx", label: "Redirect",     color: BL },
  { key: "4xx", label: "Client error", color: AM },
  { key: "5xx", label: "Server error", color: RD },
] as const;

export function HttpStatusDonut({
  statusCode, statusClass,
}: {
  statusCode: number; statusClass: string;
}) {
  const size = 110, stroke = 14;
  const r = (size - stroke) / 2;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const each = circ / 4;
  const gap = 4;

  const activeColor = CLASSES.find(c => c.key === statusClass)?.color ?? C.text3;

  return (
    <Card style={{ padding: 24, height: "100%" }}>
      <SectionTitle title="Estado HTTP" sub="Clase de respuesta del servidor" />
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        {/* Donut */}
        <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
          <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
            {CLASSES.map((cls, i) => {
              const isActive = cls.key === statusClass;
              return (
                <circle
                  key={cls.key}
                  cx={cx} cy={cy} r={r} fill="none"
                  stroke={isActive ? cls.color : "rgba(255,255,255,0.06)"}
                  strokeWidth={stroke}
                  strokeDasharray={`${each - gap} ${circ - (each - gap)}`}
                  strokeDashoffset={-i * each}
                  strokeLinecap="round"
                  style={{
                    filter: isActive ? `drop-shadow(0 0 6px ${cls.color}66)` : "none",
                    transition: "stroke 0.4s",
                  }}
                />
              );
            })}
          </svg>
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            pointerEvents: "none",
          }}>
            <div style={{
              fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
              fontSize: 22, color: activeColor, lineHeight: 1,
            }}>{statusCode}</div>
            <div style={{
              fontSize: 10, color: C.text3, fontWeight: 500, marginTop: 2, letterSpacing: "0.04em",
            }}>{statusClass}</div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
          {CLASSES.map(cls => {
            const isActive = cls.key === statusClass;
            return (
              <div key={cls.key} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "4px 8px", borderRadius: 6,
                background: isActive ? `${cls.color}15` : "transparent",
                border: `1px solid ${isActive ? `${cls.color}40` : "transparent"}`,
                opacity: isActive ? 1 : 0.5,
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: 2,
                  background: cls.color, flexShrink: 0,
                  display: "inline-block",
                }} />
                <span style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 12, color: C.text, fontWeight: 600,
                }}>{cls.key}</span>
                <span style={{ fontSize: 12, color: C.text2, flex: 1 }}>{cls.label}</span>
                {isActive && <IconCheck size={13} color={cls.color} />}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
