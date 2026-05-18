export interface AuditFormData {
  domain: string;
  businessName: string;
  keywords: string[];
  countryCode: number;
  googleBusiness: string;
}

export interface SerpSitelink {
  title: string;
  url: string;
  description?: string;
}

export interface SerpOrganic {
  rank_absolute: number;
  rank_group?: number;
  position?: string;
  title: string;
  url: string;
  domain: string;
  description?: string;
  breadcrumb?: string;
  website_name?: string;
  is_featured_snippet: boolean;
  is_image?: boolean;
  is_video?: boolean;
  highlighted: string[];
  sitelinks: SerpSitelink[];
}

export interface SerpTargetVisibility {
  domain: string;
  found: boolean;
  position: number | null;
  url: string | null;
  in_top_3: boolean;
  in_top_10: boolean;
  is_featured_snippet: boolean;
}

export interface SerpAiOverviewRef {
  domain: string;
  url: string;
  title: string;
  source: string;
}

export interface SerpAiOverview {
  markdown: string;
  references: SerpAiOverviewRef[];
  references_count: number;
}

export interface SerpRankingDistribution {
  top_3: number;
  top_10: number;
  top_20: number;
  top_100: number;
}

export interface SerpPerspective {
  title: string;
  url: string;
  domain: string;
  source: string;
  date?: string;
}

export interface SerpData {
  keyword: string;
  datetime: string;
  check_url: string;
  se_domain?: string;
  location_code?: number;
  language_code?: string;
  total_results_google: number;
  items_count?: number;
  organic_results_count: number;
  average_position: number | null;
  serp_features: string[];
  serp_features_count: number;
  has_ai_overview: boolean;
  ai_overview: SerpAiOverview | null;
  ranking_distribution: SerpRankingDistribution;
  top_3_domains: string[];
  top_10_domains: string[];
  featured_snippet_domain: string | null;
  target_visibility: SerpTargetVisibility | null;
  organic_results: SerpOrganic[];
  related_searches: string[];
  perspectives: SerpPerspective[];
  perspectives_count: number;
  cost: number;
  task_time: string;
  task_status_code?: number;
}

export interface DashboardAuditResult {
  domain: string;
  keyword: string;
  total_cost_usd: number;
  sections: {
    serp?: SerpData | { error: string; detail?: string };
    labs?: Record<string, unknown>;
    keyword_data?: Record<string, unknown>;
    onpage?: Record<string, unknown>;
  };
  errors: string[];
}
