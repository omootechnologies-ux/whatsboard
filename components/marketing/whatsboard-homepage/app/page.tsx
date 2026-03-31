import type { CSSProperties, ReactNode } from 'react'
import Link from 'next/link'

const scenarios = [
  {
    title: 'The customer paid, but proof is buried',
    body: 'You know the screenshot exists. You just do not know which chat, which hour, or which scroll.',
    metric: 'Payment not clear',
  },
  {
    title: 'An order is half-confirmed and half-missing',
    body: 'Size is in one message. Area is in another. The order looks real, but it is not structured yet.',
    metric: 'Order can slip',
  },
  {
    title: 'Follow-up lives inside your memory',
    body: 'You meant to reply after lunch. Then dispatch happened. Then another chat arrived.',
    metric: 'Reminder missed',
  },
]

const workflowSteps = [
  {
    step: '01',
    title: 'Customer sends order in chat',
    body: 'Orders still start where East African sellers actually sell: WhatsApp, Instagram, TikTok, Facebook.',
    variant: 'chat' as const,
  },
  {
    step: '02',
    title: 'Capture it in WhatsBoard',
    body: 'The moment it matters, the order moves out of scroll and into a clean workflow record.',
    variant: 'capture' as const,
  },
  {
    step: '03',
    title: 'Track payment, follow-up, dispatch',
    body: 'Know who paid, who needs a nudge, and what is ready to pack or send.',
    variant: 'track' as const,
  },
  {
    step: '04',
    title: 'Run the day with control',
    body: 'Your business feels lighter because the next action is visible, not hidden in chat.',
    variant: 'control' as const,
  },
]

const beforeAfter = [
  { before: 'Unread chats', after: 'Clear order queue' },
  { before: 'Payment guesswork', after: 'Status by order' },
  { before: 'Forgotten follow-ups', after: 'Visible next actions' },
  { before: 'Dispatch confusion', after: 'Pipeline control' },
]

