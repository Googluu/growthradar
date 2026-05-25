"use client";

import React, { useState, useMemo, useEffect } from "react";
import type { LabsKeyword } from "@/types/dashboard";
import {
  G, C,
  diffColor, fmtCompact, fmtUsd, INTENT_META,
  Badge, Card, SectionTitle,
  IconFilter, IconLayers, IconArrowUp, IconArrowDown,
} from "./shared";

// ── Sparkline ──────────────────────────────────────────────────────────────
function Sparkline({ data, w = 80, h = 24 }: { data: Array<{ search_volume: number }>; w?: number; h?: number }) {
  if (!data || data.length < 2) return null;
  const vs = data.map(d => d.search_volume);
  const max = Math.max(...vs), min = Math.min(...vs);
  const range = max - min || 1;
  const path = vs.map((v, i) => {
    const x = (i / (vs.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  const lastY = h - ((vs[vs.length - 1] - min) / range) * (h - 4) - 2;
  return (
    <svg width={w} height={h} style={{ display: "block", flexShrink: 0 }}>
      <defs>
        <linearGradient id="kw-spk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={G} stopOpacity="0.35" />
          <stop offset="100%" stopColor={G} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#kw-spk)" />
      <path d={path} stroke={G} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <circle cx={w} cy={lastY} r="2" fill={G} />
    </svg>
  );
}

// ── FilterPill ─────────────────────────────────────────────────────────────
function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "5px 10px", borderRadius: 999,
      fontSize: 11.5, fontWeight: 500, cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap",
      background: active ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)",
      color: active ? G : C.text2,
      border: `1px solid ${active ? "rgba(34,197,94,0.35)" : C.border}`,
      fontFamily: "inherit",
    }}>{children}</button>
  );
}

// ── FilterBar ──────────────────────────────────────────────────────────────
type Filters = { intent: string[]; competition: string[]; difficulty: string[]; depth: number[] };

