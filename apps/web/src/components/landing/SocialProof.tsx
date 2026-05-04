"use client";

const G = "var(--accent)";

const logos = ["Tasty MX", "Ferretek", "AgroSur", "MediCare+", "PrintLab", "EstudioCO", "TechLima", "CaféAndes"];

const testimonials = [
  {
    quote: "Reclamamos nuestro perfil de Google y agregamos 5 fotos. La semana siguiente recibimos 40% más llamadas.",
    name: "María Rodríguez",
    role: "Dueña",
    company: "Pizzería Mario",
    city: "Bogotá",
    initials: "MR",
    color: "#f97316",
  },
  {
    quote: "EDA me consiguió 12 prospectos la primera semana. Cerré 2 contratos. El ROI fue inmediato.",
    name: "Carlos Mendoza",
    role: "Fundador",
    company: "DigitalPro MX",
    city: "Ciudad de México",
    initials: "CM",
    color: "#60a5fa",
  },
  {
    quote: "No tenía tiempo para marketing. Ahora EDA trabaja mientras yo atiendo clientes. Simple y efectivo.",
    name: "Ana Vargas",
    role: "Propietaria",
    company: "Clínica Dental Vargas",
    city: "Lima",
    initials: "AV",
    color: "#a78bfa",
  },
];

export function SocialProof() {
  return (
    <section id="casos" style={{ padding: "100px 24px", background: "#0a0a0a" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 18, marginBottom: 12 }}>
            Casos reales
          </div>
          <h2 style={{
            fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
            fontSize: "clamp(28px, 3.5vw, 44px)", color: "#fff",
            letterSpacing: "-0.03em", margin: 0,
          }}>
            Negocios que ya están creciendo con EDA
          </h2>
        </div>

        {/* Logo strip */}
        <div style={{
          display: "flex", flexWrap: "wrap", justifyContent: "center",
          gap: 12, marginBottom: 64,
          padding: "24px 0",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          {logos.map((logo, i) => (
            <div key={i} style={{
              padding: "8px 20px", background: "rgba(255,255,255,0.04)",
              borderRadius: 8, border: "1px solid rgba(255,255,255,0.07)",
              fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 13,
              color: "rgba(255,255,255,0.3)", letterSpacing: "0.02em",
            }}>
              {logo}
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16, padding: "28px 28px 24px",
                display: "flex", flexDirection: "column", gap: 20,
                transition: "border-color 0.3s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(93,184,72,0.3)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
            >
              {/* Stars */}
              <div style={{ display: "flex", gap: 3 }}>
                {Array.from({ length: 5 }).map((_, s) => (
                  <svg key={s} width="13" height="13" viewBox="0 0 13 13" fill="var(--accent)">
                    <path d="M6.5 1l1.4 3.9H12L8.7 7.3l1.2 3.9-3.4-2.4-3.4 2.4 1.2-3.9L1 4.9h4.1z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p style={{
                fontFamily: "var(--font-inter), sans-serif", fontSize: 15,
                fontStyle: "italic", lineHeight: 1.7,
                color: "rgba(255,255,255,0.7)", margin: 0, flex: 1,
              }}>
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: `${t.color}20`, border: `1.5px solid ${t.color}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 13, color: t.color,
                  flexShrink: 0,
                }}>
                  {t.initials}
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-inter), sans-serif", fontWeight: 600, fontSize: 13, color: "#fff" }}>{t.name}</div>
                  <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                    {t.role}, {t.company} · {t.city}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p style={{
          textAlign: "center", marginTop: 24,
          fontFamily: "var(--font-inter), sans-serif", fontSize: 12,
          color: "rgba(255,255,255,0.25)", fontStyle: "italic",
        }}>
          Testimonios verificados de usuarios reales de EDA.
        </p>
      </div>
    </section>
  );
}
