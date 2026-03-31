"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useLanguage } from "@/components/i18n/language-provider"
import { cn } from "@/lib/utils"
import { MessageSquare, ClipboardList, ArrowRightLeft, Truck } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: MessageSquare,
    title: "Order Comes In",
    description: "A customer messages you on WhatsApp with their order. Same as always.",
    image: "/images/step-order.jpg",
    alt: "Receiving WhatsApp order"
  },
  {
    number: "02",
    icon: ClipboardList,
    title: "Log It Instantly",
    description: "With one click, add the order to your WhatsBoard. Customer details, products, everything organized.",
    image: "/images/step-log.jpg",
    alt: "Logging order into WhatsBoard"
  },
  {
    number: "03",
    icon: ArrowRightLeft,
    title: "Track Progress",
    description: "Move orders through stages: New → Confirmed → Packed → Shipped → Delivered. Always know where every order stands.",
    image: "/images/step-track.jpg",
    alt: "Tracking order progress"
  },
  {
    number: "04",
    icon: Truck,
    title: "Deliver & Delight",
    description: "Never forget a follow-up. Deliver on time. Keep customers happy and coming back.",
    image: "/images/step-deliver.jpg",
    alt: "Successful delivery"
  }
]

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const { t } = useLanguage()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="py-24 lg:py-32 bg-background overflow-hidden"
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
            {t("Simple & Powerful")}
          </span>
          <h2
            className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground text-balance"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t("How WhatsBoard Works")}
          </h2>
          <p className="mt-6 text-lg text-muted-foreground text-pretty">
            {t("Four simple steps to transform your WhatsApp selling into a professional operation.")}
          </p>
        </div>

        {/* Steps Layout */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Steps List */}
          <div className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div
                  key={step.number}
                  className={cn(
                    "relative p-6 rounded-2xl cursor-pointer transition-all duration-300",
                    isVisible
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-8",
                    activeStep === index
                      ? "bg-primary/5 border-2 border-primary shadow-lg"
                      : "bg-secondary/50 border-2 border-transparent hover:bg-secondary"
                  )}
                  style={{ transitionDelay: `${index * 100}ms` }}
                  onClick={() => setActiveStep(index)}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300",
                        activeStep === index
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={cn(
                            "text-xs font-bold uppercase tracking-wider transition-colors duration-300",
                            activeStep === index
                              ? "text-primary"
                              : "text-muted-foreground"
                          )}
                        >
                          {t("Step")} {step.number}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">
                        {t(step.title)}
                      </h3>
                      <p
                        className={cn(
                          "text-sm text-muted-foreground transition-all duration-300",
                          activeStep === index
                            ? "opacity-100 max-h-20"
                            : "opacity-70 max-h-12 overflow-hidden"
                        )}
                      >
                        {t(step.description)}
                      </p>
                    </div>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-10 top-full w-0.5 h-6 bg-border" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Visual */}
          <div
            className={cn(
              "relative transition-all duration-700 delay-300",
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            )}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className={cn(
                    "transition-all duration-500",
                    activeStep === index
                      ? "opacity-100 relative"
                      : "opacity-0 absolute inset-0"
                  )}
                >
                  <Image
                    src={step.image}
                    alt={step.alt}
                    width={600}
                    height={450}
                    className="w-full h-auto object-cover"
                  />
                </div>
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
            </div>

            {/* Step Indicator */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background rounded-full px-4 py-2 shadow-lg">
              {steps.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    activeStep === index
                      ? "bg-primary w-8"
                      : "bg-muted hover:bg-muted-foreground/50"
                  )}
                  onClick={() => setActiveStep(index)}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
