"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type OrderStatus =
  | "new"
  | "awaiting_payment"
  | "paid"
  | "packing"
  | "dispatch"
  | "delivered";

type PaymentStatus = "unpaid" | "partial" | "paid" | "confirmed";
type FollowUpStatus = "overdue" | "today" | "upcoming";
type DeliveryStatus = "ready_to_pack" | "packed" | "sent_out" | "delivered";

type DashboardStats = {
  totalOrders: number;
  pendingPayments: number;
  delivered: number;
  repeatCustomers: number;
  followUpsDue: number;
};

type OrderRecord = {
  id: string;
  customerName: string;
  source: "WhatsApp" | "Instagram" | "TikTok" | "Facebook";
  total: string;
  status: OrderStatus;
  createdAt: string;
  paymentStatus: PaymentStatus;
};

type CustomerRecord = {
  id: string;
  name: string;
  phone: string;
  lastOrder: string;
  followUpDate: string;
  purchaseHistory: string;
  state: "active" | "waiting" | "repeat";
};

type FollowUpRecord = {
  id: string;
  customerName: string;
  action: string;
  dueLabel: string;
  status: FollowUpStatus;
};

type DeliveryRecord = {
  id: string;
  orderId: string;
  customerName: string;
  area: string;
  status: DeliveryStatus;
};

type BoardData = {
  stats: DashboardStats;
  orders: OrderRecord[];
  customers: CustomerRecord[];
  followUps: FollowUpRecord[];
  deliveries: DeliveryRecord[];
};

type Stage =
  | "hero"
  | "problem"
  | "shift"
  | "orders"
  | "payments"
  | "customers"
  | "followups"
  | "dispatch"
  | "visibility"
  | "trust"
  | "pricing"
  | "cta";

type StorySection = {
  id: Stage;
  navLabel?: string;
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
};

const boardData: BoardData = {
  stats: {
    totalOrders: 124,
    pendingPayments: 6,
    delivered: 38,
    repeatCustomers: 17,
    followUpsDue: 8,
  },
  orders: [
    {
      id: "#WB-1092",
      customerName: "Asha Mushi",
      source: "WhatsApp",
      total: "TZS 95,000",
      status: "awaiting_payment",
      createdAt: "Today, 09:12",
      paymentStatus: "unpaid",
    },
    {
      id: "#WB-1091",
      customerName: "Kevin Otieno",
      source: "Instagram",
      total: "TZS 64,000",
      status: "paid",
      createdAt: "Today, 08:42",
      paymentStatus: "confirmed",
    },
    {
      id: "#WB-1089",
      customerName: "Neema Said",
      source: "TikTok",
      total: "TZS 120,000",
      status: "dispatch",
      createdAt: "Yesterday",
      paymentStatus: "paid",
    },
  ],
  customers: [
    {
      id: "cus_01",
      name: "Grace Mollel",
      phone: "+255 718 400 213",
      lastOrder: "#WB-1084",
      followUpDate: "Today",
      purchaseHistory: "4 orders",
      state: "waiting",
    },
    {
      id: "cus_02",
      name: "Amina Yusuf",
      phone: "+254 701 882 114",
      lastOrder: "#WB-1079",
      followUpDate: "Apr 2",
      purchaseHistory: "7 orders",
      state: "repeat",
    },
    {
      id: "cus_03",
      name: "Brian Kato",
      phone: "+256 779 230 812",
      lastOrder: "#WB-1090",
      followUpDate: "Apr 4",
      purchaseHistory: "2 orders",
      state: "active",
    },
  ],
  followUps: [
    {
      id: "f_01",
      customerName: "Grace Mollel",
      action: "Check if payment proof is ready",
      dueLabel: "Overdue by 1 day",
      status: "overdue",
    },
    {
      id: "f_02",
      customerName: "Asha Mushi",
      action: "Send size confirmation",
      dueLabel: "Today at 14:00",
      status: "today",
    },
    {
      id: "f_03",
      customerName: "Amina Yusuf",
      action: "Follow up on repeat order",
      dueLabel: "Tomorrow",
      status: "upcoming",
    },
  ],
  deliveries: [
    {
      id: "d_01",
      orderId: "#WB-1091",
      customerName: "Kevin Otieno",
      area: "Kariakoo",
      status: "ready_to_pack",
    },
    {
      id: "d_02",
      orderId: "#WB-1087",
      customerName: "Neema Said",
      area: "Mikocheni",
      status: "packed",
    },
    {
      id: "d_03",
      orderId: "#WB-1083",
      customerName: "Zawadi John",
      area: "Kinondoni",
      status: "sent_out",
    },
    {
      id: "d_04",
      orderId: "#WB-1078",
      customerName: "Amina Yusuf",
      area: "Arusha CBD",
      status: "delivered",
    },
  ],
};

