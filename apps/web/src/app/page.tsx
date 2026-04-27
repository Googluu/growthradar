"use client";

import { useState, useEffect, useCallback } from "react";
import { Nav }            from "@/components/landing/Nav";
import { Hero }           from "@/components/landing/Hero";
import { ScanOverlay }    from "@/components/landing/ScanOverlay";
import { PoweredByStrip } from "@/components/landing/PoweredByStrip";
import { DemoReport }     from "@/components/landing/DemoReport";
import { HowItWorks }     from "@/components/landing/HowItWorks";
import { ImpactMetrics }  from "@/components/landing/ImpactMetrics";
import { FooterCTA }      from "@/components/landing/FooterCTA";
import { FooterBar }      from "@/components/landing/FooterBar";

// ── CTA helpers ───────────────────────────────────────────────────────────────
function focusHeroInput() {
  window.scrollTo({ top: 0, behavior: "smooth" });
  setTimeout(() => document.getElementById("hero-input")?.focus(), 400);
}

function scrollToDemo() {
  document.getElementById("demo-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [url, setUrl]                 = useState("");
  const [scanning, setScanning]       = useState(false);

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
    scrollToDemo();
  }, []);

  return (
    <>
      {scanning && <ScanOverlay url={url} onDone={handleScanDone} />}

      <Nav scrolled={navScrolled} onAuditClick={focusHeroInput} />

      <Hero url={url} onUrlChange={setUrl} onScan={handleScan} />

      <PoweredByStrip />

      <DemoReport />

      <HowItWorks />

      <ImpactMetrics />

      <FooterCTA onAuditClick={focusHeroInput} onDemoClick={scrollToDemo} />

      <FooterBar />
    </>
  );
}
