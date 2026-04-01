import Link from "next/link";
import { BellRing, Pencil, Plus, Wallet } from "lucide-react";
import { getDashboardWriteAccess } from "@/lib/dashboard-access";
import { canAccessDashboardFeatureForUser, canUsePlanCapabilityForUser } from "@/lib/plan-access";
import { getDashboardData } from "@/lib/queries";
import {
  DashboardActionLink,
  DashboardBadge,
  DashboardEmptyState,
  DashboardFilterBar,
  DashboardHero,
  DashboardPage,
  DashboardPanel,
  DashboardPanelHeader,
} from "@/components/dashboard/page-primitives";
import { formatTZS } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function badgeTone(stage: string) {
  const map: Record<string, "neutral" | "warning" | "primary" | "success"> = {
    new_order: "neutral",
    waiting_payment: "warning",
    paid: "primary",
    packing: "primary",
    dispatched: "primary",
    delivered: "success",
  };

  return map[stage] ?? "neutral";
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; stage?: string; payment?: string }>;
}) {
  const { business, isAdmin, canCreateOrders, monthlyOrderLimit, orderCountThisMonth, remainingMonthlyOrders } =
    await getDashboardWriteAccess();
  const { orders: allOrders } = await getDashboardData();
  const resolvedSearch = (await searchParams) ?? {};
  const searchQuery = (resolvedSearch.q ?? "").trim().toLowerCase();
  const selectedStage = (resolvedSearch.stage ?? "").trim();
  const selectedPayment = (resolvedSearch.payment ?? "").trim();
  const orders = allOrders.filter((order) => {
    const matchesSearch =
      !searchQuery ||
      order.customerName.toLowerCase().includes(searchQuery) ||
      order.product.toLowerCase().includes(searchQuery) ||
      order.area.toLowerCase().includes(searchQuery) ||
      order.phone.toLowerCase().includes(searchQuery);
    const matchesStage = !selectedStage || order.stage === selectedStage;
    const matchesPayment = !selectedPayment || order.paymentStatus === selectedPayment;

    return matchesSearch && matchesStage && matchesPayment;
  });
  const canSeeCustomers = canAccessDashboardFeatureForUser("customers", business, isAdmin);
  const canSeeFollowUps = canAccessDashboardFeatureForUser("followUps", business, isAdmin);
  const canTrackPayments = canUsePlanCapabilityForUser("paymentTracking", business, isAdmin);
  const unpaidValue = orders
    .filter((order) => order.paymentStatus !== "paid")
    .reduce((sum, order) => sum + order.amount, 0);

  return (
    <DashboardPage>
      <DashboardHero
        eyebrow="Orders"
        title="Keep the order book clear, current, and easy to act on."
        description="Review all live orders, track stage changes, and jump into edits quickly on both desktop and mobile."
        actions={
          <>
            <DashboardActionLink
              href={
                canCreateOrders
                  ? "/dashboard/orders/new"
                  : "/pricing?status=upgrade&message=Upgrade%20to%20Starter%20for%20unlimited%20orders"
              }
              tone="primary"
            >
              <Plus className="h-4 w-4" />
              {canCreateOrders ? "New order" : "Upgrade for more orders"}
            </DashboardActionLink>
            {canSeeFollowUps ? (
              <DashboardActionLink href="/dashboard/follow-ups">
                Open follow-ups
                <BellRing className="h-4 w-4" />
              </DashboardActionLink>
            ) : null}
            {canSeeCustomers ? <DashboardActionLink href="/dashboard/customers">Open customers</DashboardActionLink> : null}
          </>
        }
        aside={
          <div className="flex items-start gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Wallet className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Order pressure</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {canTrackPayments ? "Unsettled value still waiting to convert to cash." : "Upgrade to Starter to unlock payment tracking."}
              </p>
              <p className="mt-5 break-words text-3xl font-black tracking-tight text-foreground">
                {monthlyOrderLimit === null ? formatTZS(unpaidValue) : `${orderCountThisMonth}/${monthlyOrderLimit}`}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {monthlyOrderLimit === null
                  ? `${orders.length} total orders currently tracked.`
                  : `${remainingMonthlyOrders ?? 0} free orders left this month.`}
              </p>
            </div>
          </div>
        }
      />

      {monthlyOrderLimit !== null ? (
        <div className="rounded-2xl border border-[#e9d4d1] bg-[#f9efed] px-4 py-3 text-sm text-[#8f3e36]">
          Free gives you up to {monthlyOrderLimit} orders this month. Follow-ups, payment tracking, and customer workflows start on Starter.
          <Link href="/pricing" className="ml-2 font-semibold underline">
            Upgrade now
          </Link>
        </div>
      ) : null}

      <DashboardFilterBar
        clearHref="/dashboard/orders"
        defaultSearch={resolvedSearch.q ?? ""}
        searchPlaceholder="Search customer, phone, product, or area"
        filters={[
          {
            name: "stage",
            defaultValue: selectedStage,
            options: [
              { label: "All stages", value: "" },
              { label: "New", value: "new_order" },
              { label: "Waiting payment", value: "waiting_payment" },
              { label: "Paid", value: "paid" },
              { label: "Packing", value: "packing" },
              { label: "Dispatched", value: "dispatched" },
              { label: "Delivered", value: "delivered" },
            ],
          },
          {
            name: "payment",
            defaultValue: selectedPayment,
            options: [
              { label: "All payments", value: "" },
              { label: "Unpaid", value: "unpaid" },
              { label: "Partial", value: "partial" },
              { label: "Paid", value: "paid" },
              { label: "COD", value: "cod" },
            ],
          },
        ]}
      />

      <DashboardPanel>
        <DashboardPanelHeader
          eyebrow="Order list"
          title="All tracked orders"
          description="A cleaner order view with mobile cards and a desktop table for heavier scanning."
        />

        <section className="mt-5 space-y-3 md:hidden">
          {orders.length ? (
            orders.map((order) => (
              <div key={order.id} className="rounded-[22px] border border-border bg-secondary/40 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{order.customerName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{order.phone || "No phone"}</p>
                  </div>
                  <DashboardBadge tone={badgeTone(order.stage)}>{order.stage.replaceAll("_", " ")}</DashboardBadge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="text-muted-foreground">Product</p>
                    <p className="mt-1 truncate font-medium text-foreground">{order.product}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="mt-1 font-bold text-primary">{formatTZS(order.amount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Area</p>
                    <p className="mt-1 text-foreground/80">{order.area || "—"}</p>
                  </div>
                  {canTrackPayments ? (
                    <div>
                      <p className="text-muted-foreground">Payment</p>
                      <div className="mt-1">
                        <DashboardBadge tone={order.paymentStatus === "paid" ? "success" : "danger"}>
                          {order.paymentStatus}
                        </DashboardBadge>
                      </div>
                    </div>
                  ) : null}
                </div>

                <Link
                  href={`/dashboard/orders/${order.id}/edit`}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
                >
                  <Pencil className="h-4 w-4" />
                  Edit order
                </Link>
              </div>
            ))
          ) : (
            <DashboardEmptyState title="No orders found" description="Your orders will appear here once you start tracking them." />
          )}
        </section>

        <section className="mt-5 hidden overflow-hidden rounded-[22px] border border-border md:block">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-border bg-secondary/60">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Customer</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Product</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Area</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Amount</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Stage</th>
                  {canTrackPayments ? (
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Payment</th>
                  ) : null}
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="bg-card">
                {orders.length ? (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-4">
                        <div className="min-w-[150px]">
                          <p className="font-semibold text-foreground">{order.customerName}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{order.phone || "No phone"}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground/80">{order.product}</td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">{order.area || "—"}</td>
                      <td className="px-4 py-4 text-sm font-bold text-primary">{formatTZS(order.amount)}</td>
                      <td className="px-4 py-4">
                        <DashboardBadge tone={badgeTone(order.stage)}>{order.stage.replaceAll("_", " ")}</DashboardBadge>
                      </td>
                      {canTrackPayments ? (
                        <td className="px-4 py-4">
                          <DashboardBadge tone={order.paymentStatus === "paid" ? "success" : "danger"}>
                            {order.paymentStatus}
                          </DashboardBadge>
                        </td>
                      ) : null}
                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`/dashboard/orders/${order.id}/edit`}
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
                    <td colSpan={canTrackPayments ? 7 : 6} className="px-4 py-12">
                      <DashboardEmptyState title="No orders found" description="Your orders will appear here once you start tracking them." />
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