const storySections: StorySection[] = [
  {
    id: "hero",
    navLabel: "Features",
    eyebrow: "Commerce operating layer",
    title: "Turn chat chaos into sales control",
    body:
      "WhatsBoard helps online sellers track orders, payments, customers, follow-ups, and deliveries from WhatsApp and social media in one clean system.",
    bullets: ["One board for orders after chat", "Built for modern African online sellers", "Structured enough to run the day"],
  },
  {
    id: "problem",
    eyebrow: "The problem",
    title: "Your business is selling. But your system is guessing.",
    body:
      "Orders are buried in chat threads, payment proof gets lost in screenshots, customers wait too long, and delivery status depends on memory.",
    bullets: ["Buried orders", "Missed payments", "Forgotten follow-ups"],
  },
  {
    id: "shift",
    navLabel: "How It Works",
    eyebrow: "The shift",
    title: "WhatsBoard turns conversations into a trackable workflow.",
    body:
      "The same order that starts in a message becomes a visible record with status, payment state, customer context, and the next operational action.",
    bullets: ["New order", "Awaiting payment", "Paid", "Packing → Dispatch → Delivered"],
  },
  {
    id: "orders",
    eyebrow: "Orders",
    title: "Every order gets a home.",
    body:
      "The board shows order ID, customer, source, total, current stage, and when it entered the system. No more hunting through threads to reconstruct one sale.",
    bullets: ["Order ID", "Source", "Total", "Status"],
  },
  {
    id: "payments",
    eyebrow: "Payments",
    title: "Stop guessing who has paid.",
    body:
      "Payment badges, timestamps, and confirmation states keep collection work visible before dispatch starts moving.",
    bullets: ["Unpaid", "Partial", "Paid", "Confirmed"],
  },
  {
    id: "customers",
    eyebrow: "Customers",
    title: "Every customer becomes searchable and trackable.",
    body:
      "Customer records keep phone, last order, next follow-up, and purchase history tied to the business instead of disappearing inside a chat archive.",
    bullets: ["Searchable records", "Last order context", "Purchase history"],
  },
  {
    id: "followups",
    eyebrow: "Follow-ups",
    title: "No more ‘I forgot to text them back.’",
    body:
      "Reminder cards turn follow-up work into a visible queue with overdue, today, and upcoming tasks.",
    bullets: ["Overdue", "Today", "Upcoming"],
  },
  {
    id: "dispatch",
    eyebrow: "Delivery",
    title: "From payment to doorstep, everything has a stage.",
    body:
      "After payment, the workflow keeps moving through ready to pack, packed, sent out, and delivered without becoming a guessing game.",
    bullets: ["Ready to pack", "Packed", "Sent out", "Delivered"],
  },
  {
    id: "visibility",
    eyebrow: "Visibility",
    title: "Now the seller can see the business, not just reply to it.",
    body:
      "The board surfaces total orders, pending payments, delivered orders, repeat customers, and follow-ups due in one calm view.",
    bullets: ["Total orders", "Pending payments", "Repeat customers"],
  },
  {
    id: "trust",
    navLabel: "Testimonials",
    eyebrow: "Trust",
    title: "Practical control sellers can feel immediately.",
    body:
      "The outcome is not abstract. Fewer missed orders, faster follow-ups, clearer payment status, and a more professional business day.",
    bullets: ["Fewer missed orders", "Faster follow-ups", "Better delivery control"],
  },
  {
    id: "pricing",
    navLabel: "Pricing",
    eyebrow: "Pricing",
    title: "Simple plans. Clear upgrade path.",
    body:
      "Start free, prove the system inside the business, then move up when order volume and operational pressure grow.",
    bullets: ["Free to start", "Starter for active sellers", "Growth for scaling teams"],
  },
  {
    id: "cta",
    eyebrow: "Start now",
    title: "Your chats can bring the orders. WhatsBoard should run the business.",
    body:
      "Staying inside messy chats is expensive. The next step is structure, visibility, and a board the seller can trust every day.",
    bullets: ["Start free", "See pricing", "Get control now"],
  },
];

