"use client";

import { useState, useEffect } from "react";
import { readFreeReport } from "@/lib/audit";
import type { LabsData, KeywordData } from "@/types/dashboard";
import { KeywordResearchSection } from "@/components/dashboard/KeywordResearchSection";
import { GoogleAdsVolumeSection } from "@/components/dashboard/GoogleAdsVolumeSection";
import { EmptySection } from "@/components/dashboard/EmptySection";

const G  = "#5DB848";
const Gs = "rgba(93,184,72,0.12)";

type Tab = "labs" | "keyword_data";

export default function InvestigacionMercadoPage() {
  const [tab,         setTab]         = useState<Tab>("labs");
  const [labs,        setLabs]        = useState<LabsData | null>(null);
  const [keywordData, setKeywordData] = useState<KeywordData | null>(null);
  const [loaded,      setLoaded]      = useState(false);

  useEffect(() => {
    const report = readFreeReport();
    if (report?.auditResult?.sections) {
      const s = report.auditResult.sections;
      if (s.labs         && !("error" in s.labs))         setLabs(s.labs as LabsData);
      if (s.keyword_data && !("error" in s.keyword_data)) setKeywordData(s.keyword_data as KeywordData);
    }
    setLoaded(true);
  }, []);

  if (!loaded) return null;
  if (!labs && !keywordData) {
    return (
      <EmptySection
        icon="📊"
        title="Investigación de mercado"
        description="Ejecuta un análisis desde la pantalla principal para ver términos relacionados y volumen de búsqueda en Google Ads."
        hint="Términos relacionados · Volumen de búsqueda"
      />
    );
  }

  const tabs: Array<{ id: Tab; label: string; available: boolean }> = [
    { id: "labs",        label: "Términos relacionados", available: !!labs        },
    { id: "keyword_data",label: "Volumen de búsqueda",  available: !!keywordData },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Tab bar */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
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

      {tab === "labs"         && labs        && <KeywordResearchSection data={labs}/>}
      {tab === "keyword_data" && keywordData && <GoogleAdsVolumeSection data={keywordData}/>}
    </div>
  );
}
