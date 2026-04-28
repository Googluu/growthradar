"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Nav }            from "@/components/landing/Nav";
import { Hero }           from "@/components/landing/Hero";
import { ScanOverlay }    from "@/components/landing/ScanOverlay";
import { PoweredByStrip } from "@/components/landing/PoweredByStrip";
import { DemoReport }     from "@/components/landing/DemoReport";
import { HowItWorks }     from "@/components/landing/HowItWorks";
import { ImpactMetrics }  from "@/components/landing/ImpactMetrics";
import { FooterCTA }      from "@/components/landing/FooterCTA";
import { FooterBar }      from "@/components/landing/FooterBar";
import type { AuditResult } from "@/types/audit";

// ── CTA helpers ───────────────────────────────────────────────────────────────
function focusHeroInput() {
  window.scrollTo({ top: 0, behavior: "smooth" });
  setTimeout(() => document.getElementById("hero-input")?.focus(), 400);
}

function scrollToDemo() {
  document.getElementById("demo-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ── Mock audit (reemplazar con POST /api/audit cuando Railway esté listo) ─────
const DEMO_AUDIT: AuditResult = {
  url: "dian.gov.co",
  scores: { overall: 80, performance: 80, seo: 50 },
  ai_summary:
    "Tu sitio tiene una base técnica sólida — velocidad de carga en el top 20% para Colombia. " +
    "Sin embargo, estás dejando dinero sobre la mesa: sin meta description, sin H1, " +
    "y un CLS crítico que afecta la experiencia móvil. Con 44,868 keywords posicionadas " +
    "y tráfico estimado de $6.1M USD, una optimización SEO básica podría triplicar tu " +
    "visibilidad en 60 días.",
  metrics: [
    { label: "LCP",  value: "1.4s",  status: "good",              barPct: 88 },
    { label: "FCP",  value: "1.2s",  status: "good",              barPct: 92 },
    { label: "INP",  value: "62ms",  status: "good",              barPct: 94 },
    { label: "TTFB", value: "439ms", status: "needs_improvement", barPct: 56 },
    { label: "CLS",  value: "0.33",  status: "poor",              barPct: 22 },
  ],
  checks: [
    { ok: true,  label: "HTTPS activo" },
    { ok: false, label: "Sin meta description" },
    { ok: false, label: "Sin etiqueta H1" },
    { ok: false, label: "Sin sitemap.xml" },
    { ok: false, label: "Sin robots.txt" },
    { ok: true,  label: "Dominio con autoridad (DA alta)" },
  ],
  domain_stats: [
    { val: "44,868", lbl: "Keywords" },
    { val: "3,639",  lbl: "Posición #1" },
    { val: "$6.1M",  lbl: "Tráfico ETV" },
    { val: "Alto",   lbl: "Potencial" },
  ],
  recommendations: [
    {
      badge:   "QUICK WIN · ALTO IMPACTO",
      title:   "Agrega meta description a todas las páginas",
      problem: "El 100% de tus páginas carecen de meta description. Google genera snippets automáticos que reducen el CTR orgánico de forma significativa.",
      action:  "Escribe una meta description única de 150–160 caracteres por página principal con tu keyword objetivo y una llamada a la acción clara.",
      impact:  "+15–30% CTR en búsquedas",
      effort:  "2–4 horas",
      accent:  "#5DB848",
    },
    {
      badge:   "QUICK WIN · ALTO IMPACTO",
      title:   "Implementa etiquetas H1 en cada página",
      problem: "Sin H1 visible, los motores de búsqueda no pueden determinar el tema principal de cada página y penalizan tu relevancia semántica.",
      action:  "Agrega un H1 único y descriptivo por página que incluya la keyword principal. Solo debe haber un H1 por URL.",
      impact:  "+20% relevancia semántica",
      effort:  "1–2 horas",
      accent:  "#A3C94A",
    },
    {
      badge:   "ESTRATÉGICO · CRÍTICO",
      title:   "Corrige el Cumulative Layout Shift (CLS: 0.33)",
      problem: "Tu CLS está en zona POBRE (umbral: 0.1). Elementos visuales saltan mientras carga la página, lo que aumenta el rebote en móvil y afecta el ranking.",
      action:  "Reserva dimensiones explícitas para imágenes, embeds y anuncios. Evita insertar contenido sobre texto existente durante la carga.",
      impact:  "Mejora directa Core Web Vitals",
      effort:  "1–2 días dev",
      accent:  "#F5C842",
    },
  ],
};

function fetchAudit(url: string): Promise<AuditResult> {
  // Cuando Railway esté listo: return fetch("/api/audit", { method: "POST", body: JSON.stringify({ url }) }).then(r => r.json())
  return new Promise((r) => setTimeout(() => r({ ...DEMO_AUDIT, url }), 2500));
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [url, setUrl]                 = useState("");
  const [scanning, setScanning]       = useState(false);
  const [reportData, setReportData]   = useState<AuditResult | null>(null);

  // Guarda la Promise del fetch activo; handleScanDone la espera si no resolvió aún
  const pendingFetch = useRef<Promise<AuditResult> | null>(null);

  useEffect(() => {
    const handler = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleScan = useCallback(() => {
    if (!url.trim()) return;
    setScanning(true);
    pendingFetch.current = fetchAudit(url);
  }, [url]);

  // Llamado por ScanOverlay cuando su animación termina (~4s).
  // Si el backend todavía no respondió, mantiene el overlay abierto hasta que resuelva.
  const handleScanDone = useCallback(async () => {
    let result: AuditResult | null = null;
    if (pendingFetch.current) {
      result = await pendingFetch.current;
      pendingFetch.current = null;
    }
    setScanning(false);
    if (result) setReportData(result);
    scrollToDemo();
  }, []);

  return (
    <>
      {scanning && <ScanOverlay url={url} onDone={handleScanDone} />}

      <Nav scrolled={navScrolled} onAuditClick={focusHeroInput} />

      <Hero url={url} onUrlChange={setUrl} onScan={handleScan} />

      <PoweredByStrip />

      <DemoReport reportData={reportData} url={url} onUrlChange={setUrl} onScan={handleScan} />

      <HowItWorks />

      <ImpactMetrics />

      <FooterCTA onAuditClick={focusHeroInput} onDemoClick={scrollToDemo} />

      <FooterBar />
    </>
  );
}
