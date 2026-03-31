import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getViewerContext } from "@/lib/queries";
import { PLAN_CONFIG, type PlanKey } from "@/lib/billing";
import { startPlanCheckoutAction } from "./actions";

const tiers = [
  {
    key: "starter" as PlanKey,
    name: "Starter",
    price: "TZS 29,000",
    period: "/month",
    description: "For solo sellers who are tired of running biashara by screenshots and memory.",
    badge: "Good for beginners",
    highlight: false,
    features: [
      "Up to 150 orders / month",
      "Order tracking board",
      "Customer list",
      "Payment status tracking",
      "Basic follow-ups",
      "Mobile-friendly dashboard",
    ],
  },
  {
    key: "growth" as PlanKey,
    name: "Growth",
    price: "TZS 79,000",
    period: "/month",
    description: "For serious sellers and small teams handling many chats every day.",
    badge: "Most Popular",
    highlight: true,
    features: [
      "Up to 1,000 orders / month",
      "Everything in Starter",
      "Advanced follow-ups",
      "Delivery / dispatch tracking",
      "Team workflow support",
      "Priority support",
    ],
  },
  {
    key: "business" as PlanKey,
    name: "Business",
    price: "TZS 149,000",
    period: "/month",
    description: "For growing brands that want clean operations, more control, and less stress.",
    badge: "For teams",
    highlight: false,
    features: [
      "Unlimited orders",
      "Everything in Growth",
      "Multi-staff operations",
      "Deeper reporting",
      "Faster support",
      "More serious-looking business energy",
    ],
  },
];

function CheckoutButton({
  loggedIn,
  currentPlan,
  currentStatus,
  tierKey,
}: {
  loggedIn: boolean;
  currentPlan?: string | null;
  currentStatus?: string | null;
  tierKey: PlanKey;
}) {
  const isCurrentPlan = currentPlan === tierKey && currentStatus === "active";

  if (!loggedIn) {
    return (
      <Link
        href="/register"
        className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
      >
        Start Free
      </Link>
    );
  }

  if (isCurrentPlan) {
    return (
      <span className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700">
        Current Plan
      </span>
    );
  }

  return (
    <form action={startPlanCheckoutAction.bind(null, tierKey)} className="mt-6">
      <button
        type="submit"
        className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
      >
        {currentPlan ? `Switch to ${PLAN_CONFIG[tierKey].name}` : `Pay for ${PLAN_CONFIG[tierKey].name}`}
      </button>
    </form>
  );
}

export default async function PricingPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; message?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { business } = user ? await getViewerContext() : { business: null };
  const resolvedSearch = (await searchParams) ?? {};

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-600">
              Pricing
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Pay in TZS. Activate your plan on real checkout.
            </h1>
            <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
              WHATSBOARD pricing is now connected to live Snippe hosted payments. Pick a plan,
              pay securely, and your business plan updates automatically after webhook confirmation.
            </p>
          </div>

          {resolvedSearch.status === "error" ? (
            <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {resolvedSearch.message || "Unable to start checkout."}
            </div>
          ) : null}

          {user && business ? (
            <div className="mx-auto mt-8 max-w-3xl rounded-[28px] border border-slate-200 bg-slate-50 p-5 text-left">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Current billing</p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-black text-slate-950">
                    {business.billing_plan ? PLAN_CONFIG[business.billing_plan as PlanKey]?.name ?? business.billing_plan : "No active plan"}
                  </p>
                  <p className="text-sm text-slate-600">
                    Status: {business.billing_status || "inactive"}
                    {business.billing_current_period_ends_at
                      ? ` • Paid through ${new Date(business.billing_current_period_ends_at).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                <Link
                  href="/dashboard/account"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-slate-400"
                >
                  View account billing
                </Link>
              </div>
            </div>
          ) : null}

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={[
                  "rounded-[32px] border p-6 shadow-sm",
                  tier.highlight
                    ? "border-emerald-500 bg-slate-950 text-white shadow-xl"
                    : "border-slate-200 bg-white text-slate-900",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p
                      className={[
                        "text-sm font-bold uppercase tracking-[0.18em]",
                        tier.highlight ? "text-emerald-300" : "text-emerald-600",
                      ].join(" ")}
                    >
                      {tier.name}
                    </p>
                    <h2 className="mt-3 text-4xl font-black tracking-tight">
                      {tier.price}
                      <span
                        className={[
                          "ml-1 text-sm font-semibold",
                          tier.highlight ? "text-white/70" : "text-slate-500",
                        ].join(" ")}
                      >
                        {tier.period}
                      </span>
                    </h2>
                  </div>

                  <span
                    className={[
                      "rounded-full px-3 py-1 text-xs font-bold",
                      tier.highlight
                        ? "bg-emerald-500 text-white"
                        : "bg-emerald-50 text-emerald-700",
                    ].join(" ")}
                  >
                    {tier.badge}
                  </span>
                </div>

                <p
                  className={[
                    "mt-5 text-sm leading-6",
                    tier.highlight ? "text-white/80" : "text-slate-600",
                  ].join(" ")}
                >
                  {tier.description}
                </p>

                <CheckoutButton
                  loggedIn={Boolean(user)}
                  currentPlan={business?.billing_plan}
                  currentStatus={business?.billing_status}
                  tierKey={tier.key}
                />

                <div
                  className={[
                    "my-6 h-px",
                    tier.highlight ? "bg-white/10" : "bg-slate-200",
                  ].join(" ")}
                />

                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className={[
                        "flex items-start gap-3 text-sm",
                        tier.highlight ? "text-white/85" : "text-slate-700",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-black",
                          tier.highlight
                            ? "bg-emerald-500 text-white"
                            : "bg-emerald-50 text-emerald-700",
                        ].join(" ")}
                      >
                        ✓
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-[28px] border border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-lg font-black text-slate-900">
              Snippe checkout handles the payment page. WHATSBOARD handles the plan activation after webhook confirmation.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              That keeps checkout secure and keeps your plan state tied to the business record already used by the dashboard.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
