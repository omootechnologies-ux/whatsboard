import Link from "next/link";
import { notFound } from "next/navigation";
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
import { listOrders, listPayments } from "@/lib/whatsboard-repository";

export default async function EditPaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const [payments, orders] = await Promise.all([listPayments(), listOrders()]);
  const payment = payments.find((item) => item.id === id);

  if (!payment) {
    notFound();
  }

  const orderOptions = orders.slice(0, 200);
  const currentOrderId = payment.orderId || payment.suggestedOrderId || "";
  const hasCurrentOrder = currentOrderId
    ? orderOptions.some((order) => order.id === currentOrderId)
    : false;

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title="Edit payment"
        description="Update payment method, reference, amount, and status."
        primaryAction={
          <button
            className="wb-button-primary"
            type="submit"
            form="edit-payment-form"
          >
            <Save className="h-4 w-4" />
            Save changes
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
        description="Keep transaction records clean and traceable."
      >
        {query.error === "invalid" || query.error === "persistence" ? (
          <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            {query.error === "invalid"
              ? "Please complete all required payment fields."
              : "Could not update payment. Check your Supabase connection and try again."}
          </div>
        ) : null}

        <form
          id="edit-payment-form"
          action={`/api/payments/${payment.id}`}
          method="post"
          className="grid gap-4 sm:grid-cols-2"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              Order
            </label>
            <select
              name="orderId"
              required
              className="wb-input"
              defaultValue={currentOrderId}
            >
              {currentOrderId && !hasCurrentOrder ? (
                <option value={currentOrderId}>
                  #{formatOrderReference(currentOrderId) || "WB-00000"} •
                  Current linked
                </option>
              ) : null}
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
              defaultValue={String(payment.amount)}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              Method
            </label>
            <select
              name="method"
              className="wb-input"
              defaultValue={payment.method}
            >
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
            <select
              name="status"
              className="wb-input"
              defaultValue={payment.status}
            >
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
              defaultValue={payment.reference}
            />
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
