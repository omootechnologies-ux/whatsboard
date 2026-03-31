import type { CSSProperties, ReactNode } from 'react'
import Link from 'next/link'

const problemPanels = [
  { title: 'Order gets lost', line: 'One DM. One screenshot. Gone.', type: 'lost' as const },
  { title: 'Customer waits', line: 'Umeniona? Hello? Reply?', type: 'waiting' as const },
  { title: 'Who paid?', line: 'Proof iko juu somewhere.', type: 'payment' as const },
  { title: 'Follow-up missed', line: 'Reminder ilikuwa kichwani tu.', type: 'follow' as const },
  { title: 'Dispatch confusion', line: 'Packed? sent? delivered?', type: 'dispatch' as const },
]

const flowSteps = [
  {
    step: '01',
    title: 'Order lands in chat',
    body: 'Customer sends the details where they already shop: WhatsApp, Instagram, TikTok, Facebook.',
    type: 'chat' as const,
  },
  {
    step: '02',
    title: 'Capture it in WhatsBoard',
    body: 'You move the order out of the scroll and into one clear record before it disappears.',
    type: 'capture' as const,
  },
  {
    step: '03',
    title: 'Track the real work',
    body: 'Payment, follow-up, packing, dispatch. The next action is visible without guesswork.',
    type: 'track' as const,
  },
  {
    step: '04',
    title: 'Stay in control',
    body: 'Less screenshot hunting. More calm. More trust. More repeat buyers.',
    type: 'calm' as const,
  },
]

const resultBullets = [
  'One clean order flow after every chat',
  'Clear payment and dispatch control',
  'Fewer forgotten follow-ups',
  'A seller who looks serious, not overwhelmed',
]

