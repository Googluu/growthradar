"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Nav }            from "@/components/landing/Nav";
import { Hero }           from "@/components/landing/Hero";
import { ScanOverlay }    from "@/components/landing/ScanOverlay";
import { PoweredByStrip } from "@/components/landing/PoweredByStrip";
import { DemoReport }     from "@/components/landing/DemoReport";
import { HowItWorks }     from "@/components/landing/HowItWorks";
import { ImpactMetrics }  from "@/components/landing/ImpactMetrics";
import { FooterCTA }      from "@/components/landing/FooterCTA";
import { FooterBar }      from "@/components/landing/FooterBar";
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
  // Core Web Vitals
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

  // SEO checks
  const op = raw.seo?.onpage ?? {};
  const checks: SEOCheck[] = [
    { ok: !!op.is_https,             label: "HTTPS activo" },
    { ok: !!op.has_meta_description, label: "Meta description" },
    { ok: !!op.has_h1,               label: "Etiqueta H1" },
    { ok: !!op.has_sitemap,          label: "sitemap.xml" },
    { ok: !!op.has_robots_txt,       label: "robots.txt" },
  ];

  // Domain stats
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

  // Recommendations
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

// Dispara la auditoría; lanza "trial_used" si la IP ya usó su prueba gratuita
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [navScrolled, setNavScrolled]     = useState(false);
  const [url, setUrl]                     = useState("");
  const [scanning, setScanning]           = useState(false);
  const [reportData, setReportData]       = useState<AuditResult | null>(null);
  const [trialExhausted, setTrialExhausted] = useState(false);

  const pendingFetch = useRef<Promise<AuditResult> | null>(null);

  useEffect(() => {
    const handler = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleScan = useCallback(async () => {
    if (!url.trim() || scanning) return;

    // Pre-validar antes de mostrar el overlay — detecta rate-limit sin animar
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
    pendingFetch.current = pollAudit(job_id, url);
  }, [url, scanning]);

  const handleScanDone = useCallback(async () => {
    let result: AuditResult | null = null;
    if (pendingFetch.current) {
      try {
        result = await pendingFetch.current;
      } catch (err) {
        console.error("[EDA] Audit error:", err);
      }
      pendingFetch.current = null;
    }
    setScanning(false);
    if (result) setReportData(result);
    scrollToDemo();
  }, []);

  return (
    <>
      {scanning && <ScanOverlay url={url} onDone={handleScanDone} />}

      <Nav scrolled={navScrolled} onAuditClick={focusHeroInput} />

      <Hero url={url} onUrlChange={setUrl} onScan={handleScan} />

      <PoweredByStrip />

      <DemoReport reportData={reportData} url={url} onUrlChange={setUrl} onScan={handleScan} trialExhausted={trialExhausted} />

      <HowItWorks />

      <ImpactMetrics />

      <FooterCTA onAuditClick={focusHeroInput} onDemoClick={scrollToDemo} />

      <FooterBar />
    </>
  );
}
