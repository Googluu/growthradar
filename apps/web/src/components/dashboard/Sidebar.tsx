"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Search, Monitor, MapPin, BarChart3,
  Target, Zap, History, Settings, ChevronsLeft, ChevronsRight,
} from "lucide-react";
import { NAV_ITEMS, PILLAR_LABELS, type NavItemConfig, type Pillar } from "@/lib/dashboard-nav";
import { readFreeReport } from "@/lib/audit";

// ── Tokens ────────────────────────────────────────────────────────────────────
const G    = "#5DB848";
const Gs   = "rgba(93,184,72,0.12)";
const Gb   = "rgba(93,184,72,0.35)";
const BG   = "#0a0a0a";
const BORDER = "rgba(255,255,255,0.07)";
const MUTED  = "rgba(255,255,255,0.38)";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string; style?: React.CSSProperties }>> = {
  LayoutDashboard, Search, Monitor, MapPin, BarChart3,
  Target, Zap, History, Settings,
};

// ── PillarSeparator ───────────────────────────────────────────────────────────
function PillarSeparator({ pillar, collapsed }: { pillar: Pillar; collapsed: boolean }) {
  return (
    <div style={{
      padding: collapsed ? "14px 0 6px" : "18px 20px 6px",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {collapsed ? (
        <div style={{ width: 20, height: 1, background: "rgba(93,184,72,0.25)" }} />
      ) : (
        <span style={{
          fontFamily: "var(--font-caveat), cursive",
          fontSize: 11, color: "rgba(93,184,72,0.55)",
          letterSpacing: "0.16em", userSelect: "none",
        }}>
          {PILLAR_LABELS[pillar]}
        </span>
      )}
    </div>
  );
}

// ── NavItem ───────────────────────────────────────────────────────────────────
function NavItem({ item, collapsed, onClick }: {
  item: NavItemConfig;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = item.href === "/dashboard"
    ? pathname === "/dashboard"
    : pathname.startsWith(item.href);
  const Icon = ICON_MAP[item.icon];
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <Link
        href={item.href}
        onClick={onClick}
        aria-label={collapsed ? item.label : undefined}
        aria-current={isActive ? "page" : undefined}
        style={{
          display: "flex", alignItems: "center",
          gap: collapsed ? 0 : 10,
          padding: collapsed ? "9px 0" : "9px 16px",
          justifyContent: collapsed ? "center" : "flex-start",
          textDecoration: "none",
          borderLeft: isActive ? `3px solid ${G}` : "3px solid transparent",
          background: isActive ? Gs : hovered ? "rgba(255,255,255,0.04)" : "transparent",
          transition: "background 0.15s",
          outline: "none",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {Icon && (
          <Icon
            size={18}
            color={isActive ? G : hovered ? "rgba(255,255,255,0.75)" : MUTED}
          />
        )}
        {!collapsed && (
          <span style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: 13, fontWeight: isActive ? 600 : 400,
            color: isActive ? "#fff" : hovered ? "rgba(255,255,255,0.8)" : MUTED,
            flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            transition: "color 0.15s",
          }}>
            {item.label}
          </span>
        )}
        {!collapsed && item.badge && (
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: "0.07em",
            color: G, background: Gs, border: `1px solid ${Gb}`,
            borderRadius: 4, padding: "1px 5px",
            fontFamily: "var(--font-inter), sans-serif", flexShrink: 0,
          }}>
            {item.badge}
          </span>
        )}
      </Link>

      {/* Tooltip en estado colapsado */}
      {collapsed && hovered && (
        <div style={{
          position: "absolute", left: "calc(100% + 8px)", top: "50%",
          transform: "translateY(-50%)", zIndex: 300,
          background: "#1c1c1c", border: `1px solid ${BORDER}`,
          borderRadius: 7, padding: "6px 10px",
          fontFamily: "var(--font-inter), sans-serif", fontSize: 12,
          color: "#fff", whiteSpace: "nowrap",
          boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
          pointerEvents: "none",
        }}>
          {item.label}
          {item.badge && (
            <span style={{ marginLeft: 6, fontSize: 9, color: G, fontWeight: 700 }}>
              {item.badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ── BusinessContextBlock ──────────────────────────────────────────────────────
function BusinessContextBlock({ collapsed }: { collapsed: boolean }) {
  const [biz, setBiz] = useState<{ name: string; domain: string; ts: number } | null>(null);

  useEffect(() => {
    const r = readFreeReport();
    if (r) setBiz({ name: r.formData.businessName, domain: r.formData.domain, ts: r.ts });
  }, []);

  const initial = biz?.name.charAt(0).toUpperCase() ?? "?";
  const minutesAgo = biz ? Math.round((Date.now() - biz.ts) / 60_000) : 0;
  const timeLabel = minutesAgo < 60
    ? `Hace ${minutesAgo} min`
    : minutesAgo < 1440
    ? `Hace ${Math.round(minutesAgo / 60)}h`
    : `Hace ${Math.round(minutesAgo / 1440)}d`;

  return (
    <div style={{
      padding: collapsed ? "10px 0" : "10px 16px",
      display: "flex", alignItems: "center",
      gap: collapsed ? 0 : 10,
      justifyContent: collapsed ? "center" : "flex-start",
      borderBottom: `1px solid ${BORDER}`,
      marginBottom: 6,
    }}>
      {/* Avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
        background: biz ? Gs : "rgba(255,255,255,0.05)",
        border: `1px solid ${biz ? Gb : BORDER}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-syne), sans-serif", fontWeight: 700,
        fontSize: 13, color: biz ? G : MUTED,
      }}>
        {initial}
      </div>

      {!collapsed && (
        biz ? (
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontFamily: "var(--font-inter), sans-serif", fontSize: 12,
              fontWeight: 600, color: "#fff",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {biz.name}
            </div>
            <div style={{
              fontFamily: "var(--font-mono), monospace", fontSize: 10,
              color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {biz.domain}
            </div>
            <div style={{
              fontFamily: "var(--font-inter), sans-serif", fontSize: 10,
              color: "rgba(255,255,255,0.22)", marginTop: 1,
            }}>
              {timeLabel}
            </div>
          </div>
        ) : (
          <Link href="/dashboard" style={{
            fontFamily: "var(--font-inter), sans-serif", fontSize: 12,
            color: G, textDecoration: "none",
          }}>
            Nueva auditoría →
          </Link>
        )
      )}
    </div>
  );
}

// ── Sidebar content (shared between desktop + mobile drawer) ──────────────────
function SidebarContent({ collapsed, onToggle, isMobile = false, onClose }: {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
  onClose?: () => void;
}) {
  let prevPillar: Pillar | undefined;
  let utilitySepShown = false;

  return (
    <div style={{
      width: "100%", height: "100%",
      background: BG, borderRight: `1px solid ${BORDER}`,
      display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        padding: collapsed && !isMobile ? "0 0" : "0 20px",
        display: "flex", alignItems: "center",
        justifyContent: collapsed && !isMobile ? "center" : "space-between",
        borderBottom: `1px solid ${BORDER}`, flexShrink: 0,
        height: 60,
      }}>
        {(!collapsed || isMobile) ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Image src="/logo_eda_sin_background.png" alt="EDA" width={30} height={30} />
            <Image
              src="/eda.png" alt="EDA" width={42} height={17}
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </div>
        ) : (
          <Image src="/logo_eda_sin_background.png" alt="EDA" width={26} height={26} />
        )}

        {!isMobile && (
          <button
            onClick={onToggle}
            aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            style={{
              background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`,
              borderRadius: "50%", width: 26, height: 26,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: MUTED, flexShrink: 0,
              transition: "all 0.15s",
            }}
          >
            {collapsed ? <ChevronsRight size={13} /> : <ChevronsLeft size={13} />}
          </button>
        )}
      </div>

      {/* Business context */}
      <BusinessContextBlock collapsed={collapsed && !isMobile} />

      {/* Nav */}
      <nav
        role="navigation"
        aria-label="Dashboard"
        style={{ flex: 1, overflowY: "auto", padding: "2px 0" }}
      >
        {NAV_ITEMS.map((item) => {
          const nodes: React.ReactNode[] = [];

          // Pilar separator al cambiar de pilar
          if (item.pillar && item.pillar !== prevPillar) {
            nodes.push(
              <PillarSeparator
                key={`pillar-${item.pillar}`}
                pillar={item.pillar}
                collapsed={collapsed && !isMobile}
              />
            );
            prevPillar = item.pillar;
          }

          // Separator antes del grupo utilidad
          if (item.group === "utility" && !utilitySepShown) {
            utilitySepShown = true;
            nodes.push(
              <div key="utility-sep" style={{
                margin: "8px 16px", height: 1, background: BORDER,
              }} />
            );
          }

          nodes.push(
            <NavItem
              key={item.id}
              item={item}
              collapsed={collapsed && !isMobile}
              onClick={onClose}
            />
          );

          return nodes;
        })}
      </nav>

      {/* Footer */}
      <div style={{
        borderTop: `1px solid ${BORDER}`, flexShrink: 0,
        padding: collapsed && !isMobile ? "12px 0" : "12px 16px",
        display: "flex", alignItems: "center",
        justifyContent: collapsed && !isMobile ? "center" : "flex-start",
        gap: 8,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
          background: "rgba(255,255,255,0.06)", border: `1px solid ${BORDER}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-inter), sans-serif", fontSize: 12,
          fontWeight: 600, color: MUTED,
        }}>
          U
        </div>
        {(!collapsed || isMobile) && (
          <span style={{
            fontFamily: "var(--font-inter), sans-serif", fontSize: 11,
            color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            flex: 1,
          }}>
            Cuenta gratuita
          </span>
        )}
      </div>
    </div>
  );
}

// ── Desktop sidebar ───────────────────────────────────────────────────────────
export function Sidebar({ collapsed, onToggle }: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <SidebarContent collapsed={collapsed} onToggle={onToggle} />
    </div>
  );
}

// ── Mobile drawer ─────────────────────────────────────────────────────────────
export function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: "fixed", inset: 0, zIndex: 199,
          background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
          opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.22s",
        }}
      />
      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 200,
        width: 280,
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.25s ease-out",
      }}>
        <SidebarContent collapsed={false} onToggle={() => {}} isMobile onClose={onClose} />
      </div>
    </>
  );
}
