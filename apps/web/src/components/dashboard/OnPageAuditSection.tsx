"use client";

import { useEffect, useState } from "react";
import type { OnPageData } from "@/types/dashboard";

// ═══════════════════════════════════════════════════════════════════════════════
// Tokens
// ═══════════════════════════════════════════════════════════════════════════════

const G  = "#5DB848";
const Gs = "rgba(93,184,72,0.12)";
const Gb = "rgba(93,184,72,0.35)";
const AM = "#f59e0b";
const RD = "#ef4444";

const C = {
  bg:      "#0a0a0a",
  card:    "rgba(255,255,255,0.025)",
  card2:   "rgba(255,255,255,0.04)",
  card3:   "rgba(255,255,255,0.06)",
  border:  "rgba(255,255,255,0.07)",
  border2: "rgba(255,255,255,0.1)",
  text:    "#fff",
  text2:   "rgba(255,255,255,0.65)",
  text3:   "rgba(255,255,255,0.42)",
  text4:   "rgba(255,255,255,0.28)",
  red:     RD,
  amber:   AM,
  green:   G,
};

// ═══════════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════════

function scoreColor(score: number) {
  if (score >= 80) return G;
  if (score >= 50) return AM;
  return RD;
}

function scoreLabel(score: number) {
  if (score >= 80) return "Bueno";
  if (score >= 50) return "Mejorable";
  return "Deficiente";
}

function fmtMs(ms: number | null): string {
  if (ms == null) return "—";
  if (ms >= 1000) return (ms / 1000).toFixed(2).replace(/\.?0+$/, "") + " s";
  return Math.round(ms) + " ms";
}

function fmtBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function fmtNumber(n: number): string {
  return new Intl.NumberFormat("es-CO").format(n);
}