export default function WhatsBoardHomepage() {
  return (
    <main className="font-roboto-mono min-h-screen bg-[#0a5c35] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent_28%),radial-gradient(circle_at_80%_12%,rgba(255,255,255,0.08),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.04)_0,rgba(255,255,255,0.04)_1px,transparent_1px,transparent_30px)] [background-size:100%_100%,100%_100%,30px_30px]" />

      <header className="sticky top-0 z-30 border-b border-white/12 bg-[#0a5c35]/86 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="text-sm uppercase tracking-[0.32em]">
            WhatsBoard
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <a href="#transformation">Transformation</a>
            <a href="#pain">Seller pain</a>
            <a href="#how">How it works</a>
            <a href="#preview">Preview</a>
          </nav>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Link
              href="/login"
              className="rounded-full border border-white/18 px-3 py-2 transition hover:bg-white/10"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-full border border-white/18 bg-white/10 px-3 py-2 transition hover:bg-white/14"
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-white/12">
        <div className="mx-auto grid min-h-[100svh] max-w-6xl gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex rounded-full border border-white/16 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-white/70">
              Chaos to control
            </p>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl leading-none font-semibold tracking-[-0.06em] sm:text-7xl">
                From chat chaos to sales control
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/74 sm:text-base">
                WhatsBoard is built for sellers whose real work starts after the message lands:
                orders, payment status, follow-ups, packing, and dispatch.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ActionLink href="/register" primary>
                Start free
              </ActionLink>
              <ActionLink href="/pricing">See plans</ActionLink>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <MiniStat label="Missed orders" value="Less scroll" />
              <MiniStat label="Payment clarity" value="Visible" />
              <MiniStat label="Dispatch flow" value="Tracked" />
            </div>
          </div>

          <HeroSplitScene />
        </div>
      </section>

      <section id="transformation" className="relative border-b border-white/12 bg-white/[0.03]">
        <SectionShell
          eyebrow="Scroll 01"
          title="The message stays where it came from. The business moves into structure."
          body="As you scroll, the homepage tells the same transformation your seller brain wants every day: noise becoming order, confusion becoming next steps, chat becoming control."
        >
          <TransformationRail />
        </SectionShell>
      </section>

      <section id="pain" className="relative border-b border-white/12">
        <SectionShell
          eyebrow="Scroll 02"
          title="The real pain is not chatting. It is managing biashara inside the chat itself."
          body="This is where sellers lose time, trust, and calm. Not because the order is fake. Because the work around it is still floating."
        >
          <div className="grid gap-4 lg:grid-cols-3">
            {scenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.title}
                title={scenario.title}
                body={scenario.body}
                metric={scenario.metric}
              />
            ))}
          </div>
        </SectionShell>
      </section>

      <section id="how" className="relative border-b border-white/12 bg-white/[0.03]">
        <SectionShell
          eyebrow="Scroll 03"
          title="How it works in four clean moves"
          body="The product flow is simple enough to understand immediately and strong enough to run the whole week."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {workflowSteps.map((item) => (
              <div
                key={item.step}
                className="rounded-[2rem] border border-white/14 bg-white/[0.04] p-5 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.06]"
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-white/58">
                  <span>{item.step}</span>
                  <span className="h-2 w-2 rounded-full bg-white/70" />
                </div>
                <div className="mt-6">
                  <StepVisualization variant={item.variant} />
                </div>
                <h3 className="mt-6 text-xl leading-tight">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/72">{item.body}</p>
              </div>
            ))}
          </div>
        </SectionShell>
      </section>

      <section id="preview" className="relative border-b border-white/12">
        <SectionShell
          eyebrow="Scroll 04"
          title="A dashboard that feels like a control room, not another noisy admin panel."
          body="The product UI becomes the visual language here: clean cards, payment states, order flow, and dispatch visibility layered into one focused view."
        >
          <DashboardPreviewScene />
        </SectionShell>
      </section>

      <section className="relative border-b border-white/12 bg-white/[0.03]">
        <SectionShell
          eyebrow="Scroll 05"
          title="Before and after should feel emotional, not just functional."
          body="The seller is the same. The difference is the feeling: less stress, fewer loose ends, more professional control."
        >
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <BeforeAfterVisual />
            <div className="space-y-3">
              {beforeAfter.map((item) => (
                <div
                  key={item.before}
                  className="grid items-center gap-3 rounded-[1.6rem] border border-white/14 bg-white/[0.04] px-4 py-4 sm:grid-cols-[1fr_auto_1fr]"
                >
                  <span className="text-sm text-white/60">{item.before}</span>
                  <span className="text-center text-xs uppercase tracking-[0.28em] text-white/40">
                    to
                  </span>
                  <span className="text-sm">{item.after}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionShell>
      </section>

      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 py-18 sm:px-6 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-end">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/62">Final frame</p>
              <h2 className="text-4xl leading-none font-semibold tracking-[-0.05em] sm:text-6xl">
                Run the business after the chat like a serious operator.
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-white/74 sm:text-base">
                Start free. Move your first orders out of chaos. Upgrade when the volume demands more control.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <ActionLink href="/register" primary>
                  Start free
                </ActionLink>
                <ActionLink href="/pricing">Explore pricing</ActionLink>
              </div>
            </div>

            <ClosingPanel />
          </div>
        </div>

        <footer className="border-t border-white/12">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-white/62 sm:px-6 md:flex-row md:items-center md:justify-between">
            <p>Built for East African sellers who need control after the message.</p>
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
        <p className="text-xs uppercase tracking-[0.3em] text-white/58">{eyebrow}</p>
        <h2 className="text-4xl leading-none font-semibold tracking-[-0.05em] sm:text-6xl">{title}</h2>
        <p className="max-w-2xl text-sm leading-7 text-white/72 sm:text-base">{body}</p>
      </div>
      <div className="mt-10">{children}</div>
    </div>
  )
}

function ActionLink({
  href,
  children,
  primary = false,
}: {
  href: string
  children: ReactNode
  primary?: boolean
}) {
  return (
    <Link
      href={href}
      className={[
        'rounded-full px-5 py-3 text-center text-sm transition',
        primary
          ? 'border border-white/18 bg-white/10 hover:bg-white/14'
          : 'border border-white/18 hover:bg-white/10',
      ].join(' ')}
    >
      {children}
    </Link>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/14 bg-white/[0.04] px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.24em] text-white/54">{label}</p>
      <p className="mt-3 text-lg">{value}</p>
    </div>
  )
}

