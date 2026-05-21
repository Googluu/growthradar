"use client";

import { useState, useRef, useEffect } from "react";
import type { LabsData } from "@/types/dashboard";
import { G, C, fmtCompact, Card, SectionTitle, Badge, IconTrendUp } from "./shared";

export function MonthlyChart({ data }: { data: LabsData }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  const [hover, setHover] = useState<number | null>(null);
  const h = 240;

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(() => {
      if (wrapRef.current) setWidth(wrapRef.current.getBoundingClientRect().width || 800);
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const pts = data.monthly_aggregated;
  if (!pts || pts.length === 0) return null;

  const pad = { l: 50, r: 16, t: 18, b: 36 };
  const iw = width - pad.l - pad.r;
  const ih = h - pad.t - pad.b;
  const max = Math.max(...pts.map(p => p.search_volume)) * 1.15 || 1;

  const xAt = (i: number) => pad.l + (i / Math.max(pts.length - 1, 1)) * iw;
  const yAt = (v: number) => pad.t + ih - (v / max) * ih;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => max * t);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(2)} ${yAt(p.search_volume).toFixed(2)}`).join(" ");
  const area = `${line} L ${xAt(pts.length - 1)} ${pad.t + ih} L ${xAt(0)} ${pad.t + ih} Z`;

  return (
    <Card style={{ padding: 24 }}>
      <SectionTitle
        kicker="Tendencia"
        title="Volumen mensual agregado"
        sub="Suma del volumen de búsqueda de las keywords analizadas, últimos 12 meses"
        right={
          <Badge tone="green" style={{ fontSize: 12, padding: "4px 10px" }}>
            <IconTrendUp size={11} /> {fmtCompact(data.total_search_volume)} / mes
          </Badge>
        }
      />
      <div ref={wrapRef} style={{ width: "100%", position: "relative" }}>
        <svg width={width} height={h} style={{ display: "block", cursor: "crosshair" }}
          onMouseMove={e => {
            const r = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - r.left;
            const i = Math.round(((x - pad.l) / iw) * (pts.length - 1));
            setHover(i >= 0 && i < pts.length ? i : null);
          }}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="kw-monthly-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={G} stopOpacity="0.35" />
              <stop offset="100%" stopColor={G} stopOpacity="0" />
            </linearGradient>
          </defs>

          {yTicks.map((t, i) => (
            <g key={i}>
              <line x1={pad.l} x2={width - pad.r} y1={yAt(t)} y2={yAt(t)}
                stroke="rgba(255,255,255,0.05)" strokeDasharray="2 4" />
              <text x={pad.l - 8} y={yAt(t) + 4} textAnchor="end"
                fontSize={10.5} fontFamily="monospace" fill={C.text3}>
                {fmtCompact(t)}
              </text>
            </g>
          ))}

          <path d={area} fill="url(#kw-monthly-grad)" />
          <path d={line} fill="none" stroke={G} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 6px ${G}66)` }} />

          {pts.map((p, i) => (
            <circle key={i} cx={xAt(i)} cy={yAt(p.search_volume)}
              r={hover === i ? 5 : 3} fill={C.bg} stroke={G} strokeWidth={2} />
          ))}

          {pts.map((p, i) => (
            <text key={i} x={xAt(i)} y={h - pad.b + 18} textAnchor="middle"
              fontSize={10.5} fontFamily="Inter, sans-serif" fill={C.text3}>
              {new Date(p.year_month + "-01").toLocaleString("es-CO", { month: "short" })}
            </text>
          ))}

          {hover != null && (
            <line x1={xAt(hover)} x2={xAt(hover)} y1={pad.t} y2={pad.t + ih}
              stroke={G} strokeOpacity="0.4" strokeDasharray="3 3" />
          )}
        </svg>

        {hover != null && (
          <div style={{
            position: "absolute",
            left: Math.min(width - 160, Math.max(8, xAt(hover) + 12)),
            top: yAt(pts[hover].search_volume) - 60,
            background: "rgba(20,20,20,0.95)", border: `1px solid ${C.borderStrong}`,
            backdropFilter: "blur(8px)", borderRadius: 10, padding: "8px 12px",
            pointerEvents: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}>
            <div style={{ fontSize: 11, color: C.text3, marginBottom: 2 }}>
              {new Date(pts[hover].year_month + "-01").toLocaleString("es-CO", { month: "long", year: "numeric" })}
            </div>
            <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 18, color: G }}>
              {pts[hover].search_volume.toLocaleString("es-CO")}
            </div>
            <div style={{ fontSize: 10.5, color: C.text3 }}>búsquedas</div>
          </div>
        )}
      </div>
    </Card>
  );
}
