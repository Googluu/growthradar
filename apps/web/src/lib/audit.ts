import type { AuditFormData, SerpData, DashboardAuditResult } from "@/types/dashboard";

// ── Config ────────────────────────────────────────────────────────────────────
export const API_BASE      = "http://localhost:8000";
const POLL_INTERVAL = 4_000;
const POLL_TIMEOUT  = 120_000;

// ── API ───────────────────────────────────────────────────────────────────────
export async function triggerAudit(
  domain: string,
  keyword?: string,
): Promise<{ job_id: string; status: string; cached: boolean }> {
  const res = await fetch(`${API_BASE}/public/dashboard-audit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domain, keyword: keyword || undefined }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: string };
    throw new Error(err.detail ?? `Error ${res.status}`);
  }
  return res.json();
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

// ── Free-report persistence ───────────────────────────────────────────────────
export const FREE_REPORT_KEY = "eda_free_report_v1";

export interface FreeReport {
  serpData: SerpData;
  formData: AuditFormData;
  ts: number;
}

export function readFreeReport(): FreeReport | null {
  try {
    const raw = localStorage.getItem(FREE_REPORT_KEY);
    return raw ? (JSON.parse(raw) as FreeReport) : null;
  } catch { return null; }
}

export function saveFreeReport(serpData: SerpData, formData: AuditFormData) {
  try {
    localStorage.setItem(FREE_REPORT_KEY, JSON.stringify({ serpData, formData, ts: Date.now() }));
  } catch { /* storage full */ }
}
