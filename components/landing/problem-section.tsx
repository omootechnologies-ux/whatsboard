"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useLanguage } from "@/components/i18n/language-provider"
import { cn } from "@/lib/utils"

const problems = [
  {
    title: "Drowning in Messages",
    description: "Hundreds of unread chats. Important orders buried in the chaos.",
    image: "/images/problem-messages.jpg",
    alt: "Overwhelmed by too many WhatsApp messages"
  },
  {
    title: "Forgetting Orders",
    description: "Who ordered what? When? How much did they pay? You can't remember.",
    image: "/images/problem-forgetting.jpg",
    alt: "Confused about customer orders"
  },
  {
    title: "Customers Waiting",
    description: "Frustrated customers. Slow responses. Lost trust and sales.",
    image: "/images/problem-waiting.jpg",
    alt: "Customer waiting for response"
  },
  {
    title: "Burnout & Exhaustion",
    description: "Working late. Mental overload. Your business is running you.",
    image: "/images/problem-burnout.jpg",
    alt: "Entrepreneur experiencing burnout"
  }
]

const painStats = [
  {
    value: "5+",
    label: "Orders can disappear in one busy day",
  },
  {
    value: "1 reply",
    label: "too late can push a customer to another seller",
  },
  {
    value: "Every delay",
    label: "makes your business look less serious",
  },
]

export function ProblemSection() {
  const [activeIndex, setActiveIndex] = useState(0)
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

  useEffect(() => {
    if (!isVisible) return
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % problems.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [isVisible])

  return (
    <section
      id="problem"
      ref={sectionRef}
      className="py-24 lg:py-32 bg-gradient-to-b from-background to-secondary/20 overflow-hidden"
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
            {t("The Reality")}
          </span>
          <h2
            className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground text-balance"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t("Does This Sound Like Your Daily Struggle?")}
          </h2>
          <p className="mt-6 text-lg text-muted-foreground text-pretty">
            {t("You started selling online to build freedom. But now, WhatsApp runs your life.")}
          </p>
          <p className="mt-4 text-base font-medium text-foreground/80 text-pretty">
            {t("Every missed reply, forgotten payment, or delayed delivery gives another seller a chance to win your customer.")}
          </p>
        </div>

        <div
          className={cn(
            "mb-12 grid gap-4 md:grid-cols-3 transition-all duration-700 delay-150",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          {painStats.map((item, index) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[#e8e8e2] bg-white p-5 shadow-sm"
              style={{ transitionDelay: `${index * 120}ms` }}
            >
              <p className="text-2xl font-bold tracking-tight text-[#111111]">{item.value}</p>
              <p className="mt-2 text-sm leading-6 text-[#5e6461]">{t(item.label)}</p>
            </div>
          ))}
        </div>

        {/* Problem Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, index) => (
            <div
              key={problem.title}
              className={cn(
                "group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8",
                activeIndex === index
                  ? "ring-2 ring-primary shadow-xl scale-105"
                  : "hover:shadow-lg hover:scale-102"
              )}
              style={{ transitionDelay: `${index * 100}ms` }}
              onClick={() => setActiveIndex(index)}
            >
              <div className="aspect-[4/5] relative">
                <Image
                  src={problem.image}
                  alt={problem.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div
                  className={cn(
                    "absolute inset-0 transition-opacity duration-300",
                    activeIndex === index
                      ? "bg-gradient-to-t from-black/80 via-black/40 to-transparent"
                      : "bg-gradient-to-t from-black/60 via-black/20 to-transparent"
                  )}
                />
              </div>

              <div className="absolute inset-x-0 bottom-0 p-6">
                <div
                  className={cn(
                    "transition-all duration-300",
                    activeIndex === index ? "translate-y-0" : "translate-y-2"
                  )}
                >
                  <h3 className="text-lg font-bold text-white mb-2">
                    {t(problem.title)}
                  </h3>
                  <p
                    className={cn(
                      "text-sm text-white/80 transition-all duration-300",
                      activeIndex === index
                        ? "opacity-100 max-h-20"
                        : "opacity-0 max-h-0 overflow-hidden"
                    )}
                  >
                    {t(problem.description)}
                  </p>
                </div>
              </div>

              {/* Progress Indicator */}
              {activeIndex === index && (
                <div className="absolute top-4 left-4 right-4">
                  <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full animate-progress" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Emotional Statement */}
        <div
          className={cn(
            "mt-16 text-center transition-all duration-700 delay-500",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <p className="text-xl sm:text-2xl text-foreground font-medium max-w-2xl mx-auto text-pretty">
            {t("You're not alone.")}{" "}
            <span className="text-primary">{t("Thousands of East African sellers")}</span>{" "}
            {t("face this chaos every single day.")}
          </p>
          <p className="mt-4 max-w-3xl mx-auto text-base leading-7 text-muted-foreground text-pretty">
            {t("The sellers who fix this early look faster, more trustworthy, and more professional. The ones who wait keep losing sales inside the same chats that bring them customers.")}
          </p>
        </div>
      </div>
    </section>
  )
}
