"use client";

import type { OnPageData } from "@/types/dashboard";
import { G, C, Badge, SectionTitle } from "./shared";

// ── Platform logos ─────────────────────────────────────────────────────────────
function FacebookLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877f2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073" />
    </svg>
  );
}

function TwitterLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

// ── Google SERP preview ────────────────────────────────────────────────────────
function GoogleSerpCard({
  title, description, url, duplicateTitle, duplicateDescription,
}: {
  title: string; description: string; url: string;
  duplicateTitle: boolean; duplicateDescription: boolean;
}) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 16, overflow: "hidden",
    }}>
      <div style={{
        padding: "14px 18px", borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <GoogleLogo />
        <div>
          <div style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>Google</div>
          <div style={{ fontSize: 11, color: C.text3 }}>SERP preview</div>
        </div>
      </div>
      <div style={{ padding: 20, background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{
            width: 24, height: 24, borderRadius: "50%", background: "#f1f3f4",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, color: "#5f6368", fontWeight: 700,
          }}>
            {(url.replace(/^https?:\/\//, "").split(".")[0] || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 13, color: "#202124", fontWeight: 500, lineHeight: 1.1 }}>
              {url.replace(/^https?:\/\//, "").split("/")[0]}
            </div>
            <div style={{ fontSize: 11, color: "#5f6368", lineHeight: 1.1 }}>{url}</div>
          </div>
        </div>
        <a href="#" style={{
          display: "block", fontSize: 20, color: "#1a0dab",
          fontWeight: 400, textDecoration: "none", marginTop: 6, marginBottom: 4,
        }}>
          {title.length > 60 ? title.slice(0, 60) + "…" : title}
        </a>
        <div style={{
          fontSize: 14, color: "#4d5156", lineHeight: 1.4,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {description.length > 160 ? description.slice(0, 160) + "…" : description}
        </div>
      </div>
      <div style={{
        padding: "12px 18px", borderTop: `1px solid ${C.border}`,
        display: "flex", gap: 8, flexWrap: "wrap",
      }}>
        <Badge tone="default" style={{ fontFamily: "var(--font-mono), monospace" }}>
          Title {title.length} chars
        </Badge>
        <Badge tone="default" style={{ fontFamily: "var(--font-mono), monospace" }}>
          Desc {description.length} chars
        </Badge>
        {description.length > 160 && <Badge tone="amber">Desc &gt; 160</Badge>}
        {duplicateTitle && <Badge tone="red">Title duplicado</Badge>}
        {duplicateDescription && <Badge tone="red">Desc duplicada</Badge>}
      </div>
    </div>
  );
}

// ── Facebook / LinkedIn card ───────────────────────────────────────────────────
function FacebookCard({ tags, url }: { tags: Record<string, string>; url: string }) {
  const title = tags["og:title"] || "—";
  const desc  = tags["og:description"] || "—";
  const image = tags["og:image"] || null;
  const domain = url ? url.replace(/^https?:\/\//, "").split("/")[0] : "";

  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 16, overflow: "hidden",
    }}>
      <div style={{
        padding: "14px 18px", borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <FacebookLogo />
        <div>
          <div style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>Facebook · LinkedIn</div>
          <div style={{ fontSize: 11, color: C.text3 }}>Open Graph preview</div>
        </div>
      </div>
      <div style={{ padding: 16, background: "#f0f2f5" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "#1877f2", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 14,
          }}>
            {domain.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#050505", fontWeight: 600 }}>{domain}</div>
            <div style={{ fontSize: 10.5, color: "#65676b" }}>Patrocinado · 🌐</div>
          </div>
        </div>
        <div style={{
          background: "#fff", border: "1px solid #ced0d4",
          borderRadius: 8, overflow: "hidden",
        }}>
          <div style={{
            height: 168,
            background: image
              ? `linear-gradient(135deg, ${G}88, ${G}33), repeating-linear-gradient(45deg, #00000010 0 6px, transparent 6px 12px), #1a1a1a`
              : "#e0e0e0",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {image
              ? <span style={{
                  fontFamily: "var(--font-syne), sans-serif", fontWeight: 700,
                  fontSize: 28, color: "#fff",
                  textShadow: "0 2px 12px rgba(0,0,0,0.5)", textAlign: "center", padding: "0 24px",
                }}>🌐 {domain}</span>
              : <span style={{ color: "#999", fontSize: 12 }}>Sin og:image</span>
            }
          </div>
          <div style={{ padding: "10px 12px", background: "#f7f8fa" }}>
            <div style={{
              fontSize: 10.5, color: "#65676b",
              textTransform: "uppercase", letterSpacing: "0.02em",
            }}>{domain}</div>
            <div style={{
              fontSize: 14, color: "#050505", fontWeight: 600, marginTop: 3, lineHeight: 1.3,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>{title}</div>
            <div style={{
              fontSize: 11.5, color: "#65676b", marginTop: 4, lineHeight: 1.35,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>{desc}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Twitter / X card ───────────────────────────────────────────────────────────
function TwitterCard({ tags, url }: { tags: Record<string, string>; url: string }) {
  const title    = tags["twitter:title"] || tags["og:title"] || "—";
  const desc     = tags["twitter:description"] || tags["og:description"] || "—";
  const image    = tags["twitter:image"] || tags["og:image"] || null;
  const cardType = tags["twitter:card"] || "summary";
  const domain   = url ? url.replace(/^https?:\/\//, "").split("/")[0] : "";

  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 16, overflow: "hidden",
    }}>
      <div style={{
        padding: "14px 18px", borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <TwitterLogo />
        <div>
          <div style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>X · Twitter Card</div>
          <div style={{ fontSize: 11, color: C.text3 }}>{cardType}</div>
        </div>
      </div>
      <div style={{ padding: 16, background: "#000" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: G, color: "#000",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-syne), sans-serif", fontWeight: 800, fontSize: 12,
          }}>
            {domain.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 13, color: "#fff", fontWeight: 700 }}>
              {domain} <span style={{ color: "#71767b", fontWeight: 400 }}>@{domain.split(".")[0]}</span>
            </div>
            <div style={{ fontSize: 11, color: "#71767b" }}>Hace 2h</div>
          </div>
        </div>
        <div style={{ border: "1px solid #2f3336", borderRadius: 16, overflow: "hidden" }}>
          <div style={{
            height: 168,
            background: image
              ? `linear-gradient(135deg, ${G}88, ${G}33), repeating-linear-gradient(45deg, #00000010 0 6px, transparent 6px 12px), #1a1a1a`
              : "#16181c",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {image
              ? <span style={{
                  fontFamily: "var(--font-syne), sans-serif", fontWeight: 700,
                  fontSize: 28, color: "#fff",
                  textShadow: "0 2px 12px rgba(0,0,0,0.5)", textAlign: "center", padding: "0 24px",
                }}>🌐 {domain}</span>
              : <span style={{ color: "#71767b", fontSize: 12 }}>Sin twitter:image</span>
            }
          </div>
          <div style={{ padding: "10px 14px", background: "rgba(255,255,255,0.02)" }}>
            <div style={{ fontSize: 11.5, color: "#71767b" }}>From {domain}</div>
            <div style={{
              fontSize: 14, color: "#e7e9ea", fontWeight: 500, marginTop: 4, lineHeight: 1.3,
              display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>{title}</div>
            <div style={{
              fontSize: 12, color: "#71767b", marginTop: 4, lineHeight: 1.4,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>{desc}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SocialPreviews ─────────────────────────────────────────────────────────────
export function SocialPreviews({ data }: { data: OnPageData }) {
  return (
    <div>
      <SectionTitle
        kicker="Vista previa"
        title="¿Cómo se ve compartida?"
        sub="Cómo aparece esta página en Google, Facebook/LinkedIn y X"
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <GoogleSerpCard
          title={data.title}
          description={data.description}
          url={data.url}
          duplicateTitle={data.duplicate_title}
          duplicateDescription={data.duplicate_description}
        />
        <FacebookCard tags={data.social_media_tags} url={data.url} />
        <TwitterCard  tags={data.social_media_tags} url={data.url} />
      </div>
    </div>
  );
}
