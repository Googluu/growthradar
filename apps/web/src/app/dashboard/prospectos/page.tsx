"use client";

import { useState } from "react";
import { fetchDiscoverProspects, type DiscoverParams } from "@/lib/audit";
import type { DiscoverProspectsData } from "@/types/dashboard";
import { DiscoverProspectsSection } from "@/components/dashboard/DiscoverProspectsSection";

const G  = "#5DB848";
const Gb = "rgba(93,184,72,0.35)";

const CATEGORY_SUGGESTIONS = [
  "pizza_restaurant", "restaurant", "coffee_shop", "beauty_salon",
  "gym", "pharmacy", "supermarket", "hotel", "dental_clinic",
  "law_firm", "accounting_firm", "auto_repair", "clothing_store",
];

const COUNTRIES = [
  { label: "Colombia 🇨🇴",   code: "CO" },
  { label: "México 🇲🇽",     code: "MX" },
  { label: "Perú 🇵🇪",       code: "PE" },
  { label: "Chile 🇨🇱",      code: "CL" },
  { label: "Argentina 🇦🇷",  code: "AR" },
  { label: "Ecuador 🇪🇨",    code: "EC" },
  { label: "España 🇪🇸",     code: "ES" },
];

export default function ProspectosPage() {
  const [description,  setDescription]  = useState("");
  const [categoryInput,setCategoryInput] = useState("");
  const [categories,   setCategories]   = useState<string[]>([]);
  const [country,      setCountry]      = useState("CO");
  const [limit,        setLimit]        = useState(50);
  const [loading,      setLoading]      = useState(false);
  const [errMsg,       setErrMsg]       = useState("");
  const [result,       setResult]       = useState<DiscoverProspectsData | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const addCategory = (cat: string) => {
    const c = cat.trim().toLowerCase().replace(/\s+/g, "_");
    if (c && !categories.includes(c)) setCategories([...categories, c]);
    setCategoryInput("");
  };

  const removeCategory = (cat: string) => setCategories(categories.filter(c => c !== cat));

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() && categories.length === 0) return;
    setLoading(true);
    setErrMsg("");
    setResult(null);
    try {
      const params: DiscoverParams = {
        description: description.trim() || undefined,
        categories:  categories.length ? categories : undefined,
        location_country: country,
        limit,
      };
      const data = await fetchDiscoverProspects(params);
      setResult(data);
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Error al buscar prospectos");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    width: "100%", padding: "12px 16px",
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${focusedField === field ? Gb : "rgba(255,255,255,0.1)"}`,
    borderRadius: 10, color: "#fff",
    fontFamily: "var(--font-inter), sans-serif", fontSize: 14,
    outline: "none", transition: "border-color 0.2s",
  });

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.45)",
    letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Search form */}
      <form onSubmit={handleSearch} style={{
        padding: "24px 28px",
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        display: "flex", flexDirection: "column", gap: 20,
      }}>
        <div>
          <div style={{ fontFamily: "var(--font-caveat), cursive", color: G, fontSize: 17, marginBottom: 4 }}>
            Pilar Descubre
          </div>
          <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 20, color: "#fff" }}>
            Descubrir prospectos
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
            Encuentra negocios en tu zona que necesitan mejorar su presencia digital
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Description */}
          <div>
            <label style={labelStyle}>Descripción del negocio</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              onFocus={() => setFocusedField("desc")}
              onBlur={() => setFocusedField(null)}
              placeholder="Ej: pizzería artesanal con domicilios"
              style={inputStyle("desc")}
            />
          </div>

          {/* Country */}
          <div>
            <label style={labelStyle}>País</label>
            <select
              value={country}
              onChange={e => setCountry(e.target.value)}
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 10,
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
        </div>

        {/* Categories */}
        <div>
          <label style={labelStyle}>Categorías (opcional)</label>
          <div style={{
            display: "flex", flexWrap: "wrap" as const, gap: 8,
            padding: "10px 14px", minHeight: 48,
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${focusedField === "cat" ? Gb : "rgba(255,255,255,0.1)"}`,
            borderRadius: 10, cursor: "text", transition: "border-color 0.2s",
          }}
            onClick={() => { const el = document.getElementById("cat-input"); el?.focus(); }}
          >
            {categories.map(cat => (
              <span key={cat} style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(93,184,72,0.12)", border: "1px solid rgba(93,184,72,0.35)",
                borderRadius: 999, padding: "3px 10px",
                fontSize: 12, color: G, fontWeight: 500,
              }}>
                {cat}
                <button type="button" onClick={() => removeCategory(cat)} style={{
                  background: "none", border: "none", color: G, cursor: "pointer",
                  padding: 0, lineHeight: 1, fontSize: 14,
                }}>×</button>
              </span>
            ))}
            <input
              id="cat-input"
              value={categoryInput}
              onChange={e => setCategoryInput(e.target.value)}
              onFocus={() => setFocusedField("cat")}
              onBlur={() => setFocusedField(null)}
              onKeyDown={e => {
                if ((e.key === "Enter" || e.key === ",") && categoryInput.trim()) {
                  e.preventDefault(); addCategory(categoryInput);
                }
              }}
              placeholder={categories.length === 0 ? "pizza_restaurant, restaurant… (Enter para agregar)" : ""}
              style={{
                flex: 1, minWidth: 180, background: "none", border: "none",
                color: "#fff", fontSize: 13, outline: "none",
                fontFamily: "var(--font-inter), sans-serif",
              }}
            />
          </div>
          {/* Suggestions */}
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginTop: 8 }}>
            {CATEGORY_SUGGESTIONS.filter(s => !categories.includes(s)).slice(0, 8).map(s => (
              <button key={s} type="button" onClick={() => addCategory(s)} style={{
                padding: "3px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)",
                fontSize: 11, cursor: "pointer", fontFamily: "var(--font-inter), sans-serif",
                transition: "all 0.12s",
              }}>
                + {s}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" as const }}>
          {/* Limit */}
          <div style={{ flexShrink: 0 }}>
            <label style={labelStyle}>Límite de resultados</label>
            <select
              value={limit}
              onChange={e => setLimit(+e.target.value)}
              style={{
                padding: "12px 14px", borderRadius: 10,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff", fontSize: 14,
                fontFamily: "var(--font-inter), sans-serif",
                outline: "none", cursor: "pointer",
              }}
            >
              {[20, 50, 100].map(n => (
                <option key={n} value={n} style={{ background: "#1a1a1a" }}>{n} negocios</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || (!description.trim() && categories.length === 0)}
            style={{
              padding: "12px 28px", borderRadius: 10, border: "none",
              background: (loading || (!description.trim() && categories.length === 0))
                ? "rgba(93,184,72,0.4)" : G,
              color: "#0a0a0a", fontFamily: "var(--font-inter), sans-serif",
              fontWeight: 700, fontSize: 14,
              cursor: (loading || (!description.trim() && categories.length === 0)) ? "not-allowed" : "pointer",
              whiteSpace: "nowrap" as const, transition: "all 0.15s",
            }}
          >
            {loading ? "Buscando prospectos…" : "Descubrir prospectos →"}
          </button>
        </div>

        {errMsg && (
          <div style={{
            padding: "10px 14px", borderRadius: 8,
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
            fontSize: 13, color: "#ef4444",
          }}>{errMsg}</div>
        )}
      </form>

      {/* Loading */}
      {loading && (
        <div style={{
          padding: "60px 24px", textAlign: "center" as const,
          background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
        }}>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
            Descubriendo prospectos en la zona…
          </div>
          <div style={{
            width: 40, height: 4, background: G, borderRadius: 999, margin: "0 auto",
            animation: "pulse 1.5s ease-in-out infinite",
          }}/>
          <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.3} }`}</style>
        </div>
      )}

      {/* Result */}
      {result && !loading && <DiscoverProspectsSection data={result}/>}

      {/* Empty state before any search */}
      {!result && !loading && (
        <div style={{
          padding: "60px 24px", textAlign: "center" as const,
          background: "rgba(255,255,255,0.015)", border: "1px dashed rgba(255,255,255,0.07)",
          borderRadius: 16,
        }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>🎯</div>
          <div style={{
            fontFamily: "var(--font-syne), sans-serif", fontWeight: 700,
            fontSize: 18, color: "#fff", marginBottom: 8,
          }}>Encuentra tus próximos clientes</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", maxWidth: 420, margin: "0 auto", lineHeight: 1.6 }}>
            EDA identifica negocios con debilidades digitales — sin sitio web, sin perfil reclamado, con pocas reseñas — para que puedas ofrecerles tus servicios.
          </div>
        </div>
      )}
    </div>
  );
}
