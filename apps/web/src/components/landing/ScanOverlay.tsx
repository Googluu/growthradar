"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const SCAN_STEPS = [
  "Conectando con Google CrUX...",
  "Analizando Core Web Vitals...",
  "Auditando SEO técnico...",
  "Mapeando presencia digital...",
  "Consultando Claude AI...",
  "¡Reporte listo!",
];

interface Props {
  url: string;
  onDone: () => void;
}

export function ScanOverlay({ url, onDone }: Props) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("Iniciando auditoría...");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setProgress(Math.min(i * 18, 98));
      setCurrentStep(SCAN_STEPS[Math.min(i - 1, SCAN_STEPS.length - 1)]);
      if (i >= SCAN_STEPS.length) {
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
      {/* Radar rings */}
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
        {/* Scan line */}
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
          Auditando {url}
        </div>
        <div className="font-mono text-[13px] mb-6 min-h-[20px]" style={{ color: "var(--accent)" }}>
          {currentStep}
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
