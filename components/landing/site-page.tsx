import { Navigation } from "@/components/landing/navigation";
import { HeroSection } from "@/components/landing/hero-section";
import { ProblemSection } from "@/components/landing/problem-section";
import { CostOfChaosSection } from "@/components/landing/cost-of-chaos-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { TransformationSection } from "@/components/landing/transformation-section";
import { AppShowcaseSection } from "@/components/landing/app-showcase-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export default function LandingSitePage() {
  return (
    <main className="min-h-screen bg-background font-sans">
      <Navigation />
      <HeroSection />
      <ProblemSection />
      <CostOfChaosSection />
      <HowItWorksSection />
      <TransformationSection />
      <AppShowcaseSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}
