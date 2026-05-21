"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import type { LabsTopCategory } from "@/types/dashboard";
import { G, BL, PU, AM, OR, C, Card, SectionTitle } from "./shared";

// ── Squarify ───────────────────────────────────────────────────────────────
type SquarifyInput = { label: string; value: number; color: string };
type SquarifyRect  = SquarifyInput & { x: number; y: number; w: number; h: number };

function squarify(items: SquarifyInput[], width: number, height: number): SquarifyRect[] {
  if (!items.length || width <= 0 || height <= 0) return [];
  const total = items.reduce((s, v) => s + v.value, 0);
  const sorted = [...items].sort((a, b) => b.value - a.value).map(v => ({ ...v, area: (v.value / total) * width * height }));

  const worst = (row: typeof sorted, side: number): number => {
    const sum = row.reduce((s, x) => s + x.area, 0);
    const max = Math.max(...row.map(x => x.area));
    const min = Math.min(...row.map(x => x.area));
    const s2 = side * side, sum2 = sum * sum;
    return Math.max((s2 * max) / sum2, sum2 / (s2 * min));
  };

  const result: SquarifyRect[] = [];
  let rx = 0, ry = 0, rw = width, rh = height;
  let i = 0;

  while (i < sorted.length) {
    const horizontal = rw >= rh;
    const side = horizontal ? rh : rw;
    let row: typeof sorted = [];

    for (let j = i; j < sorted.length; j++) {
      const candidate = [...row, sorted[j]];
      if (row.length === 0 || worst(candidate, side) <= worst(row, side)) {
        row = candidate;
      } else break;
    }

    const rowSum = row.reduce((s, x) => s + x.area, 0);
    const thickness = rowSum / side;
    let cursor = horizontal ? ry : rx;

    for (const it of row) {
      const len = it.area / thickness;
      result.push({ ...it, x: horizontal ? rx : cursor, y: horizontal ? cursor : ry, w: horizontal ? thickness : len, h: horizontal ? len : thickness });
      cursor += len;
    }

    if (horizontal) { rx += thickness; rw -= thickness; }
    else             { ry += thickness; rh -= thickness; }
    i += row.length;
  }

  return result;
}

// ── Category names fallback ────────────────────────────────────────────────
// DataForSEO uses Google's keyword planner category IDs. Common ones:
const KNOWN_CATS: Record<number, string> = {
  10001: "Artes y entretenimiento",   10002: "Automóviles y vehículos",
  10003: "Belleza y fitness",         10004: "Libros y literatura",
  10005: "Negocios e industria",      10006: "Computadoras y electrónica",
  10007: "Finanzas",                  10008: "Alimentos y bebidas",
  10009: "Juegos",                    10010: "Salud",
  10011: "Hogar y jardín",            10012: "Internet y telecom",
  10013: "Trabajos y educación",      10014: "Ley y gobierno",
  10015: "Noticias",                  10016: "Tiendas en línea",
  10017: "Personas y sociedad",       10018: "Mascotas y animales",
  10019: "Bienes raíces",             10020: "Ciencia",
  10021: "Compras",                   10022: "Deportes",
  10023: "Viajes",                    10024: "Referencia",
  10025: "Tecnología",                10026: "Comida y bebida",
  10027: "Moda y estilo",             10028: "Entretenimiento",
  10142: "Restaurantes",              10168: "E-commerce",
  11503: "Internet y telecom",        13418: "Ropa y accesorios",
  13441: "Servicios financieros",     13575: "Amazon",
  13860: "Mercados en línea",         13841: "Pagos y tarjetas",
};

const getCatName = (id: number, name?: string) => name || KNOWN_CATS[id] || `Categoría ${id}`;

// ── CategoriesTreemap ──────────────────────────────────────────────────────
const COLORS = [G, "#4ade80", BL, PU, AM, OR, "#f472b6", "#34d399", "#818cf8", "#fb923c"];

export function CategoriesTreemap({ categories }: { categories: LabsTopCategory[] | undefined }) {
  if (!categories || categories.length === 0) return null;

  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 900, h: 320 });

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(() => {
      if (wrapRef.current) {
        const r = wrapRef.current.getBoundingClientRect();
        setSize({ w: Math.max(300, r.width), h: 320 });
      }
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const total = categories.reduce((s, c) => s + c.count, 0);

  const items: SquarifyInput[] = categories.map((c, i) => ({
    label: getCatName(c.category_id, c.category_name),
    value: c.count,
    color: COLORS[i % COLORS.length],
  }));

  const rects = useMemo(() => squarify(items, size.w, size.h), [items, size.w, size.h]);

  return (
    <Card style={{ padding: 24 }}>
      <SectionTitle
        kicker="Categorías"
        title="Top categorías de keywords"
        sub="Distribución temática de las keywords analizadas"
      />

      <div ref={wrapRef} style={{ width: "100%" }}>
        <svg width={size.w} height={size.h} style={{ display: "block", borderRadius: 12, overflow: "hidden" }}>
          {rects.map((r, i) => {
            const pct = ((r.value / total) * 100).toFixed(0);
            const showFull = r.w > 100 && r.h > 70;
            const showMin  = !showFull && r.w > 40 && r.h > 40;
            return (
              <g key={i}>
                <rect
                  x={r.x + 2} y={r.y + 2}
                  width={Math.max(0, r.w - 4)} height={Math.max(0, r.h - 4)}
                  rx={10}
                  fill={r.color} fillOpacity={0.15}
                  stroke={r.color} strokeOpacity={0.35} strokeWidth={1}
                />
                {showFull && (
                  <>
                    <text x={r.x + 14} y={r.y + 26}
                      fontSize="13" fontFamily="Inter, sans-serif" fontWeight="600" fill={C.text}>
                      {r.label}
                    </text>
                    <text x={r.x + 14} y={r.y + 55}
                      fontSize="28" fontFamily="var(--font-syne), Syne, sans-serif" fontWeight="800" fill={r.color}>
                      {r.value}
                    </text>
                    <text x={r.x + 14} y={r.y + 76}
                      fontSize="11" fontFamily="monospace" fill={C.text3}>
                      {pct}% del total
                    </text>
                  </>
                )}
                {showMin && (
                  <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 5}
                    fontSize="16" fontFamily="var(--font-syne), Syne, sans-serif" fontWeight="700"
                    fill={r.color} textAnchor="middle">
                    {r.value}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </Card>
  );
}
