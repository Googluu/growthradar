"use client";

import type { OnPageData, Recommendation } from "@/types/dashboard";
import { scoreColor, C, Card, SectionTitle } from "./onpage/shared";
import { HeroCard }               from "./onpage/HeroCard";
import { HttpStatusDonut }        from "./onpage/HttpStatusDonut";
import { IssuesCard }             from "./onpage/IssuesCard";
import { PassingChecksCard }      from "./onpage/PassingChecksCard";
import { PerformanceGauges }      from "./onpage/PerformanceGauges";
import { ResourcesBar }           from "./onpage/ResourcesBar";
import { HeadingsHierarchy }      from "./onpage/HeadingsHierarchy";
import { ContentMetrics }         from "./onpage/ContentMetrics";
import { ResourceErrorsCard }     from "./onpage/ResourceErrorsCard";
import { SocialPreviews }         from "./onpage/SocialPreviews";
import { OpsFooter }              from "./onpage/OpsFooter";
import { RecommendationsCard }    from "./onpage/RecommendationsCard";

export function OnPageAuditSection({
  data,
  recommendations,
}: {
  data: OnPageData;
  recommendations?: Recommendation[];
}) {
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>

      {/* Hero: URL + RadialScore + KPIs */}
      <HeroCard data={data} />

      {/* HTTP status donut + quick summary */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 2fr",
        gap: 16, alignItems: "stretch",
      }}>
        <HttpStatusDonut statusCode={data.status_code} statusClass={data.health.http_status_class} />
        <Card style={{ padding: 24, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <SectionTitle title="Resumen rápido" sub="Lo principal que aprender de esta auditoría" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
            {[
              { label: "OnPage Score",  value: data.health.onpage_score,          of: 100,  color: scoreColor(data.health.onpage_score) },
              { label: "Health Score",  value: data.health.computed_health_score,  of: 100,  color: scoreColor(data.health.computed_health_score) },
              { label: "Issues",         value: data.health.issues_count,           of: null, color: "#ef4444" },
              { label: "Checks ✓",       value: data.health.passing_count,          of: null, color: "#22c55e" },
            ].map((s, i) => (
              <div key={i} style={{
                padding: "12px 14px", borderRadius: 10,
                background: "rgba(255,255,255,0.025)",
                border: `1px solid ${C.border}`,
              }}>
                <div style={{
                  fontSize: 10.5, color: C.text3, letterSpacing: "0.06em",
                  textTransform: "uppercase", fontWeight: 600,
                }}>{s.label}</div>
                <div style={{
                  fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
                  fontSize: 22, color: s.color, lineHeight: 1.1, marginTop: 4,
                }}>
                  {s.value}
                  {s.of != null && (
                    <span style={{ color: C.text3, fontWeight: 500, fontSize: 14 }}>/{s.of}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Issues + Passing checks */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "stretch" }}>
        <IssuesCard issues={data.issues} />
        <PassingChecksCard checks={data.passing_checks} />
      </div>

      {/* Core Web Vitals performance gauges */}
      <PerformanceGauges perf={data.performance} />

      {/* Page weight breakdown */}
      <ResourcesBar rb={data.resources_breakdown} pageSize={data.performance.page_size_bytes} />

      {/* Headings + Content metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, alignItems: "stretch" }}>
        <HeadingsHierarchy headings={data.headings} headingsCount={data.headings_count} />
        <ContentMetrics content={data.content} />
      </div>

      {/* Resource errors / warnings */}
      <ResourceErrorsCard errors={data.resource_errors} warnings={data.resource_warnings} />

      {/* Social previews: Google + FB + Twitter */}
      <SocialPreviews data={data} />

      {/* Recommendations from AI audit */}
      {recommendations && recommendations.length > 0 && (
        <RecommendationsCard recommendations={recommendations} />
      )}

      {/* Ops footer: cost + time + link */}
      <OpsFooter data={data} />
    </div>
  );
}
