import Link from "next/link"
import { CheckCircle2, ChevronLeft } from "lucide-react"
import { LanguageToggle } from "@/components/i18n/language-toggle"
import { TranslatedText } from "@/components/i18n/translated-text"
import { createClient } from "@/lib/supabase/server"
import { getViewerContext } from "@/lib/queries"
import { PLAN_CONFIG, getEffectivePlanKey, getPlanName, type PlanKey } from "@/lib/plan-access"
import { startPlanCheckoutAction } from "./actions"

function CheckoutButton({
  loggedIn,
  currentPlan,
  currentStatus,
  tierKey,
}: {
  loggedIn: boolean
  currentPlan?: string | null
  currentStatus?: string | null
  tierKey: PlanKey
}) {
  if (tierKey === "free") {
    return (
      <span className="mt-8 inline-flex w-full items-center justify-center rounded-2xl border border-border bg-secondary px-5 py-3 text-sm font-semibold text-foreground">
        <TranslatedText text="Included after signup" />
      </span>
    )
  }

  const isCurrentPlan = currentPlan === tierKey && currentStatus === "active"

  if (!loggedIn) {
    return (
      <Link
        href="/register"
        className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-[#0a3d2e]"
      >
        <TranslatedText text="Start Free" />
      </Link>
    )
  }

  if (isCurrentPlan) {
    return (
      <span className="mt-8 inline-flex w-full items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 px-5 py-3 text-sm font-semibold text-primary">
        <TranslatedText text="Current Plan" />
      </span>
    )
  }

  return (
    <form action={startPlanCheckoutAction.bind(null, tierKey)} className="mt-8">
      <button
        type="submit"
        className="inline-flex w-full items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-[#0a3d2e]"
      >
        {currentPlan ? (
          <>
            <TranslatedText text="Switch to" /> <span className="ml-1"><TranslatedText text={PLAN_CONFIG[tierKey].name} /></span>
          </>
        ) : (
          <>
            <TranslatedText text="Pay for" /> <span className="ml-1"><TranslatedText text={PLAN_CONFIG[tierKey].name} /></span>
          </>
        )}
      </button>
    </form>
  )
}

function Notice({ tone, message }: { tone: "error" | "required" | "upgrade" | "processing"; message: string }) {
  const toneMap = {
    error: "border-[#e9d4d1] bg-[#f9efed] text-[#8f3e36]",
    required: "border-border bg-secondary text-foreground",
    upgrade: "border-primary/20 bg-primary/10 text-primary",
    processing: "border-primary/20 bg-primary/10 text-primary",
  } as const

  return (
    <div className={`mx-auto mt-8 max-w-3xl rounded-2xl border px-4 py-3 text-sm ${toneMap[tone]}`}>
      <TranslatedText text={message} />
    </div>
  )
}

export default async function PricingPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; message?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { business } = user ? await getViewerContext() : { business: null }
  const effectivePlan = getEffectivePlanKey(business)
  const resolvedSearch = (await searchParams) ?? {}
  const tiers = Object.values(PLAN_CONFIG)

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <section className="border-b border-border bg-gradient-to-b from-secondary/30 to-background">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mb-10 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              <TranslatedText text="Back to home" />
            </Link>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              {user ? (
                <Link
                  href="/dashboard/account"
                  className="inline-flex items-center justify-center rounded-2xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-secondary"
                >
                  <TranslatedText text="View account billing" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-2xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-secondary"
                >
                  <TranslatedText text="Login" />
                </Link>
              )}
            </div>
          </div>

          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-wider text-primary">
              <TranslatedText text="Pricing" />
            </p>
            <h1
              className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <TranslatedText text="Clear pricing for serious selling." />
            </h1>
            <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
              <TranslatedText text="Start on Free, then upgrade through live Snippe checkout when you need more orders, payment visibility, follow-ups, and deeper control." />
            </p>
          </div>

          {resolvedSearch.status === "error" ? (
            <Notice tone="error" message={resolvedSearch.message || "Unable to start checkout."} />
          ) : null}
          {resolvedSearch.status === "required" ? (
            <Notice
              tone="required"
              message={
                resolvedSearch.message ||
                "You are on Free. Upgrade when you need more than 30 orders, follow-ups, payments, and customer workflows."
              }
            />
          ) : null}
          {resolvedSearch.status === "upgrade" ? (
            <Notice
              tone="upgrade"
              message={resolvedSearch.message || "Upgrade your plan to unlock this feature."}
            />
          ) : null}
          {resolvedSearch.status === "processing" ? (
            <Notice
              tone="processing"
              message={resolvedSearch.message || "Payment received. We are confirming your plan now."}
            />
          ) : null}

          {user && business ? (
            <div className="mx-auto mt-8 max-w-3xl rounded-[28px] border border-border bg-card p-5 text-left shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <TranslatedText text="Current billing" />
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-bold text-foreground">{getPlanName(effectivePlan)}</p>
                  <p className="text-sm text-muted-foreground">
                    Status: {effectivePlan === "free" ? "free" : business.billing_status || "inactive"}
                    {business.billing_current_period_ends_at && effectivePlan !== "free"
                      ? ` • Paid through ${new Date(business.billing_current_period_ends_at).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <TranslatedText text="Live billing active" />
                </span>
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
                    ? "border-primary bg-primary text-primary-foreground shadow-xl shadow-primary/15"
                    : "border-border bg-card text-foreground",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p
                      className={[
                        "text-sm font-bold uppercase tracking-[0.18em]",
                        tier.highlight ? "text-primary-foreground/76" : "text-primary",
                      ].join(" ")}
                    >
                      <TranslatedText text={tier.name} />
                    </p>
                    <h2 className="mt-3 text-4xl font-bold tracking-tight">
                      {tier.priceLabel}
                      <span
                        className={[
                          "ml-1 text-sm font-medium",
                          tier.highlight ? "text-primary-foreground/70" : "text-muted-foreground",
                        ].join(" ")}
                      >
                        <TranslatedText text={tier.key === "free" ? "/forever" : "/month"} />
                      </span>
                    </h2>
                  </div>

                  <span
                    className={[
                      "rounded-full px-3 py-1 text-xs font-bold",
                      tier.highlight ? "bg-white text-primary" : "bg-secondary text-primary",
                    ].join(" ")}
                  >
                    <TranslatedText text={tier.badge} />
                  </span>
                </div>

                <p
                  className={[
                    "mt-5 min-h-[72px] text-sm leading-6",
                    tier.highlight ? "text-primary-foreground/80" : "text-muted-foreground",
                  ].join(" ")}
                >
                  <TranslatedText text={tier.description} />
                </p>

                <CheckoutButton
                  loggedIn={Boolean(user)}
                  currentPlan={effectivePlan}
                  currentStatus={business?.billing_status}
                  tierKey={tier.key}
                />

                <div className={`my-6 h-px ${tier.highlight ? "bg-white/14" : "bg-border"}`} />

                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li
                      key={feature.label}
                      className={[
                        "flex items-start gap-3 text-sm",
                        tier.highlight ? "text-primary-foreground/85" : "text-muted-foreground",
                      ].join(" ")}
                    >
                      <CheckCircle2
                        className={[
                          "mt-0.5 h-4 w-4 shrink-0",
                          tier.highlight ? "text-primary-foreground" : "text-primary",
                        ].join(" ")}
                      />
                      <span>
                        <TranslatedText text={feature.label} />
                        {feature.comingSoon ? " " : ""}
                        {feature.comingSoon ? <TranslatedText text="(coming soon)" /> : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-[28px] border border-border bg-card p-6 text-center shadow-sm">
            <p className="text-lg font-bold text-foreground">
              <TranslatedText text="Snippe handles the payment page. WhatsBoard handles the plan activation." />
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              <TranslatedText text="Checkout stays secure, and the plan state stays tied to the same business record used by the dashboard." />
            </p>
            <p className="mt-3 text-sm font-semibold text-foreground">
              <TranslatedText text="Free includes 30 orders per month. Paid plans unlock deeper operations that are already live in the app." />
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
