import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import {
  PageHeader,
  SectionCard,
} from "@/components/whatsboard-dashboard/dashboard-ui";

type NewOrderSearchParams = Promise<{ error?: string }>;

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: NewOrderSearchParams;
}) {
  const query = await searchParams;
  const hasError =
    query.error === "invalid" ||
    query.error === "persistence" ||
    query.error === "order-limit";

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title="Create order"
        description="Capture a new sale from WhatsApp or social chat in one clean flow."
        primaryAction={
          <button
            className="wb-button-primary"
            type="submit"
            form="create-order-form"
          >
            <Save className="h-4 w-4" />
            Save order
          </button>
        }
        secondaryAction={
          <Link href="/orders" className="wb-button-secondary">
            <ArrowLeft className="h-4 w-4" />
            Back to orders
          </Link>
        }
      />

      <SectionCard
        title="Order details"
        description="Save directly to your active Supabase workspace."
      >
        {hasError ? (
          <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            {query.error === "invalid"
              ? "Please fill all required fields with valid values."
              : query.error === "order-limit"
                ? "Free plan monthly order limit reached (30). Upgrade your plan on Billing to continue creating new orders."
              : "Could not create order. Check your Supabase connection and try again."}
          </div>
        ) : null}

        <form
          id="create-order-form"
          action="/api/orders"
          method="post"
          className="grid gap-4 sm:grid-cols-2"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              Customer name
            </label>
            <input
              name="customerName"
              required
              className="wb-input"
              placeholder="Amina Mushi"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              Customer phone
            </label>
            <input
              name="customerPhone"
              className="wb-input"
              placeholder="+255 754 000 000"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              Channel
            </label>
            <select name="channel" className="wb-input" defaultValue="WhatsApp">
              <option>WhatsApp</option>
              <option>Instagram</option>
              <option>TikTok</option>
              <option>Facebook</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              Stage
            </label>
            <select name="stage" className="wb-input" defaultValue="new_order">
              <option value="new_order">New order</option>
              <option value="waiting_payment">Awaiting payment</option>
              <option value="paid">Paid</option>
              <option value="packing">Packing</option>
              <option value="dispatched">Dispatched</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              Payment status
            </label>
            <select
              name="paymentStatus"
              className="wb-input"
              defaultValue="unpaid"
            >
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="cod">COD</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              Amount (TZS)
            </label>
            <input
              name="amount"
              required
              type="number"
              min="1"
              className="wb-input"
              placeholder="85000"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              Delivery area
            </label>
            <input
              name="deliveryArea"
              required
              className="wb-input"
              placeholder="Dar es Salaam"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              Items (comma separated)
            </label>
            <textarea
              name="items"
              className="wb-textarea"
              placeholder="2x Ankara set, 1x delivery fee"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              Notes
            </label>
            <textarea
              name="notes"
              className="wb-textarea"
              placeholder="Customer asked for fast courier option."
            />
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
