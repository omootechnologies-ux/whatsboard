import { Card } from "@/components/ui/card";

export function LivePreview() {
  return (
    <section id="preview" className="container-pad py-20">
      <div className="mb-10 max-w-2xl">
        <p className="text-sm font-medium text-emerald-300">Live product preview</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          A dashboard that actually feels like control.
        </h2>
        <p className="mt-4 text-slate-300">
          Built for sellers who already get customers on WhatsApp, Instagram, TikTok, and Facebook —
          but lose order control after the first message.
        </p>
      </div>

      <Card className="overflow-hidden border-white/10 bg-slate-900/70 p-0 shadow-2xl shadow-black/30">
        <div className="border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">WHATSBOARD dashboard</p>
              <h3 className="text-lg font-semibold text-white">Operations snapshot</h3>
            </div>
            <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
              Live visibility
            </div>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border-b border-white/10 p-6 lg:border-b-0 lg:border-r">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Orders today", "36"],
                ["Paid orders", "21"],
                ["Unpaid value", "TZS 480,000"],
                ["Repeat customers", "11"]
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="mt-2 text-xl font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-white">Weekly revenue</p>
                <span className="text-xs text-emerald-300">+16%</span>
              </div>
              <div className="flex h-32 items-end gap-2">
                {[35, 50, 62, 55, 78, 70, 92].map((h, i) => (
                  <div key={i} className="flex-1">
                    <div
                      className="w-full rounded-t-2xl bg-gradient-to-t from-emerald-500 to-cyan-400"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-white">Order pipeline</p>
              <span className="text-xs text-slate-400">Swipe-friendly board</span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                { title: "Waiting Payment", count: "07", items: ["Amina — 2 dresses", "Kelvin — speaker"] },
                { title: "Packing", count: "04", items: ["Neema — serum bundle", "Beda — 3 handbags"] },
                { title: "Dispatched", count: "09", items: ["Mariam — shoes", "Farida — blender"] }
              ].map((col) => (
                <div key={col.title} className="rounded-3xl border border-white/10 bg-white/5 p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white">{col.title}</h4>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300">{col.count}</span>
                  </div>
                  <div className="space-y-3">
                    {col.items.map((item) => (
                      <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-200">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
