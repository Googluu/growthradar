"use client";

import { useState, useEffect } from "react";
import { Sidebar, MobileDrawer } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

const SIDEBAR_KEY = "eda:sidebar-collapsed";
const EXPANDED  = 264;
const COLLAPSED = 64;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [mounted,     setMounted]     = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_KEY);
    if (stored === "true") setCollapsed(true);
    setMounted(true);
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(SIDEBAR_KEY, String(next));
  };

  const sidebarW = mounted ? (collapsed ? COLLAPSED : EXPANDED) : EXPANDED;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex" }}>

      {/* Desktop sidebar wrapper (spacer + sticky content) */}
      <div
        className="dashboard-sidebar-wrapper"
        style={{
          width: sidebarW, flexShrink: 0,
          transition: "width 0.2s ease-out",
          position: "sticky", top: 0, height: "100vh",
          overflowY: "auto",
        }}
      >
        <Sidebar collapsed={collapsed} onToggle={toggleCollapsed} />
      </div>

      {/* Mobile drawer */}
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main area */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <DashboardHeader onMenuClick={() => setMobileOpen(true)} />
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
