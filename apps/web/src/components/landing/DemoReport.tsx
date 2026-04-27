"use client";

import { useState, useCallback } from "react";
import { ScoreCard } from "@/components/ui/ScoreCard";
import { MetricRow } from "@/components/ui/MetricRow";
import { useInView } from "@/hooks/useInView";

type ActiveCard = "performance" | "seo" | "presencia";

const SCORE_CARDS = [
  { id: "performance" as const, label: "Performance", score: 80, color: "var(--accent)",  badge: "Buena base"       },
  { id: "seo"         as const, label: "SEO",         score: 50, color: "var(--accent3)", badge: "Necesita mejoras" },
  { id: "presencia"   as const, label: "Presencia",   score: null, color: "var(--txt-faint)", badge: "Próximamente" },
];

const CHAT_SUGGESTIONS = ["¿Cómo mejorar el CLS?", "¿Qué es el LCP?", "Ver competidores"];
const CHAT_RESPONSES: Record<string, string> = {
  "¿Cómo mejorar el CLS?":
    "El CLS de 0.10 está justo en el límite. Causa más común: imágenes sin atributos width/height definidos. Agrega dimensiones explícitas a todas las imágenes y usa font-display: swap. Puedes bajar a < 0.05 en un día.",
  "¿Qué es el LCP?":
    "LCP (Largest Contentful Paint) mide cuánto tarda en pintarse el elemento visual más grande. Tu LCP de 2.1s es bueno (umbral Google: < 2.5s). Mantén este número.",
  "Ver competidores":
    "El módulo Descubre (Fase 2) detectará negocios en tu mercado con presencia digital débil. Por ahora el reporte se enfoca en tu propio sitio.",
};

interface ChatMessage { role: "ai" | "user"; text: string; }

