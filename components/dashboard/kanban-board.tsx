"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Order } from "@/lib/types";
import { updateOrderStageAction } from "@/app/dashboard/actions";
import { formatTZS } from "@/lib/utils";
import { CheckCircle2, Clock, AlertCircle, Package, Truck, Star } from "lucide-react";
import Link from "next/link";

const STAGES = [
  { key: "new_order", label: "New Order", color: "bg-slate-100 text-slate-700", dot: "bg-slate-400" },
  { key: "waiting_payment", label: "Waiting Payment", color: "bg-yellow-100 text-yellow-800", dot: "bg-yellow-400" },
  { key: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-800", dot: "bg-blue-400" },
  { key: "packing", label: "Packing", color: "bg-orange-100 text-orange-800", dot: "bg-orange-400" },
  { key: "dispatched", label: "Dispatched", color: "bg-purple-100 text-purple-800", dot: "bg-purple-400" },
  { key: "delivered", label: "Delivered", color: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500" },
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

  function advance() {
    if (!nextStage) return;
    startTransition(async () => {
      await updateOrderStageAction(order.id, nextStage.key);
      router.refresh();
    });
  }

  const isUrgent = order.paymentStatus === "unpaid" && order.stage !== "new_order";

  return (
    <div
      className={`rounded-xl border bg-white p-3.5 shadow-sm transition hover:shadow-md ${
        isUrgent ? "border-red-200 ring-1 ring-red-100" : "border-slate-200"
      }`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <Link
          href={`/dashboard/orders/${order.id}`}
          className="font-semibold text-sm text-slate-900 hover:text-emerald-600 transition-colors leading-tight"
        >
          {order.customerName}
        </Link>
        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${paymentBadge(order.paymentStatus)}`}>
          {order.paymentStatus === "paid" ? "✓ Paid" : order.paymentStatus === "unpaid" ? "⚠ Unpaid" : order.paymentStatus}
        </span>
      </div>

      {/* Product */}
      <p className="text-xs text-slate-500 mb-1 truncate">{order.product}</p>

      {/* Area + Amount */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-slate-400">{order.area || "—"}</span>
        <span className="text-sm font-bold text-emerald-600">{formatTZS(order.amount)}</span>
      </div>

      {/* Advance button */}
      {nextStage && (
        <button
          onClick={advance}
          disabled={isPending}
          className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-colors disabled:opacity-50"
        >
          {isPending ? "Moving…" : `→ ${nextStage.label}`}
        </button>
      )}

      {order.stage === "delivered" && (
        <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-medium">
          <Star className="h-3 w-3" /> Delivered
        </div>
      )}
    </div>
  );
}

export function KanbanBoard({ orders }: { orders: Order[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900">Order Pipeline</h3>
        <p className="text-xs text-slate-400">Scroll sideways on mobile</p>
      </div>

      <div className="overflow-x-auto pb-3">
        <div className="flex gap-3 min-w-max">
          {STAGES.map((stage) => {
            const items = orders.filter((o) => o.stage === stage.key);
            const hasUnpaid = items.some((o) => o.paymentStatus === "unpaid");

            return (
              <div
                key={stage.key}
                className="w-[260px] shrink-0 rounded-2xl border border-slate-200 bg-slate-50"
              >
                {/* Column header */}
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${stage.dot}`} />
                    <span className="text-xs font-bold text-slate-700">{stage.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasUnpaid && <AlertCircle className="h-3 w-3 text-red-400" />}
                    <span className="rounded-full bg-white border border-slate-200 px-1.5 py-0.5 text-xs font-semibold text-slate-500">
                      {items.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="space-y-2 p-2">
                  {items.length > 0 ? (
                    items.map((order) => <OrderCard key={order.id} order={order} />)
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white/50 py-6 text-center text-xs text-slate-400">
                      Empty
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