const testimonials = [
  {
    quote:
      "Before WhatsBoard, I was checking screenshots to confirm payments. Now I know what is paid and what still needs action in one view.",
    name: "Amina",
    role: "Fashion seller, Dar es Salaam",
  },
  {
    quote:
      "Follow-ups stopped living in my head. The business now feels cleaner and faster, especially on the days with many WhatsApp orders.",
    name: "Brian",
    role: "Accessories seller, Nairobi",
  },
  {
    quote:
      "It made delivery and customer replies more professional without adding a heavy system. I can run it from my phone.",
    name: "Neema",
    role: "Beauty seller, Arusha",
  },
];

const pricingTiers = [
  {
    name: "Free",
    price: "TZS 0",
    note: "Your first 30 orders every month, with the basic board and order tracking.",
    cta: "Start free",
  },
  {
    name: "Starter",
    price: "TZS 15K / mo",
    note: "Payment tracking, customer records, follow-ups, and the day-to-day control most active sellers need.",
    cta: "Choose Starter",
    highlight: true,
  },
  {
    name: "Growth",
    price: "TZS 35K / mo",
    note: "Dispatch workflow, sales visibility, and deeper operational support for bigger volume.",
    cta: "Choose Growth",
  },
] as const;

export default function WhatsBoardHomepage() {
  const [active, setActive] = useState<Stage>("hero");

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-stage]"));
    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!current) return;
        const next = current.target.dataset.stage as Stage | undefined;
        if (next) setActive(next);
      },
      { rootMargin: "-16% 0px -52% 0px", threshold: [0.2, 0.45, 0.7] }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const navItems = useMemo(
    () =>
      storySections
        .filter((section) => section.navLabel)
        .map((section) => ({
          href:
            section.id === "hero"
              ? "#features"
              : section.id === "shift"
                ? "#how-it-works"
                : section.id === "trust"
                  ? "#testimonials"
                  : section.id === "pricing"
                    ? "#pricing"
                    : "#features",
          label: section.navLabel!,
        })),
    []
  );

  return (
    <main className="min-h-screen bg-[#FAFAF7] text-[#111111]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(15,93,70,0.08),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0),rgba(15,93,70,0.025))]" />

      <PremiumNavbar items={navItems} />

      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
          <div className="grid gap-10 lg:grid-cols-[0.84fr_1.16fr] lg:gap-16">
            <div className="space-y-24 lg:space-y-32">
              {storySections.map((section, index) => (
                <ScrollStorySection
                  key={section.id}
                  section={section}
                  index={index}
                  active={active === section.id}
                />
              ))}
            </div>

            <div className="space-y-4">
              <div className="sticky top-18 z-20 lg:hidden">
                <StickyBoardLayout active={active} data={boardData} compact />
              </div>
              <div className="hidden lg:block lg:sticky lg:top-24 lg:h-[calc(100svh-7rem)]">
                <div className="flex h-full items-start">
                  <StickyBoardLayout active={active} data={boardData} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MobileCtaBar />
      <Footer />
    </main>
  );
}

