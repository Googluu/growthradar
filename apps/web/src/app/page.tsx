"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

// ── Types ─────────────────────────────────────────────────────────────────────
type Theme = "dark" | "light";

interface ScoreCardProps {
  label: string;
  score: number | null;
  color: string;
  badge: string;
  active: boolean;
  onClick: () => void;
  started: boolean;
}

interface MetricRowProps {
  label: string;
  value: string;
  status: "GOOD" | "NEEDS IMPROVEMENT" | "POOR";
}

interface ChatMessage {
  role: "ai" | "user";
  text: string;
}

// ── useCountUp ────────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start || target === 0) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return val;
}

// ── useInView ─────────────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView] as const;
}

// ── ScoreCard ─────────────────────────────────────────────────────────────────
function ScoreCard({ label, score, color, badge, active, onClick, started }: ScoreCardProps) {
  const animated = useCountUp(score ?? 0, 1200, started);
  const pct = score ? (animated / 100) * 100 : 0;
  return (
    <div
      onClick={onClick}
      style={{
        background: active ? "var(--bg3)" : "var(--bg2)",
        border: `1px solid ${active ? color : "var(--border)"}`,
        boxShadow: active ? `0 0 0 1px ${color}44` : "none",
      }}
      className="rounded-xl p-5 cursor-pointer transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium text-[15px]" style={{ color: "var(--txt)" }}>{label}</span>
        <span
          className="text-[12px] font-semibold px-3 py-0.5 rounded-full border"
          style={{ background: color + "22", color, borderColor: color + "44" }}
        >{badge}</span>
      </div>
      {score !== null ? (
        <>
          <div className="flex items-baseline gap-1 mb-2">
            <span style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 32, color }}>
              {animated}
            </span>
            <span className="text-sm" style={{ color: "var(--txt-muted)" }}>/ 100</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg3)" }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${pct}%`, background: color }}
            />
          </div>
        </>
      ) : (
        <div style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 32, color: "var(--txt-faint)" }}>
          N/A
        </div>
      )}
    </div>
  );
}

// ── MetricRow ─────────────────────────────────────────────────────────────────
function MetricRow({ label, value, status }: MetricRowProps) {
  const statusColor = { GOOD: "#5DB848", "NEEDS IMPROVEMENT": "#F5C842", POOR: "#E53935" }[status];
  const statusIcon  = { GOOD: "●", "NEEDS IMPROVEMENT": "▲", POOR: "●" }[status];
  return (
    <div
      className="flex items-center justify-between py-2.5"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <span className="text-[13px]" style={{ color: "var(--txt-muted)" }}>{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono font-semibold text-[14px]" style={{ color: "var(--txt)" }}>{value}</span>
        <span className="text-[11px] font-bold" style={{ color: statusColor }}>
          {statusIcon} {status}
        </span>
      </div>
    </div>
  );
}

// ── ScanOverlay ───────────────────────────────────────────────────────────────
function ScanOverlay({ url, onDone }: { url: string; onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [currentCheck, setCurrentCheck] = useState("Iniciando auditoría...");
  const checks = [
    "Conectando con Google CrUX...",
    "Analizando Core Web Vitals...",
    "Auditando SEO técnico...",
    "Mapeando presencia digital...",
    "Consultando Claude AI...",
    "¡Reporte listo!",
  ];
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setProgress(Math.min(i * 18, 98));
      setCurrentCheck(checks[Math.min(i - 1, checks.length - 1)]);
      if (i >= checks.length) {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => setTimeout(onDone, 800), 600);
      }
    }, 420);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center"
      style={{ background: "rgba(10,15,10,0.97)", backdropFilter: "blur(8px)" }}
    >
      <div className="relative w-[220px] h-[220px] mb-10">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-full"
            style={{
              border: "1.5px solid var(--accent)",
              animation: `radarPulse 2.4s ease-out ${i * 0.6}s infinite`,
              opacity: 0,
            }}
          />
        ))}
        <Image
          src="/logo_eda_sin_background.png"
          alt="EDA"
          width={100}
          height={100}
          className="absolute object-contain"
          style={{
            top: "50%", left: "50%",
            animation: "spinSlow 8s linear infinite",
            filter: "brightness(0) invert(1) sepia(1) saturate(3) hue-rotate(70deg)",
          }}
        />
        <div
          className="absolute left-0 right-0 h-0.5 rounded"
          style={{
            background: "linear-gradient(90deg, transparent, var(--accent), transparent)",
            animation: "scanLine 1.8s linear infinite",
          }}
        />
      </div>
      <div className="text-center">
        <div
          className="text-[22px] font-extrabold mb-2"
          style={{ fontFamily: "var(--font-syne)", color: "var(--txt)" }}
        >
          Auditando {url || "tu sitio"}
        </div>
        <div className="font-mono text-[13px] mb-6 min-h-[20px]" style={{ color: "var(--accent)" }}>
          {currentCheck}
        </div>
        <div className="w-[300px] h-1 rounded overflow-hidden mx-auto" style={{ background: "var(--bg3)" }}>
          <div
            className="h-full rounded transition-all duration-300"
            style={{ width: `${progress}%`, background: "var(--accent)" }}
          />
        </div>
        <div className="text-[12px] mt-2" style={{ color: "var(--txt-muted)" }}>{progress}%</div>
      </div>
    </div>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────
