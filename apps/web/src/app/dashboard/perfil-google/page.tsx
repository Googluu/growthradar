"use client";

import { useState, useEffect } from "react";
import { fetchBusinessProfile, getCachedBusinessProfile } from "@/lib/audit";
import type { BusinessProfileData } from "@/types/dashboard";
import { BusinessProfileSection } from "@/components/dashboard/BusinessProfileSection";

const G  = "#5DB848";
const Gs = "rgba(93,184,72,0.12)";
const Gb = "rgba(93,184,72,0.35)";

const COUNTRIES = [
  { label: "Colombia 🇨🇴",   code: 2170 },
  { label: "México 🇲🇽",     code: 2484 },
  { label: "Perú 🇵🇪",       code: 2604 },
  { label: "Chile 🇨🇱",      code: 2152 },
  { label: "Argentina 🇦🇷",  code: 2032 },
  { label: "Ecuador 🇪🇨",    code: 2218 },
  { label: "España 🇪🇸",     code: 2724 },
];

export default function PerfilGooglePage() {
  const [showForm, setShowForm] = useState(false);
  const [query,    setQuery]    = useState("");
  const [country,  setCountry]  = useState(2170);
  const [loading,  setLoading]  = useState(false);
  const [errMsg,   setErrMsg]   = useState("");
  const [result,   setResult]   = useState<BusinessProfileData | null>(null);
  const [focused,  setFocused]  = useState(false);
  const [loaded,   setLoaded]   = useState(false);

  // ✅ FIX Bug D: lee del cache PRIMERO antes de mostrar el form
  useEffect(() => {
    const cached = getCachedBusinessProfile();
    if (cached) {
      setResult(cached);
    } else {
      setShowForm(true);
    }
    setLoaded(true);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setErrMsg("");
    setResult(null);
    try {
      const data = await fetchBusinessProfile(q, country);
      setResult(data);
      setShowForm(false);
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Error al buscar perfil");
    } finally {
      setLoading(false);
    }
  };

  if (!loaded) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "0 24px 60px" }}>

      {/* Toggle button when result is shown */}
      {result && !showForm && (
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          paddingTop: 24,
        }}>
          <div>
            <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 17, marginBottom: 2 }}>
              Perfil de Google Business
            </div>
            <div style={{
              fontFamily: "var(--font-inter), sans-serif", fontSize: 12,
              color: "rgba(255,255,255,0.42)",
            }}>
              Información cacheada de tu última auditoría
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: "8px 18px", borderRadius: 8,
              background: Gs, border: `1px solid ${Gb}`, color: G,
              fontFamily: "var(--font-inter), sans-serif", fontSize: 13, fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Buscar otro perfil
          </button>
        </div>
      )}

      {/* Search form */}
      {showForm && (
        <form onSubmit={handleSearch} style={{
          padding: "24px 28px",
          background: "rgba(255,255,255,0.025)",
          border: `1px solid rgba(255,255,255,0.07)`,
          borderRadius: 16,
          display: "flex", flexDirection: "column", gap: 16,
        }}>
          <div>
            <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 17, marginBottom: 4 }}>
              Perfil de Google Business
            </div>
            <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 20, color: "#fff" }}>
              Buscar negocio
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
              {result
                ? "Reemplaza el perfil cacheado con uno nuevo."
                : "Ingresa el nombre del negocio tal como aparece en Google Maps."}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const, alignItems: "flex-end" }}>
            <div style={{ flex: "1 1 280px" }}>
              <label style={{
                fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.45)",
                letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6,
              }}>
                Nombre del negocio
              </label>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Ej: Pizzería Don Mario Chapinero"
                style={{
                  width: "100%", padding: "12px 16px",
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${focused ? Gb : "rgba(255,255,255,0.1)"}`,
                  borderRadius: 10, color: "#fff",
                  fontFamily: "var(--font-inter), sans-serif", fontSize: 14,
                  outline: "none", transition: "border-color 0.2s",
                }}
              />
            </div>

            <div style={{ flexShrink: 0 }}>
              <label style={{
                fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.45)",
                letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6,
              }}>
                País
              </label>
              <select
                value={country}
                onChange={e => setCountry(+e.target.value)}
                style={{
                  padding: "12px 14px", borderRadius: 10,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff", fontSize: 14,
                  fontFamily: "var(--font-inter), sans-serif",
                  outline: "none", cursor: "pointer",
                }}
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code} style={{ background: "#1a1a1a" }}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !query.trim()}
              style={{
                padding: "12px 24px", borderRadius: 10, border: "none",
                background: loading || !query.trim() ? "rgba(93,184,72,0.4)" : G,
                color: "#0a0a0a", fontFamily: "var(--font-inter), sans-serif",
                fontWeight: 700, fontSize: 14,
                cursor: loading || !query.trim() ? "not-allowed" : "pointer",
                whiteSpace: "nowrap" as const, transition: "all 0.15s",
                flexShrink: 0,
              }}
            >
              {loading ? "Buscando…" : "Buscar perfil →"}
            </button>

            {result && (
              <button
                type="button"
                onClick={() => { setShowForm(false); setQuery(""); }}
                style={{
                  padding: "12px 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)",
                  background: "transparent", color: "rgba(255,255,255,0.55)",
                  fontFamily: "var(--font-inter), sans-serif", fontWeight: 500, fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            )}
          </div>

          {errMsg && (
            <div style={{
              padding: "10px 14px", borderRadius: 8,
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
              fontSize: 13, color: "#ef4444",
            }}>{errMsg}</div>
          )}
        </form>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div style={{
          padding: "60px 24px", textAlign: "center" as const,
          background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
        }}>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
            Consultando Google Business…
          </div>
          <div style={{
            width: 40, height: 4, background: G, borderRadius: 999,
            margin: "0 auto",
            animation: "pulse 1.5s ease-in-out infinite",
          }}/>
          <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.3} }`}</style>
        </div>
      )}

      {/* Result */}
      {result && !loading && <BusinessProfileSection data={result}/>}
    </div>
  );
}