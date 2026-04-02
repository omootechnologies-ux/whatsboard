import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/whatsboard-dashboard/dashboard-ui";

export default function NewOrderPage() {
  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title="Create order"
        description="Capture a new sale from WhatsApp or social chat in one clean flow."
        primaryAction={
          <button className="wb-button-primary" type="submit" form="create-order-form">
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

      <SectionCard title="Order details" description="This form is wired as a reusable UI flow and can be connected to backend create-order APIs.">
        <form id="create-order-form" action="/api/orders" method="post" className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">Customer name</label>
            <input name="customerName" required className="wb-input" placeholder="Amina Mushi" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">Customer phone</label>
            <input name="customerPhone" className="wb-input" placeholder="+255 754 000 000" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">Channel</label>
            <select name="channel" className="wb-input" defaultValue="WhatsApp">
              <option>WhatsApp</option>
              <option>Instagram</option>
              <option>TikTok</option>
              <option>Facebook</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">Stage</label>
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
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">Payment status</label>
            <select name="paymentStatus" className="wb-input" defaultValue="unpaid">
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="cod">COD</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">Amount (TZS)</label>
            <input name="amount" required type="number" min="1" className="wb-input" placeholder="85000" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">Delivery area</label>
            <input name="deliveryArea" required className="wb-input" placeholder="Dar es Salaam" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">Items (comma separated)</label>
            <textarea name="items" className="min-h-[120px] w-full rounded-2xl border border-[var(--color-wb-border)] bg-white px-4 py-3 text-sm text-[var(--color-wb-text)]" placeholder="2x Ankara set, 1x delivery fee" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">Notes</label>
            <textarea name="notes" className="min-h-[110px] w-full rounded-2xl border border-[var(--color-wb-border)] bg-white px-4 py-3 text-sm text-[var(--color-wb-text)]" placeholder="Customer asked for fast courier option." />
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
