const PARTNERS = ["Google CrUX", "DataForSEO", "Anthropic Claude", "Core Web Vitals"];

export function PoweredByStrip() {
  return (
    <div
      style={{
        background: "var(--bg2)",
        borderTop: "1px solid var(--border-soft)",
        borderBottom: "1px solid var(--border-soft)",
        padding: "18px 24px",
      }}
    >
      <div className="max-w-[1120px] mx-auto flex items-center gap-6 flex-wrap justify-center">
        <span className="text-[13px] font-medium" style={{ color: "var(--txt-faint)" }}>
          Tecnología de:
        </span>
        {PARTNERS.map((tech, i) => (
          <span key={tech} className="flex items-center gap-6">
            {i > 0 && <span style={{ color: "var(--txt-faint)", opacity: 0.4 }}>·</span>}
            <span className="text-[13px] font-medium tracking-wide" style={{ color: "var(--txt-muted)" }}>
              {tech}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
