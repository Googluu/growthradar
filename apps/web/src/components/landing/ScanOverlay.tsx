"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

// Pasos que se muestran mientras el backend procesa (~30-50s)
const INTRO_STEPS = [
  "Conectando con Google CrUX...",
  "Analizando Core Web Vitals...",
  "Auditando SEO técnico...",
  "Mapeando presencia digital...",
  "Consultando Claude AI...",
];

// Mensajes que rotan mientras esperamos al backend (después de los intro steps)
const WAITING_STEPS = [
  "Consultando Claude AI...",
  "Procesando recomendaciones...",
  "Analizando métricas avanzadas...",
  "Casi listo...",
];

interface Props {
  url: string;
  ready: boolean;   // true cuando el backend ya respondió con resultado
  onDone: () => void;
}

export function ScanOverlay({ url, ready, onDone }: Props) {
  const [progress, setProgress]     = useState(0);
  const [currentStep, setCurrentStep] = useState("Iniciando auditoría...");
  const [phase, setPhase]           = useState<"intro" | "waiting" | "done">("intro");

  const waitingIdx = useRef(0);
  const doneTriggered = useRef(false);

  // Fase 1: intro — avanza rápido por los pasos iniciales (~2.5s)
  useEffect(() => {
    if (phase !== "intro") return;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setProgress(Math.min(i * 18, 90));
      setCurrentStep(INTRO_STEPS[Math.min(i - 1, INTRO_STEPS.length - 1)]);
      if (i >= INTRO_STEPS.length) {
        clearInterval(iv);
        setPhase("waiting");
      }
    }, 420);
    return () => clearInterval(iv);
  }, [phase]);

  // Fase 2: waiting — rota mensajes cada 3s mientras el backend trabaja
  useEffect(() => {
    if (phase !== "waiting") return;
    waitingIdx.current = 0;
    setCurrentStep(WAITING_STEPS[0]);

    const iv = setInterval(() => {
      waitingIdx.current = (waitingIdx.current + 1) % WAITING_STEPS.length;
      setCurrentStep(WAITING_STEPS[waitingIdx.current]);
    }, 3000);
    return () => clearInterval(iv);
  }, [phase]);

  // Cuando el backend señala que está listo → fase done
  useEffect(() => {
    if (!ready || phase === "done" || doneTriggered.current) return;
    doneTriggered.current = true;
    setPhase("done");
    setCurrentStep("¡Reporte listo!");
    setProgress(100);
    // Breve pausa para que el usuario vea el 100% antes de cerrar
    const t = setTimeout(() => onDone(), 900);
    return () => clearTimeout(t);
  // onDone es estable (useCallback), incluirla es seguro
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, phase]);

  return (
    <div
      className="fixed inset-0 z-1000 flex flex-col items-center justify-center"
      style={{ background: "rgba(10,15,10,0.97)", backdropFilter: "blur(8px)" }}
    >
      {/* Radar rings */}
      <div className="relative w-55 h-55 mb-10">
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
            transform: "translate(-50%, -50%)",
            animation: phase === "done" ? "none" : "spinSlow 8s linear infinite",
            filter: "brightness(0) invert(1) sepia(1) saturate(3) hue-rotate(70deg)",
          }}
          loading="eager"
        />
        {/* Scan line — se oculta en fase done */}
        {phase !== "done" && (
          <div
            className="absolute left-0 right-0 h-0.5 rounded"
            style={{
              background: "linear-gradient(90deg, transparent, var(--accent), transparent)",
              animation: "scanLine 1.8s linear infinite",
            }}
          />
        )}
      </div>

      <div className="text-center">
        <div
          className="text-[22px] font-extrabold mb-2"
          style={{ fontFamily: "var(--font-syne)", color: "var(--txt)" }}
        >
          {phase === "done" ? "¡Listo!" : `Auditando ${url}`}
        </div>
        <div className="font-mono text-[13px] mb-6 min-h-5" style={{ color: "var(--accent)" }}>
          {currentStep}
        </div>
        <div className="w-75 h-1 rounded overflow-hidden mx-auto" style={{ background: "var(--bg3)" }}>
          <div
            className="h-full rounded transition-all duration-500"
            style={{ width: `${progress}%`, background: "var(--accent)" }}
          />
        </div>
        <div className="text-[12px] mt-2" style={{ color: "var(--txt-muted)" }}>{progress}%</div>
        {phase === "waiting" && (
          <div className="text-[12px] mt-4" style={{ color: "var(--txt-faint)", fontFamily: "var(--font-dm-sans)" }}>
            El análisis tarda ~30–45 segundos · Puedes esperar aquí
          </div>
        )}
      </div>
    </div>
  );
}
