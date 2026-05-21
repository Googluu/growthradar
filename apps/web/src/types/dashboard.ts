// ── Form ──────────────────────────────────────────────────────────────────────
export interface AuditFormData {
  domain: string;
  businessName: string;
  keywords: string[];
  countryCode: number;
  googleBusiness: string;
}

// ── SERP ──────────────────────────────────────────────────────────────────────
export interface SerpSitelink { title: string; url: string; description?: string }
export interface SerpOrganic {
  rank_absolute: number; rank_group?: number; position?: string;
  title: string; url: string; domain: string;
  description?: string; breadcrumb?: string; website_name?: string;
  is_featured_snippet: boolean; is_image?: boolean; is_video?: boolean;
  highlighted: string[]; sitelinks: SerpSitelink[];
}
export interface SerpTargetVisibility {
  domain: string; found: boolean; position: number | null; url: string | null;
  in_top_3: boolean; in_top_10: boolean; is_featured_snippet: boolean;
}
export interface SerpAiOverviewRef { domain: string; url: string; title: string; source: string }
export interface SerpAiOverview { markdown: string; references: SerpAiOverviewRef[]; references_count: number }
export interface SerpRankingDistribution { top_3: number; top_10: number; top_20: number; top_100: number }
export interface SerpPerspective { title: string; url: string; domain: string; source: string; date?: string }
export interface SerpData {
  keyword: string; datetime: string; check_url: string;
  se_domain?: string; location_code?: number; language_code?: string;
  total_results_google: number; items_count?: number;
  organic_results_count: number; average_position: number | null;
  serp_features: string[]; serp_features_count: number;
  has_ai_overview: boolean; ai_overview: SerpAiOverview | null;
  ranking_distribution: SerpRankingDistribution;
  top_3_domains: string[]; top_10_domains: string[];
  featured_snippet_domain: string | null;
  target_visibility: SerpTargetVisibility | null;
  organic_results: SerpOrganic[];
  related_searches: string[]; perspectives: SerpPerspective[]; perspectives_count: number;
  cost: number; task_time: string; task_status_code?: number;
}

// ── Labs (Keyword Research) ───────────────────────────────────────────────────
export interface MonthlySearch { year: number; month: number; search_volume: number }
export interface LabsKeyword {
  keyword: string; depth: number;
  search_volume: number | null; competition: number | null;
  competition_level: string | null; cpc: number | null;
  low_top_of_page_bid: number | null; high_top_of_page_bid: number | null;
  keyword_difficulty: number | null; main_intent: string | null;
  monthly_searches: MonthlySearch[];
  serp_features: string[];
}
export interface LabsData {
  seed_keyword: string; total_count: number; items_count: number;
  keywords: LabsKeyword[];
  total_search_volume: number; avg_search_volume: number;
  avg_cpc: number; max_cpc: number; avg_difficulty: number;
  estimated_traffic_value_usd: number;
  competition_distribution: Record<string, number>;
  intent_distribution: Record<string, number>;
  difficulty_buckets: { easy: number; medium: number; hard: number; very_hard: number };
  top_keywords_by_volume: LabsKeyword[];
  low_hanging_fruit: LabsKeyword[];
  monthly_aggregated: Array<{ year_month: string; search_volume: number }>;
  cost: number; task_time: string;
}

// ── Keyword Data (Google Ads Volume) ─────────────────────────────────────────
export interface KeywordDataItem {
  keyword: string; search_volume: number | null;
  competition: string | null; competition_index: number | null;
  cpc: number | null; low_top_of_page_bid: number | null; high_top_of_page_bid: number | null;
  monthly_searches: MonthlySearch[];
}
export interface KeywordData {
  keywords: KeywordDataItem[]; keywords_count: number;
  total_search_volume: number; avg_search_volume: number;
  avg_cpc: number; max_cpc: number; min_cpc: number;
  total_ppc_cost_estimate_usd: number;
  competition_distribution: Record<string, number>;
  top_keywords_by_volume: KeywordDataItem[];
  top_keywords_by_cpc: KeywordDataItem[];
  monthly_aggregated: Array<{ year_month: string; search_volume: number }>;
  most_seasonal_keywords: Array<{ keyword: string; variation: number; peak_volume: number; trough_volume: number }>;
  cost: number; task_time: string;
}

