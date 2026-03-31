"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PLAN_CONFIG } from "@/lib/plan-access";

type OrderStatus =
  | "new"
  | "awaiting_payment"
  | "paid"
  | "packing"
  | "dispatch"
  | "delivered";
type PaymentStatus = "unpaid" | "partial" | "paid" | "confirmed";

type OrderRecord = {
  id: string;
  customer: string;
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
  history: string;
  nextAction: string;
};

const orders: OrderRecord[] = [
  {
    id: "#WB-1092",
    customer: "Asha Mushi",
    source: "WhatsApp",
    total: "TZS 95,000",
    status: "awaiting_payment",
    createdAt: "Today, 09:12",
    paymentStatus: "unpaid",
  },
  {
    id: "#WB-1091",
    customer: "Kevin Otieno",
    source: "Instagram",
    total: "TZS 64,000",
    status: "paid",
    createdAt: "Today, 08:42",
    paymentStatus: "confirmed",
  },
  {
    id: "#WB-1089",
    customer: "Neema Said",
    source: "TikTok",
    total: "TZS 120,000",
    status: "dispatch",
    createdAt: "Yesterday",
    paymentStatus: "paid",
  },
];

const customers: CustomerRecord[] = [
  {
    id: "cus_01",
    name: "Grace Mollel",
    phone: "+255 718 400 213",
    lastOrder: "#WB-1084",
    history: "4 orders",
    nextAction: "Follow up today",
  },
  {
    id: "cus_02",
    name: "Amina Yusuf",
    phone: "+254 701 882 114",
    lastOrder: "#WB-1079",
    history: "7 orders",
    nextAction: "Repeat order likely",
  },
];

const features = [
  {
    label: "Orders",
    title: "Turn incoming chats into a visible order pipeline.",
    body: "Every order gets an ID, total, source, stage, and next action instead of staying trapped in chat.",
  },
  {
    label: "Payments",
    title: "See unpaid, partial, paid, and confirmed clearly.",
    body: "Collection work becomes visible before dispatch starts moving.",
  },
  {
    label: "Customers",
    title: "Keep the customer record attached to the sale.",
    body: "Phone numbers, last orders, follow-ups, and repeat history stay in one place.",
  },
  {
    label: "Follow-ups",
    title: "Stop relying on memory for the next reply.",
    body: "Overdue, due today, and upcoming actions stay visible without digging through old messages.",
  },
  {
    label: "Dispatch",
    title: "Move from paid to packed to delivered cleanly.",
    body: "Operational steps become trackable for the seller and the team.",
  },
  {
    label: "Visibility",
    title: "Run the day from one calm overview.",
    body: "See total orders, pending payments, repeat customers, and pressure points instantly.",
  },
];

const faqs = [
  {
    q: "What does WhatsBoard do exactly?",
    a: "It gives sellers one place to manage orders, payments, customers, follow-ups, and delivery after the sale starts in chat.",
  },
  {
    q: "Is this only for WhatsApp?",
    a: "No. It fits sellers getting orders from WhatsApp, Instagram, TikTok, and Facebook.",
  },
  {
    q: "Do I need a team to use it?",
    a: "No. It works for solo sellers first, then scales into a more structured workflow as volume grows.",
  },
  {
    q: "Can this connect to real backend data later?",
    a: "Yes. The homepage product previews are built from typed records that mirror real app entities like orders, customers, payments, and follow-ups.",
  },
];

const testimonials = [
  {
    quote:
      "Before WhatsBoard, I was checking screenshots to confirm payments. Now I know exactly what is pending and what moves next.",
    name: "Amina",
    role: "Fashion seller, Dar es Salaam",
  },
  {
    quote:
      "The biggest change is follow-up speed. Orders stopped disappearing inside chats and the business feels more serious.",
    name: "Brian",
    role: "Accessories seller, Nairobi",
  },
  {
    quote:
      "It gave me more delivery control without making the system heavy. I can still run it from my phone.",
    name: "Neema",
    role: "Beauty seller, Arusha",
  },
];

