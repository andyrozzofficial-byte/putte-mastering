import {
  ContactSection,
  FaqSection,
  HowItWorksSection,
  PricingTeaserSection,
} from "@/components/landing/support-sections";
import { BeforeAfterSection } from "@/components/landing/before-after-section";
import { TrustedBySection } from "@/components/landing/trusted-by-section";
import { FeatureGrid } from "@/components/landing/feature-grid";
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
        <HowItWorksSection />
        <BeforeAfterSection />
        <TrustedBySection />
        <PricingTeaserSection />
        <FeatureGrid />
        <FaqSection />
        <ContactSection />
      </main>
    </>
  );
}
