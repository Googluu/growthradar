"use client";

import { useInView } from "@/hooks/useInView";
import type { AuditResult } from "@/types/audit";

// ── Score Ring ─────────────────────────────────────────────────────────────────
function ScoreRing({ score, started }: { score: number; started: boolean }) {
  const r    = 80;
  const circ = 2 * Math.PI * r;
  const fill = circ * (1 - score / 100);
  const color = score >= 75 ? "#5DB848" : score >= 50 ? "#F5C842" : "#E53935";

  return (
    <div style={{ position: "relative", width: 200, height: 200, flexShrink: 0 }}>
      <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5DB848" />
            <stop offset="100%" stopColor="#A3C94A" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle cx="100" cy="100" r={r}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        {/* Animated arc */}
        <circle cx="100" cy="100" r={r}
          fill="none"
          stroke="url(#arcGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={started ? fill : circ}
          style={{ transition: started ? "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)" : "none" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 44, color, lineHeight: 1 }}>
          {score}
        </span>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 2 }}>/ 100</span>
      </div>
    </div>
  );
}

// ── Metric Bar ─────────────────────────────────────────────────────────────────
const STATUS_META: Record<string, { color: string; label: string; dot: string }> = {
  good:               { color: "#5DB848", label: "BUENO",   dot: "🟢" },
  needs_improvement:  { color: "#F5C842", label: "MEJORAR", dot: "🟡" },
  poor:               { color: "#E53935", label: "CRÍTICO", dot: "🔴" },
};

function MetricBar({ label, value, status, barPct, started }: {
  label: string; value: string; status: string; barPct: number; started: boolean;
}) {
  const { color, label: statusLabel, dot } = STATUS_META[status] ?? STATUS_META.good;
  return (
    <div style={{ paddingBottom: 10, marginBottom: 2 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
          {label}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>
            {value}
          </span>
          <span style={{ fontSize: 10, color, fontWeight: 700 }}>{dot} {statusLabel}</span>
        </div>
      </div>
      <div className="demo-bar">
        <div
          className={`demo-bar-fill${started ? " animate" : ""}`}
          style={{ "--bar-w": `${barPct}%`, background: color } as React.CSSProperties}
        />
      </div>
    </div>
  );
}

// ── Check Row ──────────────────────────────────────────────────────────────────
function CheckRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="demo-check-row">
      <span style={{
        width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: ok ? "rgba(93,184,72,0.18)" : "rgba(229,57,53,0.15)",
        fontSize: 10,
      }}>
        <span style={{ color: ok ? "#5DB848" : "#E53935" }}>{ok ? "✓" : "✕"}</span>
      </span>
      <span style={{
        fontFamily: "var(--font-dm-sans)", fontSize: 13,
        color: ok ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.45)",
      }}>
        {label}
      </span>
    </div>
  );
}

// ── Rec Card ───────────────────────────────────────────────────────────────────
interface RecData {
  badge: string; title: string; problem: string;
  action: string; impact: string; effort: string; accent: string;
}

function RecCard({ rec, delay }: { rec: RecData; delay: number }) {
  return (
    <div className="demo-rec-card" style={{ border: `1px solid ${rec.accent}44`, animationDelay: `${delay}ms` }}>
      <span style={{
        display: "inline-block",
        background: rec.accent + "1A", color: rec.accent, border: `1px solid ${rec.accent}44`,
        borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700,
        fontFamily: "var(--font-dm-sans)", letterSpacing: "0.06em", marginBottom: 16,
      }}>{rec.badge}</span>

      <h4 style={{
        fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 16,
        color: "rgba(255,255,255,0.92)", marginBottom: 12, letterSpacing: "-0.3px", lineHeight: 1.3,
      }}>{rec.title}</h4>

      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
        Problema
      </p>
      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 12 }}>
        {rec.problem}
      </p>

      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: 11, fontWeight: 700, color: rec.accent, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
        Acción
      </p>
      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, marginBottom: 16 }}>
        {rec.action}
      </p>

      <div style={{
        display: "flex", gap: 12, flexWrap: "wrap",
        borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14,
      }}>
        <div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-dm-sans)", marginBottom: 2 }}>IMPACTO ESTIMADO</div>
          <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-dm-sans)", color: rec.accent }}>{rec.impact}</div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-dm-sans)", marginBottom: 2 }}>ESFUERZO</div>
          <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-dm-sans)", color: "rgba(255,255,255,0.55)" }}>{rec.effort}</div>
        </div>
      </div>
    </div>
  );
}

