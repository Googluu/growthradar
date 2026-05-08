"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { SerpSection } from "@/components/dashboard/SerpSection";
import type { SerpData, DashboardAuditResult } from "@/types/dashboard";

// ── API ───────────────────────────────────────────────────────────────────────
const API_BASE        = "http://localhost:8000";
const POLL_INTERVAL   = 4_000;
const POLL_TIMEOUT    = 120_000;

async function triggerAudit(domain: string, keyword?: string): Promise<{ job_id: string; status: string; cached: boolean }> {
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

async function pollAudit(job_id: string): Promise<DashboardAuditResult> {
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

// ── Color tokens (shared with SerpSection) ────────────────────────────────────
const G   = "#5DB848";
const Gs  = "rgba(93,184,72,0.12)";
const Gb  = "rgba(93,184,72,0.35)";

// ── Scan indicator ────────────────────────────────────────────────────────────
function ScanningCard({ domain, keyword }: { domain: string; keyword: string }) {
  const steps = [
    "Consultando DataForSEO SERP API…",
    "Analizando resultados orgánicos…",
    "Detectando funciones SERP…",
    "Calculando posiciones…",
  ];
  const [step] = useState(0);

  return (
    <div style={{
      maxWidth: 480, margin: "80px auto",
      background: "rgba(255,255,255,0.025)",
      border: `1px solid ${Gb}`,
      borderRadius: 20, padding: "40px 36px",
      textAlign: "center",
    }}>
      {/* Animated logo */}
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: Gs, border: `1px solid ${Gb}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 24px",
        animation: "pulse-soft 2s ease-in-out infinite",
      }}>
        <svg width={28} height={28} viewBox="0 0 24 24" fill="none"
             stroke={G} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>

      <div style={{
        fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 18, marginBottom: 8,
      }}>
        Analizando SERP
      </div>
      <div style={{
        fontFamily: "var(--font-syne), sans-serif", fontWeight: 700,
        fontSize: 20, color: "#fff", marginBottom: 8, letterSpacing: "-0.02em",
      }}>
        {domain}
        {keyword && (
          <span style={{ color: "rgba(255,255,255,0.45)", fontWeight: 400 }}> · {keyword}</span>
        )}
      </div>
      <div style={{
        fontFamily: "var(--font-inter), sans-serif", fontSize: 13,
        color: "rgba(255,255,255,0.45)", marginBottom: 32, lineHeight: 1.6,
      }}>
        ~20 segundos · datos en tiempo real de Google
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
              background: i <= step ? Gs : "rgba(255,255,255,0.04)",
              border: `1px solid ${i <= step ? Gb : "rgba(255,255,255,0.08)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {i < step ? (
                <svg width={10} height={10} viewBox="0 0 10 10" fill="none"
                     stroke={G} strokeWidth={1.6} strokeLinecap="round">
                  <polyline points="2 5 4 7 8 3"/>
                </svg>
              ) : i === step ? (
                <div style={{
                  width: 6, height: 6, borderRadius: "50%", background: G,
                  animation: "pulse-dot 1.2s ease-in-out infinite",
                }} />
              ) : null}
            </div>
            <span style={{
              fontFamily: "var(--font-inter), sans-serif", fontSize: 13,
              color: i <= step ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)",
            }}>
              {s}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Input form ────────────────────────────────────────────────────────────────
function AuditForm({ onSubmit, loading }: {
  onSubmit: (domain: string, keyword: string) => void;
  loading: boolean;
}) {
  const [domain, setDomain]   = useState("");
  const [keyword, setKeyword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim() || loading) return;
    onSubmit(domain.trim(), keyword.trim());
  };

  return (
    <div style={{
      maxWidth: 600, margin: "0 auto",
      padding: "60px 24px 40px",
      textAlign: "center",
    }}>
      <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 20, marginBottom: 12 }}>
        Análisis SERP
      </div>
      <h1 style={{
        fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
        fontSize: "clamp(28px, 4vw, 44px)", color: "#fff",
        letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 12,
      }}>
        ¿Cómo te ve Google?
      </h1>
      <p style={{
        fontFamily: "var(--font-inter), sans-serif", fontSize: 16,
        color: "rgba(255,255,255,0.45)", marginBottom: 40, lineHeight: 1.6,
      }}>
        Ingresa tu dominio y la keyword principal de tu negocio.
        EDA analiza los resultados reales de Google en segundos.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Domain input */}
        <div style={{ position: "relative" }}>
          <input
            type="text"
            value={domain}
            onChange={e => setDomain(e.target.value)}
            placeholder="tudominio.com"
            autoComplete="off"
            style={{
              width: "100%", padding: "14px 18px",
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${domain ? Gb : "rgba(255,255,255,0.1)"}`,
              borderRadius: 12, color: "#fff",
              fontFamily: "var(--font-inter), sans-serif", fontSize: 16,
              outline: "none", transition: "border-color 0.2s",
            }}
            onFocus={e => { e.target.style.borderColor = Gb; }}
            onBlur={e => { if (!domain) e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
          />
        </div>

        {/* Keyword input */}
        <div style={{ position: "relative" }}>
          <input
            type="text"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="keyword principal (opcional)"
            autoComplete="off"
            style={{
              width: "100%", padding: "14px 18px",
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${keyword ? Gb : "rgba(255,255,255,0.1)"}`,
              borderRadius: 12, color: "#fff",
              fontFamily: "var(--font-inter), sans-serif", fontSize: 16,
              outline: "none", transition: "border-color 0.2s",
            }}
            onFocus={e => { e.target.style.borderColor = Gb; }}
            onBlur={e => { if (!keyword) e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
          />
        </div>

        <button
          type="submit"
          disabled={!domain.trim() || loading}
          style={{
            padding: "14px 32px", borderRadius: 12, border: "none",
            background: !domain.trim() || loading ? "rgba(93,184,72,0.3)" : G,
            color: "#0a0a0a", fontFamily: "var(--font-inter), sans-serif",
            fontWeight: 700, fontSize: 16, cursor: domain.trim() && !loading ? "pointer" : "default",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => {
            if (domain.trim() && !loading) {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 8px 30px rgba(93,184,72,0.4)";
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {loading ? "Analizando…" : "Analizar SERP →"}
        </button>
      </form>
    </div>
  );
}

// ── Top bar ───────────────────────────────────────────────────────────────────
function TopBar({ domain, keyword, onReset }: {
  domain: string;
  keyword: string;
  onReset: () => void;
}) {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(10,10,10,0.9)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
      padding: "12px 32px",
      display: "flex", alignItems: "center",
      justifyContent: "space-between", gap: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Image src="/logo_eda_sin_background.png" alt="EDA" width={28} height={28} />
          <Image src="/eda.png" alt="EDA" width={40} height={16} style={{ filter: "brightness(0) invert(1)" }} />
        </div>
        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontFamily: "var(--font-inter), sans-serif", fontSize: 13,
            color: "rgba(255,255,255,0.5)",
          }}>
            SERP
          </span>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>·</span>
          <span style={{
            fontFamily: "var(--font-mono), monospace", fontSize: 13,
            color: "#fff",
          }}>
            {domain}
          </span>
          {keyword && (
            <>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>·</span>
              <span style={{
                fontFamily: "var(--font-inter), sans-serif", fontSize: 13,
                color: "rgba(255,255,255,0.5)",
              }}>
                "{keyword}"
              </span>
            </>
          )}
        </div>
      </div>

      <button
        onClick={onReset}
        style={{
          padding: "7px 14px", borderRadius: 8,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.6)",
          fontFamily: "var(--font-inter), sans-serif", fontSize: 13, fontWeight: 500,
          cursor: "pointer", transition: "all 0.15s",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = Gs;
          e.currentTarget.style.borderColor = Gb;
          e.currentTarget.style.color = G;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "rgba(255,255,255,0.05)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
          e.currentTarget.style.color = "rgba(255,255,255,0.6)";
        }}
      >
        + Nueva búsqueda
      </button>
    </div>
  );
}

