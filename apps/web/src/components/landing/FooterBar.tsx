import Image from "next/image";
import Link from "next/link";

export function FooterBar() {
  return (
    <footer style={{ background: "var(--bg)", borderTop: "1px solid var(--border-soft)", padding: "24px" }}>
      <div className="max-w-[1120px] mx-auto flex items-center justify-between flex-wrap gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image src="/logo_eda_sin_background.png" alt="EDA" width={22} height={22} className="logo-icon object-contain" loading="eager"/>
          <Image src="/eda.png" alt="EDA" width={48} height={16} className="logo-wordmark object-contain" loading="eager" />
        </div>

        <span className="text-[13px]" style={{ color: "var(--txt-faint)" }}>
          © 2025 EDA · Evalúa. Descubre. Alcanza.
        </span>

        {/* Legal links */}
        <div className="flex gap-5">
          {[
            { label: "Privacidad", href: "/privacidad" },
            { label: "Términos",   href: "/terminos"   },
            { label: "Contacto",   href: "/contacto"   },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-[13px] no-underline transition-colors duration-150"
              style={{ color: "var(--txt-faint)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--txt-muted)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--txt-faint)")}
            >{label}</Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
