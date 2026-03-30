import Link from "next/link";
import { ArrowUpRight, CreditCard, ShoppingBag, Users, Wallet } from "lucide-react";
import { getDashboardData } from "@/lib/queries";
import { formatTZS } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  tone = "default",
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  tone?: "default" | "dark" | "success";
}) {
  const styles =
    tone === "dark"
      ? "bg-slate-950 text-white border-slate-950"
      : tone === "success"
      ? "bg-emerald-500 text-white border-emerald-500"
      : "bg-white text-slate-900 border-slate-200";

  const muted =
    tone === "dark" || tone === "success" ? "text-white/70" : "text-slate-500";

  const iconWrap =
    tone === "dark" || tone === "success"
      ? "bg-white/10 text-white"
      : "bg-slate-100 text-slate-700";

  return (
    <div className={`rounded-[28px] border p-5 shadow-sm ${styles}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${muted}`}>
            {title}
          </p>
          <h3 className="mt-3 text-3xl font-black tracking-tight">{value}</h3>
          <p className={`mt-2 text-sm ${muted}`}>{subtitle}</p>
        </div>
        <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${iconWrap}`}>
          {icon}
        </span>
      </div>
    </div>
  );
}

function TinyBars({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);

  return (
    <div className="flex h-24 items-end gap-2">
      {values.map((value, index) => (
        <div key={index} className="flex-1 rounded-t-2xl bg-emerald-500/90" style={{ height: `${Math.max((value / max) * 100, 12)}%` }} />
      ))}
    </div>
  );
}

export default async function DashboardPage() {
  const { orders, metrics } = await getDashboardData();

  const totalOrders = metrics?.totalOrders ?? 0;
  const paidOrders = metrics?.paidOrders ?? 0;
  const unpaidOrders = metrics?.unpaidOrders ?? 0;
  const unpaidValue = metrics?.unpaidValue ?? 0;
  const avgOrderValue = metrics?.avgOrderValue ?? 0;

  const revenue = orders
    .filter((order) => order.paymentStatus === "paid")
    .reduce((sum, order) => sum + order.amount, 0);

  const stageCounts = {
    new_order: orders.filter((o) => o.stage === "new_order").length,
    waiting_payment: orders.filter((o) => o.stage === "waiting_payment").length,
    confirmed: orders.filter((o) => o.stage === "confirmed").length,
    packing: orders.filter((o) => o.stage === "packing").length,
    dispatched: orders.filter((o) => o.stage === "dispatched").length,
    delivered: orders.filter((o) => o.stage === "delivered").length,
  };

  const stageRows = [
    { label: "New", value: stageCounts.new_order },
    { label: "Waiting Payment", value: stageCounts.waiting_payment },
    { label: "Confirmed", value: stageCounts.confirmed },
    { label: "Packing", value: stageCounts.packing },
    { label: "Dispatch", value: stageCounts.dispatched },
    { label: "Delivered", value: stageCounts.delivered },
  ];

  const maxStage = Math.max(...stageRows.map((row) => row.value), 1);
  const chartValues = orders.slice(0, 7).map((order) => order.amount).reverse();
  const recentOrders = orders.slice(0, 6);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-[32px] bg-slate-950 p-6 text-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
            Financial overview
          </p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                {formatTZS(revenue)}
              </h1>
              <p className="mt-2 text-sm text-white/70">
                Paid revenue tracked from your current order board.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-white/5 p-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Orders</p>
                <p className="mt-2 text-xl font-black">{totalOrders}</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Paid</p>
                <p className="mt-2 text-xl font-black">{paidOrders}</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Unpaid</p>
                <p className="mt-2 text-xl font-black">{unpaidOrders}</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Average</p>
                <p className="mt-2 text-xl font-black">{formatTZS(avgOrderValue)}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">Recent value trend</p>
                <p className="text-xs text-white/60">Based on your latest orders</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                <ArrowUpRight className="h-3.5 w-3.5" />
                Active
              </span>
            </div>
            <div className="mt-5">
              <TinyBars values={chartValues.length ? chartValues : [2, 4, 3, 6, 5, 7, 4]} />
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Cash at risk
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
            {formatTZS(unpaidValue)}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Total unpaid order value currently waiting for collection.
          </p>

          <div className="mt-6 rounded-[24px] bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-900">Collection health</p>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{
                  width: `${totalOrders ? Math.max((paidOrders / totalOrders) * 100, 8) : 8}%`,
                }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>Paid rate</span>
              <span>{totalOrders ? Math.round((paidOrders / totalOrders) * 100) : 0}%</span>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <Link
              href="/dashboard/orders"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              View all orders
            </Link>
            <Link
              href="/dashboard/follow-ups"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Check follow-ups
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Revenue"
          value={formatTZS(revenue)}
          subtitle="Collected from paid orders"
          icon={<Wallet className="h-5 w-5" />}
          tone="dark"
        />
        <MetricCard
          title="Orders"
          value={String(totalOrders)}
          subtitle="Total tracked orders"
          icon={<ShoppingBag className="h-5 w-5" />}
        />
        <MetricCard
          title="Customers"
          value={String(new Set(orders.map((order) => order.customerId)).size)}
          subtitle="Unique customers in board"
          icon={<Users className="h-5 w-5" />}
        />
        <MetricCard
          title="Unpaid"
          value={formatTZS(unpaidValue)}
          subtitle="Still waiting for payment"
          icon={<CreditCard className="h-5 w-5" />}
          tone="success"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Order pipeline
              </p>
              <h3 className="mt-2 text-xl font-black tracking-tight text-slate-900">
                Stage distribution
              </h3>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {stageRows.map((row) => (
              <div key={row.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">{row.label}</span>
                  <span className="text-slate-500">{row.value}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{
                      width: `${Math.max((row.value / maxStage) * 100, row.value ? 10 : 0)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Recent activity
              </p>
              <h3 className="mt-2 text-xl font-black tracking-tight text-slate-900">
                Latest orders
              </h3>
            </div>
            <Link
              href="/dashboard/orders"
              className="text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
            >
              View all
            </Link>
          </div>

          <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-200">
            <div className="hidden grid-cols-[1.2fr_0.8fr_0.8fr_0.7fr] gap-4 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 sm:grid">
              <div>Customer</div>
              <div>Product</div>
              <div>Amount</div>
              <div>Status</div>
            </div>

            <div className="divide-y divide-slate-200">
              {recentOrders.length ? (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="grid gap-2 px-4 py-4 sm:grid-cols-[1.2fr_0.8fr_0.8fr_0.7fr] sm:items-center sm:gap-4"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{order.customerName}</p>
                      <p className="text-xs text-slate-500">{order.phone || "No phone"}</p>
                    </div>
                    <div className="text-sm text-slate-700">{order.product}</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {formatTZS(order.amount)}
                    </div>
                    <div>
                      <span
                        className={[
                          "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                          order.paymentStatus === "paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700",
                        ].join(" ")}
                      >
                        {order.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-10 text-center">
                  <p className="font-semibold text-slate-900">No orders yet</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Start by creating your first order.
                  </p>
                  <Link
                    href="/dashboard/orders/new"
                    className="mt-4 inline-flex rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
                  >
                    Add Order
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
