"use client";

import { useState, useEffect } from "react";
import type { HealthScoreData } from "@/types/dashboard";

const G  = "#5DB848";
const Gs = "rgba(93,184,72,0.12)";
const Gb = "rgba(93,184,72,0.35)";
const AM = "#f59e0b";
const RD = "#ef4444";
const BL = "#60a5fa";
const PU = "#a78bfa";

const C = {
  card: "rgba(255,255,255,0.025)",
  border: "rgba(255,255,255,0.07)",
  text: "#fff",
  text2: "rgba(255,255,255,0.65)",
  text3: "rgba(255,255,255,0.42)",
  text4: "rgba(255,255,255,0.28)",
};

function scoreColor(s: number | null) {
  if (s == null) return C.text3;
  if (s >= 80) return G;
  if (s >= 50) return AM;
  return RD;
}
function scoreLabel(s: number | null) {
  if (s == null) return "—";
  if (s >= 80) return "Excelente";
  if (s >= 50) return "Mejorable";
  return "Crítico";
}

function useCountUp(target: number, duration = 1200, delay = 200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now() + delay;
    const tick = (now: number) => {
      const t = Math.max(0, now - start);
      const p = Math.min(1, t / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, delay]);
  return value;
}

function RadialGauge({ score, size = 260 }: { score: number; size?: number }) {
  const color = scoreColor(score);
  const stroke = 20;
  const r = (size - stroke) / 2;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const sweep = 270;
  const arcLen = (sweep / 360) * circ;
  const offset = (1 - (score || 0) / 100) * arcLen;
  const display = useCountUp(score || 0);

  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      <div style={{
        position: "absolute", inset: -20,
        background: `radial-gradient(circle, ${color}22, transparent 65%)`,
        pointerEvents: "none", borderRadius: "50%",
      }} />
      <svg width={size} height={size} style={{ transform: "rotate(135deg)", display: "block" }}>
        <defs>
          <linearGradient id="rg-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
          <filter id="rg-glow">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}
          strokeDasharray={`${arcLen} ${circ}`} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke="url(#rg-grad)" strokeWidth={stroke}
          strokeDasharray={`${arcLen} ${circ}`}
          strokeDashoffset={offset} strokeLinecap="round"
          filter="url(#rg-glow)"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.2,0.9,0.3,1)" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", pointerEvents: "none",
      }}>
        <div style={{
          fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
          fontSize: 76, lineHeight: 0.95, color,
          letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums",
        }}>{display}</div>
        <div style={{ fontSize: 12, color: C.text3, fontWeight: 500, marginTop: 6 }}>/ 100</div>
        <div style={{
          fontFamily: "var(--font-inter), sans-serif", fontSize: 12, fontWeight: 700,
          color, marginTop: 10, letterSpacing: "0.08em", textTransform: "uppercase",
          padding: "4px 12px", background: `${color}18`,
          border: `1px solid ${color}40`, borderRadius: 999,
        }}>{scoreLabel(score)}</div>
      </div>
    </div>
  );
}

interface DimConfig {
  key: keyof HealthScoreData["breakdown"];
  label: string;
  color: string;
  icon: React.ReactNode;
}

