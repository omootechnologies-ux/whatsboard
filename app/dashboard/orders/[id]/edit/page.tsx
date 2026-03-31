import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderCatalogOptions, getViewerContext } from "@/lib/queries";
import UpdateOrderForm from "@/components/forms/update-order-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { supabase, businessId } = await getViewerContext();
  const { id } = await params;
  const catalogProducts = businessId ? await getOrderCatalogOptions() : [];

  if (!businessId) notFound();

  const { data: order } = await supabase
    .from("orders")
    .select(`
      id,
      catalog_product_id,
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
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();

  const customer = Array.isArray(order.customers) ? order.customers[0] : order.customers;

  const normalizedOrder = {
    id: order.id,
    catalog_product_id: order.catalog_product_id ?? "",
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

      <UpdateOrderForm order={normalizedOrder} catalogProducts={catalogProducts} />
    </div>
  );
}
