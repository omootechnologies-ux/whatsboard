import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/whatsboard-dashboard/dashboard-ui";

export default function NewCustomerPage() {
  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title="Add customer"
        description="Create a customer record so repeat orders and follow-ups stay organized."
        primaryAction={
          <button className="wb-button-primary" type="submit" form="create-customer-form">
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

      <SectionCard title="Customer profile" description="Reusable form structure ready for backend create-customer endpoints.">
        <form id="create-customer-form" action="/api/customers" method="post" className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">Full name</label>
            <input name="name" required className="wb-input" placeholder="Amina Mushi" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">Phone number</label>
            <input name="phone" required className="wb-input" placeholder="+255 754 000 000" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">Location</label>
            <input name="location" required className="wb-input" placeholder="Dar es Salaam" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">Customer status</label>
            <select name="status" className="wb-input" defaultValue="active">
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
