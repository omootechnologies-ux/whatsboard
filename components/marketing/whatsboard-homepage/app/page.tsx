import type { ReactNode } from 'react'
import Link from 'next/link'

const painScenarios = [
  {
    title: 'The order is real, but it is scattered',
    body: 'Size is in one message. Area is in another. Payment proof is somewhere above. You are still piecing the order together by memory.',
  },
  {
    title: 'Customers wait while you scroll',
    body: 'A buyer is ready. You are hunting screenshots, checking who paid, and trying to remember who needed follow-up first.',
  },
  {
    title: 'Dispatch becomes a mental spreadsheet',
    body: 'Packed? sent? delivered? When business lives in chats, delivery control turns into guesswork fast.',
  },
]

const steps = [
  {
    step: '01',
    title: 'Order comes in through chat',
    body: 'WhatsApp, Instagram, TikTok, Facebook. That is where sellers sell.',
  },
  {
    step: '02',
    title: 'Capture it in WhatsBoard',
    body: 'Move the order out of scrolling chat and into one structured workflow.',
  },
  {
    step: '03',
    title: 'Track payment and next action',
    body: 'See follow-up, packing, dispatch, and payment status clearly.',
  },
  {
    step: '04',
    title: 'Run the day with control',
    body: 'Less memory. Less screenshot hunting. More calm execution.',
  },
]

