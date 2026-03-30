import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UpdateOrderForm from "@/components/forms/update-order-form";

export default async function EditOrderPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-600">
          Edit order
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
          Update order details
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Change customer info, amount, stage, payment status, and notes.
        </p>
      </div>

      <UpdateOrderForm order={order} />
    </div>
  );
}
