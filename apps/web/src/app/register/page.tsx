"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const [email, setEmail]     = useState("");
  const [name, setName]       = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO Paso 3: supabase.auth.signUp({ email, password })
    setSubmitted(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>

      {/* Nav mínimo */}
      <nav style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-soft)" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <Image src="/logo_eda_sin_background.png" alt="EDA" width={22} height={22} className="logo-icon object-contain" />
          <Image src="/eda.png" alt="EDA" width={48} height={16} className="logo-wordmark object-contain" />
        </Link>
      </nav>

      {/* Card centrada */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{
          width: "100%", maxWidth: 440,
          background: "var(--bg2)", border: "1px solid var(--border)",
          borderRadius: 20, padding: "40px 36px",
        }}>
          {submitted ? (
            /* Estado post-submit */
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
              <h2 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 24, color: "var(--txt)", letterSpacing: "-0.7px", marginBottom: 10 }}>
                ¡Listo! Revisa tu correo
              </h2>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: 14, color: "var(--txt-muted)", lineHeight: 1.65 }}>
                Te enviamos un enlace de acceso a <strong style={{ color: "var(--txt)" }}>{email}</strong>.
                Da clic en el enlace para activar tu cuenta y ver tu reporte.
              </p>
              <Link href="/" style={{ display: "inline-block", marginTop: 24, color: "var(--accent)", fontFamily: "var(--font-dm-sans)", fontSize: 14, textDecoration: "none" }}>
                ← Volver al inicio
              </Link>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ marginBottom: 28 }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "var(--bg3)", border: "1px solid rgba(93,184,72,0.3)",
                  borderRadius: 20, padding: "4px 12px", marginBottom: 16,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#5DB848", display: "inline-block" }} />
                  <span style={{ color: "#5DB848", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "var(--font-dm-sans)" }}>GRATIS · SIN TARJETA</span>
                </div>
                <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 28, color: "var(--txt)", letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 8 }}>
                  Crea tu cuenta<br />
                  <span style={{ color: "var(--accent)" }}>y accede a tu reporte</span>
                </h1>
                <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: 14, color: "var(--txt-muted)", lineHeight: 1.6 }}>
                  Tu diagnóstico completo te espera. Regístrate en segundos.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-dm-sans)", fontSize: 12, fontWeight: 600, color: "var(--txt-muted)", marginBottom: 6, letterSpacing: "0.04em" }}>
                    NOMBRE
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    style={{
                      width: "100%", background: "var(--bg3)", border: "1px solid var(--border)",
                      borderRadius: 10, padding: "12px 14px", fontSize: 14,
                      color: "var(--txt)", fontFamily: "var(--font-dm-sans)", outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-dm-sans)", fontSize: 12, fontWeight: 600, color: "var(--txt-muted)", marginBottom: 6, letterSpacing: "0.04em" }}>
                    CORREO ELECTRÓNICO
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@empresa.com"
                    style={{
                      width: "100%", background: "var(--bg3)", border: "1px solid var(--border)",
                      borderRadius: 10, padding: "12px 14px", fontSize: 14,
                      color: "var(--txt)", fontFamily: "var(--font-dm-sans)", outline: "none",
                    }}
                  />
                </div>

                {/* Beneficios rápidos */}
                <div style={{ background: "var(--bg3)", borderRadius: 10, padding: "12px 14px", margin: "4px 0" }}>
                  {[
                    "Acceso a tu reporte completo",
                    "Historial de auditorías",
                    "Alertas de regresión semanales",
                  ].map((b) => (
                    <div key={b} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0", fontFamily: "var(--font-dm-sans)", fontSize: 13, color: "var(--txt-muted)" }}>
                      <span style={{ color: "var(--accent)", fontSize: 10, flexShrink: 0 }}>✓</span>
                      {b}
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={!email.trim() || !name.trim()}
                  style={{
                    background: "var(--accent)", color: "#fff", border: "none",
                    borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 700,
                    fontFamily: "var(--font-dm-sans)", cursor: "pointer",
                    opacity: email.trim() && name.trim() ? 1 : 0.5,
                    transition: "opacity 0.15s, transform 0.15s",
                    marginTop: 4,
                  }}
                  onMouseEnter={(e) => { if (email.trim() && name.trim()) e.currentTarget.style.filter = "brightness(1.1)"; }}
                  onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
                >
                  Crear cuenta gratis →
                </button>
              </form>

              {/* Footer del card */}
              <div style={{ marginTop: 20, textAlign: "center" }}>
                <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 13, color: "var(--txt-faint)" }}>
                  ¿Ya tienes cuenta?{" "}
                  <Link href="/login" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
                    Iniciar sesión
                  </Link>
                </span>
              </div>

              {/* Nota legal */}
              <p style={{ marginTop: 16, fontFamily: "var(--font-dm-sans)", fontSize: 11, color: "var(--txt-faint)", textAlign: "center", lineHeight: 1.5 }}>
                Al registrarte aceptas nuestros{" "}
                <Link href="/terminos" style={{ color: "var(--txt-faint)", textDecoration: "underline" }}>Términos</Link>
                {" "}y{" "}
                <Link href="/privacidad" style={{ color: "var(--txt-faint)", textDecoration: "underline" }}>Política de Privacidad</Link>.
              </p>

              {/* Indicador de paso (context: venía de scan) */}
              {next === "/dashboard" && (
                <div style={{
                  marginTop: 20, padding: "10px 14px", borderRadius: 8,
                  background: "rgba(93,184,72,0.08)", border: "1px solid rgba(93,184,72,0.2)",
                  fontFamily: "var(--font-dm-sans)", fontSize: 12, color: "#5DB848",
                  textAlign: "center",
                }}>
                  Tu reporte está guardado — accede en segundos al crearte tu cuenta
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
