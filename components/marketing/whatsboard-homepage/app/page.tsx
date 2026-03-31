import type { ReactNode } from 'react'
import Link from 'next/link'

const storySteps = [
  {
    step: '01',
    title: 'Receive order in chat',
    body: 'WhatsApp, Instagram, TikTok, Facebook. The order starts inside conversation noise.',
  },
  {
    step: '02',
    title: 'Capture it in WhatsBoard',
    body: 'Turn one messy message into one clean order card before it disappears.',
  },
  {
    step: '03',
    title: 'Track payment, follow-up, dispatch',
    body: 'Know who paid, who needs a reminder, and what still needs to leave the shelf.',
  },
  {
    step: '04',
    title: 'Stay in control',
    body: 'Less screenshot hunting. More calm. More trust. More repeat orders.',
  },
]

const problemPoints = [
  'Orders disappear inside chat noise',
  'Customers wait while you search screenshots',
  'Follow-ups are forgotten',
  'Payment status is never fully clear',
  'Packing and dispatch become guesswork',
]

const resultPoints = [
  'One place for active orders',
  'Clear payment and delivery stages',
  'Faster follow-ups before customers go cold',
  'Professional control without a heavy system',
]

export default function WhatsBoardHomepage() {
  return (
    <main className="font-roboto-mono min-h-screen bg-[#0b7a43] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.05)_0,rgba(255,255,255,0.05)_1px,transparent_1px,transparent_24px)] [background-size:100%_100%,100%_100%,24px_24px]" />

      <header className="sticky top-0 z-20 border-b border-white/15 bg-[#0b7a43]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="text-sm tracking-[0.28em] uppercase">
            WhatsBoard
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <a href="#story">Story</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#result">Result</a>
            <Link href="/pricing">Pricing</Link>
          </nav>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Link
              href="/login"
              className="rounded-full border border-white/20 px-3 py-2 transition hover:bg-white/10"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-white px-3 py-2 text-[#0b7a43] transition hover:bg-white/90"
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex rounded-full border border-white/20 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-white/80">
              From chat chaos to sales control
            </p>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl leading-none font-semibold tracking-[-0.05em] sm:text-6xl lg:text-7xl">
                Your orders should not live inside 1,000 unread chats.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/78 sm:text-base">
                WhatsBoard is the simple control room for sellers taking orders on WhatsApp,
                Instagram, TikTok, and Facebook. No more screenshot archaeology. No more
                guessing who paid. No more forgetting dispatch.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="rounded-full bg-white px-5 py-3 text-center text-sm text-[#0b7a43] transition hover:bg-white/90"
              >
                Start free
              </Link>
              <Link
                href="/pricing"
                className="rounded-full border border-white/25 px-5 py-3 text-center text-sm transition hover:bg-white/10"
              >
                See plans
              </Link>
            </div>
          </div>
          <ChaosHero />
        </div>
      </section>

      <section id="story" className="border-y border-white/15 bg-white/[0.04]">
        <StorySection
          eyebrow="Section 1"
          title="Chaos"
          subtitle="Orders are arriving, but the system is screenshots, memory, and panic."
          body="One message says size 42. Another says send to Mbezi. Payment proof is somewhere above. The customer is waiting. You are scrolling."
          visual={<ChaosPanel />}
        />
      </section>

      <section>
        <StorySection
          reverse
          eyebrow="Section 2"
          title="The problem"
          subtitle="When chats become your business system, small mistakes become expensive."
          body="The pain is not messaging itself. The pain is losing control after the message lands."
          visual={<ProblemPanel />}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {problemPoints.map((point) => (
              <div key={point} className="rounded-3xl border border-white/15 bg-white/[0.03] px-4 py-4 text-sm text-white/82">
                {point}
              </div>
            ))}
          </div>
        </StorySection>
      </section>

      <section className="border-y border-white/15 bg-white/[0.04]">
        <StorySection
          eyebrow="Section 3"
          title="The switch"
          subtitle="WhatsBoard is the moment chat turns into order flow."
          body="Instead of living inside message bubbles, each order gets a clean place to stand. You see the customer, the payment state, the next action, and the delivery stage."
          visual={<SwitchPanel />}
        />
      </section>

      <section id="how-it-works">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs uppercase tracking-[0.28em] text-white/70">Section 4</p>
            <h2 className="text-3xl leading-tight font-semibold tracking-[-0.04em] sm:text-5xl">
              How it works, without drama.
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-white/76 sm:text-base">
              A simple flow for serious sellers. Capture the order. Track what matters. Move it
              forward. Stay calm.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {storySteps.map((item) => (
              <div
                key={item.step}
                className="group rounded-[2rem] border border-white/15 bg-white/[0.03] p-5 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.06]"
              >
                <div className="mb-8 flex items-center justify-between text-xs uppercase tracking-[0.28em] text-white/60">
                  <span>{item.step}</span>
                  <span className="inline-block h-2 w-2 rounded-full bg-white/70" />
                </div>
                <FlowIcon />
                <h3 className="mt-6 text-xl leading-tight">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/74">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="result" className="border-y border-white/15 bg-white/[0.04]">
        <StorySection
          reverse
          eyebrow="Section 5"
          title="The result"
          subtitle="You look less like someone drowning in messages and more like a real business."
          body="Customers feel the difference. Orders move faster. Payment conversations become clear. Dispatch stops being a mental puzzle."
          visual={<ResultPanel />}
        >
          <div className="space-y-3">
            {resultPoints.map((point) => (
              <div
                key={point}
                className="rounded-full border border-white/15 px-4 py-3 text-sm text-white/82"
              >
                {point}
              </div>
            ))}
          </div>
        </StorySection>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="rounded-[2rem] border border-white/15 bg-white/[0.05] p-6 sm:p-10">
          <p className="text-xs uppercase tracking-[0.28em] text-white/68">Section 6</p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="space-y-4">
              <h2 className="text-3xl leading-tight font-semibold tracking-[-0.04em] sm:text-5xl">
                From screenshot chaos to sales control.
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-white/78 sm:text-base">
                Start free. Feel the difference in your first orders. Upgrade when the volume
                demands it.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href="/register"
                className="rounded-full bg-white px-5 py-3 text-center text-sm text-[#0b7a43] transition hover:bg-white/90"
              >
                Start free
              </Link>
              <Link
                href="/pricing"
                className="rounded-full border border-white/25 px-5 py-3 text-center text-sm transition hover:bg-white/10"
              >
                Upgrade when ready
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/15">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-white/70 sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>Built for East African sellers who sell in chat and need control after the message.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/pricing">Pricing</Link>
            <Link href="/login">Log in</Link>
            <Link href="/register">Start free</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}

function StorySection({
  eyebrow,
  title,
  subtitle,
  body,
  visual,
  reverse = false,
  children,
}: {
  eyebrow: string
  title: string
  subtitle: string
  body: string
  visual: ReactNode
  reverse?: boolean
  children?: ReactNode
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div
        className={`grid gap-10 lg:items-center ${reverse ? 'lg:grid-cols-[0.95fr_1.05fr]' : 'lg:grid-cols-[1.05fr_0.95fr]'}`}
      >
        <div className={reverse ? 'lg:order-2' : ''}>
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.28em] text-white/70">{eyebrow}</p>
            <h2 className="text-3xl leading-tight font-semibold tracking-[-0.04em] sm:text-5xl">
              {title}
            </h2>
            <p className="max-w-2xl text-lg leading-8 text-white/88 sm:text-xl">{subtitle}</p>
            <p className="max-w-2xl text-sm leading-7 text-white/76 sm:text-base">{body}</p>
          </div>
          {children ? <div className="mt-8">{children}</div> : null}
        </div>
        <div className={reverse ? 'lg:order-1' : ''}>{visual}</div>
      </div>
    </div>
  )
}

function ChaosHero() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="absolute -left-2 top-8 h-20 w-20 rounded-full border border-white/20 animate-float opacity-70" />
      <div className="absolute right-6 top-0 h-12 w-12 rounded-full border border-white/20 animate-float-delayed opacity-80" />
      <div className="rounded-[2rem] border border-white/15 bg-white/[0.05] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.18)] sm:p-6">
        <div className="grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[1.5rem] border border-white/15 p-4">
            <div className="mx-auto flex h-44 w-full max-w-[13rem] items-end justify-center">
              <div className="relative h-40 w-28 rounded-[2rem_2rem_1rem_1rem] border-2 border-white">
                <div className="absolute left-1/2 top-5 h-8 w-8 -translate-x-1/2 rounded-full border-2 border-white" />
                <div className="absolute left-5 right-5 top-16 h-10 rounded-full border-2 border-white" />
                <div className="absolute -left-5 top-20 h-12 w-10 rounded-full border-2 border-white" />
                <div className="absolute -right-5 top-20 h-12 w-10 rounded-full border-2 border-white" />
                <div className="absolute bottom-0 left-4 h-14 w-6 rounded-full border-2 border-white" />
                <div className="absolute bottom-0 right-4 h-14 w-6 rounded-full border-2 border-white" />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {[
              'Hi, size 39 bado ipo?',
              'Nitumie pair 2 kesho',
              'Paid? sent? delivered?',
              'Please reply',
            ].map((line, index) => (
              <div
                key={line}
                className={`rounded-[1.35rem] border border-white/15 px-4 py-3 text-sm ${index % 2 === 0 ? 'ml-6' : 'mr-10'} animate-float`}
                style={{ animationDelay: `${index * 0.5}s` }}
              >
                {line}
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[1.2rem] border border-dashed border-white/25 px-4 py-4 text-xs uppercase tracking-[0.2em] text-white/62">
                Screenshot
              </div>
              <div className="rounded-[1.2rem] border border-dashed border-white/25 px-4 py-4 text-xs uppercase tracking-[0.2em] text-white/62">
                Notes
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChaosPanel() {
  return (
    <div className="rounded-[2rem] border border-white/15 bg-white/[0.04] p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[1.5rem] border border-white/15 p-4">
          <div className="grid gap-3">
            {['Order?', 'Payment proof', 'Mbezi?', 'Blue or black?'].map((item) => (
              <div key={item} className="rounded-full border border-white/15 px-4 py-3 text-sm">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[1.5rem] border border-dashed border-white/25 p-4">
          <div className="grid h-full gap-3 sm:grid-cols-2">
            {['Screenshot 1', 'Screenshot 2', 'Missed call', 'Sticky note'].map((item) => (
              <div
                key={item}
                className="flex min-h-20 items-center justify-center rounded-[1.1rem] border border-white/15 text-xs uppercase tracking-[0.24em] text-white/62"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProblemPanel() {
  return (
    <div className="grid gap-4">
      <div className="rounded-[2rem] border border-white/15 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <MetricCard label="Lost orders" value="Too easy" />
          <MetricCard label="Payment clarity" value="Not clear" />
          <MetricCard label="Follow-ups" value="Forgotten" />
          <MetricCard label="Dispatch" value="Messy" />
        </div>
      </div>
      <div className="rounded-[2rem] border border-dashed border-white/25 p-5 text-sm leading-7 text-white/74">
        A customer asks, “My order is where?” You know it is somewhere between a voice note,
        one screenshot, and your memory.
      </div>
    </div>
  )
}

function SwitchPanel() {
  return (
    <div className="rounded-[2rem] border border-white/15 bg-white/[0.03] p-5 sm:p-6">
      <div className="grid gap-4 lg:grid-cols-[0.78fr_auto_1.02fr] lg:items-center">
        <div className="space-y-3">
          {['Nataka viatu size 42', 'Paid already', 'Tuma Mikocheni'].map((item) => (
            <div key={item} className="rounded-[1.2rem] border border-white/15 px-4 py-3 text-sm">
              {item}
            </div>
          ))}
        </div>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-lg">
          →
        </div>
        <div className="rounded-[1.5rem] border border-white/15 p-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <p className="text-sm">Order #WB-104</p>
            <span className="rounded-full border border-white/15 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/72">
              Paid
            </span>
          </div>
          <div className="grid gap-3 pt-4 text-sm text-white/78">
            <div className="flex items-center justify-between rounded-full border border-white/10 px-4 py-3">
              <span>Customer</span>
              <span>Asha</span>
            </div>
            <div className="flex items-center justify-between rounded-full border border-white/10 px-4 py-3">
              <span>Product</span>
              <span>Viatu 42</span>
            </div>
            <div className="flex items-center justify-between rounded-full border border-white/10 px-4 py-3">
              <span>Next step</span>
              <span>Pack</span>
            </div>
            <div className="flex items-center justify-between rounded-full border border-white/10 px-4 py-3">
              <span>Delivery</span>
              <span>Mikocheni</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ResultPanel() {
  return (
    <div className="rounded-[2rem] border border-white/15 p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-[1.5rem] border border-white/15 p-4">
          <div className="mx-auto flex h-44 w-full max-w-[12rem] items-end justify-center">
            <div className="relative h-40 w-28 rounded-[2rem_2rem_1rem_1rem] border-2 border-white">
              <div className="absolute left-1/2 top-5 h-8 w-8 -translate-x-1/2 rounded-full border-2 border-white" />
              <div className="absolute left-6 right-6 top-16 h-8 rounded-full border-2 border-white" />
              <div className="absolute left-3 top-20 h-10 w-10 rounded-full border-2 border-white" />
              <div className="absolute right-3 top-20 h-10 w-10 rounded-full border-2 border-white" />
              <div className="absolute bottom-0 left-4 h-14 w-6 rounded-full border-2 border-white" />
              <div className="absolute bottom-0 right-4 h-14 w-6 rounded-full border-2 border-white" />
              <div className="absolute -right-7 top-14 h-12 w-12 rounded-full border-2 border-white bg-[#0b7a43] text-center text-2xl leading-[44px]">
                ✓
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-3">
          {['Paid', 'Packed', 'Dispatched', 'Delivered'].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between rounded-full border border-white/15 px-4 py-3 text-sm"
            >
              <span>{item}</span>
              <span className="h-2.5 w-2.5 rounded-full bg-white" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-white/15 p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-white/60">{label}</p>
      <p className="mt-4 text-2xl tracking-[-0.04em]">{value}</p>
    </div>
  )
}

function FlowIcon() {
  return (
    <svg viewBox="0 0 80 80" className="h-16 w-16 text-white" fill="none" aria-hidden="true">
      <rect x="10" y="10" width="24" height="24" rx="8" stroke="currentColor" strokeWidth="2" />
      <rect x="46" y="46" width="24" height="24" rx="8" stroke="currentColor" strokeWidth="2" />
      <path
        d="M34 22h12a12 12 0 0 1 12 12v12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="m52 40 6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
