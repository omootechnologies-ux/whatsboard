"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import { Plus, X } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { KanbanBoard } from "@/components/dashboard/kanban-board";
import { OrderForm } from "@/components/forms/order-form";
import { demoOrders } from "@/lib/demo-data";
import { formatTZS } from "@/lib/utils";

const revenueData = [
  { day: "Mon", revenue: 120000 },
  { day: "Tue", revenue: 210000 },
  { day: "Wed", revenue: 180000 },
  { day: "Thu", revenue: 260000 },
  { day: "Fri", revenue: 320000 },
  { day: "Sat", revenue: 280000 }
];

const stageData = [
  { name: "New", value: 5 },
  { name: "Waiting", value: 7 },
  { name: "Paid", value: 9 },
  { name: "Delivered", value: 6 }
];

const areaData = [
  { area: "Mbezi", count: 9 },
  { area: "Kariakoo", count: 6 },
  { area: "Sinza", count: 4 },
  { area: "Masaki", count: 3 }
];

const pieColors = ["#10b981", "#0f172a", "#14b8a6", "#94a3b8"];

export default function DashboardPage() {
  const [showOrderForm, setShowOrderForm] = useState(false);

  const paidOrders = demoOrders.filter((o) => o.paymentStatus === "paid").length;
  const unpaidOrders = demoOrders.filter((o) => o.paymentStatus === "unpaid").length;
  const unpaidValue = demoOrders
    .filter((o) => o.paymentStatus === "unpaid")
    .reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Overview</h2>
          <p className="mt-2 text-slate-600">
            See what is paid, stuck, delayed, and ready for follow-up.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowOrderForm((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-600"
          >
            {showOrderForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showOrderForm ? "Close Form" : "Add Order"}
          </button>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Your orders are finally in one place.
          </div>
        </div>
      </section>

      {showOrderForm && (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-slate-900">Create new order</h3>
            <p className="mt-1 text-sm text-slate-500">
              Capture the order before it gets lost in chat.
            </p>
          </div>
          <OrderForm />
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Orders today" value={String(demoOrders.length)} hint="Tracked from chat to cash" />
        <StatCard label="Paid orders" value={String(paidOrders)} hint="Confirmed and moving" />
        <StatCard label="Unpaid orders" value={String(unpaidOrders)} hint="Needs follow-up" />
        <StatCard label="Unpaid value" value={formatTZS(unpaidValue)} hint="Money still stuck" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-slate-900">Revenue movement</h3>
            <p className="text-sm text-slate-500">Daily revenue trend across the week</p>
          </div>
          <div className="h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#revenueFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-slate-900">Order stages</h3>
              <p className="text-sm text-slate-500">Where most orders are sitting</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stageData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={4}>
                    {stageData.map((entry, index) => (
                      <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Today’s funny truth</h3>
            <p className="mt-3 text-slate-600">
              The team no longer has to answer “ume-dispatch?” by opening 7 chats and one notebook.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-slate-900">Top delivery areas</h3>
            <p className="text-sm text-slate-500">Where your orders are coming from</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="area" stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="count" fill="#0f172a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="min-w-0">
          <KanbanBoard orders={demoOrders} />
        </div>
      </section>
    </div>
  );
}