function ScenarioCard({
  title,
  body,
  metric,
}: {
  title: string
  body: string
  metric: string
}) {
  return (
    <div className="rounded-[2rem] border border-white/14 bg-white/[0.04] p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border border-white/14 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/60">
          Seller scenario
        </span>
        <span className="text-[11px] uppercase tracking-[0.24em] text-white/42">{metric}</span>
      </div>
      <div className="mt-5 rounded-[1.5rem] border border-white/12 bg-black/8 p-4">
        <div className="space-y-3">
          <ChatRow text="Customer: nishalipa" align="left" />
          <ChatRow text="Screenshot above..." align="right" />
          <ChatRow text="Where is the order now?" align="left" />
        </div>
      </div>
      <h3 className="mt-5 text-xl leading-tight">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/72">{body}</p>
    </div>
  )
}

function HeroSplitScene() {
  return (
    <div className="relative grid gap-4 lg:grid-cols-[0.88fr_1.12fr]">
      <ChaosPanel />
      <ControlPanel />
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden h-18 w-18 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/16 bg-[#0a5c35]/90 text-xs uppercase tracking-[0.24em] text-white/76 lg:flex">
        Shift
      </div>
    </div>
  )
}

function ChaosPanel() {
  return (
    <PanelFrame className="overflow-hidden">
      <div className="relative min-h-[26rem]">
        <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.24em] text-white/48">
          <span>Chat overload</span>
          <span>19 unread</span>
        </div>
        <div className="space-y-3 px-4 pb-4 pt-16">
          <FloatingChat text="Size 41 bado?" style={{ marginLeft: '0rem' }} />
          <FloatingChat text="Nitumie Mbezi leo" style={{ marginLeft: '2rem' }} />
          <FloatingChat text="Paid? check screenshot" style={{ marginLeft: '0.5rem' }} />
          <FloatingChat text="Hello? reply pls" style={{ marginLeft: '3rem' }} />
          <div className="grid grid-cols-2 gap-3 pt-2">
            <ScreenshotTile />
            <ScreenshotTile />
          </div>
        </div>
      </div>
    </PanelFrame>
  )
}

function ControlPanel() {
  return (
    <PanelFrame className="overflow-hidden">
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-xs uppercase tracking-[0.24em] text-white/48">WhatsBoard live board</p>
        <h3 className="mt-2 text-lg">Today&apos;s seller control room</h3>
      </div>
      <div className="grid gap-4 p-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-3">
          <MetricTile label="Waiting payment" value="6 orders" />
          <MetricTile label="Need packing" value="4 orders" />
          <MetricTile label="Follow-ups" value="3 pending" />
        </div>
        <div className="rounded-[1.6rem] border border-white/12 bg-white/[0.04] p-3">
          <div className="grid grid-cols-3 gap-2 text-[11px] uppercase tracking-[0.22em] text-white/44">
            <span>New</span>
            <span>Paid</span>
            <span>Dispatch</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <PipelineCard title="2 orders" />
            <PipelineCard title="4 orders" />
            <PipelineCard title="3 orders" />
          </div>
        </div>
      </div>
    </PanelFrame>
  )
}

function TransformationRail() {
  return (
    <div className="grid gap-4 xl:grid-cols-[0.82fr_auto_1.18fr] xl:items-center">
      <div className="space-y-3">
        <MorphMessage text="Order in DM" />
        <MorphMessage text="Payment proof somewhere" />
        <MorphMessage text="Follow up later" />
      </div>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/14 bg-white/[0.05] text-xs uppercase tracking-[0.24em] text-white/70">
        Reorder
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StructuredColumn title="Orders" items={['New order', 'Waiting payment']} />
        <StructuredColumn title="Customers" items={['Asha', 'Grace']} />
        <StructuredColumn title="Actions" items={['Follow-up', 'Dispatch']} />
      </div>
    </div>
  )
}

