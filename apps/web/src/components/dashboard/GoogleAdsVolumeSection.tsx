"use client";

import { useState } from "react";
import type { KeywordData, KeywordDataItem } from "@/types/dashboard";
import { G, C, intCO } from "./googleads/shared";
import { KpiRow }           from "./googleads/KpiRow";
import { MonthlyTrend }     from "./googleads/MonthlyTrend";
import { CompetitionDonut } from "./googleads/CompetitionDonut";
import { SeasonalityCard }  from "./googleads/SeasonalityCard";
import { TopByVolume, TopByCpc } from "./googleads/TopPerformers";
import { KeywordsTable }    from "./googleads/KeywordsTable";
import { ComparativaChart } from "./googleads/ComparativaChart";
import { TrendDialog }      from "./googleads/TrendDialog";
import { OpsFooter }        from "./googleads/OpsFooter";

export function GoogleAdsVolumeSection({ data }: { data: KeywordData }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [trendKw, setTrendKw]   = useState<KeywordDataItem | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 18 }}>
            Google Ads
          </div>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.text4 }}/>
          <div style={{ fontSize: 12, color: C.text3 }}>Volumen, CPC y estacionalidad</div>
        </div>
        <h1 style={{
          fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
          fontSize: "clamp(28px, 4vw, 44px)", lineHeight: 1.1,
          color: C.text, letterSpacing: "-0.025em", marginBottom: 12,
        }}>
          Datos de <span style={{ color: G }}>Google Ads</span> para tu nicho
        </h1>
        <p style={{ fontSize: 15, color: C.text2 }}>
          {intCO.format(data.keywords_count)} keywords con datos de volumen y CPC vía Keyword Planner
        </p>
      </div>

      <KpiRow data={data}/>

      {/* 2-col: MonthlyTrend (wider) + CompetitionDonut */}
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 16, alignItems: "stretch" }}>
        <MonthlyTrend data={data.monthly_aggregated}/>
        <CompetitionDonut dist={data.competition_distribution}/>
      </div>

      {/* Full-width seasonality */}
      <SeasonalityCard items={data.most_seasonal_keywords} allKeywords={data.keywords}/>

      {/* 2-col: Top performers */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <TopByVolume items={data.top_keywords_by_volume}/>
        <TopByCpc    items={data.top_keywords_by_cpc}/>
      </div>

      {/* Master table */}
      <KeywordsTable
        keywords={data.keywords}
        selected={selected}
        setSelected={setSelected}
        onOpenTrend={setTrendKw}
      />

      {/* Multi-keyword comparativa */}
      <ComparativaChart
        keywords={data.keywords}
        selected={selected}
        setSelected={setSelected}
      />

      <OpsFooter data={data}/>

      <TrendDialog kw={trendKw} onClose={() => setTrendKw(null)}/>
    </div>
  );
}
