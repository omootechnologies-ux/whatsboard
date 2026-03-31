"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type BoardState =
  | "hero"
  | "chaos"
  | "payments"
  | "followups"
  | "dispatch"
  | "insights"
  | "trust"
  | "pricing"
  | "cta";

const sections: Array<{
  id: BoardState;
  eyebrow: string;
  title: string;
  body: string;
  points?: string[];
}> = [
  {
    id: "hero",
    eyebrow: "Seller control",
    title: "From chat chaos to sales control",
    body:
      "WhatsBoard gives African online sellers one serious place to track orders, payments, follow-ups, customers, and delivery after the message lands.",
    points: ["Built for East African sellers", "WhatsApp to workflow", "Start free"],
  },
  {
    id: "chaos",
    eyebrow: "The problem",
    title: "Chats are where the sale starts. They should not be where the business stays.",
    body:
      "Size is in one message. Payment proof is somewhere above. Delivery area is in another chat. The order is real, but the workflow is scattered.",
    points: ["Missed orders", "Screenshot hunting", "No clear next step"],
  },
  {
    id: "payments",
    eyebrow: "Payment clarity",
    title: "Unpaid and paid should never look the same.",
    body:
      "Sellers lose time when payment status lives in memory. WhatsBoard makes pending payments, confirmations, and collection risk visible immediately.",
    points: ["Awaiting payment", "Confirmed paid", "Collection risk"],
  },
  {
    id: "followups",
    eyebrow: "Follow-up system",
    title: "Important customers should not disappear because the day got busy.",
    body:
      "Follow-ups become a real queue with next actions, not something you hope to remember after lunch or dispatch.",
    points: ["Overdue reminders", "Customer context", "Action-first workflow"],
  },
  {
    id: "dispatch",
    eyebrow: "Dispatch control",
    title: "Packing and delivery move better when each order has a visible stage.",
    body:
      "From paid to packing to dispatch to delivered, the board shows what should move now and what is already complete.",
    points: ["Packing queue", "Dispatch tracker", "Delivered proof"],
  },
  {
    id: "insights",
    eyebrow: "Business visibility",
    title: "A seller becomes more confident when the business becomes measurable.",
    body:
      "The same board can surface revenue snapshots, active orders, follow-up pressure, and customer momentum without becoming a heavy admin system.",
    points: ["Order pipeline", "Payment visibility", "Daily insights"],
  },
  {
    id: "trust",
    eyebrow: "Trust",
    title: "Professional selling feels different when the system looks under control.",
    body:
      "Customers reply faster, payment conversations get cleaner, and the seller feels less reactive because the workflow is finally structured.",
    points: ["Fewer missed orders", "Faster follow-ups", "More professional selling"],
  },
  {
    id: "pricing",
    eyebrow: "Pricing",
    title: "Start free. Upgrade when your volume demands more control.",
    body:
      "The offer should feel simple: get out of chaos now, then unlock deeper operations when the business grows.",
    points: ["Free", "Starter", "Growth"],
  },
  {
    id: "cta",
    eyebrow: "Start now",
    title: "Every extra order managed from chats and memory is extra business risk.",
    body:
      "The smart move is structure. Start free, see the control immediately, and let the board become the operating system behind every order.",
    points: ["Start free", "See pricing", "Run the day with control"],
  },
];

const testimonials = [
  {
    quote:
      "Before WhatsBoard, I was checking screenshots all day. Now I know what is paid and what needs dispatch in one view.",
    name: "Amina",
    role: "Fashion seller, Dar es Salaam",
  },
  {
    quote:
      "Follow-ups used to disappear in my head. Now the team sees what needs a reply and we move faster.",
    name: "Brian",
    role: "Accessories seller, Nairobi",
  },
];

const pricingCards = [
  {
    name: "Free",
    price: "TZS 0",
    note: "30 orders/month to feel the product properly.",
  },
  {
    name: "Starter",
    price: "TZS 15K",
    note: "Best for active sellers who need real payment and follow-up control.",
  },
  {
    name: "Growth",
    price: "TZS 35K",
    note: "For sellers scaling into dispatch workflow and broader visibility.",
  },
];