function DashboardPreviewScene() {
  return (
    <PanelFrame className="overflow-hidden">
      <div className="grid gap-4 border-b border-white/10 p-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/48">Daily board</p>
          <h3 className="mt-2 text-2xl leading-tight">Everything after the customer says “nataka”.</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MetricTile label="Collected" value="TZS 480K" />
          <MetricTile label="To dispatch" value="5 orders" />
        </div>
      </div>
      <div className="grid gap-4 p-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[1.8rem] border border-white/12 bg-white/[0.04] p-4">
          <div className="grid grid-cols-4 gap-3 text-[11px] uppercase tracking-[0.22em] text-white/44">
            <span>New</span>
            <span>Payment</span>
            <span>Packing</span>
            <span>Dispatch</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <WorkflowLane title="3 cards" />
            <WorkflowLane title="2 cards" />
            <WorkflowLane title="4 cards" />
            <WorkflowLane title="1 card" />
          </div>
        </div>
        <div className="space-y-4">
          <DetailCard
            title="Recent order"
            rows={[
              ['Customer', 'Asha'],
              ['Product', 'Viatu size 40'],
              ['Payment', 'Waiting'],
              ['Area', 'Mikocheni'],
            ]}
          />
          <DetailCard
            title="Next action"
            rows={[
              ['Follow-up', 'Send reminder'],
              ['Packing', '2 ready'],
              ['Dispatch', '1 rider booked'],
            ]}
          />
        </div>
      </div>
    </PanelFrame>
  )
}

function BeforeAfterVisual() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <PanelFrame>
        <div className="space-y-4 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-white/50">Before</p>
          <div className="space-y-3">
            <FloatingChat text="Who paid?" />
            <FloatingChat text="Dispatch leo?" />
            <FloatingChat text="Screenshot missing" />
          </div>
          <div className="rounded-[1.5rem] border border-dashed border-white/14 px-4 py-8 text-center text-sm text-white/58">
            Stress. Scroll. Guesswork.
          </div>
        </div>
      </PanelFrame>
      <PanelFrame>
        <div className="space-y-4 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-white/50">After</p>
          <div className="grid gap-3">
            <WorkflowCard label="Order" value="Captured" />
            <WorkflowCard label="Payment" value="Visible" />
            <WorkflowCard label="Dispatch" value="Tracked" />
          </div>
          <div className="rounded-[1.5rem] border border-white/14 bg-white/[0.05] px-4 py-8 text-center text-sm text-white/76">
            Calm. Clear. Professional.
          </div>
        </div>
      </PanelFrame>
    </div>
  )
}

function ClosingPanel() {
  return (
    <PanelFrame className="overflow-hidden">
      <div className="grid gap-4 p-4 sm:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[1.8rem] border border-white/12 bg-white/[0.04] p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-white/48">What changes</p>
          <div className="mt-4 space-y-3">
            <WorkflowCard label="Orders" value="Not lost in chat" />
            <WorkflowCard label="Payments" value="Easy to confirm" />
            <WorkflowCard label="Follow-ups" value="Not left to memory" />
          </div>
        </div>
        <div className="rounded-[1.8rem] border border-white/12 bg-black/8 p-4">
          <div className="space-y-3">
            <ChatRow text="Customer says nataka..." align="left" />
            <ChatRow text="WhatsBoard makes it structured" align="right" />
            <ChatRow text="You run the day from one view" align="left" />
          </div>
          <div className="mt-4 rounded-[1.4rem] border border-white/12 px-4 py-4 text-sm text-white/74">
            The product does not replace chat. It gives the chat a system.
          </div>
        </div>
      </div>
    </PanelFrame>
  )
}

