"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { readFreeReport, FREE_REPORT_KEY } from "@/lib/audit";

const G    = "#5DB848";
const Gs   = "rgba(93,184,72,0.12)";
const Gb   = "rgba(93,184,72,0.35)";
const BORDER = "rgba(255,255,255,0.07)";

const BREADCRUMB_LABELS: Record<string, string> = {
  "/dashboard":                   "Resumen",
  "/dashboard/posicionamiento":   "Posicionamiento",
  "/dashboard/sitio-web":         "Sitio web",
  "/dashboard/perfil-google":     "Mi perfil de Google",
  "/dashboard/investigacion-mercado": "Investigación de mercado",
  "/dashboard/prospectos":        "Prospectos",
  "/dashboard/automatizaciones":  "Automatizaciones",
  "/dashboard/historial":         "Historial",
  "/dashboard/configuracion":     "Configuración",
};

interface Props {
  onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: Props) {
  const pathname = usePathname();
  const [freeReportUsed, setFreeReportUsed] = useState(false);
  const [businessName, setBusinessName] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(FREE_REPORT_KEY);
    if (stored) {
      setFreeReportUsed(true);
      const r = readFreeReport();
      if (r) setBusinessName(r.formData.businessName);
    }
  }, []);

  const pageLabel = BREADCRUMB_LABELS[pathname] ?? "Dashboard";

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(10,10,10,0.92)", backdropFilter: "blur(12px)",
      borderBottom: `1px solid ${BORDER}`,
      padding: "0 24px", height: 60,
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
    }}>
      {/* Left: hamburger (mobile) + breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        {/* Hamburger — solo mobile */}
        <button
          onClick={onMenuClick}
          aria-label="Abrir menú de navegación"
          className="dashboard-hamburger"
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(255,255,255,0.55)", padding: 4,
            display: "flex", alignItems: "center",
          }}
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Link href="/dashboard" style={{
            fontFamily: "var(--font-inter), sans-serif", fontSize: 13,
            color: "rgba(255,255,255,0.4)", textDecoration: "none",
            transition: "color 0.15s",
          }}>
            EDA
          </Link>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>›</span>
          {businessName && (
            <>
              <span style={{
                fontFamily: "var(--font-inter), sans-serif", fontSize: 13,
                color: "rgba(255,255,255,0.4)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                maxWidth: 140,
              }}>
                {businessName}
              </span>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>›</span>
            </>
          )}
          <span style={{
            fontFamily: "var(--font-inter), sans-serif", fontSize: 13,
            color: "#fff", fontWeight: 500,
          }}>
            {pageLabel}
          </span>
        </nav>
      </div>

      {/* Right: Nueva búsqueda */}
      {freeReportUsed ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span style={{
            fontFamily: "var(--font-inter), sans-serif", fontSize: 12,
            color: "rgba(255,255,255,0.28)",
          }}
          className="dashboard-hint"
          >
            Crea una cuenta para más reportes
          </span>
          <button
            disabled
            style={{
              padding: "6px 14px", borderRadius: 8,
              background: "rgba(255,255,255,0.02)", border: `1px solid ${BORDER}`,
              color: "rgba(255,255,255,0.18)",
              fontFamily: "var(--font-inter), sans-serif", fontSize: 13,
              cursor: "not-allowed", flexShrink: 0,
            }}
          >
            + Nueva búsqueda
          </button>
        </div>
      ) : (
        <Link
          href="/dashboard"
          style={{
            padding: "6px 14px", borderRadius: 8,
            background: Gs, border: `1px solid ${Gb}`,
            color: G,
            fontFamily: "var(--font-inter), sans-serif", fontSize: 13, fontWeight: 500,
            textDecoration: "none", flexShrink: 0,
            transition: "all 0.15s",
          }}
        >
          + Nueva búsqueda
        </Link>
      )}
    </header>
  );
}
