"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/lib/theme";

interface Props {
  scrolled: boolean;
  onAuditClick: () => void; // focuses hero input
}

export function Nav({ scrolled, onAuditClick }: Props) {
  const { theme, toggle } = useTheme();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "var(--nav-bg)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border-soft)" : "1px solid transparent",
      }}
    >
      <div className="max-w-[1120px] mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 no-underline">
          <Image src="/logo_eda_sin_background.png" alt="" width={28} height={28} className="logo-icon object-contain" />
          <Image src="/eda.png" alt="EDA" width={60} height={22} className="logo-wordmark object-contain" />
        </a>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "Cómo funciona", href: "#cómo-funciona" },
            { label: "Reporte",       href: "#demo-section"  },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-[14px] font-medium no-underline transition-colors duration-150"
              style={{ color: "var(--txt-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--txt)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--txt-muted)")}
            >{label}</a>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-2.5">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            title="Cambiar tema"
            className="text-[14px] px-2.5 py-1.5 rounded-lg border transition-all duration-150"
            style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--txt-muted)" }}
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>

          {/* CTA: Iniciar sesión → /login (Paso 3) */}
          <Link
            href="/login"
            className="text-[13px] font-medium px-4 py-2 rounded-lg border no-underline transition-all duration-150"
            style={{ border: "1px solid var(--border)", color: "var(--txt)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg3)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >Iniciar sesión</Link>

          {/* CTA primario: scroll top + focus input */}
          <button
            onClick={onAuditClick}
            className="text-[13px] font-semibold px-4 py-2 rounded-lg border-none transition-all duration-150"
            style={{ background: "var(--accent)", color: "#fff", boxShadow: "0 0 16px var(--accent-glow)" }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
          >Auditar gratis →</button>
        </div>
      </div>
    </nav>
  );
}
