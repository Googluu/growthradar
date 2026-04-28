export type MetricStatus = "good" | "needs_improvement" | "poor";

export interface CWVMetric {
  label: string;
  value: string;
  status: MetricStatus;
  barPct: number;
}

export interface SEOCheck {
  ok: boolean;
  label: string;
}

export interface Recommendation {
  badge: string;
  title: string;
  problem: string;
  action: string;
  impact: string;
  effort: string;
  accent: string;
}

export interface AuditResult {
  url: string;
  scores: {
    overall: number;
    performance: number;
    seo: number;
  };
  ai_summary: string;
  metrics: CWVMetric[];
  checks: SEOCheck[];
  domain_stats: Array<{ val: string; lbl: string }>;
  recommendations: Recommendation[];
}
