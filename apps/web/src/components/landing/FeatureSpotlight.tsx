"use client";

const G = "var(--accent)";

const features = [
  {
    kicker: "Auditoría",
    title: "Auditoría completa en 90 segundos",
    desc: "Sabemos exactamente qué está frenando tu visibilidad en Google. En menos de dos minutos tenés un diagnóstico real de tu negocio digital.",
    bullets: [
      "Core Web Vitals reales medidos en tu sitio",
      "SEO técnico: meta tags, velocidad, mobile",
      "Perfil de Google Business analizado",
      "Reseñas analizadas con IA",
      "Recomendaciones priorizadas por impacto",
    ],
    mockup: (
      <div style={{
        background: "#111", borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.08)",
        padding: 24, width: "100%", maxWidth: 420,
      }}>
        <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 16, letterSpacing: "0.05em", textTransform: "uppercase" as const }}>
          Reporte de auditoría
        </div>
        {[
          { cat: "Velocidad de carga", score: 82, color: G },
          { cat: "SEO On-page", score: 58, color: "#facc15" },
          { cat: "Google Business", score: 40, color: "#f87171" },
          { cat: "Reseñas", score: 71, color: G },
        ].map((item, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{item.cat}</span>
              <span style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 12, color: item.color }}>{item.score}</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 4, overflow: "hidden" }}>
              <div style={{ width: `${item.score}%`, height: "100%", background: item.color, borderRadius: 4 }} />
            </div>
          </div>
        ))}
        <div style={{
          marginTop: 20, background: "rgba(93,184,72,0.1)", borderRadius: 10,
          padding: "12px 14px", border: "1px solid rgba(93,184,72,0.25)",
        }}>
          <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 11, fontWeight: 600, color: G, marginBottom: 4 }}>
            3 acciones de alto impacto identificadas
          </div>
          <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
            Responder reseñas negativas · Añadir imágenes al perfil · Optimizar meta description
          </div>
        </div>
      </div>
    ),
  },
  {
    kicker: "Prospección",
    title: "Tu base de prospectos siempre fresca",
    desc: "Mientras dormís, EDA busca negocios en Bogotá, Ciudad de México o Lima que probablemente necesitan tus servicios. Los califica y te los entrega listos.",
    bullets: [
      "Filtrado por categoría y zona geográfica",
      "Score de oportunidad por negocio (0-100)",
      "Información de contacto verificada",
      "Actualización continua — sin duplicados",
    ],
    mockup: (
      <div style={{
        background: "#111", borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.08)",
        padding: 24, width: "100%", maxWidth: 420,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 13, color: "rgba(255,255,255,0.6)", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>
            Prospectos · Bogotá
          </div>
          <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 11, color: G, background: "rgba(93,184,72,0.15)", padding: "3px 8px", borderRadius: 20, border: "1px solid rgba(93,184,72,0.3)" }}>
            12 nuevos hoy
          </div>
        </div>
        {[
          { name: "Ferretería Los Andes", cat: "Ferretería", score: 87, city: "Bogotá" },
          { name: "Panadería Artesanal MX", cat: "Panadería", score: 74, city: "CDMX" },
          { name: "Clínica Dental Lima Sur", cat: "Salud", score: 91, city: "Lima" },
        ].map((p, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 0",
            borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none",
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: "rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 14, color: "rgba(255,255,255,0.5)",
              flexShrink: 0,
            }}>
              {p.name[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-inter), sans-serif", fontWeight: 600, fontSize: 12, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
              <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{p.cat} · {p.city}</div>
            </div>
            <div style={{
              fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 14,
              color: p.score > 80 ? G : "#facc15", flexShrink: 0,
            }}>
              {p.score}
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    kicker: "Outreach",
    title: "Outreach que se siente humano",
    desc: "Nada de spam genérico. Cada mensaje que manda EDA menciona datos específicos del negocio. La tasa de respuesta promedio es 3× más alta que los correos masivos.",
    bullets: [
      "Mensaje personalizado por prospecto",
      "Referencia datos reales del negocio destino",
      "Seguimiento de aperturas y respuestas",
      "Compatible con email y formularios de contacto",
    ],
    mockup: (
      <div style={{
        background: "#111", borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.08)",
        padding: 24, width: "100%", maxWidth: 420,
      }}>
        <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 16, letterSpacing: "0.05em", textTransform: "uppercase" as const }}>
          Mensaje generado
        </div>
        <div style={{
          background: "rgba(255,255,255,0.03)", borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.07)", padding: 16,
        }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(93,184,72,0.2)", border: "1px solid rgba(93,184,72,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-syne), sans-serif", fontSize: 13, fontWeight: 700, color: G, flexShrink: 0,
            }}>E</div>
            <div>
              <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 12, fontWeight: 600, color: "#fff" }}>EDA para Ferretería Los Andes</div>
              <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>a: contacto@losandes.com.co</div>
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
            Hola, encontré <span style={{ color: G }}>Ferretería Los Andes</span> en Google y noté que su perfil no tiene horarios actualizados. En negocios similares en Bogotá, completar el perfil generó un <span style={{ color: G }}>30% más de llamadas</span>. ¿Puedo mostrarte cómo?
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
          {[
            { label: "Apertura", val: "68%" },
            { label: "Respuesta", val: "24%" },
            { label: "Citas agendadas", val: "3" },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 16, color: G }}>{s.val}</div>
              <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export function FeatureSpotlight() {
  return (
    <section id="caracteristicas" style={{ padding: "80px 24px", background: "#0a0a0a" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 100 }}>
        {features.map((f, i) => (
          <div key={i} className="spotlight-row">
            {/* Text side */}
            <div style={{ order: i % 2 === 0 ? 0 : 1 }} className="spotlight-text">
              <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 18, marginBottom: 12 }}>
                {f.kicker}
              </div>
              <h2 style={{
                fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
                fontSize: "clamp(26px, 3vw, 40px)", color: "#fff",
                letterSpacing: "-0.03em", margin: "0 0 16px", lineHeight: 1.15,
              }}>
                {f.title}
              </h2>
              <p style={{
                fontFamily: "var(--font-inter), sans-serif", fontSize: 16,
                color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 0 28px",
              }}>
                {f.desc}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {f.bullets.map((b, j) => (
                  <div key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <svg style={{ flexShrink: 0, marginTop: 3 }} width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" fill="rgba(93,184,72,0.2)" />
                      <path d="M5 8l2.5 2.5L11 5.5" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.55 }}>
                      {b}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mockup side */}
            <div style={{ order: i % 2 === 0 ? 1 : 0, display: "flex", justifyContent: "center" }} className="spotlight-mockup">
              <div style={{ position: "relative", filter: "drop-shadow(0 20px 60px rgba(93,184,72,0.18))" }}>
                <div style={{
                  position: "absolute", inset: -20,
                  background: "radial-gradient(ellipse, rgba(93,184,72,0.1) 0%, transparent 70%)",
                  borderRadius: "50%", pointerEvents: "none",
                }} />
                {f.mockup}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
