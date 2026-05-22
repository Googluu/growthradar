"use client";

import { C, IconWarn, IconExternal } from "./shared";

export function NoDataFallback() {
  return (
    <div style={{
      padding: 40, textAlign: "center" as const, borderRadius: 16,
      background: `linear-gradient(180deg, rgba(255,164,0,0.05), ${C.card})`,
      border: "1px solid rgba(255,164,0,0.25)",
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        background: "rgba(255,164,0,0.15)",
        border: "1px solid rgba(255,164,0,0.4)",
        color: C.cwvAmber,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        marginBottom: 18,
      }}>
        <IconWarn size={30}/>
      </div>
      <h2 style={{
        fontFamily: "var(--font-syne), sans-serif", fontWeight: 700,
        fontSize: 22, color: C.text, letterSpacing: "-0.01em", marginBottom: 10,
      }}>
        Sin datos reales de usuarios
      </h2>
      <p style={{
        fontSize: 14, color: C.text2, lineHeight: 1.6,
        maxWidth: 540, margin: "0 auto 18px",
      }}>
        Este sitio no tiene suficiente tráfico en Chrome para reportar datos reales de UX.
        Mostramos métricas sintéticas del crawler como fallback.
      </p>
      <button style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        background: C.cwvAmber, color: C.bg, border: "none",
        fontWeight: 700, fontSize: 13, padding: "10px 18px",
        borderRadius: 9, cursor: "pointer",
        fontFamily: "var(--font-inter), sans-serif",
      }}>
        Ver métricas sintéticas (Lighthouse) <IconExternal size={13}/>
      </button>
    </div>
  );
}
