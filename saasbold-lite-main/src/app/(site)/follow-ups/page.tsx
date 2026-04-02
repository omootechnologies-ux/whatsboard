import Link from "next/link";
import { Bell } from "lucide-react";
import {
  EmptyState,
  FilterToolbar,
  FollowUpCard,
  KpiCard,
  PageHeader,
  SectionCard,
} from "@/components/whatsboard-dashboard/dashboard-ui";
import { listFollowUps } from "@/lib/whatsboard-repository";
import {
  formatOrderReference,
  getPrimaryOrderLabel,
} from "@/lib/display-labels";

type FollowUpsPageSearchParams = Promise<{
  search?: string;
  status?: string;
  created?: string;
}>;

export default async function FollowUpsPage({
  searchParams,
}: {
  searchParams: FollowUpsPageSearchParams;
}) {
  const query = await searchParams;
  const records = await listFollowUps({
    search: query.search,
    status: query.status,
  });
  const overdue = records.filter((item) => item.status === "overdue");
  const today = records.filter((item) => item.status === "today");
  const upcoming = records.filter((item) => item.status === "upcoming");
  const completed = records.filter((item) => item.status === "completed");

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title="Follow-ups"
        description="Action center for overdue reminders, today’s callbacks, and upcoming customer tasks."
        primaryAction={
          <Link href="/follow-ups/new" className="wb-button-primary">
            <Bell className="h-4 w-4" />
            Add Follow-up
          </Link>
        }
      />

      {query.created === "1" ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
          Follow-up created successfully.
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        <KpiCard
          label="Overdue"
          value={String(overdue.length)}
          detail="Urgent tasks likely leaking revenue."
        />
        <KpiCard
          label="Today"
          value={String(today.length)}
          detail="Follow-ups that should close today."
        />
        <KpiCard
          label="Upcoming"
          value={String(upcoming.length)}
          detail="Next queued reminders in the pipeline."
        />
        <KpiCard
          label="Completed"
          value={String(completed.length)}
          detail="Tasks already closed and logged."
        />
      </section>

      <FilterToolbar
        searchPlaceholder="Search by customer, order, note, or priority"
        chips={[
          { key: "status", label: "All statuses" },
          { key: "status", label: "Overdue", value: "overdue" },
          { key: "status", label: "Today", value: "today" },
          { key: "status", label: "Upcoming", value: "upcoming" },
          { key: "status", label: "Completed", value: "completed" },
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          title="Overdue + Today"
          description="Handle these first to protect conversion and trust."
        >
          <div className="space-y-3">
            {[...overdue, ...today].length ? (
              [...overdue, ...today].map((item) => (
                <FollowUpCard key={item.id} item={item} />
              ))
            ) : (
              <EmptyState
                title="No urgent follow-ups"
                detail="Nothing overdue or due today."
              />
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Upcoming queue"
          description="Planned reminders and scheduled customer callbacks."
        >
          <div className="space-y-3">
            {upcoming.length ? (
              upcoming.map((item) => <FollowUpCard key={item.id} item={item} />)
            ) : (
              <EmptyState
                title="No upcoming follow-ups"
                detail="Create a follow-up to keep your pipeline warm."
                action={
                  <Link href="/follow-ups/new" className="wb-button-secondary">
                    Add follow-up
                  </Link>
                }
              />
            )}
          </div>
        </SectionCard>
      </section>

      <SectionCard
        title="Completed follow-ups"
        description="Recently completed reminders and outcomes."
      >
        <div className="space-y-3">
          {completed.length ? (
            completed.map((item) => (
              <div
                key={item.id}
                className="rounded-[24px] border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[var(--color-wb-text)]">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
                      {getPrimaryOrderLabel({
                        customerName: item.customerName,
                        orderId: item.orderId,
                        kind: "customer",
                      })}
                    </p>
                  </div>
                  <Link
                    href={item.orderId ? `/orders/${item.orderId}` : "/orders"}
                    className="text-sm font-semibold text-[var(--color-wb-primary)] hover:underline"
                  >
                    {item.orderId
                      ? `Open order #${formatOrderReference(item.orderId) || "WB-00000"}`
                      : "Open orders"}
                  </Link>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--color-wb-text-muted)]">
                  {item.note}
                </p>
              </div>
            ))
          ) : (
            <EmptyState
              title="No completed follow-ups yet"
              detail="Completed reminders will appear here."
            />
          )}
        </div>
      </SectionCard>
    </div>
  );
}
