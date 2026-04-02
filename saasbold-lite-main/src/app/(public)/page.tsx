import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  Package2,
  ReceiptText,
  Truck,
  Users,
} from "lucide-react";
import { pricingPlans } from "@/data/pricing-plans";
import { PricingCard } from "@/components/whatsboard-public/pricing-card";

const operationsCards = [
  {
    title: "New order captured",
    detail: "Amina Mushi • WhatsApp • TZS 85,000",
    badge: "Awaiting payment",
    tone: "warning",
  },
  {
    title: "Payment confirmed",
    detail: "Kevin Otieno • M-Pesa ref MPESA-2201",
    badge: "Paid",
    tone: "success",
  },
  {
    title: "Dispatch in motion",
    detail: "Rashid Salum • Rider assigned • Dar es Salaam",
    badge: "Dispatched",
    tone: "neutral",
  },
] as const;

const struggleCards = [
  {
    title: "Orders buried in chats",
    description:
      "You are selling, but order details are scattered across WhatsApp, Instagram, TikTok, and Facebook.",
    icon: AlertTriangle,
  },
  {
    title: "Payment status is unclear",
    description:
      "Without one timeline, you keep checking screenshots and references to know who has really paid.",
    icon: CreditCard,
  },
  {
    title: "Follow-ups get missed",
    description:
      "A delayed reply or forgotten reminder quietly kills repeat sales and trust.",
    icon: Clock3,
  },
] as const;

const featureFlow = [
  {
    title: "Orders",
    detail: "Every sale gets an order ID, amount, source, and stage.",
    icon: Package2,
  },
  {
    title: "Payments",
    detail: "Track unpaid, partial, paid, and COD in one place.",
    icon: CreditCard,
  },
  {
    title: "Customers",
    detail: "Turn chat contacts into searchable customer records.",
    icon: Users,
  },
  {
    title: "Follow-ups",
    detail: "Keep overdue and upcoming actions visible for the team.",
    icon: CheckCircle2,
  },
  {
    title: "Dispatch",
    detail: "Move orders from packing to delivered with clean status updates.",
    icon: Truck,
  },
] as const;

