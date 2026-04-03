import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import {
  PageHeader,
  SectionCard,
} from "@/components/whatsboard-dashboard/dashboard-ui";
import { getOrderById } from "@/lib/whatsboard-repository";
import { formatOrderReference } from "@/lib/display-labels";

export default async function EditOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title={`Edit Order #${formatOrderReference(order.id) || "WB-00000"}`}
        description="Update order stage, payment state, and dispatch details from one consistent editor."
        primaryAction={
          <button
            className="wb-button-primary"
            type="submit"
            form="edit-order-form"
          >
            <Save className="h-4 w-4" />
            Save changes
          </button>
        }
        secondaryAction={
          <Link href={`/orders/${order.id}`} className="wb-button-secondary">
            <ArrowLeft className="h-4 w-4" />
            Back to details
          </Link>
        }
      />

      <SectionCard
        title="Edit order fields"
        description="Update this order directly in your active Supabase workspace."
      >
        {query.error === "invalid" || query.error === "persistence" ? (
          <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            {query.error === "invalid"
              ? "Please provide valid values before saving."
              : "Could not update order. Check your Supabase connection and try again."}
          </div>
        ) : null}
        <form
          id="edit-order-form"
          action={`/api/orders/${order.id}`}
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
              defaultValue={order.customerName}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              Stage
            </label>
            <select
              name="stage"
              className="wb-input"
              defaultValue={order.stage}
            >
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
              defaultValue={order.paymentStatus}
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
              defaultValue={String(order.amount)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              Notes
            </label>
            <textarea
              name="notes"
              className="wb-textarea"
              defaultValue={order.notes}
            />
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
