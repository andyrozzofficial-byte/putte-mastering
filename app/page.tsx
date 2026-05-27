import {
  ContactSection,
  FaqSection,
  HowItWorksSection,
  PricingTeaserSection,
} from "@/components/landing/support-sections";
import { BeforeAfterSection } from "@/components/landing/before-after-section";
import { StudioEditorialSection } from "@/components/landing/studio-editorial-section";
import { TrustedBySection } from "@/components/landing/trusted-by-section";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { HeroFeatureStrip } from "@/components/landing/hero-feature-strip";
import { HeroSection } from "@/components/landing/hero-section";
import { LandingNavbar } from "@/components/landing/navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FIRST LISTEN MASTERING — Mastered to be heard",
  description:
    "Professional manual mastering focused on clarity, punch and balance — industry-ready sound trusted by working artists.",
};

export default function HomePage() {
  return (
    <>
      <LandingNavbar />
      <main>
        <HeroSection />
        <HeroFeatureStrip />
        <HowItWorksSection />
        <BeforeAfterSection />
        <StudioEditorialSection />
        <TrustedBySection />
        <PricingTeaserSection />
        <FeatureGrid />
        <FaqSection />
        <ContactSection />
      </main>
    </>
  );
}
