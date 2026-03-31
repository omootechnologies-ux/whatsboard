import Link from "next/link";
import { ArrowRight, Pencil, Plus, Wallet } from "lucide-react";
import { getDashboardData } from "@/lib/queries";
import { formatTZS } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function badge(stage: string) {
  const map: Record<string, string> = {
    new_order: "bg-slate-100 text-slate-700",
    waiting_payment: "bg-amber-100 text-amber-700",
    confirmed: "bg-sky-100 text-sky-700",
    packing: "bg-violet-100 text-violet-700",
    dispatched: "bg-cyan-100 text-cyan-700",
    delivered: "bg-emerald-100 text-emerald-700",
  };

  return map[stage] ?? "bg-slate-100 text-slate-700";
}

export default async function OrdersPage() {
  const { orders } = await getDashboardData();
  const unpaidValue = orders
    .filter((order) => order.paymentStatus !== "paid")
    .reduce((sum, order) => sum + order.amount, 0);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#08192d] p-6 text-white shadow-[0_24px_100px_rgba(2,8,23,0.28)] sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-200/80">Orders</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Manage the order book</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
            Review live order flow, jump into edits quickly, and keep collections and dispatch work visible
            on every screen.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard/orders/new"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-95"
            >
              <Plus className="h-4 w-4" />
              New Order
            </Link>
            <Link
              href="/dashboard/analytics"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              See performance
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-7">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Wallet className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Unsettled value</p>
              <p className="text-xs text-slate-500">Orders still waiting to convert to cash</p>
            </div>
          </div>
          <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950">{formatTZS(unpaidValue)}</h2>
          <p className="mt-2 text-sm text-slate-500">{orders.length} total orders currently tracked.</p>
        </div>
      </section>

      <section className="space-y-4 md:hidden">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.id} className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{order.customerName}</p>
                  <p className="mt-1 text-xs text-slate-500">{order.phone || "No phone"}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge(order.stage)}`}>
                  {order.stage.replaceAll("_", " ")}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-400">Product</p>
                  <p className="mt-1 font-medium text-slate-800">{order.product}</p>
                </div>
                <div>
                  <p className="text-slate-400">Amount</p>
                  <p className="mt-1 font-bold text-emerald-600">{formatTZS(order.amount)}</p>
                </div>
                <div>
                  <p className="text-slate-400">Area</p>
                  <p className="mt-1 text-slate-700">{order.area || "—"}</p>
                </div>
                <div>
                  <p className="text-slate-400">Payment</p>
                  <span
                    className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      order.paymentStatus === "paid"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              <Link
                href={`/dashboard/orders/${order.id}/edit`}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <Pencil className="h-4 w-4" />
                Edit order
              </Link>
            </div>
          ))
        ) : (
          <div className="rounded-[26px] border border-dashed border-slate-300 bg-white px-4 py-12 text-center text-sm text-slate-500">
            No orders found.
          </div>
        )}
      </section>

      <section className="hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.06)] md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Product</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Area</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Stage</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Payment</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-4">
                      <div className="min-w-[140px]">
                        <p className="font-semibold text-slate-900">{order.customerName}</p>
                        <p className="text-xs text-slate-500">{order.phone || "No phone"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">{order.product}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{order.area || "—"}</td>
                    <td className="px-4 py-4 text-sm font-bold text-emerald-600">{formatTZS(order.amount)}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge(order.stage)}`}>
                        {order.stage.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          order.paymentStatus === "paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/dashboard/orders/${order.id}/edit`}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