// ── OnPage Audit ──────────────────────────────────────────────────────────────
export interface OnPageHealth {
  onpage_score: number; computed_health_score: number;
  issues_count: number; issues_critical_count: number;
  passing_count: number; is_indexable: boolean; http_status_class: string;
}
export interface OnPageIssue { check: string; label: string; severity: string }
export interface OnPagePassingCheck { check: string; label: string }
export interface OnPageData {
  url: string; status_code: number;
  title: string; title_length: number;
  description: string; description_length: number;
  h1_text: string[]; h1_count: number;
  canonical: string | null;
  internal_links_count: number; external_links_count: number;
  images_count: number; images_without_alt: number;
  is_https: boolean; has_meta_title: boolean; has_meta_description: boolean;
  has_h1: boolean; has_sitemap: boolean; has_robots_txt: boolean;
  page_size_bytes: number; onpage_score_dataforseo: number;
  health: OnPageHealth;
  issues: OnPageIssue[];
  passing_checks: OnPagePassingCheck[];
  duplicate_title: boolean;
  duplicate_description: boolean;
  performance: {
    time_to_interactive_ms: number | null; dom_complete_ms: number | null;
    largest_contentful_paint: number | null; first_input_delay: number | null;
    cumulative_layout_shift: number | null;
    connection_time_ms: number | null; waiting_time_ms: number | null;
    download_time_ms: number | null; duration_time_ms: number | null;
    total_dom_size_bytes: number; page_size_bytes: number;
    encoded_size_bytes: number; total_transfer_size_bytes: number;
  };
  headings: { h1: string[]; h2: string[]; h3: string[]; h4: string[]; h5: string[]; h6: string[] };
  headings_count: { h1: number; h2: number; h3: number; h4: number; h5: number; h6: number };
  content: {
    plain_text_size: number | null; plain_text_rate: number | null;
    plain_text_word_count: number | null; automated_readability_index: number | null;
    flesch_kincaid_readability_index: number | null;
    smog_readability_index: number | null;
    coleman_liau_readability_index: number | null;
    dale_chall_readability_index: number | null;
    title_to_content_consistency: number | null;
    description_to_content_consistency: number | null;
    meta_keywords_to_content_consistency: number | null;
  };
  resources_breakdown: {
    scripts_count: number; scripts_size: number;
    stylesheets_count: number; stylesheets_size: number;
    images_count: number; images_size: number;
    render_blocking_scripts_count: number; render_blocking_stylesheets_count: number;
  };
  resource_errors: Array<{ line: number; column: number; message: string; status_code: number }>;
  resource_warnings: Array<{ line: number; column: number; message: string; status_code: number }>;
  social_media_tags: Record<string, string>;
  favicon: string | null; meta_keywords: string | null;
  cost: number; task_time: string;
}

// ── CrUX (Core Web Vitals) ────────────────────────────────────────────────────
export type CrUXRating = "good" | "needs_improvement" | "poor" | "no_data";
export interface CrUXMetric { p75: number | null; unit: string; rating: CrUXRating }
export interface CrUXData {
  origin: string; form_factor: string;
  collection_period: { from: string | null; to: string | null };
  metrics: {
    largest_contentful_paint: CrUXMetric;
    interaction_to_next_paint: CrUXMetric;
    cumulative_layout_shift: CrUXMetric;
    first_contentful_paint: CrUXMetric;
    experimental_time_to_first_byte: CrUXMetric;
  };
  performance_score: number;
}

// ── Health Score ──────────────────────────────────────────────────────────────
export interface HealthScoreDimension {
  score: number | null; weight_base: number; weight_used: number;
}
export interface HealthScoreData {
  health_score: number;
  available_dimensions: number; total_dimensions: number;
  breakdown: {
    seo_score: HealthScoreDimension;
    performance_score: HealthScoreDimension;
    social_score: HealthScoreDimension;
    reputation_score: HealthScoreDimension;
  };
}

// ── Business Profile ──────────────────────────────────────────────────────────
export interface BusinessRating { value: number | null; votes_count: number; type?: string; max?: number }
export interface BusinessProfileData {
  found: boolean;
  name: string | null; original_name?: string | null; description: string | null;
  category: { primary: string | null; ids: number[]; additional: string[] };
  ids: { cid: string | null; place_id: string | null; feature_id: string | null };
  contact: { phone: string | null; website_url: string | null; domain: string | null; contact_url?: string | null };
  location: {
    address: string | null; borough: string | null; street: string | null;
    city: string | null; zip: string | null; region: string | null;
    country_code: string | null; latitude: number | null; longitude: number | null;
  };
  media: { logo_url: string | null; main_image_url: string | null; total_photos: number };
  status: { is_claimed: boolean; operating_status: string; price_level: string | null };
  reviews: {
    rating: BusinessRating;
    rating_distribution: Record<string, number>;
    rating_distribution_pct: Record<string, number>;
    place_topics: Array<{ topic: string; mentions: number }>;
    questions_and_answers_count: number | null;
  };
  attributes: { available: unknown; unavailable: unknown };
  popular_times: unknown;
  profile_completeness: {
    score: number;
    missing: Array<{ field: string; label: string; weight: number }>;
    present: Array<{ field: string; label: string; weight: number }>;
  };
  keyword?: string; check_url?: string; datetime?: string;
  location_code?: number; language_code?: string;
  cost?: number; task_time?: string;
}

