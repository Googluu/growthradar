"use client";

import { useState, useEffect } from "react";
import { readFreeReport } from "@/lib/audit";
import type { OnPageData, CrUXData } from "@/types/dashboard";
import { OnPageAuditSection } from "@/components/dashboard/OnPageAuditSection";
import { CoreWebVitalsSection } from "@/components/dashboard/CoreWebVitalsSection";
import { EmptySection } from "@/components/dashboard/EmptySection";

const G  = "#5DB848";
const Gs = "rgba(93,184,72,0.12)";
const Gb = "rgba(93,184,72,0.35)";

type Tab = "onpage" | "crux";

export default function SitioWebPage() {
  const [tab,     setTab]     = useState<Tab>("onpage");
  const [onpage,  setOnpage]  = useState<OnPageData | null>(null);
  const [crux,    setCrux]    = useState<CrUXData | null>(null);
  const [loaded,  setLoaded]  = useState(false);

  useEffect(() => {
    const report = readFreeReport();
    if (report?.auditResult?.sections) {
      const s = report.auditResult.sections;
      if (s.onpage && !("error" in s.onpage)) setOnpage(s.onpage as OnPageData);
      if (s.crux   && !("error" in s.crux))   setCrux(s.crux as CrUXData);
    }
    setLoaded(true);
  }, []);

  if (!loaded) return null;
  if (!onpage && !crux) {
    return (
      <EmptySection
        icon="🌐"
        title="Auditoría de tu sitio web"
        description="Ejecuta un análisis desde la pantalla principal para ver la auditoría técnica y los Core Web Vitals de tu sitio."
        hint="Auditoría técnica · Velocidad real (CrUX)"
      />
    );
  }

  const tabs: Array<{ id: Tab; label: string; available: boolean }> = [
    { id: "onpage", label: "Auditoría técnica", available: !!onpage },
    { id: "crux",   label: "Velocidad real",    available: !!crux  },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Tab bar */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: 0 }}>
        {tabs.map(t => (
          <button key={t.id}
            onClick={() => t.available && setTab(t.id)}
            style={{
              padding: "10px 20px", borderRadius: "10px 10px 0 0",
              border: "none", cursor: t.available ? "pointer" : "not-allowed",
              background: tab === t.id ? Gs : "transparent",
              borderBottom: tab === t.id ? `2px solid ${G}` : "2px solid transparent",
              color: tab === t.id ? G : t.available ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)",
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 14, fontWeight: 600,
              opacity: t.available ? 1 : 0.5,
              transition: "all 0.15s",
            }}>
            {t.label}
            {!t.available && <span style={{ fontSize: 10, marginLeft: 6, opacity: 0.6 }}>sin datos</span>}
          </button>
        ))}
      </div>

      {tab === "onpage" && onpage  && <OnPageAuditSection data={onpage}/>}
      {tab === "crux"   && crux    && <CoreWebVitalsSection data={crux}/>}
    </div>
  );
}
