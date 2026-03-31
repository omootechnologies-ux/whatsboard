"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Stage =
  | "hero"
  | "chaos"
  | "orders"
  | "payments"
  | "followups"
  | "dispatch"
  | "insights"
  | "proof"
  | "pricing"
  | "cta";

const story: Array<{
  id: Stage;
  kicker: string;
  title: string;
  body: string;
  points: string[];
}> = [
  {
    id: "hero",
    kicker: "Seller operating system",
    title: "From chat chaos to sales control",
    body:
      "WhatsBoard turns WhatsApp, Instagram, TikTok, and Facebook orders into one clear operating layer for payments, follow-ups, customers, and delivery.",
    points: ["Built for modern African online sellers", "Mobile-first control", "Start free in minutes"],
  },
  {
    id: "chaos",
    kicker: "The problem",
    title: "The sale starts in chat. The confusion starts when the business stays there.",
    body:
      "Sizes, payment proof, delivery notes, and next actions get split across conversations. The seller keeps selling, but control disappears.",
    points: ["Missed orders", "Screenshot hunting", "No clear next step"],
  },
  {
    id: "orders",
    kicker: "Order management",
    title: "Every order moves into one visible pipeline instead of hiding in message threads.",
    body:
      "New orders, unpaid orders, paid orders, and packed orders all sit inside the same board so the team can act instead of search.",
    points: ["New", "Awaiting payment", "Paid", "Packing"],
  },
  {
    id: "payments",
    kicker: "Payment visibility",
    title: "Paid and unpaid should never look the same.",
    body:
      "WhatsBoard makes pending payments obvious, shows proof status, and gives the seller one clean place to see collection pressure.",
    points: ["Pending alerts", "Paid confirmation", "Collection visibility"],
  },
  {
    id: "followups",
    kicker: "Follow-up reminders",
    title: "Follow-ups become a queue, not a mental task you hope to remember later.",
    body:
      "Customers waiting for replies, payment nudges, and unresolved requests stay visible with context attached to the order.",
    points: ["Due today", "Overdue customers", "Action-first reminders"],
  },
  {
    id: "dispatch",
    kicker: "Delivery workflow",
    title: "Packing, dispatch, and delivery become operational instead of improvised.",
    body:
      "Once payment lands, the order moves through packing, dispatch, and delivery with a clear stage for everyone involved.",
    points: ["Packing queue", "Dispatch tracker", "Delivered proof"],
  },
  {
    id: "insights",
    kicker: "Sales overview",
    title: "The board shows what kind of day the business is having without becoming bloated.",
    body:
      "Order load, payment pressure, due follow-ups, and delivery movement stay visible in one calm view built for busy sellers.",
    points: ["Live order pressure", "Payment health", "Daily visibility"],
  },
  {
    id: "proof",
    kicker: "Product proof",
    title: "The value is simple: fewer missed orders, faster follow-ups, clearer payment status.",
    body:
      "WhatsBoard makes the business feel more professional because the seller stops depending on memory and scattered screenshots.",
    points: ["More organized selling", "Cleaner customer replies", "Better daily control"],
  },
  {
    id: "pricing",
    kicker: "Pricing",
    title: "Start free. Upgrade when the business needs more operational depth.",
    body:
      "Free gets the seller out of chaos. Paid plans unlock deeper workflow visibility and stronger control as order volume grows.",
    points: ["Free", "Starter", "Growth"],
  },
  {
    id: "cta",
    kicker: "Start now",
    title: "Every order still managed from chats and screenshots adds avoidable business risk.",
    body:
      "The smart next step is structure. Start free, see the board working immediately, and let WhatsBoard become the system behind every sale.",
    points: ["Start free", "See pricing", "Get control now"],
  },
];