export function DemoReport() {
  const [ref, inView] = useInView();
  const [activeCard, setActiveCard] = useState<ActiveCard>("performance");
  const [activeTab, setActiveTab]   = useState<"metrics" | "ai">("metrics");
  const [chatInput, setChatInput]   = useState("");
  const [messages, setMessages]     = useState<ChatMessage[]>([
    { role: "ai", text: "Analicé tu sitio. Tu LCP de 2.1s es bueno, pero el CLS de 0.10 está en el límite. Revisa imágenes sin dimensiones definidas — pueden estar causando desplazamientos al cargar." },
  ]);

  const sendMessage = useCallback(() => {
    const q = chatInput.trim();
    if (!q) return;
    setChatInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setTimeout(() => {
      const answer = CHAT_RESPONSES[q] ?? `Basado en los datos de auditoría, te ayudaré con "${q}". El análisis en tiempo real estará disponible en la versión conectada al backend.`;
      setMessages((m) => [...m, { role: "ai", text: answer }]);
    }, 1200);
  }, [chatInput]);

  return (
    <section
      id="demo-section"
      ref={ref}
      style={{ background: "var(--bg)", padding: "96px 24px" }}
    >
      <div className="max-w-[1120px] mx-auto">
        {/* Header */}
        <div
          className="mb-12 transition-all duration-700"
          style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(24px)" }}
        >
          <div
            className="inline-block text-[12px] font-bold tracking-[0.08em] uppercase px-3 py-1 rounded-full mb-4"
            style={{ background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--accent)" }}
          >Vista Previa</div>
          <h2
            className="font-extrabold"
            style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(28px,3.5vw,48px)", letterSpacing: "-1.5px", color: "var(--txt)" }}
          >Así luce un reporte EDA</h2>
          <p className="mt-3 text-[16px]" style={{ color: "var(--txt-muted)" }}>
            Ingresa tu URL arriba para ver el tuyo en tiempo real.
          </p>
        </div>

        {/* Grid: cards + detail panel */}
        <div
          className="grid gap-6 transition-opacity duration-700"
          style={{ gridTemplateColumns: "300px 1fr", opacity: inView ? 1 : 0 }}
        >
          {/* Score cards */}
          <div className="flex flex-col gap-3">
            {SCORE_CARDS.map((card) => (
              <ScoreCard
                key={card.id}
                label={card.label}
                score={card.score}
                color={card.color}
                badge={card.badge}
                active={activeCard === card.id}
                onClick={() => setActiveCard(card.id)}
                started={inView}
              />
            ))}
          </div>

          {/* Detail panel */}
          <div
            className="rounded-2xl overflow-hidden min-h-[380px]"
            style={{ background: "var(--bg2)", border: "1px solid var(--border)" }}
          >
            {/* Tabs */}
            <div className="flex" style={{ borderBottom: "1px solid var(--border)" }}>
              {(["metrics", "ai"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 py-3.5 bg-transparent border-none text-[14px] font-semibold cursor-pointer transition-all duration-150"
                  style={{
                    borderBottom: activeTab === tab ? "2px solid var(--accent)" : "2px solid transparent",
                    color: activeTab === tab ? "var(--txt)" : "var(--txt-muted)",
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  {tab === "metrics" ? "📊 Métricas" : "🤖 EDA AI"}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === "metrics" && (
                <div>
                  <div className="text-[12px] font-bold tracking-[0.08em] uppercase mb-3" style={{ color: "var(--txt-faint)" }}>
                    dian.gov.co · Core Web Vitals
                  </div>
                  <MetricRow label="LCP"  value="2.1s"  status="GOOD" />
                  <MetricRow label="FCP"  value="1.8s"  status="GOOD" />
                  <MetricRow label="CLS"  value="0.10"  status="NEEDS IMPROVEMENT" />
                  <MetricRow label="TTFB" value="450ms" status="GOOD" />
                  <div className="mt-5 grid grid-cols-3 gap-3">
                    {[["Domain Authority","Media"],["HTTPS","✓ Activo"],["Sitemap","✓ Detectado"]].map(([k, v]) => (
                      <div key={k} className="rounded-lg p-3" style={{ background: "var(--bg3)" }}>
                        <div className="text-[11px] font-semibold mb-1" style={{ color: "var(--txt-faint)" }}>{k}</div>
                        <div className="text-[14px] font-semibold" style={{ color: "var(--txt)" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "ai" && (
                <div className="flex flex-col" style={{ height: 320 }}>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-4">
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className="max-w-[80%] text-[13px] leading-relaxed p-3"
                        style={{
                          alignSelf: msg.role === "ai" ? "flex-start" : "flex-end",
                          background: msg.role === "ai" ? "var(--bg3)" : "var(--accent)" + "22",
                          border: `1px solid ${msg.role === "ai" ? "var(--border)" : "var(--accent)" + "44"}`,
                          borderRadius: msg.role === "ai" ? "4px 12px 12px 12px" : "12px 4px 12px 12px",
                          color: "var(--txt)",
                        }}
                      >
                        {msg.role === "ai" && (
                          <span className="block text-[11px] font-bold mb-1" style={{ color: "var(--accent)" }}>EDA AI</span>
                        )}
                        {msg.text}
                      </div>
                    ))}
                  </div>
                  {/* Suggestion chips */}
                  <div className="flex gap-1.5 flex-wrap mb-2.5">
                    {CHAT_SUGGESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => setChatInput(q)}
                        className="bg-transparent rounded-full px-2.5 py-1 text-[11px] cursor-pointer transition-all duration-150"
                        style={{ border: "1px solid var(--border)", color: "var(--txt-muted)", fontFamily: "var(--font-dm-sans)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--txt-muted)"; }}
                      >{q}</button>
                    ))}
                  </div>
                  {/* Input */}
                  <div className="flex gap-2">
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Pregunta algo sobre tu sitio..."
                      className="flex-1 rounded-lg px-3 py-2 text-[13px] outline-none"
                      style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--txt)", fontFamily: "var(--font-dm-sans)" }}
                    />
                    <button
                      onClick={sendMessage}
                      className="border-none rounded-lg px-4 py-2 text-[13px] font-semibold cursor-pointer"
                      style={{ background: "var(--accent)", color: "#fff" }}
                    >→</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
