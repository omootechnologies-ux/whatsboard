import { ORDER_STAGES } from "@/lib/constants";
import { Order } from "@/lib/types";
import { OrderCard } from "./order-card";

export function KanbanBoard({ orders }: { orders: Order[] }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Order pipeline</h3>
        <p className="text-sm text-slate-500">Swipe on mobile or scroll horizontally to see every stage clearly.</p>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max gap-4">
          {ORDER_STAGES.map((stage) => {
            const items = orders.filter((order) => order.stage === stage.key);
            return (
              <div key={stage.key} className="w-[280px] shrink-0 rounded-3xl border border-slate-200 bg-slate-50 p-3 sm:w-[300px] lg:w-[320px]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-800">{stage.label}</h3>
                  <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600">{items.length}</span>
                </div>
                <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
                  {items.length ? items.map((order) => <OrderCard key={order.id} order={order} />) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-400">No orders here</div>
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
