import Link from "next/link";
import { notFound } from "next/navigation";
import { getDashboardWriteAccess } from "@/lib/dashboard-access";
import { getViewerContext } from "@/lib/queries";
import { updateCustomerAction } from "@/app/dashboard/actions";
import EditCustomerForm from "@/components/forms/edit-customer-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { canManageRecords } = await getDashboardWriteAccess();
  const { supabase, businessId } = await getViewerContext();
  const { id } = await params;

  if (!businessId) notFound();

  const { data: customer } = await supabase
    .from("customers")
    .select("id, name, phone, area, notes, status")
    .eq("business_id", businessId)
    .eq("id", id)
    .maybeSingle();

  if (!customer) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-600">Customers</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Edit customer</h1>
        </div>
        <Link
          href="/dashboard/customers"
          className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Back
        </Link>
      </div>

      <EditCustomerForm customer={customer} action={updateCustomerAction.bind(null, customer.id)} canManageRecords={canManageRecords} />
    </div>
  );
}
