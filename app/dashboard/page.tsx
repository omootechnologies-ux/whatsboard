import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  CreditCard,
  PackageCheck,
  ShoppingBag,
  Truck,
  Users,
} from "lucide-react";
import { getDashboardWriteAccess } from "@/lib/dashboard-access";
import { canAccessDashboardFeatureForUser, canUsePlanCapabilityForUser } from "@/lib/plan-access";
import { getCustomersData, getDashboardData, getFollowUpsData } from "@/lib/queries";
import {
  DashboardActionLink,
  DashboardBadge,
  DashboardEmptyState,
  DashboardHero,
  DashboardInfoGrid,
  DashboardPage,
  DashboardPanel,
  DashboardPanelHeader,
  DashboardStatCard,
} from "@/components/dashboard/page-primitives";
import { formatTZS } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function stageTone(stage: string) {
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

export default async function DashboardOverviewPage() {
  const {
    business,
    isAdmin,
    canCreateOrders,
    monthlyOrderLimit,
    orderCountThisMonth,
    remainingMonthlyOrders,
  } = await getDashboardWriteAccess();
  const [{ orders, metrics }, customers, followUps] = await Promise.all([
    getDashboardData(),
    getCustomersData(),
    getFollowUpsData(),
  ]);

  const canSeeCustomers = canAccessDashboardFeatureForUser("customers", business, isAdmin);
  const canSeeFollowUps = canAccessDashboardFeatureForUser("followUps", business, isAdmin);
  const canSeeAnalytics = canAccessDashboardFeatureForUser("analytics", business, isAdmin);
  const canTrackPayments = canUsePlanCapabilityForUser("paymentTracking", business, isAdmin);

  const totalOrders = metrics?.totalOrders ?? 0;
  const unpaidOrders = metrics?.unpaidOrders ?? 0;
  const unpaidValue = metrics?.unpaidValue ?? 0;
  const packingCount = orders.filter((order) => ["paid", "packing", "dispatched"].includes(order.stage)).length;
  const deliveredCount = orders.filter((order) => order.stage === "delivered").length;
  const pendingFollowUps = followUps.filter((item) => !item.completed);
  const dormantCustomers = customers.filter((customer) => {
    const lastOrderTime = new Date(customer.lastOrderDate).getTime();
    return Number.isFinite(lastOrderTime) && Date.now() - lastOrderTime >= 30 * 24 * 60 * 60 * 1000;
  });
  const recentOrders = orders.slice(0, 5);
  const nextFollowUps = pendingFollowUps.slice(0, 4);
  const pipelineSnapshot = [
    { label: "New", value: orders.filter((order) => order.stage === "new_order").length },
    { label: "Payment", value: orders.filter((order) => order.stage === "waiting_payment").length },
    { label: "Paid", value: orders.filter((order) => order.stage === "paid").length },
    { label: "Packing", value: orders.filter((order) => order.stage === "packing").length },
    { label: "Dispatch", value: orders.filter((order) => order.stage === "dispatched").length },
    { label: "Done", value: orders.filter((order) => order.stage === "delivered").length },
  ];

  return (
    <DashboardPage>
      <DashboardHero
        eyebrow="Overview"
        title="Keep every order, payment, and follow-up in one clear workspace."
        description="This is your daily control room. Review what needs payment, what needs packing, and which customers or follow-ups need attention next."
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
              {canCreateOrders ? "Create order" : "Upgrade for more orders"}
            </DashboardActionLink>
            <DashboardActionLink href={canSeeFollowUps ? "/dashboard/follow-ups" : "/dashboard/orders"}>
              {canSeeFollowUps ? "Review follow-ups" : "Review orders"}
            </DashboardActionLink>
          </>
        }
        aside={
          <div className="space-y-3">
            <div className="rounded-[22px] bg-secondary/60 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Waiting payment</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-foreground">
                {canTrackPayments ? unpaidOrders : `${orderCountThisMonth}/${monthlyOrderLimit ?? totalOrders}`}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {canTrackPayments
                  ? `${formatTZS(unpaidValue)} still not collected.`
                  : `${remainingMonthlyOrders ?? 0} free orders left this month.`}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[22px] bg-secondary/60 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">In motion</p>
                <p className="mt-2 text-2xl font-black text-foreground">{packingCount}</p>
                <p className="mt-1 text-sm text-muted-foreground">Paid, packing, or already dispatched.</p>
              </div>
              <div className="rounded-[22px] bg-secondary/60 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Follow-ups due</p>
                <p className="mt-2 text-2xl font-black text-foreground">
                  {canSeeFollowUps ? pendingFollowUps.length : "Starter"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {canSeeFollowUps ? "Customers still waiting for a reply." : "Unlock reminders on Starter."}
                </p>
              </div>
            </div>
          </div>
        }
      />

      <DashboardInfoGrid>
        <DashboardStatCard label="Orders" value={String(totalOrders)} detail="All orders currently tracked" icon={<ShoppingBag className="h-5 w-5" />} />
        <DashboardStatCard
          label={canSeeCustomers ? "Customers" : "Free quota"}
          value={canSeeCustomers ? String(customers.length) : String(remainingMonthlyOrders ?? monthlyOrderLimit ?? 0)}
          detail={canSeeCustomers ? "Customer records created from orders" : "Orders left this month on Free"}
          icon={<Users className="h-5 w-5" />}
        />
        <DashboardStatCard label="Delivered" value={String(deliveredCount)} detail="Orders already completed" icon={<Truck className="h-5 w-5" />} />
        <DashboardStatCard
          label="Follow-ups"
          value={canSeeFollowUps ? String(pendingFollowUps.length) : "Starter"}
          detail={canSeeFollowUps ? "Open reminders still pending" : "Upgrade to unlock reminders"}
          icon={<BellRing className="h-5 w-5" />}
        />
      </DashboardInfoGrid>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
        <DashboardPanel>
          <DashboardPanelHeader
            eyebrow="Pipeline"
            title="Order flow overview"
            description="See where orders are collecting, then jump into the full order board."
            href="/dashboard/orders"
            hrefLabel="Open orders"
          />
          <div className="mt-5 grid gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
            {pipelineSnapshot.map((stage) => (
              <div key={stage.label} className="rounded-[20px] border border-border bg-secondary/50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{stage.label}</p>
                <p className="mt-3 text-2xl font-black tracking-tight text-foreground">{stage.value}</p>
              </div>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel muted>
          <DashboardPanelHeader
            title="Dispatch tracker"
            description="What is ready to move after payment and packing."
          />
          <div className="mt-5 space-y-3">
            <div className="rounded-[20px] border border-border bg-card p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Ready for packing</p>
              <p className="mt-2 text-2xl font-black text-foreground">{orders.filter((order) => order.stage === "paid").length}</p>
            </div>
            <div className="rounded-[20px] border border-border bg-card p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">In packing</p>
              <p className="mt-2 text-2xl font-black text-foreground">{orders.filter((order) => order.stage === "packing").length}</p>
            </div>
            <div className="rounded-[20px] border border-border bg-card p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Out for dispatch</p>
              <p className="mt-2 text-2xl font-black text-foreground">{orders.filter((order) => order.stage === "dispatched").length}</p>
            </div>
          </div>
        </DashboardPanel>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <DashboardPanel>
          <DashboardPanelHeader
            eyebrow="Recent activity"
            title="Latest orders"
            description="The newest activity across the order book."
            href="/dashboard/orders"
            hrefLabel="View all orders"
          />
          <div className="mt-5 space-y-3">
            {recentOrders.length ? (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="grid gap-3 rounded-[20px] border border-border bg-secondary/50 p-4 lg:grid-cols-[minmax(0,1.1fr)_auto_auto]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{order.customerName}</p>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {order.product} {order.area ? `• ${order.area}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <DashboardBadge tone={stageTone(order.stage)}>{order.stage.replaceAll("_", " ")}</DashboardBadge>
                    {canTrackPayments ? (
                      <DashboardBadge tone={order.paymentStatus === "paid" ? "success" : "danger"}>
                        {order.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                      </DashboardBadge>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between gap-3 lg:justify-end">
                    <p className="text-sm font-bold text-foreground">{formatTZS(order.amount)}</p>
                    <Link
                      href={`/dashboard/orders/${order.id}/edit`}
                      className="inline-flex rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/30 hover:text-primary"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <DashboardEmptyState
                title="No orders yet"
                description="Start with your first order and WhatsBoard will build customers and follow-ups from there."
                action={
                  <DashboardActionLink
                    href={
                      canCreateOrders
                        ? "/dashboard/orders/new"
                        : "/pricing?status=upgrade&message=Upgrade%20to%20Starter%20for%20unlimited%20orders"
                    }
                    tone="primary"
                  >
                    {canCreateOrders ? "Add order" : "Upgrade to add more orders"}
                  </DashboardActionLink>
                }
              />
            )}
          </div>
        </DashboardPanel>

        <div className="space-y-4">
          <DashboardPanel muted>
            <DashboardPanelHeader
              title="Payment control"
              description={canTrackPayments ? "Know exactly what still needs collection." : "Unlock payment tracking on Starter."}
            />
            <div className="mt-5 rounded-[20px] border border-border bg-card p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {canTrackPayments ? "Unpaid value" : "Free usage"}
              </p>
              <p className="mt-2 break-words text-2xl font-black text-foreground">
                {canTrackPayments ? formatTZS(unpaidValue) : `${orderCountThisMonth}/${monthlyOrderLimit ?? totalOrders}`}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {canTrackPayments
                  ? `${unpaidOrders} orders still need payment confirmation.`
                  : `${remainingMonthlyOrders ?? 0} free orders left this month.`}
              </p>
            </div>
          </DashboardPanel>

          <DashboardPanel>
            <DashboardPanelHeader
              title="Next follow-ups"
              description={canSeeFollowUps ? "Keep delayed chats and orders moving." : "Follow-up reminders unlock on Starter."}
              href={canSeeFollowUps ? "/dashboard/follow-ups" : undefined}
              hrefLabel={canSeeFollowUps ? "Open follow-ups" : undefined}
            />
            <div className="mt-5 space-y-3">
              {canSeeFollowUps && nextFollowUps.length ? (
                nextFollowUps.map((item) => (
                  <div key={item.id} className="rounded-[20px] border border-border bg-secondary/50 p-4">
                    <p className="font-semibold text-foreground">{item.customerName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.product || "No product"} {item.area ? `• ${item.area}` : ""}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-foreground/75">{item.note || "No note added yet."}</p>
                  </div>
                ))
              ) : (
                <DashboardEmptyState
                  title={canSeeFollowUps ? "No follow-ups pending right now" : "Follow-up reminders unlock on Starter"}
                  description={
                    canSeeFollowUps
                      ? "You are caught up for now."
                      : "Upgrade to keep next actions visible instead of relying on memory."
                  }
                />
              )}
            </div>
          </DashboardPanel>
        </div>
      </section>

      <DashboardInfoGrid columns="three">
        <DashboardPanel>
          <p className="text-sm font-semibold text-foreground">{canCreateOrders ? "Create order" : "Upgrade for more orders"}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {canCreateOrders
              ? "Start from a fresh sale and let WhatsBoard create or match the customer automatically."
              : "Free gives you 30 orders per month. Upgrade to Starter for unlimited orders and deeper workflows."}
          </p>
          <Link
            href={
              canCreateOrders
                ? "/dashboard/orders/new"
                : "/pricing?status=upgrade&message=Upgrade%20to%20Starter%20for%20unlimited%20orders"
            }
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-[#0a3d2e]"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Link>
        </DashboardPanel>

        <DashboardPanel>
          <p className="text-sm font-semibold text-foreground">{canSeeCustomers ? "Customer list" : "Customer profiles"}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {canSeeCustomers
              ? "See repeat buyers and dormant customers who may need a quick follow-up."
              : "Upgrade to Starter to unlock customer history, follow-ups, and profile editing."}
          </p>
          <Link
            href={
              canSeeCustomers
                ? "/dashboard/customers"
                : "/pricing?status=upgrade&message=Upgrade%20to%20Starter%20to%20unlock%20customer%20profiles"
            }
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-[#0a3d2e]"
          >
            {canSeeCustomers ? "Open customers" : "See pricing"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </DashboardPanel>

        <DashboardPanel>
          <p className="text-sm font-semibold text-foreground">{canSeeAnalytics ? "Reports & analytics" : "Settings"}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {canSeeAnalytics
              ? "Track reports from live order and customer data."
              : "Keep business details, defaults, and contact info clean for daily operations."}
          </p>
          <Link
            href={canSeeAnalytics ? "/dashboard/analytics" : "/dashboard/settings"}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-[#0a3d2e]"
          >
            Open
            <ArrowRight className="h-4 w-4" />
          </Link>
        </DashboardPanel>
      </DashboardInfoGrid>

      {canSeeCustomers && dormantCustomers.length > 0 ? (
        <DashboardPanel muted>
          <DashboardPanelHeader
            title="Dormant customers to re-engage"
            description={`${dormantCustomers.length} customers have not ordered in 30 days or more. Check the customer page to send a quick follow-up.`}
            href="/dashboard/customers"
            hrefLabel="Open customers"
          />
        </DashboardPanel>
      ) : null}
    </DashboardPage>
  );
}
