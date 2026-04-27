"use client";

import { useInView } from "@/hooks/useInView";

const METRICS = [
  { value: "40+",  label: "Factores SEO analizados", color: "var(--accent)"  },
  { value: "<30s", label: "Tiempo de resultado",      color: "var(--accent2)" },
  { value: "CWV",  label: "Core Web Vitals nativos",  color: "var(--accent3)" },
  { value: "AI",   label: "Impulsado por Claude",     color: "var(--accent)"  },
];

export function ImpactMetrics() {
  const [ref, inView] = useInView();

  return (
    <section
      ref={ref}
      style={{ background: "var(--bg)", padding: "96px 24px", borderTop: "1px solid var(--border-soft)" }}
    >
      <div className="max-w-[1120px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {METRICS.map((m, i) => (
            <div
              key={m.label}
              className="text-center py-10 px-5 transition-all duration-500"
              style={{
                borderRight: i < 3 ? "1px solid var(--border)" : "none",
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(20px)",
                transitionDelay: `${i * 120}ms`,
              }}
            >
              <div
                className="font-extrabold mb-2"
                style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(32px,4vw,56px)", letterSpacing: "-2px", color: m.color }}
              >{m.value}</div>
              <div className="text-[14px]" style={{ color: "var(--txt-muted)" }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