function FilterBar({ filters, setFilters }: { filters: Filters; setFilters: React.Dispatch<React.SetStateAction<Filters>> }) {
  const toggle = (key: keyof Filters, val: string | number) => {
    setFilters(f => {
      const cur = f[key] as (string | number)[];
      const next = cur.includes(val as never) ? cur.filter(x => x !== val) : [...cur, val];
      return { ...f, [key]: next };
    });
  };

  return (
    <div style={{
      display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap",
      padding: "12px 16px", background: "rgba(255,255,255,0.02)",
      borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.text3, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", flexShrink: 0 }}>
        <IconFilter size={12} /> FILTROS
      </div>
      <div style={{ width: 1, height: 16, background: C.border }} />

      {Object.entries(INTENT_META).map(([k, m]) => (
        <FilterPill key={k} active={filters.intent.includes(k)} onClick={() => toggle("intent", k)}>
          {m.icon} {m.label}
        </FilterPill>
      ))}
      <div style={{ width: 1, height: 16, background: C.border }} />

      <span style={{ fontSize: 11, color: C.text3 }}>Competencia:</span>
      {[["LOW", "Baja"], ["MEDIUM", "Media"], ["HIGH", "Alta"]].map(([v, l]) => (
        <FilterPill key={v} active={filters.competition.includes(v)} onClick={() => toggle("competition", v)}>{l}</FilterPill>
      ))}
      <div style={{ width: 1, height: 16, background: C.border }} />

      <span style={{ fontSize: 11, color: C.text3 }}>Dificultad:</span>
      {([["easy", "Fácil"], ["medium", "Media"], ["hard", "Difícil"], ["very_hard", "Muy difícil"]] as [string, string][]).map(([v, l]) => (
        <FilterPill key={v} active={filters.difficulty.includes(v)} onClick={() => toggle("difficulty", v)}>{l}</FilterPill>
      ))}
      <div style={{ width: 1, height: 16, background: C.border }} />

      <span style={{ fontSize: 11, color: C.text3 }}>Profundidad:</span>
      {[1, 2, 3, 4].map(d => (
        <FilterPill key={d} active={filters.depth.includes(d)} onClick={() => toggle("depth", d)}>{d}</FilterPill>
      ))}

      <div style={{ flex: 1, minWidth: 8 }} />
      <button onClick={() => setFilters({ intent: [], competition: [], difficulty: [], depth: [] })}
        style={{ background: "transparent", border: "none", color: C.text3, fontSize: 11.5, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}>
        Limpiar
      </button>
    </div>
  );
}

// ── SortHead ───────────────────────────────────────────────────────────────
type SortState = { key: string; dir: "asc" | "desc" };

function SortHead({ k, current, onSort, children, align = "left", w }: {
  k: string; current: SortState; onSort: (k: string) => void;
  children: React.ReactNode; align?: string; w?: number | string;
}) {
  return (
    <th onClick={() => onSort(k)} style={{
      textAlign: align as "left" | "center" | "right", width: w,
      padding: "14px 16px", fontSize: 10.5, fontWeight: 600, color: C.text3,
      letterSpacing: "0.07em", textTransform: "uppercase",
      borderBottom: `1px solid ${C.border}`,
      cursor: "pointer", userSelect: "none", whiteSpace: "nowrap",
      background: "rgba(255,255,255,0.02)",
    }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
        {children}
        {current.key === k && (current.dir === "asc" ? <IconArrowUp size={11} /> : <IconArrowDown size={11} />)}
      </span>
    </th>
  );
}

// ── Pagination ─────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;

function Pagination({ page, total, onPage }: { page: number; total: number; onPage: (p: number) => void }) {
  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (totalPages <= 1) return null;

  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  const btnBase: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    minWidth: 32, height: 32, borderRadius: 8,
    fontSize: 13, fontWeight: 500, cursor: "pointer",
    border: `1px solid ${C.border}`, fontFamily: "inherit",
    transition: "all 0.15s",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderTop: `1px solid ${C.border}`, flexWrap: "wrap", gap: 12 }}>
      <div style={{ fontSize: 12, color: C.text3 }}>
        Mostrando <span style={{ color: C.text2, fontWeight: 600 }}>{from}–{to}</span> de{" "}
        <span style={{ color: C.text2, fontWeight: 600 }}>{total}</span> keywords
      </div>

      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <button
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
          style={{ ...btnBase, background: "rgba(255,255,255,0.04)", color: page === 1 ? C.text4 : C.text2, cursor: page === 1 ? "default" : "pointer" }}
        >‹</button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`el-${i}`} style={{ color: C.text3, fontSize: 13, padding: "0 4px" }}>…</span>
          ) : (
            <button key={p} onClick={() => onPage(p as number)} style={{
              ...btnBase,
              background: p === page ? G : "rgba(255,255,255,0.04)",
              color: p === page ? "#0a0a0a" : C.text2,
              fontWeight: p === page ? 700 : 500,
              border: `1px solid ${p === page ? G : C.border}`,
            }}>{p}</button>
          )
        )}

        <button
          disabled={page === totalPages}
          onClick={() => onPage(page + 1)}
          style={{ ...btnBase, background: "rgba(255,255,255,0.04)", color: page === totalPages ? C.text4 : C.text2, cursor: page === totalPages ? "default" : "pointer" }}
        >›</button>
      </div>
    </div>
  );
}