const testimonials = [
  {
    quote:
      "Before WhatsBoard, I was checking screenshots to confirm payments. Now I see what is pending and what needs dispatch in one place.",
    name: "Amina",
    role: "Fashion seller, Dar es Salaam",
  },
  {
    quote:
      "The biggest difference is follow-up speed. Orders stopped disappearing inside chats and the business feels more serious.",
    name: "Brian",
    role: "Accessories seller, Nairobi",
  },
  {
    quote:
      "It gives me control without making the workflow heavy. I can run the day from my phone and still know what is paid.",
    name: "Neema",
    role: "Beauty seller, Arusha",
  },
];

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
      {
        rootMargin: "-18% 0px -48% 0px",
        threshold: [0.2, 0.45, 0.7],
      }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-white text-[#173728]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(23,55,40,0.08),transparent_30%),linear-gradient(180deg,rgba(23,55,40,0.02),transparent_28%),linear-gradient(135deg,rgba(23,55,40,0.03)_0,rgba(23,55,40,0.03)_1px,transparent_1px,transparent_34px)] [background-size:100%_100%,100%_100%,34px_34px]" />

      <header className="sticky top-0 z-50 border-b border-[#173728]/10 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.28em] text-black">
            WhatsBoard
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-[#173728]/72 md:flex">
            <a href="#features" className="transition hover:text-black">
              Features
            </a>
            <a href="#how-it-works" className="transition hover:text-black">
              How It Works
            </a>
            <a href="#pricing" className="transition hover:text-black">
              Pricing
            </a>
            <a href="#testimonials" className="transition hover:text-black">
              Testimonials
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full border border-[#173728]/12 px-4 py-2 text-sm text-[#173728] transition hover:bg-[#173728]/4"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-[#173728] px-4 py-2 text-sm text-white transition hover:bg-[#102a1e]"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
            <div className="space-y-24 lg:space-y-32">
              {story.map((section, index) => (
                <article
                  key={section.id}
                  data-stage={section.id}
                  id={
                    section.id === "orders"
                      ? "features"
                      : section.id === "dispatch"
                        ? "how-it-works"
                        : section.id === "pricing"
                          ? "pricing"
                          : section.id === "proof"
                            ? "testimonials"
                            : undefined
                  }
                  className={`scroll-mt-28 ${index === 0 ? "min-h-[88svh] lg:py-14" : "min-h-[72svh]"}`}
                >
                  <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#173728]/48">
                    {section.kicker}
                  </p>
                  <h1
                    className={`mt-4 max-w-3xl font-semibold tracking-[-0.08em] text-black ${
                      index === 0 ? "text-5xl leading-[0.95] sm:text-7xl" : "text-4xl leading-[0.98] sm:text-6xl"
                    }`}
                  >
                    {section.title}
                  </h1>
                  <p className="mt-5 max-w-2xl text-sm leading-7 text-[#173728]/72 sm:text-base">
                    {section.body}
                  </p>

                  {index === 0 ? (
                    <>
                      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <PrimaryLink href="/register">Start Free</PrimaryLink>
                        <SecondaryLink href="#features">See Demo</SecondaryLink>
                      </div>
                      <div className="mt-6 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.22em] text-[#173728]/52">
                        <span className="rounded-full border border-[#173728]/10 bg-[#173728]/[0.03] px-3 py-2">
                          Built for modern African online sellers
                        </span>
                      </div>
                    </>
                  ) : null}

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    {section.points.map((point) => (
                      <div
                        key={point}
                        className="rounded-[1.4rem] border border-[#173728]/10 bg-white px-4 py-4 text-sm text-[#173728] shadow-[0_10px_30px_rgba(23,55,40,0.05)]"
                      >
                        {point}
                      </div>
                    ))}
                  </div>

                  {section.id === "proof" ? (
                    <div className="mt-8 grid gap-4">
                      {testimonials.map((item) => (
                        <Surface key={item.name} className="p-5">
                          <p className="text-sm leading-7 text-[#173728]/78">&ldquo;{item.quote}&rdquo;</p>
                          <div className="mt-5 flex items-center justify-between gap-4 border-t border-[#173728]/8 pt-4">
                            <div>
                              <p className="text-sm font-semibold text-black">{item.name}</p>
                              <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-[#173728]/48">
                                {item.role}
                              </p>
                            </div>
                            <span className="rounded-full border border-[#173728]/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[#173728]/54">
                              Verified seller
                            </span>
                          </div>
                        </Surface>
                      ))}
                    </div>
                  ) : null}

                  {section.id === "pricing" ? (
                    <div className="mt-8 grid gap-4">
                      <PricingCard
                        title="Free"
                        price="TZS 0"
                        note="30 orders every month for sellers getting out of chat chaos."
                      />
                      <PricingCard
                        title="Starter"
                        price="TZS 15K / mo"
                        note="Payment tracking, follow-ups, customer visibility, and the best day-to-day control."
                        highlight
                      />
                      <PricingCard
                        title="Growth"
                        price="TZS 35K / mo"
                        note="Built for bigger order volume, dispatch visibility, and broader operational oversight."
                      />
                    </div>
                  ) : null}

                  {section.id === "cta" ? (
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <PrimaryLink href="/register">Start Free</PrimaryLink>
                      <SecondaryLink href="/pricing">See Pricing</SecondaryLink>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>

            <div className="space-y-4">
              <div className="sticky top-20 z-20 lg:hidden">
                <Board active={active} mobile />
              </div>
              <div className="hidden lg:sticky lg:top-24 lg:block lg:h-[calc(100svh-7rem)]">
                <div className="flex h-full items-start">
                  <Board active={active} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#173728]/10 bg-white/92 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <PrimaryLink href="/register">
            <span className="block w-full">Start Free</span>
          </PrimaryLink>
          <SecondaryLink href="/pricing">
            <span className="block w-full">Pricing</span>
          </SecondaryLink>
        </div>
      </div>
    </main>
  );
}

function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full bg-[#173728] px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-[#102a1e]"
    >
      {children}
    </Link>
  );
}

function SecondaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-[#173728]/14 bg-white px-5 py-3 text-center text-sm font-medium text-[#173728] transition hover:bg-[#173728]/4"
    >
      {children}
    </Link>
  );
}

function Surface({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[2rem] border border-[#173728]/10 bg-white shadow-[0_30px_90px_rgba(10,35,24,0.08)] ${className}`}
    >
      {children}
    </div>
  );
}

function Board({ active, mobile = false }: { active: Stage; mobile?: boolean }) {
  const highlighted = {
    hero: ["summary", "pipeline"],
    chaos: ["alerts", "table"],
    orders: ["pipeline", "table"],
    payments: ["payments"],
    followups: ["followups", "customers"],
    dispatch: ["dispatch"],
    insights: ["summary", "insights"],
    proof: ["summary", "customers", "payments"],
    pricing: ["summary"],
    cta: ["summary", "pipeline", "dispatch"],
  } as const;

  const isOn = (name: string) => highlighted[active].includes(name as never);

  return (
    <Surface className={`w-full overflow-hidden ${mobile ? "rounded-[1.6rem]" : ""}`}>
      <div className="border-b border-[#173728]/8 px-4 py-4 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#173728]/46">WhatsBoard</p>
            <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-black sm:text-2xl">
              Sales control after chat
            </h3>
          </div>
          <span className="rounded-full border border-[#173728]/10 bg-[#173728]/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[#173728]/55">
            {active}
          </span>
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <BoardMetric label="Total orders" value="124" sub="This month" active={isOn("summary")} />
          <BoardMetric label="Pending payment" value="6" sub="Need action" active={isOn("payments")} />
          <BoardMetric label="Due follow-ups" value="8" sub="Today" active={isOn("followups")} />
        </div>

        <div className={`grid gap-4 ${mobile ? "" : "xl:grid-cols-[1.08fr_0.92fr]"}`}>
          <div className={boardBlock(isOn("pipeline"))}>
            <BlockHeader title="Order pipeline" meta="New → Delivered" />
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
              <MiniCard title="New" value="12" />
              <MiniCard title="Awaiting payment" value="6" />
              <MiniCard title="Paid" value="9" />
              <MiniCard title="Packing" value="5" />
              <MiniCard title="Dispatch" value="4" />
              <MiniCard title="Delivered" value="18" />
            </div>
          </div>

          <div className="space-y-4">
            <div className={boardBlock(isOn("payments"))}>
              <BlockHeader title="Payment status" />
              <div className="mt-4 space-y-3">
                <StatusRow label="Asha • 2 handbags" value="Awaiting proof" tone="alert" />
                <StatusRow label="Kelvin • 4 pcs" value="Paid" tone="ok" />
                <StatusRow label="Neema • Size 41" value="Pending payment" tone="alert" />
              </div>
            </div>

            <div className={boardBlock(isOn("followups"))}>
              <BlockHeader title="Follow-up reminders" />
              <div className="mt-4 space-y-3">
                <StatusRow label="Grace has not replied in 2 days" value="Nudge now" tone="neutral" />
                <StatusRow label="Confirm payment before dispatch" value="Due today" tone="alert" />
                <StatusRow label="Customer requested size change" value="Open task" tone="neutral" />
              </div>
            </div>
          </div>
        </div>

        <div className={`grid gap-4 ${mobile ? "" : "xl:grid-cols-[1fr_1fr_0.9fr]"}`}>
          <div className={boardBlock(isOn("table"))}>
            <BlockHeader title="Recent orders" />
            <div className="mt-4 space-y-3">
              <SimpleRow label="#1092 • 3 sneakers • Kinondoni" value="Awaiting payment" />
              <SimpleRow label="#1091 • 2 dresses • Mikocheni" value="Packing" />
              <SimpleRow label="#1089 • 1 bag • Mwanza" value="Dispatch" />
            </div>
          </div>

          <div className={boardBlock(isOn("customers"))}>
            <BlockHeader title="Customer activity" />
            <div className="mt-4 space-y-3">
              <CustomerRow name="Asha" meta="3 orders • Repeat buyer • Mikocheni" />
              <CustomerRow name="Grace" meta="Dormant 31 days • Reminder due" />
              <CustomerRow name="Kevin" meta="Paid today • Awaiting dispatch" />
            </div>
          </div>

          <div className="space-y-4">
            <div className={boardBlock(isOn("dispatch"))}>
              <BlockHeader title="Dispatch tracker" />
              <div className="mt-4 space-y-3">
                <SimpleRow label="Packed" value="5" />
                <SimpleRow label="Out for delivery" value="2" />
                <SimpleRow label="Delivered today" value="4" />
              </div>
            </div>

            <div className={boardBlock(isOn("insights"))}>
              <BlockHeader title="Overview" />
              <div className="mt-4 space-y-3">
                <InsightCard label="Revenue today" value="TZS 480K" />
                <InsightCard label="Unpaid risk" value="6 orders" />
                <InsightCard label="Fastest stage" value="Paid → Packing" />
              </div>
            </div>
          </div>
        </div>

        <div
          className={[
            "rounded-[1.4rem] border px-4 py-4 text-sm transition-all duration-300",
            isOn("alerts")
              ? "border-red-200 bg-red-50 text-[#7c2d2d] opacity-100"
              : "border-[#173728]/10 bg-[#173728]/[0.02] text-[#173728]/60 opacity-55",
          ].join(" ")}
        >
          <div className="flex items-start gap-3">
            <span
              className={`mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                isOn("alerts") ? "bg-red-500 text-white" : "bg-[#173728]/8 text-[#173728]"
              }`}
            >
              !
            </span>
            <div>
              <p className="font-medium">
                {isOn("alerts")
                  ? "3 orders have no confirmed payment and 2 follow-ups are overdue."
                  : "The board keeps risk visible before it becomes a missed sale."}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.22em] opacity-75">
                Real-time seller pressure
              </p>
            </div>
          </div>
        </div>
      </div>
    </Surface>
  );
}

function boardBlock(active: boolean) {
  return [
    "rounded-[1.5rem] border bg-[#fdfefd] p-4 transition-all duration-300",
    active
      ? "border-[#173728]/18 shadow-[0_20px_60px_rgba(10,35,24,0.08)]"
      : "border-[#173728]/8 opacity-80",
  ].join(" ");
}

function BlockHeader({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-[11px] uppercase tracking-[0.22em] text-[#173728]/46">{title}</p>
      {meta ? (
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#173728]/38">{meta}</p>
      ) : null}
    </div>
  );
}

function BoardMetric({
  label,
  value,
  sub,
  active,
}: {
  label: string;
  value: string;
  sub: string;
  active: boolean;
}) {
  return (
    <div
      className={[
        "rounded-[1.4rem] border bg-[#fdfefd] px-4 py-4 transition-all duration-300",
        active
          ? "border-[#173728]/18 shadow-[0_18px_50px_rgba(10,35,24,0.08)]"
          : "border-[#173728]/8 opacity-80",
      ].join(" ")}
    >
      <p className="text-[11px] uppercase tracking-[0.2em] text-[#173728]/44">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-black">{value}</p>
      <p className="mt-2 text-xs text-[#173728]/58">{sub}</p>
    </div>
  );
}

function MiniCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[1.2rem] border border-[#173728]/10 bg-white px-3 py-4 shadow-[0_10px_24px_rgba(23,55,40,0.04)]">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[#173728]/42">{title}</p>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-black">{value}</p>
    </div>
  );
}

function StatusRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "alert" | "ok" | "neutral";
}) {
  const toneStyles =
    tone === "alert"
      ? "border-red-200 bg-red-50 text-[#7c2d2d]"
      : tone === "ok"
        ? "border-[#173728]/10 bg-[#173728]/[0.04] text-[#173728]"
        : "border-[#173728]/10 bg-white text-[#173728]";

  return (
    <div className={`flex items-center justify-between gap-4 rounded-[1rem] border px-3 py-3 text-sm ${toneStyles}`}>
      <span className="max-w-[14rem]">{label}</span>
      <span className="rounded-full border border-current/10 px-2 py-1 text-[11px] uppercase tracking-[0.16em]">
        {value}
      </span>
    </div>
  );
}

function CustomerRow({ name, meta }: { name: string; meta: string }) {
  return (
    <div className="rounded-[1rem] border border-[#173728]/10 bg-white px-3 py-3 shadow-[0_10px_24px_rgba(23,55,40,0.04)]">
      <p className="text-sm font-medium text-black">{name}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#173728]/48">{meta}</p>
    </div>
  );
}

function SimpleRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1rem] border border-[#173728]/10 bg-white px-3 py-3 text-sm shadow-[0_10px_24px_rgba(23,55,40,0.04)]">
      <span className="text-[#173728]/72">{label}</span>
      <span className="font-medium text-black">{value}</span>
    </div>
  );
}

function InsightCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] border border-[#173728]/10 bg-white px-3 py-3 shadow-[0_10px_24px_rgba(23,55,40,0.04)]">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[#173728]/42">{label}</p>
      <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-black">{value}</p>
    </div>
  );
}

function PricingCard({
  title,
  price,
  note,
  highlight = false,
}: {
  title: string;
  price: string;
  note: string;
  highlight?: boolean;
}) {
  return (
    <Surface
      className={`p-5 ${highlight ? "border-[#173728] shadow-[0_24px_80px_rgba(23,55,40,0.1)]" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#173728]/50">{title}</p>
          <h3 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-black">{price}</h3>
        </div>
        {highlight ? (
          <span className="rounded-full bg-[#173728] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white">
            Best plan
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-sm leading-7 text-[#173728]/70">{note}</p>
      <Link
        href="/pricing"
        className={`mt-6 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-medium transition ${
          highlight
            ? "bg-[#173728] text-white hover:bg-[#102a1e]"
            : "border border-[#173728]/14 text-[#173728] hover:bg-[#173728]/4"
        }`}
      >
        See pricing
      </Link>
    </Surface>
  );
}
