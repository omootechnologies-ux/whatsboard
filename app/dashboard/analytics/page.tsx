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

const colors = ["#10b981", "#0f172a", "#94a3b8"];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Analytics</h2>
        <p className="mt-2 text-slate-600">
          Profit-focused metrics only. No “look we have charts” nonsense.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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
              <p className="text-sm text-slate-500">Funny diagnosis</p>
              <p className="mt-2 text-lg font-bold text-slate-900">Too many “nitachukua kesho” customers</p>
              <p className="mt-1 text-sm text-slate-600">Translation: follow-up harder, respectfully.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
