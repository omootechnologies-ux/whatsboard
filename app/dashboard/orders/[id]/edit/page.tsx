import Link from "next/link";
import { notFound } from "next/navigation";
import { getViewerContext } from "@/lib/queries";
import UpdateOrderForm from "@/components/forms/update-order-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditOrderPage({
  params,
}: {
  params: { id: string };
}) {
  const { supabase, businessId } = await getViewerContext();

  if (!businessId) notFound();

  const { data: order } = await supabase
    .from("orders")
    .select(`
      id,
      product_name,
      amount,
      delivery_area,
      stage,
      payment_status,
      notes,
      customer_id,
      customers(id, name, phone)
    `)
    .eq("business_id", businessId)
    .eq("id", params.id)
    .maybeSingle();

  if (!order) notFound();

  const customer = Array.isArray(order.customers) ? order.customers[0] : order.customers;

  const normalizedOrder = {
    id: order.id,
    customer_name: customer?.name ?? "",
    phone: customer?.phone ?? "",
    product_name: order.product_name ?? "",
    amount: order.amount ?? 0,
    delivery_area: order.delivery_area ?? "",
    stage: order.stage ?? "new_order",
    payment_status: order.payment_status ?? "unpaid",
    notes: order.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-600">Orders</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Edit order</h1>
        </div>
        <Link
          href="/dashboard/orders"
          className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Back
        </Link>
      </div>

      <UpdateOrderForm order={normalizedOrder} />
    </div>
  );
}
