import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { getLocale } from "next-intl/server";
import {
  PageHeader,
  SectionCard,
} from "@/components/whatsboard-dashboard/dashboard-ui";
import { getOrderById } from "@/lib/whatsboard-repository";
import { formatOrderReference } from "@/lib/display-labels";
import { translateUiText } from "@/lib/ui-translations";

export default async function EditOrderPage({
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
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title={`${tr("Edit Order #")}${formatOrderReference(order.id) || "WB-00000"}`}
        description={tr(
          "Update order stage, payment state, and dispatch details from one consistent editor.",
        )}
        primaryAction={
          <button
            className="wb-button-primary"
            type="submit"
            form="edit-order-form"
          >
            <Save className="h-4 w-4" />
            {tr("Save changes")}
          </button>
        }
        secondaryAction={
          <Link href={`/orders/${order.id}`} className="wb-button-secondary">
            <ArrowLeft className="h-4 w-4" />
            {tr("Back to details")}
          </Link>
        }
      />

      <SectionCard
        title={tr("Edit order fields")}
        description={tr(
          "Update this order directly in your active Supabase workspace.",
        )}
      >
        {query.error === "invalid" || query.error === "persistence" ? (
          <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            {query.error === "invalid"
              ? tr("Please provide valid values before saving.")
              : tr(
                  "Could not update order. Check your Supabase connection and try again.",
                )}
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
              {tr("Customer name")}
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
              {tr("Stage")}
            </label>
            <select
              name="stage"
              className="wb-input"
              defaultValue={order.stage}
            >
              <option value="new_order">{tr("New order")}</option>
              <option value="waiting_payment">{tr("Awaiting payment")}</option>
              <option value="paid">{tr("Paid")}</option>
              <option value="packing">{tr("Packing")}</option>
              <option value="dispatched">{tr("Dispatched")}</option>
              <option value="delivered">{tr("Delivered")}</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              {tr("Payment status")}
            </label>
            <select
              name="paymentStatus"
              className="wb-input"
              defaultValue={order.paymentStatus}
            >
              <option value="unpaid">{tr("Unpaid")}</option>
              <option value="partial">{tr("Partial")}</option>
              <option value="paid">{tr("Paid")}</option>
              <option value="cod">COD</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              {tr("Amount (TZS)")}
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
              {tr("Notes")}
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
