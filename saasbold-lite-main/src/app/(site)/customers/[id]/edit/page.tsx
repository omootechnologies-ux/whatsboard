import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { getLocale } from "next-intl/server";
import {
  PageHeader,
  SectionCard,
} from "@/components/whatsboard-dashboard/dashboard-ui";
import { getCustomerById } from "@/lib/whatsboard-repository";
import { getPrimaryOrderLabel } from "@/lib/display-labels";
import { translateUiText } from "@/lib/ui-translations";

export default async function EditCustomerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const locale = await getLocale();
  const tr = (value: string) => translateUiText(value, locale as "en" | "sw");
  const customer = await getCustomerById(id);

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title={`${tr("Edit")} ${getPrimaryOrderLabel({
          customerName: customer.name,
          customerPhone: customer.phone,
          kind: "customer",
        })}`}
        description={tr(
          "Update customer details and keep phone, location, and status in sync.",
        )}
        primaryAction={
          <button
            className="wb-button-primary"
            type="submit"
            form="edit-customer-form"
          >
            <Save className="h-4 w-4" />
            {tr("Save changes")}
          </button>
        }
        secondaryAction={
          <Link href={`/customers/${customer.id}`} className="wb-button-secondary">
            <ArrowLeft className="h-4 w-4" />
            {tr("Back to profile")}
          </Link>
        }
      />

      <SectionCard
        title={tr("Customer profile")}
        description={tr("Update this customer record in your active workspace.")}
      >
        {query.error === "invalid" || query.error === "persistence" ? (
          <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            {query.error === "invalid"
              ? tr("Please complete all required fields.")
              : tr(
                  "Could not update customer. Check your Supabase connection and try again.",
                )}
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
              {tr("Full name")}
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
              {tr("Phone number")}
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
              {tr("WhatsApp number")}
            </label>
            <input
              name="whatsappNumber"
              className="wb-input"
              defaultValue={customer.whatsappNumber || customer.phone}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              {tr("Location")}
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
              {tr("Source channel")}
            </label>
            <select
              name="sourceChannel"
              className="wb-input"
              defaultValue={customer.sourceChannel || "Unknown"}
            >
              <option value="WhatsApp">WhatsApp</option>
              <option value="Instagram">Instagram</option>
              <option value="Facebook">Facebook</option>
              <option value="TikTok">TikTok</option>
              <option value="Unknown">{tr("Unknown")}</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              {tr("Status")}
            </label>
            <select
              name="status"
              className="wb-input"
              defaultValue={customer.status}
            >
              <option value="active">{tr("Active")}</option>
              <option value="waiting">{tr("Waiting")}</option>
              <option value="vip">VIP</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              {tr("Private notes")}
            </label>
            <textarea
              name="notes"
              className="wb-textarea"
              defaultValue={customer.notes || ""}
            />
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