function StepVisualization({
  variant,
}: {
  variant: 'chat' | 'capture' | 'track' | 'control'
}) {
  if (variant === 'chat') {
    return (
      <svg viewBox="0 0 180 120" className="h-28 w-full" fill="none" aria-hidden="true">
        <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <rect x="14" y="18" width="62" height="34" rx="16" />
          <path d="m38 52-8 12 14-7" />
          <rect x="94" y="54" width="62" height="34" rx="16" />
          <path d="m126 88 13 7-5-11" />
          <path d="M28 34h32" />
          <path d="M108 70h33" />
        </g>
      </svg>
    )
  }

  if (variant === 'capture') {
    return (
      <svg viewBox="0 0 180 120" className="h-28 w-full" fill="none" aria-hidden="true">
        <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <rect x="16" y="28" width="56" height="32" rx="14" />
          <path d="m38 60-8 11 14-7" />
          <path d="M82 44h18" />
          <path d="m92 36 12 8-12 8" />
          <rect x="116" y="20" width="42" height="58" rx="14" />
          <path d="M126 36h20" />
          <path d="M126 48h20" />
          <path d="M126 60h12" />
        </g>
      </svg>
    )
  }

  if (variant === 'track') {
    return (
      <svg viewBox="0 0 180 120" className="h-28 w-full" fill="none" aria-hidden="true">
        <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <rect x="18" y="24" width="40" height="60" rx="12" />
          <rect x="70" y="36" width="40" height="48" rx="12" />
          <rect x="122" y="18" width="40" height="66" rx="12" />
          <path d="M28 40h20" />
          <path d="M28 52h14" />
          <path d="M80 52h20" />
          <path d="M132 34h20" />
          <path d="M132 46h18" />
          <path d="M132 58h10" />
        </g>
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 180 120" className="h-28 w-full" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="18" y="28" width="144" height="58" rx="16" />
        <path d="M36 46h36" />
        <path d="M36 60h26" />
        <path d="M100 44h40" />
        <path d="M100 58h34" />
        <path d="M100 72h20" />
      </g>
    </svg>
  )
}

function PanelFrame({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-[2.2rem] border border-white/14 bg-white/[0.04] shadow-[0_24px_80px_rgba(0,0,0,0.16)] ${className}`}
    >
      {children}
    </div>
  )
}

function FloatingChat({
  text,
  style,
}: {
  text: string
  style?: CSSProperties
}) {
  return (
    <div
      className="rounded-[1.4rem] border border-white/14 bg-white/[0.04] px-4 py-3 text-sm text-white/74"
      style={style}
    >
      {text}
    </div>
  )
}

function ScreenshotTile() {
  return (
    <div className="rounded-[1.4rem] border border-dashed border-white/14 px-4 py-6 text-center text-[11px] uppercase tracking-[0.24em] text-white/46">
      Screenshot
    </div>
  )
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-white/12 bg-black/8 px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.22em] text-white/46">{label}</p>
      <p className="mt-3 text-sm">{value}</p>
    </div>
  )
}

function PipelineCard({ title }: { title: string }) {
  return (
    <div className="rounded-[1.2rem] border border-white/12 bg-black/8 px-3 py-8 text-center text-xs uppercase tracking-[0.22em] text-white/62">
      {title}
    </div>
  )
}

function MorphMessage({ text }: { text: string }) {
  return (
    <div className="rounded-[1.6rem] border border-white/14 bg-white/[0.04] px-4 py-4 text-sm text-white/74">
      {text}
    </div>
  )
}

function StructuredColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[1.8rem] border border-white/14 bg-white/[0.04] p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-white/48">{title}</p>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item} className="rounded-[1.1rem] border border-white/12 px-3 py-3 text-sm">
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

function WorkflowLane({ title }: { title: string }) {
  return (
    <div className="rounded-[1.2rem] border border-white/12 bg-black/8 p-3">
      <div className="rounded-[1rem] border border-white/12 px-3 py-6 text-center text-xs uppercase tracking-[0.22em] text-white/60">
        {title}
      </div>
    </div>
  )
}

function DetailCard({
  title,
  rows,
}: {
  title: string
  rows: string[][]
}) {
  return (
    <div className="rounded-[1.8rem] border border-white/12 bg-white/[0.04] p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-white/48">{title}</p>
      <div className="mt-4 space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 rounded-[1rem] border border-white/12 px-3 py-3 text-sm">
            <span className="text-white/60">{label}</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function WorkflowCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[1.2rem] border border-white/12 px-4 py-3 text-sm">
      <span className="text-white/58">{label}</span>
      <span>{value}</span>
    </div>
  )
}

function ChatRow({
  text,
  align,
}: {
  text: string
  align: 'left' | 'right'
}) {
  return (
    <div className={`flex ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[17rem] rounded-[1.4rem] border border-white/14 bg-white/[0.04] px-4 py-3 text-sm text-white/74">
        {text}
      </div>
    </div>
  )
}
