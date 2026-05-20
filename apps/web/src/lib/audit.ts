import type {
  AuditFormData, SerpData, DashboardAuditResult,
  BusinessProfileData, DiscoverProspectsData,
} from "@/types/dashboard";

// ── Config ────────────────────────────────────────────────────────────────────
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";
const POLL_INTERVAL = 4_000;
const POLL_TIMEOUT  = 180_000;     // 3 min — full audit puede tardar más que solo SERP

// ── Trigger full dashboard audit ──────────────────────────────────────────────
/**
 * Dispara la auditoría completa con TODOS los params del formulario.
 * El backend debe correr SERP + Labs + Keyword Data + OnPage + CrUX + Business Info + Reviews.
 */
export async function triggerAudit(
  formData: AuditFormData,
): Promise<{ job_id: string; status: string; cached: boolean }> {
  const res = await fetch(`${API_BASE}/public/dashboard-audit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      domain:                  formData.domain,
      business_name:           formData.businessName,
      target_keywords:         formData.keywords.length ? formData.keywords : undefined,
      google_business_keyword: formData.googleBusiness || undefined,
      fetch_reviews:           !!formData.googleBusiness,    // si tiene GMB, traer reseñas
      location_code:           formData.countryCode || 2170, // Colombia default
      language_code:           "es",
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: string };
    throw new Error(err.detail ?? `Error ${res.status}`);
  }
  return res.json();
}

/**
 * Backwards-compatible wrapper para llamadas que solo tengan domain+keyword
 * (legacy de la página de posicionamiento standalone). Marcar como deprecated.
 *
 * @deprecated Usar triggerAudit(formData) con AuditFormData completo.
 */
export async function triggerAuditMinimal(
  domain: string,
  keyword?: string,
): Promise<{ job_id: string; status: string; cached: boolean }> {
  return triggerAudit({
    domain,
    businessName:   "",
    keywords:       keyword ? [keyword] : [],
    countryCode:    2170,
    googleBusiness: "",
  });
}

export async function pollAudit(job_id: string): Promise<DashboardAuditResult> {
  const deadline = Date.now() + POLL_TIMEOUT;
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, POLL_INTERVAL));
    const res = await fetch(`${API_BASE}/public/dashboard-audit/${job_id}`);
    if (!res.ok) continue;
    const job = await res.json() as { status: string; result?: DashboardAuditResult; error?: string };
    if (job.status === "completed" && job.result) return job.result;
    if (job.status === "failed") throw new Error(job.error ?? "audit_failed");
  }
  throw new Error("audit_timeout");
}

export async function fetchAuditResult(job_id: string): Promise<DashboardAuditResult> {
  const res = await fetch(`${API_BASE}/public/dashboard-audit/${job_id}`);
  if (!res.ok) throw new Error(`Error ${res.status}`);
  const job = await res.json() as { result: DashboardAuditResult };
  return job.result;
}

// ── Business Profile (búsqueda ad-hoc) ────────────────────────────────────────
/**
 * Buscar perfil de Google Business por keyword.
 * Usar SOLO cuando NO hay cache del audit completo.
 * Para leer del cache primero, usar `getCachedBusinessProfile()`.
 */
export async function fetchBusinessProfile(
  keyword: string,
  locationCode = 2170,
): Promise<BusinessProfileData> {
  const res = await fetch(`${API_BASE}/public/business-profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keyword, location_code: locationCode }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: string };
    throw new Error(err.detail ?? `Error ${res.status}`);
  }
  return res.json();
}

// ── Discover Prospects ────────────────────────────────────────────────────────
export interface DiscoverParams {
  categories?: string[];
  description?: string;
  title?: string;
  location_country?: string;
  location_coordinate?: string;
  limit?: number;
}

export async function fetchDiscoverProspects(
  params: DiscoverParams,
): Promise<DiscoverProspectsData> {
  const res = await fetch(`${API_BASE}/public/discover-prospects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: string };
    throw new Error(err.detail ?? `Error ${res.status}`);
  }
  return res.json();
}

// ── Free-report persistence ───────────────────────────────────────────────────
export const FREE_REPORT_KEY = "eda_free_report_v1";

export interface FreeReport {
  serpData:     SerpData;
  formData:     AuditFormData;
  auditResult?: DashboardAuditResult;    // ← contiene TODAS las secciones del audit
  ts:           number;
}

export function readFreeReport(): FreeReport | null {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(FREE_REPORT_KEY) : null;
    return raw ? (JSON.parse(raw) as FreeReport) : null;
  } catch { return null; }
}

export function saveFreeReport(
  serpData:    SerpData,
  formData:    AuditFormData,
  auditResult?: DashboardAuditResult,
) {
  try {
    localStorage.setItem(
      FREE_REPORT_KEY,
      JSON.stringify({ serpData, formData, auditResult, ts: Date.now() }),
    );
  } catch { /* storage full */ }
}

export function clearFreeReport() {
  try { localStorage.removeItem(FREE_REPORT_KEY); } catch { /* noop */ }
}

// ── Cached section readers (preferred over re-fetching) ───────────────────────
/**
 * Lee el business_info del audit cacheado.
 * Devuelve null si no hay cache, hay error, o el negocio no se encontró.
 * Las páginas que dependen de business_info deberían intentar leer del cache PRIMERO,
 * y solo llamar a fetchBusinessProfile() si el cache no tiene data válida.
 */
export function getCachedBusinessProfile(): BusinessProfileData | null {
  const report = readFreeReport();
  const section = report?.auditResult?.sections?.business_info;
  if (!section || "error" in section) return null;
  if (!section.found) return null;
  return section;
}

/**
 * Helper genérico para leer cualquier sección cacheada del audit.
 * Devuelve null si no existe o tiene error.
 */
export function getCachedSection<K extends keyof NonNullable<DashboardAuditResult["sections"]>>(
  key: K,
): NonNullable<DashboardAuditResult["sections"]>[K] extends infer T
  ? T extends { error: string } ? null : T | null
  : null {
  const report = readFreeReport();
  const section = report?.auditResult?.sections?.[key];
  if (!section || (typeof section === "object" && section !== null && "error" in section)) {
    return null as never;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return section as any;
}