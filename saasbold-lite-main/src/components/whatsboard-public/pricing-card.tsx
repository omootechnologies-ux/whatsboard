import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { PricingPlan } from "@/data/pricing-plans";

export function PricingCard({ plan }: { plan: PricingPlan }) {
  return (
    <article
      className={`flex h-full flex-col rounded-[28px] border p-6 ${
        plan.highlight
          ? "border-[var(--color-wb-primary)] bg-[var(--color-wb-primary)] text-white shadow-[0_28px_60px_rgba(15,93,70,0.24)]"
          : "border-[var(--color-wb-border)] bg-white shadow-[0_16px_40px_rgba(17,17,17,0.06)]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={`text-xs font-bold uppercase tracking-[0.2em] ${
              plan.highlight
                ? "text-white/75"
                : "text-[var(--color-wb-primary)]"
            }`}
          >
            {plan.name}
          </p>
          <p className="mt-3 text-3xl font-black tracking-[-0.04em]">
            {plan.priceLabel}
          </p>
          <p
            className={`text-sm ${plan.highlight ? "text-white/78" : "text-[var(--color-wb-text-muted)]"}`}
          >
            {plan.cadence}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            plan.highlight
              ? "bg-white text-[var(--color-wb-primary)]"
              : "bg-[var(--color-wb-primary-soft)] text-[var(--color-wb-primary)]"
          }`}
        >
          {plan.badge}
        </span>
      </div>

      <p
        className={`mt-5 min-h-[72px] text-sm leading-6 ${
          plan.highlight ? "text-white/82" : "text-[var(--color-wb-text-muted)]"
        }`}
      >
        {plan.description}
      </p>

      <ul className="mt-5 space-y-2">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className={`flex items-start gap-2 text-sm ${
              plan.highlight
                ? "text-white/88"
                : "text-[var(--color-wb-text-muted)]"
            }`}
          >
            <CheckCircle2
              className={`mt-0.5 h-4 w-4 shrink-0 ${
                plan.highlight ? "text-white" : "text-[var(--color-wb-primary)]"
              }`}
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={plan.ctaHref}
        className={`mt-7 inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
          plan.highlight
            ? "bg-white text-[var(--color-wb-primary)] hover:bg-white/90"
            : "bg-[var(--color-wb-primary)] text-white hover:bg-[var(--color-wb-primary-dark)]"
        }`}
      >
        {plan.ctaLabel}
      </Link>
    </article>
  );
}
