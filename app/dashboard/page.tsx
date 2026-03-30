import Link from "next/link";
import {
  Plus,
  AlertCircle,
  TrendingUp,
  ShoppingBag,
  CheckCircle2,
  BellRing,
  ArrowRight,
} from "lucide-react";
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

  const readyToDispatch = orders.filter(
    (o) => o.stage === "confirmed" || o.stage === "packing"
  ).length;

  const deliveredCount = orders.filter((o) => o.stage === "delivered").length;
  const recentOrders = [...orders].slice(0, 5);

  return (
    <div className="space-y-5 lg:space-y-8">
      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6 lg:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-600">
              Overview
            </p>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              Your seller control room.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              See what needs payment, what needs packing, and what needs follow-up before a customer
              disappears into another inbox.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard/orders/new"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                <Plus className="h-4 w-4" />
                Add New Order
              </Link>

              <Link
                href="/dashboard/orders"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400"
              >
                Open Orders
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-6 lg:p-8">
            <MiniInsight
              label="Orders today"
              value={String(todayOrders)}
              note={todayOrders > 0 ? "Fresh activity on the board." : "Quiet day so far."}
            />
            <MiniInsight
              label="Ready to move"
              value={String(readyToDispatch)}
              note="Confirmed or packing right now."
            />
            <MiniInsight
              label="Delivered"
              value={String(deliveredCount)}
              note="Orders already completed."
            />
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm sm:p-6 lg:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/55">
            Attention needed
          </p>
          <h2 className="mt-3 text-xl font-black tracking-tight sm:text-2xl">
            {urgentUnpaid > 0 ? `${urgentUnpaid} unpaid orders` : "No unpaid pressure right now"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/70">
            {urgentUnpaid > 0
              ? "This is cash still sitting in chats, screenshots, promises, and 'nitakutumia sasa'."
              : "Clean. Your unpaid queue looks calm at the moment."}
          </p>

          <div className="mt-5 space-y-3">
            <AlertLine
              tone={urgentUnpaid > 0 ? "danger" : "ok"}
              text={
                urgentUnpaid > 0
                  ? "Follow up before dispatch. Don’t pack for vibes."
                  : "No urgent unpaid orders detected."
              }
            />
            <AlertLine
              tone="neutral"
              text={`${metrics?.totalOrders ?? 0} total tracked orders on the system.`}
            />
            <AlertLine
              tone="neutral"
              text={`${formatTZS(metrics?.unpaidValue ?? 0)} still waiting to be collected.`}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Orders"
          value={String(metrics?.totalOrders ?? 0)}
          hint="Everything currently tracked"
          icon={<ShoppingBag className="h-4 w-4" />}
          tone="slate"
        />
        <StatCard
          label="Paid Orders"
          value={String(metrics?.paidOrders ?? 0)}
          hint="Confirmed payments received"
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="green"
        />
        <StatCard
          label="Unpaid Orders"
          value={String(metrics?.unpaidOrders ?? 0)}
          hint="Needs follow-up"
          icon={<AlertCircle className="h-4 w-4" />}
          tone="red"
          urgent={urgentUnpaid > 0}
        />
        <StatCard
          label="Unpaid Value"
          value={formatTZS(metrics?.unpaidValue ?? 0)}
          hint="Cash still on the table"
          icon={<TrendingUp className="h-4 w-4" />}
          tone="orange"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="min-w-0 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
          <KanbanBoard orders={orders} />
        </div>

        <div className="space-y-5">
          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                  Quick pressure check
                </p>
                <h3 className="mt-2 text-lg font-black tracking-tight text-slate-900 sm:text-xl">
                  Follow-ups and unpaid heat
                </h3>
              </div>
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <BellRing className="h-5 w-5" />
              </span>
            </div>

            <div className="mt-5 space-y-3">
              <QuickRow
                label="Unpaid waiting action"
                value={String(urgentUnpaid)}
                tone={urgentUnpaid > 0 ? "red" : "green"}
              />
              <QuickRow
                label="Orders created today"
                value={String(todayOrders)}
                tone="slate"
              />
              <QuickRow
                label="Ready for packing / dispatch"
                value={String(readyToDispatch)}
                tone="orange"
              />
              <QuickRow
                label="Paid orders"
                value={String(metrics?.paidOrders ?? 0)}
                tone="green"
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                  Recent activity
                </p>
                <h3 className="mt-2 text-lg font-black tracking-tight text-slate-900 sm:text-xl">
                  Latest orders
                </h3>
              </div>

              <Link
                href="/dashboard/orders"
                className="shrink-0 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
              >
                See all
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {order.customerName}
                      </p>
                      <p className="truncate text-xs text-slate-500">{order.product}</p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-emerald-600">
                        {formatTZS(order.amount)}
                      </p>
                      <p className="text-xs capitalize text-slate-400">
                        {order.stage.replaceAll("_", " ")}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                  No orders yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function MiniInsight({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{note}</p>
    </div>
  );
}

function AlertLine({
  text,
  tone,
}: {
  text: string;
  tone: "danger" | "ok" | "neutral";
}) {
  const toneMap = {
    danger: "border-red-500/20 bg-red-500/10 text-red-100",
    ok: "border-emerald-500/20 bg-emerald-500/10 text-emerald-100",
    neutral: "border-white/10 bg-white/5 text-white/80",
  };

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${toneMap[tone]}`}>
      {text}
    </div>
  );
}

function QuickRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "red" | "green" | "orange" | "slate";
}) {
  const toneMap = {
    red: "bg-red-50 text-red-600",
    green: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3">
      <p className="min-w-0 text-sm font-medium text-slate-600">{label}</p>
      <span className={`shrink-0 rounded-xl px-3 py-1 text-sm font-bold ${toneMap[tone]}`}>{value}</span>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
  tone,
  urgent,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
  tone: "slate" | "green" | "red" | "orange";
  urgent?: boolean;
}) {
  const colorMap = {
    slate: "bg-slate-100 text-slate-600",
    green: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-500",
    orange: "bg-orange-50 text-orange-500",
  };

  return (
    <div
      className={[
        "rounded-[24px] border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5",
        urgent ? "border-red-200 ring-1 ring-red-100" : "border-slate-200",
      ].join(" ")}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">{label}</p>
        <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${colorMap[tone]}`}>
          {icon}
        </span>
      </div>

      <p className="break-words text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{value}</p>
      {hint && <p className="mt-2 text-sm text-slate-500">{hint}</p>}
    </div>
  );
}
