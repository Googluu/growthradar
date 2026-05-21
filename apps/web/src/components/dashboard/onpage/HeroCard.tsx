"use client";

import type { OnPageData } from "@/types/dashboard";
import {
  G, Gs, Gb, C, scoreColor, scoreLabel, useCountUp,
  Badge, IconCheck, IconAlert, IconX, IconGlobe, IconShield, IconLayers, IconExternal,
} from "./shared";

// ── RadialScore ────────────────────────────────────────────────────────────────
function RadialScore({ score, size = 200 }: { score: number; size?: number }) {
  const animated = useCountUp(score, 1200);
  const color = scoreColor(score);
  const stroke = 18;
  const r = (size - stroke) / 2;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const sweep = 270;
  const dashArr = `${(sweep / 360) * circ} ${circ}`;
  const dashOff = (1 - score / 100) * (sweep / 360) * circ;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(135deg)", display: "block" }}>
        <defs>
          <linearGradient id="hero-rad-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
          <filter id="hero-rad-glow">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}
          strokeDasharray={`${(sweep / 360) * circ} ${circ}`} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke="url(#hero-rad-grad)" strokeWidth={stroke}
          strokeDasharray={dashArr} strokeDashoffset={dashOff}
          strokeLinecap="round" filter="url(#hero-rad-glow)"
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.2,0.9,0.3,1)" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}>
        <div style={{
          fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
          fontSize: 56, color, lineHeight: 1, letterSpacing: "-0.04em",
        }}>{animated}</div>
        <div style={{ fontSize: 12, color: C.text3, fontWeight: 500, marginTop: 4 }}>/ 100</div>
        <div style={{
          fontFamily: "var(--font-inter), sans-serif", fontSize: 12, fontWeight: 600,
          color, marginTop: 8, letterSpacing: "0.04em", textTransform: "uppercase",
        }}>{scoreLabel(score)}</div>
      </div>
    </div>
  );
}

// ── HeroKpi ────────────────────────────────────────────────────────────────────
function HeroKpi({
  icon, iconColor, label, value, sub, tone,
}: {
  icon: React.ReactNode; iconColor: string; label: string;
  value: string | number; sub: string;
  tone: "red" | "green" | "default";
}) {
  const bg = tone === "red"   ? "rgba(239,68,68,0.08)"
           : tone === "green" ? Gs
           : "rgba(255,255,255,0.025)";
  const br = tone === "red"   ? "rgba(239,68,68,0.25)"
           : tone === "green" ? Gb
           : C.border;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "12px 14px", borderRadius: 12,
      background: bg, border: `1px solid ${br}`,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: "rgba(0,0,0,0.3)",
        color: iconColor,
        display: "flex", alignItems: "center", justifyContent: "center",
        border: `1px solid ${iconColor}40`,
        flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 10.5, color: C.text3, letterSpacing: "0.06em",
          textTransform: "uppercase", fontWeight: 600, marginBottom: 2,
        }}>{label}</div>
        <div style={{
          fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
          fontSize: 22, color: iconColor, lineHeight: 1.1,
        }}>{value}</div>
        <div style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

// ── HeroCard ───────────────────────────────────────────────────────────────────
export function HeroCard({ data }: { data: OnPageData }) {
  const { health } = data;
  const color = scoreColor(health.computed_health_score);
  const total = health.issues_count + health.passing_count;
  const passPct = total > 0 ? Math.round((health.passing_count / total) * 100) : 0;

  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 16, padding: 28,
      position: "relative", overflow: "hidden",
    }}>
      {/* Decorative radial gradient */}
      <div style={{
        position: "absolute", top: -100, right: -100,
        width: 320, height: 320,
        background: `radial-gradient(circle, ${color}22, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <div style={{
        display: "grid",
        gridTemplateColumns: "1.2fr auto 1fr",
        gap: 32, alignItems: "center", position: "relative",
      }}>
        {/* Left: URL info */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 18 }}>
              Auditoría On-Page
            </div>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.text4 }} />
            <div style={{ fontSize: 12, color: C.text3 }}>Salud técnica de la página</div>
          </div>
          <h1 style={{
            fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
            fontSize: "clamp(18px, 2.2vw, 28px)", lineHeight: 1.15,
            color: C.text, letterSpacing: "-0.02em",
            marginBottom: 12, wordBreak: "break-all",
          }}>
            <span style={{ color: C.text3 }}>{data.url.split("://")[0]}://</span>
            {data.url.split("://")[1]}
          </h1>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            <Badge tone={health.http_status_class === "2xx" ? "green" : "red"}>
              <IconGlobe size={11} /> HTTP {data.status_code}
            </Badge>
            {data.canonical && (
              <Badge tone="default">
                <IconShield size={11} /> Canonical
              </Badge>
            )}
            <Badge tone="default">
              <IconLayers size={11} /> OnPage {Math.round(health.onpage_score)}
            </Badge>
            {data.is_https && <Badge tone="green">HTTPS</Badge>}
          </div>
          <a
            href={data.url}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${C.border}`,
              color: C.text2, fontSize: 13, fontWeight: 500,
              padding: "8px 14px", borderRadius: 9,
              textDecoration: "none", transition: "all 0.15s",
            }}
          >
            Abrir página <IconExternal size={12} />
          </a>
        </div>

        {/* Center: radial score */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <RadialScore score={health.computed_health_score} />
          <div style={{
            fontSize: 11, color: C.text3, letterSpacing: "0.06em",
            textTransform: "uppercase", fontWeight: 600,
          }}>Health Score</div>
        </div>

        {/* Right: KPIs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <HeroKpi
            icon={<IconAlert size={18} />} iconColor="#ef4444"
            label="Issues encontrados"
            value={health.issues_count}
            sub={`${health.issues_count} críticos detectados`}
            tone="red"
          />
          <HeroKpi
            icon={<IconCheck size={18} />} iconColor={G}
            label="Checks aprobados"
            value={health.passing_count}
            sub={`${passPct}% de las pruebas`}
            tone="green"
          />
          <HeroKpi
            icon={health.is_indexable ? <IconCheck size={18} /> : <IconX size={18} />}
            iconColor={health.is_indexable ? G : "#ef4444"}
            label="Indexable"
            value={health.is_indexable ? "Sí" : "No"}
            sub={health.is_indexable ? "Google puede indexar esta URL" : "noindex bloquea la indexación"}
            tone={health.is_indexable ? "green" : "red"}
          />
        </div>
      </div>
    </div>
  );
}
