"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useLanguage } from "@/components/i18n/language-provider"
import { cn } from "@/lib/utils"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Asha Mushi",
    role: "Fashion Seller, Dar es Salaam",
    image: "/images/testimonial-1.jpg",
    quote: "Before Folapp, I was losing at least 5 orders every week. Now I handle 3x more orders with zero stress. My customers even notice how professional I've become.",
    stats: { metric: "300%", label: "More orders" }
  },
  {
    name: "Brian Otieno",
    role: "Electronics Seller, Nairobi",
    image: "/images/testimonial-2.jpg",
    quote: "I used to stay up until 2am trying to remember who ordered what. Folapp gave me my evenings back. My family is happier, and honestly, so am I.",
    stats: { metric: "0", label: "Missed orders" }
  },
  {
    name: "Neema Juma",
    role: "Beauty Seller, Arusha",
    image: "/images/testimonial-3.jpg",
    quote: "My business grew so fast I couldn't keep up. Folapp saved my sanity. I can now track 50+ orders daily without breaking a sweat.",
    stats: { metric: "50+", label: "Daily orders" }
  }
]

export function TestimonialsSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
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
      setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isVisible])

  return (
    <section
      id="testimonials"
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
            {t("Success Stories")}
          </span>
          <h2
            className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground text-balance"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t("Sellers Who Transformed ")}
            <span className="text-primary">{t("Their Business")}</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground text-pretty">
            {t("Real stories from East African sellers who said goodbye to chaos.")}
          </p>
        </div>

        {/* Featured Testimonial */}
        <div
          className={cn(
            "max-w-4xl mx-auto mb-16 transition-all duration-700",
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          )}
        >
          <div className="relative bg-card rounded-3xl p-8 lg:p-12 border border-border shadow-xl overflow-hidden">
            {/* Background Quote */}
            <Quote className="absolute top-8 right-8 w-24 h-24 text-primary/5" />

            <div className="relative z-10">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.name}
                  className={cn(
                    "transition-all duration-500",
                    activeIndex === index
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4 absolute inset-0 pointer-events-none"
                  )}
                >
                  <div className="flex flex-col lg:flex-row items-center gap-8">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      <div className="relative w-32 h-32 lg:w-40 lg:h-40 rounded-2xl overflow-hidden shadow-lg">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-center lg:text-left">
                      {/* Stars */}
                      <div className="flex items-center justify-center lg:justify-start gap-1 mb-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className="w-5 h-5 fill-yellow-500 text-yellow-500"
                          />
                        ))}
                      </div>

                      {/* Quote */}
                      <blockquote className="text-lg lg:text-xl text-foreground leading-relaxed mb-6">
                        &ldquo;{t(testimonial.quote)}&rdquo;
                      </blockquote>

                      {/* Author */}
                      <div className="flex items-center justify-center lg:justify-start gap-4">
                        <div>
                          <p className="font-bold text-foreground">
                            {testimonial.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {testimonial.role}
                          </p>
                        </div>
                        <div className="w-px h-12 bg-border" />
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">
                            {testimonial.stats.metric}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t(testimonial.stats.label)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Dots */}
            <div className="flex items-center justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    activeIndex === index
                      ? "bg-primary w-8"
                      : "bg-muted hover:bg-muted-foreground/50"
                  )}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`View testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div
          className={cn(
            "grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 transition-all duration-700 delay-300",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          {[
            { value: "2,500+", label: "Waiting Sellers" },
            { value: "50,000+", label: "Orders To Be Tracked" },
            { value: "6+", label: "East African Cities" },
            { value: "4.9/5", label: "Average Rating" }
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="text-center p-6 rounded-2xl bg-card border border-border"
            >
              <p className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{t(stat.label)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
