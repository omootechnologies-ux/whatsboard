import Link from "next/link";
import { ArrowRight, BellRing, PackageCheck, Wallet, Sparkles, MessageCircleMore } from "lucide-react";
import { Button } from "@/components/ui/button";

const floatingPhrases = [
  { text: "bei gani?", cls: "top-4 left-2 md:left-6 floaty" },
  { text: "nitachukua kesho", cls: "top-20 right-2 md:right-8 bounce-soft" },
  { text: "natumia namba gani kulipa?", cls: "top-36 left-6 md:left-16 floaty" },
  { text: "nimetuma", cls: "top-56 right-6 md:right-14 bounce-soft" },
  { text: "ume-dispatch?", cls: "bottom-40 left-4 md:left-10 floaty" },
  { text: "mteja yuko Mbezi", cls: "bottom-24 right-3 md:right-8 bounce-soft" },
  { text: "hii order ilishaenda?", cls: "bottom-6 left-10 md:left-20 floaty" }
];

const miniStats = [
  { label: "Recovered orders", value: "+18%", icon: PackageCheck },
  { label: "Unpaid caught early", value: "24", icon: Wallet },
  { label: "Follow-ups today", value: "13", icon: BellRing }
];

export function Hero() {
  return (
    <section className="container-pad relative overflow-hidden py-20 lg:py-28">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_25%),radial-gradient(circle_at_left,_rgba(34,197,94,0.08),_transparent_25%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.08),_transparent_30%)]" />

      <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1.5 text-xs font-medium text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            Built for WhatsApp sellers in Tanzania and East Africa
          </div>

          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Turn chat chaos into <span className="text-emerald-300">paid, tracked, completed orders.</span>
            </h1>

            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              Your sales are inside WhatsApp. Your control is missing. WHATSBOARD stops the daily confusion,
              follow-up leaks, and “who handled this order?” stress.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="glow-soft">
              <Link href="/register">
                Start free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href="/login">See dashboard</Link>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {miniStats.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition hover:-translate-y-1 hover:bg-white/10"
                >
                  <div className="mb-3 inline-flex rounded-xl bg-emerald-400/10 p-2 text-emerald-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-xl font-semibold text-white">{item.value}</p>
                  <p className="text-sm text-slate-400">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative min-h-[620px]">
          <div className="absolute inset-0 rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/70 shadow-2xl shadow-emerald-950/30 backdrop-blur" />

          <div className="absolute left-6 right-6 top-6 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Live order board mood</p>
                <h2 className="text-xl font-semibold text-white">Less chaos. More cash.</h2>
              </div>
              <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                +18% recovered
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-slate-900/70 p-3">
                <p className="text-xs text-slate-400">Waiting payment</p>
                <p className="mt-1 text-lg font-semibold text-white">7</p>
              </div>
              <div className="rounded-2xl bg-slate-900/70 p-3">
                <p className="text-xs text-slate-400">Packing now</p>
                <p className="mt-1 text-lg font-semibold text-white">4</p>
              </div>
              <div className="rounded-2xl bg-slate-900/70 p-3">
                <p className="text-xs text-slate-400">Delivered</p>
                <p className="mt-1 text-lg font-semibold text-white">12</p>
              </div>
            </div>
          </div>

          {floatingPhrases.map((item, index) => (
            <div
              key={item.text}
              className={`absolute ${item.cls} max-w-[260px] rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white shadow-xl backdrop-blur`}
              style={{ animationDelay: `${index * 0.25}s` }}
            >
              <div className="flex items-center gap-2">
                <MessageCircleMore className="h-4 w-4 text-emerald-300" />
                <span>{item.text}</span>
              </div>
            </div>
          ))}

          <div className="absolute bottom-8 right-8 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200 shadow-lg backdrop-blur bounce-soft">
            This is not CRM. This is rescue.
          </div>
        </div>
      </div>
    </section>
  );
}
