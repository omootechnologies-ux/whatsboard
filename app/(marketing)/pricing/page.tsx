import Link from "next/link";

const tiers = [
  {
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
    cta: "Start Free",
    href: "/register",
  },
  {
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
    cta: "Get Growth",
    href: "/register",
  },
  {
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
    cta: "Talk to Us",
    href: "/register",
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-600">
              Pricing
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Pay in TZS. Trust faster. Work cleaner.
            </h1>
            <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
              No vague foreign pricing. No “we’ll tell you later” energy.
              WHATSBOARD pricing is simple, local-looking, and built for East African sellers
              who want control after the chat starts.
            </p>
          </div>

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

                <Link
                  href={tier.href}
                  className={[
                    "mt-6 inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-bold transition",
                    tier.highlight
                      ? "bg-emerald-500 text-white hover:bg-emerald-400"
                      : "bg-slate-900 text-white hover:bg-slate-800",
                  ].join(" ")}
                >
                  {tier.cta}
                </Link>

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
              Still cheaper than losing orders because “nilidhani alishalipa.”
            </p>
            <p className="mt-2 text-sm text-slate-600">
              TZS pricing builds trust fast because your customer already knows this app was made
              for the kind of biashara they actually run.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="rounded-[36px] bg-slate-950 px-6 py-10 text-white sm:px-10 lg:px-14">
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-400">
                  Final push
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                  Acha biashara yako ionekane serious before customers notice the chaos.
                </h2>
                <p className="mt-4 text-base leading-7 text-white/75">
                  Start with the plan that matches your order volume now. Upgrade when chats,
                  payments, and follow-ups become too many for vibes and screenshots.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-6 py-4 text-sm font-black text-white transition hover:bg-emerald-400"
                  >
                    Start Free
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-sm font-black text-white transition hover:bg-white/10"
                  >
                    Log in
                  </Link>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <div className="rounded-[24px] bg-white p-5 text-slate-900">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-600">
                    Why TZS pricing matters
                  </p>
                  <ul className="mt-4 space-y-3 text-sm text-slate-700">
                    <li>• Feels local and trustworthy immediately</li>
                    <li>• Easier for sellers to compare with daily business costs</li>
                    <li>• No exchange-rate confusion</li>
                    <li>• Makes the product feel built for East African operators, not tourists</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
