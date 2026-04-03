import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Users,
} from "lucide-react";
import type {
  FollowUpRecord,
  OrderRecord,
  PaymentRecord,
} from "@/data/whatsboard";
import { formatCurrency } from "@/components/whatsboard-dashboard/formatting";
import { pricingPlans } from "@/data/pricing-plans";
import { PricingCard } from "@/components/whatsboard-public/pricing-card";
import {
  formatOrderReference,
  formatPaymentStatusLabel,
  getPrimaryOrderLabel,
} from "@/lib/display-labels";

export const dynamic = "force-static";

const painPoints = [
  "Orders buried in chats",
  "Customers waiting for replies",
  "Payments you forgot to confirm",
  "Deliveries you forgot to track",
  "Repeat buyers you forgot to follow up",
] as const;

const whoItIsFor = [
  "Instagram sellers closing orders in DM",
  "WhatsApp sellers handling repeat customers",
  "Small teams managing delivery by hand",
  "Solo sellers tired of checking chats for updates",
  "Shops that want to look more professional",
] as const;

const howItWorks = [
  "Receive order from chat",
  "Add it to WhatsBoard",
  "Track payment and delivery",
  "Follow up and sell better",
] as const;

const beforeWhatsBoard = [
  "Orders live inside chats",
  "You scroll to remember everything",
  "Payment status is unclear",
  "Follow-ups happen late or never",
  "Customers feel ignored",
] as const;

const afterWhatsBoard = [
  "Orders are organized",
  "Payment status is visible",
  "Delivery status is easy to track",
  "Follow-ups become consistent",
  "Customers get a smoother experience",
] as const;

const credibilityBlocks = [
  "Built for East African online sellers",
  "Simple, mobile-friendly workflow",
  "Free plan available",
  "Setup in minutes",
] as const;

const testimonials = [
  {
    quote:
      "I stopped losing paid orders in chat threads. I open one board and know exactly what to do next.",
    author: "Amina K.",
    role: "Fashion seller",
    city: "Dar es Salaam",
  },
  {
    quote:
      "We track who paid, who is waiting, and what must be delivered today. My team is calmer and faster.",
    author: "Brian M.",
    role: "Electronics seller",
    city: "Nairobi",
  },
  {
    quote:
      "Before this, follow-ups depended on memory. Now every follow-up is visible and sales are more consistent.",
    author: "Nabirye S.",
    role: "Beauty products seller",
    city: "Kampala",
  },
] as const;

const faqs = [
  {
    question: "Is this made for WhatsApp sellers only?",
    answer:
      "No. WhatsBoard supports sellers managing orders from WhatsApp, Instagram, Facebook, and status-driven sales.",
  },
  {
    question: "Can I use it if I sell on Instagram too?",
    answer:
      "Yes. You can track orders from Instagram and other channels in one workflow without splitting tools.",
  },
  {
    question: "Do I need a team to use it?",
    answer:
      "No. Solo sellers can run smoothly on Free or Starter, then add team workflows as they grow.",
  },
  {
    question: "Can I start free?",
    answer:
      "Yes. The Free plan lets you test the workflow before you commit to a paid tier.",
  },
  {
    question: "Is it mobile-friendly?",
    answer:
      "Yes. WhatsBoard is built for sellers who manage business from phone-first workflows.",
  },
] as const;

const demoStats = {
  activeOrders: 27,
  payoutPending: 1860000,
  followUpsDue: 11,
} as const;

