const G  = "#5DB848";
const Gs = "rgba(93,184,72,0.12)";
const Gb = "rgba(93,184,72,0.35)";

interface Props {
  icon: string;
  title: string;
  description: string;
  hint?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function EmptySection({ icon, title, description, hint, ctaLabel, ctaHref }: Props) {
  return (
    <div style={{ maxWidth: 520, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
      {/* Icon */}
      <div style={{
        width: 60, height: 60, borderRadius: 16, background: Gs,
        border: `1px solid ${Gb}`, display: "flex", alignItems: "center",
        justifyContent: "center", margin: "0 auto 24px", fontSize: 26,
      }}>
        {icon}
      </div>

      <h1 style={{
        fontFamily: "var(--font-syne), sans-serif", fontWeight: 700,
        fontSize: "clamp(22px, 3vw, 34px)", color: "#fff",
        letterSpacing: "-0.025em", marginBottom: 14,
      }}>
        {title}
      </h1>

      <p style={{
        fontFamily: "var(--font-inter), sans-serif", fontSize: 15,
        color: "rgba(255,255,255,0.42)", lineHeight: 1.7, marginBottom: 28,
      }}>
        {description}
      </p>

      {hint && (
        <div style={{
          display: "inline-block",
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 999, padding: "5px 14px", marginBottom: 28,
        }}>
          <span style={{
            fontFamily: "var(--font-inter), sans-serif", fontSize: 12,
            color: "rgba(255,255,255,0.35)", letterSpacing: "0.03em",
          }}>
            {hint}
          </span>
        </div>
      )}

      {ctaLabel && ctaHref && (
        <div>
          <a
            href={ctaHref}
            style={{
              display: "inline-block", padding: "11px 24px", borderRadius: 10,
              background: G, color: "#0a0a0a",
              fontFamily: "var(--font-inter), sans-serif", fontWeight: 700, fontSize: 14,
              textDecoration: "none",
            }}
          >
            {ctaLabel}
          </a>
        </div>
      )}
    </div>
  );
}
