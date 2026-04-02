import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { PricingCard } from "@/components/whatsboard-public/pricing-card";
import { pricingPlans } from "@/data/pricing-plans";

export const metadata = {
  title: "Pricing | WhatsBoard",
  description:
    "Clear monthly TZS pricing for East African online sellers using WhatsBoard.",
};

export default function PricingPage() {
  return (
    <main className="mx-auto w-full max-w-[1240px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="wb-button-secondary">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <Link href="/login?next=%2Fdashboard" className="wb-button-secondary">
          Watch Demo
        </Link>
      </div>

      <div className="mx-auto mt-10 max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wb-primary)]">
          Pricing
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[var(--color-wb-text)] sm:text-5xl">
          Clear pricing for serious selling.
        </h1>
        <p className="mt-4 text-base leading-8 text-[var(--color-wb-text-muted)] sm:text-lg">
          Start on Free, then upgrade when you need more scale, team capacity,
          and deeper operations.
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
          Billing clarity
        </p>
        <p className="mt-4 text-lg font-semibold text-[var(--color-wb-text)]">
          Free includes 30 orders per month. Paid plans unlock deeper daily
          operations and team workflows.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/register" className="wb-button-primary">
            Start Free
          </Link>
          <Link href="/login" className="wb-button-secondary">
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}
