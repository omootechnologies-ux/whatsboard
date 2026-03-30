"use client"

import { Navbar } from "@/components/sections/navbar"
import { HeroSection } from "@/components/sections/hero-section"
import { ChaosSection } from "@/components/sections/chaos-section"
import { TurningPointSection } from "@/components/sections/turning-point-section"
import { TransformationSection } from "@/components/sections/transformation-section"
import { DashboardSection } from "@/components/sections/dashboard-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { TestimonialsSection } from "@/components/sections/testimonials-section"
import { CTASection } from "@/components/sections/cta-section"
import { Footer } from "@/components/sections/footer"

export default function HomePage() {
  return (
    <main className="relative">
      {/* Navigation */}
      <Navbar />
      
      {/* Hero - Introduction */}
      <HeroSection />
      
      {/* Chaos Section - The problem */}
      <ChaosSection />
      
      {/* Turning Point - The revelation */}
      <TurningPointSection />
      
      {/* Transformation - The solution intro */}
      <TransformationSection />
      
      {/* Dashboard Section - The product */}
      <DashboardSection />
      
      {/* Features - Product details */}
      <FeaturesSection />
      
      {/* Testimonials - Social proof */}
      <TestimonialsSection />
      
      {/* Final CTA */}
      <CTASection />
      
      {/* Footer */}
      <Footer />
    </main>
  )
}
