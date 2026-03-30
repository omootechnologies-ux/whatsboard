import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CustomerForm from "@/components/forms/customer-form";

export default async function EditCustomerPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: customer, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !customer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-600">
          Edit customer
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
          Update customer details
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Edit phone, area, notes, and preferred channel.
        </p>
      </div>

      <CustomerForm customer={customer} />
    </div>
  );
}