// ── Discover Prospects ────────────────────────────────────────────────────────
export interface ProspectOpportunityScore { score: number; weakness_signals: string[] }
export interface ProspectData {
  name: string | null; description: string | null;
  category: { primary: string | null; ids: number[]; additional: string[] };
  contact: { phone: string | null; website_url: string | null; domain: string | null };
  location: {
    address: string | null; city: string | null; region: string | null;
    country_code: string | null; latitude: number | null; longitude: number | null;
  };
  media: { logo_url: string | null; total_photos: number };
  status: { is_claimed: boolean; operating_status: string; price_level: string | null };
  reviews: { rating: BusinessRating; rating_distribution: Record<string, number> };
  profile_completeness: { score: number; missing: Array<{ field: string; label: string; weight: number }> };
  opportunity_score: ProspectOpportunityScore;
  rank_absolute: number | null;
}
export interface DiscoverProspectsData {
  items_count: number; total_count: number; offset: number;
  prospects: ProspectData[];
  high_opportunity: ProspectData[]; high_opportunity_count: number;
  unclaimed_count: number; unclaimed_pct: number;
  no_website_count: number; no_website_pct: number;
  operating_status_distribution: Record<string, number>;
  top_categories: Array<{ category: string; count: number }>;
  cost: number; task_time: string;
}

// ── Full audit result ─────────────────────────────────────────────────────────
export interface DashboardAuditResult {
  domain:         string;
  keyword:        string;
  total_cost_usd: number;
  sections: {
    serp?:          SerpData             | { error: string; detail?: string };
    labs?:          LabsData              | { error: string; detail?: string };
    keyword_data?:  KeywordData           | { error: string; detail?: string };
    onpage?:        OnPageData            | { error: string; detail?: string };
    crux?:          CrUXData              | { error: string; detail?: string };
    business_info?: BusinessProfileData   | { error: string; detail?: string };  // NUEVO
    reviews?:       ReviewsData           | { error: string; detail?: string };  // NUEVO
  };
  health?:           HealthScoreData;
  recommendations?:  RecommendationsOutput;                                       // NUEVO
  errors?:           string[];
}

// ── ReviewsData (NUEVA) ──────────────────────────────────────────────────────
// Shape devuelta por get_google_reviews() + _strip_reviews_for_prompt()
// del backend. Solo se popula si el audit incluye fetch_reviews=true.
export interface ReviewItem {
  rating:           number;       // 1-5
  text:             string;
  owner_responded:  boolean;
  datetime:         string;       // ISO 8601
  reviewer_name?:   string;
  reviewer_photo?:  string | null;
}
 
export interface ReviewsData {
  reviews_count:               number;
  avg_rating_in_sample:        number | null;
  owner_response_rate:         number;        // 0-100 (%)
  negative_reviews_count:      number;
  negative_reviews_with_text:  ReviewItem[];
  recent_reviews:              ReviewItem[];
  cost?:                       number;
  task_time?:                  string;
}
 
// ── Recommendation (NUEVA) ───────────────────────────────────────────────────
// Output del prompt recommendations_v1.md
export type RecommendationCategory =
  | "critical" | "local" | "seo" | "performance" | "content" | "reputation";
 
export type RecommendationPriority = "critical" | "high" | "medium" | "low";
export type RecommendationImpact   = "high" | "medium" | "low";
export type RecommendationEffort   = "low"  | "medium" | "high";
export type HealthAssessment       = "good" | "needs_improvement" | "poor";
 
export interface RecommendationEvidence {
  metric:        string;    // ej "crux.metrics.largest_contentful_paint.p75"
  current_value: string;
  target_value:  string;
}
 
export interface Recommendation {
  rank:             number;
  title:            string;
  category:         RecommendationCategory;
  priority:         RecommendationPriority;
  impact:           RecommendationImpact;
  effort:           RecommendationEffort;
  estimated_time:   string;
  why_it_matters:   string;
  what_to_do:       string[];
  evidence:         RecommendationEvidence;
  expected_outcome: string;
}
 
export interface RecommendationsOutput {
  executive_summary:   string;
  health_assessment:   HealthAssessment;
  main_strengths:      string[];
  main_gaps:           string[];
  top_recommendations: Recommendation[];
  next_audit_focus:    string;
}
