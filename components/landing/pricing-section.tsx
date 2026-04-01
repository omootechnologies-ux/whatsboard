"use client"

import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { useLanguage } from "@/components/i18n/language-provider"
import { PLAN_CONFIG } from "@/lib/plan-access"

const tiers = Object.values(PLAN_CONFIG)

export function PricingSection() {
  const { t } = useLanguage()

  return (
    <section id="pricing" className="bg-background py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="text-primary text-sm font-medium uppercase tracking-wider">
            {t("Pricing")}
          </span>
          <h2
            className="mt-4 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("Start free. Upgrade when your selling gets serious.")}
          </h2>
          <p className="mt-6 text-lg text-muted-foreground text-pretty">
            {t("Clear monthly pricing in TZS for Tanzanian and East African online sellers.")}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {tiers.map((plan) => (
            <div
              key={plan.key}
              className={[
                "rounded-3xl border p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1",
                plan.highlight
                  ? "border-primary bg-primary text-primary-foreground shadow-xl shadow-primary/15"
                  : "border-border bg-card text-foreground",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p
                    className={[
                      "text-sm font-bold uppercase tracking-[0.18em]",
                      plan.highlight ? "text-primary-foreground/75" : "text-primary",
                    ].join(" ")}
                  >
                    {t(plan.name)}
                  </p>
                  <h3 className="mt-3 text-4xl font-bold tracking-tight">{plan.priceLabel}</h3>
                  <p
                    className={[
                      "mt-1 text-sm",
                      plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground",
                    ].join(" ")}
                  >
                    {plan.key === "free" ? t("/forever") : t("/month")}
                  </p>
                </div>

                <span
                  className={[
                    "rounded-full px-3 py-1 text-xs font-bold",
                    plan.highlight ? "bg-white text-primary" : "bg-secondary text-primary",
                  ].join(" ")}
                >
                  {t(plan.badge)}
                </span>
              </div>

              <p
                className={[
                  "mt-5 min-h-[72px] text-sm leading-6",
                  plan.highlight ? "text-primary-foreground/82" : "text-muted-foreground",
                ].join(" ")}
              >
                {t(plan.description)}
              </p>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature.label}
                    className={[
                      "flex items-start gap-3 text-sm",
                      plan.highlight ? "text-primary-foreground/88" : "text-muted-foreground",
                    ].join(" ")}
                  >
                    <CheckCircle2
                      className={[
                        "mt-0.5 h-4 w-4 shrink-0",
                        plan.highlight ? "text-primary-foreground" : "text-primary",
                      ].join(" ")}
                    />
                    <span>
                      {t(feature.label)}
                      {feature.comingSoon ? ` ${t("(coming soon)")}` : ""}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.key === "free" ? "/register" : "/pricing"}
                className={[
                  "mt-8 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition-colors",
                  plan.highlight
                    ? "bg-white text-primary hover:bg-white/90"
                    : "bg-primary text-primary-foreground hover:bg-[#0a3d2e]",
                ].join(" ")}
              >
                {plan.key === "free" ? t("Start Free") : `${t("Choose")} ${t(plan.name)}`}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