function PremiumNavbar({ items }: { items: { href: string; label: string }[] }) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#E7E7E2] bg-[#FAFAF7]/86 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="text-sm font-semibold uppercase tracking-[0.28em] text-[#111111]">
          WhatsBoard
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-[#5F6368] md:flex">
          {items.map((item) => (
            <a key={item.label} href={item.href} className="transition hover:text-[#111111]">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-full border border-[#E7E7E2] bg-white px-4 py-2 text-sm text-[#0A3D2E] transition hover:border-[#0F5D46]/25 hover:bg-[#F4F5F0]"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-[#0F5D46] px-4 py-2 text-sm text-white transition hover:bg-[#0A3D2E]"
          >
            Start Free
          </Link>
        </div>
      </div>
    </header>
  );
}

function ScrollStorySection({
  section,
  index,
  active,
}: {
  section: StorySection;
  index: number;
  active: boolean;
}) {
  const id =
    section.id === "hero"
      ? "features"
      : section.id === "shift"
        ? "how-it-works"
        : section.id === "trust"
          ? "testimonials"
          : section.id === "pricing"
            ? "pricing"
            : undefined;

  return (
    <article
      id={id}
      data-stage={section.id}
      className={`scroll-mt-28 ${index === 0 ? "min-h-[88svh] lg:py-16" : "min-h-[72svh]"}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-3xl"
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#5F6368]">
          {section.eyebrow}
        </p>
        <h1
          className={`mt-4 font-semibold tracking-[-0.08em] text-[#111111] ${
            index === 0 ? "text-5xl leading-[0.94] sm:text-7xl" : "text-4xl leading-[0.98] sm:text-6xl"
          }`}
        >
          {section.title}
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-[#5F6368] sm:text-base">{section.body}</p>

        {index === 0 ? (
          <>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PrimaryLink href="/register">Start Free</PrimaryLink>
              <SecondaryLink href="#how-it-works">See How It Works</SecondaryLink>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.22em] text-[#5F6368]">
              <span className="rounded-full border border-[#E7E7E2] bg-white px-3 py-2">
                Built for modern African online sellers
              </span>
            </div>
          </>
        ) : null}

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {section.bullets.map((point) => (
            <motion.div
              key={point}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className={`rounded-[1.35rem] border bg-white px-4 py-4 text-sm shadow-[0_18px_40px_rgba(17,17,17,0.04)] transition ${
                active ? "border-[#0F5D46]/20" : "border-[#E7E7E2]"
              }`}
            >
              {point}
            </motion.div>
          ))}
        </div>

        {section.id === "trust" ? <TestimonialsSection /> : null}
        {section.id === "pricing" ? <PricingSection /> : null}
        {section.id === "cta" ? <FinalCtaActions /> : null}
      </motion.div>
    </article>
  );
}

function StickyBoardLayout({
  active,
  data,
  compact = false,
}: {
  active: Stage;
  data: BoardData;
  compact?: boolean;
}) {
  const highlighted = {
    hero: ["summary", "pipeline", "orders"],
    problem: ["alerts", "payments", "followups", "dispatch"],
    shift: ["pipeline", "summary"],
    orders: ["orders", "pipeline"],
    payments: ["payments"],
    customers: ["customers"],
    followups: ["followups"],
    dispatch: ["dispatch"],
    visibility: ["summary", "insights"],
    trust: ["summary", "customers", "payments"],
    pricing: ["summary"],
    cta: ["summary", "pipeline", "dispatch"],
  } as const;

  const isOn = (key: string) => highlighted[active].includes(key as never);

  return (
    <div className="w-full">
      <BoardFrame title="WhatsBoard board" active={active} compact={compact}>
        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-5">
            <StatCard label="Total orders" value={String(data.stats.totalOrders)} accent={isOn("summary")} />
            <StatCard label="Pending" value={String(data.stats.pendingPayments)} accent={isOn("payments")} />
            <StatCard label="Delivered" value={String(data.stats.delivered)} accent={isOn("dispatch")} />
            <StatCard label="Repeat" value={String(data.stats.repeatCustomers)} accent={isOn("customers")} />
            <StatCard label="Due follow-ups" value={String(data.stats.followUpsDue)} accent={isOn("followups")} />
          </div>

          <div className={`grid gap-4 ${compact ? "" : "xl:grid-cols-[1.05fr_0.95fr]"}`}>
            <BoardPanel title="Order pipeline" meta="Live workflow" accent={isOn("pipeline")}>
              <Pipeline data={data.orders} />
            </BoardPanel>

            <BoardPanel title="Recent orders" meta="Backend-ready records" accent={isOn("orders")}>
              <OrdersTable orders={data.orders} compact={compact} />
            </BoardPanel>
          </div>

          <div className={`grid gap-4 ${compact ? "" : "xl:grid-cols-[0.92fr_1.08fr]"}`}>
            <BoardPanel title="Payment visibility" meta="Collection pressure" accent={isOn("payments")}>
              <PaymentsList orders={data.orders} />
            </BoardPanel>

            <BoardPanel title="Customer records" meta="Searchable profiles" accent={isOn("customers")}>
              <CustomerList customers={data.customers} />
            </BoardPanel>
          </div>

          <div className={`grid gap-4 ${compact ? "" : "xl:grid-cols-[1fr_1fr_0.94fr]"}`}>
            <BoardPanel title="Follow-up queue" meta="Keep momentum" accent={isOn("followups")}>
              <FollowUpList items={data.followUps} />
            </BoardPanel>

            <BoardPanel title="Dispatch tracker" meta="Operational flow" accent={isOn("dispatch")}>
              <DeliveryList items={data.deliveries} />
            </BoardPanel>

            <BoardPanel title="Business visibility" meta="Today" accent={isOn("insights") || isOn("summary")}>
              <InsightsList stats={data.stats} />
            </BoardPanel>
          </div>

          <AlertStrip active={isOn("alerts")} />
        </div>
      </BoardFrame>
    </div>
  );
}

function BoardFrame({
  title,
  active,
  compact,
  children,
}: {
  title: string;
  active: Stage;
  compact: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      layout
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`overflow-hidden rounded-[2rem] border border-[#E7E7E2] bg-white shadow-[0_36px_120px_rgba(17,17,17,0.08)] ${
        compact ? "rounded-[1.5rem]" : ""
      }`}
    >
      <div className="border-b border-[#E7E7E2] px-4 py-4 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#5F6368]">{title}</p>
            <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#111111] sm:text-2xl">
              Orders, payments, customers, follow-ups, dispatch
            </h3>
          </div>
          <span className="rounded-full border border-[#E7E7E2] bg-[#F8F8F4] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[#0F5D46]">
            {active}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5">{children}</div>
    </motion.div>
  );
}

function BoardPanel({
  title,
  meta,
  accent,
  children,
}: {
  title: string;
  meta: string;
  accent: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      layout
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`rounded-[1.4rem] border p-4 transition ${
        accent
          ? "border-[#0F5D46]/25 bg-[#FBFCF8] shadow-[0_20px_50px_rgba(15,93,70,0.08)]"
          : "border-[#E7E7E2] bg-[#FCFCFA]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#5F6368]">{title}</p>
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#5F6368]/80">{meta}</p>
      </div>
      <div className="mt-4">{children}</div>
    </motion.div>
  );
}

function Pipeline({ data }: { data: OrderRecord[] }) {
  const counts = {
    new: data.filter((item) => item.status === "new").length + 4,
    awaiting_payment: data.filter((item) => item.status === "awaiting_payment").length + 5,
    paid: data.filter((item) => item.status === "paid").length + 3,
    packing: data.filter((item) => item.status === "packing").length + 2,
    dispatch: data.filter((item) => item.status === "dispatch").length + 2,
    delivered: data.filter((item) => item.status === "delivered").length + 9,
  };

  const labels: Array<{ key: OrderStatus; label: string }> = [
    { key: "new", label: "New" },
    { key: "awaiting_payment", label: "Awaiting payment" },
    { key: "paid", label: "Paid" },
    { key: "packing", label: "Packing" },
    { key: "dispatch", label: "Dispatch" },
    { key: "delivered", label: "Delivered" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {labels.map((item) => (
        <div key={item.key} className="rounded-[1.05rem] border border-[#E7E7E2] bg-white px-3 py-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#5F6368]">{item.label}</p>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#111111]">
            {counts[item.key]}
          </p>
        </div>
      ))}
    </div>
  );
}

function OrdersTable({ orders, compact }: { orders: OrderRecord[]; compact: boolean }) {
  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div
          key={order.id}
          className="grid gap-2 rounded-[1rem] border border-[#E7E7E2] bg-white px-3 py-3 text-sm sm:grid-cols-[0.9fr_1.05fr_0.8fr_0.8fr] sm:items-center"
        >
          <div>
            <p className="font-medium text-[#111111]">{order.id}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#5F6368]">{order.createdAt}</p>
          </div>
          <div>
            <p className="font-medium text-[#111111]">{order.customerName}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#5F6368]">{order.source}</p>
          </div>
          <div className={!compact ? "" : "flex items-center justify-between"}>
            <p className="font-medium text-[#111111]">{order.total}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#5F6368]">
              {order.status.replaceAll("_", " ")}
            </p>
          </div>
          <div className="flex sm:justify-end">
            <PaymentBadge status={order.paymentStatus} />
          </div>
        </div>
      ))}
    </div>
  );
}

function PaymentsList({ orders }: { orders: OrderRecord[] }) {
  return (
    <div className="space-y-3">
      {orders.map((order, index) => (
        <div key={order.id} className="rounded-[1rem] border border-[#E7E7E2] bg-white px-3 py-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-[#111111]">{order.customerName}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#5F6368]">
                Ref {order.id.replace("#WB-", "TX-")} • {index === 0 ? "09:14" : index === 1 ? "08:49" : "Yesterday 16:22"}
              </p>
            </div>
            <PaymentBadge status={order.paymentStatus} />
          </div>
        </div>
      ))}
    </div>
  );
}

function CustomerList({ customers }: { customers: CustomerRecord[] }) {
  return (
    <div className="space-y-3">
      {customers.map((customer) => (
        <div key={customer.id} className="rounded-[1rem] border border-[#E7E7E2] bg-white px-3 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-[#111111]">{customer.name}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#5F6368]">
                {customer.phone} • {customer.purchaseHistory}
              </p>
              <p className="mt-2 text-xs text-[#5F6368]">
                Last order {customer.lastOrder} • Follow-up {customer.followUpDate}
              </p>
            </div>
            <span className="rounded-full border border-[#E7E7E2] bg-[#F8F8F4] px-2 py-1 text-[11px] uppercase tracking-[0.16em] text-[#0F5D46]">
              {customer.state}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function FollowUpList({ items }: { items: FollowUpRecord[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-[1rem] border border-[#E7E7E2] bg-white px-3 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-[#111111]">{item.customerName}</p>
              <p className="mt-1 text-xs text-[#5F6368]">{item.action}</p>
            </div>
            <FollowUpBadge status={item.status} />
          </div>
          <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-[#5F6368]">{item.dueLabel}</p>
        </div>
      ))}
    </div>
  );
}

function DeliveryList({ items }: { items: DeliveryRecord[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-[1rem] border border-[#E7E7E2] bg-white px-3 py-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-[#111111]">{item.orderId}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#5F6368]">
                {item.customerName} • {item.area}
              </p>
            </div>
            <DeliveryBadge status={item.status} />
          </div>
        </div>
      ))}
    </div>
  );
}

function InsightsList({ stats }: { stats: DashboardStats }) {
  const items = [
    { label: "Pending payments", value: `${stats.pendingPayments} orders` },
    { label: "Delivered", value: `${stats.delivered} this month` },
    { label: "Repeat customers", value: `${stats.repeatCustomers} active` },
    { label: "Follow-ups due", value: `${stats.followUpsDue} today` },
  ];

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-[1rem] border border-[#E7E7E2] bg-white px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#5F6368]">{item.label}</p>
          <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[#111111]">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function AlertStrip({ active }: { active: boolean }) {
  return (
    <motion.div
      layout
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`rounded-[1.3rem] border px-4 py-4 text-sm ${
        active
          ? "border-[#C95C54]/24 bg-[#FFF7F6] text-[#7C2D2A]"
          : "border-[#E7E7E2] bg-[#F8F8F4] text-[#5F6368]"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
            active ? "bg-[#C95C54] text-white" : "bg-[#E7E7E2] text-[#0F5D46]"
          }`}
        >
          !
        </span>
        <div>
          <p className="font-medium">
            {active
              ? "3 orders have no confirmed payment, 1 customer is waiting, and 2 follow-ups are overdue."
              : "The board makes pressure visible before it turns into missed sales."}
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] opacity-75">Operational risk</p>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: boolean;
}) {
  return (
    <motion.div
      layout
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`rounded-[1.2rem] border px-4 py-4 ${
        accent
          ? "border-[#0F5D46]/22 bg-[#FBFCF8] shadow-[0_14px_40px_rgba(15,93,70,0.07)]"
          : "border-[#E7E7E2] bg-white"
      }`}
    >
      <p className="text-[11px] uppercase tracking-[0.18em] text-[#5F6368]">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#111111]">{value}</p>
    </motion.div>
  );
}

function PaymentBadge({ status }: { status: PaymentStatus }) {
  const styles =
    status === "unpaid"
      ? "border-[#C95C54]/22 bg-[#FFF7F6] text-[#A9473F]"
      : status === "partial"
        ? "border-[#E7E7E2] bg-[#F8F8F4] text-[#5F6368]"
        : status === "paid"
          ? "border-[#0F5D46]/18 bg-[#F3FBF7] text-[#0F5D46]"
          : "border-[#0A3D2E]/16 bg-[#0A3D2E] text-white";

  return (
    <span className={`rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] ${styles}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

function FollowUpBadge({ status }: { status: FollowUpStatus }) {
  const styles =
    status === "overdue"
      ? "border-[#C95C54]/22 bg-[#FFF7F6] text-[#A9473F]"
      : status === "today"
        ? "border-[#0F5D46]/18 bg-[#F3FBF7] text-[#0F5D46]"
        : "border-[#E7E7E2] bg-[#F8F8F4] text-[#5F6368]";

  return (
    <span className={`rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] ${styles}`}>
      {status}
    </span>
  );
}

function DeliveryBadge({ status }: { status: DeliveryStatus }) {
  const label =
    status === "ready_to_pack"
      ? "ready to pack"
      : status === "sent_out"
        ? "sent out"
        : status;

  const styles =
    status === "delivered"
      ? "border-[#0A3D2E]/16 bg-[#0A3D2E] text-white"
      : status === "sent_out"
        ? "border-[#0F5D46]/18 bg-[#F3FBF7] text-[#0F5D46]"
        : "border-[#E7E7E2] bg-[#F8F8F4] text-[#5F6368]";

  return (
    <span className={`rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] ${styles}`}>
      {label}
    </span>
  );
}

function TestimonialsSection() {
  return (
    <div className="mt-8 grid gap-4">
      {testimonials.map((item) => (
        <motion.div
          key={item.name}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="rounded-[1.5rem] border border-[#E7E7E2] bg-white p-5 shadow-[0_18px_50px_rgba(17,17,17,0.04)]"
        >
          <p className="text-sm leading-7 text-[#5F6368]">&ldquo;{item.quote}&rdquo;</p>
          <div className="mt-5 flex items-center justify-between gap-4 border-t border-[#E7E7E2] pt-4">
            <div>
              <p className="text-sm font-semibold text-[#111111]">{item.name}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-[#5F6368]">{item.role}</p>
            </div>
            <span className="rounded-full border border-[#E7E7E2] bg-[#F8F8F4] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[#0F5D46]">
              Verified seller
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function PricingSection() {
  return (
    <div className="mt-8 grid gap-4">
      {pricingTiers.map((tier) => (
        <motion.div
          key={tier.name}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className={`rounded-[1.6rem] border bg-white p-5 shadow-[0_18px_50px_rgba(17,17,17,0.04)] ${
            tier.highlight ? "border-[#0F5D46]/26 shadow-[0_24px_80px_rgba(15,93,70,0.08)]" : "border-[#E7E7E2]"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#5F6368]">{tier.name}</p>
              <h3 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#111111]">{tier.price}</h3>
            </div>
            {tier.highlight ? (
              <span className="rounded-full bg-[#0F5D46] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white">
                Best plan
              </span>
            ) : null}
          </div>
          <p className="mt-4 text-sm leading-7 text-[#5F6368]">{tier.note}</p>
          <Link
            href="/pricing"
            className={`mt-6 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-medium transition ${
              tier.highlight
                ? "bg-[#0F5D46] text-white hover:bg-[#0A3D2E]"
                : "border border-[#E7E7E2] text-[#0F5D46] hover:bg-[#F4F5F0]"
            }`}
          >
            {tier.cta}
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

function FinalCtaActions() {
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      <PrimaryLink href="/register">Start Free</PrimaryLink>
      <SecondaryLink href="/pricing">See Pricing</SecondaryLink>
    </div>
  );
}

function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full bg-[#0F5D46] px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-[#0A3D2E]"
    >
      {children}
    </Link>
  );
}

function SecondaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-[#E7E7E2] bg-white px-5 py-3 text-center text-sm font-medium text-[#0A3D2E] transition hover:bg-[#F4F5F0]"
    >
      {children}
    </Link>
  );
}

function MobileCtaBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E7E7E2] bg-[#FAFAF7]/94 p-3 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-md items-center gap-3">
        <PrimaryLink href="/register">
          <span className="block w-full">Start Free</span>
        </PrimaryLink>
        <SecondaryLink href="/pricing">
          <span className="block w-full">Pricing</span>
        </SecondaryLink>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#E7E7E2] bg-[#FAFAF7]">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-10 text-sm text-[#5F6368] sm:px-6 md:flex-row md:items-center md:justify-between">
        <p>WhatsBoard. From chat chaos to sales control.</p>
        <div className="flex items-center gap-5">
          <Link href="/pricing" className="transition hover:text-[#111111]">
            Pricing
          </Link>
          <Link href="/login" className="transition hover:text-[#111111]">
            Log in
          </Link>
          <Link href="/register" className="transition hover:text-[#111111]">
            Start free
          </Link>
        </div>
      </div>
    </footer>
  );
}
