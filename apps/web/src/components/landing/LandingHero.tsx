"use client";

import Image from "next/image";

interface Props {
  url: string;
  onUrlChange: (url: string) => void;
  onScan: () => void;
  trialExhausted?: boolean;
}

const G = "var(--accent)";
const G18 = "rgba(93,184,72,0.18)";
const G15 = "rgba(93,184,72,0.15)";
const G22 = "rgba(93,184,72,0.22)";
const G40 = "rgba(93,184,72,0.4)";

export function LandingHero({ url, onUrlChange, onScan }: Props) {
  return (
    <section style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center",
      position: "relative", overflow: "hidden",
      padding: "120px 24px 80px",
      background: "#0a0a0a",
    }}>
      {/* Dot grid background */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
      }} />

      {/* Green glow blobs */}
      <div style={{
        position: "absolute", top: "10%", right: "-5%",
        width: 600, height: 600,
        background: `radial-gradient(circle, ${G18} 0%, transparent 70%)`,
        pointerEvents: "none", borderRadius: "50%",
      }} />
      <div style={{
        position: "absolute", bottom: "0%", left: "-10%",
        width: 400, height: 400,
        background: "radial-gradient(circle, rgba(93,184,72,0.05) 0%, transparent 70%)",
        pointerEvents: "none", borderRadius: "50%",
      }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <div className="hero-grid">
          {/* Left: Text */}
          <div className="fade-up" style={{ maxWidth: 560 }}>
            {/* Kicker */}
            <div style={{
              fontFamily: "var(--font-caveat), cursive",
              color: G, fontSize: 20, marginBottom: 20,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2 Q12 6 10 10 Q8 14 10 18" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                <path d="M7 8 Q10 6 13 8" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              </svg>
              Para pymes de Latinoamérica
            </div>

            {/* Headline */}
            <h1 style={{
              fontFamily: "var(--font-syne), sans-serif",
              fontWeight: 800, fontSize: "clamp(40px, 5vw, 68px)",
              lineHeight: 1.05, letterSpacing: "-0.03em",
              color: "#fff", margin: "0 0 24px",
            }}>
              Tu negocio en Google.{" "}
              <span style={{ color: G }}>Visible,</span>{" "}
              conectado, creciendo.
            </h1>

            {/* Subhead */}
            <p style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 18, lineHeight: 1.65,
              color: "rgba(255,255,255,0.58)",
              margin: "0 0 36px", maxWidth: 480,
            }}>
              EDA escanea tu presencia digital, encuentra clientes potenciales que necesitan lo que ofreces, y los contacta por ti — todo en automático.
            </p>

            {/* Scan input form */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "stretch", marginBottom: 20 }}>
              <div style={{
                display: "flex", flex: 1, minWidth: 240, maxWidth: 380,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 10, overflow: "hidden",
              }}>
                <div style={{
                  padding: "0 12px",
                  color: "rgba(255,255,255,0.3)",
                  fontFamily: "monospace", fontSize: 14,
                  display: "flex", alignItems: "center",
                  borderRight: "1px solid rgba(255,255,255,0.08)",
                  flexShrink: 0,
                }}>
                  https://
                </div>
                <input
                  id="hero-input"
                  type="text"
                  value={url}
                  onChange={(e) => onUrlChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onScan()}
                  placeholder="miempresa.com"
                  style={{
                    flex: 1, background: "none", border: "none", outline: "none",
                    color: "#fff", fontFamily: "var(--font-inter), sans-serif",
                    fontSize: 14, padding: "14px 12px",
                  }}
                />
              </div>

              <button
                onClick={onScan}
                style={{
                  background: G, color: "#0a0a0a",
                  fontFamily: "var(--font-inter), sans-serif", fontWeight: 700,
                  fontSize: 15, padding: "14px 24px",
                  borderRadius: 10, border: "none", cursor: "pointer",
                  display: "inline-flex", alignItems: "center", gap: 8,
                  transition: "transform 0.15s, box-shadow 0.15s",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = `0 8px 32px ${G40}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Auditar gratis
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <p style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 13, color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.01em",
            }}>
              Sin tarjeta de crédito · Resultados en 90 segundos
            </p>
          </div>

          {/* Right: Dashboard mockup */}
          <div className="hero-mockup" style={{
            display: "flex", justifyContent: "center", alignItems: "center",
            position: "relative",
          }}>
            {/* Glow behind mockup */}
            <div style={{
              position: "absolute", width: "80%", height: "60%",
              background: `radial-gradient(ellipse, ${G22} 0%, transparent 70%)`,
              borderRadius: "50%", filter: "blur(24px)", zIndex: 0,
            }} />

            {/* Browser window mockup */}
            <div style={{
              position: "relative", zIndex: 1,
              background: "#111",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), 0 0 60px ${G15}`,
              width: "100%", maxWidth: 500,
              transform: "perspective(1000px) rotateY(-4deg) rotateX(2deg)",
              overflow: "hidden",
            }}>
              {/* Browser chrome */}
              <div style={{
                background: "#1a1a1a", padding: "12px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {["#ff5f57", "#ffbd2e", "#28c840"].map((c, i) => (
                    <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                  ))}
                </div>
                <div style={{
                  flex: 1, background: "rgba(255,255,255,0.06)",
                  borderRadius: 6, padding: "5px 12px",
                  fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.4)",
                }}>
                  app.useeda.com/dashboard
                </div>
              </div>

              {/* Dashboard preview */}
              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>
                    Pizzería Don Mario
                  </div>
                  <div style={{
                    background: `${G15}`, color: G, fontSize: 11,
                    fontFamily: "var(--font-inter), sans-serif", fontWeight: 600,
                    padding: "3px 8px", borderRadius: 20,
                    border: `1px solid ${G40}`,
                  }}>Activo</div>
                </div>

                {/* Score card */}
                <div style={{
                  background: "rgba(255,255,255,0.04)", borderRadius: 12,
                  padding: 16, border: "1px solid rgba(255,255,255,0.07)",
                }}>
                  <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    Salud Digital
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                    <span style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 800, fontSize: 42, color: "#fff", lineHeight: 1 }}>65</span>
                    <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 16, color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>/100</span>
                  </div>
                  <div style={{ marginTop: 10, background: "rgba(255,255,255,0.08)", borderRadius: 4, height: 5, overflow: "hidden" }}>
                    <div style={{ width: "65%", height: "100%", background: G, borderRadius: 4 }} />
                  </div>
                </div>

                {/* Stat cards */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { label: "Prospectos", value: "12", sub: "encontrados hoy" },
                    { label: "Mensajes", value: "3", sub: "enviados" },
                  ].map((s, i) => (
                    <div key={i} style={{
                      background: "rgba(255,255,255,0.03)", borderRadius: 10,
                      padding: "12px 14px", border: "1px solid rgba(255,255,255,0.06)",
                    }}>
                      <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 22, color: "#fff" }}>{s.value}</div>
                      <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                        {s.label} · {s.sub}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recommendation hint */}
                <div style={{
                  background: "rgba(93,184,72,0.08)", borderRadius: 10,
                  padding: "12px 14px", border: `1px solid ${G40}`,
                  display: "flex", gap: 10, alignItems: "flex-start",
                }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 11, fontWeight: 600, color: G, marginBottom: 2 }}>
                      Acción recomendada
                    </div>
                    <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                      Actualiza tu perfil de Google Business con horarios
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
