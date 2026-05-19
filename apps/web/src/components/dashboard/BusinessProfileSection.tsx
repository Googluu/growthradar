"use client";

import { useState } from "react";
import type { BusinessProfileData } from "@/types/dashboard";

const G  = "#22c55e";
const AM = "#f59e0b";
const LM = "#a3e635";
const OR = "#fb923c";
const RD = "#ef4444";
const YL = "#fbbf24";
const BL = "#60a5fa";

const C = {
  card:        "rgba(255,255,255,0.025)",
  cardHov:     "rgba(255,255,255,0.045)",
  border:      "rgba(255,255,255,0.07)",
  borderStr:   "rgba(255,255,255,0.14)",
  text:        "#fff",
  text2:       "rgba(255,255,255,0.65)",
  text3:       "rgba(255,255,255,0.45)",
  text4:       "rgba(255,255,255,0.28)",
  greenSoft:   "rgba(34,197,94,0.15)",
  greenBorder: "rgba(34,197,94,0.35)",
  bg:          "#0a0a0a",
};

const scoreColor = (s: number) => s >= 80 ? G : s >= 50 ? AM : RD;
const scoreLabel = (s: number) => s >= 80 ? "Excelente" : s >= 50 ? "Mejorable" : "Crítico";

const STAR_COLORS: Record<string, string> = { "5": G, "4": LM, "3": AM, "2": OR, "1": RD };

const PRICE_MAP: Record<string, { symbol: string; label: string; dollars: number }> = {
  free:           { symbol: "",     label: "Gratis",      dollars: 0 },
  inexpensive:    { symbol: "$",    label: "Económico",   dollars: 1 },
  moderate:       { symbol: "$$",   label: "Moderado",    dollars: 2 },
  expensive:      { symbol: "$$$",  label: "Caro",        dollars: 3 },
  very_expensive: { symbol: "$$$$", label: "Muy caro",    dollars: 4 },
};

// ── Icon ──────────────────────────────────────────────────────────────────────
function Icon({ size = 16, sw = 1.6, fill = "none", children, style }: {
  size?: number; sw?: number; fill?: string; children: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
      stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}>
      {children}
    </svg>
  );
}

const IconCheck    = (p: any) => <Icon {...p}><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 9.5"/></Icon>;
const IconXCircle  = (p: any) => <Icon {...p}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></Icon>;
const IconAlert    = (p: any) => <Icon {...p}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></Icon>;
const IconStar     = (p: any) => <Icon {...p} fill="currentColor" sw={0}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></Icon>;
const IconStarHalf = (p: any) => <Icon {...p} fill="none"><path d="M12 2v15.77L5.82 21.02 7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77"/></Icon>;
const IconStarOut  = (p: any) => <Icon {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></Icon>;
const IconExternal = (p: any) => <Icon {...p}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></Icon>;
const IconPhone    = (p: any) => <Icon {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></Icon>;
const IconGlobe    = (p: any) => <Icon {...p}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></Icon>;
const IconPin      = (p: any) => <Icon {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Icon>;
const IconShield   = (p: any) => <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Icon>;
const IconCamera   = (p: any) => <Icon {...p}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></Icon>;
const IconInfo     = (p: any) => <Icon {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></Icon>;
const IconClock    = (p: any) => <Icon {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Icon>;

// ── Stars ─────────────────────────────────────────────────────────────────────
function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[0, 1, 2, 3, 4].map(i => {
        const diff = value - i;
        const color = diff >= 0.5 ? YL : C.text4;
        const Comp = diff >= 1 ? IconStar : diff >= 0.5 ? IconStarHalf : IconStarOut;
        return <span key={i} style={{ color, display: "inline-flex" }}><Comp size={size}/></span>;
      })}
    </span>
  );
}

// ── Inline badge ──────────────────────────────────────────────────────────────
function Chip({ children, color, bg, style }: { children: React.ReactNode; color: string; bg?: string; style?: React.CSSProperties }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: bg || `${color}15`, color,
      border: `1px solid ${color}40`,
      fontSize: 11, fontWeight: 600,
      padding: "3px 9px", borderRadius: 999,
      letterSpacing: "0.01em", whiteSpace: "nowrap" as const,
      ...style,
    }}>{children}</span>
  );
}