const DIM_CONFIGS: DimConfig[] = [
  {
    key: "seo_score",
    label: "SEO",
    color: G,
    icon: (
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
  {
    key: "performance_score",
    label: "Rendimiento",
    color: AM,
    icon: (
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" fillOpacity="0.15"/>
      </svg>
    ),
  },
  {
    key: "social_score",
    label: "Social",
    color: BL,
    icon: (
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    key: "reputation_score",
    label: "Reputación",
    color: PU,
    icon: (
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" fillOpacity="0.15"/>
      </svg>
    ),
  },
];

function DimensionRow({
  config, dim, totalWeight, delay,
}: {
  config: DimConfig;
  dim: HealthScoreData["breakdown"][keyof HealthScoreData["breakdown"]];
  totalWeight: number;
  delay: number;
}) {
  const hasData = dim.score != null;
  const score   = hasData ? (dim.score as number) : 0;
  const sColor  = hasData ? scoreColor(dim.score) : C.text4;
  const weightPct = totalWeight > 0 ? Math.round((dim.weight_used / totalWeight) * 100) : 0;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16,
      padding: "14px 0", opacity: hasData ? 1 : 0.55,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: hasData ? `${config.color}18` : "rgba(255,255,255,0.04)",
        color: hasData ? config.color : C.text3,
        border: `1px solid ${hasData ? `${config.color}40` : C.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative",
      }}>
        {config.icon}
        {!hasData && (
          <div style={{
            position: "absolute", bottom: -3, right: -3,
            width: 16, height: 16, borderRadius: "50%",
            background: "#111", color: C.text3,
            border: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8, gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 15, color: C.text, fontWeight: 600 }}>{config.label}</span>
            {!hasData && (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                background: "rgba(255,255,255,0.06)", color: C.text3,
                border: `1px solid ${C.border}`, letterSpacing: "0.04em", textTransform: "uppercase",
              }}>Próximamente</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
            {hasData ? (
              <>
                <span style={{
                  fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
                  fontSize: 24, color: sColor, lineHeight: 1, letterSpacing: "-0.02em",
                }}>{dim.score}</span>
                <span style={{ fontSize: 11, color: C.text3 }}>/100</span>
              </>
            ) : (
              <span style={{ fontSize: 13, color: C.text3, fontStyle: "italic" }}>Sin datos</span>
            )}
          </div>
        </div>

        <div style={{
          height: 7, borderRadius: 999,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.04)",
          overflow: "hidden",
        }}>
          {hasData && (
            <div style={{
              width: `${score}%`, height: "100%",
              background: `linear-gradient(90deg, ${sColor}cc, ${sColor})`,
              borderRadius: 999,
              boxShadow: `0 0 8px ${sColor}50`,
              transition: `width 0.9s cubic-bezier(0.2,0.9,0.3,1) ${delay}s`,
            }} />
          )}
        </div>

        <div style={{ fontSize: 11, color: C.text3, marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
          {hasData ? (
            <>
              <span style={{ fontFamily: "var(--font-mono), monospace", color: C.text2 }}>{weightPct}%</span>
              <span>del puntaje total</span>
              <span style={{ fontFamily: "var(--font-mono), monospace", color: C.text4, fontSize: 10 }}>
                · peso base {Math.round(dim.weight_base * 100)}%
              </span>
            </>
          ) : (
            <span style={{ color: C.text4, fontStyle: "italic" }}>No contribuye al puntaje</span>
          )}
        </div>
      </div>
    </div>
  );
}

export function SaludDigitalSection({ data }: { data: HealthScoreData }) {
  const { health_score, available_dimensions, total_dimensions, breakdown } = data;
  const totalWeight = Object.values(breakdown).reduce((s, d) => s + (d.weight_used || 0), 0);
  const mainColor = scoreColor(health_score);

  return (
    <div style={{
      background: `radial-gradient(ellipse 80% 60% at 20% 0%, ${mainColor}10, transparent 70%), linear-gradient(180deg, #171717, #131313)`,
      border: `1px solid ${C.border}`,
      borderRadius: 24, overflow: "hidden", position: "relative",
    }}>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 90%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 90%)",
        opacity: 0.6,
      }} />

      <div className="hero-split" style={{ display: "grid", gridTemplateColumns: "40% 60%", position: "relative" }}>
        {/* Left: gauge */}
        <div style={{
          padding: "44px 36px",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          borderRight: `1px solid ${C.border}`,
        }}>
          <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 18, marginBottom: 4 }}>
            Tu salud digital
          </div>
          <h1 style={{
            fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
            fontSize: 26, letterSpacing: "-0.02em",
            color: C.text, marginBottom: 28, textAlign: "center",
          }}>Salud Digital</h1>

          <RadialGauge score={health_score} />

          <div style={{
            marginTop: 28, padding: "10px 16px",
            background: "rgba(255,255,255,0.025)", border: `1px solid ${C.border}`,
            borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            <div style={{ display: "flex", gap: 4 }}>
              {Array.from({ length: total_dimensions }).map((_, i) => (
                <span key={i} style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: i < available_dimensions ? G : "rgba(255,255,255,0.15)",
                  boxShadow: i < available_dimensions ? `0 0 6px ${G}80` : "none",
                }} />
              ))}
            </div>
            <span style={{ fontSize: 12, color: C.text2 }}>
              <strong style={{ color: C.text, fontWeight: 700 }}>{available_dimensions}</strong>
              {" "}de{" "}
              <strong style={{ color: C.text, fontWeight: 700 }}>{total_dimensions}</strong>
              {" "}dimensiones evaluadas
            </span>
          </div>
        </div>

        {/* Right: breakdown */}
        <div style={{ padding: "44px 40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 17, marginBottom: 4 }}>Desglose</div>
            <h2 style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 22, color: C.text, letterSpacing: "-0.015em" }}>
              Cómo se compone tu puntaje
            </h2>
            <p style={{ fontSize: 13, color: C.text3, marginTop: 4 }}>
              Cada dimensión aporta proporcional a su peso. Las inactivas no penalizan.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {DIM_CONFIGS.map((cfg, i) => (
              <div key={cfg.key}>
                {i > 0 && <div style={{ height: 1, background: C.border }} />}
                <DimensionRow
                  config={cfg}
                  dim={breakdown[cfg.key]}
                  totalWeight={totalWeight}
                  delay={0.1 + i * 0.08}
                />
              </div>
            ))}
          </div>

          {available_dimensions < total_dimensions && (
            <div style={{
              marginTop: 20, display: "flex", alignItems: "center", gap: 14,
              padding: "14px 18px",
              background: "linear-gradient(90deg, rgba(245,158,11,0.10), rgba(245,158,11,0.04))",
              border: "1px solid rgba(245,158,11,0.28)", borderRadius: 12, flexWrap: "wrap",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: "rgba(245,158,11,0.18)", border: "1px solid rgba(245,158,11,0.4)",
                color: AM, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 14, color: C.text, fontWeight: 600, marginBottom: 2 }}>
                  Tu puntaje se calcula con {available_dimensions} de {total_dimensions} dimensiones
                </div>
                <div style={{ fontSize: 12.5, color: C.text2 }}>
                  Activa más fuentes para un panorama completo de tu salud digital.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