// ── Static data (dian.gov.co demo) ────────────────────────────────────────────
const METRICS = [
  { label: "LCP",  value: "1.4s",  status: "good",              barPct: 88 },
  { label: "FCP",  value: "1.2s",  status: "good",              barPct: 92 },
  { label: "INP",  value: "62ms",  status: "good",              barPct: 94 },
  { label: "TTFB", value: "439ms", status: "needs_improvement", barPct: 56 },
  { label: "CLS",  value: "0.33",  status: "poor",              barPct: 22 },
];

const CHECKS = [
  { ok: true,  label: "HTTPS activo" },
  { ok: false, label: "Sin meta description" },
  { ok: false, label: "Sin etiqueta H1" },
  { ok: false, label: "Sin sitemap.xml" },
  { ok: false, label: "Sin robots.txt" },
  { ok: true,  label: "Dominio con autoridad (DA alta)" },
];

const RECS: RecData[] = [
  {
    badge: "QUICK WIN · ALTO IMPACTO",
    title: "Agrega meta description a todas las páginas",
    problem: "El 100% de tus páginas carecen de meta description. Google genera snippets automáticos que reducen el CTR orgánico de forma significativa.",
    action: "Escribe una meta description única de 150–160 caracteres por página principal con tu keyword objetivo y una llamada a la acción clara.",
    impact: "+15–30% CTR en búsquedas",
    effort: "2–4 horas",
    accent: "#5DB848",
  },
  {
    badge: "QUICK WIN · ALTO IMPACTO",
    title: "Implementa etiquetas H1 en cada página",
    problem: "Sin H1 visible, los motores de búsqueda no pueden determinar el tema principal de cada página y penalizan tu relevancia semántica.",
    action: "Agrega un H1 único y descriptivo por página que incluya la keyword principal. Solo debe haber un H1 por URL.",
    impact: "+20% relevancia semántica",
    effort: "1–2 horas",
    accent: "#A3C94A",
  },
  {
    badge: "ESTRATÉGICO · CRÍTICO",
    title: "Corrige el Cumulative Layout Shift (CLS: 0.33)",
    problem: "Tu CLS está en zona POBRE (umbral: 0.1). Elementos visuales saltan mientras carga la página, lo que aumenta el rebote en móvil y afecta el ranking.",
    action: "Reserva dimensiones explícitas para imágenes, embeds y anuncios. Evita insertar contenido sobre texto existente durante la carga.",
    impact: "Mejora directa Core Web Vitals",
    effort: "1–2 días dev",
    accent: "#F5C842",
  },
];

// ── Main Component ─────────────────────────────────────────────────────────────
interface Props {
  reportData: AuditResult | null; // null = modo demo (dian.gov.co)
  onScan: () => void;             // dispara el scan desde el input secundario
}