export default function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-[var(--color-wb-border)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-[var(--color-wb-primary)]/8 blur-3xl" />
          <div className="absolute bottom-[-8rem] right-[-8rem] h-80 w-80 rounded-full bg-black/5 blur-3xl" />
        </div>

        <div className="relative mx-auto grid w-full max-w-[1240px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-8 lg:py-20">
          <div>
            <p className="inline-flex rounded-full bg-[var(--color-wb-primary-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wb-primary)]">
              Built for East African online sellers
            </p>
            <h1 className="mt-5 text-4xl font-black leading-[1.04] tracking-[-0.04em] text-[var(--color-wb-text)] sm:text-5xl lg:text-6xl">
              Turn chat chaos into
              <span className="text-[var(--color-wb-primary)]"> sales control.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-[var(--color-wb-text-muted)] sm:text-lg">
              WhatsBoard gives online sellers one clean operating system for
              orders, customers, follow-ups, payments, and delivery workflow.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="wb-button-primary">
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dashboard" className="wb-button-secondary">
                See Demo
              </Link>
            </div>

            <div className="mt-7 grid max-w-lg grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div className="wb-soft-card p-3">
                <p className="text-lg font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                  2,500+
                </p>
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                  Waiting sellers
                </p>
              </div>
              <div className="wb-soft-card p-3">
                <p className="text-lg font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                  50K+
                </p>
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                  Orders to be tracked
                </p>
              </div>
              <div className="wb-soft-card p-3 sm:col-span-1 col-span-2">
                <p className="text-lg font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                  TZS-first
                </p>
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                  Built for local selling
                </p>
              </div>
            </div>
          </div>

          <div className="wb-shell-card p-4 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="wb-soft-card p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-wb-text-muted)]">
                  Today snapshot
                </p>
                <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--color-wb-text)]">
                  TZS 1,240,000
                </p>
                <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
                  Payments tracked
                </p>
              </div>
              <div className="wb-soft-card p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-wb-text-muted)]">
                  Follow-ups due
                </p>
                <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--color-wb-text)]">
                  6
                </p>
                <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
                  Needs action now
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {operationsCards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-2xl border border-[var(--color-wb-border)] bg-white p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[var(--color-wb-text)]">
                      {card.title}
                    </p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                        card.tone === "success"
                          ? "bg-emerald-50 text-emerald-700"
                          : card.tone === "warning"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-[var(--color-wb-primary-soft)] text-[var(--color-wb-primary)]"
                      }`}
                    >
                      {card.badge}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
                    {card.detail}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="problem"
        className="mx-auto w-full max-w-[1240px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-wb-primary)]">
            Does this sound like your daily struggle?
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[var(--color-wb-text)] sm:text-4xl">
            Your business is growing. Your system is not.
          </h2>
          <p className="mt-4 text-base leading-8 text-[var(--color-wb-text-muted)] sm:text-lg">
            Most sellers are not losing because demand is low. They are losing
            because operations are happening in random chats.
          </p>
        </div>

        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {struggleCards.map((item) => (
            <article key={item.title} className="wb-shell-card p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-wb-primary-soft)] text-[var(--color-wb-primary)]">
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-xl font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--color-wb-text-muted)]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--color-wb-border)] bg-white">
        <div className="mx-auto w-full max-w-[1240px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-wb-primary)]">
                COST OF DOING NOTHING
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[var(--color-wb-primary-dark)] sm:text-4xl lg:text-5xl">
                How Much Is WhatsApp Chaos Costing You Every Week?
              </h2>
              <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-[var(--color-wb-text)] sm:text-lg">
                You do not need 100 lost customers to have a problem. Sometimes
                2 forgotten orders, 3 delayed replies, and 1 unpaid delivery are
                already enough to quietly damage your business.
              </p>
            </div>

            <div className="mt-8 rounded-[28px] border border-[var(--color-wb-border)] bg-[var(--color-wb-primary-soft)] px-6 py-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-wb-text-muted)]">
                Cost snapshot
              </p>
              <p className="mt-3 text-2xl font-black tracking-[-0.03em] text-[var(--color-wb-primary-dark)] sm:text-3xl">
                Lose just 2 orders a week worth TZS 20,000 each = TZS 160,000
                lost per month
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <article className="wb-shell-card p-6 transition hover:-translate-y-1">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-wb-primary-soft)] text-[var(--color-wb-primary)]">
                  <ReceiptText className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-xl font-black tracking-[-0.03em] text-[var(--color-wb-primary-dark)]">
                  Missed Orders
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-wb-text)]">
                  Two forgotten orders a week can quietly cost you more than you
                  think.
                </p>
              </article>
              <article className="wb-shell-card p-6 transition hover:-translate-y-1">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-wb-primary-soft)] text-[var(--color-wb-primary)]">
                  <Clock3 className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-xl font-black tracking-[-0.03em] text-[var(--color-wb-primary-dark)]">
                  Late Replies
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-wb-text)]">
                  One slow reply can send a customer to another seller and reduce
                  repeat business.
                </p>
              </article>
              <article className="wb-shell-card p-6 transition hover:-translate-y-1">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-wb-primary-soft)] text-[var(--color-wb-primary)]">
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-xl font-black tracking-[-0.03em] text-[var(--color-wb-primary-dark)]">
                  Mental Overload
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-wb-text)]">
                  Every hour spent digging through chats is time not spent
                  selling, packing, or delivering.
                </p>
              </article>
            </div>

            <div className="mt-8 rounded-[28px] border border-[var(--color-wb-border)] bg-[var(--color-wb-background)] px-6 py-7 text-center">
              <p className="text-lg font-semibold leading-8 text-[var(--color-wb-primary-dark)]">
                Most sellers do not have a marketing problem. They have a
                follow-up problem dressed like normal business.
              </p>
              <p className="mt-3 text-base leading-7 text-[var(--color-wb-text)]">
                WhatsBoard Starter is TZS 15,000/month. Losing even one order can
                cost more than that.
              </p>
            </div>

            <div className="mt-8 rounded-[30px] border border-[var(--color-wb-border)] bg-white px-6 py-8 text-center shadow-[0_18px_44px_rgba(17,17,17,0.05)]">
              <h3 className="text-2xl font-black tracking-[-0.03em] text-[var(--color-wb-primary-dark)] sm:text-3xl">
                Stop losing money in silence
              </h3>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--color-wb-text)]">
                Track your first 30 orders free and see what organized selling
                feels like.
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/register" className="wb-button-primary">
                  Start Free
                </Link>
                <Link href="/dashboard" className="wb-button-secondary">
                  See Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="mx-auto w-full max-w-[1240px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wb-primary)]">
            How WhatsBoard Works
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[var(--color-wb-text)] sm:text-4xl">
            One workflow from first chat to delivery.
          </h2>
        </div>

        <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {featureFlow.map((item, idx) => (
            <article key={item.title} className="wb-soft-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-wb-text-muted)]">
                Step {idx + 1}
              </p>
              <span className="mt-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[var(--color-wb-primary)]">
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[var(--color-wb-text-muted)]">
                {item.detail}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--color-wb-border)] bg-white">
        <div className="mx-auto w-full max-w-[1240px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wb-primary)]">
              Pricing
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[var(--color-wb-text)] sm:text-4xl">
              Start free. Upgrade when your selling gets serious.
            </h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-4">
            {pricingPlans.map((plan) => (
              <PricingCard key={plan.key} plan={plan} />
            ))}
          </div>
          <div className="mt-7 text-center">
            <Link href="/pricing" className="wb-button-secondary">
              View full pricing details
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="wb-shell-card px-6 py-10 text-center sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wb-primary)]">
            Final step
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[var(--color-wb-text)] sm:text-4xl lg:text-5xl">
            Chats help you sell. WhatsBoard helps you scale.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[var(--color-wb-text-muted)] sm:text-lg">
            Move your orders out of guesswork and into one clean fintech-style
            control room for your team.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/register" className="wb-button-primary">
              Start Free
            </Link>
            <Link href="/dashboard" className="wb-button-secondary">
              Open Dashboard
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
