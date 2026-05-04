"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Props {
  scrolled: boolean;
  onAuditClick: () => void;
}

const links = [
  { label: "Producto", href: "#producto" },
  { label: "Precios", href: "#precios" },
  { label: "Casos", href: "#casos" },
];

export function LandingNav({ scrolled, onAuditClick }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on resize
  useEffect(() => {
    const handler = () => { if (window.innerWidth > 768) setMobileOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      transition: "all 0.3s ease",
      background: scrolled ? "rgba(10,10,10,0.88)" : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", height: 68,
      }}>
        {/* Logo */}
        <a href="#" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Image src="/logo_eda_sin_background.png" alt="EDA" width={36} height={36} className="logo-icon" />
          <Image src="/eda.png" alt="EDA" width={55} height={22} className="logo-wordmark" />
        </a>

        {/* Desktop links */}
        <div style={{ display: "flex", gap: 32, alignItems: "center" }} className="nav-desktop">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              style={{
                color: "rgba(255,255,255,0.65)", fontSize: 14, textDecoration: "none",
                fontFamily: "var(--font-inter), sans-serif", letterSpacing: "0.01em",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA buttons */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }} className="nav-desktop">
          <a
            href="#"
            style={{
              color: "rgba(255,255,255,0.75)", fontSize: 14, textDecoration: "none",
              padding: "8px 16px", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8, fontFamily: "var(--font-inter), sans-serif",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
              e.currentTarget.style.color = "rgba(255,255,255,0.75)";
            }}
          >
            Iniciar sesión
          </a>
          <button
            onClick={onAuditClick}
            style={{
              background: "var(--accent)", color: "#0a0a0a",
              fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer",
              padding: "8px 18px", borderRadius: 8,
              fontFamily: "var(--font-inter), sans-serif",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Empezar gratis
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="nav-mobile"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#fff", padding: 8,
          }}
          aria-label="Menú"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            {mobileOpen ? (
              <path d="M4 4L18 18M18 4L4 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <>
                <line x1="3" y1="7" x2="19" y2="7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="3" y1="15" x2="19" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          background: "#111", borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "16px 24px 24px",
        }}>
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "block", color: "rgba(255,255,255,0.75)", fontSize: 16,
                textDecoration: "none", padding: "12px 0",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                fontFamily: "var(--font-inter), sans-serif",
              }}
            >
              {l.label}
            </a>
          ))}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
            <a href="#" style={{
              color: "#fff", fontSize: 14, textDecoration: "none",
              padding: "10px 16px", border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 8, fontFamily: "var(--font-inter), sans-serif", textAlign: "center",
            }}>
              Iniciar sesión
            </a>
            <button
              onClick={() => { setMobileOpen(false); onAuditClick(); }}
              style={{
                background: "var(--accent)", color: "#0a0a0a",
                fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer",
                padding: "10px 16px", borderRadius: 8,
                fontFamily: "var(--font-inter), sans-serif",
              }}
            >
              Empezar gratis
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
