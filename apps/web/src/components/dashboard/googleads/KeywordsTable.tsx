"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import type { KeywordDataItem } from "@/types/dashboard";
import {
  G, C, Gs, Gb,
  COMP_META, SERIES_COLORS,
  fmtCompact, usd,
  Badge, Card, SectionTitle, Sparkline,
  IconSearch, IconFilter, IconX, IconChart, IconArrowUp, IconArrowDown, IconLayers, IconCheck,
  type Tone,
} from "./shared";

// ── MultiSelect ───────────────────────────────────────────────────────────────
function MultiSelect({ label, value, options, onChange }: {
  label: string;
  value: string[];
  options: Array<{ value: string; label: string }>;
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [open]);

  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: value.length ? Gs : "rgba(255,255,255,0.04)",
        border: `1px solid ${value.length ? Gb : C.border}`,
        color: value.length ? G : C.text2,
        padding: "7px 12px", borderRadius: 8,
        fontSize: 12.5, fontWeight: 500, cursor: "pointer",
      }}>
        <IconFilter size={12}/>
        {label}
        {value.length > 0 && (
          <span style={{
            background: G, color: C.bg, fontSize: 10, fontWeight: 700,
            padding: "1px 6px", borderRadius: 999, fontFamily: "monospace",
          }}>{value.length}</span>
        )}
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 20,
          background: "#141414", border: `1px solid ${C.borderStr}`,
          borderRadius: 10, padding: 6, minWidth: 160,
          boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
        }}>
          {options.map(opt => {
            const active = value.includes(opt.value);
            return (
              <button key={opt.value} onClick={() => toggle(opt.value)} style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: "8px 10px", borderRadius: 6,
                background: active ? "rgba(34,197,94,0.08)" : "transparent",
                border: "none", color: C.text, fontSize: 13,
                cursor: "pointer", textAlign: "left" as const,
              }}>
                <div style={{
                  width: 16, height: 16, borderRadius: 4,
                  border: `1px solid ${active ? G : C.border}`,
                  background: active ? G : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: C.bg, flexShrink: 0,
                }}>
                  {active && <IconCheck size={11} sw={3}/>}
                </div>
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── KeywordsTable ─────────────────────────────────────────────────────────────
export function KeywordsTable({ keywords, selected, setSelected, onOpenTrend }: {
  keywords: KeywordDataItem[];
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
  onOpenTrend: (k: KeywordDataItem) => void;
}) {
  const [sort, setSort] = useState<{ key: keyof KeywordDataItem; dir: "asc" | "desc" }>({ key: "search_volume", dir: "desc" });
  const [search, setSearch]       = useState("");
  const [minVol, setMinVol]       = useState("");
  const [maxVol, setMaxVol]       = useState("");
  const [compFilter, setCompFilter] = useState<string[]>([]);

  const filtered = useMemo(() => keywords.filter(k => {
    if (search && !k.keyword.toLowerCase().includes(search.toLowerCase())) return false;
    if (compFilter.length && k.competition && !compFilter.includes(k.competition)) return false;
    const v = k.search_volume ?? 0;
    if (minVol && v < +minVol) return false;
    if (maxVol && v > +maxVol) return false;
    return true;
  }), [keywords, search, minVol, maxVol, compFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sort.dir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      const va = (a as any)[sort.key], vb = (b as any)[sort.key];
      if (va == null) return 1; if (vb == null) return -1;
      if (typeof va === "string") return va.localeCompare(vb) * dir;
      return (va - vb) * dir;
    });
    return arr;
  }, [filtered, sort]);

  const toggleSort = (key: keyof KeywordDataItem) =>
    setSort(s => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" });

  const toggleSelected = (kw: string) =>
    setSelected(s => s.includes(kw) ? s.filter(x => x !== kw) : s.length >= 8 ? s : [...s, kw]);

  const hasFilters = !!(search || minVol || maxVol || compFilter.length);

  const thStyle: React.CSSProperties = {
    padding: "14px 16px", fontSize: 10.5, fontWeight: 600, color: C.text3,
    letterSpacing: "0.07em", textTransform: "uppercase",
    borderBottom: `1px solid ${C.border}`,
    background: "rgba(255,255,255,0.02)", cursor: "pointer", userSelect: "none",
    whiteSpace: "nowrap",
  };

  const SortHead = ({ k, children, align }: { k: keyof KeywordDataItem; children: React.ReactNode; align?: string }) => (
    <th style={{ ...thStyle, textAlign: (align || "left") as any }} onClick={() => toggleSort(k)}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
        {children}
        {sort.key === k && (sort.dir === "asc" ? <IconArrowUp size={11}/> : <IconArrowDown size={11}/>)}
      </span>
    </th>
  );

  return (
    <div>
      <SectionTitle
        kicker="Tabla maestra"
        title={`${filtered.length} keywords`}
        sub="Selecciona keywords para comparar (máx. 8) o abre la tendencia detallada"
        right={
          <Badge tone="default" style={{ fontSize: 12, padding: "4px 10px" }}>
            <IconLayers size={11}/> {keywords.length} totales
          </Badge>
        }
      />

      {/* Filter bar */}
      <div style={{
        display: "flex", gap: 10, alignItems: "center",
        padding: "12px 14px", background: "rgba(255,255,255,0.02)",
        borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 14, flexWrap: "wrap" as const,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 8,
          background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, flex: 1, minWidth: 200,
        }}>
          <IconSearch size={14} style={{ color: C.text3 }}/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar keyword..."
            style={{ flex: 1, fontSize: 13, color: C.text, background: "none", border: "none", outline: "none" }}/>
          {search && (
            <button onClick={() => setSearch("")} style={{ background: "transparent", border: "none", color: C.text3, cursor: "pointer", display: "inline-flex", padding: 0 }}>
              <IconX size={13}/>
            </button>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, color: C.text3 }}>Volumen:</span>
          {(["Min", "Max"] as const).map(p => (
            <input key={p} value={p === "Min" ? minVol : maxVol}
              onChange={e => { const v = e.target.value.replace(/\D/g, ""); p === "Min" ? setMinVol(v) : setMaxVol(v); }}
              placeholder={p} inputMode="numeric"
              style={{
                width: 80, fontSize: 12.5, color: C.text, padding: "7px 10px", borderRadius: 8,
                background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
                fontFamily: "monospace", outline: "none",
              }}/>
          ))}
        </div>

        <MultiSelect
          label="Competencia"
          value={compFilter}
          options={[
            { value: "LOW",    label: "Baja"   },
            { value: "MEDIUM", label: "Media"  },
            { value: "HIGH",   label: "Alta"   },
          ]}
          onChange={setCompFilter}
        />

        {hasFilters && (
          <button onClick={() => { setSearch(""); setMinVol(""); setMaxVol(""); setCompFilter([]); }}
            style={{ background: "transparent", border: "none", color: C.text3, fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>
            Limpiar filtros
          </button>
        )}
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, cursor: "default", width: 36 }}/>
                <SortHead k="keyword">Keyword</SortHead>
                <SortHead k="search_volume">Volumen</SortHead>
                <SortHead k="competition" align="center">Competencia</SortHead>
                <SortHead k="competition_index">Índice</SortHead>
                <SortHead k="cpc" align="right">CPC</SortHead>
                <SortHead k="high_top_of_page_bid">Rango puja</SortHead>
                <th style={{ ...thStyle, textAlign: "center", cursor: "default", width: 110 }}>Tendencia</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(k => {
                const isSelected   = selected.includes(k.keyword);
                const compMeta     = k.competition ? COMP_META[k.competition] : null;
                const seriesColor  = isSelected ? SERIES_COLORS[selected.indexOf(k.keyword) % SERIES_COLORS.length] : C.border;
                const cellBorder   = `1px solid ${C.border}`;

                return (
                  <tr key={k.keyword}
                    style={{ background: isSelected ? "rgba(34,197,94,0.04)" : "transparent", transition: "background 0.12s" }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}
                    onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>

                    {/* Checkbox */}
                    <td style={{ padding: "12px 16px", borderBottom: cellBorder }}>
                      <button onClick={() => toggleSelected(k.keyword)}
                        title={isSelected ? "Quitar de comparativa" : "Agregar a comparativa"}
                        style={{
                          width: 18, height: 18, borderRadius: 5,
                          border: `1.5px solid ${isSelected ? seriesColor : C.border}`,
                          background: isSelected ? seriesColor : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: C.bg, cursor: "pointer", padding: 0,
                        }}>
                        {isSelected && <IconCheck size={11} sw={3}/>}
                      </button>
                    </td>

                    {/* Keyword */}
                    <td style={{ padding: "12px 16px", borderBottom: cellBorder }}>
                      <span style={{ fontSize: 14, color: C.text, fontWeight: 500 }}>{k.keyword}</span>
                    </td>

                    {/* Volume + sparkline */}
                    <td style={{ padding: "12px 16px", borderBottom: cellBorder }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontFamily: "monospace", fontSize: 13, color: C.text, fontWeight: 600, minWidth: 52 }}>
                          {fmtCompact(k.search_volume)}
                        </span>
                        {k.monthly_searches?.length > 1 && (
                          <Sparkline data={k.monthly_searches} w={70} h={22}
                            uid={`gads-tbl-${k.keyword.replace(/\s/g,"")}`}/>
                        )}
                      </div>
                    </td>

                    {/* Competition badge */}
                    <td style={{ padding: "12px 16px", borderBottom: cellBorder, textAlign: "center" }}>
                      {compMeta
                        ? <Badge tone={compMeta.tone as Tone}>{compMeta.label}</Badge>
                        : <span style={{ color: C.text4 }}>—</span>}
                    </td>

                    {/* Competition index bar */}
                    <td style={{ padding: "12px 16px", borderBottom: cellBorder }}>
                      {k.competition_index != null ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ flex: 1, height: 6, borderRadius: 999, background: "rgba(255,255,255,0.05)", overflow: "hidden", minWidth: 60, maxWidth: 100 }}>
                            <div style={{
                              width: `${k.competition_index}%`, height: "100%", borderRadius: 999,
                              background: k.competition_index >= 70 ? "#ef4444" : k.competition_index >= 40 ? "#fbbf24" : G,
                            }}/>
                          </div>
                          <span style={{ fontFamily: "monospace", fontSize: 11, color: C.text2, fontWeight: 600, minWidth: 24, textAlign: "right" as const }}>
                            {k.competition_index}
                          </span>
                        </div>
                      ) : <span style={{ color: C.text4 }}>—</span>}
                    </td>

                    {/* CPC */}
                    <td style={{ padding: "12px 16px", borderBottom: cellBorder, textAlign: "right" }}>
                      <span style={{ fontFamily: "monospace", fontSize: 13, color: C.text, fontWeight: 600 }}>
                        {usd(k.cpc)}
                      </span>
                    </td>

                    {/* Bid range */}
                    <td style={{ padding: "12px 16px", borderBottom: cellBorder }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "monospace", fontSize: 12 }}>
                        <span style={{ color: G }}>{usd(k.low_top_of_page_bid)}</span>
                        <span style={{ color: C.text4 }}>→</span>
                        <span style={{ color: "#ef4444" }}>{usd(k.high_top_of_page_bid)}</span>
                      </div>
                    </td>

                    {/* Trend button */}
                    <td style={{ padding: "12px 16px", borderBottom: cellBorder, textAlign: "center" }}>
                      {k.monthly_searches?.length > 0 && (
                        <button onClick={() => onOpenTrend(k)} style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
                          color: C.text2, fontSize: 12, fontWeight: 500,
                          padding: "6px 10px", borderRadius: 7, cursor: "pointer",
                        }}
                        onMouseEnter={e => { const b = e.currentTarget; b.style.background = Gs; b.style.borderColor = "#22c55e60"; b.style.color = G; }}
                        onMouseLeave={e => { const b = e.currentTarget; b.style.background = "rgba(255,255,255,0.04)"; b.style.borderColor = C.border; b.style.color = C.text2; }}>
                          <IconChart size={11}/> Ver
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {sorted.length === 0 && (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: C.text3 }}>
                  No hay keywords que coincidan con los filtros.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
