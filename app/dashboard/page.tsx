import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  Boxes,
  Clock3,
  CreditCard,
  Gift,
  MessageCircle,
  PackageCheck,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";
import { getDashboardData } from "@/lib/queries";
import { formatTZS } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  accent,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 text-white shadow-[0_24px_80px_rgba(2,8,23,0.25)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">{title}</p>
          <h3 className="mt-3 break-words text-2xl font-black leading-tight tracking-tight xl:text-[1.75rem] 2xl:text-3xl">
            {value}
          </h3>
          <p className="mt-2 text-sm leading-6 text-white/58">{subtitle}</p>
        </div>
        <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${accent}`}>
          {icon}
        </span>
      </div>
    </div>
  );
}

function TinyBars({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);

  return (
    <div className="flex h-28 items-end gap-2">
      {values.map((value, index) => (
        <div
          key={index}
          className="flex-1 rounded-t-[18px] bg-gradient-to-t from-emerald-400 to-cyan-400 shadow-[0_10px_24px_rgba(45,212,191,0.18)]"
          style={{ height: `${Math.max((value / max) * 100, 12)}%` }}
        />
      ))}
    </div>
  );
}

function StageBar({
  label,
  value,
  max,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  tone: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-900">{label}</span>
        <span className="text-slate-500">{value}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${tone}`}
          style={{ width: `${Math.max((value / max) * 100, value ? 10 : 0)}%` }}
        />
      </div>
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
  const uniqueCustomers = new Set(orders.map((order) => order.customerId)).size;

  const revenue = orders
    .filter((order) => order.paymentStatus === "paid")
    .reduce((sum, order) => sum + order.amount, 0);

  const stageCounts = {
    new_order: orders.filter((o) => o.stage === "new_order").length,
    waiting_payment: orders.filter((o) => o.stage === "waiting_payment").length,
    paid: orders.filter((o) => o.stage === "paid").length,
    packing: orders.filter((o) => o.stage === "packing").length,
    dispatched: orders.filter((o) => o.stage === "dispatched").length,
    delivered: orders.filter((o) => o.stage === "delivered").length,
  };

  const stageRows = [
    { label: "New Orders", value: stageCounts.new_order, tone: "bg-slate-900" },
    { label: "Waiting Payment", value: stageCounts.waiting_payment, tone: "bg-amber-400" },
    { label: "Paid", value: stageCounts.paid, tone: "bg-sky-500" },
    { label: "Packing", value: stageCounts.packing, tone: "bg-violet-500" },
    { label: "Dispatched", value: stageCounts.dispatched, tone: "bg-cyan-500" },
    { label: "Delivered", value: stageCounts.delivered, tone: "bg-emerald-500" },
  ];

  const maxStage = Math.max(...stageRows.map((row) => row.value), 1);
  const chartValues = orders.slice(0, 8).map((order) => order.amount).reverse();
  const recentOrders = orders.slice(0, 5);
  const paymentRate = totalOrders ? Math.round((paidOrders / totalOrders) * 100) : 0;

  const alertRows = [
    {
      title: "Cash waiting collection",
      value: formatTZS(unpaidValue),
      detail: `${unpaidOrders} orders still unpaid`,
    },
    {
      title: "Average ticket size",
      value: formatTZS(avgOrderValue),
      detail: "Typical order value in the current flow",
    },
    {
      title: "Repeat buyer footprint",
      value: `${uniqueCustomers}`,
      detail: "Unique customers active in the board",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 2xl:grid-cols-[1.45fr_0.95fr]">
        <div className="overflow-hidden rounded-[34px] border border-white/10 bg-[#08192d] text-white shadow-[0_30px_120px_rgba(2,8,23,0.38)]">
          <div className="relative p-6 sm:p-7 lg:p-8">
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-emerald-400/18 via-cyan-400/10 to-transparent blur-2xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
                Fintech dashboard
              </div>

              <div className="mt-5 grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white/52">Net collected revenue</p>
                  <h1 className="mt-3 break-words text-4xl font-black leading-tight tracking-tight sm:text-5xl xl:text-[2.75rem] 2xl:text-5xl">
                    {formatTZS(revenue)}
                  </h1>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-white/65">
                    A treasury-style snapshot of what has already been collected, what is still exposed,
                    and how quickly your order pipeline is moving.
                  </p>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/dashboard/orders"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-95"
                    >
                      Review orders
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/dashboard/follow-ups"
                      className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      Manage follow-ups
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 xl:grid-cols-2">
                  <div className="min-w-0 rounded-[24px] border border-white/8 bg-white/6 p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Orders</p>
                    <p className="mt-3 text-2xl font-black">{totalOrders}</p>
                    <p className="mt-1 text-xs text-white/50">Tracked in workflow</p>
                  </div>
                  <div className="min-w-0 rounded-[24px] border border-white/8 bg-white/6 p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Paid Rate</p>
                    <p className="mt-3 text-2xl font-black">{paymentRate}%</p>
                    <p className="mt-1 text-xs text-white/50">Conversion to cash</p>
                  </div>
                  <div className="min-w-0 rounded-[24px] border border-white/8 bg-white/6 p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Customers</p>
                    <p className="mt-3 text-2xl font-black">{uniqueCustomers}</p>
                    <p className="mt-1 text-xs text-white/50">Active buyer base</p>
                  </div>
                  <div className="min-w-0 rounded-[24px] border border-white/8 bg-white/6 p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Avg Order</p>
                    <p className="mt-3 break-words text-xl font-black leading-tight xl:text-2xl">{formatTZS(avgOrderValue)}</p>
                    <p className="mt-1 text-xs text-white/50">Basket quality</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-[28px] border border-white/10 bg-slate-950/35 p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">Transaction pulse</p>
                    <p className="text-xs text-white/50">Latest order values as a quick trend signal</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                    Stable flow
                  </span>
                </div>
                <div className="mt-5">
                  <TinyBars values={chartValues.length ? chartValues : [2, 5, 4, 7, 6, 8, 7, 9]} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[34px] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff,rgba(241,245,249,0.88))] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Risk monitor</p>
          <h2 className="mt-3 break-words text-2xl font-black leading-tight tracking-tight text-slate-950 xl:text-[1.75rem] 2xl:text-3xl">{formatTZS(unpaidValue)}</h2>
          <p className="mt-2 text-sm text-slate-500">
            Outstanding receivables currently tied up in unpaid orders.
          </p>

          <div className="mt-6 rounded-[24px] bg-slate-950 p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/75">Collection health</p>
                <p className="mt-1 text-2xl font-black">{paymentRate}%</p>
              </div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <BadgeDollarSign className="h-5 w-5" />
              </span>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                style={{ width: `${totalOrders ? Math.max((paidOrders / totalOrders) * 100, 8) : 8}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-white/50">
              <span>{paidOrders} paid</span>
              <span>{unpaidOrders} pending</span>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {alertRows.map((item) => (
              <div key={item.title} className="rounded-[22px] border border-slate-200 bg-white/85 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
                  </div>
                  <p className="max-w-[40%] break-words text-right text-sm font-bold leading-tight text-emerald-600">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <MetricCard
          title="Collected"
          value={formatTZS(revenue)}
          subtitle="Revenue banked from paid orders"
          icon={<Wallet className="h-5 w-5" />}
          accent="bg-emerald-400/12 text-emerald-200"
        />
        <MetricCard
          title="Pipeline"
          value={String(totalOrders)}
          subtitle="Orders currently managed"
          icon={<ShoppingBag className="h-5 w-5" />}
          accent="bg-cyan-400/12 text-cyan-200"
        />
        <MetricCard
          title="Customers"
          value={String(uniqueCustomers)}
          subtitle="Distinct buyers in play"
          icon={<Users className="h-5 w-5" />}
          accent="bg-sky-400/12 text-sky-200"
        />
        <MetricCard
          title="At Risk"
          value={formatTZS(unpaidValue)}
          subtitle="Still exposed to collection delay"
          icon={<CreditCard className="h-5 w-5" />}
          accent="bg-amber-400/12 text-amber-200"
        />
      </section>

      <section className="grid gap-4 2xl:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Pipeline</p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Stage distribution</h3>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              <PackageCheck className="h-3.5 w-3.5" />
              Live board
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {stageRows.map((row) => (
              <StageBar key={row.label} label={row.label} value={row.value} max={maxStage} tone={row.tone} />
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Activity</p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Latest orders</h3>
            </div>
            <Link
              href="/dashboard/orders"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {recentOrders.length ? (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-[1.3fr_0.8fr_0.8fr_auto] sm:items-center"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{order.customerName}</p>
                    <p className="mt-1 text-xs text-slate-500">{order.phone || "No phone"}</p>
                  </div>
                  <div className="text-sm text-slate-700">{order.product}</div>
                  <div className="break-words text-sm font-bold leading-tight text-slate-900">{formatTZS(order.amount)}</div>
                  <div className="flex items-center gap-2">
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
                    <Link
                      href={`/dashboard/orders/${order.id}/edit`}
                      className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-300 px-4 py-10 text-center">
                <p className="font-semibold text-slate-900">No orders yet</p>
                <p className="mt-1 text-sm text-slate-500">Start by creating your first order.</p>
                <Link
                  href="/dashboard/orders/new"
                  className="mt-4 inline-flex rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-95"
                >
                  Add Order
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Clock3 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Follow-up timing</p>
              <p className="text-xs text-slate-500">Keep waiting-payment orders moving</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Customer visibility</p>
              <p className="text-xs text-slate-500">Track repeat buyers and active contacts fast</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <Wallet className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Treasury clarity</p>
              <p className="text-xs text-slate-500">Separate collected cash from exposed receivables</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Link href="/dashboard/referrals" className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.06)] transition hover:border-emerald-200 hover:bg-emerald-50/40">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Gift className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Referral program</p>
              <p className="text-xs text-slate-500">Invite a seller, get 30 days free</p>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/customers" className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.06)] transition hover:border-emerald-200 hover:bg-emerald-50/40">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <MessageCircle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Customer re-engagement</p>
              <p className="text-xs text-slate-500">Spot dormant buyers and trigger follow-up</p>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/catalog" className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.06)] transition hover:border-emerald-200 hover:bg-emerald-50/40">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
              <Boxes className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Catalog builder</p>
              <p className="text-xs text-slate-500">Manage products, stock, and WhatsApp sharing</p>
            </div>
          </div>
        </Link>
      </section>
    </div>
  );
}
