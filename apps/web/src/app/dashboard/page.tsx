"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { readFreeReport, saveFreeReport, triggerAudit, pollAudit, API_BASE } from "@/lib/audit";
import type { AuditFormData, DashboardAuditResult, HealthScoreData } from "@/types/dashboard";
import { SaludDigitalSection } from "@/components/dashboard/SaludDigitalSection";

// ── Constants ─────────────────────────────────────────────────────────────────
const MAX_CHIPS = 5;

const COUNTRIES = [
  { label: "Colombia 🇨🇴",   code: 2170 },
  { label: "México 🇲🇽",     code: 2484 },
  { label: "Perú 🇵🇪",       code: 2604 },
  { label: "Chile 🇨🇱",      code: 2152 },
  { label: "Argentina 🇦🇷",  code: 2032 },
  { label: "Ecuador 🇪🇨",    code: 2218 },
  { label: "Uruguay 🇺🇾",    code: 2858 },
  { label: "Costa Rica 🇨🇷", code: 2188 },
  { label: "España 🇪🇸",     code: 2724 },
  { label: "EE.UU. 🇺🇸",     code: 2840 },
] as const;

// ── Tokens ────────────────────────────────────────────────────────────────────
const G  = "#5DB848";
const Gs = "rgba(93,184,72,0.12)";
const Gb = "rgba(93,184,72,0.35)";

// ── Domain validation ─────────────────────────────────────────────────────────
function isDomainValid(raw: string): boolean {
  const d = raw.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0];
  return d.length > 3 && d.includes(".") && !d.includes(" ");
}

// ── Input style ───────────────────────────────────────────────────────────────
const inputStyle = (active: boolean): React.CSSProperties => ({
  width: "100%", padding: "14px 18px",
  background: "rgba(255,255,255,0.04)",
  border: `1px solid ${active ? Gb : "rgba(255,255,255,0.1)"}`,
  borderRadius: 12, color: "#fff",
  fontFamily: "var(--font-inter), sans-serif", fontSize: 15,
  outline: "none", transition: "border-color 0.2s",
});

