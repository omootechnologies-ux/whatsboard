import Link from "next/link";
import { Plus, AlertCircle, TrendingUp, ShoppingBag, CheckCircle2, Clock } from "lucide-react";
import { KanbanBoard } from "@/components/dashboard/kanban-board";
import { formatTZS } from "@/lib/utils";
import { getDashboardData } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const { orders, metrics } = await getDashboardData();

  const urgentUnpaid = orders.filter(
    (o) => o.paymentStatus === "unpaid" && o.stage !== "delivered"
  ).length;

  const todayOrders = orders.filter((o) => {
    const created = new Date(o.createdAt);
    const today = new Date();
    return created.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="space-y-8">

      {/* Header */}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-1">Operations Center</p>
          <h2 className="text-2xl font-bold text-slate-900">Good day. Here's your pipeline. 👋</h2>
          <p className="mt-1 text-sm text-slate-500">
            {todayOrders > 0
              ? `${todayOrders} order${todayOrders > 1 ? "s" : ""} created today.`
              : "No orders yet today — go get some customers."}{" "}
            {urgentUnpaid > 0 && (
              <span className="text-red-500 font-medium">
                {urgentUnpaid} unpaid order{urgentUnpaid > 1 ? "s" : ""} need attention.
              </span>
            )}
          </p>
        </div>
        <Link
          href="/dashboard/orders/new"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Order
        </Link>
      </section>

      {/* Stat Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Orders"
          value={String(metrics?.totalOrders ?? 0)}
          hint="All tracked orders"
          icon={<ShoppingBag className="h-4 w-4" />}
          color="slate"
        />
        <StatCard
          label="Paid"
          value={String(metrics?.paidOrders ?? 0)}
          hint="Confirmed payments"
          icon={<CheckCircle2 className="h-4 w-4" />}
          color="green"
        />
        <StatCard
          label="Unpaid Orders"
          value={String(metrics?.unpaidOrders ?? 0)}
          hint="Needs follow-up now"
          icon={<AlertCircle className="h-4 w-4" />}
          color="red"
          urgent={urgentUnpaid > 0}
        />
        <StatCard
          label="Unpaid Value"
          value={formatTZS(metrics?.unpaidValue ?? 0)}
          hint="Cash still on the table"
          icon={<TrendingUp className="h-4 w-4" />}
          color="orange"
        />
      </section>

      {/* Unpaid Alert Banner */}
      {urgentUnpaid > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <p className="text-red-700">
            <span className="font-semibold">{urgentUnpaid} orders unpaid</span> and not yet delivered.
            Don't pack and dispatch until payment is confirmed.{" "}
            <Link href="/dashboard/orders" className="underline font-semibold">
              View orders →
            </Link>
          </p>
        </div>
      )}

      {/* Kanban */}
      <section>
        <KanbanBoard orders={orders} />
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
  color,
  urgent,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
  color: "slate" | "green" | "red" | "orange";
  urgent?: boolean;
}) {
  const colorMap = {
    slate: "bg-slate-100 text-slate-600",
    green: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-500",
    orange: "bg-orange-50 text-orange-500",
  };
  const valueColorMap = {
    slate: "text-slate-900",
    green: "text-emerald-600",
    red: "text-red-500",
    orange: "text-orange-500",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
        urgent ? "border-red-300 ring-1 ring-red-200" : "border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <span className={`inline-flex rounded-lg p-1.5 ${colorMap[color]}`}>{icon}</span>
      </div>
      <p className={`text-3xl font-bold tracking-tight ${valueColorMap[color]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
