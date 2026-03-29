import Link from "next/link";
import { ArrowRight, BellRing, PackageCheck, Wallet, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PAIN_POINTS } from "@/lib/constants";

const miniStats = [
  { label: "Recovered orders", value: "+18%", icon: PackageCheck },
  { label: "Unpaid caught early", value: "24", icon: Wallet },
  { label: "Follow-ups today", value: "13", icon: BellRing }
];

export function Hero() {
  return (
    <section className="container-pad relative overflow-hidden py-16 lg:py-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_30%),radial-gradient(circle_at_left,_rgba(59,130,246,0.08),_transparent_25%)]" />
      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-medium text-emerald-700">
            <Sparkles className="h-3.5 w-3.5" />
            Built for WhatsApp sellers in Tanzania and East Africa
          </div>
          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Turn <span className="text-emerald-600">“bei gani?”</span> into paid, packed, dispatched, delivered money.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              WHATSBOARD helps sellers stop running serious business with memory, screenshots, and panic.
              Less “hii order ilishaenda?” drama. More control. More paid orders.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="h-11 px-5">
              <Link href="/register">
                Start free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-11 px-5">
              <Link href="/login">See dashboard</Link>
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {miniStats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 inline-flex rounded-xl bg-emerald-50 p-2 text-emerald-600">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-xl font-semibold text-slate-900">{item.value}</p>
                  <p className="text-sm text-slate-500">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="relative">
          <Card className="relative overflow-hidden border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/70">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Live order board mood</p>
                <h2 className="text-xl font-semibold text-slate-900">Less chaos. More cash.</h2>
              </div>
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                3 orders need attention
              </div>
            </div>
            <div className="space-y-3">
              {PAIN_POINTS.map((point, index) => (
                <div
                  key={point}
                  className={`${index % 2 === 0 ? "ml-0" : "ml-10"} max-w-[85%] rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm ${
                    index % 2 === 0 ? "bg-slate-50 text-slate-700" : "bg-emerald-50 text-emerald-800"
                  }`}
                >
                  {point}
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Waiting payment</p><p className="mt-1 text-lg font-semibold text-slate-900">7</p></div>
              <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Packing now</p><p className="mt-1 text-lg font-semibold text-slate-900">4</p></div>
              <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Dispatched</p><p className="mt-1 text-lg font-semibold text-slate-900">9</p></div>
            </div>
          </Card>
          <div className="absolute -bottom-4 -left-4 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl lg:block">
            <p className="text-xs text-slate-500">Funny but painful truth</p>
            <p className="mt-1 text-sm font-medium text-slate-900">“Mteja yuko Mbezi” is not a delivery system.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
