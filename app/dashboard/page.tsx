import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  CreditCard,
  PackageCheck,
  ShoppingBag,
  Truck,
  Users,
} from "lucide-react";
import { getCustomersData, getDashboardData, getFollowUpsData } from "@/lib/queries";
import { formatTZS } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function StatCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
          <h2 className="mt-3 break-words text-3xl font-black tracking-tight text-slate-950">{value}</h2>
          <p className="mt-2 text-sm text-slate-500">{detail}</p>
        </div>
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          {icon}
        </span>
      </div>
    </div>
  );
}

function statusTone(stage: string) {
  const map: Record<string, string> = {
    new_order: "bg-slate-100 text-slate-700",
    waiting_payment: "bg-amber-100 text-amber-700",
    paid: "bg-sky-100 text-sky-700",
    packing: "bg-violet-100 text-violet-700",
    dispatched: "bg-cyan-100 text-cyan-700",
    delivered: "bg-emerald-100 text-emerald-700",
  };

  return map[stage] ?? "bg-slate-100 text-slate-700";
}

export default async function DashboardPage() {
  const [{ orders, metrics }, customers, followUps] = await Promise.all([
    getDashboardData(),
    getCustomersData(),
    getFollowUpsData(),
  ]);

  const totalOrders = metrics?.totalOrders ?? 0;
  const unpaidOrders = metrics?.unpaidOrders ?? 0;
  const unpaidValue = metrics?.unpaidValue ?? 0;
  const packingCount = orders.filter((order) =>
    ["paid", "packing", "dispatched"].includes(order.stage)
  ).length;
  const deliveredCount = orders.filter((order) => order.stage === "delivered").length;
  const pendingFollowUps = followUps.filter((item) => !item.completed);
  const dormantCustomers = customers.filter((customer) => {
    const lastOrderTime = new Date(customer.lastOrderDate).getTime();
    return Number.isFinite(lastOrderTime) && Date.now() - lastOrderTime >= 30 * 24 * 60 * 60 * 1000;
  });

  const recentOrders = orders.slice(0, 6);
  const nextFollowUps = pendingFollowUps.slice(0, 5);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#08192d] p-6 text-white shadow-[0_24px_100px_rgba(2,8,23,0.28)] sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-200/80">Daily control</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Run orders after chat without losing track.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
            Keep payment status clear, know which orders need packing or dispatch, and follow up with
            the right customers at the right time.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard/orders/new"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-95"
            >
              Create order
            </Link>
            <Link
              href="/dashboard/follow-ups"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Review follow-ups
            </Link>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">What needs attention</p>
          <div className="mt-5 space-y-3">
            <div className="rounded-[22px] bg-amber-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Waiting payment</p>
              <p className="mt-1 text-2xl font-black text-slate-950">{unpaidOrders}</p>
              <p className="mt-1 text-sm text-slate-600">{formatTZS(unpaidValue)} still not collected.</p>
            </div>
            <div className="rounded-[22px] bg-sky-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Ready for packing or dispatch</p>
              <p className="mt-1 text-2xl font-black text-slate-950">{packingCount}</p>
              <p className="mt-1 text-sm text-slate-600">Orders already moving after payment.</p>
            </div>
            <div className="rounded-[22px] bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Pending follow-ups</p>
              <p className="mt-1 text-2xl font-black text-slate-950">{pendingFollowUps.length}</p>
              <p className="mt-1 text-sm text-slate-600">Customers still waiting for a reply or reminder.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Orders"
          value={String(totalOrders)}
          detail="All orders currently tracked"
          icon={<ShoppingBag className="h-5 w-5" />}
        />
        <StatCard
          label="Customers"
          value={String(customers.length)}
          detail="Customers created from your orders"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Delivered"
          value={String(deliveredCount)}
          detail="Orders already completed"
          icon={<Truck className="h-5 w-5" />}
        />
        <StatCard
          label="Follow-ups"
          value={String(pendingFollowUps.length)}
          detail="Open reminders still pending"
          icon={<BellRing className="h-5 w-5" />}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Recent orders</p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Latest activity</h3>
            </div>
            <Link
              href="/dashboard/orders"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
            >
              View all orders
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {recentOrders.length ? (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="grid gap-3 rounded-[22px] border border-slate-200 bg-slate-50/80 p-4 sm:grid-cols-[1.2fr_0.9fr_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{order.customerName}</p>
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {order.product} {order.area ? `• ${order.area}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusTone(order.stage)}`}>
                      {order.stage.replaceAll("_", " ")}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        order.paymentStatus === "paid"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {order.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <p className="text-sm font-bold text-slate-900">{formatTZS(order.amount)}</p>
                    <Link
                      href={`/dashboard/orders/${order.id}/edit`}
                      className="inline-flex rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-300 px-4 py-10 text-center">
                <p className="font-semibold text-slate-900">No orders yet</p>
                <p className="mt-1 text-sm text-slate-500">
                  Start with your first order and WhatsBoard will build customers and follow-ups from there.
                </p>
                <Link
                  href="/dashboard/orders/new"
                  className="mt-4 inline-flex rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-95"
                >
                  Add order
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <CreditCard className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Payment control</p>
                <p className="text-xs text-slate-500">Know exactly what still needs collection.</p>
              </div>
            </div>
            <div className="mt-4 rounded-[22px] bg-slate-50 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Unpaid value</p>
              <p className="mt-2 break-words text-2xl font-black text-slate-950">{formatTZS(unpaidValue)}</p>
              <p className="mt-2 text-sm text-slate-500">
                {unpaidOrders} orders still need payment confirmation.
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <PackageCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Next follow-ups</p>
                <p className="text-xs text-slate-500">Keep delayed chats and orders moving.</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {nextFollowUps.length ? (
                nextFollowUps.map((item) => (
                  <div key={item.id} className="rounded-[22px] bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">{item.customerName}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.product || "No product"} {item.area ? `• ${item.area}` : ""}
                    </p>
                    <p className="mt-2 text-sm text-slate-700">{item.note || "No note added yet."}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-[22px] border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                  No follow-ups pending right now.
                </div>
              )}
            </div>

            <Link
              href="/dashboard/follow-ups"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
            >
              Open follow-ups
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Link
          href="/dashboard/orders/new"
          className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.06)] transition hover:border-emerald-200 hover:bg-emerald-50/30"
        >
          <p className="text-sm font-semibold text-slate-900">Create order</p>
          <p className="mt-2 text-sm text-slate-500">
            Start from a fresh sale and let WhatsBoard create or match the customer automatically.
          </p>
        </Link>
        <Link
          href="/dashboard/customers"
          className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.06)] transition hover:border-emerald-200 hover:bg-emerald-50/30"
        >
          <p className="text-sm font-semibold text-slate-900">Customer list</p>
          <p className="mt-2 text-sm text-slate-500">
            See repeat buyers and dormant customers who may need a quick follow-up.
          </p>
        </Link>
        <Link
          href="/dashboard/catalog"
          className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.06)] transition hover:border-emerald-200 hover:bg-emerald-50/30"
        >
          <p className="text-sm font-semibold text-slate-900">Catalog</p>
          <p className="mt-2 text-sm text-slate-500">
            Keep products and stock ready so order entry is faster and cleaner.
          </p>
        </Link>
      </section>

      {customers.length > 0 && dormantCustomers.length > 0 ? (
        <section className="rounded-[28px] border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Dormant customers to re-engage</p>
          <p className="mt-2 text-sm text-slate-600">
            {dormantCustomers.length} customers have not ordered in 30 days or more. Check the customer
            page to send a quick follow-up.
          </p>
          <Link
            href="/dashboard/customers"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-700 transition hover:text-amber-800"
          >
            Open customers
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      ) : null}
    </div>
  );
}
