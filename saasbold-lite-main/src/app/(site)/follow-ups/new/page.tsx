import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/whatsboard-dashboard/dashboard-ui";

export default function NewFollowUpPage() {
  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title="Create follow-up"
        description="Schedule a reminder so no customer slips through chat noise."
        primaryAction={
          <button className="wb-button-primary" type="submit" form="create-followup-form">
            <Save className="h-4 w-4" />
            Save follow-up
          </button>
        }
        secondaryAction={
          <Link href="/follow-ups" className="wb-button-secondary">
            <ArrowLeft className="h-4 w-4" />
            Back to follow-ups
          </Link>
        }
      />

      <SectionCard title="Follow-up details" description="Ready to connect with backend reminder scheduling.">
        <form id="create-followup-form" action="/api/follow-ups" method="post" className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">Customer name</label>
            <input name="customerName" required className="wb-input" placeholder="Neema Kileo" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">Order ID (optional)</label>
            <input name="orderId" className="wb-input" placeholder="WB-3403" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">Due date</label>
            <input name="dueAt" required className="wb-input" type="date" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">Priority</label>
            <select name="priority" className="wb-input" defaultValue="medium">
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">Note</label>
            <textarea name="note" required className="min-h-[120px] w-full rounded-2xl border border-[var(--color-wb-border)] bg-white px-4 py-3 text-sm text-[var(--color-wb-text)]" placeholder="Send pink bundle photos before payment confirmation." />
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
