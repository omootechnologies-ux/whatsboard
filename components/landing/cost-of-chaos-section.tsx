"use client"

import Link from "next/link"
import { AlertTriangle, Clock3, ReceiptText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/i18n/language-provider"

const cards = [
  {
    icon: ReceiptText,
    title: "Missed Orders",
    body: "Two forgotten orders a week can quietly cost you more than you think.",
  },
  {
    icon: Clock3,
    title: "Late Replies",
    body: "One slow reply can send a customer to another seller and reduce repeat business.",
  },
  {
    icon: AlertTriangle,
    title: "Mental Overload",
    body: "Every hour spent digging through chats is time not spent selling, packing, or delivering.",
  },
]

export function CostOfChaosSection() {
  const { t } = useLanguage()

  return (
    <section className="bg-background py-24 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">
              {t("COST OF DOING NOTHING")}
            </p>
            <h2
              className="mt-4 text-3xl font-bold tracking-tight text-[#0a3d2e] sm:text-4xl lg:text-5xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t("How Much Is WhatsApp Chaos Costing You Every Week?")}
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[#111111]">
              {t("You do not need 100 lost customers to have a problem. Sometimes 2 forgotten orders, 3 delayed replies, and 1 unpaid delivery are already enough to quietly damage your business.")}
            </p>
          </div>

          <div className="mt-10 rounded-[28px] border border-[#e8e8e2] bg-white px-6 py-6 text-center shadow-sm sm:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#5e6461]">
              {t("Cost snapshot")}
            </p>
            <p className="mt-3 text-2xl font-bold tracking-tight text-[#0a3d2e] sm:text-3xl">
              {t("Lose just 2 orders a week worth TZS 20,000 each = TZS 160,000 lost per month")}
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {cards.map((card) => {
              const Icon = card.icon

              return (
                <article
                  key={card.title}
                  className="rounded-[26px] border border-[#e8e8e2] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(17,17,17,0.08)]"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold tracking-tight text-[#0a3d2e]">
                    {t(card.title)}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#111111]">
                    {t(card.body)}
                  </p>
                </article>
              )
            })}
          </div>

          <div className="mt-10 rounded-[28px] border border-[#e8e8e2] bg-[#fafaf7] px-6 py-8 text-center sm:px-8">
            <p className="mx-auto max-w-3xl text-lg font-semibold leading-8 text-[#0a3d2e]">
              {t("Most sellers do not have a marketing problem. They have a follow-up problem dressed like normal business.")}
            </p>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-[#111111]">
              {t("WhatsBoard Starter is TZS 15,000/month. Losing even one order can cost more than that.")}
            </p>
          </div>

          <div className="mt-10 rounded-[32px] border border-[#dbe7e0] bg-white px-6 py-8 shadow-sm sm:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h3
                className="text-2xl font-bold tracking-tight text-[#0a3d2e] sm:text-3xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {t("Stop losing money in silence")}
              </h3>
              <p className="mt-4 text-base leading-7 text-[#111111] sm:text-lg">
                {t("Track your first 30 orders free and see what organized selling feels like.")}
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Button size="lg" className="px-8" asChild>
                  <Link href="/register">{t("Start Free")}</Link>
                </Button>
                <Button size="lg" variant="outline" className="px-8" asChild>
                  <Link href="/pricing">{t("See Demo")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
