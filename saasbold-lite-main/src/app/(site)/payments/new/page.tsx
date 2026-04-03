import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import {
  PageHeader,
  SectionCard,
} from "@/components/whatsboard-dashboard/dashboard-ui";
import { formatCurrency } from "@/components/whatsboard-dashboard/formatting";
import {
  formatOrderReference,
  getPrimaryOrderLabel,
} from "@/lib/display-labels";
import { listOrders } from "@/lib/whatsboard-repository";

type NewPaymentSearchParams = Promise<{ error?: string }>;

export default async function NewPaymentPage({
  searchParams,
}: {
  searchParams: NewPaymentSearchParams;
}) {
  const query = await searchParams;
  const orderOptions = (await listOrders()).slice(0, 200);

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title="Record payment"
        description="Capture payment confirmation against an order in a clean, auditable flow."
        primaryAction={
          <button
            className="wb-button-primary"
            type="submit"
            form="create-payment-form"
          >
            <Save className="h-4 w-4" />
            Save payment
          </button>
        }
        secondaryAction={
          <Link href="/payments" className="wb-button-secondary">
            <ArrowLeft className="h-4 w-4" />
            Back to payments
          </Link>
        }
      />

      <SectionCard
        title="Payment details"
        description="Record payment transactions directly in your active Supabase workspace."
      >
        {query.error === "invalid" || query.error === "persistence" ? (
          <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            {query.error === "invalid"
              ? "Please complete all required payment fields."
              : "Could not save payment. Verify the selected order and Supabase connection, then try again."}
          </div>
        ) : null}
        <form
          id="create-payment-form"
          action="/api/payments"
          method="post"
          className="grid gap-4 sm:grid-cols-2"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              Order
            </label>
            <select name="orderId" required className="wb-input">
              <option value="">Select order</option>
              {orderOptions.map((order) => (
                <option key={order.id} value={order.id}>
                  #{formatOrderReference(order.id) || "WB-00000"} •{" "}
                  {getPrimaryOrderLabel({
                    customerName: order.customerName,
                    customerPhone: order.customerPhone,
                    orderId: order.id,
                  })}{" "}
                  • {formatCurrency(order.amount)}
                </option>
              ))}
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
              Method
            </label>
            <select name="method" className="wb-input" defaultValue="M-Pesa">
              <option value="M-Pesa">M-Pesa</option>
              <option value="Tigopesa">Tigopesa</option>
              <option value="Airtel Money">Airtel Money</option>
              <option value="Bank">Bank</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              Status
            </label>
            <select name="status" className="wb-input" defaultValue="paid">
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="unpaid">Unpaid</option>
              <option value="cod">COD</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              Reference
            </label>
            <input
              name="reference"
              required
              className="wb-input"
              placeholder="MPESA-8831"
            />
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
