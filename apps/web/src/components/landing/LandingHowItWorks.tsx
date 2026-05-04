"use client";

import { useState } from "react";

const G = "var(--accent)";

const scanLabels = ["Analizando SEO...", "Buscando prospectos...", "Generando mensajes...", "¡Listo!"];

export function LandingHowItWorks() {
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [demoUrl, setDemoUrl] = useState("");

  const handleDemoScan = () => {
    if (!demoUrl || scanning) return;
    setScanning(true);
    setScanStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setScanStep(step);
      if (step >= scanLabels.length - 1) {
        clearInterval(interval);
        setTimeout(() => { setScanning(false); setScanStep(0); }, 2000);
      }
    }, 900);
  };

  return (
    <section style={{ padding: "100px 24px", position: "relative", overflow: "hidden", background: "#0a0a0a" }}>
      {/* Subtle bg line */}
      <div style={{
        position: "absolute", left: 0, right: 0, top: "50%", height: 1,
        background: "linear-gradient(to right, transparent, rgba(255,255,255,0.04), transparent)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 18, marginBottom: 12 }}>
            Cómo funciona
          </div>
          <h2 style={{
            fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
            fontSize: "clamp(32px, 4vw, 52px)", color: "#fff",
            letterSpacing: "-0.03em", margin: "0 0 16px",
          }}>
            Tres pasos. 90 segundos.
          </h2>
          <p style={{ fontFamily: "var(--font-inter), sans-serif", color: "rgba(255,255,255,0.45)", fontSize: 16, margin: 0 }}>
            Sin setup técnico. Sin equipo de marketing.
          </p>
        </div>

        <div className="steps-grid" style={{ position: "relative" }}>
          {/* Step 1 */}
          <div style={{
            background: "rgba(255,255,255,0.025)", borderRadius: 20,
            padding: "36px 32px", border: "1px solid rgba(255,255,255,0.08)",
            position: "relative", zIndex: 1,
          }}>
            <div style={{
              fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
              fontSize: 11, color: G, letterSpacing: "0.12em",
              textTransform: "uppercase", marginBottom: 20,
            }}>Paso 01</div>
            <h3 style={{
              fontFamily: "var(--font-syne), sans-serif", fontWeight: 700,
              fontSize: 20, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.02em",
            }}>
              Conecta tu negocio
            </h3>
            <p style={{
              fontFamily: "var(--font-inter), sans-serif", fontSize: 13,
              color: "rgba(255,255,255,0.45)", margin: "0 0 20px", lineHeight: 1.6,
            }}>
              Solo necesitas la URL de tu sitio web o tu nombre en Google.
            </p>

            {/* Demo URL input */}
            <div style={{
              background: "#0a0a0a", borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex", overflow: "hidden",
            }}>
              <div style={{
                padding: "10px 12px", borderRight: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.3)", fontFamily: "monospace", fontSize: 12,
                display: "flex", alignItems: "center",
              }}>
                https://
              </div>
              <input
                type="text"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="miempresa.com.co"
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  color: "#fff", fontFamily: "monospace", fontSize: 12,
                  padding: "10px 12px",
                }}
              />
              <button
                onClick={handleDemoScan}
                style={{
                  background: G, border: "none", cursor: "pointer",
                  padding: "8px 14px", color: "#0a0a0a",
                  fontFamily: "var(--font-inter), sans-serif",
                  fontWeight: 700, fontSize: 12, transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                {scanning ? "..." : "Auditar →"}
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{
            background: "rgba(255,255,255,0.025)", borderRadius: 20,
            padding: "36px 32px", border: "1px solid rgba(255,255,255,0.08)",
            position: "relative", zIndex: 1,
          }}>
            <div style={{
              fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
              fontSize: 11, color: G, letterSpacing: "0.12em",
              textTransform: "uppercase", marginBottom: 20,
            }}>Paso 02</div>
            <h3 style={{
              fontFamily: "var(--font-syne), sans-serif", fontWeight: 700,
              fontSize: 20, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.02em",
            }}>
              EDA hace su magia
            </h3>
            <p style={{
              fontFamily: "var(--font-inter), sans-serif", fontSize: 13,
              color: "rgba(255,255,255,0.45)", margin: "0 0 20px", lineHeight: 1.6,
            }}>
              Nuestro motor escanea, analiza y prepara en segundos.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {scanLabels.slice(0, 3).map((label, i) => {
                const isActive = scanning && scanStep === i;
                return (
                  <div key={i} style={{
                    background: isActive ? "rgba(93,184,72,0.15)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${isActive ? "rgba(93,184,72,0.4)" : "rgba(255,255,255,0.06)"}`,
                    borderRadius: 8, padding: "8px 12px",
                    display: "flex", alignItems: "center", gap: 8,
                    transition: "all 0.4s",
                  }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: isActive ? G : "rgba(255,255,255,0.15)",
                      transition: "background 0.3s",
                      boxShadow: isActive ? "0 0 8px var(--accent)" : "none",
                      flexShrink: 0,
                    }} />
                    <span style={{
                      fontFamily: "var(--font-inter), sans-serif", fontSize: 12,
                      color: isActive ? G : "rgba(255,255,255,0.4)",
                      transition: "color 0.3s",
                    }}>
                      {label}
                    </span>
                    {isActive && (
                      <div style={{ marginLeft: "auto", display: "flex", gap: 3 }}>
                        {[0, 1, 2].map((d) => (
                          <div key={d} style={{
                            width: 4, height: 4, borderRadius: "50%",
                            background: G, opacity: 0.6,
                            animation: `pulse-dot 1s ${d * 0.2}s infinite`,
                          }} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3 */}
          <div style={{
            background: "rgba(255,255,255,0.025)", borderRadius: 20,
            padding: "36px 32px", border: "1px solid rgba(255,255,255,0.08)",
            position: "relative", zIndex: 1,
          }}>
            <div style={{
              fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
              fontSize: 11, color: G, letterSpacing: "0.12em",
              textTransform: "uppercase", marginBottom: 20,
            }}>Paso 03</div>
            <h3 style={{
              fontFamily: "var(--font-syne), sans-serif", fontWeight: 700,
              fontSize: 20, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.02em",
            }}>
              Recibe tu reporte
            </h3>
            <p style={{
              fontFamily: "var(--font-inter), sans-serif", fontSize: 13,
              color: "rgba(255,255,255,0.45)", margin: "0 0 20px", lineHeight: 1.6,
            }}>
              Dashboard claro con acciones concretas y prospectos listos.
            </p>

            <div style={{
              background: "#0a0a0a", borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.08)", padding: 14,
            }}>
              {[
                { label: "SEO Score", val: "72/100", color: G },
                { label: "Prospectos", val: "8 nuevos", color: "#60a5fa" },
                { label: "Mensajes listos", val: "5", color: "#a78bfa" },
              ].map((r, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "7px 0",
                  borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}>
                  <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{r.label}</span>
                  <span style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 13, color: r.color }}>{r.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); document.getElementById("hero-input")?.focus(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            style={{
              fontFamily: "var(--font-inter), sans-serif", fontSize: 14,
              color: G, textDecoration: "none",
              display: "inline-flex", alignItems: "center", gap: 6,
              borderBottom: "1px solid rgba(93,184,72,0.4)", paddingBottom: 2,
              transition: "gap 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.gap = "10px")}
            onMouseLeave={(e) => (e.currentTarget.style.gap = "6px")}
          >
            Probarlo ahora
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