const demoOrders: OrderRecord[] = [
  {
    id: "WB-01562",
    customerId: "demo-customer-1",
    customerName: "Neema Juma",
    customerPhone: "+255 743 901 118",
    channel: "WhatsApp",
    stage: "waiting_payment",
    paymentStatus: "partial",
    amount: 85000,
    deliveryArea: "Mikocheni",
    createdAt: "2026-03-31T08:12:00.000Z",
    updatedAt: "2026-03-31T09:45:00.000Z",
    notes: "2x Linen Dress",
    items: ["Linen Dress x2"],
  },
  {
    id: "WB-01561",
    customerId: "demo-customer-2",
    customerName: "Asha Mrema",
    customerPhone: "+255 712 445 901",
    channel: "Instagram",
    stage: "packing",
    paymentStatus: "paid",
    amount: 120000,
    deliveryArea: "Sinza",
    createdAt: "2026-03-31T07:20:00.000Z",
    updatedAt: "2026-03-31T08:40:00.000Z",
    notes: "Blender + warranty card",
    items: ["Smart Blender"],
    paymentReference: "TZN-482119",
  },
  {
    id: "WB-01560",
    customerId: "demo-customer-3",
    customerName: "Kevin Ouma",
    customerPhone: "+254 701 110 733",
    channel: "WhatsApp",
    stage: "new_order",
    paymentStatus: "unpaid",
    amount: 46000,
    deliveryArea: "Westlands",
    createdAt: "2026-03-31T06:55:00.000Z",
    updatedAt: "2026-03-31T07:10:00.000Z",
    notes: "1x Office Lamp",
    items: ["Office Lamp"],
  },
  {
    id: "WB-01559",
    customerId: "demo-customer-4",
    customerName: "Faridah Nansubuga",
    customerPhone: "+256 778 554 099",
    channel: "Facebook",
    stage: "dispatched",
    paymentStatus: "cod",
    amount: 73000,
    deliveryArea: "Ntinda",
    createdAt: "2026-03-30T16:12:00.000Z",
    updatedAt: "2026-03-31T06:15:00.000Z",
    notes: "2x Sneakers",
    items: ["Sneakers x2"],
  },
];

const demoPayments: PaymentRecord[] = [
  {
    id: "pay-demo-1",
    orderId: "WB-01561",
    customerName: "Asha Mrema",
    amount: 120000,
    status: "paid",
    method: "M-Pesa",
    reference: "TZN-482119",
    createdAt: "2026-03-31T08:40:00.000Z",
  },
  {
    id: "pay-demo-2",
    orderId: "WB-01558",
    customerName: "Irene Atieno",
    amount: 59000,
    status: "partial",
    method: "Bank",
    reference: "CRB-110245",
    createdAt: "2026-03-31T07:35:00.000Z",
  },
  {
    id: "pay-demo-3",
    orderId: "WB-01557",
    customerName: "Musa Kato",
    amount: 42000,
    status: "cod",
    method: "Cash",
    reference: "COD-97531",
    createdAt: "2026-03-30T18:10:00.000Z",
  },
];

const demoFollowUps: FollowUpRecord[] = [
  {
    id: "fu-demo-1",
    customerId: "demo-customer-1",
    customerName: "Neema Juma",
    orderId: "WB-01562",
    title: "Confirm transfer screenshot",
    note: "Customer said payment will clear before noon.",
    dueAt: "2026-03-31T11:00:00.000Z",
    status: "today",
    priority: "high",
  },
  {
    id: "fu-demo-2",
    customerId: "demo-customer-3",
    customerName: "Kevin Ouma",
    orderId: "WB-01560",
    title: "Check delivery location pin",
    note: "Send rider landmark confirmation.",
    dueAt: "2026-03-31T13:00:00.000Z",
    status: "upcoming",
    priority: "medium",
  },
  {
    id: "fu-demo-3",
    customerId: "demo-customer-5",
    customerName: "Agnes Njeri",
    orderId: "WB-01556",
    title: "Repeat order upsell",
    note: "Offer bundle discount for second purchase.",
    dueAt: "2026-03-30T15:00:00.000Z",
    status: "overdue",
    priority: "high",
  },
];

const demoBoardColumns = [
  { name: "New", count: 12, hint: "Incoming requests" },
  { name: "Confirmed", count: 18, hint: "Confirmed in process" },
  { name: "Packed", count: 9, hint: "Ready to dispatch" },
  { name: "Delivered", count: 44, hint: "Closed successfully" },
  { name: "Paid", count: 38, hint: "Payment confirmed" },
  { name: "Pending follow-up", count: 7, hint: "Needs action" },
] as const;

type BadgeTone = "danger" | "warning" | "success" | "neutral";

function stageLabel(stage: OrderRecord["stage"]) {
  switch (stage) {
    case "new_order":
      return "New";
    case "waiting_payment":
      return "Waiting Payment";
    case "paid":
      return "Paid";
    case "packing":
      return "Packing";
    case "dispatched":
      return "Dispatch";
    case "delivered":
      return "Delivered";
    default:
      return stage;
  }
}