// ── ChipInput ─────────────────────────────────────────────────────────────────
function ChipInput({ chips, onChange }: { chips: string[]; onChange: (c: string[]) => void }) {
  const [val, setVal]       = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef            = useRef<HTMLInputElement>(null);

  const addChip = (raw: string) => {
    const t = raw.trim().replace(/,$/, "").trim();
    if (!t || chips.includes(t) || chips.length >= MAX_CHIPS) { setVal(""); return; }
    onChange([...chips, t]); setVal("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addChip(val); }
    else if (e.key === "Backspace" && !val && chips.length > 0) onChange(chips.slice(0, -1));
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center",
        padding: "10px 14px", minHeight: 52,
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${focused || chips.length > 0 ? Gb : "rgba(255,255,255,0.1)"}`,
        borderRadius: 12, cursor: "text", transition: "border-color 0.2s",
      }}
    >
      {chips.map((chip, i) => (
        <span key={i} style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: Gs, border: `1px solid ${Gb}`,
          borderRadius: 999, padding: "3px 10px",
          fontFamily: "var(--font-inter), sans-serif", fontSize: 13,
          color: G, fontWeight: 500,
        }}>
          {chip}
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onChange(chips.filter((_, idx) => idx !== i)); inputRef.current?.focus(); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: G, fontSize: 16, lineHeight: 1, padding: 0 }}
          >×</button>
        </span>
      ))}
      {chips.length < MAX_CHIPS && (
        <input
          ref={inputRef}
          id="keywords" name="keywords"
          type="text" value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { setFocused(false); if (val.trim()) addChip(val); }}
          onFocus={() => setFocused(true)}
          placeholder={chips.length === 0 ? "pizza a domicilio bogotá, restaurante italiano..." : "Añadir frase…"}
          style={{ background: "transparent", border: "none", outline: "none", flex: 1, minWidth: 200, color: "#fff", fontFamily: "var(--font-inter), sans-serif", fontSize: 15 }}
        />
      )}
      {chips.length >= MAX_CHIPS && (
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-inter), sans-serif" }}>Máximo {MAX_CHIPS}</span>
      )}
    </div>
  );
}

// ── AuditForm ─────────────────────────────────────────────────────────────────
function AuditForm({ onSubmit }: { onSubmit: (d: AuditFormData) => void }) {
  const [domain,       setDomain]       = useState("");
  const [businessName, setBusinessName] = useState("");
  const [keywords,     setKeywords]     = useState<string[]>([]);
  const [countryCode,  setCountryCode]  = useState(2170);
  const [googleBiz,    setGoogleBiz]    = useState("");
  const [expanded,     setExpanded]     = useState(false);

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("url") ?? "";
    const d = raw.replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0];
    if (d) setDomain(d);
  }, []);

  const domainOk  = isDomainValid(domain);
  const bizOk     = businessName.trim().length > 0;
  const canSubmit = domainOk && bizOk;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ domain: domain.trim(), businessName: businessName.trim(), keywords, countryCode, googleBusiness: googleBiz.trim() });
  };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "48px 24px 40px", textAlign: "center" }}>
      <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 20, marginBottom: 12 }}>
        Auditoría digital
      </div>
      <h1 style={{
        fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
        fontSize: "clamp(28px, 4vw, 44px)", color: "#fff",
        letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 14,
      }}>
        ¿Cómo te ve Google?
      </h1>
      <p style={{
        fontFamily: "var(--font-inter), sans-serif", fontSize: 15,
        color: "rgba(255,255,255,0.45)", marginBottom: 36, lineHeight: 1.65,
      }}>
        En 90 segundos analizamos tu presencia en Google: posicionamiento,
        velocidad, perfil de negocio y más.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
        {/* Dominio */}
        <div style={{ position: "relative" }}>
          <input
            id="domain" name="domain" type="text"
            value={domain} onChange={e => setDomain(e.target.value)}
            placeholder="tudominio.com" autoComplete="url"
            style={inputStyle(domainOk)}
            onFocus={e  => { e.target.style.borderColor = Gb; }}
            onBlur={e => { if (!domainOk) e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
          />
          {domainOk && (
            <div style={{
              position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
              width: 20, height: 20, borderRadius: "50%", background: Gs, border: `1px solid ${Gb}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width={11} height={11} viewBox="0 0 11 11" fill="none"
                   stroke={G} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2 5.5 4.5 8 9 3"/>
              </svg>
            </div>
          )}
        </div>

        {/* Nombre del negocio */}
        <input
          id="business-name" name="businessName" type="text"
          value={businessName} onChange={e => setBusinessName(e.target.value)}
          placeholder="Nombre de tu negocio" autoComplete="organization"
          style={inputStyle(bizOk)}
          onFocus={e  => { e.target.style.borderColor = Gb; }}
          onBlur={e => { if (!bizOk) e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
        />

        {/* Más detalles (opcional) */}
        <button
          type="button" onClick={() => setExpanded(e => !e)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 14px", borderRadius: 10,
            background: expanded ? Gs : "rgba(255,255,255,0.025)",
            border: `1px solid ${expanded ? Gb : "rgba(255,255,255,0.08)"}`,
            color: expanded ? G : "rgba(255,255,255,0.45)",
            fontFamily: "var(--font-inter), sans-serif", fontSize: 13, fontWeight: 500,
            cursor: "pointer", transition: "all 0.2s",
          }}
        >
          <span>Más detalles (opcional)</span>
          <svg width={14} height={14} viewBox="0 0 14 14" fill="none"
               stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"
               style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
            <polyline points="3 5 7 9 11 5"/>
          </svg>
        </button>

        {expanded && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label htmlFor="keywords" style={{ display: "block", marginBottom: 6, fontFamily: "var(--font-inter), sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                ¿Cómo te buscaría un cliente en Google?
              </label>
              <ChipInput chips={keywords} onChange={setKeywords} />
              <p style={{ marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-inter), sans-serif" }}>
                Presiona Enter o coma para agregar · Máximo {MAX_CHIPS}
              </p>
            </div>

            <div>
              <label htmlFor="country" style={{ display: "block", marginBottom: 6, fontFamily: "var(--font-inter), sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                ¿Dónde están tus clientes?
              </label>
              <div style={{ position: "relative" }}>
                <select
                  id="country" name="countryCode"
                  value={countryCode} onChange={e => setCountryCode(Number(e.target.value))}
                  style={{ width: "100%", padding: "14px 18px", background: "#111", border: `1px solid ${Gb}`, borderRadius: 12, color: "#fff", fontFamily: "var(--font-inter), sans-serif", fontSize: 15, outline: "none", appearance: "none", cursor: "pointer" }}
                >
                  {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                </select>
                <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                  <svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={1.6} strokeLinecap="round"><polyline points="3 5 7 9 11 5"/></svg>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="google-business" style={{ display: "block", marginBottom: 6, fontFamily: "var(--font-inter), sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                ¿Tienes perfil en Google Maps?
              </label>
              <input
                id="google-business" name="googleBusiness" type="url"
                value={googleBiz} onChange={e => setGoogleBiz(e.target.value)}
                placeholder="https://maps.google.com/?cid=..." autoComplete="url"
                style={inputStyle(googleBiz.length > 0)}
                onFocus={e  => { e.target.style.borderColor = Gb; }}
                onBlur={e => { if (!googleBiz) e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
              />
              <p style={{ marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-inter), sans-serif" }}>
                Link de tu negocio en Google Maps · Opcional
              </p>
            </div>
          </div>
        )}

        <button
          type="submit" disabled={!canSubmit}
          style={{
            marginTop: 4, padding: "15px 32px", borderRadius: 12, border: "none",
            background: canSubmit ? G : "rgba(93,184,72,0.25)", color: "#0a0a0a",
            fontFamily: "var(--font-inter), sans-serif", fontWeight: 700, fontSize: 16,
            cursor: canSubmit ? "pointer" : "default", transition: "all 0.15s",
          }}
          onMouseEnter={e => { if (canSubmit) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(93,184,72,0.4)"; } }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
        >
          Generar mi reporte →
        </button>

        <p style={{ textAlign: "center", fontSize: 12, marginTop: 4, color: "rgba(255,255,255,0.28)", fontFamily: "var(--font-inter), sans-serif", lineHeight: 1.6 }}>
          Sin tarjeta de crédito · Resultados en ~90 segundos
        </p>
      </form>
    </div>
  );
}

// ── ScanningCard ──────────────────────────────────────────────────────────────
function ScanningCard({ domain, businessName }: { domain: string; businessName: string }) {
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
    <div style={{ maxWidth: 480, margin: "60px auto", background: "rgba(255,255,255,0.025)", border: `1px solid ${Gb}`, borderRadius: 20, padding: "40px 36px", textAlign: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: Gs, border: `1px solid ${Gb}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", animation: "pulse-soft 2s ease-in-out infinite" }}>
        <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>
      <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 18, marginBottom: 8 }}>Generando tu reporte</div>
      <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 20, color: "#fff", marginBottom: 4, letterSpacing: "-0.02em" }}>{businessName}</div>
      <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 28 }}>{domain}</div>
      <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 32 }}>~90 segundos · datos en tiempo real de Google</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, background: i <= step ? Gs : "rgba(255,255,255,0.04)", border: `1px solid ${i <= step ? Gb : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {i < step ? (
                <svg width={10} height={10} viewBox="0 0 10 10" fill="none" stroke={G} strokeWidth={1.6} strokeLinecap="round"><polyline points="2 5 4 7 8 3"/></svg>
              ) : i === step ? (
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: G, animation: "pulse-dot 1.2s ease-in-out infinite" }} />
              ) : null}
            </div>
            <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 13, color: i <= step ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)" }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Resumen (cuando ya hay reporte) ──────────────────────────────────────────
function ResumeSection() {
  const [health, setHealth] = useState<HealthScoreData | null>(null);
  const [domain, setDomain] = useState<string>("");

  useEffect(() => {
    const report = readFreeReport();
    if (report?.auditResult?.health) setHealth(report.auditResult.health);
    if (report?.auditResult?.domain) setDomain(report.auditResult.domain);
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px", display: "flex", flexDirection: "column", gap: 40 }}>
      {/* Health score hero */}
      {health && <SaludDigitalSection data={health}/>}

      {/* Quick-access cards */}
      <div>
        {!health && (
          <>
            <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 20, marginBottom: 12, textAlign: "center" }}>
              Tu reporte está listo
            </div>
            <h1 style={{
              fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
              fontSize: "clamp(26px, 3.5vw, 40px)", color: "#fff",
              letterSpacing: "-0.03em", textAlign: "center", marginBottom: 14,
            }}>
              Resumen de salud digital
            </h1>
            <p style={{
              fontFamily: "var(--font-inter), sans-serif", fontSize: 15,
              color: "rgba(255,255,255,0.4)", textAlign: "center", marginBottom: 40, lineHeight: 1.6,
            }}>
              Explora cada sección desde el panel lateral para ver el análisis completo.
            </p>
          </>
        )}

        {/* Cards de acceso rápido */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {[
            { label: "Posicionamiento",    href: "/dashboard/posicionamiento",       emoji: "🔍", desc: "Cómo apareces en Google" },
            { label: "Sitio web",          href: "/dashboard/sitio-web",             emoji: "🌐", desc: "Auditoría técnica y velocidad" },
            { label: "Perfil de Google",   href: "/dashboard/perfil-google",         emoji: "📍", desc: "Google Maps y reseñas" },
            { label: "Investigación",      href: "/dashboard/investigacion-mercado", emoji: "📊", desc: "Keywords y volumen" },
            { label: "Prospectos",         href: "/dashboard/prospectos",            emoji: "🎯", desc: "Clientes potenciales" },
            { label: "Automatizaciones",   href: "/dashboard/automatizaciones",      emoji: "⚡", desc: "Acciones automáticas — BETA" },
          ].map(c => (
            <a
              key={c.href} href={c.href}
              style={{
                display: "block", padding: "20px 20px",
                background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14, textDecoration: "none", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = Gs; e.currentTarget.style.borderColor = Gb; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.025)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
            >
              <div style={{ fontSize: 24, marginBottom: 10 }}>{c.emoji}</div>
              <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 12, color: "rgba(255,255,255,0.38)" }}>{c.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
type Phase = "form" | "scanning" | "done" | "error";

export default function DashboardResumen() {
  const router = useRouter();
  const [phase,       setPhase]       = useState<Phase>("form");
  const [currentForm, setCurrentForm] = useState<AuditFormData | null>(null);
  const [errMsg,      setErrMsg]      = useState("");

  useEffect(() => {
    if (readFreeReport()) setPhase("done");
  }, []);

  const runAudit = useCallback(async (data: AuditFormData) => {
    setCurrentForm(data);
    setPhase("scanning");
    setErrMsg("");

    try {
      const keyword = data.keywords[0] || undefined;
      const { job_id, status, cached } = await triggerAudit(data.domain, keyword);

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

      saveFreeReport(serp, data, result);
      // Redirect to posicionamiento to show SERP results immediately
      router.push("/dashboard/posicionamiento");
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Error desconocido");
      setPhase("error");
    }
  }, [router]);

  return (
    <div style={{ minHeight: "60vh", position: "relative" }}>
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
        maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 90%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 90%)",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {phase === "form"     && <AuditForm onSubmit={runAudit} />}
        {phase === "scanning" && currentForm && (
          <ScanningCard domain={currentForm.domain} businessName={currentForm.businessName} />
        )}
        {phase === "done"     && <ResumeSection />}
        {phase === "error"    && (
          <div style={{ maxWidth: 480, margin: "80px auto", padding: "40px 36px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 20, textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 18, color: "#ef4444", marginBottom: 12 }}>Error al analizar</div>
            <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 24, lineHeight: 1.6 }}>{errMsg}</p>
            <button onClick={() => setPhase("form")} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: G, color: "#0a0a0a", fontFamily: "var(--font-inter), sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              Intentar de nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
