import Link from "next/link";
import { Bell } from "lucide-react";
import { FilterToolbar, FollowUpCard, KpiCard, PageHeader, SectionCard } from "@/components/whatsboard-dashboard/dashboard-ui";
import { listFollowUps } from "@/lib/whatsboard-repository";

type FollowUpsPageSearchParams = Promise<{
  search?: string;
  status?: string;
}>;

export default async function FollowUpsPage({
  searchParams,
}: {
  searchParams: FollowUpsPageSearchParams;
}) {
  const query = await searchParams;
  const records = listFollowUps({
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

      <section className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Overdue" value={String(overdue.length)} detail="Urgent tasks likely leaking revenue." />
        <KpiCard label="Today" value={String(today.length)} detail="Follow-ups that should close today." />
        <KpiCard label="Upcoming" value={String(upcoming.length)} detail="Next queued reminders in the pipeline." />
        <KpiCard label="Completed" value={String(completed.length)} detail="Tasks already closed and logged." />
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
        <SectionCard title="Overdue + Today" description="Handle these first to protect conversion and trust.">
          <div className="space-y-3">
            {[...overdue, ...today].map((item) => (
              <FollowUpCard key={item.id} item={item} />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Upcoming queue" description="Planned reminders and scheduled customer callbacks.">
          <div className="space-y-3">
            {upcoming.map((item) => (
              <FollowUpCard key={item.id} item={item} />
            ))}
          </div>
        </SectionCard>
      </section>

      <SectionCard title="Completed follow-ups" description="Recently completed reminders and outcomes.">
        <div className="space-y-3">
          {completed.map((item) => (
            <div key={item.id} className="rounded-[24px] border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-[var(--color-wb-text)]">{item.title}</p>
                  <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">{item.customerName}</p>
                </div>
                <Link href={item.orderId ? `/orders/${item.orderId}` : "/orders"} className="text-sm font-semibold text-[var(--color-wb-primary)] hover:underline">
                  Open order
                </Link>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--color-wb-text-muted)]">{item.note}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
