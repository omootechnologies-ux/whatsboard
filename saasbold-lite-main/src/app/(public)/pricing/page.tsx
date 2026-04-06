import Link from "next/link";
import { Check } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { BillingPlanConfig, listBillingPlanConfigs } from "@/lib/billing/plans";
import { PricingCard } from "@/components/whatsboard-public/pricing-card";
import { getPricingPlans } from "@/data/pricing-plans";
import type { ReactNode } from "react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: t("pages.pricing.title"),
    description: t("pages.pricing.description"),
  };
}

type ComparisonRow = {
  label: string;
  render: (plan: BillingPlanConfig) => ReactNode;
};

export default async function PricingPage() {
  const t = await getTranslations();
  const locale = await getLocale();
  const pricingPlans = getPricingPlans(locale);
  const billingPlans = listBillingPlanConfigs();
  const numberLocale = locale === "sw" ? "sw-TZ" : "en-TZ";

  const comparisonRows: ComparisonRow[] = [
    {
      label: t("pricing.ordersLimit"),
      render: (plan) => {
        if (!plan.orderLimitPerMonth) {
          return t("pricing.unlimited");
        }
        return t("pricing.ordersLimitValue", {
          limit: plan.orderLimitPerMonth.toLocaleString(numberLocale),
        });
      },
    },
    {
      label: t("pricing.teamSeats"),
      render: (plan) => plan.teamMemberLimit,
    },
    {
      label: t("pricing.followUps"),
      render: (plan) =>
        plan.key === "free" ? (
          <span className="text-sm text-[var(--color-wb-text-muted)]">—</span>
        ) : (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-wb-primary)]">
            <Check className="h-4 w-4" />
            {t("pricing.included")}
          </span>
        ),
    },
    {
      label: t("pricing.paymentTracking"),
      render: (plan) =>
        plan.key === "free" ? (
          <span className="text-sm text-[var(--color-wb-text-muted)]">—</span>
        ) : (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-wb-primary)]">
            <Check className="h-4 w-4" />
            {t("pricing.included")}
          </span>
        ),
    },
    {
      label: t("pricing.dispatchTracking"),
      render: (plan) =>
        plan.key === "free" ? (
          <span className="text-sm text-[var(--color-wb-text-muted)]">—</span>
        ) : (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-wb-primary)]">
            <Check className="h-4 w-4" />
            {t("pricing.included")}
          </span>
        ),
    },
    {
      label: t("pricing.analytics"),
      render: (plan) =>
        plan.key === "growth" || plan.key === "business" ? (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-wb-primary)]">
            <Check className="h-4 w-4" />
            {t("pricing.included")}
          </span>
        ) : (
          <span className="text-sm text-[var(--color-wb-text-muted)]">—</span>
        ),
    },
    {
      label: t("pricing.prioritySupport"),
      render: (plan) =>
        plan.key === "business" ? (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-wb-primary)]">
            <Check className="h-4 w-4" />
            {t("pricing.included")}
          </span>
        ) : (
          <span className="text-sm text-[var(--color-wb-text-muted)]">—</span>
        ),
    },
  ];

  const planMatrix = billingPlans.map((plan) => {
    const metadata = pricingPlans.find((pricing) => pricing.key === plan.key);
    return {
      config: plan,
      pricing: metadata,
    };
  });

  return (
    <main className="mx-auto w-full max-w-[1240px] px-4 py-12 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-[var(--color-wb-border)] bg-white p-8 text-center shadow-[0_25px_60px_rgba(9,17,21,0.12)] sm:p-10 lg:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wb-primary)]">
          {t("pricing.heroTagline")}
        </p>
        <h1 className="mt-6 text-4xl font-black leading-tight tracking-[-0.03em] text-[var(--color-wb-text)] sm:text-5xl">
          {t("pricing.heroHeadline")}
        </h1>
        <p className="mt-4 text-lg text-[var(--color-wb-text-muted)] sm:text-xl">
          {t("pricing.heroBody")}
        </p>
        <p className="mt-2 text-sm text-[var(--color-wb-text-muted)]">
          {t("pricing.ordersLimitCopy")}
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/register?force=1" className="wb-button-primary">
            {t("actions.startFree")}
          </Link>
          <Link href="/login?next=%2Fdashboard" className="wb-button-secondary">
            {t("actions.watchDemo")}
          </Link>
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-4">
        {pricingPlans.map((plan) => (
          <PricingCard key={plan.key} plan={plan} />
        ))}
      </section>

      <section className="mt-16 rounded-[28px] border border-[var(--color-wb-border)] bg-white p-8 shadow-[0_25px_50px_rgba(15,93,70,0.08)]">
        <div className="w-full overflow-x-auto">
          <div className="flex flex-col gap-2 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wb-primary)]">
              {t("pricing.comparisonTitle")}
            </p>
            <h2 className="mt-2 text-3xl font-black text-[var(--color-wb-text)]">
              {t("pricing.comparisonSubtitle")}
            </h2>
            <p className="text-sm text-[var(--color-wb-text-muted)]">
              {t("pricing.comparisonContact")}
            </p>
          </div>

          <table className="mt-8 w-full min-w-[560px] table-auto border-separate border-spacing-y-3">
            <thead>
              <tr>
                <th className="py-2 pr-6 text-left text-sm font-semibold tracking-wide text-[var(--color-wb-text-muted)]">
                  {t("pricing.comparisonTitle")}
                </th>
                {planMatrix.map(({ config, pricing }) => (
                  <th key={config.key} className="whitespace-nowrap text-left text-sm font-medium">
                    <span className="text-[var(--color-wb-text)]">{pricing?.name ?? config.name}</span>
                    <p className="text-xs text-[var(--color-wb-text-muted)]">
                      {pricing?.priceLabel}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.label} className="border-t border-[var(--color-wb-border)]">
                  <td className="py-4 pr-6 text-sm font-semibold text-[var(--color-wb-text-muted)]">
                    {row.label}
                  </td>
                  {planMatrix.map(({ config }) => (
                    <td key={`${row.label}-${config.key}`} className="py-4 text-sm text-[var(--color-wb-text-muted)]">
                      {row.render(config)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-16 rounded-[28px] border border-dashed border-[var(--color-wb-border)] bg-[var(--color-wb-primary-soft)] p-8 text-center text-[var(--color-wb-text)] shadow-[0_20px_60px_rgba(15,93,70,0.18)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wb-primary)]">
          {t("pricing.ctaHeadline")}
        </p>
        <p className="mt-4 text-3xl font-black text-[var(--color-wb-text)]">
          {t("pricing.ctaBody")}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/register?force=1" className="wb-button-primary">
            {t("pricing.ctaButtonPrimary")}
          </Link>
          <Link href="mailto:hello@folapp.co" className="wb-button-secondary">
            {t("pricing.ctaSupport")}
          </Link>
        </div>
      </section>
    </main>
  );
}