// ── Placeholder image when no main photo ──────────────────────────────────────
function PlaceholderImage({ name, height = 240 }: { name: string | null; height?: number }) {
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <div style={{
      width: "100%", height,
      background: `
        radial-gradient(circle at 30% 30%, rgba(34,197,94,0.35), transparent 55%),
        radial-gradient(circle at 70% 70%, rgba(251,191,36,0.25), transparent 55%),
        linear-gradient(135deg, #1a1a1a, #0d0d0d)
      `,
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative" as const, overflow: "hidden",
    }}>
      <div style={{ position: "absolute" as const, inset: 0, background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)" }}/>
      <div style={{
        position: "relative" as const,
        fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
        fontSize: 80, color: "rgba(255,255,255,0.18)", letterSpacing: "-0.04em",
      }}>{initial}</div>
      <div style={{
        position: "absolute" as const, bottom: 10, right: 12,
        fontSize: 10.5, color: C.text3, letterSpacing: "0.06em", textTransform: "uppercase" as const,
        background: "rgba(0,0,0,0.5)", padding: "3px 8px", borderRadius: 6,
      }}>Sin foto principal</div>
    </div>
  );
}

// ── Hero Card ─────────────────────────────────────────────────────────────────
function HeroCard({ data }: { data: BusinessProfileData }) {
  const { name, description, category, status, reviews, media, check_url, contact } = data;
  const price = status.price_level ? PRICE_MAP[status.price_level] : null;

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr" }}>
        {/* Left: image */}
        <div style={{ position: "relative" as const }}>
          {media.main_image_url ? (
            <img src={media.main_image_url} alt="" style={{ width: "100%", height: "100%", minHeight: 240, objectFit: "cover" }}/>
          ) : (
            <PlaceholderImage name={name} height={260}/>
          )}

          {/* Logo overlay */}
          <div style={{
            position: "absolute" as const, bottom: 16, left: 16,
            width: 58, height: 58, borderRadius: 12,
            background: media.logo_url ? "#fff" : "rgba(20,20,20,0.85)",
            border: `2px solid ${media.logo_url ? "#fff" : "rgba(255,255,255,0.18)"}`,
            boxShadow: "0 6px 18px rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
          }}>
            {media.logo_url ? (
              <img src={media.logo_url} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
            ) : (
              <span style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 800, fontSize: 24, color: G }}>
                {(name || "?").trim().charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Photo count chip */}
          {media.total_photos > 0 && (
            <div style={{
              position: "absolute" as const, top: 12, left: 12,
              background: "rgba(0,0,0,0.65)", border: "1px solid rgba(255,255,255,0.12)",
              padding: "4px 10px", borderRadius: 999,
              display: "inline-flex", alignItems: "center", gap: 6,
              color: "#fff", fontSize: 11.5, fontWeight: 500,
            }}>
              <IconCamera size={11}/> <span style={{ fontFamily: "monospace" }}>{media.total_photos}</span> fotos
            </div>
          )}

          {/* Claimed */}
          {status.is_claimed && (
            <div style={{
              position: "absolute" as const, top: 12, right: 12,
              background: C.greenSoft, border: `1px solid ${C.greenBorder}`,
              padding: "4px 10px", borderRadius: 999,
              display: "inline-flex", alignItems: "center", gap: 6,
              color: G, fontSize: 11.5, fontWeight: 600,
            }}>
              <IconShield size={11}/> Verificado
            </div>
          )}
        </div>

        {/* Right: info */}
        <div style={{ padding: "28px 32px 24px", display: "flex", flexDirection: "column" as const, gap: 16, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14 }}>
            <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 17 }}>
              Perfil de Google Business
            </div>
            {check_url && (
              <a href={check_url} target="_blank" rel="noreferrer" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: G, color: "#0a0a0a",
                padding: "7px 13px", borderRadius: 9,
                fontWeight: 700, fontSize: 12.5, whiteSpace: "nowrap" as const,
                textDecoration: "none",
              }}>
                Ver en Maps <IconExternal size={11}/>
              </a>
            )}
          </div>

          <div>
            <h2 style={{
              fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
              fontSize: 28, lineHeight: 1.08, color: C.text, letterSpacing: "-0.025em", marginBottom: 8,
            }}>{name || "Negocio sin nombre"}</h2>

            {description && (
              <p style={{
                fontSize: 14, color: C.text2, lineHeight: 1.55, marginBottom: 12,
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any,
                overflow: "hidden",
              }}>{description}</p>
            )}

            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" as const }}>
              {category.primary && (
                <Chip color={G} bg={C.greenSoft} style={{ fontSize: 12, padding: "4px 11px" }}>
                  {category.primary}
                </Chip>
              )}
              {price && (
                <span style={{ fontFamily: "monospace", fontSize: 13, color: C.text3 }}>
                  <span style={{ color: G }}>{price.symbol || "—"}</span> {price.label}
                </span>
              )}
              {category.additional.slice(0, 2).map(c => (
                <Chip key={c} color={C.text3} bg="rgba(255,255,255,0.04)" style={{ fontSize: 11 }}>{c}</Chip>
              ))}
            </div>
          </div>

          {/* Rating row */}
          {reviews.rating.value != null && (
            <div style={{
              display: "flex", alignItems: "center", gap: 16,
              paddingTop: 16, borderTop: `1px solid ${C.border}`, flexWrap: "wrap" as const,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
                  fontSize: 28, color: YL, lineHeight: 1,
                }}>{reviews.rating.value.toFixed(1)}</span>
                <div>
                  <Stars value={reviews.rating.value} size={14}/>
                  <div style={{ fontSize: 11.5, color: C.text3, marginTop: 2 }}>
                    <strong style={{ color: C.text2, fontFamily: "monospace", fontWeight: 600 }}>
                      {reviews.rating.votes_count.toLocaleString("es-CO")}
                    </strong> reseñas
                  </div>
                </div>
              </div>

              <div style={{ width: 1, height: 30, background: C.border }}/>

              {data.ids.place_id && (
                <div style={{ fontSize: 11, color: C.text3, fontFamily: "monospace" }}>
                  <span>place_id: </span>
                  <span style={{ color: C.text2 }}>{data.ids.place_id.slice(0, 14)}…</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Alerts ────────────────────────────────────────────────────────────────────
function AlertBar({ tone, icon: I, title, body }: {
  tone: "red" | "amber"; icon?: any; title: string; body: string;
}) {
  const pal = {
    red:   { fg: RD, bg: "rgba(239,68,68,0.08)",  br: "rgba(239,68,68,0.3)"  },
    amber: { fg: AM, bg: "rgba(245,158,11,0.08)", br: "rgba(245,158,11,0.3)" },
  }[tone];

  return (
    <div style={{
      display: "flex", gap: 14, padding: "14px 18px",
      background: pal.bg, border: `1px solid ${pal.br}`, borderRadius: 12, alignItems: "flex-start",
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
        background: `${pal.fg}20`, color: pal.fg, border: `1px solid ${pal.fg}50`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>{I ? <I size={15}/> : <IconAlert size={15}/>}</div>
      <div>
        <div style={{ fontSize: 13.5, color: C.text, fontWeight: 600, marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: C.text2, lineHeight: 1.5 }}>{body}</div>
      </div>
    </div>
  );
}

function AlertsRow({ data }: { data: BusinessProfileData }) {
  const items: Array<{ tone: "red" | "amber"; icon?: any; title: string; body: string }> = [];

  if (data.status.operating_status === "closed_permanently")
    items.push({ tone: "red", icon: IconXCircle, title: "Cerrado permanentemente",
      body: "Este negocio está marcado como cerrado permanentemente en Google. Si sigues operando, contáctalo para reabrirlo." });

  if (data.status.operating_status === "closed_temporarily")
    items.push({ tone: "amber", icon: IconClock, title: "Cerrado temporalmente",
      body: "Cerrado temporalmente — actualiza el horario en Google Business cuando reabras." });

  if (!data.status.is_claimed)
    items.push({ tone: "red", icon: IconShield, title: "Listing sin reclamar",
      body: "Este listing no ha sido reclamado. Reclámalo en business.google.com para tomar control de tu información y responder reseñas." });

  if (items.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
      {items.map((a, i) => <AlertBar key={i} {...a}/>)}
    </div>
  );
}

// ── Profile completeness radial gauge ─────────────────────────────────────────
function CompletenessGauge({ score }: { score: number }) {
  const color = scoreColor(score);
  const size = 160, stroke = 14;
  const r = (size - stroke) / 2;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const arcLen = (270 / 360) * circ;
  const off = (1 - score / 100) * arcLen;

  return (
    <div style={{ position: "relative" as const, width: size, height: size, margin: "0 auto" }}>
      <div style={{
        position: "absolute" as const, inset: -10,
        background: `radial-gradient(circle, ${color}22, transparent 65%)`,
        pointerEvents: "none" as const, borderRadius: "50%",
      }}/>
      <svg width={size} height={size} style={{ transform: "rotate(135deg)", display: "block", position: "relative" as const }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}
          strokeDasharray={`${arcLen} ${circ}`} strokeLinecap="round"/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${arcLen} ${circ}`} strokeDashoffset={off} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}66)`, transition: "stroke-dashoffset 0.8s cubic-bezier(0.2,0.9,0.3,1)" }}/>
      </svg>
      <div style={{
        position: "absolute" as const, inset: 0,
        display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center",
        pointerEvents: "none" as const,
      }}>
        <div style={{
          fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
          fontSize: 44, color, lineHeight: 1, letterSpacing: "-0.03em",
        }}>{score}</div>
        <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>/ 100</div>
        <div style={{
          fontSize: 10, color, fontWeight: 700, marginTop: 6,
          letterSpacing: "0.07em", textTransform: "uppercase" as const,
          padding: "2px 8px", background: `${color}18`, border: `1px solid ${color}40`, borderRadius: 999,
        }}>{scoreLabel(score)}</div>
      </div>
    </div>
  );
}

function CompletenessCard({ data }: { data: BusinessProfileData }) {
  const c = data.profile_completeness;
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={{ padding: 24, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, height: "100%" }}>
      <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 17, marginBottom: 4 }}>Salud del perfil</div>
      <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 18, color: C.text, marginBottom: 4 }}>
        Completitud del perfil
      </div>
      <div style={{ fontSize: 12, color: C.text3, marginBottom: 20 }}>
        {c.present.length} de {c.present.length + c.missing.length} campos completos
      </div>

      <CompletenessGauge score={c.score}/>

      {c.missing.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 10.5, color: C.text3, letterSpacing: "0.06em", textTransform: "uppercase" as const, fontWeight: 600, marginBottom: 8 }}>
            Faltantes · {c.missing.length}
          </div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 6, marginBottom: 18 }}>
            {c.missing.map(item => (
              <div key={item.field} onMouseEnter={() => setHovered(item.field)} onMouseLeave={() => setHovered(null)}
                style={{
                  position: "relative" as const,
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 12px", borderRadius: 9,
                  background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.18)",
                  cursor: "help",
                }}>
                <IconXCircle size={14} style={{ color: RD, flexShrink: 0 }}/>
                <span style={{ flex: 1, fontSize: 13, color: C.text, fontWeight: 500 }}>{item.label}</span>
                <Chip color={RD}>+{item.weight} pts</Chip>
                {hovered === item.field && (
                  <div style={{
                    position: "absolute" as const, left: 0, right: 0, top: "calc(100% + 6px)",
                    background: "rgba(16,16,16,0.97)", border: `1px solid ${C.borderStr}`,
                    borderRadius: 9, padding: "10px 12px", zIndex: 10,
                    fontSize: 12, color: C.text2, lineHeight: 1.5,
                    display: "flex", gap: 8, pointerEvents: "none" as const,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                  }}>
                    <span style={{ color: G, flexShrink: 0 }}><IconInfo size={12}/></span>
                    Completa este campo en business.google.com
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ fontSize: 10.5, color: C.text3, letterSpacing: "0.06em", textTransform: "uppercase" as const, fontWeight: 600, marginBottom: 8 }}>
        Completados · {c.present.length}
      </div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 4 }}>
        {c.present.map(item => (
          <div key={item.field} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "7px 12px", borderRadius: 8,
            background: "rgba(34,197,94,0.03)", border: "1px solid rgba(34,197,94,0.1)",
          }}>
            <IconCheck size={13} style={{ color: G, flexShrink: 0 }}/>
            <span style={{ flex: 1, fontSize: 12.5, color: C.text2 }}>{item.label}</span>
            <span style={{ fontFamily: "monospace", fontSize: 10.5, color: C.text4 }}>+{item.weight}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Rating distribution ───────────────────────────────────────────────────────
function RatingDistribution({ reviews }: { reviews: BusinessProfileData["reviews"] }) {
  const dist = reviews.rating_distribution;
  const pct  = reviews.rating_distribution_pct;
  const total = reviews.rating.votes_count;
  const positive = (dist["5"] || 0) + (dist["4"] || 0);
  const negative = (dist["1"] || 0) + (dist["2"] || 0);

  return (
    <div style={{ padding: 24, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap" as const, gap: 10 }}>
        <div>
          <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 18, color: C.text }}>
            Distribución de calificaciones
          </div>
          <div style={{ fontSize: 12, color: C.text3, marginTop: 3 }}>
            Promedio {reviews.rating.value?.toFixed(1) ?? "—"} · {total.toLocaleString("es-CO")} reseñas
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Chip color={G}>{Math.round((positive / total) * 100)}% positivas</Chip>
          <Chip color={RD}>{Math.round((negative / total) * 100)}% negativas</Chip>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
        {["5", "4", "3", "2", "1"].map(star => {
          const p = pct[star] || 0;
          const count = dist[star] || 0;
          const col = STAR_COLORS[star];
          return (
            <div key={star} style={{ display: "grid", gridTemplateColumns: "80px 1fr 70px", alignItems: "center", gap: 12 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 14, color: C.text, width: 14, textAlign: "right" as const }}>
                  {star}
                </span>
                <span style={{ color: col }}><IconStar size={12}/></span>
              </div>
              <div style={{ position: "relative" as const, background: "rgba(255,255,255,0.04)", borderRadius: 8, height: 22, overflow: "hidden" }}>
                <div style={{
                  width: `${p}%`, height: "100%",
                  background: `linear-gradient(90deg, ${col}, ${col}cc)`, borderRadius: 7,
                  boxShadow: `0 0 12px ${col}40`,
                  transition: "width 0.6s cubic-bezier(0.2,0.9,0.3,1)",
                }}/>
                {p > 10 && (
                  <span style={{
                    position: "absolute" as const, left: 10, top: "50%", transform: "translateY(-50%)",
                    fontSize: 10.5, fontFamily: "monospace", fontWeight: 700, color: "#0a0a0a",
                  }}>{p.toFixed(1)}%</span>
                )}
              </div>
              <div style={{ textAlign: "right" as const }}>
                <span style={{ fontFamily: "monospace", fontSize: 13, color: C.text, fontWeight: 600 }}>
                  {count.toLocaleString("es-CO")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Place topics tag cloud ────────────────────────────────────────────────────
function PlaceTopics({ topics }: { topics: Array<{ topic: string; mentions: number }> }) {
  if (!topics?.length) return null;
  const maxM = Math.max(...topics.map(t => t.mentions));
  const minM = Math.min(...topics.map(t => t.mentions));
  const range = Math.max(1, maxM - minM);
  const fontFor = (m: number) => 12 + ((m - minM) / range) * 12;
  const opFor   = (m: number) => 0.55 + ((m - minM) / range) * 0.45;

  return (
    <div style={{ padding: 24, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 17, marginBottom: 4 }}>Voz del cliente</div>
          <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 18, color: C.text }}>
            Lo que dicen tus clientes
          </div>
          <div style={{ fontSize: 12, color: C.text3, marginTop: 3 }}>Temas más mencionados en reseñas</div>
        </div>
        <Chip color={G}>{topics.reduce((s, t) => s + t.mentions, 0)} menciones</Chip>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, alignItems: "center", justifyContent: "center", padding: "12px 0" }}>
        {topics.map(t => {
          const sz = fontFor(t.mentions);
          const op = opFor(t.mentions);
          return (
            <span key={t.topic} style={{
              display: "inline-flex", alignItems: "baseline", gap: 5,
              padding: `${4 + sz * 0.12}px ${9 + sz * 0.28}px`,
              background: `rgba(34,197,94,${0.08 + op * 0.1})`,
              border: `1px solid rgba(34,197,94,${0.2 + op * 0.3})`,
              borderRadius: 999, fontSize: sz, fontWeight: 600,
              color: `rgba(255,255,255,${op})`,
            }}>
              {t.topic}
              <span style={{ fontFamily: "monospace", fontSize: Math.max(10, sz * 0.6), color: G, fontWeight: 700 }}>
                {t.mentions}
              </span>
            </span>
          );
        })}
      </div>

      <div style={{
        marginTop: 12, padding: "10px 14px", borderRadius: 9,
        background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)",
        display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.text2,
      }}>
        <IconInfo size={13} style={{ color: G, flexShrink: 0 }}/>
        El tamaño indica frecuencia de mención en reseñas de Google.
      </div>
    </div>
  );
}

// ── Contact card ──────────────────────────────────────────────────────────────
function ContactCard({ data }: { data: BusinessProfileData }) {
  const { contact, location } = data;

  const rows: Array<{ icon: any; label: string; value: string | null; href: string | null; missing?: boolean }> = [
    { icon: IconPhone, label: "Teléfono", value: contact.phone, href: contact.phone ? `tel:${contact.phone}` : null, missing: !contact.phone },
    { icon: IconGlobe, label: "Sitio web", value: contact.domain || contact.website_url, href: contact.website_url, missing: !contact.website_url },
    { icon: IconPin, label: "Dirección",
      value: [location.address, location.city].filter(Boolean).join(" · "),
      href: location.latitude && location.longitude
        ? `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`
        : null },
  ];

  return (
    <div style={{ padding: 24, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16 }}>
      <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 18, color: C.text, marginBottom: 4 }}>Contacto</div>
      <div style={{ fontSize: 12, color: C.text3, marginBottom: 20 }}>Cómo te encuentran los clientes</div>

      <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
        {rows.map(row => {
          const inner = (
            <>
              <div style={{
                width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                background: row.missing ? "rgba(255,255,255,0.04)" : C.greenSoft,
                color: row.missing ? C.text3 : G,
                border: `1px solid ${row.missing ? C.border : C.greenBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}><row.icon size={15}/></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10.5, color: C.text3, letterSpacing: "0.06em", textTransform: "uppercase" as const, fontWeight: 600, marginBottom: 2 }}>
                  {row.label}
                </div>
                <div style={{
                  fontSize: 13.5, color: row.missing ? C.text3 : C.text, fontWeight: 500,
                  fontStyle: row.missing ? "italic" : "normal",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const,
                }}>{row.value || "No vinculado"}</div>
              </div>
              {!row.missing && row.href && <IconExternal size={13} style={{ color: C.text3, flexShrink: 0 }}/>}
            </>
          );

          const containerStyle: React.CSSProperties = {
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 14px", borderRadius: 10,
            background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`,
            textDecoration: "none",
          };

          return !row.missing && row.href ? (
            <a key={row.label} href={row.href} target="_blank" rel="noreferrer" style={containerStyle}>{inner}</a>
          ) : (
            <div key={row.label} style={containerStyle}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}

// ── Attributes grid ───────────────────────────────────────────────────────────
function AttributesCard({ attributes }: { attributes: BusinessProfileData["attributes"] }) {
  const avail = attributes.available as Record<string, string[]> | null;
  if (!avail || Object.keys(avail).length === 0) return null;

  const GROUP_COLORS: Record<string, string> = {
    "Opciones de servicio": G,
    "Ofrece":               BL,
    "Comodidades":          "#a78bfa",
    "Público":              "#f472b6",
    "Pago":                 AM,
    "Ambiente":             OR,
  };

  const entries = Object.entries(avail);

  return (
    <div style={{ padding: 24, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16 }}>
      <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 18, color: C.text, marginBottom: 4 }}>Atributos del negocio</div>
      <div style={{ fontSize: 12, color: C.text3, marginBottom: 20 }}>Características destacadas en el perfil de Google</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
        {entries.map(([group, items]) => {
          const col = GROUP_COLORS[group] || G;
          return (
            <div key={group} style={{
              padding: "14px 16px", borderRadius: 12,
              background: `${col}08`, border: `1px solid ${col}25`,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: col, letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 10 }}>
                {group}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
                {(items as string[]).map(item => (
                  <span key={item} style={{
                    fontSize: 12, color: C.text2, fontWeight: 500,
                    padding: "3px 9px", borderRadius: 999,
                    background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`,
                  }}>{item}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Not found state ───────────────────────────────────────────────────────────
function NotFoundState({ keyword }: { keyword?: string }) {
  return (
    <div style={{
      padding: "60px 24px", textAlign: "center" as const,
      background: C.card, border: `1px dashed ${C.border}`, borderRadius: 16,
    }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
      <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 20, color: C.text, marginBottom: 8 }}>
        Perfil no encontrado
      </div>
      <div style={{ fontSize: 14, color: C.text3, maxWidth: 360, margin: "0 auto" }}>
        No se encontró un perfil de Google Business para{keyword ? ` "${keyword}"` : " esta búsqueda"}.
        Asegúrate de usar el nombre exacto del negocio.
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function BusinessProfileSection({ data }: { data: BusinessProfileData }) {
  if (!data.found) return <NotFoundState keyword={data.keyword}/>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <HeroCard data={data}/>
      <AlertsRow data={data}/>

      {/* Contact + Completeness side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <ContactCard data={data}/>
        <CompletenessCard data={data}/>
      </div>

      {/* Rating distribution */}
      <RatingDistribution reviews={data.reviews}/>

      {/* Topics + Attributes */}
      {data.reviews.place_topics?.length > 0 && <PlaceTopics topics={data.reviews.place_topics}/>}
      <AttributesCard attributes={data.attributes}/>
    </div>
  );
}
