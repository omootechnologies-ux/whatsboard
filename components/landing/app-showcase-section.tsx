"use client"

import { useEffect, useRef, useState } from "react"
import { useLanguage } from "@/components/i18n/language-provider"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Package, Bell, BarChart3, Clock } from "lucide-react"

const features = [
  {
    icon: LayoutDashboard,
    title: "Visual Kanban Board",
    description: "Drag and drop orders through stages. See everything at a glance."
  },
  {
    icon: Users,
    title: "Customer Database",
    description: "All your customers in one place. Know their history and preferences."
  },
  {
    icon: Package,
    title: "Order Management",
    description: "Track products, quantities, payments, and delivery in every order."
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description: "Never forget a follow-up. Get notified when action is needed."
  },
  {
    icon: BarChart3,
    title: "Sales Insights",
    description: "See what's selling. Track your revenue. Grow smarter."
  },
  {
    icon: Clock,
    title: "Order Timeline",
    description: "Full history of every order. Know exactly what happened when."
  }
]

export function AppShowcaseSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
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
            {t("Powerful Features")}
          </span>
          <h2
            className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground text-balance"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t("Everything You Need to ")}
            <span className="text-primary">{t("Sell Smarter")}</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground text-pretty">
            {t("Built specifically for online sellers. Every feature designed to save you time.")}
          </p>
        </div>

        {/* App Preview */}
        <div
          className={cn(
            "relative max-w-5xl mx-auto mb-16 lg:mb-24 transition-all duration-1000",
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          )}
        >
          <div className="relative rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            {/* App Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-primary/60" />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="px-4 py-1 rounded-md bg-background text-xs text-muted-foreground">
                  app.whatsboard.com
                </div>
              </div>
            </div>

            {/* App Content - Kanban Board */}
            <div className="p-6 bg-secondary/30">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-foreground">{t("Order Board")}</h3>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-md bg-primary/10 text-primary text-sm font-medium">
                    {t("Today: 12 Orders")}
                  </div>
                </div>
              </div>

              {/* Kanban Columns */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { title: "New", count: 4, color: "bg-blue-500" },
                  { title: "Confirmed", count: 3, color: "bg-yellow-500" },
                  { title: "Packed", count: 3, color: "bg-orange-500" },
                  { title: "Delivered", count: 2, color: "bg-primary" }
                ].map((column, colIndex) => (
                  <div
                    key={column.title}
                    className={cn(
                      "rounded-xl bg-background p-4 transition-all duration-500",
                      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    )}
                    style={{ transitionDelay: `${colIndex * 100 + 300}ms` }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className={cn("w-2 h-2 rounded-full", column.color)} />
                      <span className="text-sm font-medium text-foreground">{t(column.title)}</span>
                      <span className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {column.count}
                      </span>
                    </div>

                    {/* Order Cards */}
                    <div className="space-y-2">
                      {Array.from({ length: Math.min(column.count, 2) }).map((_, cardIndex) => (
                        <div
                          key={cardIndex}
                          className="p-3 rounded-lg border border-border bg-card hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                              {["AM", "BN", "CK", "DL"][colIndex]}
                            </div>
                            <span className="text-sm font-medium text-foreground truncate">
                              {["Amara M.", "Bola N.", "Chidi K.", "Dayo L."][colIndex]}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {["2x Designer Bag", "1x Custom Dress", "3x Sneakers", "1x Watch Set"][colIndex]}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs font-medium text-primary">
                              TZS {["45,000", "28,000", "67,500", "125,000"][colIndex]}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {["2h ago", "4h ago", "Today", "Yesterday"][colIndex]}
                            </span>
                          </div>
                        </div>
                      ))}
                      {column.count > 2 && (
                        <div className="text-center py-2">
                          <span className="text-xs text-muted-foreground">
                            +{column.count - 2} {t("more")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -z-10 -top-8 -right-8 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -z-10 -bottom-8 -left-8 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        </div>

        {/* Feature Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className={cn(
                  "group p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
                  activeFeature === index && "border-primary/30 shadow-lg"
                )}
                style={{ transitionDelay: `${index * 50 + 500}ms` }}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {t(feature.title)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(feature.description)}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
