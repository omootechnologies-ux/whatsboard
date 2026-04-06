import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { getLocale } from "next-intl/server";
import {
  PageHeader,
  SectionCard,
} from "@/components/whatsboard-dashboard/dashboard-ui";
import { listFollowUps } from "@/lib/whatsboard-repository";
import { translateUiText } from "@/lib/ui-translations";

export default async function EditFollowUpPage({
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
  const followUp = (await listFollowUps()).find((item) => item.id === id);

  if (!followUp) {
    notFound();
  }

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title={tr("Edit follow-up")}
        description={tr(
          "Update due date, status, priority, and notes for this reminder.",
        )}
        primaryAction={
          <button
            className="wb-button-primary"
            type="submit"
            form="edit-followup-form"
          >
            <Save className="h-4 w-4" />
            {tr("Save changes")}
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
        description={tr("Keep this reminder accurate so no customer drops off.")}
      >
        {query.error === "invalid" || query.error === "persistence" ? (
          <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            {query.error === "invalid"
              ? tr("Please provide title, due date, and note.")
              : tr(
                  "Could not update follow-up. Check your Supabase connection and try again.",
                )}
          </div>
        ) : null}

        <form
          id="edit-followup-form"
          action={`/api/follow-ups/${followUp.id}`}
          method="post"
          className="grid gap-4 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              {tr("Title")}
            </label>
            <input
              name="title"
              required
              className="wb-input"
              defaultValue={followUp.title}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              {tr("Due date")}
            </label>
            <input
              name="dueAt"
              required
              className="wb-input"
              type="date"
              defaultValue={followUp.dueAt.slice(0, 10)}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              {tr("Priority")}
            </label>
            <select
              name="priority"
              className="wb-input"
              defaultValue={followUp.priority}
            >
              <option value="high">{tr("High")}</option>
              <option value="medium">{tr("Medium")}</option>
              <option value="low">{tr("Low")}</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              {tr("Status")}
            </label>
            <select
              name="status"
              className="wb-input"
              defaultValue={followUp.status === "completed" ? "completed" : ""}
            >
              <option value="">{tr("Open (auto from due date)")}</option>
              <option value="completed">{tr("Completed")}</option>
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
              defaultValue={followUp.note}
            />
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
