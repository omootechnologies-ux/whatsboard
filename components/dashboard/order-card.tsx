import { Order } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { formatTZS } from "@/lib/utils";

export function OrderCard({ order }: { order: Order }) {
  return (
    <Card className="space-y-3 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="truncate font-medium text-slate-900">{order.customerName}</h4>
          <p className="truncate text-sm text-slate-500">{order.phone}</p>
        </div>
        <div className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs capitalize text-slate-700">{order.paymentStatus}</div>
      </div>
      <div className="min-w-0">
        <p className="line-clamp-2 text-sm text-slate-800">{order.product}</p>
        <p className="mt-1 truncate text-sm text-slate-500">{order.area}</p>
      </div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-emerald-600">{formatTZS(order.amount)}</span>
        <span className="truncate text-right text-slate-500">{new Date(order.updatedAt).toLocaleTimeString()}</span>
      </div>
    </Card>
  );
}
