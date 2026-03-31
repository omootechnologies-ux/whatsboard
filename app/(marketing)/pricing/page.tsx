import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getViewerContext } from "@/lib/queries";
import { PLAN_CONFIG, type PlanKey } from "@/lib/billing";
import { getEffectivePlanKey, getPlanName } from "@/lib/plan-access";
import { startPlanCheckoutAction } from "./actions";

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
  if (tierKey === "free") {
    return (
      <span className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-700">
        Included after signup
      </span>
    );
  }

  const isCurrentPlan = currentPlan === tierKey && currentStatus === "active";

  if (!loggedIn) {
    return (
      <Link
        href="/register"
        className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[#173728] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0f281d]"
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
        className="inline-flex w-full items-center justify-center rounded-2xl bg-[#173728] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0f281d]"
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
  const effectivePlan = getEffectivePlanKey(business);
  const resolvedSearch = (await searchParams) ?? {};
  const tiers = Object.values(PLAN_CONFIG);

  return (
    <main className="min-h-screen bg-[#fafaf7] text-[#111111]">
      <section className="border-b border-[#e8e8e2] bg-[#fafaf7]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#0f5d46]">
              Pricing
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-[#111111] sm:text-5xl">
              Pay in TZS. Activate your plan on real checkout.
            </h1>
            <p className="mt-5 text-base leading-7 text-[#5e6461] sm:text-lg">
              WHATSBOARD pricing is now connected to live Snippe hosted payments. Pick a plan,
              pay securely, and your business plan updates automatically after webhook confirmation.
            </p>
          </div>

          {resolvedSearch.status === "error" ? (
            <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {resolvedSearch.message || "Unable to start checkout."}
            </div>
          ) : null}

          {resolvedSearch.status === "required" ? (
            <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {resolvedSearch.message || "You are on Free. Upgrade when you need more than 30 orders, follow-ups, payments, and customer workflows."}
            </div>
          ) : null}

          {resolvedSearch.status === "upgrade" ? (
            <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
              {resolvedSearch.message || "Upgrade your plan to unlock this feature."}
            </div>
          ) : null}

          {resolvedSearch.status === "processing" ? (
            <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {resolvedSearch.message || "Payment received. We are confirming your plan now."}
            </div>
          ) : null}

          {user && business ? (
            <div className="mx-auto mt-8 max-w-3xl rounded-[28px] border border-[#e8e8e2] bg-white p-5 text-left shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#5e6461]">Current billing</p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-lg font-black text-[#111111]">
                      {getPlanName(effectivePlan)}
                    </p>
                    <p className="text-sm text-[#5e6461]">
                    Status: {effectivePlan === "free" ? "free" : business.billing_status || "inactive"}
                    {business.billing_current_period_ends_at
                      ? effectivePlan !== "free"
                        ? ` • Paid through ${new Date(business.billing_current_period_ends_at).toLocaleDateString()}`
                        : ""
                      : ""}
                  </p>
                </div>
                <Link
                  href="/dashboard/account"
                  className="inline-flex items-center justify-center rounded-2xl border border-[#e8e8e2] bg-[#fafaf7] px-4 py-2.5 text-sm font-semibold text-[#111111] transition hover:bg-white"
                >
                  View account billing
                </Link>
              </div>
            </div>
          ) : null}

          <div className="mt-12 grid gap-6 lg:grid-cols-4">
            {tiers.map((tier) => (
              <div
                key={tier.key}
                className={[
                  "rounded-[32px] border p-6 shadow-sm",
                  tier.highlight
                    ? "border-[#173728] bg-[#173728] text-white shadow-xl"
                    : "border-[#e8e8e2] bg-white text-[#111111]",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p
                      className={[
                        "text-sm font-bold uppercase tracking-[0.18em]",
                        tier.highlight ? "text-white/76" : "text-[#0f5d46]",
                      ].join(" ")}
                    >
                      {tier.name}
                    </p>
                    <h2 className="mt-3 text-4xl font-black tracking-tight">
                      {tier.priceLabel}
                      <span
                        className={[
                          "ml-1 text-sm font-semibold",
                          tier.highlight ? "text-white/70" : "text-[#5e6461]",
                        ].join(" ")}
                      >
                        {tier.key === "free" ? "/forever" : "/month"}
                      </span>
                    </h2>
                  </div>

                  <span
                    className={[
                      "rounded-full px-3 py-1 text-xs font-bold",
                      tier.highlight
                        ? "bg-white text-[#173728]"
                        : "bg-[#f4f6f1] text-[#0f5d46]",
                    ].join(" ")}
                  >
                    {tier.badge}
                  </span>
                </div>

                <p
                  className={[
                    "mt-5 text-sm leading-6",
                    tier.highlight ? "text-white/80" : "text-[#5e6461]",
                  ].join(" ")}
                >
                  {tier.description}
                </p>

                <CheckoutButton
                  loggedIn={Boolean(user)}
                  currentPlan={effectivePlan}
                  currentStatus={business?.billing_status}
                  tierKey={tier.key}
                />

                <div
                  className={[
                    "my-6 h-px",
                    tier.highlight ? "bg-white/14" : "bg-[#e8e8e2]",
                  ].join(" ")}
                />

                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li
                      key={feature.label}
                      className={[
                        "flex items-start gap-3 text-sm",
                        tier.highlight ? "text-white/85" : "text-[#5e6461]",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-black",
                          tier.highlight
                            ? "bg-white text-[#173728]"
                            : "bg-[#f4f6f1] text-[#0f5d46]",
                        ].join(" ")}
                      >
                        ✓
                      </span>
                      <span>
                        {feature.label}
                        {feature.comingSoon ? " (coming soon)" : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-[28px] border border-[#e8e8e2] bg-white p-6 text-center shadow-sm">
            <p className="text-lg font-black text-[#111111]">
              Snippe checkout handles the payment page. WHATSBOARD handles the plan activation after webhook confirmation.
            </p>
            <p className="mt-2 text-sm text-[#5e6461]">
              That keeps checkout secure and keeps your plan state tied to the business record already used by the dashboard.
            </p>
            <p className="mt-3 text-sm font-semibold text-[#111111]">
              Free includes 30 orders per month. Paid plans unlock deeper operations based on the tools that are already live in the app.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
