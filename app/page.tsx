import {
  ContactSection,
  FaqSection,
  HowItWorksSection,
  PricingTeaserSection,
} from "@/components/landing/support-sections";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { HeroSection } from "@/components/landing/hero-section";
import { LandingNavbar } from "@/components/landing/navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MASTRAD — Manuell mastering",
  description:
    "Professionell mastering med mänsklig känsla. Handgjord finishing för klarhet, punch och balans.",
};

export default function HomePage() {
  return (
    <>
      <LandingNavbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeatureGrid />
        <PricingTeaserSection />
        <FaqSection />
        <ContactSection />
      </main>
    </>
  );
}
