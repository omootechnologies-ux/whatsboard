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
  Cell,
} from "recharts";
import { formatTZS } from "@/lib/utils";

const colors = ["#10b981", "#0f172a", "#38bdf8", "#f59e0b"];

type AnalyticsDashboardProps = {
  revenueData: Array<{ day: string; revenue: number; orders: number }>;
  paymentMix: Array<{ name: string; value: number }>;
  areaData: Array<{ area: string; count: number }>;
  summary: {
    bestDay: string;
    bestDayRevenue: number;
    bestDayOrders: number;
    topStage: string;
    repeatCustomers: number;
    dormantCustomers: number;
  };
};

function niceStageLabel(value: string) {
  return value.replaceAll("_", " ");
}

export default function AnalyticsDashboard({
  revenueData,
  paymentMix,
  areaData,
  summary,
}: AnalyticsDashboardProps) {
  return (
    <>
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-[#173728]/10 bg-white p-6 text-[#173728] shadow-[0_24px_100px_rgba(23,55,40,0.06)] sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-200/80">Analytics</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Fintech-style performance view</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#173728]/68">
            Track live revenue shape, payment composition, and area performance using your real customer and order data.
          </p>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Weekly pulse</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-[22px] bg-slate-50 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Best day</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{summary.bestDay}</p>
              <p className="mt-1 text-xs text-slate-500">{formatTZS(summary.bestDayRevenue)}</p>
            </div>
            <div className="rounded-[22px] bg-slate-50 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Top stage</p>
              <p className="mt-2 text-2xl font-black capitalize text-slate-950">{niceStageLabel(summary.topStage)}</p>
              <p className="mt-1 text-xs text-slate-500">Biggest active workflow bucket</p>
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
                <Tooltip formatter={(value: number) => formatTZS(value)} />
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
          <h3 className="mb-4 text-lg font-semibold text-slate-900">What your live data is saying</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Best day</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{summary.bestDay}</p>
              <p className="mt-1 text-sm text-slate-600">
                {summary.bestDayOrders} orders, {formatTZS(summary.bestDayRevenue)}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Repeat customers</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{summary.repeatCustomers}</p>
              <p className="mt-1 text-sm text-slate-600">Customers who have ordered more than once</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Dormant customers</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{summary.dormantCustomers}</p>
              <p className="mt-1 text-sm text-slate-600">Customers with 30+ days since their last order</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
