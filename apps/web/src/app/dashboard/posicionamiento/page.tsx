"use client";

import { useState, useEffect, useCallback } from "react";
import { SerpSection } from "@/components/dashboard/SerpSection";
import { readFreeReport, saveFreeReport, triggerAudit, pollAudit, API_BASE } from "@/lib/audit";
import type { SerpData, AuditFormData } from "@/types/dashboard";
import type { DashboardAuditResult } from "@/types/dashboard";

const G  = "#5DB848";
const Gs = "rgba(93,184,72,0.12)";
const Gb = "rgba(93,184,72,0.35)";

// ── Scanning overlay ──────────────────────────────────────────────────────────
function ScanningOverlay({ keyword }: { keyword: string }) {
  const steps = [
    "Consultando DataForSEO SERP API…",
    "Analizando resultados orgánicos…",
    "Detectando funciones SERP…",
    "Calculando posiciones y competidores…",
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep(s => s < steps.length - 1 ? s + 1 : s), 8_000);
    return () => clearInterval(t);
  }, [steps.length]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 80,
      background: "rgba(10,10,10,0.88)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        maxWidth: 400, width: "90%",
        background: "rgba(255,255,255,0.03)", border: `1px solid ${Gb}`,
        borderRadius: 20, padding: "36px 32px", textAlign: "center",
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14, background: Gs,
          border: `1px solid ${Gb}`, display: "flex", alignItems: "center",
          justifyContent: "center", margin: "0 auto 20px",
          animation: "pulse-soft 2s ease-in-out infinite",
        }}>
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none"
               stroke={G} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 17, marginBottom: 6 }}>
          Buscando "{keyword}"
        </div>
        <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 13,
          color: "rgba(255,255,255,0.35)", marginBottom: 24 }}>
          ~90 segundos · datos en tiempo real
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "left" }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                background: i <= step ? Gs : "rgba(255,255,255,0.04)",
                border: `1px solid ${i <= step ? Gb : "rgba(255,255,255,0.08)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {i < step ? (
                  <svg width={9} height={9} viewBox="0 0 9 9" fill="none"
                       stroke={G} strokeWidth={1.6} strokeLinecap="round">
                    <polyline points="1.5 4.5 3.5 6.5 7.5 2.5"/>
                  </svg>
                ) : i === step ? (
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: G,
                    animation: "pulse-dot 1.2s ease-in-out infinite" }} />
                ) : null}
              </div>
              <span style={{
                fontFamily: "var(--font-inter), sans-serif", fontSize: 12,
                color: i <= step ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.25)",
              }}>
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{
      maxWidth: 480, margin: "80px auto", padding: "48px 36px",
      background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 20, textAlign: "center",
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14, background: Gs,
        border: `1px solid ${Gb}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 20px",
      }}>
        <svg width={26} height={26} viewBox="0 0 24 24" fill="none"
             stroke={G} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>
      <h2 style={{
        fontFamily: "var(--font-syne), sans-serif", fontWeight: 700,
        fontSize: 22, color: "#fff", letterSpacing: "-0.02em", marginBottom: 12,
      }}>
        Sin datos de posicionamiento
      </h2>
      <p style={{
        fontFamily: "var(--font-inter), sans-serif", fontSize: 14,
        color: "rgba(255,255,255,0.4)", lineHeight: 1.65, marginBottom: 28,
      }}>
        Genera tu primera auditoría para ver cómo aparece tu negocio en Google.
      </p>
      <a
        href="/dashboard"
        style={{
          display: "inline-block", padding: "11px 24px", borderRadius: 10,
          background: G, color: "#0a0a0a",
          fontFamily: "var(--font-inter), sans-serif", fontWeight: 700, fontSize: 14,
          textDecoration: "none",
        }}
      >
        Hacer mi primera auditoría →
      </a>
    </div>
  );
}

// ── Error card ────────────────────────────────────────────────────────────────
function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div style={{
      maxWidth: 480, margin: "80px auto", padding: "40px 36px",
      background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.3)",
      borderRadius: 20, textAlign: "center",
    }}>
      <div style={{
        fontFamily: "var(--font-syne), sans-serif", fontWeight: 700,
        fontSize: 18, color: "#ef4444", marginBottom: 12,
      }}>
        Error al analizar
      </div>
      <p style={{
        fontFamily: "var(--font-inter), sans-serif", fontSize: 14,
        color: "rgba(255,255,255,0.5)", marginBottom: 24, lineHeight: 1.6,
      }}>
        {message}
      </p>
      <button
        onClick={onRetry}
        style={{
          padding: "10px 24px", borderRadius: 10, border: "none",
          background: G, color: "#0a0a0a",
          fontFamily: "var(--font-inter), sans-serif", fontWeight: 700,
          fontSize: 14, cursor: "pointer",
        }}
      >
        Intentar de nuevo
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
type Phase = "idle" | "scanning" | "result" | "error";

export default function PosicionamientoPage() {
  const [phase,        setPhase]        = useState<Phase>("idle");
  const [serpData,     setSerpData]     = useState<SerpData | null>(null);
  const [lastForm,     setLastForm]     = useState<AuditFormData | null>(null);
  const [scanKeyword,  setScanKeyword]  = useState("");
  const [errMsg,       setErrMsg]       = useState("");

  // Restaurar desde localStorage
  useEffect(() => {
    const stored = readFreeReport();
    if (stored) {
      setSerpData(stored.serpData);
      setLastForm(stored.formData);
      setPhase("result");
    }
  }, []);

  const runSearch = useCallback(async (keyword: string, formData: AuditFormData) => {
    setScanKeyword(keyword);
    setPhase("scanning");
    setErrMsg("");

    try {
      const { job_id, status, cached } = await triggerAudit(formData.domain, keyword);

      let result: DashboardAuditResult;
      if (status === "completed" && cached) {
        const res = await fetch(`${API_BASE}/public/dashboard-audit/${job_id}`);
        const job = await res.json() as { result: DashboardAuditResult };
        result = job.result;
      } else {
        result = await pollAudit(job_id);
      }

      const serp = result.sections.serp;
      if (!serp || "error" in serp) {
        throw new Error((serp as { error: string })?.error ?? "Sin datos SERP");
      }

      saveFreeReport(serp, formData);
      setSerpData(serp);
      setLastForm(formData);
      setPhase("result");
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Error desconocido");
      setPhase("error");
    }
  }, []);

  const handleSearchAgain = useCallback((kw: string) => {
    if (lastForm) runSearch(kw, lastForm);
  }, [lastForm, runSearch]);

  return (
    <div style={{ position: "relative", minHeight: "60vh" }}>
      {/* Dot grid decoration */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
        maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 90%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 90%)",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {phase === "scanning" && <ScanningOverlay keyword={scanKeyword} />}

        {phase === "idle" && <EmptyState />}

        {phase === "result" && serpData && (
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 28px 60px" }}>
            <SerpSection data={serpData} onSearchAgain={handleSearchAgain} />
          </div>
        )}

        {phase === "error" && (
          <ErrorCard
            message={errMsg}
            onRetry={() => {
              if (lastForm) runSearch(lastForm.keywords[0] ?? "", lastForm);
            }}
          />
        )}
      </div>
    </div>
  );
}
