"use client";

import type { KeywordDataItem } from "@/types/dashboard";
import { G, RD, C, fmtCompact, monthShort, Badge, Card, SectionTitle, Sparkline, IconTrendUp } from "./shared";

type SeasonalItem = { keyword: string; variation: number; peak_volume: number; trough_volume: number };

export function SeasonalityCard({ items, allKeywords }: {
  items: SeasonalItem[];
  allKeywords: KeywordDataItem[];
}) {
  if (!items?.length) return null;

  return (
    <Card style={{ padding: 28 }}>
      <SectionTitle
        kicker="Estacionalidad"
        title="Estacionalidad detectada"
        sub="Keywords con mayor variación entre pico y valle"
        right={
          <Badge tone="green" style={{ fontSize: 12, padding: "4px 10px" }}>
            <IconTrendUp size={11}/> {items.length} con patrón claro
          </Badge>
        }
      />
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
        {items.map((k, i) => {
          const fullKw = allKeywords.find(kw => kw.keyword === k.keyword);
          const monthly = fullKw?.monthly_searches ?? [];
          const peakM   = monthly.find(m => m.search_volume === k.peak_volume);
          const troughM = monthly.find(m => m.search_volume === k.trough_volume);
          const peakYM   = peakM   ? `${peakM.year}-${String(peakM.month).padStart(2,"0")}` : null;
          const troughYM = troughM ? `${troughM.year}-${String(troughM.month).padStart(2,"0")}` : null;
          const varTone = k.variation > 1 ? "red" : k.variation > 0.5 ? "orange" : "yellow";

          return (
            <div key={k.keyword} style={{
              display: "grid",
              gridTemplateColumns: monthly.length ? "24px 1fr 160px auto auto" : "24px 1fr auto auto",
              alignItems: "center", gap: 16,
              padding: "12px 16px",
              background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`, borderRadius: 12,
            }}>
              <div style={{ fontFamily: "monospace", fontSize: 11, color: C.text3, fontWeight: 600 }}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <div>
                <div style={{ fontSize: 14, color: C.text, fontWeight: 500, marginBottom: 3 }}>{k.keyword}</div>
                <div style={{ fontSize: 11, color: C.text3, display: "flex", gap: 12, fontFamily: "monospace" }}>
                  <span>
                    <span style={{ color: G }}>▲</span>{" "}
                    {peakYM ? `${monthShort(peakYM)} · ` : ""}{fmtCompact(k.peak_volume)}
                  </span>
                  <span>
                    <span style={{ color: RD }}>▼</span>{" "}
                    {troughYM ? `${monthShort(troughYM)} · ` : ""}{fmtCompact(k.trough_volume)}
                  </span>
                </div>
              </div>
              {monthly.length > 0 && (
                <Sparkline
                  data={monthly}
                  markPeakTrough
                  w={140} h={36}
                  uid={`seas-${k.keyword.replace(/\s/g, "")}`}
                />
              )}
              <Badge tone={varTone}>
                <IconTrendUp size={10}/> +{(k.variation * 100).toFixed(0)}%
              </Badge>
              <div style={{ fontSize: 11, color: C.text3, fontFamily: "monospace" }}>variación</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
