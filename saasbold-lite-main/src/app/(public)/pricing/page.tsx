import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { PricingCard } from "@/components/whatsboard-public/pricing-card";
import { getPricingPlans } from "@/data/pricing-plans";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: t("pages.pricing.title"),
    description: t("pages.pricing.description"),
  };
}

export default async function PricingPage() {
  const t = await getTranslations();
  const locale = await getLocale();
  const pricingPlans = getPricingPlans(locale);

  return (
    <main className="mx-auto w-full max-w-[1240px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="wb-button-secondary">
          <ArrowLeft className="h-4 w-4" />
          {t("actions.back")}
        </Link>
        <Link href="/login?next=%2Fdashboard" className="wb-button-secondary">
          {t("actions.watchDemo")}
        </Link>
      </div>

      <div className="mx-auto mt-10 max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wb-primary)]">
          {t("footer.pricing")}
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[var(--color-wb-text)] sm:text-5xl">
          {locale === "sw"
            ? "Bei wazi kwa biashara makini."
            : "Clear pricing for serious selling."}
        </h1>
        <p className="mt-4 text-base leading-8 text-[var(--color-wb-text-muted)] sm:text-lg">
          {locale === "sw"
            ? "Anza na Bure, kisha boresha plan unapohitaji scale kubwa, uwezo wa timu, na operesheni za kina."
            : "Start on Free, then upgrade when you need more scale, team capacity, and deeper operations."}
        </p>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-4">
        {pricingPlans.map((plan) => (
          <PricingCard key={plan.key} plan={plan} />
        ))}
      </div>

      <div className="mt-10 wb-shell-card p-6 text-center sm:p-8">
        <p className="inline-flex items-center gap-2 rounded-full bg-[var(--color-wb-primary-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-wb-primary)]">
          <ShieldCheck className="h-3.5 w-3.5" />
          {locale === "sw" ? "Uwazi wa billing" : "Billing clarity"}
        </p>
        <p className="mt-4 text-lg font-semibold text-[var(--color-wb-text)]">
          {locale === "sw"
            ? "Plan ya Bure inajumuisha order 30 kwa mwezi. Plans zinazolipiwa zinafungua operesheni za kila siku na workflow za timu."
            : "Free includes 30 orders per month. Paid plans unlock deeper daily operations and team workflows."}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/register?force=1" className="wb-button-primary">
            {t("actions.startFree")}
          </Link>
          <Link href="/login" className="wb-button-secondary">
            {t("actions.login")}
          </Link>
        </div>
      </div>
    </main>
  );
}