export default function WhatsBoardHomepage() {
  const [activeSection, setActiveSection] = useState<BoardState>("hero");

  useEffect(() => {
    const sectionNodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-board-section]")
    );

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;
        const id = (visible.target as HTMLElement).dataset.boardSection as
          | BoardState
          | undefined;
        if (id) setActiveSection(id);
      },
      {
        rootMargin: "-22% 0px -45% 0px",
        threshold: [0.2, 0.45, 0.7],
      }
    );

    sectionNodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-white text-[#173728]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(23,55,40,0.08),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(0,0,0,0.05),transparent_22%),linear-gradient(135deg,rgba(23,55,40,0.04)_0,rgba(23,55,40,0.04)_1px,transparent_1px,transparent_28px)] [background-size:100%_100%,100%_100%,28px_28px]" />

      <header className="sticky top-0 z-40 border-b border-[#173728]/10 bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="text-sm uppercase tracking-[0.32em]">
            WhatsBoard
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <a href="#story">Story</a>
            <a href="#trust">Trust</a>
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

      <section
        className="relative border-b border-[#173728]/10"
        data-board-section="hero"
        id="story"
      >
        <div className="mx-auto grid min-h-[92svh] max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:py-14">
          <div className="space-y-6 lg:py-12">
            <p className="inline-flex rounded-full border border-[#173728]/12 bg-[#173728]/4 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-[#173728]/68">
              Seller operating system
            </p>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl leading-none font-semibold tracking-[-0.07em] sm:text-7xl">
                From chat chaos to sales control
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-[#173728]/72 sm:text-base">
                WhatsBoard turns messy orders from WhatsApp, Instagram, Facebook, and TikTok into a
                clear system for payments, follow-ups, customers, packing, and delivery.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <PrimaryLink href="/register">Start free</PrimaryLink>
              <SecondaryLink href="#board-demo">See demo</SecondaryLink>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.22em] text-[#173728]/56">
              <span className="rounded-full border border-[#173728]/10 bg-[#173728]/[0.03] px-3 py-2">
                Built for East African sellers
              </span>
              <span>WhatsApp</span>
              <span>Instagram</span>
              <span>TikTok</span>
              <span>Facebook</span>
            </div>
          </div>

          <div className="lg:py-6" id="board-demo">
            <div className="lg:sticky lg:top-28">
              <WhatsBoardBoard activeSection={activeSection} />
            </div>
          </div>
        </div>
      </section>

      <section className="relative">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14 lg:py-18">
          <div className="hidden lg:block" />

          <div className="space-y-24 lg:space-y-32">
            {sections.slice(1).map((section) => (
              <article
                key={section.id}
                data-board-section={section.id}
                id={section.id === "trust" || section.id === "pricing" ? section.id : undefined}
                className="min-h-[72svh] scroll-mt-28"
              >
                <StorySection {...section} />
                {section.id === "trust" ? (
                  <div className="mt-8 grid gap-4">
                    {testimonials.map((item) => (
                      <Surface key={item.name} className="p-5">
                        <p className="text-sm leading-7 text-[#173728]/76">&ldquo;{item.quote}&rdquo;</p>
                        <div className="mt-5 border-t border-[#173728]/8 pt-4">
                          <p className="text-sm font-semibold">{item.name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#173728]/50">
                            {item.role}
                          </p>
                        </div>
                      </Surface>
                    ))}
                  </div>
                ) : null}

                {section.id === "pricing" ? (
                  <div className="mt-8 grid gap-4">
                    {pricingCards.map((tier) => (
                      <Surface
                        key={tier.name}
                        className={`p-5 ${tier.name === "Starter" ? "border-[#173728] shadow-[0_24px_80px_rgba(23,55,40,0.1)]" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-[#173728]/50">
                              {tier.name}
                            </p>
                            <h3 className="mt-3 text-4xl leading-none font-semibold tracking-[-0.05em]">
                              {tier.price}
                            </h3>
                          </div>
                          {tier.name === "Starter" ? (
                            <span className="rounded-full bg-[#173728] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white">
                              Best plan
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-4 text-sm leading-7 text-[#173728]/70">{tier.note}</p>
                        <Link
                          href="/pricing"
                          className={`mt-6 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-medium transition ${
                            tier.name === "Starter"
                              ? "bg-[#173728] text-white hover:bg-[#0f281d]"
                              : "border border-[#173728]/14 hover:bg-[#173728]/4"
                          }`}
                        >
                          See pricing
                        </Link>
                      </Surface>
                    ))}
                  </div>
                ) : null}

                {section.id === "cta" ? (
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <PrimaryLink href="/register">Start free</PrimaryLink>
                    <SecondaryLink href="/pricing">Explore pricing</SecondaryLink>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#173728]/10 bg-white/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <PrimaryLink href="/register">
            <span className="block w-full">Start free</span>
          </PrimaryLink>
          <SecondaryLink href="/pricing">
            <span className="block w-full">See pricing</span>
          </SecondaryLink>
        </div>
      </div>
    </main>
  );
}

function StorySection({
  eyebrow,
  title,
  body,
  points,
}: {
  eyebrow: string;
  title: string;
  body: string;
  points?: string[];
}) {
  return (
    <div className="space-y-5">
      <p className="text-xs uppercase tracking-[0.3em] text-[#173728]/56">{eyebrow}</p>
      <h2 className="text-4xl leading-none font-semibold tracking-[-0.06em] sm:text-6xl">
        {title}
      </h2>
      <p className="max-w-2xl text-sm leading-7 text-[#173728]/72 sm:text-base">{body}</p>
      {points ? (
        <div className="grid gap-3">
          {points.map((point) => (
            <div
              key={point}
              className="rounded-[1.35rem] border border-[#173728]/10 bg-white px-4 py-4 text-sm shadow-[0_12px_30px_rgba(23,55,40,0.04)]"
            >
              {point}
            </div>
          ))}
        </div>
      ) : null}
    </div>
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

function WhatsBoardBoard({ activeSection }: { activeSection: BoardState }) {
  const emphasis = {
    hero: ["summary", "pipeline"],
    chaos: ["alerts", "pipeline"],
    payments: ["payments"],
    followups: ["followups", "customers"],
    dispatch: ["dispatch", "pipeline"],
    insights: ["summary", "insights"],
    trust: ["summary", "customers", "payments"],
    pricing: ["summary"],
    cta: ["summary", "pipeline", "dispatch"],
  } as const;

  const active = emphasis[activeSection];
  const isActive = (key: string) => active.includes(key as never);

  return (
    <Surface className="overflow-hidden">
      <div className="border-b border-[#173728]/8 px-4 py-3 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#173728]/44">
              WhatsBoard board
            </p>
            <h3 className="mt-2 text-xl leading-tight font-semibold sm:text-2xl">
              One view for orders after chat
            </h3>
          </div>
          <span className="rounded-full bg-[#173728]/6 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[#173728]/60">
            {activeSection}
          </span>
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <BoardMetric
            label="Active orders"
            value="24"
            detail="Across all channels"
            active={isActive("summary")}
          />
          <BoardMetric
            label="Pending payment"
            value="6"
            detail="Need confirmation"
            active={isActive("payments")}
          />
          <BoardMetric
            label="Dispatch today"
            value="4"
            detail="Ready to move"
            active={isActive("dispatch")}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
          <div className={boardBlock(isActive("pipeline"))}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#173728]/44">
                Order pipeline
              </p>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#173728]/38">
                New → Delivered
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
              {[
                ["New", "5"],
                ["Awaiting Payment", "6"],
                ["Paid", "4"],
                ["Packing", "3"],
                ["Dispatch", "4"],
                ["Delivered", "2"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[1.2rem] border border-[#173728]/10 bg-white px-3 py-4 shadow-[0_10px_24px_rgba(23,55,40,0.04)]"
                >
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#173728]/42">
                    {label}
                  </p>
                  <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className={boardBlock(isActive("payments"))}>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#173728]/44">
                Payment status
              </p>
              <div className="mt-4 space-y-3">
                <BoardRow label="Asha • Viatu size 40" value="Awaiting proof" tone="alert" />
                <BoardRow label="Brian • 2 bags" value="Paid" tone="ok" />
                <BoardRow label="Neema • 4 pcs" value="Awaiting payment" tone="alert" />
              </div>
            </div>

            <div className={boardBlock(isActive("followups"))}>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#173728]/44">
                Follow-up queue
              </p>
              <div className="mt-4 space-y-3">
                <BoardRow label="Grace has not replied in 2 days" value="Nudge now" tone="neutral" />
                <BoardRow label="Reminder: confirm payment" value="Due today" tone="alert" />
                <BoardRow label="Customer wants size change" value="Open task" tone="neutral" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className={boardBlock(isActive("customers"))}>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#173728]/44">
              Customer records
            </p>
            <div className="mt-4 space-y-3">
              <BoardCustomer name="Asha" meta="3 orders • Mikocheni" />
              <BoardCustomer name="Grace" meta="Dormant 31 days • Follow-up due" />
              <BoardCustomer name="Kevin" meta="Repeat buyer • Paid yesterday" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className={boardBlock(isActive("dispatch"))}>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#173728]/44">
                Dispatch tracker
              </p>
              <div className="mt-4 space-y-3">
                <DispatchRow label="Packed" value="3" />
                <DispatchRow label="Out for delivery" value="2" />
                <DispatchRow label="Delivered today" value="2" />
              </div>
            </div>

            <div className={boardBlock(isActive("insights"))}>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#173728]/44">
                Insights
              </p>
              <div className="mt-4 space-y-3">
                <InsightCard label="Revenue today" value="TZS 480K" />
                <InsightCard label="Fastest stage" value="Paid → Packing" />
                <InsightCard label="Pressure point" value="Awaiting payment" />
              </div>
            </div>
          </div>
        </div>

        <div className={boardBlock(isActive("alerts"))}>
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

function BoardMetric({
  label,
  value,
  detail,
  active,
}: {
  label: string;
  value: string;
  detail: string;
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
      <p className="mt-2 text-xs text-[#173728]/58">{detail}</p>
    </div>
  );
}

function BoardRow({
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

function BoardCustomer({ name, meta }: { name: string; meta: string }) {
  return (
    <div className="rounded-[1rem] border border-[#173728]/10 bg-white px-3 py-3 shadow-[0_10px_24px_rgba(23,55,40,0.04)]">
      <p className="text-sm font-medium">{name}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#173728]/50">{meta}</p>
    </div>
  );
}

function DispatchRow({ label, value }: { label: string; value: string }) {
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
