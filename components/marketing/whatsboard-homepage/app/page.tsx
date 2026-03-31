import { Navigation } from "@/components/landing/navigation";
import { HeroSection } from "@/components/landing/hero-section";
import { ProblemSection } from "@/components/landing/problem-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { TransformationSection } from "@/components/landing/transformation-section";
import { AppShowcaseSection } from "@/components/landing/app-showcase-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export default function WhatsboardLanding() {
  return (
    <main className="min-h-screen bg-background font-sans">
      <Navigation />
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <TransformationSection />
      <AppShowcaseSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  );
}
