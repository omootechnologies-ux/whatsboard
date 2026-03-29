import Link from "next/link";
import { ArrowRight, BarChart3, BellRing, CheckCircle2, MessageCircleMore, PackageCheck, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

const popups = [
  { text: "bei gani?", cls: "left-2 top-6 sm:left-6 sm:top-8 lg:left-0 lg:top-10", delay: "0s", tone: "green" },
  { text: "nitachukua kesho", cls: "right-2 top-20 sm:right-8 sm:top-16 lg:right-0 lg:top-20", delay: "0.3s", tone: "red" },
  { text: "natumia namba gani kulipa?", cls: "left-3 top-36 sm:left-10 sm:top-32 lg:left-6 lg:top-36", delay: "0.6s", tone: "green" },
  { text: "nimetuma", cls: "right-4 top-52 sm:right-10 sm:top-48 lg:right-4 lg:top-56", delay: "0.9s", tone: "red" },
  { text: "ume-dispatch?", cls: "left-2 bottom-24 sm:left-8 sm:bottom-24 lg:left-0 lg:bottom-24", delay: "1.2s", tone: "green" },
  { text: "mteja yuko Mbezi", cls: "right-3 bottom-12 sm:right-10 sm:bottom-12 lg:right-6 lg:bottom-14", delay: "1.5s", tone: "red" },
  { text: "hii order ilishaenda?", cls: "left-10 bottom-0 sm:left-20 sm:bottom-0 lg:left-16 lg:bottom-0", delay: "1.8s", tone: "green" }
];

const stats = [
  { label: "Recovered orders", value: "+18%", icon: PackageCheck, color: "text-green-600" },
  { label: "Unpaid caught early", value: "24", icon: Wallet, color: "text-red-500" },
  { label: "Follow-ups today", value: "13", icon: BellRing, color: "text-green-600" }
];

function popupTone(tone: "green" | "red") {
  return tone === "green"
    ? "border-green-200 bg-green-50/95 text-slate-900"
    : "border-red-200 bg-red-50/95 text-slate-900";
}

export function Hero() {
  return (
    <section className="container-pad relative overflow-hidden py-16 lg:py-24">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.02fr] lg:items-center">
        <div className="space-y-8">
          <div className="inline-flex rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs font-medium text-green-700">
            Built for WhatsApp sellers in Tanzania and East Africa
          </div>

          <div className="space-y-5">
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Turn chat chaos into <span className="text-green-600">paid, tracked</span> and <span className="text-red-500">followed-up</span> orders.
            </h1>

            <p className="max-w-2xl text-lg leading-8 text-slate-600">
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
                <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className={`mb-3 inline-flex rounded-2xl p-2 ${item.color} bg-slate-50`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                  <p className="text-sm text-slate-500">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative min-h-[640px]">
          <div className="hero-grid absolute inset-0 rounded-[2rem] border border-slate-200 bg-white/70" />

          <div className="absolute inset-x-4 top-8 rounded-[2rem] border border-slate-200 bg-slate-900 p-5 shadow-2xl shadow-slate-300/40 sm:inset-x-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Live order intelligence</p>
                <h2 className="text-2xl font-semibold text-white">From “bei gani?” to delivered</h2>
              </div>
              <div className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-300">
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
                  <BarChart3 className="h-4 w-4 text-green-300" />
                  <p className="text-sm font-medium text-white">Revenue movement</p>
                </div>
                <span className="text-xs text-green-300">+22% this week</span>
              </div>

              <div className="flex h-32 items-end gap-2">
                {[36, 52, 49, 68, 84, 72, 94].map((h, i) => (
                  <div key={i} className="flex-1">
                    <div
                      className={`w-full rounded-t-2xl ${i % 2 === 0 ? "bg-gradient-to-t from-green-500 to-green-300" : "bg-gradient-to-t from-red-500 to-red-300"}`}
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
              className={`absolute ${item.cls} float-soft max-w-[220px] sm:max-w-[250px] rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur ${popupTone(item.tone as "green" | "red")}`}
              style={{ animationDelay: item.delay }}
            >
              <div className="flex items-center gap-2">
                <MessageCircleMore className={`h-4 w-4 ${item.tone === "green" ? "text-green-600" : "text-red-500"}`} />
                <span>{item.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 grid gap-4 md:grid-cols-3">
        {[
          { text: "Track every order from inquiry to delivery", tone: "green" },
          { text: "Catch unpaid orders before they disappear", tone: "red" },
          { text: "Follow up without depending on memory", tone: "green" }
        ].map((point) => (
          <div key={point.text} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
            <div className={`rounded-xl p-2 ${point.tone === "green" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <span className="text-sm text-slate-700">{point.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
