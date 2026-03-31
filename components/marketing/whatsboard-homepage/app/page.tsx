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
  | "pricing"
  | "cta";

const story: Array<{
  id: Stage;
  label: string;
  title: string;
  body: string;
  bullets: string[];
}> = [
  {
    id: "hero",
    label: "WhatsBoard",
    title: "From chat chaos to sales control",
    body:
      "One serious board for orders, payments, follow-ups, customers, and dispatch after the message lands.",
    bullets: ["Built for East African sellers", "WhatsApp to workflow", "Start free now"],
  },
  {
    id: "chaos",
    label: "Pain",
    title: "Right now the business is scattered across chats, screenshots, and memory.",
    body:
      "Orders are real, but the workflow around them is messy. That is where delays, missed follow-ups, and payment confusion start.",
    bullets: ["Order details split across chats", "Payment proof buried in screenshots", "Next action depends on memory"],
  },
  {
    id: "orders",
    label: "Orders",
    title: "The first job is simple: get every order into one visible system.",
    body:
      "Instead of scrolling to remember who asked for what, the board turns incoming sales into a structured order pipeline.",
    bullets: ["New Order", "Awaiting Payment", "Paid", "Packing"],
  },
  {
    id: "payments",
    label: "Payments",
    title: "A paid order and an unpaid order should never look the same.",
    body:
      "WhatsBoard makes payment status visible immediately, so collection work stops living inside guesswork.",
    bullets: ["Pending payment markers", "Paid confirmation", "Collection risk is visible"],
  },
  {
    id: "followups",
    label: "Follow-ups",
    title: "Follow-ups become a queue, not a promise you hope to remember later.",
    body:
      "The board keeps overdue customers and pending replies in front of the seller before the opportunity goes cold.",
    bullets: ["Overdue reminders", "Next action cards", "Customer context stays attached"],
  },
  {
    id: "dispatch",
    label: "Dispatch",
    title: "Packing and delivery move faster when each order has a stage.",
    body:
      "After payment, the workflow becomes operational: pack, dispatch, deliver, and close the loop cleanly.",
    bullets: ["Packing queue", "Dispatch tracker", "Delivered status"],
  },
  {
    id: "insights",
    label: "Visibility",
    title: "The board also tells the seller what kind of day the business is having.",
    body:
      "Revenue snapshots, active orders, payment pressure, and follow-up load become visible without turning the product into a bloated admin panel.",
    bullets: ["Live order pressure", "Payment visibility", "Daily seller insight"],
  },
  {
    id: "pricing",
    label: "Pricing",
    title: "Start free. Upgrade when the business needs deeper control.",
    body:
      "The offer should feel obvious: get out of chaos now, then unlock more operational power as the business grows.",
    bullets: ["Free", "Starter", "Growth"],
  },
  {
    id: "cta",
    label: "Start",
    title: "Every order still managed from chats and screenshots is extra business risk.",
    body:
      "The smart move is structure. Start free and let one board replace the chaos behind every sale.",
    bullets: ["Start Free", "See Pricing", "Run the day with control"],
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
        const next = (current.target as HTMLElement).dataset.stage as Stage | undefined;
        if (next) setActive(next);
      },
      {
        rootMargin: "-20% 0px -45% 0px",
        threshold: [0.2, 0.45, 0.7],
      }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-white text-[#173728]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(23,55,40,0.07),transparent_30%),linear-gradient(135deg,rgba(23,55,40,0.035)_0,rgba(23,55,40,0.035)_1px,transparent_1px,transparent_32px)] [background-size:100%_100%,32px_32px]" />

      <header className="sticky top-0 z-50 border-b border-[#173728]/10 bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="text-sm uppercase tracking-[0.32em]">
            WhatsBoard
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <a href="#problem">Problem</a>
            <a href="#product">Product</a>
            <a href="#pricing">Pricing</a>
          </nav>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Link
              href="/login"
              className="rounded-full border border-[#173728]/14 px-3 py-2 transition hover:bg-[#173728]/4"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-[#173728] px-3 py-2 text-white transition hover:bg-[#0f281d]"
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      <section className="relative">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:gap-14 lg:py-12">
          <div className="space-y-24 lg:space-y-32">
            {story.map((section, index) => (
              <article
                key={section.id}
                id={
                  section.id === "chaos"
                    ? "problem"
                    : section.id === "orders"
                      ? "product"
                      : section.id === "pricing"
                        ? "pricing"
                        : undefined
                }
                data-stage={section.id}
                className={`scroll-mt-28 ${index === 0 ? "min-h-[86svh] lg:py-12" : "min-h-[74svh]"}`}
              >
                <p className="text-xs uppercase tracking-[0.3em] text-[#173728]/52">
                  {section.label}
                </p>
                <h1
                  className={`mt-4 max-w-3xl leading-none font-semibold tracking-[-0.07em] ${
                    index === 0 ? "text-5xl sm:text-7xl" : "text-4xl sm:text-6xl"
                  }`}
                >
                  {section.title}
                </h1>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-[#173728]/72 sm:text-base">
                  {section.body}
                </p>

                {index === 0 ? (
                  <>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <PrimaryLink href="/register">Start Free</PrimaryLink>
                      <SecondaryLink href="#product">See Demo</SecondaryLink>
                    </div>
                    <div className="mt-6 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.22em] text-[#173728]/56">
                      <span className="rounded-full border border-[#173728]/10 bg-[#173728]/[0.03] px-3 py-2">
                        Built for East African sellers
                      </span>
                    </div>
                  </>
                ) : null}

                <div className="mt-8 grid gap-3">
                  {section.bullets.map((bullet) => (
                    <div
                      key={bullet}
                      className="rounded-[1.35rem] border border-[#173728]/10 bg-white px-4 py-4 text-sm shadow-[0_10px_30px_rgba(23,55,40,0.04)]"
                    >
                      {bullet}
                    </div>
                  ))}
                </div>

                {section.id === "pricing" ? (
                  <div className="mt-8 grid gap-4">
                    <PricingCard
                      title="Free"
                      price="TZS 0"
                      note="30 orders/month to feel the product properly."
                    />
                    <PricingCard
                      title="Starter"
                      price="TZS 15K"
                      note="Best for active sellers who need payment and follow-up control."
                      highlight
                    />
                    <PricingCard
                      title="Growth"
                      price="TZS 35K"
                      note="For higher volume sellers who need stronger workflow visibility."
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

          <div className="lg:sticky lg:top-24 lg:h-[calc(100svh-7rem)]">
            <div className="flex h-full items-start">
              <Board active={active} />
            </div>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#173728]/10 bg-white/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <PrimaryLink href="/register">
            <span className="block w-full">Start Free</span>
          </PrimaryLink>
          <SecondaryLink href="/pricing">
            <span className="block w-full">See Pricing</span>
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
      className="rounded-full bg-[#173728] px-5 py-3 text-center text-sm text-white transition hover:bg-[#0f281d]"
    >
      {children}
    </Link>
  );
}

function SecondaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-[#173728]/14 px-5 py-3 text-center text-sm transition hover:bg-[#173728]/4"
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
      className={`rounded-[2rem] border border-[#173728]/10 bg-white shadow-[0_24px_80px_rgba(23,55,40,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}

function Board({ active }: { active: Stage }) {
  const highlighted = {
    hero: ["summary", "pipeline"],
    chaos: ["alerts"],
    orders: ["pipeline"],
    payments: ["payments"],
    followups: ["followups", "customers"],
    dispatch: ["dispatch"],
    insights: ["insights", "summary"],
    trust: ["summary", "pipeline", "customers"],
    pricing: ["summary"],
    cta: ["summary", "pipeline", "dispatch"],
  } as const;

  const isOn = (name: string) => highlighted[active].includes(name as never);

  return (
    <Surface className="w-full overflow-hidden">
      <div className="border-b border-[#173728]/8 px-4 py-3 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#173728]/44">
              WhatsBoard board
            </p>
            <h3 className="mt-2 text-xl leading-tight font-semibold sm:text-2xl">
              One view for everything after the sale starts in chat
            </h3>
          </div>
          <span className="rounded-full bg-[#173728]/6 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[#173728]/60">
            {active}
          </span>
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <BoardMetric label="Active orders" value="24" active={isOn("summary")} />
          <BoardMetric label="Pending payment" value="6" active={isOn("payments")} />
          <BoardMetric label="Dispatch today" value="4" active={isOn("dispatch")} />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className={boardBlock(isOn("pipeline"))}>
            <BlockHeader title="Order pipeline" meta="New → Delivered" />
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
              <MiniCard title="New" value="5" />
              <MiniCard title="Awaiting payment" value="6" />
              <MiniCard title="Paid" value="4" />
              <MiniCard title="Packing" value="3" />
              <MiniCard title="Dispatch" value="4" />
              <MiniCard title="Delivered" value="2" />
            </div>
          </div>

          <div className="space-y-4">
            <div className={boardBlock(isOn("payments"))}>
              <BlockHeader title="Payment status" />
              <div className="mt-4 space-y-3">
                <StatusRow label="Asha • Viatu size 40" value="Awaiting proof" tone="alert" />
                <StatusRow label="Brian • 2 bags" value="Paid" tone="ok" />
                <StatusRow label="Neema • 4 pcs" value="Awaiting payment" tone="alert" />
              </div>
            </div>

            <div className={boardBlock(isOn("followups"))}>
              <BlockHeader title="Follow-up queue" />
              <div className="mt-4 space-y-3">
                <StatusRow label="Grace has not replied in 2 days" value="Nudge now" tone="neutral" />
                <StatusRow label="Reminder: confirm payment" value="Due today" tone="alert" />
                <StatusRow label="Customer wants size change" value="Open task" tone="neutral" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className={boardBlock(isOn("customers"))}>
            <BlockHeader title="Customers" />
            <div className="mt-4 space-y-3">
              <CustomerRow name="Asha" meta="3 orders • Mikocheni" />
              <CustomerRow name="Grace" meta="Dormant 31 days • Follow-up due" />
              <CustomerRow name="Kevin" meta="Repeat buyer • Paid yesterday" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className={boardBlock(isOn("dispatch"))}>
              <BlockHeader title="Dispatch tracker" />
              <div className="mt-4 space-y-3">
                <SimpleRow label="Packed" value="3" />
                <SimpleRow label="Out for delivery" value="2" />
                <SimpleRow label="Delivered today" value="2" />
              </div>
            </div>

            <div className={boardBlock(isOn("insights"))}>
              <BlockHeader title="Insights" />
              <div className="mt-4 space-y-3">
                <InsightCard label="Revenue today" value="TZS 480K" />
                <InsightCard label="Fastest stage" value="Paid → Packing" />
                <InsightCard label="Pressure point" value="Awaiting payment" />
              </div>
            </div>
          </div>
        </div>

        <div
          className={[
            "transition-all duration-300",
            isOn("alerts") ? "opacity-100 translate-y-0" : "opacity-45 translate-y-1",
          ].join(" ")}
        >
          <div className="flex items-start gap-3 rounded-[1.35rem] border border-red-200 bg-red-50 px-4 py-4 text-sm text-[#7b2d2d]">
            <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              !
            </span>
            <div>
              <p className="font-medium">Chat chaos creates revenue risk.</p>
              <p className="mt-1 text-[#7b2d2d]/80">
                Orders without structure delay payment, follow-up, and dispatch.
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
    "rounded-[1.8rem] border p-4 transition-all duration-300",
    active
      ? "border-[#173728]/18 bg-[#173728]/[0.05] shadow-[0_18px_50px_rgba(23,55,40,0.09)]"
      : "border-[#173728]/10 bg-[#173728]/[0.025]",
  ].join(" ");
}

function BlockHeader({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-[11px] uppercase tracking-[0.22em] text-[#173728]/44">{title}</p>
      {meta ? (
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#173728]/38">{meta}</p>
      ) : null}
    </div>
  );
}

function BoardMetric({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active: boolean;
}) {
  return (
    <div
      className={[
        "rounded-[1.35rem] border px-4 py-4 transition-all duration-300",
        active
          ? "border-[#173728]/18 bg-[#173728]/[0.06] shadow-[0_18px_40px_rgba(23,55,40,0.08)]"
          : "border-[#173728]/10 bg-[#173728]/[0.03]",
      ].join(" ")}
    >
      <p className="text-[11px] uppercase tracking-[0.22em] text-[#173728]/44">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.05em]">{value}</p>
    </div>
  );
}

function MiniCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[1.2rem] border border-[#173728]/10 bg-white px-3 py-4 shadow-[0_10px_24px_rgba(23,55,40,0.04)]">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[#173728]/42">{title}</p>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{value}</p>
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
  tone: "ok" | "alert" | "neutral";
}) {
  const toneClass =
    tone === "ok"
      ? "bg-[#173728]/6 text-[#173728]"
      : tone === "alert"
        ? "bg-red-50 text-[#7b2d2d]"
        : "bg-white text-[#173728]";

  return (
    <div className="flex items-center justify-between gap-4 rounded-[1rem] border border-[#173728]/10 bg-white px-3 py-3 text-sm shadow-[0_10px_24px_rgba(23,55,40,0.04)]">
      <span className="text-[#173728]/72">{label}</span>
      <span className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${toneClass}`}>
        {value}
      </span>
    </div>
  );
}

function CustomerRow({ name, meta }: { name: string; meta: string }) {
  return (
    <div className="rounded-[1rem] border border-[#173728]/10 bg-white px-3 py-3 shadow-[0_10px_24px_rgba(23,55,40,0.04)]">
      <p className="text-sm font-medium">{name}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#173728]/50">{meta}</p>
    </div>
  );
}

function SimpleRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1rem] border border-[#173728]/10 bg-white px-3 py-3 text-sm shadow-[0_10px_24px_rgba(23,55,40,0.04)]">
      <span className="text-[#173728]/72">{label}</span>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  );
}

function InsightCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] border border-[#173728]/10 bg-white px-3 py-3 shadow-[0_10px_24px_rgba(23,55,40,0.04)]">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[#173728]/44">{label}</p>
      <p className="mt-2 text-sm">{value}</p>
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
          <h3 className="mt-3 text-4xl leading-none font-semibold tracking-[-0.05em]">{price}</h3>
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
            ? "bg-[#173728] text-white hover:bg-[#0f281d]"
            : "border border-[#173728]/14 hover:bg-[#173728]/4"
        }`}
      >
        See pricing
      </Link>
    </Surface>
  );
}
