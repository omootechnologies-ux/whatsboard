import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { getLocale } from "next-intl/server";
import {
  PageHeader,
  SectionCard,
} from "@/components/whatsboard-dashboard/dashboard-ui";
import {
  formatOrderReference,
  getPrimaryOrderLabel,
} from "@/lib/display-labels";
import { listOrders } from "@/lib/whatsboard-repository";
import { translateUiText } from "@/lib/ui-translations";

type NewFollowUpSearchParams = Promise<{ error?: string }>;

export default async function NewFollowUpPage({
  searchParams,
}: {
  searchParams: NewFollowUpSearchParams;
}) {
  const query = await searchParams;
  const locale = await getLocale();
  const tr = (value: string) => translateUiText(value, locale as "en" | "sw");
  const orderOptions = (await listOrders()).slice(0, 200);

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title={tr("Create follow-up")}
        description={tr(
          "Schedule a reminder so no customer slips through chat noise.",
        )}
        primaryAction={
          <button
            className="wb-button-primary"
            type="submit"
            form="create-followup-form"
          >
            <Save className="h-4 w-4" />
            {tr("Save follow-up")}
          </button>
        }
        secondaryAction={
          <Link href="/follow-ups" className="wb-button-secondary">
            <ArrowLeft className="h-4 w-4" />
            {tr("Back to follow-ups")}
          </Link>
        }
      />

      <SectionCard
        title={tr("Follow-up details")}
        description={tr(
          "Schedule and save reminders directly to your active Supabase workspace.",
        )}
      >
        {query.error === "invalid" || query.error === "persistence" ? (
          <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            {query.error === "invalid"
              ? tr("Please provide customer name, due date, and note.")
              : tr(
                  "Could not save follow-up. Check your Supabase connection and try again.",
                )}
          </div>
        ) : null}
        <form
          id="create-followup-form"
          action="/api/follow-ups"
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
              placeholder="Neema Kileo"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              {tr("Link order (optional)")}
            </label>
            <select name="orderId" className="wb-input" defaultValue="">
              <option value="">{tr("No linked order")}</option>
              {orderOptions.map((order) => (
                <option key={order.id} value={order.id}>
                  #{formatOrderReference(order.id) || "WB-00000"} •{" "}
                  {getPrimaryOrderLabel({
                    customerName: order.customerName,
                    customerPhone: order.customerPhone,
                    orderId: order.id,
                  })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              {tr("Due date")}
            </label>
            <input name="dueAt" required className="wb-input" type="date" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              {tr("Priority")}
            </label>
            <select name="priority" className="wb-input" defaultValue="medium">
              <option value="high">{tr("High")}</option>
              <option value="medium">{tr("Medium")}</option>
              <option value="low">{tr("Low")}</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              {tr("Note")}
            </label>
            <textarea
              name="note"
              required
              className="wb-textarea"
              placeholder={tr(
                "Send pink bundle photos before payment confirmation.",
              )}
            />
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
