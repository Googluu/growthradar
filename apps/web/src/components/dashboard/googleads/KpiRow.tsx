"use client";

import type { KeywordData } from "@/types/dashboard";
import {
  G, RD, C, Gs, Gb,
  fmtCompact, usd, intCO,
  Card, Tooltip,
  IconBars, IconDollar, IconArrowsUD, IconCoins, IconInfo,
} from "./shared";

function KpiCard({ icon, label, value, sub, accent, info }: {
  icon: React.ReactNode; label: string; value: React.ReactNode;
  sub?: string; accent?: boolean; info?: string;
}) {
  return (
    <Card style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12, minHeight: 144 }} accent={accent}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: accent ? Gs : "rgba(255,255,255,0.06)",
          color: accent ? G : C.text2,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: `1px solid ${accent ? Gb : C.border}`,
        }}>{icon}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            fontSize: 10.5, color: C.text3, letterSpacing: "0.07em",
            textTransform: "uppercase" as const, fontWeight: 600, textAlign: "right" as const,
          }}>{label}</div>
          {info && (
            <Tooltip content={info}>
              <span style={{ color: C.text4, display: "inline-flex", cursor: "help" }}>
                <IconInfo size={13}/>
              </span>
            </Tooltip>
          )}
        </div>
      </div>
      <div style={{ marginTop: "auto" }}>
        <div style={{
          fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
          fontSize: 32, lineHeight: 1, color: accent ? G : C.text,
          letterSpacing: "-0.02em",
        }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: C.text3, marginTop: 6 }}>{sub}</div>}
      </div>
    </Card>
  );
}

export function KpiRow({ data }: { data: KeywordData }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
      <KpiCard
        icon={<IconBars size={18}/>}
        label="Volumen total"
        value={fmtCompact(data.total_search_volume)}
        sub={`${intCO.format(data.total_search_volume)} búsquedas/mes`}
        accent
      />
      <KpiCard
        icon={<IconDollar size={18}/>}
        label="CPC promedio"
        value={usd(data.avg_cpc)}
        sub={`a través de ${data.keywords_count} keywords`}
      />
      <KpiCard
        icon={<IconArrowsUD size={18}/>}
        label="Rango CPC"
        value={
          <span style={{ display: "inline-flex", alignItems: "baseline", gap: 8, lineHeight: 1 }}>
            <span style={{ color: G }}>{usd(data.min_cpc)}</span>
            <span style={{ color: C.text4, fontSize: 18, fontWeight: 400 }}>→</span>
            <span style={{ color: RD }}>{usd(data.max_cpc)}</span>
          </span>
        }
        sub="puja mínima → máxima top de página"
      />
      <KpiCard
        icon={<IconCoins size={18}/>}
        label="Costo PPC estimado"
        value={usd(data.total_ppc_cost_estimate_usd, 0)}
        sub="suma de pujas máximas"
        info="1 clic por keyword al CPC máximo"
      />
    </div>
  );
}