export function DemoReport({ reportData: _reportData, onScan: _onScan }: Props) {
  const [ref, inView] = useInView();

  return (
    <section
      id="demo-section"
      ref={ref}
      style={{ background: "var(--bg)", padding: "96px 24px" }}
    >
      <div className="max-w-275 mx-auto">

        {/* ── Header ── */}
        <div
          className="mb-14 text-center transition-all duration-700"
          style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(24px)" }}
        >
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "var(--bg2)", border: "1px solid rgba(93,184,72,0.3)",
            borderRadius: 20, padding: "5px 14px", marginBottom: 20,
          }}>
            <span className="demo-blink" style={{ width: 7, height: 7, borderRadius: "50%", background: "#5DB848", display: "inline-block" }} />
            <span style={{ color: "#5DB848", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "var(--font-dm-sans)" }}>
              DEMO INTERACTIVO
            </span>
          </div>
          <h2 style={{
            fontFamily: "var(--font-syne)", fontWeight: 800,
            fontSize: "clamp(32px,4.5vw,56px)", letterSpacing: "-2px",
            color: "var(--txt)", lineHeight: 1.05, marginBottom: 14,
          }}>Tu diagnóstico digital</h2>
          <p style={{ color: "var(--txt-muted)", fontSize: 16, maxWidth: 480, margin: "0 auto", fontFamily: "var(--font-dm-sans)" }}>
            Análisis real de <strong style={{ color: "var(--txt)" }}>dian.gov.co</strong> — así se ve tu reporte
          </p>
        </div>

        {/* ── Row 1: Score Ring + AI Summary ── */}
        <div className="demo-row1 mb-5">
          {/* Score Ring Card */}
          <div style={{
            background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: 16, padding: "32px 24px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
          }}>
            <div style={{ color: "var(--txt-faint)", fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-dm-sans)" }}>
              Puntuación EDA
            </div>
            <ScoreRing score={80} started={inView} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
              {[
                { label: "PERFORMANCE", color: "#5DB848",                icon: "✓" },
                { label: "SEO",         color: "#F5C842",                icon: "⚠" },
                { label: "PRESENCIA",   color: "rgba(255,255,255,0.25)", icon: "—" },
              ].map((b) => (
                <div key={b.label} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "var(--bg3)", borderRadius: 8, padding: "8px 12px",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}>
                  <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 12, fontWeight: 700, color: b.color, letterSpacing: "0.07em" }}>
                    {b.label}
                  </span>
                  <span style={{ color: b.color, fontSize: 14, fontWeight: 700 }}>{b.icon}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Summary Card */}
          <div className="demo-ai-card" style={{
            background: "var(--bg2)",
            borderLeft: "4px solid #5DB848",
            borderTop: "1px solid var(--border)",
            borderRight: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
            padding: "28px 32px",
            display: "flex", flexDirection: "column", gap: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                background: "rgba(93,184,72,0.15)", border: "1px solid rgba(93,184,72,0.3)",
                borderRadius: 8, padding: "6px 10px",
                fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 14, color: "#5DB848",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span className="demo-blink" style={{ width: 6, height: 6, borderRadius: "50%", background: "#5DB848", display: "inline-block" }} />
                AI
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 17, color: "var(--txt)" }}>
                  Análisis de Claude AI
                </div>
                <div style={{ fontSize: 11, color: "var(--txt-faint)", fontFamily: "var(--font-dm-sans)" }}>
                  claude-sonnet-4-6 · 2.5k tokens
                </div>
              </div>
            </div>

            <p style={{
              fontFamily: "var(--font-dm-sans)", fontSize: 14, color: "rgba(255,255,255,0.65)",
              lineHeight: 1.75, flexGrow: 1,
              borderLeft: "1px solid rgba(255,255,255,0.08)", paddingLeft: 16,
            }}>
              Tu sitio tiene una base técnica sólida — velocidad de carga en el{" "}
              <span style={{ color: "#5DB848", fontWeight: 600 }}>top 20% para Colombia</span>.
              Sin embargo, estás dejando dinero sobre la mesa: sin meta description, sin H1,
              y un CLS crítico que afecta la experiencia móvil. Con{" "}
              <span style={{ color: "#A3C94A", fontWeight: 600 }}>44,868 keywords posicionadas</span>{" "}
              y tráfico estimado de{" "}
              <span style={{ color: "#A3C94A", fontWeight: 600 }}>$6.1M USD</span>,
              una optimización SEO básica podría triplicar tu visibilidad en 60 días.
            </p>

            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{
                background: "rgba(93,184,72,0.12)", border: "1px solid rgba(93,184,72,0.3)",
                color: "#5DB848", borderRadius: 20, padding: "5px 14px",
                fontSize: 12, fontWeight: 700, fontFamily: "var(--font-dm-sans)", letterSpacing: "0.06em",
              }}>POTENCIAL ALTO</span>
              <span style={{ color: "var(--txt-faint)", fontSize: 12 }}>·</span>
              <span style={{
                background: "rgba(245,200,66,0.1)", border: "1px solid rgba(245,200,66,0.3)",
                color: "#F5C842", borderRadius: 20, padding: "5px 14px",
                fontSize: 12, fontWeight: 700, fontFamily: "var(--font-dm-sans)", letterSpacing: "0.06em",
              }}>Acción rápida</span>
            </div>
          </div>
        </div>

        {/* ── Row 2: Performance + SEO ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

          {/* Performance Card */}
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>⚡</span>
                <span style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 17, color: "var(--txt)" }}>Performance</span>
              </div>
              <div style={{
                background: "rgba(93,184,72,0.15)", color: "#5DB848",
                border: "1px solid rgba(93,184,72,0.3)",
                borderRadius: 20, padding: "3px 12px",
                fontFamily: "var(--font-dm-sans)", fontSize: 12, fontWeight: 700,
              }}>80 / 100</div>
            </div>
            <div>
              {METRICS.map((m) => <MetricBar key={m.label} {...m} started={inView} />)}
            </div>
            <div style={{
              marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ fontSize: 10, color: "var(--txt-faint)" }}>●</span>
              <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 11, color: "var(--txt-faint)" }}>
                Datos reales de Chrome UX Report (CrUX) · Mar–Abr 2026
              </span>
            </div>
          </div>

          {/* SEO & Presence Card */}
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>🔍</span>
                <span style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 17, color: "var(--txt)" }}>SEO & Presencia</span>
              </div>
              <div style={{
                background: "rgba(245,200,66,0.12)", color: "#F5C842",
                border: "1px solid rgba(245,200,66,0.3)",
                borderRadius: 20, padding: "3px 12px",
                fontFamily: "var(--font-dm-sans)", fontSize: 12, fontWeight: 700,
              }}>50 / 100</div>
            </div>
            <div style={{ marginBottom: 18 }}>
              {CHECKS.map((c, i) => <CheckRow key={i} {...c} />)}
            </div>
            <div style={{ height: 1, background: "var(--border)", margin: "0 0 18px" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { val: "44,868", lbl: "Keywords" },
                { val: "3,639",  lbl: "Posición #1" },
                { val: "$6.1M",  lbl: "Tráfico ETV" },
                { val: "Alto",   lbl: "Potencial" },
              ].map((s) => (
                <div key={s.lbl} style={{ background: "var(--bg3)", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 22, color: "var(--txt)", letterSpacing: "-0.5px" }}>
                    {s.val}
                  </div>
                  <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: 11, color: "var(--txt-muted)", marginTop: 2 }}>
                    {s.lbl}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 3: Recommendations ── */}
        <div style={{
          background: "var(--bg2)", border: "1px solid var(--border)",
          borderRadius: 16, padding: "32px 28px",
        }}>
          <div style={{ marginBottom: 28 }}>
            <h3 style={{
              fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 22,
              letterSpacing: "-0.7px", color: "var(--txt)", marginBottom: 6,
            }}>Plan de acción priorizado</h3>
            <p style={{ color: "var(--txt-muted)", fontSize: 13, fontFamily: "var(--font-dm-sans)" }}>
              Ordenado por impacto · Generado por Claude AI
            </p>
          </div>
          <div className="demo-recs-grid">
            {RECS.map((r, i) => <RecCard key={i} rec={r} delay={i * 100} />)}
          </div>
        </div>

        {/* ── Footer CTA ── */}
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 14 }}>
            <button className="demo-btn-primary demo-pulse" style={{ fontFamily: "var(--font-dm-sans)" }}>
              Auditar mi sitio →
            </button>
            <button className="demo-btn-outline" style={{ fontFamily: "var(--font-dm-sans)" }}>
              Ver reporte completo de demo
            </button>
          </div>
          <p style={{ color: "var(--txt-muted)", fontSize: 13, fontFamily: "var(--font-dm-sans)" }}>
            Resultado en &lt;30 segundos · Sin tarjeta de crédito
          </p>
        </div>

      </div>
    </section>
  );
}
