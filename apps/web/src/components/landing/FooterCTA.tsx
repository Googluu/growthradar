import Image from "next/image";

interface Props {
  onAuditClick: () => void; // scroll top + focus input
  onDemoClick: () => void;  // scroll to demo section
}

export function FooterCTA({ onAuditClick, onDemoClick }: Props) {
  return (
    <section
      className="text-center relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, var(--bg2) 0%, var(--bg) 100%)",
        padding: "120px 24px",
        borderTop: "1px solid var(--border-soft)",
      }}
    >
      {/* Background watermark logo */}
      <Image
        src="/logo_eda_sin_background.png"
        alt=""
        width={480}
        height={480}
        aria-hidden
        className="logo-bg absolute object-contain pointer-events-none"
        style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}
        loading="eager"
      />

      <div className="relative z-10">
        <h2
          className="font-extrabold mb-4"
          style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(32px,5vw,64px)", letterSpacing: "-2px", color: "var(--txt)" }}
        >
          Audita tu sitio.<br />
          <span style={{ color: "var(--accent)" }}>Es gratis.</span>
        </h2>
        <p className="text-[16px] mb-10" style={{ color: "var(--txt-muted)" }}>
          Sin tarjeta de crédito. Resultado en 30 segundos.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          {/* CTA primario: scroll al top + focus input */}
          <button
            onClick={onAuditClick}
            className="border-none rounded-xl text-[16px] font-bold cursor-pointer transition-all duration-150"
            style={{
              background: "var(--accent)",
              color: "#fff",
              padding: "16px 36px",
              boxShadow: "0 4px 32px var(--accent-glow)",
              fontFamily: "var(--font-dm-sans)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >Auditar mi sitio →</button>

          {/* CTA secundario: ir al demo */}
          <button
            onClick={onDemoClick}
            className="rounded-xl text-[16px] font-semibold cursor-pointer transition-all duration-150"
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--txt)",
              padding: "16px 36px",
              fontFamily: "var(--font-dm-sans)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg3)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >Ver demo</button>
        </div>
      </div>
    </section>
  );
}
