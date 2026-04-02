import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import {
  PageHeader,
  SectionCard,
} from "@/components/whatsboard-dashboard/dashboard-ui";

export default function NewPaymentPage() {
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
        description="Designed to map directly to payment capture endpoints."
      >
        <form
          id="create-payment-form"
          action="/api/payments"
          method="post"
          className="grid gap-4 sm:grid-cols-2"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              Order ID
            </label>
            <input
              name="orderId"
              required
              className="wb-input"
              placeholder="WB-3401"
            />
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
