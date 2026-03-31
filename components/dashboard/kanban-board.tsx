"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowRight, Pencil, Star } from "lucide-react";
import { Order } from "@/lib/types";
import { updateOrderStageAction } from "@/app/dashboard/actions";
import { formatTZS } from "@/lib/utils";

const STAGES = [
  {
    key: "new_order",
    label: "New Order",
    shell: "border-slate-200 bg-slate-50",
    pill: "bg-slate-100 text-slate-700",
    dot: "bg-slate-400",
  },
  {
    key: "waiting_payment",
    label: "Waiting Payment",
    shell: "border-yellow-200 bg-yellow-50/60",
    pill: "bg-yellow-100 text-yellow-800",
    dot: "bg-yellow-400",
  },
  {
    key: "paid",
    label: "Paid",
    shell: "border-blue-200 bg-blue-50/60",
    pill: "bg-blue-100 text-blue-800",
    dot: "bg-blue-400",
  },
  {
    key: "packing",
    label: "Packing",
    shell: "border-orange-200 bg-orange-50/60",
    pill: "bg-orange-100 text-orange-800",
    dot: "bg-orange-400",
  },
  {
    key: "dispatched",
    label: "Dispatched",
    shell: "border-purple-200 bg-purple-50/60",
    pill: "bg-purple-100 text-purple-800",
    dot: "bg-purple-400",
  },
  {
    key: "delivered",
    label: "Delivered",
    shell: "border-emerald-200 bg-emerald-50/60",
    pill: "bg-emerald-100 text-emerald-800",
    dot: "bg-emerald-500",
  },
];

function paymentBadge(status: string) {
  if (status === "paid") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (status === "unpaid") return "bg-red-50 text-red-600 border border-red-200";
  return "bg-slate-50 text-slate-600 border border-slate-200";
}

function OrderCard({ order }: { order: Order }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const currentIndex = STAGES.findIndex((s) => s.key === order.stage);
  const nextStage = STAGES[currentIndex + 1];
  const isUrgent = order.paymentStatus === "unpaid" && order.stage !== "new_order";

  function advance() {
    if (!nextStage) return;

    startTransition(async () => {
      await updateOrderStageAction(order.id, nextStage.key);
      router.refresh();
    });
  }

  return (
    <div
      className={[
        "rounded-3xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
        isUrgent ? "border-red-200 ring-1 ring-red-100" : "border-slate-200",
      ].join(" ")}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/dashboard/orders/${order.id}`}
            className="block truncate text-sm font-bold text-slate-900 transition hover:text-emerald-600"
          >
            {order.customerName}
          </Link>
          <p className="mt-1 truncate text-xs text-slate-500">{order.product}</p>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${paymentBadge(
            order.paymentStatus
          )}`}
        >
          {order.paymentStatus === "paid"
            ? "Paid"
            : order.paymentStatus === "unpaid"
            ? "Unpaid"
            : order.paymentStatus}
        </span>
      </div>

      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="min-w-0 truncate text-xs text-slate-400">{order.area || "No area"}</span>
        <span className="shrink-0 text-sm font-black text-emerald-600">{formatTZS(order.amount)}</span>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <Link
          href={`/dashboard/orders/${order.id}/edit`}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Link>

        {nextStage ? (
          <button
            onClick={advance}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50"
          >
            <span className="truncate">{isPending ? "Moving..." : nextStage.label}</span>
            {!isPending && <ArrowRight className="h-3.5 w-3.5 shrink-0" />}
          </button>
        ) : (
          <div className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-700">
            <Star className="h-3.5 w-3.5 shrink-0" />
            Done
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ orders }: { orders: Order[] }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Pipeline</p>
          <h3 className="mt-2 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
            Orders moving across the board
          </h3>
        </div>
        <p className="text-sm text-slate-500">Swipe sideways on mobile.</p>
      </div>

      <div className="-mx-1 overflow-x-auto pb-2">
        <div className="flex min-w-max gap-3 px-1 sm:gap-4">
          {STAGES.map((stage) => {
            const items = orders.filter((o) => o.stage === stage.key);
            const hasUnpaid = items.some((o) => o.paymentStatus === "unpaid");

            return (
              <div
                key={stage.key}
                className={`w-[280px] shrink-0 rounded-[28px] border p-3 sm:w-[290px] ${stage.shell}`}
              >
                <div className="mb-3 rounded-3xl bg-white/80 px-3 py-3 backdrop-blur">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${stage.dot}`} />
                      <span className="truncate text-sm font-bold text-slate-900">{stage.label}</span>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {hasUnpaid && <AlertCircle className="h-4 w-4 text-red-500" />}
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${stage.pill}`}>
                        {items.length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {items.length > 0 ? (
                    items.map((order) => <OrderCard key={order.id} order={order} />)
                  ) : (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 px-4 py-10 text-center text-sm text-slate-400">
                      Nothing here yet.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
