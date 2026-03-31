"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowRight, Check, Sparkles } from "lucide-react"

const benefits = [
  "Free to start, no credit card required",
  "Set up in under 5 minutes",
  "Works on any device",
  "Cancel anytime"
]

export function CTASection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="py-24 lg:py-32 bg-gradient-to-b from-secondary/20 to-primary/10 overflow-hidden relative"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div
          className={cn(
            "max-w-4xl mx-auto text-center transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Join 2,500+ successful sellers
          </div>

          {/* Headline */}
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight mb-6 text-balance"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Ready to Take Control of{" "}
            <span className="text-primary">Your Business?</span>
          </h2>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
            Stop losing orders. Stop the late nights. Start running your business like a pro.
            Your first step to freedom is just one click away.
          </p>

          {/* CTA Buttons */}
          <div
            className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 transition-all duration-700 delay-200",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <Button size="lg" className="text-lg px-8 py-6 gap-2 group" asChild>
              <Link href="/register">
                Start Free Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
              <Link href="/pricing">
                Book a Demo
              </Link>
            </Button>
          </div>

          {/* Benefits */}
          <div
            className={cn(
              "flex flex-wrap items-center justify-center gap-x-6 gap-y-3 transition-all duration-700 delay-400",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Urgency Element */}
        <div
          className={cn(
            "mt-16 max-w-md mx-auto text-center transition-all duration-700 delay-600",
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          )}
        >
          <div className="p-6 rounded-2xl bg-card border border-primary/20 shadow-lg">
            <p className="text-sm text-muted-foreground mb-2">Limited Time Offer</p>
            <p className="text-lg font-bold text-foreground mb-1">
              First 100 signups this month get
            </p>
            <p className="text-2xl font-bold text-primary">2 Months Free Pro Features</p>
          </div>
        </div>
      </div>
    </section>
  )
}
