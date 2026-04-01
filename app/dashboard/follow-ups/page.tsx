import Link from "next/link";
import { BellRing, Pencil } from "lucide-react";
import { requireDashboardFeatureAccess } from "@/lib/dashboard-access";
import { getFollowUpsData } from "@/lib/queries";
import {
  DashboardActionLink,
  DashboardBadge,
  DashboardEmptyState,
  DashboardHero,
  DashboardPage,
  DashboardPanel,
  DashboardPanelHeader,
} from "@/components/dashboard/page-primitives";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FollowUpsPage() {
  await requireDashboardFeatureAccess("followUps");
  const followUps = await getFollowUpsData();
  const pendingCount = followUps.filter((item) => !item.completed).length;

  return (
    <DashboardPage>
      <DashboardHero
        eyebrow="Follow-ups"
        title="Keep delayed conversations from quietly going cold."
        description="Track pending callbacks, next actions, and order-linked reminders in one focused queue."
        actions={<DashboardActionLink href="/dashboard/orders">Back to orders</DashboardActionLink>}
        aside={
          <div className="flex items-start gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BellRing className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Pending nudges</p>
              <p className="mt-1 text-xs text-muted-foreground">Follow-up tasks still waiting.</p>
              <p className="mt-5 text-3xl font-black tracking-tight text-foreground">{pendingCount}</p>
              <p className="mt-2 text-sm text-muted-foreground">{followUps.length} total follow-ups currently linked to orders.</p>
            </div>
          </div>
        }
      />

      <DashboardPanel>
        <DashboardPanelHeader
          eyebrow="Reminder queue"
          title="All follow-ups"
          description="A cleaner mobile card view and a wider desktop table for scanning the queue."
        />

        <section className="mt-5 space-y-3 md:hidden">
          {followUps.length ? (
            followUps.map((item) => (
              <div key={item.id} className="rounded-[22px] border border-border bg-secondary/40 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{item.customerName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.phone || "—"}</p>
                  </div>
                  <DashboardBadge tone={item.completed ? "success" : "warning"}>
                    {item.completed ? "Completed" : "Pending"}
                  </DashboardBadge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Product</p>
                    <p className="mt-1 text-foreground/80">{item.product || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Area</p>
                    <p className="mt-1 text-foreground/80">{item.area || "—"}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-border bg-card p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Note</p>
                  <p className="mt-2 text-sm leading-6 text-foreground/80">{item.note || "—"}</p>
                </div>

                <Link
                  href={`/dashboard/follow-ups/${item.id}/edit`}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
                >
                  <Pencil className="h-4 w-4" />
                  Edit follow-up
                </Link>
              </div>
            ))
          ) : (
            <DashboardEmptyState title="No follow-ups found" description="Follow-up tasks created from orders will appear here." />
          )}
        </section>

        <section className="mt-5 hidden overflow-hidden rounded-[22px] border border-border md:block">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-border bg-secondary/60">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Customer</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Phone</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Product</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Area</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Note</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="bg-card">
                {followUps.length ? (
                  followUps.map((item) => (
                    <tr key={item.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-4 font-semibold text-foreground">{item.customerName}</td>
                      <td className="px-4 py-4 text-sm text-foreground/80">{item.phone || "—"}</td>
                      <td className="px-4 py-4 text-sm text-foreground/80">{item.product || "—"}</td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">{item.area || "—"}</td>
                      <td className="px-4 py-4 text-sm text-foreground/80">{item.note || "—"}</td>
                      <td className="px-4 py-4">
                        <DashboardBadge tone={item.completed ? "success" : "warning"}>
                          {item.completed ? "Completed" : "Pending"}
                        </DashboardBadge>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`/dashboard/follow-ups/${item.id}/edit`}
                          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-12">
                      <DashboardEmptyState title="No follow-ups found" description="Follow-up tasks created from orders will appear here." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </DashboardPanel>
    </DashboardPage>
  );
}
