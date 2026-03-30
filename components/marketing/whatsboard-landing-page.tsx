export default function WhatsboardLandingPage() {
  const painCards = [
    {
      title: '“Nitachukua kesho”',
      body: 'Kesho imefika. Order haijulikani iko wapi. Na wewe unaanza kutafuta chat kama mchawi wa receipts.',
      emoji: '😵‍💫',
    },
    {
      title: '“Nimetuma”',
      body: 'Nimetuma nini sasa? Pesa? Screenshot? Location? Emotional damage? Hakuna clarity kabisa.',
      emoji: '🤦🏽‍♂️',
    },
    {
      title: 'Screenshot ndio system',
      body: 'Proof iko gallery. Address iko DM. Payment iko WhatsApp. Dispatch iko kwa dereva. Brain yako ndio dashboard.',
      emoji: '📸',
    },
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Capture the order',
      body: 'Move the customer from WhatsApp, Instagram, TikTok, or Facebook into one clean order board.',
    },
    {
      step: '02',
      title: 'Track every stage',
      body: 'Know who is new, who paid, who is waiting, who is being packed, and who is already out for delivery.',
    },
    {
      step: '03',
      title: 'Follow up like a pro',
      body: 'No more forgetting the customer who said “nitakuja baadaye.” Follow-ups stop living in your head.',
    },
    {
      step: '04',
      title: 'Look organized',
      body: 'Your business starts feeling professional, calm, and in control instead of busy and confused.',
    },
  ];

  const benefits = [
    'Less confusion after chats',
    'Clear payment status',
    'Fewer forgotten follow-ups',
    'Less screenshot hunting',
    'Cleaner dispatch flow',
    'More control for small teams',
    'More professionalism',
    'More money collected',
  ];

  const testimonials = [
    {
      quote:
        'Tulikuwa tuna-run biashara kwa screenshot na vibes. Sasa kila order inaonekana vizuri.',
      name: 'Amina',
      role: 'Online Boutique Seller',
    },
    {
      quote:
        'Before WHATSBOARD nilikuwa busy sana, lakini honestly sikuwa in control. Hiyo ndio iliniuma.',
      name: 'Brian',
      role: 'Gadget Seller',
    },
    {
      quote:
        'Sasa najua nani amelipa, nani anasubiri, nani anahitaji follow-up, na nani anapoteza muda politely.',
      name: 'Neema',
      role: 'Beauty Store Owner',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <section className="relative overflow-hidden border-b border-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(239,68,68,0.08),transparent_25%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Built for WhatsApp sellers in Tanzania & East Africa
            </div>

            <h1 className="max-w-xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Biashara yako si ya kuendeshwa kwa screenshot.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              <span className="font-semibold text-slate-900">WHATSBOARD</span> helps online sellers organize orders after WhatsApp, Instagram, TikTok, and Facebook chats.
              Track payments, follow-ups, packing, dispatch, and delivery in one place.
            </p>

            <div className="mt-4 space-y-2 text-sm font-semibold text-slate-800">
              <p>Hakuna tena <span className="text-red-500">“nilidhani ame-confirm”</span>.</p>
              <p>Hakuna tena kutafuta proof gallery kama CID wa biashara yako mwenyewe.</p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button className="rounded-2xl bg-emerald-500 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-100 transition hover:-translate-y-0.5 hover:bg-emerald-600">
                Start Free
              </button>
              <button className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50">
                See How It Works
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-2">Instagram boutiques</span>
              <span className="rounded-full bg-slate-100 px-3 py-2">Beauty stores</span>
              <span className="rounded-full bg-slate-100 px-3 py-2">TikTok sellers</span>
              <span className="rounded-full bg-slate-100 px-3 py-2">Fashion brands</span>
              <span className="rounded-full bg-slate-100 px-3 py-2">Gadget shops</span>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-xl">
              <div className="absolute -left-4 top-8 hidden rounded-3xl border border-red-100 bg-red-50 px-4 py-3 shadow-sm sm:block">
                <p className="text-xs font-bold text-red-600">Customer:</p>
                <p className="mt-1 text-sm text-slate-700">“Nimetuma.”</p>
                <p className="text-xs text-slate-500">Everyone panics a little.</p>
              </div>

              <div className="absolute -right-2 bottom-10 hidden rounded-3xl border border-emerald-100 bg-emerald-50 px-4 py-3 shadow-sm sm:block">
                <p className="text-xs font-bold text-emerald-700">WHATSBOARD:</p>
                <p className="mt-1 text-sm text-slate-700">Paid. Packed. Dispatch next.</p>
                <p className="text-xs text-slate-500">Now biashara looks serious.</p>
              </div>

              <div className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-100">
                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Cartoon dashboard</p>
                      <h3 className="mt-2 text-xl font-black text-slate-900">Order control, not order comedy.</h3>
                    </div>
                    <div className="rounded-2xl bg-white px-3 py-2 text-right shadow-sm">
                      <p className="text-[11px] font-semibold text-slate-500">Today</p>
                      <p className="text-sm font-black text-slate-900">24 orders</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-3xl bg-white p-4 shadow-sm">
                      <div className="text-3xl">💬</div>
                      <p className="mt-3 text-sm font-bold text-slate-900">New chats</p>
                      <p className="text-xs text-slate-500">7 people said “ipo?”</p>
                    </div>
                    <div className="rounded-3xl bg-white p-4 shadow-sm">
                      <div className="text-3xl">💸</div>
                      <p className="mt-3 text-sm font-bold text-slate-900">Waiting payment</p>
                      <p className="text-xs text-slate-500">3 still on “nimetuma” energy</p>
                    </div>
                    <div className="rounded-3xl bg-white p-4 shadow-sm">
                      <div className="text-3xl">🛵</div>
                      <p className="mt-3 text-sm font-bold text-slate-900">Dispatching</p>
                      <p className="text-xs text-slate-500">5 already moving mjini</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-3xl bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">Order #WB-204</p>
                        <p className="text-xs text-slate-500">Customer: Asha • Area: Mbezi</p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Paid</span>
                    </div>

                    <div className="mt-3 flex items-center gap-2 overflow-x-auto text-xs font-bold text-slate-600">
                      <span className="rounded-full bg-slate-100 px-3 py-2">New Order</span>
                      <span className="rounded-full bg-slate-100 px-3 py-2">Payment</span>
                      <span className="rounded-full bg-emerald-500 px-3 py-2 text-white">Packing</span>
                      <span className="rounded-full bg-slate-100 px-3 py-2">Dispatch</span>
                      <span className="rounded-full bg-slate-100 px-3 py-2">Delivered</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-red-500">Tuambizane ukweli kidogo</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Uko busy. Lakini system yako ina aibu kidogo.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Orders ziko kwa chats. Proof iko gallery. Address iko DM. Follow-up iko kichwani. Halafu kichwa pia kina stress zake.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {painCards.map((item) => (
            <div key={item.title} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="text-4xl">{item.emoji}</div>
              <h3 className="mt-4 text-xl font-black text-slate-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[32px] border border-emerald-100 bg-emerald-50 p-6 text-center">
          <p className="text-lg font-black text-slate-900">
            WHATSBOARD fixes this before another order disappears between <span className="text-emerald-600">“nitumie location”</span> and <span className="text-red-500">“sikupata feedback”</span>.
          </p>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-600">How it works</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Simple. Haraka. Hakuna drama.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {howItWorks.map((item) => (
              <div key={item.step} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="inline-flex rounded-2xl bg-emerald-500 px-3 py-2 text-sm font-black text-white">
                  {item.step}
                </div>
                <h3 className="mt-4 text-xl font-black text-slate-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-slate-500">What changes immediately</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Busy is not the same as organized.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              WHATSBOARD helps you become both. Less confusion. Better follow-up. Cleaner payment status. More confidence when customers ask, “imefikia wapi?”
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {benefits.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-700 shadow-sm">
                  ✓ {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-100">
            <div className="rounded-[28px] bg-gradient-to-br from-red-50 via-white to-emerald-50 p-6">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">Mini cartoon scene</p>
              <div className="mt-6 flex items-end justify-center gap-6">
                <div className="text-center">
                  <div className="mx-auto flex h-28 w-24 items-center justify-center rounded-[2rem] border-4 border-slate-900 bg-red-100 text-5xl">
                    😵
                  </div>
                  <p className="mt-3 text-sm font-bold text-slate-900">Before</p>
                  <p className="text-xs text-slate-500">15 chats. 40 screenshots. Pure prayer.</p>
                </div>
                <div className="pb-8 text-3xl">→</div>
                <div className="text-center">
                  <div className="mx-auto flex h-28 w-24 items-center justify-center rounded-[2rem] border-4 border-slate-900 bg-emerald-100 text-5xl">
                    😎
                  </div>
                  <p className="mt-3 text-sm font-bold text-slate-900">After</p>
                  <p className="text-xs text-slate-500">Orders clear. Payments clear. Biashara calm.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-600">Social proof</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Sounds painfully familiar? Good. It means this is for you.
            </h2>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {testimonials.map((item) => (
              <div key={item.name} className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
                <p className="text-base font-semibold leading-7 text-slate-700">“{item.quote}”</p>
                <div className="mt-5">
                  <p className="text-sm font-black text-slate-950">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="rounded-[36px] bg-slate-950 px-6 py-10 text-white sm:px-10 lg:px-14 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-400">Final CTA</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Acha biashara yako isiendeshwe kwa screenshot na kumbukumbu.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">
                If your orders still live in chats, screenshots, and memory, you are working too hard for confusion. WHATSBOARD helps you miss fewer orders, follow up faster, and collect more money with less stress.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button className="rounded-2xl bg-emerald-500 px-6 py-4 text-sm font-black text-white transition hover:bg-emerald-400">
                  Start Free
                </button>
                <button className="rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-sm font-black text-white transition hover:bg-white/10">
                  Get Order Control
                </button>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/5 p-5 backdrop-blur">
              <div className="rounded-[28px] bg-white p-5 text-slate-900">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-600">Last awkward truth</p>
                <h3 className="mt-2 text-2xl font-black">Customers are not the problem.</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  The problem is trying to remember everything after 27 chats, 9 payment screenshots, and one rider calling while you are still replying “yes dear available.”
                </p>
                <div className="mt-5 rounded-3xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
                  WHATSBOARD = biashara looking serious without acting corporate.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

