import Link from "next/link";
import { ArrowRight, BarChart3, BellRing, CheckCircle2, MessageCircleMore, PackageCheck, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

const popups = [
  { text: "bei gani?", cls: "left-2 top-14 lg:left-0 lg:top-12", delay: "0s" },
  { text: "nitachukua kesho", cls: "right-0 top-24 lg:right-2 lg:top-24", delay: "0.4s" },
  { text: "natumia namba gani kulipa?", cls: "left-8 top-40 lg:left-10 lg:top-44", delay: "0.8s" },
  { text: "nimetuma", cls: "right-4 top-56 lg:right-0 lg:top-64", delay: "1.2s" },
  { text: "ume-dispatch?", cls: "left-0 bottom-28 lg:left-6 lg:bottom-28", delay: "1.6s" },
  { text: "mteja yuko Mbezi", cls: "right-2 bottom-14 lg:right-10 lg:bottom-16", delay: "2s" },
  { text: "hii order ilishaenda?", cls: "left-14 bottom-0 lg:left-20 lg:bottom-1", delay: "2.4s" }
];

const stats = [
  { label: "Recovered orders", value: "+18%", icon: PackageCheck },
  { label: "Unpaid caught early", value: "24", icon: Wallet },
  { label: "Follow-ups today", value: "13", icon: BellRing }
];

export function Hero() {
  return (
    <section className="container-pad relative overflow-hidden py-16 lg:py-24">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.02fr] lg:items-center">
        <div className="space-y-8">
          <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-medium text-emerald-300">
            Built for WhatsApp sellers in Tanzania and East Africa
          </div>

          <div className="space-y-5">
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Turn chat chaos into <span className="text-emerald-300">paid, tracked, completed orders.</span>
            </h1>

            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              WHATSBOARD helps businesses stop losing money after the chat starts.
              No more screenshot operations, unpaid-order confusion, or memory-based follow-up.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="pulse-soft">
              <Link href="/register">
                Start free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">See dashboard</Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                  <div className="mb-3 inline-flex rounded-2xl bg-emerald-400/10 p-2 text-emerald-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-2xl font-bold text-white">{item.value}</p>
                  <p className="text-sm text-slate-400">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative min-h-[620px]">
          <div className="hero-grid absolute inset-0 rounded-[2rem] border border-white/10 bg-slate-900/50" />

          <div className="absolute inset-x-6 top-8 rounded-[2rem] border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Live order intelligence</p>
                <h2 className="text-2xl font-semibold text-white">From “bei gani?” to delivered</h2>
              </div>
              <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                +18% recovered
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-slate-400">Waiting payment</p>
                <p className="mt-1 text-2xl font-semibold text-white">07</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-slate-400">Packing</p>
                <p className="mt-1 text-2xl font-semibold text-white">04</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-slate-400">Delivered</p>
                <p className="mt-1 text-2xl font-semibold text-white">12</p>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-emerald-300" />
                  <p className="text-sm font-medium text-white">Revenue movement</p>
                </div>
                <span className="text-xs text-emerald-300">+22% this week</span>
              </div>

              <div className="flex h-32 items-end gap-2">
                {[36, 52, 49, 68, 84, 72, 94].map((h, i) => (
                  <div key={i} className="flex-1">
                    <div
                      className="w-full rounded-t-2xl bg-gradient-to-t from-emerald-500 to-cyan-400"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-400">Best performing area</p>
                <p className="mt-1 text-lg font-semibold text-white">Mbezi</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-400">Most urgent stage</p>
                <p className="mt-1 text-lg font-semibold text-white">Waiting Payment</p>
              </div>
            </div>
          </div>

          {popups.map((item) => (
            <div
              key={item.text}
              className={`absolute ${item.cls} float-soft max-w-[250px] rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white shadow-xl backdrop-blur-xl`}
              style={{ animationDelay: item.delay }}
            >
              <div className="flex items-center gap-2">
                <MessageCircleMore className="h-4 w-4 text-emerald-300" />
                <span>{item.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 grid gap-4 md:grid-cols-3">
        {[
          "Track every order from inquiry to delivery",
          "Catch unpaid orders before they disappear",
          "Follow up without depending on memory"
        ].map((point) => (
          <div key={point} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
            <div className="rounded-xl bg-emerald-400/10 p-2 text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <span className="text-sm text-slate-200">{point}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
