"use client"

import Link from "next/link"
import { useLanguage } from "@/components/i18n/language-provider"

const footerLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Pricing", href: "/pricing" },
  { label: "Login", href: "/login" },
  { label: "Start Free", href: "/register" },
]

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 py-16 lg:flex-row lg:items-end lg:justify-between lg:py-20">
          <div className="max-w-sm">
            <Link href="/" className="mb-6 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">W</span>
              </div>
              <span
                className="text-2xl font-bold text-background"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Folapp
              </span>
            </Link>
            <p className="text-background/70">
              {t("The order management system for Tanzanian and East African online sellers. Turn chat chaos into organized growth.")}
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-background/70 transition-colors hover:text-primary"
              >
                {t(link.label)}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-background/10 py-6 text-sm text-background/50 sm:flex-row">
          <p>{t("© 2026 Folapp. All rights reserved.")}</p>
          <p>{t("Built for Tanzanian and East African online sellers.")}</p>
        </div>
      </div>
    </footer>
  )
}