const pricing = Object.values(PLAN_CONFIG);

export default function WhatsBoardHomepage() {
  return (
    <main className="min-h-screen bg-[#fafaf7] text-[#111111]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(15,93,70,0.07),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0),rgba(15,93,70,0.025))]" />
      <Navbar />
      <Hero />
      <ProblemMath />
      <FeatureRail />
      <FounderStyleSection />
      <ProductScenes />
      <WallOfLove />
      <PricingSection />
      <FaqSection />
      <FinalCta />
      <Footer />
    </main>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#e8e8e2] bg-[#fafaf7]/88 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="text-sm font-semibold text-[#111111]">
          WhatsBoard
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-[#5e6461] md:flex">
          <a href="#product" className="transition hover:text-[#111111]">
            Product
          </a>
          <a href="#features" className="transition hover:text-[#111111]">
            Features
          </a>
          <a href="#pricing" className="transition hover:text-[#111111]">
            Pricing
          </a>
          <a href="#testimonials" className="transition hover:text-[#111111]">
            Testimonials
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-full border border-[#e8e8e2] bg-white px-3 py-2 text-xs text-[#0a3d2e] transition hover:bg-[#f2f3ee] sm:px-4 sm:text-sm"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-[#0f5d46] px-3 py-2 text-xs text-white transition hover:bg-[#0a3d2e] sm:px-4 sm:text-sm"
          >
            Start Free
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <p className="text-sm font-semibold text-[#0f5d46]">From chat chaos to sales control</p>
          <h1 className="mt-5 text-[2.8rem] leading-[0.95] font-semibold tracking-[-0.07em] text-[#111111] sm:text-6xl xl:text-7xl">
            The operating layer for sellers who get orders in chats.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[#5e6461]">
            WhatsBoard helps African online sellers track orders, payments, customers, follow-ups,
            and delivery workflow in one place after the message lands.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <PrimaryLink href="/register">Start Free</PrimaryLink>
            <SecondaryLink href="/pricing">See Pricing</SecondaryLink>
          </div>
          <div className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-2">
              {["A", "B", "N", "K"].map((item) => (
                <span
                  key={item}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white bg-[#0f5d46] text-xs font-semibold text-white"
                >
                  {item}
                </span>
              ))}
            </div>
            <div className="text-sm text-[#5e6461]">
              <p className="font-medium text-[#111111]">Built for modern African online sellers</p>
              <p>Used to organize orders after WhatsApp, Instagram, Facebook, and TikTok chats.</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.05 }}
          className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]"
        >
          <HeroPanel title="Orders moving now" className="lg:row-span-2">
            <div className="grid gap-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-[1.1rem] border border-[#e8e8e2] bg-[#fcfcfa] px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-[#111111]">{order.customer}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#5e6461]">
                        {order.id} • {order.source}
                      </p>
                    </div>
                    <PaymentPill status={order.paymentStatus} />
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                    <span className="text-[#5e6461]">{order.total}</span>
                    <span className="rounded-full border border-[#e8e8e2] bg-white px-2 py-1 text-[11px] uppercase tracking-[0.16em] text-[#0f5d46]">
                      {order.status.replaceAll("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </HeroPanel>

          <HeroPanel title="Customer context">
            <div className="space-y-3">
              {customers.map((customer) => (
                <div key={customer.id} className="rounded-[1rem] border border-[#e8e8e2] bg-[#fcfcfa] px-3 py-3">
                  <p className="font-medium text-[#111111]">{customer.name}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#5e6461]">
                    {customer.history} • {customer.nextAction}
                  </p>
                </div>
              ))}
            </div>
          </HeroPanel>

          <HeroPanel title="Seller pressure">
            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="Pending payments" value="6" />
              <MiniStat label="Follow-ups due" value="8" />
              <MiniStat label="Repeat customers" value="17" />
              <MiniStat label="Delivered this month" value="38" />
            </div>
          </HeroPanel>
        </motion.div>
      </div>
    </section>
  );
}

function ProblemMath() {
  const rows = [
    "Checking old chats for order details",
    "Looking for payment proof screenshots",
    "Remembering who needs a follow-up",
    "Reconfirming delivery status by hand",
    "Tracking repeat buyers from memory",
    "Overthinking the next action",
  ];

  return (
    <section className="py-18 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.45 }}
          >
            <p className="text-sm font-semibold text-[#0f5d46]">There’s an easier way</p>
            <h2 className="mt-4 text-[2.4rem] leading-[0.98] font-semibold tracking-[-0.06em] text-[#111111] sm:text-5xl xl:text-6xl">
              Selling should feel busy. Running the business should not feel messy.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-[#5e6461]">
              Most sellers are not losing because demand is low. They are losing because the system
              after the message is weak.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="rounded-[2rem] border border-[#e8e8e2] bg-white p-6 shadow-[0_20px_60px_rgba(17,17,17,0.05)]"
          >
            <div className="space-y-3">
              {rows.map((row) => (
                <div key={row} className="flex items-start gap-3 text-sm text-[#5e6461]">
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#f1f2ec] text-[11px] text-[#111111]">
                    +
                  </span>
                  <span>{row}</span>
                </div>
              ))}
            </div>
            <div className="my-6 h-px bg-[#e8e8e2]" />
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#5e6461]">
                  Weekly cost of chaos
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#111111]">
                  15+ hours
                </p>
              </div>
              <div className="rounded-full bg-[#0f5d46] px-4 py-2 text-sm font-medium text-white">
                Fix the workflow
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FeatureRail() {
  return (
    <section id="features" className="py-18 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45 }}
          className="max-w-3xl"
        >
          <p className="text-sm font-semibold text-[#0f5d46]">What changes after WhatsBoard</p>
          <h2 className="mt-4 text-[2.4rem] leading-[0.98] font-semibold tracking-[-0.06em] text-[#111111] sm:text-5xl xl:text-6xl">
            The business becomes structured fast.
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
              className="rounded-[1.7rem] border border-[#e8e8e2] bg-white p-6 shadow-[0_18px_40px_rgba(17,17,17,0.04)]"
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#5e6461]">{feature.label}</p>
              <h3 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-[#111111]">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#5e6461]">{feature.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FounderStyleSection() {
  return (
    <section className="py-18 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.45 }}
            className="rounded-[1.8rem] border border-[#e8e8e2] bg-white p-6 shadow-[0_18px_40px_rgba(17,17,17,0.04)]"
          >
            <p className="text-sm font-semibold text-[#111111]">Why this exists</p>
            <p className="mt-4 text-sm leading-7 text-[#5e6461]">
              Most commerce tools were not built for sellers whose first system is a chat thread.
              WhatsBoard starts exactly there and gives the seller a cleaner operating layer without
              making the workflow feel heavy.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#5e6461]">Built for execution</p>
            <h2 className="mt-4 text-[2.4rem] leading-[0.98] font-semibold tracking-[-0.06em] text-[#111111] sm:text-5xl xl:text-6xl">
              The goal is simple: less screenshot hunting, less guessing, more control.
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <StoryCard
                title="Before"
                body="Orders live in WhatsApp. Payments live in screenshots. Delivery status lives in memory."
                tone="muted"
              />
              <StoryCard
                title="After"
                body="Orders, payments, customers, and dispatch move through one structured system the seller can trust."
                tone="positive"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ProductScenes() {
  return (
    <section id="product" className="py-18 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45 }}
          className="max-w-3xl"
        >
          <p className="text-sm font-semibold text-[#0f5d46]">Product proof</p>
          <h2 className="mt-4 text-[2.4rem] leading-[0.98] font-semibold tracking-[-0.06em] text-[#111111] sm:text-5xl xl:text-6xl">
            See the product the way a seller uses it.
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-5 xl:grid-cols-[1.12fr_0.88fr]">
          <ScenePanel title="Order pipeline" meta="Structured flow">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {[
                ["New", "12"],
                ["Awaiting payment", "6"],
                ["Paid", "9"],
                ["Packing", "5"],
                ["Dispatch", "4"],
                ["Delivered", "18"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[1rem] border border-[#e8e8e2] bg-[#f9f9f5] px-3 py-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#5e6461]">{label}</p>
                  <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#111111]">{value}</p>
                </div>
              ))}
            </div>
          </ScenePanel>

          <ScenePanel title="Customer records" meta="Context that stays">
            <div className="space-y-3">
              {customers.map((customer) => (
                <div key={customer.id} className="rounded-[1rem] border border-[#e8e8e2] bg-[#f9f9f5] px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-[#111111]">{customer.name}</p>
                      <p className="mt-1 break-all text-[11px] uppercase tracking-[0.12em] text-[#5e6461] sm:tracking-[0.16em]">
                        {customer.phone}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-[#e8e8e2] bg-white px-2 py-1 text-[11px] uppercase tracking-[0.12em] text-[#0f5d46] sm:tracking-[0.16em]">
                      {customer.history}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScenePanel>

          <ScenePanel title="Payment tracking" meta="Collection visibility">
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="rounded-[1rem] border border-[#e8e8e2] bg-[#f9f9f5] px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-[#111111]">{order.customer}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#5e6461]">{order.total}</p>
                    </div>
                    <PaymentPill status={order.paymentStatus} />
                  </div>
                </div>
              ))}
            </div>
          </ScenePanel>

          <ScenePanel title="Next actions" meta="Follow-ups and dispatch">
            <div className="space-y-3">
              <div className="rounded-[1rem] border border-[#e8e8e2] bg-[#fff6f4] px-3 py-3">
                <p className="font-medium text-[#111111]">Grace Mollel</p>
                <p className="mt-1 text-sm text-[#5e6461]">Payment proof overdue by 1 day</p>
              </div>
              <div className="rounded-[1rem] border border-[#e8e8e2] bg-[#f9f9f5] px-3 py-3">
                <p className="font-medium text-[#111111]">#WB-1087</p>
                <p className="mt-1 text-sm text-[#5e6461]">Packed and ready for dispatch</p>
              </div>
              <div className="rounded-[1rem] border border-[#e8e8e2] bg-[#f9f9f5] px-3 py-3">
                <p className="font-medium text-[#111111]">Repeat buyer likely</p>
                <p className="mt-1 text-sm text-[#5e6461]">Amina Yusuf followed up today</p>
              </div>
            </div>
          </ScenePanel>
        </div>
      </div>
    </section>
  );
}

function WallOfLove() {
  return (
    <section id="testimonials" className="py-18 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45 }}
          className="max-w-3xl"
        >
          <p className="text-sm font-semibold text-[#0f5d46]">Seller proof</p>
          <h2 className="mt-4 text-[2.4rem] leading-[0.98] font-semibold tracking-[-0.06em] text-[#111111] sm:text-5xl xl:text-6xl">
            Sellers feel the difference quickly.
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
              className="rounded-[1.8rem] border border-[#e8e8e2] bg-white p-6 shadow-[0_18px_40px_rgba(17,17,17,0.04)]"
            >
              <p className="text-sm leading-7 text-[#5e6461]">&ldquo;{item.quote}&rdquo;</p>
              <div className="mt-5 border-t border-[#e8e8e2] pt-4">
                <p className="text-sm font-semibold text-[#111111]">{item.name}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-[#5e6461]">{item.role}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            "Fewer missed orders",
            "Faster follow-up",
            "Clearer payment status",
            "Better delivery control",
          ].map((item) => (
            <div
              key={item}
              className="rounded-[1.25rem] border border-[#e8e8e2] bg-white px-4 py-4 text-sm text-[#111111]"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="py-18 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45 }}
          className="max-w-3xl"
        >
          <p className="text-sm font-semibold text-[#0f5d46]">Pricing</p>
          <h2 className="mt-4 text-[2.4rem] leading-[0.98] font-semibold tracking-[-0.06em] text-[#111111] sm:text-5xl xl:text-6xl">
            Simple pricing for sellers who want better control.
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-6 lg:grid-cols-4">
          {pricing.map((tier) => (
            <div
              key={tier.key}
              className={[
                "rounded-[2rem] border p-6 shadow-sm",
                tier.highlight
                  ? "border-[#173728] bg-[#173728] text-white shadow-xl"
                  : "border-[#e8e8e2] bg-white text-[#111111]",
              ].join(" ")}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p
                    className={[
                      "text-sm font-bold uppercase tracking-[0.18em]",
                      tier.highlight ? "text-white/76" : "text-[#0f5d46]",
                    ].join(" ")}
                  >
                    {tier.name}
                  </p>
                  <h3 className="mt-3 break-words text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
                    {tier.priceLabel}
                    <span className={["ml-1 text-sm font-semibold", tier.highlight ? "text-white/70" : "text-[#5e6461]"].join(" ")}>
                      {tier.key === "free" ? "/forever" : "/month"}
                    </span>
                  </h3>
                </div>
                <span
                  className={[
                    "inline-flex self-start rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]",
                    tier.highlight ? "bg-white text-[#173728]" : "bg-[#f4f6f1] text-[#0f5d46]",
                  ].join(" ")}
                >
                  {tier.badge}
                </span>
              </div>

              <p className={["mt-5 text-sm leading-7", tier.highlight ? "text-white/80" : "text-[#5e6461]"].join(" ")}>
                {tier.description}
              </p>

              <Link
                href="/pricing"
                className={[
                  "mt-6 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-medium transition",
                  tier.highlight
                    ? "bg-white text-[#173728] hover:bg-white/92"
                    : "border border-[#e8e8e2] text-[#0a3d2e] hover:bg-[#f2f3ee]",
                ].join(" ")}
              >
                {tier.key === "free" ? "Start free" : `View ${tier.name}`}
              </Link>

              <div className={["my-6 h-px", tier.highlight ? "bg-white/14" : "bg-[#e8e8e2]"].join(" ")} />

              <ul className="space-y-3">
                {tier.features.slice(0, 5).map((feature) => (
                  <li
                    key={feature.label}
                    className={["flex items-start gap-3 text-sm", tier.highlight ? "text-white/85" : "text-[#5e6461]"].join(" ")}
                  >
                    <span
                      className={[
                        "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-black",
                        tier.highlight ? "bg-white text-[#173728]" : "bg-[#f4f6f1] text-[#0f5d46]",
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
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="py-18 lg:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-[#0f5d46]">Frequently asked questions</p>
          <h2 className="mt-4 text-[2.4rem] leading-[0.98] font-semibold tracking-[-0.06em] text-[#111111] sm:text-5xl">
            Questions sellers ask before they switch.
          </h2>
        </div>
        <div className="mt-12 grid gap-4">
          {faqs.map((item) => (
            <div key={item.q} className="rounded-[1.6rem] border border-[#e8e8e2] bg-white p-6">
              <p className="text-lg font-semibold text-[#111111]">{item.q}</p>
              <p className="mt-3 text-sm leading-7 text-[#5e6461]">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="py-18 lg:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="rounded-[2rem] border border-[#e8e8e2] bg-[linear-gradient(180deg,#ffffff,#f5f6f0)] px-6 py-12 text-center shadow-[0_20px_60px_rgba(17,17,17,0.05)] sm:px-10">
          <p className="text-sm font-semibold text-[#0f5d46]">Start now</p>
          <h2 className="mt-4 text-[2.4rem] leading-[0.98] font-semibold tracking-[-0.06em] text-[#111111] sm:text-5xl xl:text-6xl">
            Chats help you sell. WhatsBoard helps you scale.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#5e6461]">
            Put the business into a system that knows what is paid, who needs a follow-up, and what
            should move next.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <PrimaryLink href="/register">Start Free</PrimaryLink>
            <SecondaryLink href="/pricing">See Pricing</SecondaryLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#e8e8e2] bg-[#fafaf7]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div>
          <p className="text-sm font-semibold text-[#111111]">WhatsBoard</p>
          <p className="mt-4 max-w-xs text-sm leading-7 text-[#5e6461]">
            A cleaner operating layer for online sellers running business after chat.
          </p>
        </div>
        <FooterColumn
          title="Product"
          links={[
            { href: "/pricing", label: "Pricing" },
            { href: "/register", label: "Start free" },
            { href: "/login", label: "Log in" },
          ]}
        />
        <FooterColumn
          title="Company"
          links={[
            { href: "/pricing", label: "Plans" },
            { href: "/register", label: "Get started" },
            { href: "/", label: "Homepage" },
          ]}
        />
        <FooterColumn
          title="Support"
          links={[
            { href: "/login", label: "Account" },
            { href: "/pricing", label: "Billing" },
            { href: "/register", label: "Contact" },
          ]}
        />
      </div>
    </footer>
  );
}

function HeroPanel({
  title,
  className = "",
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-[2rem] border border-[#e8e8e2] bg-white p-5 shadow-[0_20px_50px_rgba(17,17,17,0.05)] ${className}`}>
      <p className="text-[11px] uppercase tracking-[0.2em] text-[#5e6461]">{title}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function ScenePanel({
  title,
  meta,
  children,
}: {
  title: string;
  meta: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.45 }}
      className="rounded-[1.8rem] border border-[#e8e8e2] bg-white p-5 shadow-[0_20px_50px_rgba(17,17,17,0.04)]"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#5e6461] sm:tracking-[0.22em]">{title}</p>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#5e6461] sm:text-right sm:tracking-[0.22em]">{meta}</p>
      </div>
      <div className="mt-5">{children}</div>
    </motion.div>
  );
}

function StoryCard({
  title,
  body,
  tone,
}: {
  title: string;
  body: string;
  tone: "muted" | "positive";
}) {
  return (
    <div
      className={`rounded-[1.6rem] border p-5 ${
        tone === "positive"
          ? "border-[#0f5d46]/18 bg-[linear-gradient(180deg,#ffffff,#f4f7f3)]"
          : "border-[#e8e8e2] bg-white"
      }`}
    >
      <p className="text-sm font-semibold text-[#111111]">{title}</p>
      <p className="mt-3 text-sm leading-7 text-[#5e6461]">{body}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] border border-[#e8e8e2] bg-[#fcfcfa] px-3 py-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-[#5e6461]">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#111111]">{value}</p>
    </div>
  );
}

function PaymentPill({ status }: { status: PaymentStatus }) {
  const styles =
    status === "unpaid"
      ? "border-[#c7675d]/18 bg-[#fff5f3] text-[#a94b40]"
      : status === "partial"
        ? "border-[#e8e8e2] bg-[#f7f7f2] text-[#5e6461]"
        : status === "paid"
          ? "border-[#0f5d46]/18 bg-[#f2fbf6] text-[#0f5d46]"
          : "border-[#0a3d2e]/16 bg-[#0a3d2e] text-white";

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] ${styles}`}>
      {status}
    </span>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.24em] text-[#5e6461]">{title}</p>
      <div className="mt-4 grid gap-3 text-sm">
        {links.map((link) => (
          <Link key={link.label} href={link.href} className="text-[#111111] transition hover:text-[#0a3d2e]">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full bg-[#0f5d46] px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-[#0a3d2e]"
    >
      {children}
    </Link>
  );
}

function SecondaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-[#e8e8e2] bg-white px-5 py-3 text-center text-sm font-medium text-[#0a3d2e] transition hover:bg-[#f2f3ee]"
    >
      {children}
    </Link>
  );
}