const CHAT_SUGGESTIONS = ["¿Cómo mejorar el CLS?", "¿Qué es el LCP?", "Ver competidores"];
const CHAT_RESPONSES: Record<string, string> = {
  "¿Cómo mejorar el CLS?":
    "El CLS de 0.10 está justo en el límite. Causa más común: imágenes sin atributos width/height definidos. Agrega dimensiones explícitas a todas las imágenes y reserva espacio para fuentes (font-display: swap). Puedes bajar a < 0.05 en un día.",
  "¿Qué es el LCP?":
    "LCP (Largest Contentful Paint) mide cuánto tarda en pintarse el elemento visual más grande. Tu LCP de 2.1s es bueno (umbral Google: < 2.5s). Mantén este número.",
  "Ver competidores":
    "El módulo Descubre (Fase 2) detectará negocios en tu categoría con presencia digital débil. Por ahora el reporte se enfoca en tu propio sitio.",
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [theme, setTheme]         = useState<Theme>("dark");
  const [url, setUrl]             = useState("");
  const [scanning, setScanning]   = useState(false);
  const [activeCard, setActiveCard] = useState<"performance" | "seo" | "presencia">("performance");
  const [activeTab, setActiveTab]   = useState<"metrics" | "ai">("metrics");
  const [chatInput, setChatInput]   = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      text: "Analicé tu sitio. Tu LCP de 2.1s es bueno, pero el CLS de 0.10 está en el límite. Revisa imágenes sin dimensiones definidas — pueden estar causando desplazamientos al cargar.",
    },
  ]);
  const [navScrolled, setNavScrolled] = useState(false);
  const [demoRef, demoInView]         = useInView();
  const [metricsRef, metricsInView]   = useInView();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const handler = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleScan = useCallback(() => {
    if (!url.trim()) return;
    setScanning(true);
  }, [url]);

  const handleScanDone = useCallback(() => {
    setScanning(false);
    setTimeout(() => {
      document.getElementById("demo-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, []);

  const handleChat = useCallback(() => {
    if (!chatInput.trim()) return;
    const q = chatInput.trim();
    setChatInput("");
    setChatMessages((m) => [...m, { role: "user", text: q }]);
    setTimeout(() => {
      const answer =
        CHAT_RESPONSES[q] ??
        `Basado en los datos de auditoría, te ayudaré con "${q}". El análisis en tiempo real estará disponible en la versión conectada al backend.`;
      setChatMessages((m) => [...m, { role: "ai", text: answer }]);
    }, 1200);
  }, [chatInput]);

  return (
    <>
      {scanning && <ScanOverlay url={url} onDone={handleScanDone} />}

      {/* ── NAV ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: navScrolled ? "var(--nav-bg)" : "transparent",
          backdropFilter: navScrolled ? "blur(12px)" : "none",
          borderBottom: navScrolled ? "1px solid var(--border-soft)" : "1px solid transparent",
        }}
      >
        <div className="max-w-[1120px] mx-auto px-6 flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-2.5 no-underline">
            <Image
              src="/logo_eda_sin_background.png"
              alt="EDA icon"
              width={28}
              height={28}
              className="object-contain"
              style={{ filter: theme === "dark" ? "none" : "brightness(0)" }}
            />
            <Image
              src="/eda.png"
              alt="EDA"
              width={60}
              height={22}
              className="object-contain"
              style={{ filter: theme === "dark" ? "brightness(0) invert(1)" : "brightness(0)" }}
            />
          </a>

          <div className="hidden md:flex items-center gap-8">
            {["Cómo funciona", "Reporte", "Demo"].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase().replace(" ", "-")}`}
                className="text-[14px] font-medium no-underline transition-colors duration-150"
                style={{ color: "var(--txt-muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--txt)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--txt-muted)")}
              >{l}</a>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              className="text-[13px] px-3 py-1.5 rounded-lg border transition-all duration-150"
              style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--txt-muted)" }}
              title="Cambiar tema"
            >
              {theme === "dark" ? "☀" : "☾"}
            </button>
            <button
              className="text-[13px] font-medium px-4 py-2 rounded-lg border transition-all duration-150"
              style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--txt)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg3)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >Iniciar sesión</button>
            <button
              onClick={() => document.getElementById("hero-input")?.focus()}
              className="text-[13px] font-semibold px-4 py-2 rounded-lg border-none transition-all duration-150"
              style={{ background: "var(--accent)", color: "#fff", boxShadow: "0 0 16px var(--accent-glow)" }}
              onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
            >Auditar gratis →</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="min-h-screen flex items-center relative overflow-hidden"
        style={{ background: "var(--bg)", paddingTop: 64 }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, var(--txt-faint) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
            opacity: theme === "dark" ? 0.35 : 0.2,
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 60% 60% at 50% 40%, var(--accent-glow) 0%, transparent 70%)` }}
        />
        <Image
          src="/logo_eda_sin_background.png"
          alt=""
          width={340}
          height={340}
          className="float-icon absolute pointer-events-none object-contain"
          style={{
            right: "-2%", top: "50%",
            opacity: theme === "dark" ? 0.08 : 0.05,
            filter: theme === "dark" ? "none" : "brightness(0)",
          }}
        />

        <div className="max-w-[1120px] mx-auto px-6 w-full relative z-10">
          <div className="max-w-[680px] fade-up">
            <div
              className="inline-flex items-center gap-2 text-[13px] font-medium px-4 py-1.5 rounded-full mb-8 border"
              style={{ background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--txt-muted)" }}
            >
              <span style={{ color: "var(--accent)", fontSize: 10 }}>●</span>
              Beta · Primeros 500 usuarios con auditorías gratis
            </div>

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
                  background: `linear-gradient(135deg, var(--accent), var(--accent2))`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >crees que sí?</span>
            </h1>

            <p
              className="mb-10 max-w-[560px]"
              style={{ fontSize: "clamp(15px, 1.4vw, 18px)", color: "var(--txt-muted)", lineHeight: 1.65 }}
            >
              EDA audita tu presencia digital en segundos. Detecta qué está fallando, descubre oportunidades en tu mercado y alcanza más clientes — impulsado por IA.
            </p>

            <div
              className="flex items-stretch rounded-xl overflow-hidden mb-5 max-w-[560px]"
              style={{ background: "var(--bg2)", border: "1px solid var(--border)", boxShadow: "0 0 32px var(--accent-glow)" }}
            >
              <span
                className="flex items-center px-3.5 font-mono text-[14px] whitespace-nowrap"
                style={{ color: "var(--txt-faint)", background: "var(--bg3)", borderRight: "1px solid var(--border)" }}
              >https://</span>
              <input
                id="hero-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScan()}
                placeholder="tunegocio.com"
                className="flex-1 bg-transparent border-none outline-none text-[15px]"
                style={{ color: "var(--txt)", fontFamily: "var(--font-dm-sans)", padding: "14px 16px" }}
              />
              <button
                onClick={handleScan}
                className="border-none text-[15px] font-semibold px-6 whitespace-nowrap transition-all duration-150"
                style={{ background: "var(--accent)", color: "#fff" }}
                onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
              >Auditar →</button>
            </div>

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

      {/* ── POWERED BY ── */}
      <div
        style={{
          background: "var(--bg2)",
          borderTop: "1px solid var(--border-soft)",
          borderBottom: "1px solid var(--border-soft)",
          padding: "18px 24px",
        }}
      >
        <div className="max-w-[1120px] mx-auto flex items-center gap-6 flex-wrap justify-center">
          <span className="text-[13px] font-medium" style={{ color: "var(--txt-faint)" }}>Tecnología de:</span>
          {["Google CrUX", "DataForSEO", "Anthropic Claude", "Core Web Vitals"].map((tech, i) => (
            <span key={tech} className="flex items-center gap-6">
              {i > 0 && <span style={{ color: "var(--txt-faint)", opacity: 0.4 }}>·</span>}
              <span className="text-[13px] font-medium" style={{ color: "var(--txt-muted)" }}>{tech}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── DEMO REPORTE ── */}
      <section
        id="demo-section"
        ref={demoRef}
        style={{ background: "var(--bg)", padding: "96px 24px" }}
      >
        <div className="max-w-[1120px] mx-auto">
          <div
            className="mb-12 transition-all duration-700"
            style={{ opacity: demoInView ? 1 : 0, transform: demoInView ? "translateY(0)" : "translateY(24px)" }}
          >
            <div
              className="inline-block text-[12px] font-bold tracking-[0.08em] uppercase px-3 py-1 rounded-full mb-4 border"
              style={{ background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--accent)" }}
            >Vista Previa</div>
            <h2
              className="font-extrabold"
              style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(28px, 3.5vw, 48px)", letterSpacing: "-1.5px", color: "var(--txt)" }}
            >Así luce un reporte EDA</h2>
          </div>

          <div
            className="grid gap-6 transition-opacity duration-700"
            style={{ gridTemplateColumns: "320px 1fr", opacity: demoInView ? 1 : 0 }}
          >
            <div className="flex flex-col gap-3">
              <ScoreCard label="Performance" score={80} color="var(--accent)"  badge="Buena base"      active={activeCard === "performance"} onClick={() => setActiveCard("performance")} started={demoInView} />
              <ScoreCard label="SEO"         score={50} color="var(--accent3)" badge="Necesita mejoras" active={activeCard === "seo"}         onClick={() => setActiveCard("seo")}         started={demoInView} />
              <ScoreCard label="Presencia"   score={null} color="var(--txt-faint)" badge="Próximamente" active={activeCard === "presencia"}   onClick={() => setActiveCard("presencia")}   started={demoInView} />
            </div>

            <div
              className="rounded-2xl overflow-hidden min-h-[380px]"
              style={{ background: "var(--bg2)", border: "1px solid var(--border)" }}
            >
              <div className="flex" style={{ borderBottom: "1px solid var(--border)" }}>
                {(["metrics", "ai"] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className="flex-1 py-3.5 bg-transparent border-none text-[14px] font-semibold cursor-pointer transition-all duration-150"
                    style={{
                      borderBottom: activeTab === key ? `2px solid var(--accent)` : "2px solid transparent",
                      color: activeTab === key ? "var(--txt)" : "var(--txt-muted)",
                      fontFamily: "var(--font-dm-sans)",
                    }}
                  >
                    {key === "metrics" ? "📊 Métricas" : "🤖 EDA AI"}
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
                      {[["Domain Authority", "Media"], ["HTTPS", "✓ Activo"], ["Sitemap", "✓ Detectado"]].map(([k, v]) => (
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
                    <div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-4">
                      {chatMessages.map((msg, i) => (
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
                    <div className="flex gap-2">
                      <input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleChat()}
                        placeholder="Pregunta algo sobre tu sitio..."
                        className="flex-1 rounded-lg px-3 py-2 text-[13px] outline-none"
                        style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--txt)", fontFamily: "var(--font-dm-sans)" }}
                      />
                      <button
                        onClick={handleChat}
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

      {/* ── CÓMO FUNCIONA ── */}
      <section
        id="cómo-funciona"
        style={{ background: "var(--bg2)", padding: "96px 24px", borderTop: "1px solid var(--border-soft)" }}
      >
        <div className="max-w-[1120px] mx-auto">
          <div className="text-center mb-16">
            <h2
              className="font-extrabold"
              style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(28px, 3.5vw, 48px)", letterSpacing: "-1.5px", color: "var(--txt)" }}
            >Tres pasos. Resultados reales.</h2>
          </div>
          <div className="grid grid-cols-3">
            {[
              { num: "01", label: "EVALÚA",    color: "var(--accent)",  title: "Auditoría automática",    desc: "Performance + SEO + Presencia en segundos. Sin configuración, sin esperas." },
              { num: "02", label: "DESCUBRE",  color: "var(--accent2)", title: "Inteligencia competitiva", desc: "Mapea tu mercado y encuentra oportunidades que tu competencia no está aprovechando." },
              { num: "03", label: "ALCANZA",   color: "var(--accent3)", title: "Outreach con IA",          desc: "Convierte oportunidades en clientes con mensajes personalizados generados por IA." },
            ].map((item, i) => (
              <div
                key={i}
                className="relative p-10"
                style={{ borderRight: i < 2 ? "1px solid var(--border)" : "none" }}
              >
                <div className="flex items-baseline gap-3 mb-5">
                  <span className="font-extrabold text-[13px] tracking-[0.12em]" style={{ fontFamily: "var(--font-syne)", color: item.color }}>{item.num} ·</span>
                  <span className="font-extrabold text-[13px] tracking-[0.12em]" style={{ fontFamily: "var(--font-syne)", color: item.color }}>{item.label}</span>
                </div>
                <h3 className="font-extrabold text-[22px] mb-3" style={{ fontFamily: "var(--font-syne)", letterSpacing: "-0.5px", color: "var(--txt)" }}>{item.title}</h3>
                <p className="text-[15px] leading-[1.65]" style={{ color: "var(--txt-muted)" }}>{item.desc}</p>
                <div className="absolute bottom-0 left-10 w-10 h-0.5 rounded" style={{ background: item.color }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MÉTRICAS DE IMPACTO ── */}
      <section
        ref={metricsRef}
        style={{ background: "var(--bg)", padding: "96px 24px", borderTop: "1px solid var(--border-soft)" }}
      >
        <div className="max-w-[1120px] mx-auto">
          <div className="grid grid-cols-4">
            {[
              { value: "40+",  label: "Factores SEO analizados", color: "var(--accent)"  },
              { value: "<30s", label: "Tiempo de resultado",      color: "var(--accent2)" },
              { value: "CWV",  label: "Core Web Vitals nativos",  color: "var(--accent3)" },
              { value: "AI",   label: "Impulsado por Claude",     color: "var(--accent)"  },
            ].map((item, i) => (
              <div
                key={i}
                className="text-center py-10 px-5 transition-all duration-500"
                style={{
                  borderRight: i < 3 ? "1px solid var(--border)" : "none",
                  opacity: metricsInView ? 1 : 0,
                  transform: metricsInView ? "translateY(0)" : "translateY(20px)",
                  transitionDelay: `${i * 120}ms`,
                }}
              >
                <div
                  className="font-extrabold mb-2"
                  style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(32px, 4vw, 56px)", letterSpacing: "-2px", color: item.color }}
                >{item.value}</div>
                <div className="text-[14px]" style={{ color: "var(--txt-muted)" }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section
        className="text-center relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, var(--bg2) 0%, var(--bg) 100%)`,
          padding: "120px 24px",
          borderTop: "1px solid var(--border-soft)",
        }}
      >
        <Image
          src="/logo_eda_sin_background.png"
          alt=""
          width={480}
          height={480}
          className="absolute object-contain pointer-events-none"
          style={{
            left: "50%", top: "50%", transform: "translate(-50%, -50%)",
            opacity: theme === "dark" ? 0.03 : 0.04,
            filter: theme === "dark" ? "none" : "brightness(0)",
          }}
        />
        <div className="relative z-10">
          <h2
            className="font-extrabold mb-4"
            style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(32px, 5vw, 64px)", letterSpacing: "-2px", color: "var(--txt)" }}
          >
            Audita tu sitio.<br />
            <span style={{ color: "var(--accent)" }}>Es gratis.</span>
          </h2>
          <p className="text-[16px] mb-10" style={{ color: "var(--txt-muted)" }}>
            Sin tarjeta de crédito. Resultado en 30 segundos.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="border-none rounded-xl text-[16px] font-bold cursor-pointer transition-all duration-150"
              style={{ background: "var(--accent)", color: "#fff", padding: "16px 36px", boxShadow: "0 4px 32px var(--accent-glow)", fontFamily: "var(--font-dm-sans)" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >Auditar mi sitio →</button>
            <button
              className="rounded-xl text-[16px] font-semibold cursor-pointer transition-all duration-150"
              style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--txt)", padding: "16px 36px", fontFamily: "var(--font-dm-sans)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg3)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >Ver demo</button>
          </div>
        </div>
      </section>

      {/* ── FOOTER BAR ── */}
      <footer style={{ background: "var(--bg)", borderTop: "1px solid var(--border-soft)", padding: "24px" }}>
        <div className="max-w-[1120px] mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo_eda_sin_background.png" alt="EDA" width={22} height={22} className="object-contain" style={{ filter: theme === "dark" ? "none" : "brightness(0)" }} />
            <Image src="/eda.png" alt="EDA" width={48} height={16} className="object-contain" style={{ filter: theme === "dark" ? "brightness(0) invert(1)" : "brightness(0)" }} />
          </div>
          <span className="text-[13px]" style={{ color: "var(--txt-faint)" }}>© 2025 EDA · Evalúa. Descubre. Alcanza.</span>
          <div className="flex gap-5">
            {["Privacidad", "Términos", "Contacto"].map((l) => (
              <a
                key={l}
                href="#"
                className="text-[13px] no-underline transition-colors duration-150"
                style={{ color: "var(--txt-faint)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--txt-muted)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--txt-faint)")}
              >{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
