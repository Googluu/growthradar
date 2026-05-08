"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LandingNav }        from "@/components/landing/LandingNav";
import { LandingHero }       from "@/components/landing/LandingHero";
import { Pillars }           from "@/components/landing/Pillars";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";
import { FeatureSpotlight }  from "@/components/landing/FeatureSpotlight";
import { SocialProof }       from "@/components/landing/SocialProof";
import { FAQ }               from "@/components/landing/FAQ";
import { FinalCTA }          from "@/components/landing/FinalCTA";
import { LandingFooter }     from "@/components/landing/LandingFooter";

function focusHeroInput() {
  window.scrollTo({ top: 0, behavior: "smooth" });
  setTimeout(() => document.getElementById("hero-input")?.focus(), 400);
}

export default function LandingPage() {
  const router = useRouter();
  const [navScrolled, setNavScrolled] = useState(false);
  const [url, setUrl]                 = useState("");

  useEffect(() => {
    const handler = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleScan = useCallback(() => {
    if (!url.trim()) return;
    router.push(`/dashboard?url=${encodeURIComponent(url.trim())}`);
  }, [url, router]);

  return (
    <>
      <LandingNav scrolled={navScrolled} onAuditClick={focusHeroInput} />

      <LandingHero url={url} onUrlChange={setUrl} onScan={handleScan} />

      <Pillars />

      <LandingHowItWorks />

      <FeatureSpotlight />

      <SocialProof />

      <FAQ />

      <FinalCTA onAuditClick={focusHeroInput} />

      <LandingFooter />
    </>
  );
}
