"use client";

import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  MessageSquare,
  Package,
  Play,
  Truck,
} from "lucide-react";
import { PLAN_CONFIG } from "@/lib/plan-access";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

type ChatBubbleProps = {
  sender: "user" | "seller";
  text: string;
  delay: number;
  color?: string;
};

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

const tiers = [PLAN_CONFIG.free, PLAN_CONFIG.starter, PLAN_CONFIG.growth];

function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 z-50 w-full border-b border-[#e8e8e2]/80 bg-[#fafaf7]/90 py-4 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0f5d46] text-white">
            <Package className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#111111]">WhatsBoard</span>
        </Link>

        <div className="hidden items-center gap-10 md:flex">
          {[
            ["Product", "#product"],
            ["Process", "#process"],
            ["Pricing", "#pricing"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-sm font-medium text-[#5e6461] transition-colors hover:text-[#0f5d46]"
            >
              {label}
            </a>
          ))}
          <Link
            href="/register"
            className="rounded-full bg-[#0f5d46] px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#111111]"
          >
            Start Free
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

function ChatBubble({ sender, text, delay, color = "bg-[#f4f5f0]" }: ChatBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: sender === "user" ? -20 : 20, scale: 0.8 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ delay, duration: 0.5 }}
      className={`mb-3 max-w-[80%] rounded-2xl border border-[#e8e8e2]/70 p-4 text-sm shadow-sm ${
        sender === "user"
          ? `${color} self-start rounded-tl-none text-[#111111]`
          : "self-end rounded-tr-none bg-[#0f5d46] text-white"
      }`}
    >
      <p className="font-medium">{text}</p>
    </motion.div>
  );
}

function FeatureScene({
  title,
  desc,
  icon: Icon,
  imageContent,
}: {
  title: string;
  desc: string;
  icon: ComponentType<{ className?: string }>;
  imageContent: ReactNode;
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center gap-12 py-16 lg:flex-row lg:gap-16 lg:py-20">
      <motion.div
        className="lg:w-1/2"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
      >
        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf6f1]">
          <Icon className="h-7 w-7 text-[#0f5d46]" />
        </div>
        <h3 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-[#111111]">
          {title}
        </h3>
        <p className="max-w-md text-xl leading-relaxed text-[#5e6461]">{desc}</p>
      </motion.div>

      <motion.div
        className="w-full lg:w-1/2"
        initial={{ opacity: 0, scale: 0.95, x: 40 }}
        whileInView={{ opacity: 1, scale: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="min-h-[360px] overflow-hidden rounded-3xl border border-[#e8e8e2] bg-white p-6 shadow-[0_24px_80px_rgba(17,17,17,0.06)] lg:min-h-[400px]">
          {imageContent}
        </div>
      </motion.div>
    </div>
  );
}

export default function WhatsBoardHomepage() {
  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.1], [1, 0.94]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.08]);

  return (
    <div className="overflow-x-hidden bg-[#fafaf7] text-[#111111] selection:bg-[#dff2e9] selection:text-[#0f5d46]">
      <Navbar />

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-24 sm:px-8">
        <motion.div style={{ scale: heroScale, opacity: heroOpacity }} className="z-10 max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-10 inline-flex items-center gap-2 rounded-full border border-[#e8e8e2] bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#5e6461]"
          >
            <span className="h-2 w-2 rounded-full bg-[#0f5d46]" />
            The future of social selling
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="mb-10 text-5xl font-black leading-[0.95] tracking-tighter text-[#111111] sm:text-7xl md:text-8xl"
          >
            Stop chatting. <br />
            <span className="text-[#0f5d46]">Start selling.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mx-auto mb-12 max-w-2xl text-xl font-medium text-[#5e6461] md:text-2xl"
          >
            WhatsBoard turns messy chat threads into a high-performance sales machine for African online sellers.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col items-center justify-center gap-6 sm:flex-row"
          >
            <Link
              href="/register"
              className="group flex h-16 items-center gap-3 rounded-full bg-[#0f5d46] px-10 text-xl font-bold text-white transition-transform hover:scale-105"
            >
              Get Started Free <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/pricing"
              className="flex h-16 items-center gap-3 text-lg font-bold text-[#111111] transition-colors hover:text-[#0f5d46] sm:text-xl"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#e8e8e2]">
                <Play size={16} fill="currentColor" />
              </div>
              See Pricing
            </Link>
          </motion.div>
        </motion.div>

        <div className="pointer-events-none absolute inset-0">
          <motion.div
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute left-10 top-1/4 h-64 w-64 rounded-full bg-[#dff2e9] blur-[100px]"
          />
          <motion.div
            animate={{ y: [0, 30, 0], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 7, repeat: Infinity, delay: 1 }}
            className="absolute bottom-1/4 right-10 h-96 w-96 rounded-full bg-[#eef7f2] blur-[120px]"
          />
        </div>
      </section>

      <section className="relative z-20 rounded-t-[3rem] bg-[#111111] px-4 py-24 text-white sm:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInUp}
              className="space-y-8"
            >
              <h2 className="text-5xl font-bold leading-tight md:text-7xl">
                Business shouldn&apos;t <br />
                <span className="text-[#c7675d]">feel like chaos.</span>
              </h2>
              <p className="max-w-lg text-xl leading-relaxed text-white/65">
                Scrolling for screenshots, forgetting follow-ups, and losing payments in unread chats is not a strategy. It is operational risk.
              </p>
              <div className="space-y-4 pt-10">
                {[
                  "Missed follow-ups are lost money.",
                  "Payment verification takes hours.",
                  "Dispatch becomes a guessing game.",
                ].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ delay: i * 0.15 }}
                    className="flex items-center gap-4 text-lg font-medium"
                  >
                    <AlertCircle className="text-[#c7675d]" /> {item}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <div className="relative flex flex-col">
              <ChatBubble sender="user" text="Hey, is the dress still available?" delay={0.1} color="bg-[#1b1b1b] text-white border-white/10" />
              <ChatBubble sender="user" text="Sent the money. Check M-Pesa" delay={0.3} color="bg-[#1b1b1b] text-white border-white/10" />
              <ChatBubble sender="user" text="Where is my order? 3 days now..." delay={0.6} color="bg-[#4d1f1a] text-white border-white/10" />
              <ChatBubble sender="user" text="Can I get a discount?" delay={0.8} color="bg-[#1b1b1b] text-white border-white/10" />
              <ChatBubble sender="user" text="I will pay tomorrow I promise" delay={1.0} color="bg-[#1b1b1b] text-white border-white/10" />
              <motion.div
                animate={{ rotate: [0, 2, -2, 0], scale: [1, 1.02, 1] }}
                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
                className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 bg-[#c7675d]/20 blur-[80px]"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="process" className="relative overflow-hidden bg-white px-4 py-28 sm:px-8 lg:py-40">
        <div className="mx-auto mb-24 max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-8 inline-block rounded-full bg-[#0f5d46] px-6 py-2 text-sm font-bold text-white"
          >
            The Shift
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-5xl font-black tracking-tight text-[#111111] md:text-7xl"
          >
            Clean. Calm. <span className="text-[#0f5d46]">Controlled.</span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mx-auto max-w-4xl rounded-[3rem] border border-[#e8e8e2] bg-[#f4f5f0] p-1 shadow-inner"
          >
            <div className="flex flex-wrap justify-between gap-4 p-4 md:flex-nowrap">
              {[
                ["New Order", MessageSquare],
                ["Paid", CreditCard],
                ["Packing", Package],
                ["Dispatch", Truck],
              ].map(([label, Icon], i) => {
                const Comp = Icon as typeof MessageSquare;

                return (
                  <motion.div
                    key={label}
                    whileHover={{ scale: 1.05 }}
                    className={`flex min-w-[140px] flex-1 flex-col items-center gap-3 rounded-[2rem] p-6 transition-all ${
                      i === 0 ? "bg-[#0f5d46] text-white shadow-xl" : "bg-white text-[#5e6461]"
                    }`}
                  >
                    <Comp size={18} />
                    <span className="text-center text-xs font-bold uppercase tracking-tight">{label}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        <div className="mx-auto max-w-6xl">
          <FeatureScene
            title="Automated order pipelines"
            desc="Drag and move orders from inquiry to delivered. Never lose a customer name again."
            icon={Package}
            imageContent={
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -30, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between rounded-2xl border border-[#e8e8e2] bg-[#fafaf7] p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xs font-bold shadow-sm">JD</div>
                      <div>
                        <p className="text-sm font-bold text-[#111111]">John Doe — Order #443{i}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#5e6461]">Awaiting verification</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-[#b8bcb8]" />
                  </motion.div>
                ))}
              </div>
            }
          />

          <FeatureScene
            title="Payment visibility"
            desc="Verify M-Pesa, bank transfer, and card payments. See your cashflow in real time, not in old chat logs."
            icon={CreditCard}
            imageContent={
              <div className="p-4 text-center">
                <div className="mb-2 text-4xl font-black text-[#0f5d46]">TZS 452,000</div>
                <p className="mb-8 text-xs font-bold uppercase tracking-widest text-[#5e6461]">Total revenue this week</p>
                <div className="flex h-32 items-end justify-center gap-2">
                  {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true, amount: 0.5 }}
                      className="w-full rounded-t-lg bg-[#0f5d46]"
                    />
                  ))}
                </div>
              </div>
            }
          />
        </div>
      </section>

      <section className="border-y border-[#e8e8e2] bg-[#f7f7f3] px-4 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-3">
          {[
            ["2.5x", "Faster turnaround", "Sellers process orders faster once payments and next actions are visible."],
            ["98%", "Accuracy", "Reduce human error in payment checks, customer records, and location notes."],
            ["0", "Missed follow-ups", "A visible reminder queue keeps warm leads from going cold."],
          ].map(([stat, label, text]) => (
            <motion.div key={label} whileHover={{ y: -10 }} className="rounded-[2.4rem] border border-[#e8e8e2] bg-white p-10 shadow-sm">
              <h4 className="mb-4 text-6xl font-black text-[#0f5d46]">{stat}</h4>
              <p className="mb-2 text-lg font-bold uppercase tracking-tight text-[#111111]">{label}</p>
              <p className="leading-relaxed text-[#5e6461]">{text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="pricing" className="bg-white px-4 py-28 sm:px-8 lg:py-40">
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <h2 className="mb-6 text-5xl font-black tracking-tight text-[#111111]">The investment in growth.</h2>
          <p className="text-xl text-[#5e6461]">Premium tools for serious businesses. No hidden fees.</p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
          {tiers.map((plan) => (
            <motion.div
              key={plan.key}
              whileHover={{ scale: 1.02 }}
              className={`rounded-[3rem] border p-10 ${
                plan.highlight
                  ? "border-[#173728] bg-[#173728] text-white shadow-2xl shadow-[#173728]/20"
                  : "border-[#e8e8e2] bg-white text-[#111111] shadow-sm"
              }`}
            >
              {plan.highlight ? <div className="mb-6 text-[10px] font-black uppercase tracking-widest opacity-60">Most popular</div> : null}
              <h4 className="mb-2 text-2xl font-bold">{plan.name}</h4>
              <p className={`mb-10 text-sm ${plan.highlight ? "text-white/75" : "text-[#5e6461]"}`}>{plan.description}</p>
              <div className="mb-12 flex items-baseline gap-1">
                <span className="text-5xl font-black">{plan.priceLabel}</span>
                <span className="text-sm opacity-60">{plan.key === "free" ? "/forever" : "/month"}</span>
              </div>
              <ul className="mb-12 space-y-4">
                {plan.features.slice(0, 5).map((f) => (
                  <li key={f.label} className="flex items-center gap-3 text-sm font-medium">
                    <CheckCircle2 size={16} className={plan.highlight ? "text-green-300" : "text-green-700"} />
                    <span>
                      {f.label}
                      {f.comingSoon ? " (coming soon)" : ""}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className={`block w-full rounded-full py-5 text-center text-lg font-bold transition-all ${
                  plan.highlight ? "bg-white text-[#173728] hover:bg-slate-100" : "bg-[#0f5d46] text-white hover:bg-black"
                }`}
              >
                {plan.key === "free" ? "Start Free" : `Choose ${plan.name}`}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="testimonials" className="bg-[#111111] px-4 py-28 text-white sm:px-8 lg:py-40">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 max-w-3xl">
            <p className="text-sm font-semibold text-green-400">Seller proof</p>
            <h2 className="mt-4 text-5xl font-black tracking-tight">Sellers feel the difference fast.</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {testimonials.map((item) => (
              <div key={item.name} className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                <p className="text-sm leading-7 text-white/78">&ldquo;{item.quote}&rdquo;</p>
                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/50">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#111111] px-4 py-28 text-center text-white sm:px-8 lg:py-40">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          className="relative z-10 mx-auto max-w-4xl"
        >
          <h2 className="mb-10 text-5xl font-black leading-none tracking-tighter md:text-8xl">
            Ready to <span className="text-green-500">lead?</span>
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-xl text-white/65 md:text-2xl">
            Join sellers who have reclaimed their time and built a more professional business system.
          </p>
          <div className="flex flex-col items-center justify-center gap-8 sm:flex-row">
            <Link href="/register" className="flex h-20 items-center gap-4 rounded-full bg-white px-12 text-2xl font-black text-[#111111] transition-transform hover:scale-105">
              Start Free Trial <ArrowUpRight size={24} />
            </Link>
            <Link href="/pricing" className="text-lg font-bold transition-colors hover:text-green-400">
              See Pricing
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="border-t border-[#e8e8e2] bg-white px-4 py-16 sm:px-8 lg:py-20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-10 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0f5d46] text-white">
              <Package className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-[#111111]">WhatsBoard</span>
          </div>
          <div className="flex flex-wrap gap-8 text-sm font-bold uppercase tracking-tight text-[#5e6461]">
            <Link href="/pricing" className="transition-colors hover:text-[#0f5d46]">Pricing</Link>
            <Link href="/login" className="transition-colors hover:text-[#0f5d46]">Login</Link>
            <Link href="/register" className="transition-colors hover:text-[#0f5d46]">Start Free</Link>
            <Link href="/dashboard" className="transition-colors hover:text-[#0f5d46]">Dashboard</Link>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#b8bcb8]">© 2026 WhatsBoard</p>
        </div>
      </footer>
    </div>
  );
}
