import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Users } from "lucide-react";
import { getDashboardWriteAccess, requireDashboardFeatureAccess } from "@/lib/dashboard-access";
import { getViewerContext } from "@/lib/queries";
import { updateCustomerAction } from "@/app/dashboard/actions";
import EditCustomerForm from "@/components/forms/edit-customer-form";
import {
  DashboardActionLink,
  DashboardHero,
  DashboardPage,
  DashboardPanel,
  DashboardPanelHeader,
  DashboardStatCard,
} from "@/components/dashboard/page-primitives";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireDashboardFeatureAccess("customers");
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
    <DashboardPage>
      <DashboardHero
        eyebrow="Customers"
        title={`Edit ${customer.name || "customer"} record`}
        description="Keep customer details aligned with the rest of the workspace so follow-ups and repeat-order tracking stay reliable."
        actions={
          <DashboardActionLink href="/dashboard/customers">
            <ArrowLeft className="h-4 w-4" />
            Back to customers
          </DashboardActionLink>
        }
        aside={
          <div className="grid gap-3">
            <DashboardStatCard
              label="Current phone"
              value={customer.phone || "Not set"}
              detail="Primary contact saved for this customer"
              icon={<Phone className="h-5 w-5" />}
            />
            <DashboardStatCard
              label="Status"
              value={customer.status || "active"}
              detail="Current customer record status"
              icon={<Users className="h-5 w-5" />}
            />
          </div>
        }
      />

      <DashboardPanel>
        <DashboardPanelHeader
          eyebrow="Customer form"
          title="Customer details"
          description="Update contact and location details from the same unified dashboard form system."
        />
        <div className="mt-5">
          <EditCustomerForm customer={customer} action={updateCustomerAction.bind(null, customer.id)} canManageRecords={canManageRecords} />
        </div>
      </DashboardPanel>
    </DashboardPage>
  );
}
