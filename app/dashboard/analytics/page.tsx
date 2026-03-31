"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

const revenueData = [
  { day: "Mon", revenue: 120000, orders: 6 },
  { day: "Tue", revenue: 210000, orders: 9 },
  { day: "Wed", revenue: 180000, orders: 8 },
  { day: "Thu", revenue: 260000, orders: 11 },
  { day: "Fri", revenue: 320000, orders: 14 },
  { day: "Sat", revenue: 280000, orders: 10 }
];

const paymentMix = [
  { name: "Paid", value: 14 },
  { name: "Unpaid", value: 5 },
  { name: "COD", value: 4 }
];

const areaData = [
  { area: "Mbezi", count: 9 },
  { area: "Kariakoo", count: 7 },
  { area: "Sinza", count: 5 },
  { area: "Masaki", count: 4 }
];

const colors = ["#10b981", "#0f172a", "#38bdf8"];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#08192d] p-6 text-white shadow-[0_24px_100px_rgba(2,8,23,0.28)] sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-200/80">Analytics</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Fintech-style performance view</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
            Track revenue shape, payment composition, and area performance in a cleaner operating dashboard.
          </p>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Weekly pulse</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-[22px] bg-slate-50 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Best day</p>
              <p className="mt-2 text-2xl font-black text-slate-950">Friday</p>
            </div>
            <div className="rounded-[22px] bg-slate-50 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Risk area</p>
              <p className="mt-2 text-2xl font-black text-slate-950">Payments</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Revenue trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Orders by area</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="area" stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Payment mix</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentMix} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85}>
                  {paymentMix.map((entry, index) => (
                    <Cell key={entry.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">What this week is saying</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Best day</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">Friday</p>
              <p className="mt-1 text-sm text-slate-600">Most revenue and best conversion</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Watch closely</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">Waiting Payment</p>
              <p className="mt-1 text-sm text-slate-600">That is where polite profit goes to sleep</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Signal</p>
              <p className="mt-2 text-lg font-bold text-slate-900">Follow-up speed matters</p>
              <p className="mt-1 text-sm text-slate-600">The faster the reminder, the better the collection odds.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
