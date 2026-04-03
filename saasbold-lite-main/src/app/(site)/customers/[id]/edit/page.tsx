import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import {
  PageHeader,
  SectionCard,
} from "@/components/whatsboard-dashboard/dashboard-ui";
import { getCustomerById } from "@/lib/whatsboard-repository";
import { getPrimaryOrderLabel } from "@/lib/display-labels";

export default async function EditCustomerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const customer = await getCustomerById(id);

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title={`Edit ${getPrimaryOrderLabel({
          customerName: customer.name,
          customerPhone: customer.phone,
          kind: "customer",
        })}`}
        description="Update customer details and keep phone, location, and status in sync."
        primaryAction={
          <button
            className="wb-button-primary"
            type="submit"
            form="edit-customer-form"
          >
            <Save className="h-4 w-4" />
            Save changes
          </button>
        }
        secondaryAction={
          <Link href="/customers" className="wb-button-secondary">
            <ArrowLeft className="h-4 w-4" />
            Back to customers
          </Link>
        }
      />

      <SectionCard
        title="Customer profile"
        description="Update this customer record in your active workspace."
      >
        {query.error === "invalid" || query.error === "persistence" ? (
          <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            {query.error === "invalid"
              ? "Please complete all required fields."
              : "Could not update customer. Check your Supabase connection and try again."}
          </div>
        ) : null}

        <form
          id="edit-customer-form"
          action={`/api/customers/${customer.id}`}
          method="post"
          className="grid gap-4 sm:grid-cols-2"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              Full name
            </label>
            <input
              name="name"
              required
              className="wb-input"
              defaultValue={customer.name}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              Phone number
            </label>
            <input
              name="phone"
              required
              className="wb-input"
              defaultValue={customer.phone}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              Location
            </label>
            <input
              name="location"
              required
              className="wb-input"
              defaultValue={customer.location}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              Status
            </label>
            <select
              name="status"
              className="wb-input"
              defaultValue={customer.status}
            >
              <option value="active">Active</option>
              <option value="waiting">Waiting</option>
              <option value="vip">VIP</option>
            </select>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
