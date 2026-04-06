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
  DashboardChartCard,
  DashboardEmptyState,
  DashboardHero,
  DashboardInfoGrid,
  DashboardOrderStageBoard,
  DashboardPage,
  DashboardPanel,
  DashboardPanelHeader,
  DashboardStatCard,
  DashboardTimeline,
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
  const paidOrders = metrics?.paidOrders ?? 0;
  const deliveredCount = orders.filter((order) => order.stage === "delivered").length;
  const activeOrders = orders.filter((order) => order.stage !== "delivered").length;
  const pendingFollowUps = followUps.filter((item) => !item.completed);
  const overdueFollowUps = pendingFollowUps.filter((item) => new Date(item.dueAt).getTime() < Date.now());
  const inMotionOrders = orders.filter((order) =>
    ["waiting_payment", "paid", "packing", "dispatched"].includes(order.stage)
  );
  const recentOrders = orders.slice(0, 4);
  const topCustomers = customers.slice(0, 4);
  const chartData = [
    { label: "New", value: orders.filter((order) => order.stage === "new_order").length },
    { label: "Pay", value: orders.filter((order) => order.stage === "waiting_payment").length },
    { label: "Pack", value: orders.filter((order) => order.stage === "packing").length },
    { label: "Ship", value: orders.filter((order) => order.stage === "dispatched").length },
    { label: "Done", value: deliveredCount },
  ];

  const timelineItems: Array<{
    title: string;
    detail: string;
    meta?: string;
    tone?: "neutral" | "primary" | "success" | "warning";
  }> = [
    ...recentOrders.map((order) => ({
      title: `Order from ${order.customerName}`,
      detail: `${order.product} for ${formatTZS(order.amount)} ${order.area ? `in ${order.area}` : ""}`.trim(),
      meta: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : undefined,
      tone: (stageTone(order.stage) === "warning" ? "warning" : stageTone(order.stage) === "success" ? "success" : "primary") as
        | "warning"
        | "success"
        | "primary",
    })),
    ...pendingFollowUps.slice(0, 2).map((followUp) => ({
      title: `Follow-up for ${followUp.customerName}`,
      detail: followUp.note || "Customer still needs a response.",
      meta: followUp.dueAt ? new Date(followUp.dueAt).toLocaleDateString() : undefined,
      tone: (new Date(followUp.dueAt).getTime() < Date.now() ? "warning" : "neutral") as "warning" | "neutral",
    })),
  ].slice(0, 5);

  const orderBoardColumns = [
    {
      key: "new",
      title: "New orders",
      tone: "neutral" as const,
      orders: orders
        .filter((order) => order.stage === "new_order")
        .slice(0, 3)
        .map((order) => ({
          id: order.id,
          customerName: order.customerName,
          product: order.product,
          amount: order.amount,
          area: order.area,
          paymentStatus: canTrackPayments ? order.paymentStatus : undefined,
        })),
    },
    {
      key: "payment",
      title: "Waiting payment",
      tone: "warning" as const,
      orders: orders
        .filter((order) => order.stage === "waiting_payment")
        .slice(0, 3)
        .map((order) => ({
          id: order.id,
          customerName: order.customerName,
          product: order.product,
          amount: order.amount,
          area: order.area,
          paymentStatus: canTrackPayments ? order.paymentStatus : undefined,
        })),
    },
    {
      key: "packing",
      title: "Packing",
      tone: "primary" as const,
      orders: orders
        .filter((order) => ["paid", "packing"].includes(order.stage))
        .slice(0, 3)
        .map((order) => ({
          id: order.id,
          customerName: order.customerName,
          product: order.product,
          amount: order.amount,
          area: order.area,
          paymentStatus: canTrackPayments ? order.paymentStatus : undefined,
        })),
    },
    {
      key: "dispatch",
      title: "Dispatch & done",
      tone: "success" as const,
      orders: orders
        .filter((order) => ["dispatched", "delivered"].includes(order.stage))
        .slice(0, 3)
        .map((order) => ({
          id: order.id,
          customerName: order.customerName,
          product: order.product,
          amount: order.amount,
          area: order.area,
          paymentStatus: canTrackPayments ? order.paymentStatus : undefined,
        })),
    },
  ];

  return (
    <DashboardPage>
      <DashboardHero
        eyebrow="Overview"
        title="Turn chat sales into a clean operating system for today’s work."
        description="Review urgent follow-ups, active orders, payment exposure, and seller activity from one calm control room built for WhatsApp-led selling."
        actions={
          <>
            <DashboardActionLink
              href={
                canCreateOrders
                  ? "/dashboard/orders/new"
                  : "/pricing?status=upgrade&message=Upgrade%20to%20Starter%20for%20more%20orders"
              }
              tone="primary"
            >
              Create order
            </DashboardActionLink>
            <DashboardActionLink href={canSeeFollowUps ? "/dashboard/follow-ups" : "/dashboard/orders"}>
              {canSeeFollowUps ? "Open action center" : "Review orders"}
            </DashboardActionLink>
          </>
        }
        aside={
          <div className="space-y-4">
            <div className="rounded-[24px] border border-[#dfe7e2] bg-[#f8fbf9] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5e6461]">What needs attention now</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div>
                  <p className="text-3xl font-black tracking-[-0.04em] text-[#111111]">{overdueFollowUps.length}</p>
                  <p className="mt-1 text-sm text-[#5e6461]">Overdue follow-ups</p>
                </div>
                <div>
                  <p className="text-3xl font-black tracking-[-0.04em] text-[#111111]">{activeOrders}</p>
                  <p className="mt-1 text-sm text-[#5e6461]">Orders still moving</p>
                </div>
                <div>
                  <p className="text-3xl font-black tracking-[-0.04em] text-[#111111]">
                    {canTrackPayments ? formatTZS(unpaidValue) : `${remainingMonthlyOrders ?? 0}`}
                  </p>
                  <p className="mt-1 text-sm text-[#5e6461]">
                    {canTrackPayments ? "Still waiting to collect" : "Free orders left this month"}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-[24px] border border-[#dfe7e2] bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#111111]">Seller rhythm</p>
                  <p className="mt-1 text-sm text-[#5e6461]">
                    {canSeeAnalytics
                      ? "Payments, dispatch, and customer flow are visible."
                      : "Upgrade when you need analytics and catalog workflows."}
                  </p>
                </div>
                <DashboardBadge tone={canSeeAnalytics ? "success" : "warning"}>
                  {canSeeAnalytics ? "Growth ready" : "Starter path"}
                </DashboardBadge>
              </div>
            </div>
          </div>
        }
      />

      <DashboardInfoGrid>
        <DashboardStatCard
          label="Active orders"
          value={String(activeOrders)}
          detail="Orders that still need payment, packing, or delivery action."
          icon={<ShoppingBag className="h-5 w-5" />}
          trend={{ value: `${orders.filter((order) => order.stage === "new_order").length} newly captured`, tone: "up" }}
        />
        <DashboardStatCard
          label="Overdue follow-ups"
          value={canSeeFollowUps ? String(overdueFollowUps.length) : "Starter"}
          detail={canSeeFollowUps ? "Customers waiting for your next move." : "Unlock follow-up reminders on Starter."}
          icon={<BellRing className="h-5 w-5" />}
          trend={{ value: canSeeFollowUps ? `${pendingFollowUps.length} open reminders` : "Upgrade to unlock", tone: canSeeFollowUps ? "neutral" : "down" }}
        />
        <DashboardStatCard
          label={canTrackPayments ? "Sales snapshot" : "Free quota"}
          value={canTrackPayments ? formatTZS(paidOrders ? orders.filter((order) => order.paymentStatus === "paid").reduce((sum, order) => sum + order.amount, 0) : 0) : `${orderCountThisMonth}/${monthlyOrderLimit ?? 30}`}
          detail={canTrackPayments ? "Confirmed cash collected from paid orders." : "Orders used in your current free cycle."}
          icon={<CreditCard className="h-5 w-5" />}
          trend={{ value: canTrackPayments ? `${unpaidOrders} still unpaid` : `${remainingMonthlyOrders ?? 0} remaining`, tone: canTrackPayments ? "neutral" : "down" }}
        />
        <DashboardStatCard
          label={canSeeCustomers ? "Customer pulse" : "Delivered"}
          value={canSeeCustomers ? String(customers.length) : String(deliveredCount)}
          detail={canSeeCustomers ? "Customer records created as the business grows." : "Orders completed and closed."}
          icon={<Users className="h-5 w-5" />}
          trend={{ value: canSeeCustomers ? `${topCustomers.length} recently active` : `${deliveredCount} delivered`, tone: "up" }}
        />
      </DashboardInfoGrid>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.06fr)_minmax(340px,0.94fr)]">
        <DashboardPanel>
          <DashboardPanelHeader
            eyebrow="Orders board"
            title="The sales board is the product hero"
            description="See the full operating flow from new orders to dispatch in one premium, touch-friendly board."
            href="/dashboard/orders"
            hrefLabel="Open full orders board"
          />
          <div className="mt-5">
            <DashboardOrderStageBoard columns={orderBoardColumns} />
          </div>
        </DashboardPanel>

        <DashboardPanel muted>
          <DashboardPanelHeader
            eyebrow="Urgent actions"
            title="What to work on today"
            description="Focus only on the orders and follow-ups that can lose money if ignored."
          />
          <div className="mt-5 space-y-3">
            {overdueFollowUps.slice(0, 3).map((item) => (
              <div key={item.id} className="rounded-[22px] border border-[#e9ddd8] bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#111111]">{item.customerName}</p>
                    <p className="mt-1 text-sm text-[#5e6461]">{item.note || "No note added yet."}</p>
                  </div>
                  <DashboardBadge tone="danger">Overdue</DashboardBadge>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                  <span className="text-[#5e6461]">
                    {item.product || "No product"} {item.area ? `• ${item.area}` : ""}
                  </span>
                  <Link href="/dashboard/follow-ups" className="font-semibold text-[#0f5d46]">
                    Review
                  </Link>
                </div>
              </div>
            ))}
            {!overdueFollowUps.length ? (
              <DashboardEmptyState
                title="No overdue follow-ups"
                description="Your seller queue is under control right now."
              />
            ) : null}

            {inMotionOrders.slice(0, 2).map((order) => (
              <div key={order.id} className="rounded-[22px] border border-[#dfe7e2] bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#111111]">{order.customerName}</p>
                    <p className="mt-1 text-sm text-[#5e6461]">{order.product}</p>
                  </div>
                  <DashboardBadge tone={stageTone(order.stage)}>{order.stage.replaceAll("_", " ")}</DashboardBadge>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-[#0f5d46]">{formatTZS(order.amount)}</span>
                  <Link href={`/dashboard/orders/${order.id}/edit`} className="font-semibold text-[#0f5d46]">
                    Update
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </DashboardPanel>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <DashboardChartCard
          title="Sales flow by stage"
          subtitle="One chart only. See where orders are bunching up in the workflow."
          data={chartData}
          footer={
            canSeeAnalytics
              ? "Use this to see whether the business is stuck at payment, packing, or dispatch."
              : "Upgrade to Growth for deeper analytics pages while keeping this daily view simple."
          }
        />

        <DashboardPanel>
          <DashboardPanelHeader
            eyebrow="Recent activity"
            title="Business movement"
            description="A compact timeline of new orders, reminders, and customer actions."
          />
          <div className="mt-5">
            {timelineItems.length ? (
              <DashboardTimeline items={timelineItems} />
            ) : (
              <DashboardEmptyState
                title="No activity yet"
                description="New orders and follow-ups will start building your timeline here."
              />
            )}
          </div>
        </DashboardPanel>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <DashboardPanel>
          <DashboardPanelHeader
            eyebrow="Recent customers"
            title="Customer activity worth tracking"
            description="The latest people buying from the business, ready for repeat sales or follow-up."
            href={canSeeCustomers ? "/dashboard/customers" : undefined}
            hrefLabel={canSeeCustomers ? "Open customers" : undefined}
          />
          <div className="mt-5 space-y-3">
            {canSeeCustomers && topCustomers.length ? (
              topCustomers.map((customer) => (
                <div key={customer.id} className="flex flex-col gap-3 rounded-[22px] border border-[#e6ece8] bg-[#fbfcfb] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#111111]">{customer.name}</p>
                    <p className="mt-1 text-sm text-[#5e6461]">{customer.phone || "No phone"} {customer.area ? `• ${customer.area}` : ""}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="font-semibold text-[#0f5d46]">{formatTZS(customer.totalSpent)}</span>
                    <DashboardBadge tone={customer.status === "active" ? "success" : "neutral"}>{customer.status}</DashboardBadge>
                  </div>
                </div>
              ))
            ) : (
              <DashboardEmptyState
                title={canSeeCustomers ? "No customers yet" : "Customer records unlock on Starter"}
                description={
                  canSeeCustomers
                    ? "Create orders and Folapp will build the customer base automatically."
                    : "Upgrade to turn every sale into a reusable customer record."
                }
              />
            )}
          </div>
        </DashboardPanel>

        <DashboardPanel muted>
          <DashboardPanelHeader
            eyebrow="Quick actions"
            title="Move the business forward"
            description="The fastest next steps for an owner working from chat traffic."
          />
          <div className="mt-5 grid gap-3">
            <DashboardActionLink
              href={canCreateOrders ? "/dashboard/orders/new" : "/pricing?status=upgrade&message=Upgrade%20to%20Starter%20for%20more%20orders"}
              tone="primary"
            >
              <PackageCheck className="h-4 w-4" />
              {canCreateOrders ? "Create order" : "Upgrade for more orders"}
            </DashboardActionLink>
            <DashboardActionLink href={canSeeFollowUps ? "/dashboard/follow-ups" : "/dashboard/orders"}>
              <BellRing className="h-4 w-4" />
              {canSeeFollowUps ? "Review follow-ups" : "Review orders"}
            </DashboardActionLink>
            <DashboardActionLink href={canSeeCustomers ? "/dashboard/customers" : "/pricing"}>
              <Users className="h-4 w-4" />
              {canSeeCustomers ? "Open customers" : "Unlock customers"}
            </DashboardActionLink>
            <DashboardActionLink href="/dashboard/orders">
              <Truck className="h-4 w-4" />
              Open order board
              <ArrowRight className="h-4 w-4" />
            </DashboardActionLink>
          </div>
        </DashboardPanel>
      </section>
    </DashboardPage>
  );
}