// ── KeywordsTable ──────────────────────────────────────────────────────────
export function KeywordsTable({ keywords }: { keywords: LabsKeyword[] }) {
  const [sort, setSort] = useState<SortState>({ key: "search_volume", dir: "desc" });
  const [filters, setFilters] = useState<Filters>({ intent: [], competition: [], difficulty: [], depth: [] });
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Reset page when filters or sort change
  useEffect(() => setPage(1), [filters, sort]);

  const inDiff = (kd: number | null, b: string) => {
    if (kd == null) return false;
    return b === "easy" ? kd < 30 : b === "medium" ? kd >= 30 && kd < 50 : b === "hard" ? kd >= 50 && kd < 70 : kd >= 70;
  };

  const filtered = useMemo(() => keywords.filter(k => {
    if (filters.intent.length && !filters.intent.includes(k.main_intent ?? "")) return false;
    if (filters.competition.length && !filters.competition.includes(k.competition_level ?? "")) return false;
    if (filters.difficulty.length && !filters.difficulty.some(b => inDiff(k.keyword_difficulty, b))) return false;
    if (filters.depth.length && !filters.depth.includes(k.depth)) return false;
    return true;
  }), [keywords, filters]);

  const sortValue = (k: LabsKeyword, key: string): string | number | null => {
    switch (key) {
      case "keyword":            return k.keyword;
      case "search_volume":      return k.search_volume;
      case "keyword_difficulty": return k.keyword_difficulty;
      case "cpc":                return k.cpc;
      case "competition_level":  return k.competition_level;
      case "main_intent":        return k.main_intent;
      default:                   return null;
    }
  };

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sort.dir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      const va = sortValue(a, sort.key);
      const vb = sortValue(b, sort.key);
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === "string" && typeof vb === "string") return va.localeCompare(vb) * dir;
      return ((va as number) - (vb as number)) * dir;
    });
    return arr;
  }, [filtered, sort]);

  const paginated = useMemo(() => sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [sorted, page]);

  const toggleSort = (key: string) => setSort(s => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" });

  const toggleExpand = (kw: string) => setExpanded(s => {
    const ns = new Set(s);
    ns.has(kw) ? ns.delete(kw) : ns.add(kw);
    return ns;
  });

  const compTone = (c: string | null) =>
    c === "LOW" ? "green" : c === "MEDIUM" ? "yellow" : c === "HIGH" ? "red" : "default";
  const compLabel = (c: string | null) =>
    c === "LOW" ? "Baja" : c === "MEDIUM" ? "Media" : c === "HIGH" ? "Alta" : c ?? "—";

  return (
    <div>
      <SectionTitle
        kicker="Keywords"
        title={`${filtered.length} keywords encontradas`}
        sub="Clic en el encabezado para ordenar · usa los filtros para explorar"
        right={
          <Badge tone="default" style={{ fontSize: 12, padding: "4px 10px" }}>
            <IconLayers size={11} /> {keywords.length} totales
          </Badge>
        }
      />

      <FilterBar filters={filters} setFilters={setFilters} />

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 920 }}>
            <thead>
              <tr>
                <SortHead k="keyword"            current={sort} onSort={toggleSort}>Keyword</SortHead>
                <SortHead k="search_volume"      current={sort} onSort={toggleSort} w={160}>Volumen</SortHead>
                <SortHead k="keyword_difficulty" current={sort} onSort={toggleSort} w={110} align="center">Dificultad</SortHead>
                <SortHead k="cpc"                current={sort} onSort={toggleSort} w={90} align="right">CPC</SortHead>
                <SortHead k="competition_level"  current={sort} onSort={toggleSort} w={110} align="center">Competencia</SortHead>
                <SortHead k="main_intent"        current={sort} onSort={toggleSort} w={80} align="center">Intent</SortHead>
                <th style={{ padding: "14px 16px", fontSize: 10.5, fontWeight: 600, color: C.text3, letterSpacing: "0.07em", textTransform: "uppercase", borderBottom: `1px solid ${C.border}`, textAlign: "left", background: "rgba(255,255,255,0.02)", whiteSpace: "nowrap" }}>
                  SERP Features
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((k, i) => {
                const intentMeta = k.main_intent ? INTENT_META[k.main_intent] : null;
                const hasSubs = (k.related_keywords_sub?.length ?? 0) > 0;
                const isOpen = expanded.has(k.keyword);

                return (
                  <React.Fragment key={k.keyword}>
                    <tr
                      onClick={() => hasSubs && toggleExpand(k.keyword)}
                      style={{ transition: "background 0.12s", cursor: hasSubs ? "pointer" : "default" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Keyword */}
                      <td style={{ padding: "14px 16px", borderBottom: isOpen ? "none" : `1px solid ${C.border}`, verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {hasSubs ? (
                            <span style={{ color: C.text3, display: "inline-flex", flexShrink: 0, transition: "transform 0.15s", transform: isOpen ? "rotate(90deg)" : "none" }}>
                              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6" />
                              </svg>
                            </span>
                          ) : (
                            <span style={{ width: 13, display: "inline-block" }} />
                          )}
                          <span style={{ fontSize: 14, color: C.text, fontWeight: 500 }}>{k.keyword}</span>
                          {k.depth > 1 && (
                            <Badge tone="default" style={{ fontSize: 10, padding: "1px 6px", fontFamily: "var(--font-mono), monospace" }}>
                              D{k.depth}
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Volume + sparkline */}
                      <td style={{ padding: "14px 16px", borderBottom: isOpen ? "none" : `1px solid ${C.border}`, verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: 13, color: C.text, fontWeight: 600, minWidth: 48 }}>
                            {fmtCompact(k.search_volume)}
                          </div>
                          <Sparkline data={k.monthly_searches} w={80} h={24} />
                        </div>
                      </td>

                      {/* KD */}
                      <td style={{ padding: "14px 16px", borderBottom: isOpen ? "none" : `1px solid ${C.border}`, textAlign: "center", verticalAlign: "middle" }}>
                        {k.keyword_difficulty != null ? (
                          <div style={{ display: "inline-flex" }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: 8,
                              background: `${diffColor(k.keyword_difficulty)}22`,
                              border: `1px solid ${diffColor(k.keyword_difficulty)}55`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: diffColor(k.keyword_difficulty),
                              fontFamily: "var(--font-mono), monospace", fontSize: 11, fontWeight: 700,
                            }}>{k.keyword_difficulty}</div>
                          </div>
                        ) : <span style={{ color: C.text4 }}>—</span>}
                      </td>

                      {/* CPC */}
                      <td style={{ padding: "14px 16px", borderBottom: isOpen ? "none" : `1px solid ${C.border}`, textAlign: "right", verticalAlign: "middle" }}>
                        <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 13, color: C.text2 }}>
                          {fmtUsd(k.cpc)}
                        </span>
                      </td>

                      {/* Competition */}
                      <td style={{ padding: "14px 16px", borderBottom: isOpen ? "none" : `1px solid ${C.border}`, textAlign: "center", verticalAlign: "middle" }}>
                        {k.competition_level ? (
                          <Badge tone={compTone(k.competition_level) as "green" | "yellow" | "red" | "default"}>
                            {compLabel(k.competition_level)}
                          </Badge>
                        ) : <span style={{ color: C.text4 }}>—</span>}
                      </td>

                      {/* Intent */}
                      <td style={{ padding: "14px 16px", borderBottom: isOpen ? "none" : `1px solid ${C.border}`, textAlign: "center", verticalAlign: "middle" }}>
                        <span title={intentMeta?.label ?? k.main_intent ?? "—"} style={{ fontSize: 18 }}>
                          {intentMeta?.icon ?? "—"}
                        </span>
                      </td>

                      {/* SERP Features */}
                      <td style={{ padding: "14px 16px", borderBottom: isOpen ? "none" : `1px solid ${C.border}`, verticalAlign: "middle" }}>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {k.serp_features.slice(0, 3).map((f, j) => (
                            <Badge key={j} tone="default" style={{ fontSize: 10, padding: "2px 6px" }}>
                              {f.replace(/_/g, " ")}
                            </Badge>
                          ))}
                          {k.serp_features.length > 3 && (
                            <Badge tone="default" style={{ fontSize: 10, padding: "2px 6px" }}>
                              +{k.serp_features.length - 3}
                            </Badge>
                          )}
                          {k.serp_features.length === 0 && <span style={{ color: C.text4, fontSize: 11 }}>—</span>}
                        </div>
                      </td>
                    </tr>

                    {/* Expandable sub-keywords row */}
                    {isOpen && hasSubs && (
                      <tr style={{ background: "rgba(255,255,255,0.015)" }}>
                        <td colSpan={7} style={{ padding: "12px 20px 16px 48px", borderBottom: `1px solid ${C.border}` }}>
                          <div style={{ fontSize: 10.5, color: C.text3, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
                            Sub-keywords relacionadas
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {k.related_keywords_sub!.map((s, j) => (
                              <span key={j} style={{
                                padding: "6px 12px", borderRadius: 999,
                                background: "rgba(255,255,255,0.03)",
                                border: `1px solid ${C.border}`,
                                fontSize: 12, color: C.text2,
                                display: "inline-flex", alignItems: "center", gap: 6,
                              }}>
                                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                </svg>
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {sorted.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: C.text3, fontSize: 14 }}>
            Sin resultados con los filtros seleccionados
          </div>
        ) : (
          <Pagination page={page} total={sorted.length} onPage={setPage} />
        )}
      </Card>
    </div>
  );
}
