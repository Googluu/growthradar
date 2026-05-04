"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { LandingNav }        from "@/components/landing/LandingNav";
import { LandingHero }       from "@/components/landing/LandingHero";
import { ScanOverlay }       from "@/components/landing/ScanOverlay";
import { DemoReport }        from "@/components/landing/DemoReport";
import { Pillars }           from "@/components/landing/Pillars";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";
import { FeatureSpotlight }  from "@/components/landing/FeatureSpotlight";
import { SocialProof }       from "@/components/landing/SocialProof";
import { Pricing }           from "@/components/landing/Pricing";
import { FAQ }               from "@/components/landing/FAQ";
import { FinalCTA }          from "@/components/landing/FinalCTA";
import { LandingFooter }     from "@/components/landing/LandingFooter";
import type { AuditResult, CWVMetric, SEOCheck, Recommendation, MetricStatus } from "@/types/audit";

// ── CTA helpers ───────────────────────────────────────────────────────────────
function focusHeroInput() {
  window.scrollTo({ top: 0, behavior: "smooth" });
  setTimeout(() => document.getElementById("hero-input")?.focus(), 400);
}

function scrollToDemo() {
  document.getElementById("demo-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ── Backend result → AuditResult mapper ──────────────────────────────────────
const CWV_MAP = [
  { key: "largest_contentful_paint",          label: "LCP"  },
  { key: "first_contentful_paint",            label: "FCP"  },
  { key: "interaction_to_next_paint",         label: "INP"  },
  { key: "experimental_time_to_first_byte",   label: "TTFB" },
  { key: "cumulative_layout_shift",           label: "CLS"  },
] as const;

function fmtCwvValue(p75: number, unit: string): string {
  if (unit === "score") return p75.toFixed(2);
  return p75 >= 1000 ? `${(p75 / 1000).toFixed(1)}s` : `${Math.round(p75)}ms`;
}

function barPctFromRating(rating: string): number {
  if (rating === "good")              return 82;
  if (rating === "needs_improvement") return 48;
  return 18;
}

function fmtNum(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString("es-CO");
}

function fmtEtv(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBackendResult(raw: any, inputUrl: string): AuditResult {
  const metrics: CWVMetric[] = [];
  const cruxMetrics = raw.crux?.metrics ?? {};
  for (const { key, label } of CWV_MAP) {
    const m = cruxMetrics[key];
    if (!m || m.p75 == null || m.rating === "no_data") continue;
    metrics.push({
      label,
      value: fmtCwvValue(m.p75, m.unit),
      status: m.rating as MetricStatus,
      barPct: barPctFromRating(m.rating),
    });
  }

  const op = raw.seo?.onpage ?? {};
  const checks: SEOCheck[] = [
    { ok: !!op.is_https,             label: "HTTPS activo" },
    { ok: !!op.has_meta_description, label: "Meta description" },
    { ok: !!op.has_h1,               label: "Etiqueta H1" },
    { ok: !!op.has_sitemap,          label: "sitemap.xml" },
    { ok: !!op.has_robots_txt,       label: "robots.txt" },
  ];

  const dr = raw.seo?.domain_rank;
  const healthScore: number = raw.health_score ?? 50;
  const potential = healthScore >= 70 ? "Alto" : healthScore >= 40 ? "Medio" : "Bajo";
  const domain_stats = dr
    ? [
        { val: fmtNum(dr.count), lbl: "Keywords" },
        { val: fmtNum(dr.pos_1), lbl: "Posición #1" },
        { val: fmtEtv(dr.etv),   lbl: "Tráfico ETV" },
        { val: potential,         lbl: "Potencial" },
      ]
    : [{ val: potential, lbl: "Potencial" }];

  const topRecs = raw.recommendations?.top_recommendations ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recommendations: Recommendation[] = topRecs.map((r: any) => {
    const typeLabel   = r.type === "quick_win" ? "QUICK WIN" : "ESTRATÉGICO";
    const impactLabel = r.impact === "high" ? "ALTO IMPACTO" : r.impact === "medium" ? "IMPACTO MEDIO" : "BAJO IMPACTO";
    const accent      = r.impact === "high" ? "#5DB848" : r.impact === "medium" ? "#A3C94A" : "#F5C842";
    return {
      badge:   `${typeLabel} · ${impactLabel}`,
      title:   r.title,
      problem: r.problem,
      action:  r.action,
      impact:  r.why_it_matters,
      effort:  "",
      accent,
    };
  });

  return {
    url: inputUrl,
    scores: {
      overall:     healthScore,
      performance: raw.scores?.performance_score ?? 50,
      seo:         raw.scores?.seo_score         ?? 50,
    },
    ai_summary: raw.recommendations?.executive_summary ?? "",
    metrics,
    checks,
    domain_stats,
    recommendations,
  };
}

// ── API fetch with polling ─────────────────────────────────────────────────────
const API_BASE = "http://localhost:8000";
const POLL_INTERVAL_MS = 4_000;
const POLL_TIMEOUT_MS  = 120_000;

async function triggerAudit(url: string): Promise<string> {
  const res = await fetch(`${API_BASE}/public/audit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (res.status === 429) throw new Error("trial_used");
  if (!res.ok) throw new Error(`trigger_failed:${res.status}`);
  const { job_id } = await res.json();
  return job_id as string;
}

async function pollAudit(job_id: string, url: string): Promise<AuditResult> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    const pollRes = await fetch(`${API_BASE}/public/audit/${job_id}`);
    if (!pollRes.ok) continue;
    const job = await pollRes.json();
    if (job.status === "completed" && job.result) {
      return mapBackendResult(job.result, url);
    }
    if (job.status === "failed") {
      throw new Error(job.error ?? "audit_failed");
    }
  }
  throw new Error("audit_timeout");
}

// ── Cache localStorage ────────────────────────────────────────────────────────
const CACHE_KEY = "eda_audit_v1";
const CACHE_TTL = 24 * 60 * 60 * 1000;

function readCache(): AuditResult | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { result, ts } = JSON.parse(raw) as { result: AuditResult; ts: number };
    if (Date.now() - ts > CACHE_TTL) { localStorage.removeItem(CACHE_KEY); return null; }
    return result;
  } catch { return null; }
}

function writeCache(result: AuditResult) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ result, ts: Date.now() })); }
  catch { /* localStorage lleno — ignorar */ }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [navScrolled, setNavScrolled]       = useState(false);
  const [url, setUrl]                       = useState("");
  const [scanning, setScanning]             = useState(false);
  const [auditReady, setAuditReady]         = useState(false);
  const [reportData, setReportData]         = useState<AuditResult | null>(null);
  const [trialExhausted, setTrialExhausted] = useState(false);

  const pendingResult = useRef<AuditResult | null>(null);

  useEffect(() => {
    const cached = readCache();
    if (cached) setReportData(cached);
  }, []);

  useEffect(() => {
    const handler = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleScan = useCallback(async () => {
    if (!url.trim() || scanning) return;

    let job_id: string;
    try {
      job_id = await triggerAudit(url);
    } catch (err) {
      if (err instanceof Error && err.message === "trial_used") {
        setTrialExhausted(true);
        scrollToDemo();
      }
      return;
    }

    setScanning(true);
    setAuditReady(false);
    pendingResult.current = null;

    pollAudit(job_id, url)
      .then((result) => {
        pendingResult.current = result;
        writeCache(result);
        setAuditReady(true);
      })
      .catch((err) => {
        console.error("[EDA] Poll error:", err);
        setAuditReady(true);
      });
  }, [url, scanning]);

  const handleScanDone = useCallback(() => {
    setScanning(false);
    setAuditReady(false);
    if (pendingResult.current) {
      setReportData(pendingResult.current);
      pendingResult.current = null;
    }
    scrollToDemo();
  }, []);

  return (
    <>
      {scanning && <ScanOverlay url={url} ready={auditReady} onDone={handleScanDone} />}

      <LandingNav scrolled={navScrolled} onAuditClick={focusHeroInput} />

      <LandingHero url={url} onUrlChange={setUrl} onScan={handleScan} trialExhausted={trialExhausted} />

      <DemoReport reportData={reportData} url={url} onUrlChange={setUrl} onScan={handleScan} trialExhausted={trialExhausted} />

      <Pillars />

      <LandingHowItWorks />

      <FeatureSpotlight />

      <SocialProof />

      <Pricing />

      <FAQ />

      <FinalCTA onAuditClick={focusHeroInput} />

      <LandingFooter />
    </>
  );
}
