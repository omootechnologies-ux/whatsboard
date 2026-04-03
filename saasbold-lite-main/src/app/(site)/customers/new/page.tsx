import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import {
  PageHeader,
  SectionCard,
} from "@/components/whatsboard-dashboard/dashboard-ui";

type NewCustomerSearchParams = Promise<{ error?: string }>;

export default async function NewCustomerPage({
  searchParams,
}: {
  searchParams: NewCustomerSearchParams;
}) {
  const query = await searchParams;

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title="Add customer"
        description="Create a customer record so repeat orders and follow-ups stay organized."
        primaryAction={
          <button
            className="wb-button-primary"
            type="submit"
            form="create-customer-form"
          >
            <Save className="h-4 w-4" />
            Save customer
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
        description="Create and save a customer profile in your active Supabase workspace."
      >
        {query.error === "invalid" || query.error === "persistence" ? (
          <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            {query.error === "invalid"
              ? "Please complete all required fields."
              : "Could not save customer. Check your Supabase connection and try again."}
          </div>
        ) : null}
        <form
          id="create-customer-form"
          action="/api/customers"
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
              placeholder="Amina Mushi"
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
              placeholder="+255 754 000 000"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              WhatsApp number
            </label>
            <input
              name="whatsappNumber"
              className="wb-input"
              placeholder="+255 754 000 000"
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
              placeholder="Dar es Salaam"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              Source channel
            </label>
            <select name="sourceChannel" className="wb-input" defaultValue="WhatsApp">
              <option value="WhatsApp">WhatsApp</option>
              <option value="Instagram">Instagram</option>
              <option value="Facebook">Facebook</option>
              <option value="TikTok">TikTok</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              Customer status
            </label>
            <select name="status" className="wb-input" defaultValue="active">
              <option value="active">Active</option>
              <option value="waiting">Waiting</option>
              <option value="vip">VIP</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              Private notes
            </label>
            <textarea
              name="notes"
              className="wb-textarea"
              placeholder="Notes about preferences, payment behavior, or delivery details."
            />
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
