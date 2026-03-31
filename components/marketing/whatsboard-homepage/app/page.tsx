"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PLAN_CONFIG } from "@/lib/billing";

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
  followUp: string;
};

type FollowUpRecord = {
  id: string;
  customer: string;
  action: string;
  status: FollowUpStatus;
  due: string;
};

type DeliveryRecord = {
  id: string;
  orderId: string;
  area: string;
  customer: string;
  status: DeliveryStatus;
};

type DashboardStats = {
  totalOrders: string;
  pendingPayments: string;
  repeatCustomers: string;
  followUpsDue: string;
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
    followUp: "Today",
  },
  {
    id: "cus_02",
    name: "Amina Yusuf",
    phone: "+254 701 882 114",
    lastOrder: "#WB-1079",
    history: "7 orders",
    followUp: "Apr 2",
  },
  {
    id: "cus_03",
    name: "Brian Kato",
    phone: "+256 779 230 812",
    lastOrder: "#WB-1090",
    history: "2 orders",
    followUp: "Apr 4",
  },
];

const followUps: FollowUpRecord[] = [
  {
    id: "fu_01",
    customer: "Grace Mollel",
    action: "Check if payment proof is ready",
    status: "overdue",
    due: "Overdue by 1 day",
  },
  {
    id: "fu_02",
    customer: "Asha Mushi",
    action: "Confirm size before packing",
    status: "today",
    due: "Today at 14:00",
  },
  {
    id: "fu_03",
    customer: "Amina Yusuf",
    action: "Follow up on repeat order",
    status: "upcoming",
    due: "Tomorrow",
  },
];

const deliveries: DeliveryRecord[] = [
  {
    id: "dl_01",
    orderId: "#WB-1091",
    area: "Kariakoo",
    customer: "Kevin Otieno",
    status: "ready_to_pack",
  },
  {
    id: "dl_02",
    orderId: "#WB-1087",
    area: "Mikocheni",
    customer: "Neema Said",
    status: "packed",
  },
  {
    id: "dl_03",
    orderId: "#WB-1083",
    area: "Kinondoni",
    customer: "Zawadi John",
    status: "sent_out",
  },
];

const stats: DashboardStats = {
  totalOrders: "124",
  pendingPayments: "6",
  repeatCustomers: "17",
  followUpsDue: "8",
};

const features = [
  {
    title: "Order Tracking",
    description: "Every order gets an ID, status, source, amount, and clear next step.",
    accent: "Pipeline with real stages",
  },
  {
    title: "Payment Visibility",
    description: "Stop guessing who has paid, who sent proof, and what still needs action.",
    accent: "Unpaid, partial, paid, confirmed",
  },
  {
    title: "Customer Records",
    description: "Keep phone numbers, last orders, history, and next follow-up in one place.",
    accent: "Searchable customer context",
  },
  {
    title: "Smart Follow-ups",
    description: "Turn forgotten messages into a visible queue of overdue and due-today actions.",
    accent: "Overdue, today, upcoming",
  },
  {
    title: "Dispatch Workflow",
    description: "Move from ready to pack to delivered with visible operational stages.",
    accent: "Delivery stages that make sense",
  },
  {
    title: "Sales Overview",
    description: "See order load, pending payments, repeat customers, and follow-up pressure fast.",
    accent: "A calm daily control layer",
  },
];

const testimonials = [
  {
    quote:
      "Before WhatsBoard, I was checking screenshots to confirm payments. Now I know what is pending and what should move next.",
    name: "Amina",
    role: "Fashion seller, Dar es Salaam",
  },
  {
    quote:
      "The biggest shift is follow-up speed. Orders stopped disappearing inside chats and the business feels more serious.",
    name: "Brian",
    role: "Accessories seller, Nairobi",
  },
  {
    quote:
      "It made delivery and customer replies feel more professional without making the workflow heavy.",
    name: "Neema",
    role: "Beauty seller, Arusha",
  },
];

const pricing = Object.values(PLAN_CONFIG);

