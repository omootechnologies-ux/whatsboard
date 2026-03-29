import { notFound } from "next/navigation";
import { getViewerContext } from "@/lib/queries";
import { formatTZS } from "@/lib/utils";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const { supabase, businessId } = await getViewerContext();
  if (!businessId) return notFound();

  const { data: order } = await supabase
    .from("orders")
    .select("id, product_name, amount, delivery_area, stage, payment_status, notes, created_at, updated_at, customers(name, phone), order_activity(action, metadata, created_at)")
    .eq("id", params.id)
    .eq("business_id", businessId)
    .single();

  if (!order) return notFound();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">{order.customers?.name}</h2>
        <p className="mt-2 text-slate-600">Track payment, dispatch, notes, and follow-up for this order.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Product</p>
          <p className="mt-1">{order.product_name}</p>
          <p className="mt-4 text-sm text-slate-500">Amount</p>
          <p className="mt-1 font-semibold text-emerald-300">{formatTZS(Number(order.amount))}</p>
          <p className="mt-4 text-sm text-slate-500">Area</p>
          <p className="mt-1">{order.delivery_area}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Stage</p>
          <p className="mt-1">{order.stage}</p>
          <p className="mt-4 text-sm text-slate-500">Payment status</p>
          <p className="mt-1">{order.payment_status}</p>
          <p className="mt-4 text-sm text-slate-500">Customer phone</p>
          <p className="mt-1">{order.customers?.phone}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-semibold">Activity</h3>
        <div className="mt-4 space-y-3">
          {(order.order_activity ?? []).map((item: any, index: number) => (
            <div key={index} className="rounded-2xl border border-slate-200 p-4">
              <p className="font-medium">{item.action}</p>
              <p className="mt-1 text-sm text-slate-500">{new Date(item.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