// ── Error card ────────────────────────────────────────────────────────────────
function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div style={{
      maxWidth: 480, margin: "80px auto", padding: "40px 36px",
      background: "rgba(239,68,68,0.06)",
      border: "1px solid rgba(239,68,68,0.3)",
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
type Phase = "input" | "scanning" | "result" | "error";

export default function DashboardPage() {
  const [phase, setPhase]       = useState<Phase>("input");
  const [domain, setDomain]     = useState("");
  const [keyword, setKeyword]   = useState("");
  const [serpData, setSerpData] = useState<SerpData | null>(null);
  const [errMsg, setErrMsg]     = useState("");

  const runAudit = useCallback(async (d: string, kw: string) => {
    setDomain(d);
    setKeyword(kw);
    setPhase("scanning");
    setSerpData(null);
    setErrMsg("");

    try {
      const { job_id, status, cached } = await triggerAudit(d, kw);

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

      setSerpData(serp);
      setPhase("result");
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Error desconocido");
      setPhase("error");
    }
  }, []);

  const handleSearchAgain = useCallback((kw: string) => {
    runAudit(domain, kw);
  }, [domain, runAudit]);

  const handleReset = () => {
    setPhase("input");
    setSerpData(null);
    setDomain("");
    setKeyword("");
    setErrMsg("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", position: "relative" }}>
      {/* Dot grid background */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
        maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 90%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 90%)",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Top bar (solo en result/error) */}
        {(phase === "result" || phase === "error") && (
          <TopBar domain={domain} keyword={keyword} onReset={handleReset} />
        )}

        {/* Content */}
        {phase === "input" && (
          <>
            {/* Minimal nav for input phase */}
            <div style={{
              padding: "20px 32px",
              display: "flex", alignItems: "center", gap: 10,
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <Image src="/logo_eda_sin_background.png" alt="EDA" width={28} height={28} />
              <Image src="/eda.png" alt="EDA" width={40} height={16} style={{ filter: "brightness(0) invert(1)" }} />
              <span style={{
                marginLeft: 8, fontSize: 12, color: "rgba(255,255,255,0.35)",
                fontFamily: "var(--font-inter), sans-serif",
                padding: "2px 8px", borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.08)",
              }}>
                Dashboard
              </span>
            </div>
            <AuditForm onSubmit={runAudit} loading={false} />
          </>
        )}

        {phase === "scanning" && (
          <ScanningCard domain={domain} keyword={keyword} />
        )}

        {phase === "result" && serpData && (
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 32px 60px" }}>
            <SerpSection data={serpData} onSearchAgain={handleSearchAgain} />
          </div>
        )}

        {phase === "error" && (
          <ErrorCard message={errMsg} onRetry={handleReset} />
        )}
      </div>
    </div>
  );
}