export default function WhatsBoardHomepage() {
  return (
    <main className="min-h-screen bg-[#FAFAF7] text-[#111111]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(15,93,70,0.07),transparent_28%),radial-gradient(circle_at_20%_15%,rgba(15,93,70,0.04),transparent_22%)]" />
      <Navbar />
      <Hero />
      <ChaosSection />
      <TransformationSection />
      <ProductShowcase />
      <FeatureGrid />
      <ComparisonSection />
      <TestimonialsSection />
      <PricingSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#E8E8E2]/80 bg-[#FAFAF7]/88 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="text-sm font-semibold uppercase tracking-[0.28em] text-[#111111]">
          WhatsBoard
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-[#5E6461] md:flex">
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
            className="rounded-full border border-[#E8E8E2] bg-white px-4 py-2 text-sm text-[#0A3D2E] transition hover:bg-[#F2F3EE]"
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

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-14 px-4 py-18 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-[#5E6461]">
            Commerce operating system
          </p>
          <h1 className="mt-5 text-5xl leading-[0.94] font-semibold tracking-[-0.08em] text-[#111111] sm:text-7xl">
            WhatsBoard turns sales from messy chats into a clear business system.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[#5E6461]">
            Track orders, payments, customers, follow-ups, and delivery workflow from WhatsApp
            and social media in one product that feels ready for real business.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <PrimaryLink href="/register">Start Free</PrimaryLink>
            <SecondaryLink href="/pricing">Book Demo</SecondaryLink>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.22em] text-[#5E6461]">
            <span className="rounded-full border border-[#E8E8E2] bg-white px-3 py-2">
              Built for African online sellers
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.05 }}
          className="relative min-h-[32rem]"
        >
          <div className="absolute inset-0 rounded-[2.6rem] bg-[radial-gradient(circle_at_top_right,rgba(15,93,70,0.16),transparent_32%),linear-gradient(180deg,#ffffff,#f4f5ef)]" />
          <FloatingPanel className="left-0 top-6 w-[56%]">
            <OrderPreviewCard order={orders[0]} />
          </FloatingPanel>
          <FloatingPanel className="right-0 top-0 w-[48%] delay-100">
            <PaymentPreviewCard order={orders[1]} />
          </FloatingPanel>
          <FloatingPanel className="left-[8%] top-[41%] w-[52%] delay-150">
            <CustomerPreviewCard customer={customers[0]} />
          </FloatingPanel>
          <FloatingPanel className="right-[4%] top-[38%] w-[42%] delay-200">
            <FollowUpPreviewCard item={followUps[0]} />
          </FloatingPanel>
          <FloatingPanel className="left-[18%] bottom-0 w-[60%] delay-300">
            <DispatchPreviewCard delivery={deliveries[1]} />
          </FloatingPanel>
        </motion.div>
      </div>
    </section>
  );
}

function ChaosSection() {
  return (
    <section className="relative py-18 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45 }}
          className="max-w-xl"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#5E6461]">
            Social commerce chaos
          </p>
          <h2 className="mt-4 text-4xl leading-[0.98] font-semibold tracking-[-0.07em] text-[#111111] sm:text-6xl">
            Your business is growing. Your system is not.
          </h2>
          <p className="mt-5 text-base leading-8 text-[#5E6461]">
            Orders are real. But the workflow around them is scattered across threads, screenshots,
            notes, and memory. That is where money and momentum start leaking.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="grid gap-4 sm:grid-cols-2"
        >
          <ChaosTile
            title="Payment proof buried"
            detail="A paid customer still looks unpaid because the screenshot is lost."
            tone="red"
          />
          <ChaosTile
            title="Customer waiting"
            detail="The same buyer follows up twice because the context is split across apps."
          />
          <ChaosTile
            title="Delivery note missing"
            detail="The order moves, but nobody can see the real dispatch stage."
          />
          <ChaosTile
            title="Forgotten follow-up"
            detail="A warm lead goes cold because the seller forgot to text back."
            tone="red"
          />
        </motion.div>
      </div>
    </section>
  );
}

function TransformationSection() {
  const steps = [
    "Orders",
    "Payments",
    "Customers",
    "Follow-ups",
    "Dispatch",
  ];

  return (
    <section id="product" className="py-18 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#5E6461]">
            Product transformation
          </p>
          <h2 className="mt-4 text-4xl leading-[0.98] font-semibold tracking-[-0.07em] text-[#111111] sm:text-6xl">
            WhatsBoard organizes the business into one clean operational flow.
          </h2>
          <p className="mt-5 text-base leading-8 text-[#5E6461]">
            It turns reactive selling into a system that can actually run the day.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-4 lg:grid-cols-5">
          {steps.map((step, index) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              className="rounded-[1.6rem] border border-[#E8E8E2] bg-white p-5 shadow-[0_18px_40px_rgba(17,17,17,0.04)]"
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#5E6461]">Step {index + 1}</p>
              <p className="mt-6 text-2xl font-semibold tracking-[-0.05em] text-[#111111]">{step}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductShowcase() {
  return (
    <section className="py-18 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45 }}
          className="max-w-3xl"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#5E6461]">
            Product showcase
          </p>
          <h2 className="mt-4 text-4xl leading-[0.98] font-semibold tracking-[-0.07em] text-[#111111] sm:text-6xl">
            Real product surfaces, not decorative screenshots.
          </h2>
          <p className="mt-5 text-base leading-8 text-[#5E6461]">
            Orders, customers, payments, reminders, and delivery stages are shown as connected
            modules that can map to real backend data later.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.12fr_0.88fr]">
          <ShowcasePanel title="Order pipeline" meta="Structured flow">
            <PipelinePreview />
          </ShowcasePanel>
          <ShowcasePanel title="Customer records" meta="Context that stays">
            <CustomerTablePreview />
          </ShowcasePanel>
          <ShowcasePanel title="Payment tracking" meta="Collection visibility">
            <PaymentListPreview />
          </ShowcasePanel>
          <ShowcasePanel title="Dispatch workflow" meta="Operational movement">
            <DispatchListPreview />
          </ShowcasePanel>
        </div>
      </div>
    </section>
  );
}

function FeatureGrid() {
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
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#5E6461]">
            Feature grid
          </p>
          <h2 className="mt-4 text-4xl leading-[0.98] font-semibold tracking-[-0.07em] text-[#111111] sm:text-6xl">
            Built for the real pain of chat-first selling.
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
              className="rounded-[1.6rem] border border-[#E8E8E2] bg-white p-5 shadow-[0_18px_40px_rgba(17,17,17,0.04)]"
            >
              <div className="rounded-[1rem] border border-[#E8E8E2] bg-[#F7F7F2] px-3 py-3 text-[11px] uppercase tracking-[0.18em] text-[#5E6461]">
                {feature.accent}
              </div>
              <h3 className="mt-5 text-2xl font-semibold tracking-[-0.05em] text-[#111111]">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#5E6461]">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComparisonSection() {
  const withoutItems = [
    "Lost context inside chats",
    "Slow payment follow-up",
    "No clean customer history",
    "Delivery updates depend on memory",
  ];
  const withItems = [
    "Everything visible in one place",
    "Fewer missed orders",
    "Cleaner workflow every day",
    "More confidence in the business",
  ];

  return (
    <section className="py-18 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <ComparisonCard
            label="Without WhatsBoard"
            title="The business keeps moving, but nobody can see it clearly."
            items={withoutItems}
            tone="muted"
          />
          <ComparisonCard
            label="With WhatsBoard"
            title="The business feels calmer because the workflow is finally visible."
            items={withItems}
            tone="positive"
          />
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const statsRow = [
    "Fewer missed orders",
    "Faster payment follow-up",
    "Better customer tracking",
    "More delivery control",
  ];

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
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#5E6461]">
            Testimonials
          </p>
          <h2 className="mt-4 text-4xl leading-[0.98] font-semibold tracking-[-0.07em] text-[#111111] sm:text-6xl">
            Practical outcomes sellers can feel quickly.
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
              className="rounded-[1.6rem] border border-[#E8E8E2] bg-white p-5 shadow-[0_18px_40px_rgba(17,17,17,0.04)]"
            >
              <p className="text-sm leading-7 text-[#5E6461]">&ldquo;{item.quote}&rdquo;</p>
              <div className="mt-5 border-t border-[#E8E8E2] pt-4">
                <p className="text-sm font-semibold text-[#111111]">{item.name}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-[#5E6461]">
                  {item.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statsRow.map((item) => (
            <div
              key={item}
              className="rounded-[1.25rem] border border-[#E8E8E2] bg-white px-4 py-4 text-sm text-[#111111]"
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
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#5E6461]">
            Pricing
          </p>
          <h2 className="mt-4 text-4xl leading-[0.98] font-semibold tracking-[-0.07em] text-[#111111] sm:text-6xl">
            Simple plans for sellers who want more control.
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-4 lg:grid-cols-4">
          {pricing.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
              className={`rounded-[1.8rem] border bg-white p-6 shadow-[0_18px_40px_rgba(17,17,17,0.04)] ${
                tier.highlight ? "border-[#0F5D46]/26 shadow-[0_24px_70px_rgba(15,93,70,0.08)]" : "border-[#E8E8E2]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[#5E6461]">{tier.name}</p>
                  <h3 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#111111]">
                    {tier.priceLabel}
                  </h3>
                </div>
                {tier.highlight ? (
                  <span className="rounded-full bg-[#0F5D46] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white">
                    {tier.badge}
                  </span>
                ) : tier.badge ? (
                  <span className="rounded-full border border-[#E8E8E2] bg-[#F7F7F2] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[#0F5D46]">
                    {tier.badge}
                  </span>
                ) : null}
              </div>
              <p className="mt-4 text-sm leading-7 text-[#5E6461]">{tier.description}</p>
              <div className="mt-5 grid gap-2">
                {tier.features.slice(0, 3).map((feature) => (
                  <div key={feature.label} className="text-sm text-[#5E6461]">
                    {feature.label}
                    {feature.comingSoon ? " (coming soon)" : ""}
                  </div>
                ))}
              </div>
              <Link
                href="/pricing"
                className={`mt-6 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  tier.highlight
                    ? "bg-[#0F5D46] text-white hover:bg-[#0A3D2E]"
                    : "border border-[#E8E8E2] text-[#0A3D2E] hover:bg-[#F2F3EE]"
                }`}
              >
                {tier.key === "free" ? "Start free" : `View ${tier.name}`}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-18 lg:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45 }}
          className="rounded-[2rem] border border-[#E8E8E2] bg-[linear-gradient(180deg,#ffffff,#f5f6f0)] px-6 py-12 text-center shadow-[0_20px_60px_rgba(17,17,17,0.05)] sm:px-10"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#5E6461]">
            Final call
          </p>
          <h2 className="mt-4 text-4xl leading-[0.98] font-semibold tracking-[-0.07em] text-[#111111] sm:text-6xl">
            Chats help you sell. WhatsBoard helps you scale.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#5E6461]">
            Stop relying on screenshots, memory, and scattered threads. Put the business inside a
            system that feels built for growth.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <PrimaryLink href="/register">Start Free</PrimaryLink>
            <SecondaryLink href="/pricing">See Pricing</SecondaryLink>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#E8E8E2] bg-[#FAFAF7]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#111111]">
            WhatsBoard
          </p>
          <p className="mt-4 max-w-xs text-sm leading-7 text-[#5E6461]">
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

function FloatingPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`absolute rounded-[1.7rem] border border-[#E8E8E2] bg-white p-4 shadow-[0_28px_70px_rgba(17,17,17,0.08)] ${className}`}
    >
      {children}
    </motion.div>
  );
}

function OrderPreviewCard({ order }: { order: OrderRecord }) {
  return (
    <div className="space-y-4">
      <PanelHeader title="New order" badge={order.source} />
      <p className="text-2xl font-semibold tracking-[-0.05em] text-[#111111]">{order.customer}</p>
      <div className="grid gap-2 text-sm text-[#5E6461]">
        <MetaRow label="Order ID" value={order.id} />
        <MetaRow label="Total" value={order.total} />
        <MetaRow label="Created" value={order.createdAt} />
      </div>
      <StatusPill label={order.status.replaceAll("_", " ")} tone="green" />
    </div>
  );
}

function PaymentPreviewCard({ order }: { order: OrderRecord }) {
  return (
    <div className="space-y-4">
      <PanelHeader title="Payment" badge="Confirmed" />
      <p className="text-sm text-[#5E6461]">Customer payment received and matched to order.</p>
      <div className="rounded-[1rem] border border-[#E8E8E2] bg-[#F7F7F2] px-3 py-3">
        <MetaRow label="Reference" value="TX-48291" />
        <MetaRow label="Time" value="09:18 AM" />
      </div>
      <PaymentPill status={order.paymentStatus} />
    </div>
  );
}

function CustomerPreviewCard({ customer }: { customer: CustomerRecord }) {
  return (
    <div className="space-y-4">
      <PanelHeader title="Customer record" badge={customer.history} />
      <p className="text-lg font-semibold tracking-[-0.04em] text-[#111111]">{customer.name}</p>
      <div className="grid gap-2 text-sm text-[#5E6461]">
        <MetaRow label="Phone" value={customer.phone} />
        <MetaRow label="Last order" value={customer.lastOrder} />
        <MetaRow label="Next follow-up" value={customer.followUp} />
      </div>
    </div>
  );
}

function FollowUpPreviewCard({ item }: { item: FollowUpRecord }) {
  return (
    <div className="space-y-4">
      <PanelHeader title="Reminder" badge="Due" />
      <p className="text-sm font-medium text-[#111111]">{item.action}</p>
      <p className="text-sm text-[#5E6461]">{item.customer}</p>
      <StatusPill label={item.due} tone={item.status === "overdue" ? "red" : "gray"} />
    </div>
  );
}

function DispatchPreviewCard({ delivery }: { delivery: DeliveryRecord }) {
  return (
    <div className="space-y-4">
      <PanelHeader title="Dispatch" badge="Operational" />
      <p className="text-lg font-semibold tracking-[-0.04em] text-[#111111]">{delivery.orderId}</p>
      <div className="grid gap-2 text-sm text-[#5E6461]">
        <MetaRow label="Customer" value={delivery.customer} />
        <MetaRow label="Area" value={delivery.area} />
      </div>
      <StatusPill label={delivery.status.replaceAll("_", " ")} tone="green" />
    </div>
  );
}

function ShowcasePanel({
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
      className="rounded-[1.8rem] border border-[#E8E8E2] bg-white p-5 shadow-[0_20px_50px_rgba(17,17,17,0.04)]"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#5E6461]">{title}</p>
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#5E6461]">{meta}</p>
      </div>
      <div className="mt-5">{children}</div>
    </motion.div>
  );
}

function PipelinePreview() {
  const items = [
    ["New", "12"],
    ["Awaiting payment", "6"],
    ["Paid", "9"],
    ["Packing", "5"],
    ["Dispatch", "4"],
    ["Delivered", "18"],
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-[1rem] border border-[#E8E8E2] bg-[#F9F9F5] px-3 py-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#5E6461]">{label}</p>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#111111]">{value}</p>
        </div>
      ))}
    </div>
  );
}

function CustomerTablePreview() {
  return (
    <div className="space-y-3">
      {customers.map((customer) => (
        <div key={customer.id} className="rounded-[1rem] border border-[#E8E8E2] bg-[#F9F9F5] px-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-[#111111]">{customer.name}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#5E6461]">
                {customer.phone}
              </p>
            </div>
            <span className="rounded-full border border-[#E8E8E2] bg-white px-2 py-1 text-[11px] uppercase tracking-[0.16em] text-[#0F5D46]">
              {customer.history}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PaymentListPreview() {
  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div key={order.id} className="rounded-[1rem] border border-[#E8E8E2] bg-[#F9F9F5] px-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-[#111111]">{order.customer}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#5E6461]">{order.total}</p>
            </div>
            <PaymentPill status={order.paymentStatus} />
          </div>
        </div>
      ))}
    </div>
  );
}

function DispatchListPreview() {
  return (
    <div className="space-y-3">
      {deliveries.map((delivery) => (
        <div key={delivery.id} className="rounded-[1rem] border border-[#E8E8E2] bg-[#F9F9F5] px-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-[#111111]">{delivery.orderId}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#5E6461]">
                {delivery.customer} • {delivery.area}
              </p>
            </div>
            <StatusPill label={delivery.status.replaceAll("_", " ")} tone="gray" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ComparisonCard({
  label,
  title,
  items,
  tone,
}: {
  label: string;
  title: string;
  items: string[];
  tone: "muted" | "positive";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4 }}
      className={`rounded-[1.8rem] border p-6 shadow-[0_18px_40px_rgba(17,17,17,0.04)] ${
        tone === "positive"
          ? "border-[#0F5D46]/18 bg-[linear-gradient(180deg,#ffffff,#f4f7f3)]"
          : "border-[#E8E8E2] bg-white"
      }`}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#5E6461]">{label}</p>
      <h3 className="mt-4 text-3xl leading-tight font-semibold tracking-[-0.06em] text-[#111111]">
        {title}
      </h3>
      <div className="mt-6 grid gap-3">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-[1rem] border border-[#E8E8E2] bg-[#F9F9F5] px-4 py-4 text-sm text-[#111111]"
          >
            {item}
          </div>
        ))}
      </div>
    </motion.div>
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
      <p className="text-xs uppercase tracking-[0.24em] text-[#5E6461]">{title}</p>
      <div className="mt-4 grid gap-3 text-sm">
        {links.map((link) => (
          <Link key={link.label} href={link.href} className="text-[#111111] transition hover:text-[#0A3D2E]">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function PanelHeader({ title, badge }: { title: string; badge: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-[11px] uppercase tracking-[0.2em] text-[#5E6461]">{title}</p>
      <span className="rounded-full border border-[#E8E8E2] bg-[#F7F7F2] px-2 py-1 text-[11px] uppercase tracking-[0.16em] text-[#0F5D46]">
        {badge}
      </span>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="font-medium text-[#111111]">{value}</span>
    </div>
  );
}

function StatusPill({ label, tone }: { label: string; tone: "green" | "red" | "gray" }) {
  const styles =
    tone === "green"
      ? "border-[#0F5D46]/18 bg-[#F2FBF6] text-[#0F5D46]"
      : tone === "red"
        ? "border-[#C7675D]/18 bg-[#FFF5F3] text-[#A94B40]"
        : "border-[#E8E8E2] bg-[#F7F7F2] text-[#5E6461]";

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] ${styles}`}>
      {label}
    </span>
  );
}

function PaymentPill({ status }: { status: PaymentStatus }) {
  if (status === "unpaid") return <StatusPill label="unpaid" tone="red" />;
  if (status === "partial") return <StatusPill label="partial" tone="gray" />;
  if (status === "paid") return <StatusPill label="paid" tone="green" />;
  return <StatusPill label="confirmed" tone="green" />;
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
      className="rounded-full border border-[#E8E8E2] bg-white px-5 py-3 text-center text-sm font-medium text-[#0A3D2E] transition hover:bg-[#F2F3EE]"
    >
      {children}
    </Link>
  );
}

function ChaosTile({
  title,
  detail,
  tone = "neutral",
}: {
  title: string;
  detail: string;
  tone?: "neutral" | "red";
}) {
  return (
    <div
      className={`rounded-[1.6rem] border p-5 shadow-[0_18px_40px_rgba(17,17,17,0.04)] ${
        tone === "red"
          ? "border-[#C7675D]/20 bg-[#FFF6F4]"
          : "border-[#E8E8E2] bg-white"
      }`}
    >
      <p className="text-2xl font-semibold tracking-[-0.05em] text-[#111111]">{title}</p>
      <p className="mt-3 text-sm leading-7 text-[#5E6461]">{detail}</p>
    </div>
  );
}
