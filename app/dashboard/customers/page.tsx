import Link from "next/link";
import { MessageCircle, Pencil, Users } from "lucide-react";
import { requireDashboardFeatureAccess } from "@/lib/dashboard-access";
import { getCustomersData } from "@/lib/queries";
import {
  DashboardActionLink,
  DashboardBadge,
  DashboardEmptyState,
  DashboardFilterBar,
  DashboardHero,
  DashboardPage,
  DashboardPanel,
  DashboardPanelHeader,
  DashboardStatCard,
} from "@/components/dashboard/page-primitives";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; status?: string; activity?: string }>;
}) {
  await requireDashboardFeatureAccess("customers");
  const allCustomers = await getCustomersData();
  const resolvedSearch = (await searchParams) ?? {};
  const searchQuery = (resolvedSearch.q ?? "").trim().toLowerCase();
  const selectedStatus = (resolvedSearch.status ?? "").trim();
  const selectedActivity = (resolvedSearch.activity ?? "").trim();
  const now = Date.now();
  const customers = allCustomers.filter((customer) => {
    const lastOrderTime = new Date(customer.lastOrderDate).getTime();
    const isDormant = Number.isFinite(lastOrderTime) && now - lastOrderTime >= 30 * 24 * 60 * 60 * 1000;
    const matchesSearch =
      !searchQuery ||
      customer.name.toLowerCase().includes(searchQuery) ||
      (customer.phone || "").toLowerCase().includes(searchQuery) ||
      (customer.area || "").toLowerCase().includes(searchQuery);
    const matchesStatus = !selectedStatus || (customer.status || "active") === selectedStatus;
    const matchesActivity =
      !selectedActivity ||
      (selectedActivity === "repeat" && customer.isRepeat) ||
      (selectedActivity === "dormant" && isDormant) ||
      (selectedActivity === "recent" && !isDormant);

    return matchesSearch && matchesStatus && matchesActivity;
  });
  const repeatCustomers = customers.filter((customer) => customer.isRepeat).length;
  const dormantCustomers = customers.filter((customer) => {
    const lastOrderTime = new Date(customer.lastOrderDate).getTime();
    return Number.isFinite(lastOrderTime) && now - lastOrderTime >= 30 * 24 * 60 * 60 * 1000;
  });

  return (
    <DashboardPage>
      <DashboardHero
        eyebrow="Customers"
        title="See who is buying, repeating, and going quiet."
        description="Customer records are built from orders automatically, then surfaced here so you can edit details and re-engage the right people."
        actions={<DashboardActionLink href="/dashboard/orders">Go to orders</DashboardActionLink>}
        aside={
          <div className="grid grid-cols-2 gap-3">
            <DashboardStatCard label="Total" value={String(customers.length)} detail="Saved from active orders" icon={<Users className="h-5 w-5" />} />
            <DashboardStatCard label="Repeat" value={String(repeatCustomers)} detail="Customers with multiple orders" icon={<Users className="h-5 w-5" />} />
          </div>
        }
      />

      <DashboardFilterBar
        clearHref="/dashboard/customers"
        defaultSearch={resolvedSearch.q ?? ""}
        searchPlaceholder="Search name, phone, or area"
        filters={[
          {
            name: "status",
            defaultValue: selectedStatus,
            options: [
              { label: "All statuses", value: "" },
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ],
          },
          {
            name: "activity",
            defaultValue: selectedActivity,
            options: [
              { label: "All activity", value: "" },
              { label: "Recent", value: "recent" },
              { label: "Repeat", value: "repeat" },
              { label: "Dormant", value: "dormant" },
            ],
          },
        ]}
      />

      <DashboardPanel muted>
        <DashboardPanelHeader
          eyebrow="Re-engagement"
          title="Customers who may need a follow-up"
          description="People who have not ordered in 30+ days and may be ready for a quick WhatsApp nudge."
        />
        <div className="mt-5 space-y-3">
          {dormantCustomers.length ? (
            dormantCustomers.slice(0, 6).map((customer) => (
              <div key={customer.id} className="flex flex-col gap-3 rounded-[20px] border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{customer.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Last order {new Date(customer.lastOrderDate).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={`https://wa.me/${encodeURIComponent((customer.phone || "").replace(/[^\d]/g, ""))}?text=${encodeURIComponent(`Hi ${customer.name}, it has been a while since your last order. We have new stock ready for you.`)}`}
                  target="_blank"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-secondary/70 px-4 py-3 text-sm font-semibold text-primary transition hover:border-primary/20 hover:bg-primary/5"
                >
                  <MessageCircle className="h-4 w-4" />
                  Send follow-up
                </a>
              </div>
            ))
          ) : (
            <DashboardEmptyState title="No dormant customers right now" description="Your recent customer activity is still healthy." />
          )}
        </div>
      </DashboardPanel>

      <DashboardPanel>
        <DashboardPanelHeader
          eyebrow="Customer list"
          title="All customer records"
          description="A mobile card view for quick edits and a wider table for heavier scanning."
        />

        <section className="mt-5 space-y-3 md:hidden">
          {customers.length ? (
            customers.map((customer) => (
              <div key={customer.id} className="rounded-[22px] border border-border bg-secondary/40 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{customer.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{customer.phone || "—"}</p>
                  </div>
                  <DashboardBadge tone="neutral">{customer.status || "active"}</DashboardBadge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Area</p>
                    <p className="mt-1 text-foreground/80">{customer.area || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Orders</p>
                    <p className="mt-1 font-semibold text-foreground">{customer.orderCount}</p>
                  </div>
                </div>

                <Link
                  href={`/dashboard/customers/${customer.id}/edit`}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
                >
                  <Pencil className="h-4 w-4" />
                  Edit customer
                </Link>
              </div>
            ))
          ) : (
            <DashboardEmptyState title="No customers found" description="Customer records appear automatically as you save orders." />
          )}
        </section>

        <section className="mt-5 hidden overflow-hidden rounded-[22px] border border-border md:block">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-border bg-secondary/60">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Phone</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Area</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Orders</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="bg-card">
                {customers.length ? (
                  customers.map((customer) => (
                    <tr key={customer.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-4 font-semibold text-foreground">{customer.name}</td>
                      <td className="px-4 py-4 text-sm text-foreground/80">{customer.phone || "—"}</td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">{customer.area || "—"}</td>
                      <td className="px-4 py-4 text-sm text-foreground/80">{customer.orderCount}</td>
                      <td className="px-4 py-4">
                        <DashboardBadge tone="neutral">{customer.status || "active"}</DashboardBadge>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`/dashboard/customers/${customer.id}/edit`}
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
                    <td colSpan={6} className="px-4 py-12">
                      <DashboardEmptyState title="No customers found" description="Customer records appear automatically as you save orders." />
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
