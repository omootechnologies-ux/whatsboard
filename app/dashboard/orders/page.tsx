import Link from "next/link";
import { ArrowRight, BellRing, Pencil, Plus, Wallet } from "lucide-react";
import { getDashboardWriteAccess } from "@/lib/dashboard-access";
import { canAccessDashboardFeatureForUser, canUsePlanCapabilityForUser } from "@/lib/plan-access";
import { getDashboardData } from "@/lib/queries";
import { formatTZS } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function badge(stage: string) {
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

export default async function OrdersPage() {
  const { business, isAdmin, canCreateOrders, monthlyOrderLimit, orderCountThisMonth, remainingMonthlyOrders } =
    await getDashboardWriteAccess();
  const { orders } = await getDashboardData();
  const canSeeCustomers = canAccessDashboardFeatureForUser("customers", business, isAdmin);
  const canSeeFollowUps = canAccessDashboardFeatureForUser("followUps", business, isAdmin);
  const canTrackPayments = canUsePlanCapabilityForUser("paymentTracking", business, isAdmin);
  const unpaidValue = orders
    .filter((order) => order.paymentStatus !== "paid")
    .reduce((sum, order) => sum + order.amount, 0);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 2xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[32px] border border-[#173728]/10 bg-white p-6 text-[#173728] shadow-[0_24px_100px_rgba(23,55,40,0.06)] sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#173728]/56">Orders</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Manage the order book</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#173728]/68">
            Review live order flow, jump into edits quickly, and keep collections and dispatch work visible
            on every screen.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={canCreateOrders ? "/dashboard/orders/new" : "/pricing?status=upgrade&message=Upgrade%20to%20Starter%20for%20unlimited%20orders"}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#173728] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f281d]"
            >
              <Plus className="h-4 w-4" />
              {canCreateOrders ? "New Order" : "Upgrade for more orders"}
            </Link>
            {canSeeFollowUps ? (
              <Link
                href="/dashboard/follow-ups"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#173728]/10 bg-[#173728]/4 px-5 py-3 text-sm font-semibold text-[#173728] transition hover:bg-[#173728]/7"
              >
                Open follow-ups
                <BellRing className="h-4 w-4" />
              </Link>
            ) : null}
            {canSeeCustomers ? (
              <Link
                href="/dashboard/customers"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#173728]/10 bg-[#173728]/4 px-5 py-3 text-sm font-semibold text-[#173728] transition hover:bg-[#173728]/7"
              >
                Open customers
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-7">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Wallet className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Unsettled value</p>
              <p className="text-xs text-slate-500">
                {canTrackPayments ? "Orders still waiting to convert to cash" : "Upgrade to Starter to unlock payment tracking"}
              </p>
            </div>
          </div>
          <h2 className="mt-5 break-words text-2xl font-black leading-tight tracking-tight text-slate-950 xl:text-[1.75rem] 2xl:text-3xl">
            {monthlyOrderLimit === null ? formatTZS(unpaidValue) : `${orderCountThisMonth}/${monthlyOrderLimit}`}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {monthlyOrderLimit === null
              ? `${orders.length} total orders currently tracked.`
              : `${remainingMonthlyOrders ?? 0} free orders left this month.`}
          </p>
        </div>
      </section>

      {monthlyOrderLimit !== null ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Free gives you up to {monthlyOrderLimit} orders this month. Follow-ups, payment tracking, and customer workflows start on Starter.
          <Link href="/pricing" className="ml-2 font-semibold underline">
            Upgrade now
          </Link>
        </div>
      ) : null}

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
                {canTrackPayments ? (
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
                ) : null}
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
                {canTrackPayments ? (
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Payment</th>
                ) : null}
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
                    {canTrackPayments ? (
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
                    ) : null}
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
                  <td colSpan={canTrackPayments ? 7 : 6} className="px-4 py-12 text-center text-sm text-slate-500">
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