export default function WhatsBoardHomepage() {
  return (
    <main className="min-h-screen bg-white text-[#173728]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(23,55,40,0.08),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(0,0,0,0.05),transparent_22%),linear-gradient(135deg,rgba(23,55,40,0.04)_0,rgba(23,55,40,0.04)_1px,transparent_1px,transparent_28px)] [background-size:100%_100%,100%_100%,28px_28px]" />

      <header className="sticky top-0 z-30 border-b border-[#173728]/10 bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="text-sm uppercase tracking-[0.32em]">
            WhatsBoard
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <a href="#transformation">Transformation</a>
            <a href="#pain">Pain</a>
            <a href="#how">How It Works</a>
            <a href="#cta">Start</a>
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

      <section className="relative overflow-hidden border-b border-[#173728]/10">
        <div className="mx-auto grid min-h-[100svh] max-w-6xl gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex rounded-full border border-[#173728]/12 bg-[#173728]/4 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-[#173728]/68">
              From chat chaos to sales control
            </p>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl leading-none font-semibold tracking-[-0.07em] sm:text-7xl">
                Stop running biashara from chats, screenshots, and memory.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-[#173728]/72 sm:text-base">
                WhatsBoard gives online sellers one serious place to control orders, payment status,
                follow-ups, packing, and dispatch after the message lands.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <PrimaryLink href="/register">Start free</PrimaryLink>
              <SecondaryLink href="/pricing">See pricing</SecondaryLink>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatPill label="Missed orders" value="Reduced" />
              <StatPill label="Payment confusion" value="Clearer" />
              <StatPill label="Dispatch flow" value="Visible" />
            </div>
          </div>

          <HeroScene />
        </div>
      </section>

      <section id="transformation" className="relative border-b border-[#173728]/10 bg-[#173728]/[0.025]">
        <SectionShell
          eyebrow="Transformation"
          title="The product story is simple: chat stays chat, but the business moves into structure."
          body="WhatsBoard does not replace the way sellers talk to buyers. It replaces the chaos that comes after the message."
        >
          <TransformationScene />
        </SectionShell>
      </section>

      <section id="pain" className="relative border-b border-[#173728]/10">
        <SectionShell
          eyebrow="Why sellers feel stuck"
          title="The pain is not messaging. The pain is trying to manage a real business inside message scroll."
          body="This is where money slips, follow-ups disappear, and customers start to feel the delay."
        >
          <div className="grid gap-4 lg:grid-cols-3">
            {painScenarios.map((scenario) => (
              <ScenarioCard key={scenario.title} title={scenario.title} body={scenario.body} />
            ))}
          </div>
        </SectionShell>
      </section>

      <section id="how" className="relative border-b border-[#173728]/10 bg-[#173728]/[0.025]">
        <SectionShell
          eyebrow="How it works"
          title="A clean flow built for the reality of online selling."
          body="The product works in the same order your day actually happens."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((item) => (
              <StepCard key={item.step} step={item.step} title={item.title} body={item.body} />
            ))}
          </div>
        </SectionShell>
      </section>

      <section className="relative border-b border-[#173728]/10">
        <SectionShell
          eyebrow="Product preview"
          title="One board for the work that usually lives in ten scattered places."
          body="Orders, payment status, follow-ups, and dispatch should feel connected. This is the screen that makes the product obvious."
        >
          <DashboardScene />
        </SectionShell>
      </section>

      <section className="relative border-b border-[#173728]/10 bg-[#173728]/[0.025]">
        <SectionShell
          eyebrow="Before / after"
          title="Before: stress and screenshot hunting. After: calm control."
          body="The seller is the same. The operating system is different."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <BeforeCard />
            <AfterCard />
          </div>
        </SectionShell>
      </section>

      <section id="cta" className="relative">
        <div className="mx-auto max-w-6xl px-4 py-18 sm:px-6 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-end">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-[#173728]/56">Start now</p>
              <h2 className="text-4xl leading-none font-semibold tracking-[-0.06em] sm:text-6xl">
                If the business is growing, the chaos should not grow with it.
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-[#173728]/72 sm:text-base">
                Start free. Feel the difference in your first orders. Upgrade when the volume demands more control.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <PrimaryLink href="/register">Start free</PrimaryLink>
                <SecondaryLink href="/pricing">Explore pricing</SecondaryLink>
              </div>
            </div>
            <ClosingPanel />
          </div>
        </div>

        <footer className="border-t border-[#173728]/10">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-[#173728]/62 sm:px-6 md:flex-row md:items-center md:justify-between">
            <p>Built for East African online sellers who need control after the message.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/pricing">Pricing</Link>
              <Link href="/login">Log in</Link>
              <Link href="/register">Start free</Link>
            </div>
          </div>
        </footer>
      </section>
    </main>
  )
}

function SectionShell({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string
  title: string
  body: string
  children: ReactNode
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-18 sm:px-6 sm:py-24">
      <div className="max-w-3xl space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-[#173728]/56">{eyebrow}</p>
        <h2 className="text-4xl leading-none font-semibold tracking-[-0.06em] sm:text-6xl">{title}</h2>
        <p className="max-w-2xl text-sm leading-7 text-[#173728]/72 sm:text-base">{body}</p>
      </div>
      <div className="mt-10">{children}</div>
    </div>
  )
}

function PrimaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full bg-[#173728] px-5 py-3 text-center text-sm text-white transition hover:bg-[#0f281d]"
    >
      {children}
    </Link>
  )
}

function SecondaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-[#173728]/14 px-5 py-3 text-center text-sm transition hover:bg-[#173728]/4"
    >
      {children}
    </Link>
  )
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-[#173728]/10 bg-white px-4 py-4 shadow-[0_10px_30px_rgba(23,55,40,0.05)]">
      <p className="text-[11px] uppercase tracking-[0.22em] text-[#173728]/46">{label}</p>
      <p className="mt-3 text-base">{value}</p>
    </div>
  )
}

function Surface({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[2rem] border border-[#173728]/10 bg-white shadow-[0_24px_80px_rgba(23,55,40,0.06)] ${className}`}>
      {children}
    </div>
  )
}

function HeroScene() {
  return (
    <div className="relative grid gap-4 lg:grid-cols-[0.86fr_1.14fr]">
      <Surface className="overflow-hidden">
        <div className="border-b border-[#173728]/8 px-4 py-3 text-xs uppercase tracking-[0.22em] text-[#173728]/44">
          Chat chaos
        </div>
        <div className="space-y-3 p-4">
          <ChatBubble text="Nataka size 40 leo" align="left" />
          <ChatBubble text="Payment proof iko juu" align="right" />
          <ChatBubble text="Please remind me dispatch" align="left" />
          <ChatBubble text="Umeona message?" align="right" />
          <div className="grid grid-cols-2 gap-3 pt-2">
            <GhostCard label="Screenshot" />
            <GhostCard label="Missed note" />
          </div>
        </div>
      </Surface>

      <Surface className="overflow-hidden">
        <div className="border-b border-[#173728]/8 px-4 py-3 text-xs uppercase tracking-[0.22em] text-[#173728]/44">
          WhatsBoard control
        </div>
        <div className="grid gap-4 p-4 xl:grid-cols-[1fr_1fr]">
          <div className="space-y-3">
            <MetricCard label="Waiting payment" value="6 orders" />
            <MetricCard label="Need follow-up" value="3 customers" />
            <MetricCard label="Dispatch today" value="4 packages" />
          </div>
          <div className="rounded-[1.6rem] border border-[#173728]/10 bg-[#173728]/[0.03] p-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#173728]/44">Order flow</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <LaneCard title="New" />
              <LaneCard title="Paid" />
              <LaneCard title="Sent" />
            </div>
          </div>
        </div>
      </Surface>
    </div>
  )
}

function TransformationScene() {
  return (
    <div className="grid gap-4 xl:grid-cols-[0.84fr_auto_1.16fr] xl:items-center">
      <div className="space-y-3">
        <LooseMessage text="Order in DM" />
        <LooseMessage text="Payment proof above" />
        <LooseMessage text="Follow-up later?" />
      </div>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#173728]/10 bg-white text-xs uppercase tracking-[0.22em] text-[#173728]/70 shadow-[0_16px_40px_rgba(23,55,40,0.06)]">
        Shift
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StructuredColumn title="Orders" items={['New order', 'Waiting payment']} />
        <StructuredColumn title="Customers" items={['Asha', 'Grace']} />
        <StructuredColumn title="Actions" items={['Follow-up', 'Dispatch']} />
      </div>
    </div>
  )
}

function ScenarioCard({ title, body }: { title: string; body: string }) {
  return (
    <Surface className="p-5">
      <div className="rounded-[1.5rem] border border-[#173728]/10 bg-[#173728]/[0.03] p-4">
        <div className="space-y-3">
          <ChatBubble text="Customer says paid" align="left" />
          <ChatBubble text="But where is the proof?" align="right" />
        </div>
      </div>
      <h3 className="mt-5 text-xl leading-tight">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#173728]/72">{body}</p>
    </Surface>
  )
}

function StepCard({
  step,
  title,
  body,
}: {
  step: string
  title: string
  body: string
}) {
  return (
    <Surface className="p-5 transition duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-[#173728]/50">
        <span>{step}</span>
        <span className="h-2 w-2 rounded-full bg-[#173728]" />
      </div>
      <div className="mt-6 rounded-[1.5rem] border border-[#173728]/10 bg-[#173728]/[0.03] p-4">
        <div className="h-20 rounded-[1.1rem] border border-[#173728]/10" />
      </div>
      <h3 className="mt-6 text-xl leading-tight">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#173728]/72">{body}</p>
    </Surface>
  )
}

function DashboardScene() {
  return (
    <Surface className="overflow-hidden">
      <div className="grid gap-4 border-b border-[#173728]/8 p-4 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#173728]/46">Live preview</p>
          <h3 className="mt-2 text-2xl leading-tight">One practical system for everything after “nataka”.</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="Collected" value="TZS 480K" />
          <MetricCard label="To dispatch" value="5 orders" />
        </div>
      </div>
      <div className="grid gap-4 p-4 lg:grid-cols-[1.12fr_0.88fr]">
        <div className="rounded-[1.8rem] border border-[#173728]/10 bg-[#173728]/[0.03] p-4">
          <div className="grid grid-cols-4 gap-3 text-[11px] uppercase tracking-[0.22em] text-[#173728]/44">
            <span>New</span>
            <span>Payment</span>
            <span>Packing</span>
            <span>Dispatch</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <LaneCard title="3 cards" />
            <LaneCard title="2 cards" />
            <LaneCard title="4 cards" />
            <LaneCard title="1 card" />
          </div>
        </div>
        <div className="space-y-4">
          <InfoPanel
            title="Recent order"
            rows={[
              ['Customer', 'Asha'],
              ['Product', 'Viatu size 40'],
              ['Payment', 'Waiting'],
              ['Area', 'Mikocheni'],
            ]}
          />
          <InfoPanel
            title="Next action"
            rows={[
              ['Follow-up', 'Send reminder'],
              ['Packing', '2 ready'],
              ['Dispatch', '1 rider booked'],
            ]}
          />
        </div>
      </div>
    </Surface>
  )
}

function BeforeCard() {
  return (
    <Surface className="p-5">
      <p className="text-xs uppercase tracking-[0.22em] text-[#173728]/48">Before</p>
      <div className="mt-4 space-y-3">
        <ChatBubble text="Who paid?" align="left" />
        <ChatBubble text="Dispatch leo?" align="right" />
        <ChatBubble text="Screenshot missing" align="left" />
      </div>
      <div className="mt-4 rounded-[1.5rem] border border-dashed border-[#173728]/12 px-4 py-8 text-center text-sm text-[#173728]/58">
        Stress. Guesswork. Scroll.
      </div>
    </Surface>
  )
}

function AfterCard() {
  return (
    <Surface className="p-5">
      <p className="text-xs uppercase tracking-[0.22em] text-[#173728]/48">After</p>
      <div className="mt-4 space-y-3">
        <WorkflowRow label="Order" value="Captured" />
        <WorkflowRow label="Payment" value="Visible" />
        <WorkflowRow label="Dispatch" value="Tracked" />
      </div>
      <div className="mt-4 rounded-[1.5rem] border border-[#173728]/10 bg-[#173728]/[0.03] px-4 py-8 text-center text-sm text-[#173728]/76">
        Calm. Clear. Professional.
      </div>
    </Surface>
  )
}

function ClosingPanel() {
  return (
    <Surface className="p-4">
      <div className="grid gap-4 sm:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[1.6rem] border border-[#173728]/10 bg-[#173728]/[0.03] p-4">
          <div className="space-y-3">
            <WorkflowRow label="Orders" value="Not lost in chat" />
            <WorkflowRow label="Payments" value="Easy to confirm" />
            <WorkflowRow label="Follow-ups" value="Not left to memory" />
          </div>
        </div>
        <div className="rounded-[1.6rem] border border-[#173728]/10 p-4">
          <div className="space-y-3">
            <ChatBubble text="Customer says nataka..." align="left" />
            <ChatBubble text="WhatsBoard makes it structured" align="right" />
            <ChatBubble text="You run the day from one view" align="left" />
          </div>
        </div>
      </div>
    </Surface>
  )
}

function ChatBubble({ text, align }: { text: string; align: 'left' | 'right' }) {
  return (
    <div className={`flex ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[17rem] rounded-[1.35rem] border border-[#173728]/10 bg-white px-4 py-3 text-sm text-[#173728]/74 shadow-[0_10px_24px_rgba(23,55,40,0.04)]">
        {text}
      </div>
    </div>
  )
}

function GhostCard({ label }: { label: string }) {
  return (
    <div className="rounded-[1.3rem] border border-dashed border-[#173728]/12 px-4 py-6 text-center text-[11px] uppercase tracking-[0.22em] text-[#173728]/44">
      {label}
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.35rem] border border-[#173728]/10 bg-white px-4 py-4 shadow-[0_10px_24px_rgba(23,55,40,0.04)]">
      <p className="text-[11px] uppercase tracking-[0.22em] text-[#173728]/44">{label}</p>
      <p className="mt-3 text-sm">{value}</p>
    </div>
  )
}

function LaneCard({ title }: { title: string }) {
  return (
    <div className="rounded-[1.2rem] border border-[#173728]/10 bg-white px-3 py-8 text-center text-xs uppercase tracking-[0.22em] text-[#173728]/58 shadow-[0_10px_24px_rgba(23,55,40,0.04)]">
      {title}
    </div>
  )
}

function LooseMessage({ text }: { text: string }) {
  return (
    <div className="rounded-[1.5rem] border border-[#173728]/10 bg-white px-4 py-4 text-sm text-[#173728]/72 shadow-[0_10px_24px_rgba(23,55,40,0.04)]">
      {text}
    </div>
  )
}

function StructuredColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <Surface className="p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-[#173728]/44">{title}</p>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item} className="rounded-[1.1rem] border border-[#173728]/10 bg-[#173728]/[0.03] px-3 py-3 text-sm">
            {item}
          </div>
        ))}
      </div>
    </Surface>
  )
}

function InfoPanel({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <Surface className="p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-[#173728]/44">{title}</p>
      <div className="mt-4 space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 rounded-[1rem] border border-[#173728]/10 bg-[#173728]/[0.03] px-3 py-3 text-sm">
            <span className="text-[#173728]/58">{label}</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </Surface>
  )
}

function WorkflowRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1.1rem] border border-[#173728]/10 bg-white px-4 py-3 text-sm shadow-[0_10px_24px_rgba(23,55,40,0.04)]">
      <span className="text-[#173728]/58">{label}</span>
      <span>{value}</span>
    </div>
  )
}
