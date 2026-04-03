import Link from "next/link";
import { Bell, CreditCard, Package2, Users } from "lucide-react";
import {
  ChartCard,
  CustomerRow,
  EmptyState,
  KpiCard,
  OrderStageBoard,
  PageHeader,
  SectionCard,
  StatStrip,
  TimelineList,
} from "@/components/whatsboard-dashboard/dashboard-ui";
import {
  formatCurrency,
  formatDate,
} from "@/components/whatsboard-dashboard/formatting";
import {
  getDashboardSnapshot,
  listPayments,
} from "@/lib/whatsboard-repository";
import {
  formatOrderReference,
  formatPaymentStatusLabel,
  getPrimaryOrderLabel,
} from "@/lib/display-labels";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [{ stats: dashboardStats, customers, followUps, orders }, payments] =
    await Promise.all([getDashboardSnapshot(), listPayments()]);

  const weeklyPerformanceSeries = [
    { label: "MON", amount: 0 },
    { label: "TUE", amount: 0 },
    { label: "WED", amount: 0 },
    { label: "THU", amount: 0 },
    { label: "FRI", amount: 3_000_000 },
    { label: "SAT", amount: 0 },
    { label: "SUN", amount: 0 },
  ];

  const stageGroups = {
    newOrder: orders.filter((order) => order.stage === "new_order"),
    waitingPayment: orders.filter((order) => order.stage === "waiting_payment"),
    packing: orders.filter((order) =>
      ["paid", "packing"].includes(order.stage),
    ),
    dispatch: orders.filter((order) =>
      ["dispatched", "delivered"].includes(order.stage),
    ),
  };

  const ordersNeedingAction = orders.filter(
    (order) => order.stage === "new_order" || order.stage === "waiting_payment",
  );
  const urgentFollowUps = followUps.filter(
    (item) => item.status === "overdue" || item.status === "today",
  );
  const recentActivity = [
    ...orders.map((order) => ({
      at: order.updatedAt,
      title: `Order #${formatOrderReference(order.id) || "WB-00000"} is ${order.stage.replaceAll("_", " ")}`,
      detail: `${getPrimaryOrderLabel({
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        orderId: order.id,
      })} • ${formatCurrency(order.amount)}`,
    })),
    ...followUps.map((item) => ({
      at: item.dueAt,
      title: `${item.status.toUpperCase()} follow-up: ${item.title}`,
      detail: `${getPrimaryOrderLabel({
        customerName: item.customerName,
        orderId: item.orderId,
        kind: "customer",
      })}${item.orderId ? ` • Order #${formatOrderReference(item.orderId) || "WB-00000"}` : ""}`,
    })),
    ...payments.map((payment) => ({
      at: payment.createdAt,
      title: `Payment ${formatPaymentStatusLabel(payment.status)} • ${formatOrderReference(payment.orderId) || "WB-00000"}`,
      detail: `${getPrimaryOrderLabel({
        customerName: payment.customerName,
        orderId: payment.orderId,
        kind: "customer",
      })} • ${formatCurrency(payment.amount)} via ${payment.method}`,
    })),
  ]
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, 6)
    .map((item) => ({
      title: item.title,
      detail: item.detail,
      meta: formatDate(item.at),
    }));

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title="Dashboard"
        description="Your daily control room for orders, payments, customers, and follow-ups across WhatsApp and social channels."
        secondaryAction={
          <Link href="/orders" className="wb-button-secondary">
            Open Orders Board
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Active orders"
          value={String(dashboardStats.activeOrders)}
          detail="Orders currently in motion across all stages."
          accent={<Package2 className="h-5 w-5" />}
        />
        <KpiCard
          label="Overdue follow-ups"
          value={String(dashboardStats.overdueFollowUps)}
          detail="Customers waiting for your next reply or payment reminder."
          accent={<Bell className="h-5 w-5" />}
        />
        <KpiCard
          label="Sales this month"
          value={formatCurrency(dashboardStats.revenueMonth)}
          detail="Confirmed revenue tracked inside WhatsBoard."
          accent={<CreditCard className="h-5 w-5" />}
        />
        <KpiCard
          label="Customers added"
          value={String(dashboardStats.customersThisMonth)}
          detail={`${dashboardStats.conversionRate}% conversion from chat inquiry to tracked order.`}
          accent={<Users className="h-5 w-5" />}
        />
      </section>

      <StatStrip
        items={[
          {
            label: "Awaiting payment",
            value: String(stageGroups.waitingPayment.length),
            tone: "warning",
          },
          {
            label: "Ready to dispatch",
            value: String(stageGroups.packing.length),
            tone: "neutral",
          },
          {
            label: "Delivered",
            value: String(
              stageGroups.dispatch.filter(
                (order) => order.stage === "delivered",
              ).length,
            ),
            tone: "success",
          },
          {
            label: "Payout pending",
            value: formatCurrency(dashboardStats.payoutPending),
            tone: "danger",
          },
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          title="Urgent follow-ups"
          description="Overdue and due-today customer actions."
        >
          <div className="space-y-3">
            {urgentFollowUps.length ? (
              urgentFollowUps.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[22px] border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[var(--color-wb-text)]">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
                        {item.customerName}
                      </p>
                    </div>
                    <span className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--color-wb-text-muted)]">
                    {item.note}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState
                title="No urgent follow-ups"
                detail="You have no overdue or due-today reminders right now."
                action={
                  <Link href="/follow-ups/new" className="wb-button-secondary">
                    Add follow-up
                  </Link>
                }
              />
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Orders needing action"
          description="New or unpaid orders that can block daily cash flow."
        >
          <div className="space-y-3">
            {ordersNeedingAction.length ? (
              ordersNeedingAction.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block rounded-[22px] border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4 transition hover:bg-white"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[var(--color-wb-text)]">
                        {getPrimaryOrderLabel({
                          customerName: order.customerName,
                          customerPhone: order.customerPhone,
                          orderId: order.id,
                        })}
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
                        {order.channel} •{" "}
                        {formatPaymentStatusLabel(order.paymentStatus)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-[var(--color-wb-primary)]">
                      {formatCurrency(order.amount)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[var(--color-wb-text-muted)]">
                    {order.stage.replaceAll("_", " ")} • Order #
                    {formatOrderReference(order.id) || "WB-00000"} • Updated{" "}
                    {formatDate(order.updatedAt)}
                  </p>
                </Link>
              ))
            ) : (
              <EmptyState
                title="No blocked orders"
                detail="No new or awaiting-payment orders need immediate action."
                action={
                  <Link href="/orders/new" className="wb-button-secondary">
                    Create order
                  </Link>
                }
              />
            )}
          </div>
        </SectionCard>
      </section>

      <SectionCard
        title="Orders Board"
        description="The hero workflow for sellers moving orders from inquiry to delivery."
        actions={
          <Link href="/orders" className="wb-button-secondary">
            View all orders
          </Link>
        }
      >
        <div className="grid gap-4 xl:grid-cols-4">
          <OrderStageBoard title="New order" orders={stageGroups.newOrder} />
          <OrderStageBoard
            title="Awaiting payment"
            orders={stageGroups.waitingPayment}
          />
          <OrderStageBoard
            title="Paid / Packing"
            orders={stageGroups.packing}
          />
          <OrderStageBoard
            title="Dispatch / Delivered"
            orders={stageGroups.dispatch}
          />
        </div>
      </SectionCard>

      <section className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <ChartCard
          title="Weekly performance"
          description="Mon–Sun weekly performance snapshot."
          data={weeklyPerformanceSeries}
          dataKey="amount"
        />
        <SectionCard
          title="Recent activity"
          description="A clean operational timeline for the team."
        >
          {recentActivity.length ? (
            <TimelineList items={recentActivity} />
          ) : (
            <EmptyState
              title="No activity yet"
              detail="New orders, payments, and follow-ups will appear here as your team starts using the workspace."
            />
          )}
        </SectionCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
        <SectionCard
          title="Customer activity"
          description="Living customer records instead of scattered chat names."
        >
          <div className="space-y-3">
            {customers.length ? (
              customers
                .slice(0, 4)
                .map((customer) => (
                  <CustomerRow key={customer.id} customer={customer} />
                ))
            ) : (
              <EmptyState
                title="No customers yet"
                detail="Add your first order or customer to start building buyer records."
                action={
                  <Link href="/customers/new" className="wb-button-secondary">
                    Add customer
                  </Link>
                }
              />
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Quick actions"
          description="Move fast on the most common daily tasks."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/orders/new"
              className="wb-soft-card p-4 transition hover:bg-white"
            >
              <p className="text-sm font-semibold text-[var(--color-wb-text)]">
                Create new order
              </p>
              <p className="mt-1 text-xs text-[var(--color-wb-text-muted)]">
                Add a fresh sale from chat.
              </p>
            </Link>
            <Link
              href="/customers"
              className="wb-soft-card p-4 transition hover:bg-white"
            >
              <p className="text-sm font-semibold text-[var(--color-wb-text)]">
                Open customers
              </p>
              <p className="mt-1 text-xs text-[var(--color-wb-text-muted)]">
                Check buyer history and spend.
              </p>
            </Link>
            <Link
              href="/follow-ups/new"
              className="wb-soft-card p-4 transition hover:bg-white"
            >
              <p className="text-sm font-semibold text-[var(--color-wb-text)]">
                Schedule follow-up
              </p>
              <p className="mt-1 text-xs text-[var(--color-wb-text-muted)]">
                Keep today’s leads from going cold.
              </p>
            </Link>
            <Link
              href="/payments"
              className="wb-soft-card p-4 transition hover:bg-white"
            >
              <p className="text-sm font-semibold text-[var(--color-wb-text)]">
                Review payments
              </p>
              <p className="mt-1 text-xs text-[var(--color-wb-text-muted)]">
                Confirm paid vs pending quickly.
              </p>
            </Link>
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