function toneClass(tone: BadgeTone) {
  if (tone === "danger") return "bg-rose-50 text-rose-700";
  if (tone === "warning") return "bg-amber-50 text-amber-700";
  if (tone === "success") return "bg-emerald-50 text-emerald-700";
  return "bg-[var(--color-wb-primary-soft)] text-[var(--color-wb-primary)]";
}

function paymentTone(status: PaymentRecord["status"]) {
  if (status === "unpaid") return "danger";
  if (status === "partial") return "warning";
  if (status === "paid" || status === "cod") return "success";
  return "neutral";
}

export default function HomePage() {
  const orderedByUpdate = [...demoOrders]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 4);

  const activityItems = [
    ...demoPayments.slice(0, 2).map((payment) => ({
      title: `${getPrimaryOrderLabel({
        customerName: payment.customerName,
        orderId: payment.orderId,
        kind: "customer",
      })} • ${formatCurrency(payment.amount)}`,
      subtitle: `${payment.method} • ${payment.reference}`,
      badge: payment.status,
      tone: paymentTone(payment.status),
    })),
    ...demoFollowUps.slice(0, 2).map((item) => ({
      title: `${getPrimaryOrderLabel({
        customerName: item.customerName,
        orderId: item.orderId,
        kind: "customer",
      })} follow-up`,
      subtitle: item.note,
      badge: item.status,
      tone:
        item.status === "overdue"
          ? "danger"
          : item.status === "today"
            ? "warning"
            : "neutral",
    })),
  ].slice(0, 3) as Array<{
    title: string;
    subtitle: string;
    badge: string;
    tone: BadgeTone;
  }>;

  return (
    <main className="overflow-x-hidden">
      <section className="relative border-b border-[var(--color-wb-border)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-8rem] top-[-8rem] h-80 w-80 rounded-full bg-[var(--color-wb-primary)]/10 blur-3xl" />
          <div className="absolute bottom-[-8rem] right-[-8rem] h-80 w-80 rounded-full bg-black/5 blur-3xl" />
        </div>

        <div className="relative mx-auto grid w-full max-w-[1240px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:px-8 lg:py-20">
          <div>
            <p className="inline-flex rounded-full bg-[var(--color-wb-primary-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wb-primary)]">
              For WhatsApp and social sellers
            </p>
            <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-[-0.04em] text-[var(--color-wb-text)] sm:text-5xl lg:text-6xl">
              Selling on WhatsApp should not be this confusing
            </h1>
            {/* Alternative: Manage WhatsApp orders before they manage you */}
            <p className="mt-5 max-w-xl text-base leading-8 text-[var(--color-wb-text-muted)] sm:text-lg">
              If you sell through WhatsApp, Instagram, or status, you already
              know the problem: chats move fast, orders get buried, payments get
              forgotten, and follow-ups disappear. WhatsBoard gives you one
              simple place to track orders, customers, payments, and deliveries.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="wb-button-primary">
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login?next=%2Fdashboard"
                className="wb-button-secondary"
              >
                Watch Demo
              </Link>
            </div>
            <p className="mt-4 text-sm font-semibold text-[var(--color-wb-text-muted)]">
              Built for East African online sellers
            </p>
          </div>

          <div className="wb-shell-card p-5 sm:p-6" id="product">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[var(--color-wb-text)]">
                Product preview
              </p>
              <span className="rounded-full bg-[var(--color-wb-primary-soft)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-wb-primary)]">
                Demo sample
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <article className="wb-soft-card p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                  Active orders
                </p>
                <p className="mt-2 text-2xl font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                  {demoStats.activeOrders}
                </p>
              </article>
              <article className="wb-soft-card p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                  Pending payments
                </p>
                <p className="mt-2 text-2xl font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                  {formatCurrency(demoStats.payoutPending)}
                </p>
              </article>
              <article className="wb-soft-card p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                  Follow-ups due
                </p>
                <p className="mt-2 text-2xl font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                  {demoStats.followUpsDue}
                </p>
              </article>
            </div>

            <div className="mt-4 space-y-2.5">
              {orderedByUpdate.length ? (
                orderedByUpdate.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-2xl border border-[var(--color-wb-border)] bg-white p-3.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[var(--color-wb-text)]">
                        {getPrimaryOrderLabel({
                          customerName: order.customerName,
                          customerPhone: order.customerPhone,
                          orderId: order.id,
                        })}
                      </p>
                      <span className="rounded-full bg-[var(--color-wb-primary-soft)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-wb-primary)]">
                        {stageLabel(order.stage)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
                      {order.channel} • {formatCurrency(order.amount)} •{" "}
                      {formatPaymentStatusLabel(order.paymentStatus)}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--color-wb-text-muted)]">
                      {formatOrderReference(order.id)
                        ? `Order #${formatOrderReference(order.id)}`
                        : "Untitled order"}
                    </p>
                  </article>
                ))
              ) : (
                <article className="rounded-2xl border border-dashed border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4 text-sm text-[var(--color-wb-text-muted)]">
                  Demo preview cards appear here. Start Free to track your own
                  real orders.
                </article>
              )}
            </div>

            <div className="mt-4 space-y-2.5">
              {activityItems.length ? (
                activityItems.map((item, index) => (
                  <article
                    key={`${item.title}-${index}`}
                    className="flex items-start justify-between gap-3 rounded-2xl border border-[var(--color-wb-border)] bg-white p-3.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--color-wb-text)]">
                        {item.title}
                      </p>
                      <p className="mt-1 truncate text-sm text-[var(--color-wb-text-muted)]">
                        {item.subtitle}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${toneClass(item.tone)}`}
                    >
                      {item.badge}
                    </span>
                  </article>
                ))
              ) : (
                <article className="rounded-2xl border border-dashed border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4 text-sm text-[var(--color-wb-text-muted)]">
                  Demo activity appears here. Your real updates start after
                  signup.
                </article>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wb-primary)]">
            Pain
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[var(--color-wb-text)] sm:text-4xl">
            What WhatsApp chaos quietly costs a seller
          </h2>
        </div>

        <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {painPoints.map((point) => (
            <article key={point} className="wb-shell-card p-5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <p className="mt-4 text-sm font-semibold leading-7 text-[var(--color-wb-text)]">
                {point}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-lg font-semibold text-[var(--color-wb-primary-dark)] sm:text-xl">
          Two missed orders a week can cost more than your monthly plan.
        </p>
      </section>

      <section className="border-y border-[var(--color-wb-border)] bg-white">
        <div className="mx-auto grid w-full max-w-[1240px] gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-start lg:px-8 lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-wb-primary)]">
              Relief
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[var(--color-wb-text)] sm:text-4xl">
              This is where the chaos stops
            </h2>
            <p className="mt-4 text-base leading-8 text-[var(--color-wb-text-muted)] sm:text-lg">
              WhatsBoard turns scattered chats into a simple order system.
            </p>

            <ul className="mt-6 space-y-3">
              <li className="flex items-start gap-3 text-sm text-[var(--color-wb-text)] sm:text-base">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-[var(--color-wb-primary)]" />
                See every order in one place
              </li>
              <li className="flex items-start gap-3 text-sm text-[var(--color-wb-text)] sm:text-base">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-[var(--color-wb-primary)]" />
                Know what is paid, packed, or pending
              </li>
              <li className="flex items-start gap-3 text-sm text-[var(--color-wb-text)] sm:text-base">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-[var(--color-wb-primary)]" />
                Follow up before customers disappear
              </li>
            </ul>

            <div className="mt-7">
              <Link href="/register" className="wb-button-primary">
                Get Started Today
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="wb-shell-card p-5 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              {demoBoardColumns.map((column) => (
                <article key={column.name} className="wb-soft-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-wb-text-muted)]">
                    {column.name}
                  </p>
                  <p className="mt-2 text-2xl font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                    {column.count}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
                    {column.hint}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wb-primary)]">
            Who it is for
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[var(--color-wb-text)] sm:text-4xl">
            Made for sellers who are serious about growth
          </h2>
        </div>
        <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {whoItIsFor.map((item) => (
            <article key={item} className="wb-shell-card p-5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-wb-primary-soft)] text-[var(--color-wb-primary)]">
                <Users className="h-5 w-5" />
              </span>
              <p className="mt-4 text-sm font-semibold leading-7 text-[var(--color-wb-text)] sm:text-base">
                {item}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--color-wb-border)] bg-white">
        <div className="mx-auto w-full max-w-[1240px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wb-primary)]">
              How it works
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[var(--color-wb-text)] sm:text-4xl">
              How it works
            </h2>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((step, index) => (
              <article key={step} className="wb-shell-card p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-wb-text-muted)]">
                  Step {index + 1}
                </p>
                <p className="mt-3 text-lg font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                  {step}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wb-primary)]">
            Before vs After
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[var(--color-wb-text)] sm:text-4xl">
            The difference your customers can feel
          </h2>
        </div>

        <div className="mt-9 grid gap-5 lg:grid-cols-2">
          <article className="wb-shell-card border-rose-200 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
              Before WhatsBoard
            </p>
            <ul className="mt-5 space-y-3">
              {beforeWhatsBoard.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-[var(--color-wb-text)] sm:text-base"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-rose-600" />
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="wb-shell-card border-emerald-200 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              After WhatsBoard
            </p>
            <ul className="mt-5 space-y-3">
              {afterWhatsBoard.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-[var(--color-wb-text)] sm:text-base"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="border-y border-[var(--color-wb-border)] bg-white">
        <div className="mx-auto w-full max-w-[1240px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wb-primary)]">
              Trust
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[var(--color-wb-text)] sm:text-4xl">
              Built for serious day-to-day selling
            </h2>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {credibilityBlocks.map((item) => (
              <article key={item} className="wb-soft-card p-5">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[var(--color-wb-primary)]">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <p className="mt-3 text-sm font-semibold leading-7 text-[var(--color-wb-text)]">
                  {item}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {testimonials.map((item) => (
              <article key={item.author} className="wb-shell-card p-5">
                <p className="text-sm leading-7 text-[var(--color-wb-text)]">
                  “{item.quote}”
                </p>
                <p className="mt-4 text-sm font-semibold text-[var(--color-wb-text)]">
                  {item.author}
                </p>
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                  {item.city} • {item.role}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-[28px] border border-[var(--color-wb-border)] bg-[var(--color-wb-primary-soft)] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-wb-primary)]">
              Founder note
            </p>
            <p className="mt-3 text-base leading-8 text-[var(--color-wb-primary-dark)] sm:text-lg">
              “I built this because too many sellers are running real businesses
              inside scattered chats and losing money quietly.”
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wb-primary)]">
            Pricing
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[var(--color-wb-text)] sm:text-4xl">
            Simple plans for every stage of selling
          </h2>
          <p className="mt-4 text-base leading-8 text-[var(--color-wb-text-muted)]">
            Free — Try it first. Starter — Solo seller. Growth — Growing
            business. Business — Team workflow.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-4">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.key} plan={plan} />
          ))}
        </div>

        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/register" className="wb-button-primary">
            Get Started Today
          </Link>
          <Link href="/login?next=%2Fdashboard" className="wb-button-secondary">
            Watch Demo
          </Link>
        </div>
      </section>

      <section className="border-y border-[var(--color-wb-border)] bg-white">
        <div className="mx-auto w-full max-w-[1240px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wb-primary)]">
              FAQ
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[var(--color-wb-text)] sm:text-4xl">
              Quick answers before you start
            </h2>
          </div>

          <div className="mx-auto mt-9 grid max-w-4xl gap-4">
            {faqs.map((item) => (
              <article key={item.question} className="wb-shell-card p-5 sm:p-6">
                <p className="text-base font-semibold text-[var(--color-wb-text)] sm:text-lg">
                  {item.question}
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-wb-text-muted)] sm:text-base">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="wb-shell-card bg-[var(--color-wb-primary-dark)] px-6 py-10 text-center text-white sm:px-10">
          <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/85">
            Final step
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] sm:text-4xl lg:text-5xl">
            Stop running your business from lost chats
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
            Use one simple board to manage orders, payments, deliveries, and
            follow-ups.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[var(--color-wb-primary-dark)] transition hover:bg-white/90"
            >
              Start Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login?next=%2Fdashboard"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/40 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Watch Demo
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
