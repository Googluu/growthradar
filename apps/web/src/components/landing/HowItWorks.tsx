const PILLARS = [
  {
    num: "01", label: "EVALÚA", color: "var(--accent)",
    title: "Auditoría automática",
    desc: "Performance + SEO + Presencia en segundos. Sin configuración, sin esperas.",
  },
  {
    num: "02", label: "DESCUBRE", color: "var(--accent2)",
    title: "Inteligencia competitiva",
    desc: "Mapea tu mercado y encuentra oportunidades que tu competencia no está aprovechando.",
  },
  {
    num: "03", label: "ALCANZA", color: "var(--accent3)",
    title: "Outreach con IA",
    desc: "Convierte oportunidades en clientes con mensajes personalizados generados por IA.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="cómo-funciona"
      style={{ background: "var(--bg2)", padding: "96px 24px", borderTop: "1px solid var(--border-soft)" }}
    >
      <div className="max-w-[1120px] mx-auto">
        <div className="text-center mb-16">
          <h2
            className="font-extrabold"
            style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(28px,3.5vw,48px)", letterSpacing: "-1.5px", color: "var(--txt)" }}
          >Tres pasos. Resultados reales.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <div
              key={p.num}
              className="relative p-10"
              style={{ borderRight: i < 2 ? "1px solid var(--border)" : "none" }}
            >
              <div className="flex items-baseline gap-3 mb-5">
                <span className="font-extrabold text-[13px] tracking-[0.12em]" style={{ fontFamily: "var(--font-syne)", color: p.color }}>
                  {p.num} · {p.label}
                </span>
              </div>
              <h3 className="font-extrabold text-[22px] mb-3" style={{ fontFamily: "var(--font-syne)", letterSpacing: "-0.5px", color: "var(--txt)" }}>
                {p.title}
              </h3>
              <p className="text-[15px] leading-[1.65]" style={{ color: "var(--txt-muted)" }}>
                {p.desc}
              </p>
              {/* Accent underline */}
              <div className="absolute bottom-0 left-10 w-10 h-0.5 rounded" style={{ background: p.color }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
