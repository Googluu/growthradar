"use client";

import type { KeywordDataItem } from "@/types/dashboard";
import { G, RD, C, fmtCompact, usd, Card, SectionTitle, IconBars, IconDollar } from "./shared";

export function TopByVolume({ items }: { items: KeywordDataItem[] }) {
  const max = Math.max(...items.map(k => k.search_volume ?? 0));
  return (
    <Card style={{ padding: 24, height: "100%" }}>
      <SectionTitle
        title="Top por volumen"
        sub="Keywords con más búsquedas/mes"
        right={<IconBars size={18} style={{ color: G }}/>}
      />
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
        {items.map((k, i) => (
          <div key={k.keyword} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              fontFamily: "monospace", fontSize: 11,
              color: i === 0 ? G : C.text3, fontWeight: 700, width: 20, flexShrink: 0,
            }}>{i + 1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                <span style={{
                  fontSize: 13, color: C.text, fontWeight: 500,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, maxWidth: "60%",
                }}>{k.keyword}</span>
                <span style={{ fontFamily: "monospace", fontSize: 12, color: C.text, fontWeight: 600 }}>
                  {fmtCompact(k.search_volume)}
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
                <div style={{
                  width: `${((k.search_volume ?? 0) / max) * 100}%`, height: "100%",
                  background: `linear-gradient(90deg, ${G}, ${G}cc)`, borderRadius: 999,
                  boxShadow: i === 0 ? `0 0 12px ${G}40` : "none",
                }}/>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function TopByCpc({ items }: { items: KeywordDataItem[] }) {
  return (
    <Card style={{ padding: 24, height: "100%" }}>
      <SectionTitle
        title="Más caros (PPC)"
        sub="Mayor CPC en Google Ads"
        right={<IconDollar size={18} style={{ color: RD }}/>}
      />
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
        {items.map((k, i) => (
          <div key={k.keyword} style={{
            display: "grid", gridTemplateColumns: "20px 1fr auto", alignItems: "center", gap: 12,
            padding: "10px 12px", borderRadius: 10,
            background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`,
          }}>
            <div style={{ fontFamily: "monospace", fontSize: 11, color: i === 0 ? RD : C.text3, fontWeight: 700 }}>{i + 1}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 13, color: C.text, fontWeight: 500,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, marginBottom: 3,
              }}>{k.keyword}</div>
              <div style={{ fontSize: 11, color: C.text3, fontFamily: "monospace" }}>
                puja{" "}
                <span style={{ color: G }}>{usd(k.low_top_of_page_bid)}</span>
                {" → "}
                <span style={{ color: RD }}>{usd(k.high_top_of_page_bid)}</span>
              </div>
            </div>
            <div style={{
              fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 18,
              color: i === 0 ? RD : C.text,
            }}>{usd(k.cpc)}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
