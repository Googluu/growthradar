"use client";

import { useState, useRef, useEffect } from "react";
import type { KeywordDataItem } from "@/types/dashboard";
import { C, Gs, Gb, fmtCompact, monthShort, SERIES_COLORS, Card, SectionTitle, IconChart, IconX } from "./shared";

export function ComparativaChart({ keywords, selected, setSelected }: {
  keywords: KeywordDataItem[];
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(900);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(() => {
      if (wrapRef.current) {
        const r = wrapRef.current.getBoundingClientRect();
        setW(Math.max(360, r.width));
      }
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const series = selected.map(kw => keywords.find(k => k.keyword === kw)).filter((k): k is KeywordDataItem => !!k);

  if (series.length === 0) {
    return (
      <Card style={{ padding: 28 }}>
        <SectionTitle
          kicker="Comparativa"
          title="Comparativa de keywords"
          sub="Selecciona keywords en la tabla para superponerlas aquí"
        />
        <div style={{
          padding: "60px 24px", textAlign: "center",
          background: "rgba(255,255,255,0.02)",
          border: `1px dashed ${C.border}`, borderRadius: 12,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: Gs, color: "#22c55e",
            border: `1px solid ${Gb}`,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginBottom: 14,
          }}>
            <IconChart size={24}/>
          </div>
          <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 17, color: C.text, marginBottom: 6 }}>
            Ninguna keyword seleccionada
          </div>
          <div style={{ fontSize: 13, color: C.text3, maxWidth: 380, margin: "0 auto" }}>
            Activa el checkbox a la izquierda de cualquier keyword en la tabla para superponer su tendencia de 12 meses aquí.
          </div>
        </div>
      </Card>
    );
  }

  const h = 320;
  const pad = { l: 56, r: 16, t: 18, b: 36 };
  const iw = w - pad.l - pad.r;
  const ih = h - pad.t - pad.b;

  const allMonths = series[0].monthly_searches.map(m => `${m.year}-${String(m.month).padStart(2, "0")}`);
  const max = Math.max(...series.flatMap(s => s.monthly_searches.map(m => m.search_volume))) * 1.1;

  const xAt = (i: number) => pad.l + (i / (allMonths.length - 1)) * iw;
  const yAt = (v: number) => pad.t + ih - (v / max) * ih;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => max * t);

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * w;
    const i = Math.round(((x - pad.l) / iw) * (allMonths.length - 1));
    setHover(i >= 0 && i < allMonths.length ? i : null);
  };

  return (
    <Card style={{ padding: 28 }}>
      <SectionTitle
        kicker="Comparativa"
        title="Comparativa de keywords"
        sub={`${series.length} keyword${series.length === 1 ? "" : "s"} superpuesta${series.length === 1 ? "" : "s"}`}
        right={
          <button onClick={() => setSelected([])} style={{
            background: "transparent", border: `1px solid ${C.border}`,
            color: C.text2, fontSize: 12, padding: "6px 12px", borderRadius: 8,
            cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
          }}>
            <IconX size={12}/> Limpiar
          </button>
        }
      />

      {/* Legend chips */}
      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginBottom: 16 }}>
        {series.map((s, i) => (
          <div key={s.keyword} style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 6px 5px 10px", borderRadius: 999,
            background: `${SERIES_COLORS[i]}15`,
            border: `1px solid ${SERIES_COLORS[i]}55`,
            fontSize: 12, color: C.text, fontWeight: 500,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: SERIES_COLORS[i] }}/>
            {s.keyword}
            <button onClick={() => setSelected(sel => sel.filter(x => x !== s.keyword))} style={{
              background: "rgba(255,255,255,0.06)", border: "none",
              color: C.text2, width: 18, height: 18, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", padding: 0,
            }}><IconX size={10}/></button>
          </div>
        ))}
      </div>

      <div ref={wrapRef} style={{ width: "100%", position: "relative" }}>
        <svg width={w} height={h} onMouseMove={onMove} onMouseLeave={() => setHover(null)}
          style={{ display: "block", cursor: "crosshair" }}>
          {yTicks.map((t, i) => (
            <g key={i}>
              <line x1={pad.l} x2={w - pad.r} y1={yAt(t)} y2={yAt(t)} stroke="rgba(255,255,255,0.05)" strokeDasharray="2 4"/>
              <text x={pad.l - 8} y={yAt(t) + 4} textAnchor="end" fontSize="10.5" fontFamily="monospace" fill={C.text3}>
                {fmtCompact(t)}
              </text>
            </g>
          ))}
          {allMonths.map((m, i) => (
            <text key={i} x={xAt(i)} y={h - pad.b + 18} textAnchor="middle" fontSize="10.5" fontFamily="sans-serif" fill={C.text3}>
              {monthShort(m)}
            </text>
          ))}
          {series.map((s, idx) => {
            const path = s.monthly_searches.map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(p.search_volume).toFixed(1)}`).join(" ");
            return (
              <g key={s.keyword}>
                <path d={path} stroke={SERIES_COLORS[idx]} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                {s.monthly_searches.map((p, i) => (
                  <circle key={i} cx={xAt(i)} cy={yAt(p.search_volume)} r={hover === i ? 4 : 2.5}
                    fill={C.bg} stroke={SERIES_COLORS[idx]} strokeWidth="1.6"/>
                ))}
              </g>
            );
          })}
          {hover != null && (
            <line x1={xAt(hover)} x2={xAt(hover)} y1={pad.t} y2={pad.t + ih} stroke={C.text3} strokeOpacity="0.5" strokeDasharray="3 3"/>
          )}
        </svg>

        {hover != null && (
          <div style={{
            position: "absolute",
            left: Math.min(w - 240, Math.max(8, xAt(hover) + 12)),
            top: 12,
            background: "rgba(20,20,20,0.96)", border: `1px solid ${C.borderStr}`,
            borderRadius: 10, padding: "10px 12px",
            pointerEvents: "none", minWidth: 200,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}>
            <div style={{ fontSize: 11, color: C.text3, marginBottom: 6 }}>
              {new Date(allMonths[hover] + "-01").toLocaleString("es-CO", { month: "long", year: "numeric" })}
            </div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 4 }}>
              {series.map((s, idx) => (
                <div key={s.keyword} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: SERIES_COLORS[idx] }}/>
                  <span style={{ color: C.text2, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, maxWidth: 140 }}>
                    {s.keyword}
                  </span>
                  <span style={{ fontFamily: "monospace", color: C.text, fontWeight: 600 }}>
                    {fmtCompact(s.monthly_searches[hover].search_volume)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