// Animated count-up hook
function useCountUp(target: number, durationMs = 1200): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t0 = Date.now();
    let raf = 0;
    const tick = () => {
      const elapsed = Date.now() - t0;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return val;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Icons (lucide-style, stroke 1.5)
// ═══════════════════════════════════════════════════════════════════════════════

interface IconProps { size?: number; color?: string }

const IconBug = ({ size = 16, color = "currentColor" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="6" width="8" height="14" rx="4"/>
    <path d="M19 7l-3 2M5 7l3 2M19 13h-3M5 13h3M19 19l-3-2M5 19l3-2"/>
  </svg>
);

const IconShield = ({ size = 16, color = "currentColor" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const IconWarn = ({ size = 16, color = "currentColor" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IconCheck = ({ size = 16, color = "currentColor" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconClock = ({ size = 16, color = "currentColor" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const IconCode = ({ size = 16, color = "currentColor" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/>
    <polyline points="8 6 2 12 8 18"/>
  </svg>
);

const IconImg = ({ size = 16, color = "currentColor" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

const IconLayers = ({ size = 16, color = "currentColor" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
);

const IconText = ({ size = 16, color = "currentColor" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 7 4 4 20 4 20 7"/>
    <line x1="9" y1="20" x2="15" y2="20"/>
    <line x1="12" y1="4" x2="12" y2="20"/>
  </svg>
);

const IconInfo = ({ size = 14, color = "currentColor" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

const IconExternal = ({ size = 12, color = "currentColor" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

const IconGlobe = ({ size = 16, color = "currentColor" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

// Categorización de issues por keyword del check → icono apropiado
function issueIcon(check: string) {
  const k = check.toLowerCase();
  if (k.includes("https") || k.includes("ssl") || k.includes("secure")) return <IconShield size={14} />;
  if (k.includes("meta") || k.includes("title") || k.includes("descrip")) return <IconText size={14} />;
  if (k.includes("img") || k.includes("alt") || k.includes("image")) return <IconImg size={14} />;
  if (k.includes("script") || k.includes("render") || k.includes("css")) return <IconCode size={14} />;
  if (k.includes("h1") || k.includes("heading")) return <IconLayers size={14} />;
  if (k.includes("link") || k.includes("redirect")) return <IconGlobe size={14} />;
  return <IconBug size={14} />;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Primitives
// ═══════════════════════════════════════════════════════════════════════════════

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 16, ...style,
    }}>
      {children}
    </div>
  );
}

function Badge({
  children, color = C.text2, bg = C.card3, border,
}: {
  children: React.ReactNode; color?: string; bg?: string; border?: string;
}) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 9px", borderRadius: 999,
      background: bg, border: `1px solid ${border ?? "transparent"}`,
      fontSize: 10.5, fontWeight: 700, color,
      letterSpacing: "0.04em", textTransform: "uppercase",
      lineHeight: 1.4,
    }}>{children}</span>
  );
}

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div>
      <h3 style={{
        fontFamily: "var(--font-syne), sans-serif", fontWeight: 700,
        fontSize: 17, color: C.text, letterSpacing: "-0.015em", margin: 0,
      }}>{title}</h3>
      {sub && <div style={{ fontSize: 12, color: C.text3, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RadialScore — gauge animado con count-up
// ═══════════════════════════════════════════════════════════════════════════════

function RadialScore({ score, size = 160 }: { score: number; size?: number }) {
  const animated = useCountUp(score, 1200);
  const color = scoreColor(score);
  const stroke = 12;
  const r = (size - stroke) / 2;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const sweep = 270;
  const arcLen = (sweep / 360) * circ;
  const dashOff = (1 - score / 100) * arcLen;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div style={{
        position: "absolute", inset: -12,
        background: `radial-gradient(circle, ${color}18, transparent 70%)`,
        borderRadius: "50%", pointerEvents: "none",
      }} />
      <svg width={size} height={size} style={{ transform: "rotate(135deg)", display: "block" }}>
        <defs>
          <linearGradient id="onpage-radial-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}
          strokeDasharray={`${arcLen} ${circ}`} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke="url(#onpage-radial-grad)" strokeWidth={stroke}
          strokeDasharray={`${arcLen} ${circ}`} strokeDashoffset={dashOff}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.2,0.9,0.3,1)" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", pointerEvents: "none",
      }}>
        <div style={{
          fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
          fontSize: 42, lineHeight: 1, color, letterSpacing: "-0.04em",
        }}>{animated}</div>
        <div style={{ fontSize: 10, color: C.text3, marginTop: 4 }}>/ 100</div>
        <div style={{
          fontFamily: "var(--font-inter), sans-serif", fontSize: 9.5, fontWeight: 700, color,
          marginTop: 6, letterSpacing: "0.08em", textTransform: "uppercase",
          padding: "3px 9px", background: `${color}18`, border: `1px solid ${color}40`, borderRadius: 999,
        }}>{scoreLabel(score)}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HeroCard — URL grande + RadialScore + KPIs alineados a la derecha
// ═══════════════════════════════════════════════════════════════════════════════

function HeroKpi({
  icon, label, value, color,
}: {
  icon: React.ReactNode; label: string; value: number; color: string;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 14px", borderRadius: 10,
      background: C.card2, border: `1px solid ${C.border}`,
    }}>
      <div style={{ flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "var(--font-inter), sans-serif", fontSize: 10,
          color: C.text3, letterSpacing: "0.06em", textTransform: "uppercase",
          fontWeight: 600,
        }}>{label}</div>
        <div style={{
          fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
          fontSize: 20, color, lineHeight: 1.1, marginTop: 2,
        }}>{value}</div>
      </div>
    </div>
  );
}

function HeroCard({ data }: { data: OnPageData }) {
  return (
    <Card style={{ padding: "32px 36px", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 32, alignItems: "center" }}>
      <RadialScore score={data.health.computed_health_score} />

      <div style={{ minWidth: 0 }}>
        <div style={{
          fontFamily: "var(--font-caveat), cursive",
          color: G, fontSize: 17, marginBottom: 4,
        }}>
          Auditoría On-Page
        </div>
        <h2 style={{
          fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
          fontSize: 26, color: C.text, letterSpacing: "-0.025em",
          margin: 0, marginBottom: 6, lineHeight: 1.15,
        }}>
          Salud técnica de la página
        </h2>
        <a
          href={data.url}
          target="_blank" rel="noopener noreferrer"
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: 12.5, color: C.text2, textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: 5,
            wordBreak: "break-all",
          }}
        >
          {data.url}
          <IconExternal size={11} color={C.text3} />
        </a>
        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {data.is_https ? (
            <Badge color={G} bg={Gs} border={Gb}>HTTPS</Badge>
          ) : (
            <Badge color={RD} bg="rgba(239,68,68,0.1)" border="rgba(239,68,68,0.3)">HTTP inseguro</Badge>
          )}
          {data.health.is_indexable ? (
            <Badge color={G} bg={Gs} border={Gb}>Indexable</Badge>
          ) : (
            <Badge color={RD} bg="rgba(239,68,68,0.1)" border="rgba(239,68,68,0.3)">No indexable</Badge>
          )}
          {data.canonical && <Badge color={C.text2} bg={C.card2}>Canonical ✓</Badge>}
          {data.has_sitemap && <Badge color={C.text2} bg={C.card2}>Sitemap</Badge>}
          {data.has_robots_txt && <Badge color={C.text2} bg={C.card2}>robots.txt</Badge>}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 180 }}>
        <HeroKpi
          icon={<IconBug size={14} color={RD} />}
          label="Issues"
          value={data.health.issues_count}
          color={RD}
        />
        <HeroKpi
          icon={<IconCheck size={14} color={G} />}
          label="Checks pasando"
          value={data.health.passing_count}
          color={G}
        />
        <HeroKpi
          icon={<IconClock size={14} color={C.text3} />}
          label="Status HTTP"
          value={data.status_code}
          color={data.status_code >= 200 && data.status_code < 300 ? G : data.status_code >= 400 ? RD : AM}
        />
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HttpStatusDonut
// ═══════════════════════════════════════════════════════════════════════════════

function HttpStatusDonut({ statusCode, statusClass }: { statusCode: number; statusClass: string }) {
  const isOk = statusClass === "2xx";
  const is3xx = statusClass === "3xx";
  const is4xx = statusClass === "4xx";
  const is5xx = statusClass === "5xx";

  const color = isOk ? G : is3xx ? AM : is4xx || is5xx ? RD : C.text3;
  const label = isOk ? "OK" : is3xx ? "Redirige" : is4xx ? "Error cliente" : is5xx ? "Error servidor" : "Desconocido";

  const size = 160;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const segments = [
    { key: "2xx", active: isOk },
    { key: "3xx", active: is3xx },
    { key: "4xx", active: is4xx },
    { key: "5xx", active: is5xx },
  ];
  const segLen = (circ - 4 * 4) / 4;

  return (
    <Card style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
      <SectionTitle title="Status HTTP" sub="Cómo responde tu servidor"/>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {segments.map((s, i) => {
            const offset = -(i * (segLen + 4));
            return (
              <circle
                key={s.key}
                cx={cx} cy={cy} r={r} fill="none"
                stroke={s.active ? color : "rgba(255,255,255,0.06)"}
                strokeWidth={stroke}
                strokeDasharray={`${segLen} ${circ - segLen}`}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", pointerEvents: "none",
        }}>
          <div style={{
            fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
            fontSize: 32, color, lineHeight: 1, letterSpacing: "-0.03em",
          }}>{statusCode}</div>
          <div style={{ fontSize: 10, color: C.text3, marginTop: 4, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>{label}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {segments.map(s => (
          <div key={s.key} style={{
            padding: "2px 8px", borderRadius: 4,
            background: s.active ? `${color}18` : "transparent",
            border: `1px solid ${s.active ? `${color}40` : C.border}`,
            fontSize: 10, color: s.active ? color : C.text4,
            fontFamily: "var(--font-mono), monospace", fontWeight: 700,
          }}>{s.key}</div>
        ))}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// IssuesCard + PassingChecksCard
// ═══════════════════════════════════════════════════════════════════════════════

function IssuesCard({ issues }: { issues: OnPageData["issues"] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? issues : issues.slice(0, 6);

  return (
    <Card style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <SectionTitle title="Issues críticos" sub="Lo que está afectando tu auditoría"/>
        <Badge color={RD} bg="rgba(239,68,68,0.1)" border="rgba(239,68,68,0.3)">{issues.length}</Badge>
      </div>

      {issues.length === 0 ? (
        <div style={{
          padding: 20, textAlign: "center", color: G,
          background: Gs, borderRadius: 10, border: `1px solid ${Gb}`,
        }}>
          <IconCheck size={20} color={G} />
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6 }}>
            Sin issues críticos
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {visible.map((issue, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 8,
                background: "rgba(239,68,68,0.04)",
                border: "1px solid rgba(239,68,68,0.12)",
              }}>
                <div style={{ color: RD, flexShrink: 0 }}>
                  {issueIcon(issue.check)}
                </div>
                <span style={{
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: 12.5, color: C.text2, lineHeight: 1.4,
                }}>{issue.label}</span>
              </div>
            ))}
          </div>
          {issues.length > 6 && (
            <button
              onClick={() => setExpanded(e => !e)}
              style={{
                background: "transparent", border: `1px solid ${C.border2}`,
                borderRadius: 8, padding: "8px 14px",
                fontFamily: "var(--font-inter), sans-serif", fontSize: 12,
                color: C.text2, cursor: "pointer",
              }}
            >
              {expanded ? "Mostrar menos" : `Ver todos (${issues.length})`}
            </button>
          )}
        </>
      )}
    </Card>
  );
}

function PassingChecksCard({ checks }: { checks: OnPageData["passing_checks"] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? checks : checks.slice(0, 6);

  return (
    <Card style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <SectionTitle title="Checks pasando" sub="Lo que estás haciendo bien"/>
        <Badge color={G} bg={Gs} border={Gb}>{checks.length}</Badge>
      </div>

      {checks.length === 0 ? (
        <div style={{ fontSize: 12, color: C.text3, padding: 12 }}>Sin checks pasando aún.</div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {visible.map((c, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 8,
                background: "rgba(93,184,72,0.04)",
                border: "1px solid rgba(93,184,72,0.12)",
              }}>
                <IconCheck size={14} color={G} />
                <span style={{
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: 12.5, color: C.text2, lineHeight: 1.4,
                }}>{c.label}</span>
              </div>
            ))}
          </div>
          {checks.length > 6 && (
            <button
              onClick={() => setExpanded(e => !e)}
              style={{
                background: "transparent", border: `1px solid ${C.border2}`,
                borderRadius: 8, padding: "8px 14px",
                fontFamily: "var(--font-inter), sans-serif", fontSize: 12,
                color: C.text2, cursor: "pointer",
              }}
            >
              {expanded ? "Mostrar menos" : `Ver todos (${checks.length})`}
            </button>
          )}
        </>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Gauge reutilizable (para PerformanceGauges)
// ═══════════════════════════════════════════════════════════════════════════════

function Gauge({
  value, max, label, sublabel, thresholds, unit = "ms",
}: {
  value: number | null;
  max: number;
  label: string;
  sublabel: string;
  thresholds: { good: number; needs: number };
  unit?: "ms" | "score";
}) {
  const isNull = value == null;
  const v = isNull ? 0 : value;
  const pct = Math.min(v / max, 1);
  const color = isNull ? C.text4 : v <= thresholds.good ? G : v <= thresholds.needs ? AM : RD;
  const ratingLabel = isNull ? "Sin datos" : v <= thresholds.good ? "Bueno" : v <= thresholds.needs ? "Mejorable" : "Deficiente";

  const size = 100;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const sweep = 270;
  const arcLen = (sweep / 360) * circ;
  const dashOff = (1 - pct) * arcLen;

  return (
    <div style={{
      padding: "18px 16px", borderRadius: 12,
      background: isNull ? C.card : `linear-gradient(160deg, ${color}06, ${C.card})`,
      border: `1px solid ${isNull ? C.border : `${color}25`}`,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
    }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(135deg)", display: "block" }}>
          <circle cx={cx} cy={cy} r={r} fill="none"
            stroke="rgba(255,255,255,0.05)" strokeWidth={stroke}
            strokeDasharray={`${arcLen} ${circ}`} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={r} fill="none"
            stroke={color} strokeWidth={stroke}
            strokeDasharray={`${arcLen} ${circ}`} strokeDashoffset={dashOff}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.2,0.9,0.3,1)" }} />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", pointerEvents: "none",
        }}>
          <div style={{
            fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
            fontSize: 17, color, lineHeight: 1, letterSpacing: "-0.02em",
          }}>
            {isNull ? "—" : unit === "ms" ? fmtMs(v) : v.toFixed(3)}
          </div>
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontFamily: "var(--font-syne), sans-serif", fontWeight: 700,
          fontSize: 13, color: C.text, lineHeight: 1.2,
        }}>{label}</div>
        <div style={{ fontSize: 10.5, color: C.text3, marginTop: 2 }}>{sublabel}</div>
      </div>
      <Badge color={color} bg={`${color}15`} border={`${color}30`}>{ratingLabel}</Badge>
    </div>
  );
}

function PerformanceGauges({ perf }: { perf: OnPageData["performance"] }) {
  return (
    <Card style={{ padding: 24 }}>
      <div style={{ marginBottom: 18 }}>
        <SectionTitle
          title="Métricas técnicas de carga"
          sub="Datos sintéticos del crawler (no de usuarios reales — para datos de campo ver pestaña Velocidad real)"
        />
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12,
      }}>
        <Gauge value={perf.time_to_interactive_ms} max={10000}
               label="TTI" sublabel="Time to Interactive"
               thresholds={{ good: 3800, needs: 7300 }} />
        <Gauge value={perf.dom_complete_ms} max={10000}
               label="DOM Complete" sublabel="DOM totalmente cargado"
               thresholds={{ good: 3000, needs: 6000 }} />
        <Gauge value={perf.largest_contentful_paint} max={6000}
               label="LCP" sublabel="Largest Contentful Paint"
               thresholds={{ good: 2500, needs: 4000 }} />
        <Gauge value={perf.cumulative_layout_shift} max={0.5}
               label="CLS" sublabel="Cumulative Layout Shift"
               thresholds={{ good: 0.1, needs: 0.25 }} unit="score" />
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ResourcesBar
// ═══════════════════════════════════════════════════════════════════════════════

function ResourcesBar({
  rb, pageSize,
}: {
  rb: OnPageData["resources_breakdown"];
  pageSize: number;
}) {
  const total = rb.scripts_size + rb.stylesheets_size + rb.images_size;
  const renderBlocking = rb.render_blocking_scripts_count + rb.render_blocking_stylesheets_count;

  const segments = [
    { label: "Scripts",     count: rb.scripts_count,     size: rb.scripts_size,     color: "#3b82f6" },
    { label: "Stylesheets", count: rb.stylesheets_count, size: rb.stylesheets_size, color: "#a855f7" },
    { label: "Imágenes",    count: rb.images_count,      size: rb.images_size,      color: "#ec4899" },
  ];

  return (
    <Card style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <SectionTitle title="Peso de recursos" sub="Cómo se compone el peso total de tu página"/>
        <div style={{ textAlign: "right" }}>
          <div style={{
            fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
            fontSize: 22, color: C.text, lineHeight: 1, letterSpacing: "-0.02em",
          }}>{fmtBytes(pageSize)}</div>
          <div style={{ fontSize: 10.5, color: C.text3, marginTop: 4, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>
            Tamaño total
          </div>
        </div>
      </div>

      {total > 0 && (
        <div style={{
          display: "flex", height: 32, borderRadius: 8, overflow: "hidden",
          background: "rgba(255,255,255,0.04)", marginBottom: 14,
        }}>
          {segments.map(s => {
            const pct = (s.size / total) * 100;
            if (pct < 1) return null;
            return (
              <div key={s.label} style={{
                width: `${pct}%`, background: `linear-gradient(180deg, ${s.color}, ${s.color}cc)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-inter), sans-serif", fontSize: 11, fontWeight: 700,
                color: "#fff", overflow: "hidden",
              }}>
                {pct >= 8 && `${pct.toFixed(0)}%`}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {segments.map(s => (
          <div key={s.label} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 8,
            background: C.card2, border: `1px solid ${C.border}`,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: "var(--font-inter), sans-serif", fontSize: 11,
                color: C.text3, fontWeight: 600,
              }}>{s.label}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 2 }}>
                <span style={{
                  fontFamily: "var(--font-syne), sans-serif", fontWeight: 700,
                  fontSize: 13, color: C.text,
                }}>{fmtBytes(s.size)}</span>
                <span style={{
                  fontSize: 11, color: C.text3,
                  fontFamily: "var(--font-mono), monospace",
                }}>{s.count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {renderBlocking > 0 && (
        <div style={{
          marginTop: 14, padding: "10px 14px", borderRadius: 8,
          background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <IconWarn size={16} color={AM} />
          <span style={{ fontSize: 12.5, color: C.text2, lineHeight: 1.4 }}>
            <strong style={{ color: AM, fontWeight: 700 }}>{renderBlocking}</strong> recursos bloquean el renderizado inicial
          </span>
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HeadingsHierarchy
// ═══════════════════════════════════════════════════════════════════════════════

function HeadingsHierarchy({
  headings, headingsCount,
}: {
  headings: OnPageData["headings"];
  headingsCount: OnPageData["headings_count"];
}) {
  const items: Array<{ level: number; text: string }> = [];
  headings.h1.forEach(t => items.push({ level: 1, text: t }));
  headings.h2.forEach(t => items.push({ level: 2, text: t }));
  headings.h3.forEach(t => items.push({ level: 3, text: t }));

  const h1Issue = headingsCount.h1 === 0 || headingsCount.h1 > 1;

  return (
    <Card style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <SectionTitle title="Jerarquía de encabezados" sub="Cómo estructuras el contenido para Google"/>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(["h1", "h2", "h3", "h4"] as const).map(tag => (
            <div key={tag} style={{
              padding: "3px 9px", borderRadius: 6,
              background: tag === "h1" && h1Issue ? "rgba(239,68,68,0.1)" : C.card2,
              border: `1px solid ${tag === "h1" && h1Issue ? "rgba(239,68,68,0.3)" : C.border}`,
              display: "flex", alignItems: "center", gap: 4,
            }}>
              <span style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 10, fontWeight: 700,
                color: tag === "h1" && h1Issue ? RD : C.text3,
              }}>{tag}</span>
              <span style={{
                fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
                fontSize: 13, color: tag === "h1" && h1Issue ? RD : C.text,
              }}>{headingsCount[tag]}</span>
            </div>
          ))}
        </div>
      </div>

      {h1Issue && (
        <div style={{
          padding: "8px 12px", borderRadius: 8,
          background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <IconWarn size={14} color={RD} />
          <span style={{ fontSize: 12, color: C.text2 }}>
            {headingsCount.h1 === 0
              ? "Tu página no tiene H1. Google necesita un H1 para entender el tema principal."
              : `Tu página tiene ${headingsCount.h1} H1s. Lo ideal es un solo H1 por página.`}
          </span>
        </div>
      )}

      <div style={{
        maxHeight: 320, overflowY: "auto", paddingRight: 4,
        display: "flex", flexDirection: "column", gap: 4,
      }}>
        {items.length === 0 ? (
          <div style={{ fontSize: 12.5, color: C.text3, fontStyle: "italic", padding: 8 }}>
            Sin encabezados detectados.
          </div>
        ) : items.map((item, i) => (
          <div key={i} style={{
            paddingLeft: (item.level - 1) * 20,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 10, fontWeight: 700,
              color: item.level === 1 ? G : item.level === 2 ? "#3b82f6" : "#a855f7",
              padding: "1px 6px", borderRadius: 4,
              background: item.level === 1 ? Gs : item.level === 2 ? "rgba(59,130,246,0.1)" : "rgba(168,85,247,0.1)",
              flexShrink: 0,
            }}>h{item.level}</span>
            <span style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: item.level === 1 ? 14 : 12.5,
              fontWeight: item.level === 1 ? 600 : 400,
              color: item.level === 1 ? C.text : C.text2,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{item.text || <em style={{ color: C.text4 }}>(vacío)</em>}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ContentMetrics
// ═══════════════════════════════════════════════════════════════════════════════

function ConsistencyBar({ pct, label }: { pct: number | null; label: string }) {
  const value = pct ?? 0;
  const color = value >= 75 ? G : value >= 50 ? AM : RD;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 11.5, color: C.text2 }}>{label}</span>
        <span style={{
          fontFamily: "var(--font-mono), monospace", fontSize: 11, fontWeight: 700,
          color: pct == null ? C.text4 : color,
        }}>
          {pct == null ? "—" : `${Math.round(value)}%`}
        </span>
      </div>
      <div style={{ height: 5, borderRadius: 999, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
        {pct != null && (
          <div style={{
            height: "100%", width: `${Math.min(value, 100)}%`,
            background: `linear-gradient(90deg, ${color}aa, ${color})`,
            borderRadius: 999,
            transition: "width 0.8s cubic-bezier(0.2,0.9,0.3,1)",
          }}/>
        )}
      </div>
    </div>
  );
}

function ContentMetrics({ content }: { content: OnPageData["content"] }) {
  const wc = content.plain_text_word_count ?? 0;
  const ari = content.automated_readability_index;

  const readabilityLabel = ari == null ? "—"
    : ari < 8  ? "Muy fácil"
    : ari < 13 ? "Plain English"
    : ari < 16 ? "Estándar"
    : "Difícil";

  const readabilityColor = ari == null ? C.text4
    : ari < 13 ? G
    : ari < 16 ? AM
    : RD;

  return (
    <Card style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionTitle title="Métricas de contenido" sub="Calidad y consistencia"/>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{
          padding: "14px 16px", borderRadius: 10,
          background: C.card2, border: `1px solid ${C.border}`,
        }}>
          <div style={{
            fontSize: 10.5, color: C.text3, letterSpacing: "0.06em",
            textTransform: "uppercase", fontWeight: 600,
          }}>Palabras</div>
          <div style={{
            fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
            fontSize: 24, color: C.text, lineHeight: 1.1, marginTop: 4, letterSpacing: "-0.02em",
          }}>{fmtNumber(wc)}</div>
        </div>
        <div style={{
          padding: "14px 16px", borderRadius: 10,
          background: C.card2, border: `1px solid ${C.border}`,
        }}>
          <div style={{
            fontSize: 10.5, color: C.text3, letterSpacing: "0.06em",
            textTransform: "uppercase", fontWeight: 600,
            display: "flex", alignItems: "center", gap: 4,
          }}>
            Legibilidad
            <span title="Automated Readability Index — escala de dificultad para leer un texto. Más bajo = más fácil de leer." style={{ cursor: "help", display: "inline-flex" }}>
              <IconInfo size={11} color={C.text4} />
            </span>
          </div>
          <div style={{
            fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
            fontSize: 18, color: readabilityColor, lineHeight: 1.1, marginTop: 4, letterSpacing: "-0.02em",
          }}>{readabilityLabel}</div>
          {ari != null && (
            <div style={{ fontSize: 10.5, color: C.text3, marginTop: 2 }}>
              ARI {ari.toFixed(1)}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <ConsistencyBar
          pct={content.plain_text_rate != null ? content.plain_text_rate * 100 : null}
          label="Densidad de texto plano"
        />
      </div>

      <div style={{
        padding: "8px 12px", borderRadius: 8, background: C.card2, border: `1px solid ${C.border}`,
        fontSize: 11.5, color: C.text3, lineHeight: 1.5,
      }}>
        Los textos con buena legibilidad (Plain English) suelen rankear mejor en Google y convertir mejor.
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ResourceErrorsCard
// ═══════════════════════════════════════════════════════════════════════════════

function AccordionSection({
  title, count, color, items,
}: {
  title: string;
  count: number;
  color: string;
  items: OnPageData["resource_errors"];
}) {
  const [open, setOpen] = useState(false);
  if (count === 0) return null;

  return (
    <div style={{
      background: C.card2, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden",
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", background: "transparent", border: "none", cursor: "pointer",
          color: C.text, fontFamily: "var(--font-inter), sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Badge color={color} bg={`${color}15`} border={`${color}30`}>{count}</Badge>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{title}</span>
        </div>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.text3} strokeWidth={2}
             style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>
          <polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div style={{ padding: "0 16px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
          {items.slice(0, 20).map((err, i) => (
            <div key={i} style={{
              padding: "8px 12px", borderRadius: 6,
              background: "rgba(0,0,0,0.2)",
              fontFamily: "var(--font-mono), monospace", fontSize: 11,
              color: C.text2, lineHeight: 1.5,
              display: "grid", gridTemplateColumns: "auto 1fr", gap: 12,
            }}>
              <span style={{ color: C.text4, whiteSpace: "nowrap" }}>
                {err.line}:{err.column}
              </span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                {err.message}
                {err.status_code > 0 && (
                  <span style={{ marginLeft: 8, color, fontWeight: 700 }}>
                    [{err.status_code}]
                  </span>
                )}
              </span>
            </div>
          ))}
          {items.length > 20 && (
            <div style={{ fontSize: 11, color: C.text4, textAlign: "center", padding: 6 }}>
              + {items.length - 20} más
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResourceErrorsCard({
  errors, warnings,
}: {
  errors: OnPageData["resource_errors"];
  warnings: OnPageData["resource_warnings"];
}) {
  if (errors.length === 0 && warnings.length === 0) return null;

  return (
    <Card style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
      <SectionTitle title="Errores y advertencias de recursos" sub="Línea : Col · Mensaje"/>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <AccordionSection title="Errores" count={errors.length} color={RD} items={errors} />
        <AccordionSection title="Advertencias" count={warnings.length} color={AM} items={warnings} />
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SocialPreviews — Facebook + Twitter + Google SERP mockups
// ═══════════════════════════════════════════════════════════════════════════════

function FacebookCard({
  title, description, image, url,
}: {
  title: string; description: string; image: string | null; url: string;
}) {
  const domain = url.replace(/^https?:\/\//, "").split("/")[0];
  return (
    <div style={{
      background: "#1a1a1a", border: "1px solid #2a2a2a",
      borderRadius: 8, overflow: "hidden", maxWidth: "100%",
    }}>
      {image ? (
        <div style={{
          height: 180, background: `url(${image}) center/cover`,
          backgroundColor: "#3a3a3a",
        }}/>
      ) : (
        <div style={{
          height: 180, background: "#2a2a2a",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#71767b", fontSize: 12, gap: 8,
        }}>
          <IconImg size={28} color="#5a5a5a" />
          <span>Sin og:image</span>
        </div>
      )}
      <div style={{ padding: "10px 14px" }}>
        <div style={{
          fontSize: 11, color: "#65676b", letterSpacing: "0.05em",
          textTransform: "uppercase", marginBottom: 3,
        }}>{domain}</div>
        <div style={{
          fontFamily: "Helvetica Neue, sans-serif", fontWeight: 600, fontSize: 14.5,
          color: "#e7e9ea", lineHeight: 1.3, marginBottom: 3,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>{title || <em style={{ color: "#65676b" }}>(sin título)</em>}</div>
        <div style={{
          fontFamily: "Helvetica Neue, sans-serif", fontSize: 12.5, color: "#65676b", lineHeight: 1.4,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{description || <em>(sin descripción)</em>}</div>
      </div>
    </div>
  );
}

function TwitterCard({
  title, image, url,
}: {
  title: string; image: string | null; url: string;
}) {
  const domain = url.replace(/^https?:\/\//, "").split("/")[0];
  return (
    <div style={{
      background: "#000", border: "1px solid #2f3336",
      borderRadius: 16, overflow: "hidden", maxWidth: "100%",
    }}>
      {image ? (
        <div style={{
          height: 180, background: `url(${image}) center/cover`,
          backgroundColor: "#16181c",
        }}/>
      ) : (
        <div style={{
          height: 180, background: "#16181c",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#71767b", fontSize: 12, gap: 8,
        }}>
          <IconImg size={28} color="#3a3a3a" />
          <span>Sin twitter:image</span>
        </div>
      )}
      <div style={{ padding: "10px 14px", borderTop: "1px solid #2f3336" }}>
        <div style={{
          fontFamily: "system-ui, sans-serif", fontSize: 11, color: "#71767b", marginBottom: 2,
        }}>{domain}</div>
        <div style={{
          fontFamily: "system-ui, sans-serif", fontSize: 14, color: "#e7e9ea", lineHeight: 1.3,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{title || <em style={{ color: "#71767b" }}>(sin título)</em>}</div>
      </div>
    </div>
  );
}

function GoogleSerpPreview({
  title, description, url, duplicateTitle, duplicateDesc,
}: {
  title: string; description: string; url: string;
  duplicateTitle: boolean; duplicateDesc: boolean;
}) {
  const domain = url.replace(/^https?:\/\//, "").split("/")[0];
  return (
    <div style={{
      background: "#fff", borderRadius: 8, padding: "16px 18px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <div style={{
          width: 22, height: 22, borderRadius: "50%", background: "#f5f5f5",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#5f6368", fontSize: 11, fontWeight: 700,
        }}>
          {domain.charAt(0).toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: "arial, sans-serif", fontSize: 12, color: "#202124", fontWeight: 500,
          }}>{domain}</div>
          <div style={{
            fontFamily: "arial, sans-serif", fontSize: 11, color: "#5f6368",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            maxWidth: 400,
          }}>{url.replace(/^https?:\/\//, "")}</div>
        </div>
      </div>

      <h3 style={{
        fontFamily: "arial, sans-serif", fontSize: 19, color: "#1a0dab",
        fontWeight: 400, lineHeight: 1.3, margin: "4px 0 4px",
      }}>{title || "(sin título)"}</h3>

      <p style={{
        fontFamily: "arial, sans-serif", fontSize: 13.5, color: "#4d5156",
        lineHeight: 1.5, margin: 0,
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>{description || "(sin meta description)"}</p>

      {(duplicateTitle || duplicateDesc) && (
        <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
          {duplicateTitle && (
            <span style={{
              fontSize: 10, padding: "2px 7px", borderRadius: 4,
              background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca",
              fontFamily: "arial, sans-serif", fontWeight: 600,
            }}>Title duplicado</span>
          )}
          {duplicateDesc && (
            <span style={{
              fontSize: 10, padding: "2px 7px", borderRadius: 4,
              background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca",
              fontFamily: "arial, sans-serif", fontWeight: 600,
            }}>Desc duplicada</span>
          )}
        </div>
      )}
    </div>
  );
}

function SocialPreviews({ data }: { data: OnPageData }) {
  const og = data.social_media_tags || {};
  const ogTitle = og["og:title"] || data.title;
  const ogDesc  = og["og:description"] || data.description;
  const ogImage = og["og:image"] || null;
  const twTitle = og["twitter:title"] || ogTitle;
  const twImage = og["twitter:image"] || ogImage;

  return (
    <Card style={{ padding: 24 }}>
      <div style={{ marginBottom: 18 }}>
        <SectionTitle title="Cómo se ve tu página al compartirla" sub="Open Graph preview en redes sociales y Google"/>
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16,
      }}>
        <div>
          <div style={{
            fontSize: 11, color: C.text3, letterSpacing: "0.06em",
            textTransform: "uppercase", fontWeight: 600, marginBottom: 8,
          }}>Facebook · LinkedIn</div>
          <FacebookCard title={ogTitle} description={ogDesc} image={ogImage} url={data.url} />
        </div>
        <div>
          <div style={{
            fontSize: 11, color: C.text3, letterSpacing: "0.06em",
            textTransform: "uppercase", fontWeight: 600, marginBottom: 8,
          }}>X · Twitter</div>
          <TwitterCard title={twTitle} image={twImage} url={data.url} />
        </div>
        <div>
          <div style={{
            fontSize: 11, color: C.text3, letterSpacing: "0.06em",
            textTransform: "uppercase", fontWeight: 600, marginBottom: 8,
          }}>Google · SERP preview</div>
          <GoogleSerpPreview
            title={data.title}
            description={data.description}
            url={data.url}
            duplicateTitle={data.duplicate_title}
            duplicateDesc={data.duplicate_description}
          />
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// OpsFooter
// ═══════════════════════════════════════════════════════════════════════════════

function OpsFooter({ data }: { data: OnPageData }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "12px 4px", flexWrap: "wrap", gap: 12,
    }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 11, color: C.text4 }}>
        {data.cost != null && (
          <span>Costo: <strong style={{ color: C.text3 }}>${data.cost.toFixed(4)}</strong></span>
        )}
        {data.task_time && (
          <span>Tiempo: <strong style={{ color: C.text3 }}>{data.task_time}</strong></span>
        )}
        <span>HTTP: <strong style={{ color: C.text3 }}>{data.status_code}</strong></span>
        <span>OnPage score raw: <strong style={{ color: C.text3 }}>{data.health.onpage_score}</strong></span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Componente principal exportado
// ═══════════════════════════════════════════════════════════════════════════════

export function OnPageAuditSection({ data }: { data: OnPageData }) {
  return (
    <div style={{
      padding: "24px 28px", maxWidth: 1280, margin: "0 auto",
      display: "flex", flexDirection: "column", gap: 20,
    }}>
      {/* Hero */}
      <HeroCard data={data} />

      {/* HTTP Status + Resumen rápido */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(220px, 1fr) 2fr",
        gap: 16, alignItems: "stretch",
      }}>
        <HttpStatusDonut statusCode={data.status_code} statusClass={data.health.http_status_class} />
        <Card style={{ padding: 24, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }}>
          <SectionTitle title="Resumen rápido" sub="Lo principal que aprender de esta auditoría"/>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10,
          }}>
            {[
              { label: "OnPage score",  value: data.health.onpage_score,          of: 100,  color: scoreColor(data.health.onpage_score) },
              { label: "Health score",  value: data.health.computed_health_score, of: 100,  color: scoreColor(data.health.computed_health_score) },
              { label: "Issues",         value: data.health.issues_count,           of: null, color: RD },
              { label: "Checks ✓",       value: data.health.passing_count,          of: null, color: G  },
            ].map((s, i) => (
              <div key={i} style={{
                padding: "12px 14px", borderRadius: 10,
                background: C.card2, border: `1px solid ${C.border}`,
              }}>
                <div style={{
                  fontSize: 10.5, color: C.text3, letterSpacing: "0.06em",
                  textTransform: "uppercase", fontWeight: 600,
                }}>{s.label}</div>
                <div style={{
                  fontFamily: "var(--font-syne), sans-serif", fontWeight: 800, fontSize: 22,
                  color: s.color, lineHeight: 1.1, marginTop: 4, letterSpacing: "-0.02em",
                }}>
                  {s.value}
                  {s.of != null && (
                    <span style={{ color: C.text3, fontWeight: 500, fontSize: 14 }}>/{s.of}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Issues + Passing checks */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "stretch",
      }}>
        <IssuesCard issues={data.issues} />
        <PassingChecksCard checks={data.passing_checks} />
      </div>

      {/* Performance gauges */}
      <PerformanceGauges perf={data.performance} />

      {/* Resources */}
      <ResourcesBar rb={data.resources_breakdown} pageSize={data.performance.page_size_bytes} />

      {/* Headings + Content metrics */}
      <div style={{
        display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, alignItems: "stretch",
      }}>
        <HeadingsHierarchy headings={data.headings} headingsCount={data.headings_count} />
        <ContentMetrics content={data.content} />
      </div>

      {/* Resource errors */}
      <ResourceErrorsCard errors={data.resource_errors} warnings={data.resource_warnings} />

      {/* Social previews */}
      <SocialPreviews data={data} />

      {/* Ops footer */}
      <OpsFooter data={data} />
    </div>
  );
}