import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  PackageCheck,
  Wallet,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Recovered orders", value: "+18%", tone: "green" },
  { label: "Unpaid caught early", value: "24", tone: "red" },
  { label: "Follow-ups today", value: "13", tone: "green" }
];

const chatBubbles = [
  { text: "bei gani?", side: "left", tone: "green" },
  { text: "nitachukua kesho", side: "right", tone: "red" },
  { text: "natumia namba gani kulipa?", side: "left", tone: "green" },
  { text: "nimetuma", side: "right", tone: "red" },
  { text: "ume-dispatch?", side: "left", tone: "green" },
  { text: "mteja yuko Mbezi", side: "right", tone: "red" },
  { text: "hii order ilishaenda?", side: "left", tone: "green" }
];

function bubbleClasses(side: "left" | "right", tone: "green" | "red") {
  const toneClasses =
    tone === "green"
      ? "bg-green-50 border-green-200 text-slate-900"
      : "bg-red-50 border-red-200 text-slate-900";

  const sideClasses = side === "left" ? "mr-auto" : "ml-auto";

  return `${sideClasses} ${toneClasses}`;
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
              Turn chat chaos into <span className="text-green-600">paid, tracked</span> and{" "}
              <span className="text-red-500">followed-up</span> orders.
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
            {stats.map((item) => (
              <div
                key={item.label}
                className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div
                  className={`mb-3 inline-flex rounded-2xl px-3 py-1 text-xs font-medium ${
                    item.tone === "green"
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {item.label}
                </div>
                <p className="text-2xl font-bold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[560px]">
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-200/70">
            <div className="mx-auto max-w-[390px] rounded-[2.4rem] bg-slate-950 p-3 shadow-xl">
              <div className="rounded-[2rem] bg-white">
                <div className="flex justify-center pt-3">
                  <div className="h-1.5 w-24 rounded-full bg-slate-200" />
                </div>

                <div className="border-b border-slate-100 px-4 pb-4 pt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">WhatsApp order flow</p>
                      <h2 className="text-lg font-semibold text-slate-900">
                        From “bei gani?” to delivered
                      </h2>
                    </div>
                    <div className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                      +18% recovered
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[11px] text-slate-500">Waiting</p>
                      <p className="mt-1 text-xl font-semibold text-slate-900">07</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[11px] text-slate-500">Packing</p>
                      <p className="mt-1 text-xl font-semibold text-slate-900">04</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[11px] text-slate-500">Delivered</p>
                      <p className="mt-1 text-xl font-semibold text-slate-900">12</p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900">Live customer messages</p>
                      <MoreHorizontal className="h-4 w-4 text-slate-400" />
                    </div>

                    <div className="space-y-3">
                      {chatBubbles.map((bubble) => (
                        <div
                          key={bubble.text}
                          className={`max-w-[88%] rounded-2xl border px-4 py-3 text-sm shadow-sm ${bubbleClasses(
                            bubble.side as "left" | "right",
                            bubble.tone as "green" | "red"
                          )}`}
                        >
                          {bubble.text}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">Best performing area</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">Mbezi</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">Most urgent stage</p>
                      <p className="mt-1 text-lg font-semibold text-red-500">Waiting Payment</p>
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    This is not CRM. This is rescue.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -left-4 top-10 hidden h-24 w-24 rounded-full bg-green-200/30 blur-3xl lg:block" />
          <div className="pointer-events-none absolute -right-4 bottom-10 hidden h-24 w-24 rounded-full bg-red-200/30 blur-3xl lg:block" />
        </div>
      </div>

      <div className="mt-16 grid gap-4 md:grid-cols-3">
        {[
          { text: "Track every order from inquiry to delivery", tone: "green" },
          { text: "Catch unpaid orders before they disappear", tone: "red" },
          { text: "Follow up without depending on memory", tone: "green" }
        ].map((point) => (
          <div
            key={point.text}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
          >
            <div
              className={`rounded-xl p-2 ${
                point.tone === "green"
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-500"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <span className="text-sm text-slate-700">{point.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
