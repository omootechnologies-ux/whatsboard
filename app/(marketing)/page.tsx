import { Hero } from "@/components/marketing/hero";
import { PainGrid } from "@/components/marketing/pain-grid";
import { BenefitCards } from "@/components/marketing/benefit-cards";
import { CtaBanner } from "@/components/marketing/cta-banner";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <PainGrid />
      <BenefitCards />
      <CtaBanner />
    </main>
  );
}
