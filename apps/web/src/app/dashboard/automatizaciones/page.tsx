const G  = "#5DB848";
const Gs = "rgba(93,184,72,0.12)";
const Gb = "rgba(93,184,72,0.35)";

export default function AutomatizacionesPage() {
  return (
    <div style={{ maxWidth: 560, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
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
        justifyContent: "center", margin: "0 auto 24px", fontSize: 28,
      }}>
        ⚡
      </div>

      <h1 style={{
        fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
        fontSize: "clamp(24px, 3.5vw, 38px)", color: "#fff",
        letterSpacing: "-0.03em", marginBottom: 16,
      }}>
        Automatizaciones
      </h1>

      <p style={{
        fontFamily: "var(--font-inter), sans-serif", fontSize: 15,
        color: "rgba(255,255,255,0.45)", lineHeight: 1.7, marginBottom: 12,
      }}>
        Estamos preparando esto. Mientras tanto, agenda una llamada con nosotros
        para configurar automatizaciones manualmente para tu negocio.
      </p>

      <p style={{
        fontFamily: "var(--font-inter), sans-serif", fontSize: 13,
        color: "rgba(255,255,255,0.28)", marginBottom: 36, lineHeight: 1.6,
      }}>
        Pilar <strong style={{ color: G }}>ACTÚA</strong> — contacto automático de prospectos,
        mensajes personalizados y seguimiento sin esfuerzo.
      </p>

      <a
        href="mailto:hola@useeda.com"
        style={{
          display: "inline-block", padding: "13px 28px", borderRadius: 10,
          background: G, color: "#0a0a0a",
          fontFamily: "var(--font-inter), sans-serif", fontWeight: 700, fontSize: 14,
          textDecoration: "none",
        }}
      >
        Agenda una llamada →
      </a>
    </div>
  );
}
