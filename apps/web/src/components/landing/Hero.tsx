"use client";

import Image from "next/image";

interface Props {
  url: string;
  onUrlChange: (v: string) => void;
  onScan: () => void; // triggers scan animation
}

export function Hero({ url, onUrlChange, onScan }: Props) {
  return (
    <section
      id="hero"
      className="min-h-screen flex items-center relative overflow-hidden"
      style={{ background: "var(--bg)", paddingTop: 64 }}
    >
      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, var(--txt-faint) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          opacity: 0.3,
        }}
      />
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 60% at 50% 40%, var(--accent-glow) 0%, transparent 70%)" }}
      />
      {/* Decorative floating icon — CSS handles opacity/filter per theme */}
      <Image
        src="/logo_eda_sin_background.png"
        alt=""
        width={340}
        height={340}
        aria-hidden
        className="logo-decorative float-icon absolute pointer-events-none object-contain"
        style={{ right: "-2%", top: "50%" }}
      />

      <div className="max-w-[1120px] mx-auto px-6 w-full relative z-10">
        <div className="max-w-[680px] fade-up">
          {/* Beta badge */}
          <div
            className="inline-flex items-center gap-2 text-[13px] font-medium px-4 py-1.5 rounded-full mb-8"
            style={{ background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--txt-muted)" }}
          >
            <span style={{ color: "var(--accent)", fontSize: 10 }}>●</span>
            Beta · Primeros 500 usuarios con auditorías gratis
          </div>

          {/* Headline */}
          <h1
            className="font-extrabold leading-[1.05] mb-6"
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "clamp(36px, 5.5vw, 72px)",
              letterSpacing: "-2px",
              color: "var(--txt)",
            }}
          >
            ¿Tu negocio existe<br />en internet o solo<br />
            <span
              style={{
                background: "linear-gradient(135deg, var(--accent), var(--accent2))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >crees que sí?</span>
          </h1>

          {/* Subheadline */}
          <p
            className="mb-10 max-w-[560px]"
            style={{ fontSize: "clamp(15px, 1.4vw, 18px)", color: "var(--txt-muted)", lineHeight: 1.65 }}
          >
            EDA audita tu presencia digital en segundos. Detecta qué está fallando, descubre oportunidades en tu mercado y alcanza más clientes — impulsado por IA.
          </p>

          {/* URL input */}
          <div
            className="flex items-stretch rounded-xl overflow-hidden mb-5 max-w-[560px]"
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              boxShadow: "0 0 32px var(--accent-glow)",
            }}
          >
            <span
              className="flex items-center px-3.5 font-mono text-[14px] whitespace-nowrap"
              style={{ color: "var(--txt-faint)", background: "var(--bg3)", borderRight: "1px solid var(--border)" }}
            >https://</span>

            <input
              id="hero-input"
              type="text"
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onScan()}
              placeholder="tunegocio.com"
              className="flex-1 bg-transparent border-none outline-none text-[15px]"
              style={{ color: "var(--txt)", fontFamily: "var(--font-dm-sans)", padding: "14px 16px" }}
            />

            {/* CTA: disparar auditoría */}
            <button
              onClick={onScan}
              disabled={!url.trim()}
              className="border-none text-[15px] font-semibold px-6 whitespace-nowrap transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "var(--accent)", color: "#fff" }}
              onMouseEnter={(e) => { if (url.trim()) e.currentTarget.style.filter = "brightness(1.1)"; }}
              onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
            >Auditar →</button>
          </div>

          {/* Trust signals */}
          <div className="flex items-center gap-5 flex-wrap">
            {["Sin registrarse", "Resultado en 30 seg", "Sin tarjeta de crédito"].map((item) => (
              <span key={item} className="flex items-center gap-1.5 text-[13px]" style={{ color: "var(--txt-faint)" }}>
                <span style={{ color: "var(--accent)", fontSize: 10 }}>✓</span> {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
