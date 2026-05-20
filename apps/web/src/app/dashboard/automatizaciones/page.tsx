const G  = "#5DB848";
const Gs = "rgba(93,184,72,0.12)";
const Gb = "rgba(93,184,72,0.35)";

const BENEFITS = [
  {
    icon: (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    title: "Agenda inteligente",
    desc:  "Tus clientes reservan citas solos. Recordatorios automáticos por WhatsApp y email.",
  },
  {
    icon: (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
    ),
    title: "Respuestas automáticas",
    desc:  "WhatsApp y formularios contestan solos las preguntas frecuentes de tu negocio.",
  },
  {
    icon: (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: "Seguimiento de reseñas",
    desc:  "Solicita reseñas después de cada venta. Te avisa cuando hay reseñas negativas.",
  },
  {
    icon: (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
    title: "Integración con tus herramientas",
    desc:  "Conecta WhatsApp Business, Google Calendar, Stripe, hojas de cálculo y CRM.",
  },
];

export default function AutomatizacionesPage() {
  return (
    <div style={{ maxWidth: 720, margin: "60px auto", padding: "0 24px" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        {/* Badge BETA */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: Gs, border: `1px solid ${Gb}`,
          borderRadius: 999, padding: "4px 14px", marginBottom: 28,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: G, animation: "pulse-dot 1.4s ease-in-out infinite" }} />
          <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 11, fontWeight: 700, color: G, letterSpacing: "0.1em" }}>
            BETA
          </span>
        </div>

        {/* Icon */}
        <div style={{
          width: 64, height: 64, borderRadius: 18, background: Gs,
          border: `1px solid ${Gb}`, display: "flex", alignItems: "center",
          justifyContent: "center", margin: "0 auto 24px", color: G,
        }}>
          <svg width={28} height={28} viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>

        <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 18, marginBottom: 6 }}>
          Pilar Actúa
        </div>

        <h1 style={{
          fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
          fontSize: "clamp(28px, 4vw, 42px)", color: "#fff",
          letterSpacing: "-0.03em", marginBottom: 16, lineHeight: 1.1,
        }}>
          Automatiza lo que más tiempo te quita
        </h1>

        <p style={{
          fontFamily: "var(--font-inter), sans-serif", fontSize: 16,
          color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: 8,
          maxWidth: 520, margin: "0 auto 8px",
        }}>
          EDA detecta procesos manuales en tu negocio y los convierte en automatizaciones:
          agenda, mensajería, seguimiento de reseñas, conexión con tus herramientas.
        </p>

        <p style={{
          fontFamily: "var(--font-inter), sans-serif", fontSize: 13,
          color: "rgba(255,255,255,0.32)", marginBottom: 36, lineHeight: 1.6,
        }}>
          Estamos preparando las primeras integraciones one-click. Mientras tanto, agenda una
          llamada y configuramos juntos las automatizaciones que más impactan tu negocio.
        </p>
      </div>

      {/* Benefits grid */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 40,
      }}>
        {BENEFITS.map(b => (
          <div key={b.title} style={{
            padding: "20px 22px", borderRadius: 14,
            background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
            display: "flex", flexDirection: "column", gap: 10,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: Gs,
              border: `1px solid ${Gb}`, color: G,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {b.icon}
            </div>
            <div>
              <div style={{
                fontFamily: "var(--font-syne), sans-serif", fontWeight: 700,
                fontSize: 15, color: "#fff", marginBottom: 4,
              }}>
                {b.title}
              </div>
              <div style={{
                fontFamily: "var(--font-inter), sans-serif", fontSize: 13,
                color: "rgba(255,255,255,0.5)", lineHeight: 1.55,
              }}>
                {b.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{
        padding: "28px 32px", borderRadius: 18,
        background: `linear-gradient(135deg, ${Gs}, rgba(93,184,72,0.04))`,
        border: `1px solid ${Gb}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 24, flexWrap: "wrap" as const,
      }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{
            fontFamily: "var(--font-syne), sans-serif", fontWeight: 700,
            fontSize: 18, color: "#fff", marginBottom: 4,
          }}>
            Agenda 30 minutos
          </div>
          <div style={{
            fontFamily: "var(--font-inter), sans-serif", fontSize: 13,
            color: "rgba(255,255,255,0.55)", lineHeight: 1.5,
          }}>
            Revisamos tu negocio juntos y configuramos las 2-3 automatizaciones más impactantes.
            Sin compromiso. Implementación incluida en tu plan.
          </div>
        </div>
        <a
          href="https://cal.com/eda/automatizaciones"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block", padding: "13px 26px", borderRadius: 10,
            background: G, color: "#0a0a0a",
            fontFamily: "var(--font-inter), sans-serif", fontWeight: 700, fontSize: 14,
            textDecoration: "none", whiteSpace: "nowrap" as const, flexShrink: 0,
          }}
        >
          Agendar llamada →
        </a>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}