export default function WhatsBoardHomepage() {
  return (
    <main className="font-roboto-mono min-h-screen bg-[#0a5c35] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.06),transparent_22%),linear-gradient(135deg,rgba(255,255,255,0.05)_0,rgba(255,255,255,0.05)_1px,transparent_1px,transparent_26px)] [background-size:100%_100%,100%_100%,26px_26px]" />

      <header className="sticky top-0 z-30 border-b border-white/15 bg-[#0a5c35]/88 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="text-sm uppercase tracking-[0.32em]">
            WhatsBoard
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <a href="#problem">Problem</a>
            <a href="#switch">Switch</a>
            <a href="#how">How It Works</a>
            <a href="#cta">Start</a>
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
              className="rounded-full border border-white/20 bg-white/10 px-3 py-2 transition hover:bg-white/14"
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      <section className="relative min-h-[100svh] border-b border-white/12">
        <StoryFrame
          kicker="Frame 1"
          title="Biashara yako should not live inside chat bubbles."
          body="Orders are coming in. But the system is WhatsApp, memory, screenshots, and panic. That is where the chaos starts."
          actions={
            <>
              <PrimaryLink href="/register">Start free</PrimaryLink>
              <SecondaryLink href="/pricing">See plans</SecondaryLink>
            </>
          }
          visual={<HeroChaosScene />}
        />
      </section>

      <section id="problem" className="relative min-h-[100svh] border-b border-white/12 bg-white/[0.03]">
        <StoryFrame
          reverse
          kicker="Frame 2"
          title="When business runs inside chats, small mistakes become expensive."
          body="The problem is not WhatsApp. The problem is trying to run the whole business inside message scroll."
          visual={<ProblemStackScene />}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {problemPanels.map((item) => (
              <div key={item.title} className="rounded-[1.6rem] border border-white/15 bg-white/[0.05] px-4 py-4">
                <p className="text-base">{item.title}</p>
                <p className="mt-2 text-sm leading-7 text-white/70">{item.line}</p>
              </div>
            ))}
          </div>
        </StoryFrame>
      </section>

      <section id="switch" className="relative min-h-[100svh] border-b border-white/12">
        <StoryFrame
          kicker="Frame 3"
          title="The realization hits: chat is where the order starts, not where the business should stay."
          body="One side is noise. One side is order. The turning point is simple: move the work out of the chat and into a system."
          visual={<SplitRealizationScene />}
        />
      </section>

      <section className="relative min-h-[100svh] border-b border-white/12 bg-white/[0.03]">
        <StoryFrame
          reverse
          kicker="Frame 4"
          title="WhatsBoard turns message chaos into a real workflow."
          body="Chats become order cards. Payment gets a status. Follow-up gets a place. Dispatch stops living in your head."
          visual={<TransformationScene />}
        />
      </section>

      <section id="how" className="relative min-h-[100svh] border-b border-white/12">
        <div className="mx-auto max-w-6xl px-4 py-18 sm:px-6 sm:py-24">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/62">Frame 5</p>
            <h2 className="text-4xl leading-none font-semibold tracking-[-0.05em] sm:text-6xl">
              Four beats. No drama.
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-white/74 sm:text-base">
              The flow is simple enough to understand in seconds and strong enough to run every day.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {flowSteps.map((step) => (
              <div
                key={step.step}
                className="rounded-[2rem] border border-white/15 bg-white/[0.04] p-5 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.06]"
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-white/60">
                  <span>{step.step}</span>
                  <span className="h-2 w-2 rounded-full bg-white/70" />
                </div>
                <div className="mt-8">
                  <StepMiniScene type={step.type} />
                </div>
                <h3 className="mt-6 text-xl leading-tight">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/74">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative min-h-[100svh] border-b border-white/12 bg-white/[0.03]">
        <StoryFrame
          reverse
          kicker="Frame 6"
          title="Same seller. Different energy."
          body="Before: stressed, chasing screenshots, replying late. After: calm, organized, professional, and in control."
          visual={<CalmResultScene />}
        >
          <div className="space-y-3">
            {resultBullets.map((item) => (
              <div key={item} className="rounded-full border border-white/15 px-4 py-3 text-sm text-white/78">
                {item}
              </div>
            ))}
          </div>
        </StoryFrame>
      </section>

      <section id="cta" className="relative min-h-[70svh]">
        <div className="mx-auto flex max-w-6xl flex-col justify-center px-4 py-18 sm:px-6 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/62">Frame 7</p>
              <h2 className="text-4xl leading-none font-semibold tracking-[-0.05em] sm:text-6xl">
                From chat chaos to sales control.
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-white/74 sm:text-base">
                Start on free. Feel the control in your first orders. Upgrade when the volume becomes real.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <PrimaryLink href="/register">Start free</PrimaryLink>
                <SecondaryLink href="/pricing">Upgrade when ready</SecondaryLink>
              </div>
            </div>
            <FinalPosterScene />
          </div>
        </div>

        <footer className="border-t border-white/12">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-white/64 sm:px-6 md:flex-row md:items-center md:justify-between">
            <p>Built for East African sellers who sell in chat and need control after the message.</p>
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

function StoryFrame({
  kicker,
  title,
  body,
  visual,
  reverse = false,
  actions,
  children,
}: {
  kicker: string
  title: string
  body: string
  visual: ReactNode
  reverse?: boolean
  actions?: ReactNode
  children?: ReactNode
}) {
  return (
    <div className="mx-auto grid min-h-[100svh] max-w-6xl gap-12 px-4 py-14 sm:px-6 sm:py-18 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
      <div className={reverse ? 'lg:order-2' : ''}>
        <p className="text-xs uppercase tracking-[0.3em] text-white/62">{kicker}</p>
        <h2 className="mt-4 max-w-3xl text-4xl leading-none font-semibold tracking-[-0.05em] sm:text-6xl">
          {title}
        </h2>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/74 sm:text-base">{body}</p>
        {actions ? <div className="mt-7 flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
      <div className={reverse ? 'lg:order-1' : ''}>{visual}</div>
    </div>
  )
}

function PrimaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-white/18 bg-white/10 px-5 py-3 text-center text-sm transition hover:bg-white/14"
    >
      {children}
    </Link>
  )
}

function SecondaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-white/18 px-5 py-3 text-center text-sm transition hover:bg-white/10"
    >
      {children}
    </Link>
  )
}

function HeroChaosScene() {
  return (
    <PosterFrame>
      <div className="relative min-h-[27rem]">
        <FloatingBubble label="Mteja anasubiri" style={{ top: '5%', left: '2%' }} />
        <FloatingBubble label="Paid?" style={{ top: '12%', right: '8%' }} />
        <FloatingBubble label="Screenshot" style={{ top: '42%', left: '1%' }} />
        <FloatingBubble label="Where is order?" style={{ top: '48%', right: '2%' }} />
        <FloatingBubble label="Kesho please" style={{ bottom: '10%', left: '10%' }} />
        <DoodleSymbol symbol="?" style={{ top: '28%', right: '28%' }} />
        <DoodleSymbol symbol="!" style={{ bottom: '19%', right: '18%' }} />
        <DoodleSeller mood="stressed" className="absolute bottom-0 left-1/2 w-[15rem] -translate-x-1/2" />
      </div>
    </PosterFrame>
  )
}

function ProblemStackScene() {
  return (
    <div className="space-y-3">
      {problemPanels.map((panel, index) => (
        <div
          key={panel.title}
          className="rounded-[1.8rem] border border-white/15 bg-white/[0.05] p-4"
          style={{ transform: `translateX(${index % 2 === 0 ? 0 : 18}px)` }}
        >
          <div className="grid items-center gap-4 sm:grid-cols-[5.5rem_1fr]">
            <div className="rounded-[1.4rem] border border-white/15 p-2">
              <PanelMiniScene type={panel.type} />
            </div>
            <div>
              <p className="text-lg">{panel.title}</p>
              <p className="mt-2 text-sm leading-7 text-white/72">{panel.line}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function SplitRealizationScene() {
  return (
    <PosterFrame>
      <div className="grid gap-4 lg:grid-cols-[0.9fr_auto_1.1fr] lg:items-center">
        <div className="space-y-3">
          <MessyChatCard text="size 40?" />
          <MessyChatCard text="proof ya payment iko juu" />
          <MessyChatCard text="dispatch leo ama kesho?" />
        </div>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/20 text-2xl">
          →
        </div>
        <div className="rounded-[1.8rem] border border-white/15 bg-white/[0.04] p-4">
          <div className="grid gap-3">
            <WorkflowCard title="Order" value="Viatu size 40" />
            <WorkflowCard title="Payment" value="Waiting" />
            <WorkflowCard title="Next step" value="Follow-up" />
          </div>
        </div>
      </div>
    </PosterFrame>
  )
}

function TransformationScene() {
  return (
    <PosterFrame>
      <div className="grid gap-4 lg:grid-cols-[0.78fr_auto_1.02fr] lg:items-center">
        <div className="space-y-3">
          <MessyChatCard text="Nataka pair 2" />
          <MessyChatCard text="Mikocheni" />
          <MessyChatCard text="Nitakutumia payment" />
        </div>
        <div className="mx-auto flex flex-col items-center gap-3 text-white/80">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 text-2xl">
            →
          </div>
          <span className="text-xs uppercase tracking-[0.28em]">Turn</span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <PipelineColumn title="Orders" labels={['New', 'Paid']} />
          <PipelineColumn title="Customers" labels={['Asha', 'Grace']} />
          <PipelineColumn title="Dispatch" labels={['Pack', 'Send']} />
        </div>
      </div>
    </PosterFrame>
  )
}

function CalmResultScene() {
  return (
    <PosterFrame>
      <div className="relative min-h-[26rem]">
        <div className="absolute left-4 top-5 space-y-3">
          <QuietBadge label="Paid" />
          <QuietBadge label="Packed" />
        </div>
        <div className="absolute right-4 top-10 space-y-3">
          <QuietBadge label="Follow-up sent" />
          <QuietBadge label="Delivered" />
        </div>
        <DoodleSeller mood="calm" className="absolute bottom-0 left-1/2 w-[15rem] -translate-x-1/2" />
      </div>
    </PosterFrame>
  )
}

function FinalPosterScene() {
  return (
    <PosterFrame>
      <div className="relative min-h-[21rem]">
        <div className="absolute left-4 top-4 rounded-[1.4rem] border border-white/15 px-4 py-3 text-xs uppercase tracking-[0.24em] text-white/72">
          Order control
        </div>
        <div className="absolute right-4 top-10 rounded-[1.4rem] border border-white/15 px-4 py-3 text-xs uppercase tracking-[0.24em] text-white/72">
          Payment clarity
        </div>
        <div className="absolute bottom-7 left-6 rounded-[1.4rem] border border-white/15 px-4 py-3 text-xs uppercase tracking-[0.24em] text-white/72">
          Dispatch flow
        </div>
        <DoodleSeller mood="calm" className="absolute bottom-0 left-1/2 w-[13rem] -translate-x-1/2" />
      </div>
    </PosterFrame>
  )
}

function StepMiniScene({
  type,
}: {
  type: 'chat' | 'capture' | 'track' | 'calm'
}) {
  if (type === 'chat') {
    return (
      <svg viewBox="0 0 160 120" className="h-28 w-full" fill="none" aria-hidden="true">
        <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <rect x="14" y="20" width="60" height="36" rx="16" />
          <path d="m38 56-7 12 15-9" />
          <rect x="86" y="54" width="60" height="36" rx="16" />
          <path d="m120 90 14 9-6-12" />
          <path d="M30 38h28" />
          <path d="M98 72h28" />
        </g>
      </svg>
    )
  }

  if (type === 'capture') {
    return (
      <svg viewBox="0 0 160 120" className="h-28 w-full" fill="none" aria-hidden="true">
        <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <rect x="16" y="24" width="48" height="34" rx="15" />
          <path d="m34 58-7 11 13-7" />
          <path d="M72 42h18" />
          <path d="m80 34 12 8-12 8" />
          <rect x="102" y="20" width="42" height="58" rx="14" />
          <path d="M114 36h18" />
          <path d="M114 48h18" />
          <path d="M114 60h12" />
        </g>
      </svg>
    )
  }

  if (type === 'track') {
    return (
      <svg viewBox="0 0 160 120" className="h-28 w-full" fill="none" aria-hidden="true">
        <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <rect x="16" y="24" width="34" height="58" rx="12" />
          <rect x="63" y="36" width="34" height="46" rx="12" />
          <rect x="110" y="18" width="34" height="64" rx="12" />
          <path d="M24 38h18" />
          <path d="M24 50h12" />
          <path d="M71 52h18" />
          <path d="M118 34h18" />
          <path d="M118 46h16" />
          <path d="M118 58h10" />
        </g>
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 160 120" className="h-28 w-full" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="80" cy="36" r="18" />
        <path d="M61 91c5-15 14-23 19-23s14 8 19 23" />
        <path d="M71 34h1" />
        <path d="M88 34h1" />
        <path d="M74 44c4 3 8 4 12 0" />
        <path d="M108 28c10 4 18 12 20 23" />
        <path d="M34 65h21" />
        <path d="M34 77h27" />
      </g>
    </svg>
  )
}

function PanelMiniScene({
  type,
}: {
  type: 'lost' | 'waiting' | 'payment' | 'follow' | 'dispatch'
}) {
  if (type === 'lost') {
    return (
      <svg viewBox="0 0 84 84" className="h-20 w-20" fill="none" aria-hidden="true">
        <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <rect x="14" y="12" width="34" height="26" rx="12" />
          <path d="m28 38-6 10 12-7" />
          <path d="M57 22c6 2 10 7 11 13" />
          <path d="M64 46h1" />
          <path d="M60 56c4-3 9-4 13-2" />
        </g>
      </svg>
    )
  }

  if (type === 'waiting') {
    return (
      <svg viewBox="0 0 84 84" className="h-20 w-20" fill="none" aria-hidden="true">
        <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="27" cy="26" r="10" />
          <path d="M16 58c4-10 10-16 16-16s12 6 16 16" />
          <rect x="48" y="16" width="20" height="28" rx="9" />
          <path d="M58 22v8" />
          <path d="M58 35h.01" />
        </g>
      </svg>
    )
  }

  if (type === 'payment') {
    return (
      <svg viewBox="0 0 84 84" className="h-20 w-20" fill="none" aria-hidden="true">
        <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <rect x="12" y="22" width="60" height="40" rx="14" />
          <path d="M24 36h16" />
          <path d="M24 48h8" />
          <path d="M54 40c0-6 5-11 11-11" />
          <path d="M62 45h1" />
        </g>
      </svg>
    )
  }

  if (type === 'follow') {
    return (
      <svg viewBox="0 0 84 84" className="h-20 w-20" fill="none" aria-hidden="true">
        <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="42" cy="42" r="20" />
          <path d="M42 30v14l8 5" />
          <path d="M58 21l5-5" />
        </g>
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 84 84" className="h-20 w-20" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="12" y="30" width="26" height="22" rx="8" />
        <path d="M38 41h17" />
        <path d="m48 31 14 10-14 10" />
        <rect x="55" y="47" width="16" height="12" rx="5" />
      </g>
    </svg>
  )
}

function PosterFrame({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[2.2rem] border border-white/15 bg-white/[0.04] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.16)] sm:p-6">
      {children}
    </div>
  )
}

function FloatingBubble({
  label,
  style,
}: {
  label: string
  style: CSSProperties
}) {
  return (
    <div
      className="animate-float absolute rounded-[1.4rem] border border-white/15 bg-white/[0.04] px-4 py-3 text-xs uppercase tracking-[0.2em] text-white/78"
      style={style}
    >
      {label}
    </div>
  )
}

function DoodleSymbol({
  symbol,
  style,
}: {
  symbol: string
  style: CSSProperties
}) {
  return (
    <div
      className="animate-float-delayed absolute flex h-14 w-14 items-center justify-center rounded-full border border-white/15 text-2xl"
      style={style}
    >
      {symbol}
    </div>
  )
}

function MessyChatCard({ text }: { text: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white/78">
      {text}
    </div>
  )
}

function WorkflowCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-white/15 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.24em] text-white/55">{title}</p>
      <p className="mt-2 text-sm">{value}</p>
    </div>
  )
}

function PipelineColumn({ title, labels }: { title: string; labels: string[] }) {
  return (
    <div className="rounded-[1.6rem] border border-white/15 bg-white/[0.04] p-3">
      <p className="text-xs uppercase tracking-[0.24em] text-white/56">{title}</p>
      <div className="mt-3 space-y-2">
        {labels.map((label) => (
          <div key={label} className="rounded-[1rem] border border-white/15 px-3 py-3 text-sm">
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}

function QuietBadge({ label }: { label: string }) {
  return (
    <div className="rounded-full border border-white/15 bg-white/[0.05] px-4 py-3 text-xs uppercase tracking-[0.24em] text-white/75">
      {label}
    </div>
  )
}

function DoodleSeller({
  mood,
  className,
}: {
  mood: 'stressed' | 'calm'
  className?: string
}) {
  const mouth = mood === 'stressed' ? 'M86 71c7-4 14-4 21 0' : 'M86 71c6 6 15 6 21 0'
  const tilt = mood === 'stressed' ? '-6' : '0'
  const leftArm = mood === 'stressed' ? 'M67 102c-18-11-26-25-25-39' : 'M67 102c-13-9-20-18-24-29'
  const rightArm = mood === 'stressed' ? 'M125 102c19-7 31-21 36-38' : 'M125 102c15-5 25-13 31-24'
  const bubbles = mood === 'stressed'

  return (
    <svg
      viewBox="0 0 220 260"
      className={className}
      fill="none"
      aria-hidden="true"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <g stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M73 240c6-30 18-50 37-50s31 20 37 50" />
        <path d={leftArm} />
        <path d={rightArm} />
        <path d="M95 190v50" />
        <path d="M125 190v50" />
        <path d="M72 154c8-36 23-56 38-56s30 20 38 56" />
        <path d="M83 106c8-20 18-30 27-30s19 10 27 30" />
        <circle cx="110" cy="57" r="34" />
        <path d="M97 55h1" />
        <path d="M122 55h1" />
        <path d={mouth} />
        <path d="M81 35c7-11 18-16 29-16 10 0 22 5 29 16" />
      </g>
      {bubbles ? (
        <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M32 66h14" />
          <path d="M23 80h9" />
          <path d="M180 68h13" />
          <path d="M190 83h7" />
        </g>
      ) : (
        <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M179 58c11 4 20 12 25 24" />
          <path d="M183 93h16" />
          <path d="M22 96h17" />
        </g>
      )}
    </svg>
  )
}
