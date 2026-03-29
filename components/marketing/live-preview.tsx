import { Card } from "@/components/ui/card";

export function LivePreview() {
  return (
    <section id="preview" className="container-pad py-20">
      <div className="mb-10 max-w-2xl">
        <p className="text-sm font-medium text-green-600">Live product preview</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          A dashboard that actually feels like control.
        </h2>
        <p className="mt-4 text-slate-600">
          Built for sellers who already get customers on WhatsApp, Instagram, TikTok, and Facebook —
          but lose order control after the first message.
        </p>
      </div>

      <Card className="overflow-hidden border-slate-200 bg-white p-0 shadow-2xl shadow-slate-200/50">
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">WHATSBOARD dashboard</p>
              <h3 className="text-lg font-semibold text-slate-900">Operations snapshot</h3>
            </div>
            <div className="rounded-full bg-green-50 px-3 py-1 text-xs text-green-700">
              Live visibility
            </div>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border-b border-slate-200 p-6 lg:border-b-0 lg:border-r">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Orders today", "36", "green"],
                ["Paid orders", "21", "green"],
                ["Unpaid value", "TZS 480,000", "red"],
                ["Repeat customers", "11", "green"]
              ].map(([label, value, tone]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className={`mt-2 text-xl font-semibold ${tone === "green" ? "text-green-600" : "text-red-500"}`}>{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-900">Weekly revenue</p>
                <span className="text-xs text-green-700">+16%</span>
              </div>
              <div className="flex h-32 items-end gap-2">
                {[35, 50, 62, 55, 78, 70, 92].map((h, i) => (
                  <div key={i} className="flex-1">
                    <div
                      className={`w-full rounded-t-2xl ${i % 2 === 0 ? "bg-gradient-to-t from-green-500 to-green-300" : "bg-gradient-to-t from-red-500 to-red-300"}`}
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-900">Order pipeline</p>
              <span className="text-xs text-slate-500">Swipe-friendly board</span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                { title: "Waiting Payment", count: "07", items: ["Amina — 2 dresses", "Kelvin — speaker"] },
                { title: "Packing", count: "04", items: ["Neema — serum bundle", "Beda — 3 handbags"] },
                { title: "Dispatched", count: "09", items: ["Mariam — shoes", "Farida — blender"] }
              ].map((col, idx) => (
                <div key={col.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-900">{col.title}</h4>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${idx === 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>{col.count}</span>
                  </div>
                  <div className="space-y-3">
                    {col.items.map((item) => (
                      <div key={item} className="rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-sm">
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
