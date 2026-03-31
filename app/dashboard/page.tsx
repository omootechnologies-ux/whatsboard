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
import { getDashboardWriteAccess } from "@/lib/dashboard-access";
import { canAccessDashboardFeature, canUsePlanCapability } from "@/lib/plan-access";
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
  const {
    business,
    canCreateOrders,
    monthlyOrderLimit,
    orderCountThisMonth,
    remainingMonthlyOrders,
  } = await getDashboardWriteAccess();
  const [{ orders, metrics }, customers, followUps] = await Promise.all([
    getDashboardData(),
    getCustomersData(),
    getFollowUpsData(),
  ]);
  const canSeeCustomers = canAccessDashboardFeature("customers", business);
  const canSeeFollowUps = canAccessDashboardFeature("followUps", business);
  const canSeeAnalytics = canAccessDashboardFeature("analytics", business);
  const canTrackPayments = canUsePlanCapability("paymentTracking", business);

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
  const pipelineSnapshot = [
    { label: "New", value: orders.filter((order) => order.stage === "new_order").length },
    { label: "Payment", value: orders.filter((order) => order.stage === "waiting_payment").length },
    { label: "Paid", value: orders.filter((order) => order.stage === "paid").length },
    { label: "Packing", value: orders.filter((order) => order.stage === "packing").length },
    { label: "Dispatch", value: orders.filter((order) => order.stage === "dispatched").length },
    { label: "Done", value: orders.filter((order) => order.stage === "delivered").length },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-[#173728]/10 bg-white p-6 text-[#173728] shadow-[0_24px_100px_rgba(23,55,40,0.06)] sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#173728]/56">Daily control</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Run orders after chat without losing track.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#173728]/68">
            Keep payment status clear, know which orders need packing or dispatch, and follow up with
            the right customers at the right time.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={canCreateOrders ? "/dashboard/orders/new" : "/pricing?status=upgrade&message=Upgrade%20to%20Starter%20for%20unlimited%20orders"}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#173728] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f281d]"
            >
              {canCreateOrders ? "Create order" : "Upgrade for more orders"}
            </Link>
            {canSeeFollowUps ? (
              <Link
                href="/dashboard/follow-ups"
                className="inline-flex items-center justify-center rounded-2xl border border-[#173728]/10 bg-[#173728]/4 px-5 py-3 text-sm font-semibold text-[#173728] transition hover:bg-[#173728]/7"
              >
                Review follow-ups
              </Link>
            ) : null}
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">What needs attention</p>
          <div className="mt-5 space-y-3">
            <div className="rounded-[22px] bg-amber-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Waiting payment</p>
              <p className="mt-1 text-2xl font-black text-slate-950">
                {canTrackPayments ? unpaidOrders : `${orderCountThisMonth}/${monthlyOrderLimit ?? totalOrders}`}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {canTrackPayments
                  ? `${formatTZS(unpaidValue)} still not collected.`
                  : `${remainingMonthlyOrders ?? 0} free orders left this month.`}
              </p>
            </div>
            <div className="rounded-[22px] bg-sky-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Ready for packing or dispatch</p>
              <p className="mt-1 text-2xl font-black text-slate-950">{packingCount}</p>
              <p className="mt-1 text-sm text-slate-600">Orders already moving after payment.</p>
            </div>
            <div className="rounded-[22px] bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Pending follow-ups</p>
              <p className="mt-1 text-2xl font-black text-slate-950">
                {canSeeFollowUps ? pendingFollowUps.length : "Starter"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {canSeeFollowUps
                  ? "Customers still waiting for a reply or reminder."
                  : "Follow-up reminders unlock on Starter."}
              </p>
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
          label={canSeeCustomers ? "Customers" : "Free quota"}
          value={canSeeCustomers ? String(customers.length) : String(remainingMonthlyOrders ?? monthlyOrderLimit ?? 0)}
          detail={canSeeCustomers ? "Customers created from your orders" : "Orders left this month on Free"}
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
          value={canSeeFollowUps ? String(pendingFollowUps.length) : "Starter"}
          detail={canSeeFollowUps ? "Open reminders still pending" : "Upgrade to unlock reminders"}
          icon={<BellRing className="h-5 w-5" />}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Pipeline</p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Order flow overview</h3>
            </div>
            <Link
              href="/dashboard/orders"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
            >
              Open full order board
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            {pipelineSnapshot.map((stage) => (
              <div key={stage.label} className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{stage.label}</p>
                <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">{stage.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-900">
              <Truck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Dispatch tracker</p>
              <p className="text-xs text-slate-500">What is ready to move after payment and packing.</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-[22px] bg-slate-50 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Ready for packing</p>
              <p className="mt-2 text-2xl font-black text-slate-950">
                {orders.filter((order) => order.stage === "paid").length}
              </p>
            </div>
            <div className="rounded-[22px] bg-slate-50 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">In packing</p>
              <p className="mt-2 text-2xl font-black text-slate-950">
                {orders.filter((order) => order.stage === "packing").length}
              </p>
            </div>
            <div className="rounded-[22px] bg-slate-50 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Out for dispatch</p>
              <p className="mt-2 text-2xl font-black text-slate-950">
                {orders.filter((order) => order.stage === "dispatched").length}
              </p>
            </div>
          </div>
        </div>
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
                    {canTrackPayments ? (
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          order.paymentStatus === "paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {order.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                      </span>
                    ) : null}
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
                  href={canCreateOrders ? "/dashboard/orders/new" : "/pricing?status=upgrade&message=Upgrade%20to%20Starter%20for%20unlimited%20orders"}
                  className="mt-4 inline-flex rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-95"
                >
                  {canCreateOrders ? "Add order" : "Upgrade to add more orders"}
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
                <p className="text-xs text-slate-500">
                  {canTrackPayments ? "Know exactly what still needs collection." : "Unlock payment tracking on Starter."}
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-[22px] bg-slate-50 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                {canTrackPayments ? "Unpaid value" : "Free usage"}
              </p>
              <p className="mt-2 break-words text-2xl font-black text-slate-950">
                {canTrackPayments ? formatTZS(unpaidValue) : `${orderCountThisMonth}/${monthlyOrderLimit ?? totalOrders}`}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {canTrackPayments
                  ? `${unpaidOrders} orders still need payment confirmation.`
                  : `${remainingMonthlyOrders ?? 0} free orders left this month.`}
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
                <p className="text-xs text-slate-500">
                  {canSeeFollowUps ? "Keep delayed chats and orders moving." : "Follow-up reminders unlock on Starter."}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {canSeeFollowUps && nextFollowUps.length ? (
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
                  {canSeeFollowUps ? "No follow-ups pending right now." : "Follow-up reminders unlock on Starter."}
                </div>
              )}
            </div>

            {canSeeFollowUps ? (
              <Link
                href="/dashboard/follow-ups"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
              >
                Open follow-ups
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Link
          href={canCreateOrders ? "/dashboard/orders/new" : "/pricing?status=upgrade&message=Upgrade%20to%20Starter%20for%20unlimited%20orders"}
          className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.06)] transition hover:border-emerald-200 hover:bg-emerald-50/30"
        >
          <p className="text-sm font-semibold text-slate-900">{canCreateOrders ? "Create order" : "Upgrade for more orders"}</p>
          <p className="mt-2 text-sm text-slate-500">
            {canCreateOrders
              ? "Start from a fresh sale and let WhatsBoard create or match the customer automatically."
              : "Free gives you 30 orders per month. Upgrade to Starter for unlimited orders and deeper workflows."}
          </p>
        </Link>
        {canSeeCustomers ? (
          <Link
            href="/dashboard/customers"
            className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.06)] transition hover:border-emerald-200 hover:bg-emerald-50/30"
          >
            <p className="text-sm font-semibold text-slate-900">Customer list</p>
            <p className="mt-2 text-sm text-slate-500">
              See repeat buyers and dormant customers who may need a quick follow-up.
            </p>
          </Link>
        ) : (
          <Link
            href="/pricing?status=upgrade&message=Upgrade%20to%20Starter%20to%20unlock%20customer%20profiles"
            className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.06)] transition hover:border-emerald-200 hover:bg-emerald-50/30"
          >
            <p className="text-sm font-semibold text-slate-900">Customer profiles</p>
            <p className="mt-2 text-sm text-slate-500">
              Upgrade to Starter to unlock customer history, follow-ups, and profile editing.
            </p>
          </Link>
        )}
        <Link
          href={canSeeAnalytics ? "/dashboard/analytics" : "/dashboard/settings"}
          className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.06)] transition hover:border-emerald-200 hover:bg-emerald-50/30"
        >
          <p className="text-sm font-semibold text-slate-900">{canSeeAnalytics ? "Reports & analytics" : "Settings"}</p>
          <p className="mt-2 text-sm text-slate-500">
            {canSeeAnalytics
              ? "Growth and Business can track reports from live order and customer data."
              : "Keep business details, defaults, and contact info clean for daily operations."}
          </p>
        </Link>
      </section>

      {canSeeCustomers && customers.length > 0 && dormantCustomers.length > 0 ? (
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
