"use client";

import Image from "next/image";

interface Props {
  onAuditClick: () => void;
}

const G = "var(--accent)";

export function FinalCTA({ onAuditClick }: Props) {
  return (
    <section style={{
      padding: "120px 24px",
      position: "relative", overflow: "hidden",
      background: "#0d0d0d",
      borderTop: "1px solid rgba(255,255,255,0.06)",
    }}>
      {/* Green glow */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 600, height: 400,
        background: "radial-gradient(ellipse, rgba(93,184,72,0.18) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Background logo watermarks */}
      <div style={{
        position: "absolute", right: "-80px", top: "50%",
        transform: "translateY(-50%)",
        opacity: 0.05, pointerEvents: "none",
      }}>
        <Image src="/logo_eda_sin_background.png" alt="" width={400} height={400} style={{ filter: "grayscale(1) invert(1)" }} />
      </div>
      <div style={{
        position: "absolute", left: "-80px", top: "50%",
        transform: "translateY(-50%)",
        opacity: 0.03, pointerEvents: "none",
      }}>
        <Image src="/logo_eda_sin_background.png" alt="" width={300} height={300} style={{ filter: "grayscale(1) invert(1)" }} />
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 20, marginBottom: 16 }}>
          Listo para empezar
        </div>
        <h2 style={{
          fontFamily: "var(--font-syne), sans-serif", fontWeight: 800,
          fontSize: "clamp(36px, 5vw, 64px)", color: "#fff",
          letterSpacing: "-0.03em", lineHeight: 1.05,
          margin: "0 0 20px",
        }}>
          Empieza a crecer<br />
          <span style={{ color: G }}>en 90 segundos.</span>
        </h2>
        <p style={{
          fontFamily: "var(--font-inter), sans-serif", fontSize: 18,
          color: "rgba(255,255,255,0.5)", margin: "0 0 40px", lineHeight: 1.6,
        }}>
          Tu primera auditoría es gratis. No necesitas tarjeta.
        </p>
        <button
          onClick={onAuditClick}
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: G, color: "#0a0a0a",
            fontFamily: "var(--font-inter), sans-serif", fontWeight: 700,
            fontSize: 17, padding: "16px 36px",
            borderRadius: 12, border: "none", cursor: "pointer",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 12px 40px rgba(93,184,72,0.45)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Audita tu negocio →
        </button>
      </div>
    </section>
  );
}
