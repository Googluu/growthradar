"use client";

import type { LabsData } from "@/types/dashboard";
import { G, C } from "./keyword/shared";
import { KpiGrid }           from "./keyword/KpiGrid";
import { MonthlyChart }      from "./keyword/MonthlyChart";
import { IntentDonut }       from "./keyword/IntentDonut";
import { CompetitionBar }    from "./keyword/CompetitionBar";
import { DifficultyBuckets } from "./keyword/DifficultyBuckets";
import { LowHangingFruit }   from "./keyword/LowHangingFruit";
import { KeywordsTable }     from "./keyword/KeywordsTable";
import { OpsFooter }         from "./keyword/OpsFooter";

export function KeywordResearchSection({ data }: { data: LabsData }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 18 }}>
            Investigación de keywords
          </div>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.text4 }} />
          <div style={{ fontSize: 12, color: C.text3 }}>Análisis completo del universo semántico</div>
        </div>
        <h1 style={{
          fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
          fontSize: "clamp(28px, 4vw, 44px)", lineHeight: 1.1,
          color: C.text, letterSpacing: "-0.025em", marginBottom: 12,
        }}>
          <span style={{ color: C.text3 }}>"</span>
          {data.seed_keyword}
          <span style={{ color: C.text3 }}>"</span>
        </h1>
        <p style={{ fontSize: 15, color: C.text2 }}>
          Analizadas{" "}
          <strong style={{ color: C.text, fontWeight: 600 }}>{data.items_count}</strong>
          {" "}keywords de un total de{" "}
          <strong style={{ color: C.text, fontWeight: 600 }}>{data.total_count.toLocaleString("es-CO")}</strong>
          {" "}encontradas
        </p>
      </div>

      {/* KPIs */}
      <KpiGrid data={data} />

      {/* Monthly trend */}
      <MonthlyChart data={data} />

      {/* 3-col: Intent · Competition · Difficulty */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, alignItems: "stretch" }}>
        <IntentDonut      dist={data.intent_distribution}     />
        <CompetitionBar   dist={data.competition_distribution} />
        <DifficultyBuckets buckets={data.difficulty_buckets}  />
      </div>

      {/* Low hanging fruit */}
      <LowHangingFruit items={data.low_hanging_fruit} />

      {/* Full keyword table */}
      <KeywordsTable keywords={data.keywords} />

      {/* Footer */}
      <OpsFooter data={data} />

    </div>
  );
}
