"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useLanguage } from "@/components/i18n/language-provider"
import { cn } from "@/lib/utils"
import { Check, X } from "lucide-react"

const beforeItems = [
  "Scattered WhatsApp messages",
  "Forgotten orders & missed sales",
  "Frustrated waiting customers",
  "Late night stress & burnout",
  "Manual tracking in notebooks",
  "No idea what's paid or pending"
]

const afterItems = [
  "All orders in one dashboard",
  "Never miss an order again",
  "Fast responses, happy customers",
  "Work-life balance restored",
  "Automated order tracking",
  "Clear payment status always"
]

export function TransformationSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [showAfter, setShowAfter] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const { t } = useLanguage()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          setTimeout(() => setShowAfter(true), 800)
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
      id="features"
      ref={sectionRef}
      className="py-24 lg:py-32 bg-gradient-to-b from-secondary/20 to-background overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={cn(
            "text-center max-w-3xl mx-auto mb-16 lg:mb-24 transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            {t("The Transformation")}
          </span>
          <h2
            className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground text-balance"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t("From Chaos to ")}
            <span className="text-primary">{t("Complete Control")}</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground text-pretty">
            {t("See the difference WhatsBoard makes for your business.")}
          </p>
        </div>

        {/* Before/After Comparison */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {/* Before */}
          <div
            className={cn(
              "relative p-8 rounded-3xl border-2 transition-all duration-700",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
              showAfter
                ? "bg-destructive/5 border-destructive/20"
                : "bg-secondary border-border"
            )}
          >
            <div className="absolute -top-4 left-8 px-4 py-1.5 bg-background border border-destructive/30 rounded-full">
              <span className="text-sm font-bold text-destructive uppercase tracking-wider">
                {t("Before")}
              </span>
            </div>

            <div className="pt-4 space-y-4">
              {beforeItems.map((item, index) => (
                <div
                  key={item}
                  className={cn(
                    "flex items-center gap-3 transition-all duration-300",
                    isVisible
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-4"
                  )}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center">
                    <X className="w-4 h-4 text-destructive" />
                  </div>
                  <span className="text-foreground">{t(item)}</span>
                </div>
              ))}
            </div>

            {/* Emotion Indicator */}
            <div className="mt-8 pt-6 border-t border-border">
              <div className="flex items-center gap-3">
                <span className="text-3xl">😫</span>
                <div>
                  <p className="font-medium text-foreground">{t("Stressed & Overwhelmed")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("Business running you instead of you running it")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* After */}
          <div
            className={cn(
              "relative p-8 rounded-3xl border-2 transition-all duration-700 delay-300",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
              showAfter
                ? "bg-primary/5 border-primary/30 shadow-xl shadow-primary/10"
                : "bg-secondary border-border"
            )}
          >
            <div className="absolute -top-4 left-8 px-4 py-1.5 bg-primary text-primary-foreground rounded-full">
              <span className="text-sm font-bold uppercase tracking-wider">
                {t("After")}
              </span>
            </div>

            <div className="pt-4 space-y-4">
              {afterItems.map((item, index) => (
                <div
                  key={item}
                  className={cn(
                    "flex items-center gap-3 transition-all duration-300",
                    showAfter
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-4"
                  )}
                  style={{ transitionDelay: `${(index + 6) * 100}ms` }}
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">{t(item)}</span>
                </div>
              ))}
            </div>

            {/* Emotion Indicator */}
            <div className="mt-8 pt-6 border-t border-primary/20">
              <div className="flex items-center gap-3">
                <span className="text-3xl">😎</span>
                <div>
                  <p className="font-medium text-foreground">{t("Calm & In Control")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("Running your business like a professional")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transformation Visual */}
        <div
          className={cn(
            "mt-16 lg:mt-24 max-w-4xl mx-auto transition-all duration-1000 delay-500",
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          )}
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src="/images/transformation.jpg"
              alt="Successful entrepreneur with organized business"
              width={1200}
              height={600}
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />

            {/* Floating Success Metrics */}
            <div className="absolute top-4 right-4 sm:top-8 sm:right-8 bg-background/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <p className="text-2xl sm:text-3xl font-bold text-primary">3x</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{t("More Orders Handled")}</p>
            </div>

            <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 bg-background/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <p className="text-2xl sm:text-3xl font-bold text-primary">0</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{t("Missed Orders")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
