import Link from "next/link";
import { Bell, CreditCard, Package2, Plus, Users } from "lucide-react";
import {
  ChartCard,
  CustomerRow,
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
import { getDashboardSnapshot } from "@/lib/whatsboard-repository";

export default function DashboardPage() {
  const {
    stats: dashboardStats,
    customers,
    followUps,
    orders,
  } = getDashboardSnapshot();
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

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title="Dashboard"
        description="Your daily control room for orders, payments, customers, and follow-ups across WhatsApp and social channels."
        primaryAction={
          <Link href="/orders/new" className="wb-button-primary">
            <Plus className="h-4 w-4" />
            Create Order
          </Link>
        }
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
            {urgentFollowUps.map((item) => (
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
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Orders needing action"
          description="New or unpaid orders that can block daily cash flow."
        >
          <div className="space-y-3">
            {ordersNeedingAction.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block rounded-[22px] border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4 transition hover:bg-white"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[var(--color-wb-text)]">
                      {order.id}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
                      {order.customerName}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-[var(--color-wb-primary)]">
                    {formatCurrency(order.amount)}
                  </span>
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[var(--color-wb-text-muted)]">
                  {order.stage.replaceAll("_", " ")} • Updated{" "}
                  {formatDate(order.updatedAt)}
                </p>
              </Link>
            ))}
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
          title="Weekly order pulse"
          description="One useful chart showing the rhythm of your order flow."
          data={[
            { label: "Mon", orders: 19 },
            { label: "Tue", orders: 22 },
            { label: "Wed", orders: 24 },
            { label: "Thu", orders: 28 },
            { label: "Fri", orders: 33 },
            { label: "Sat", orders: 37 },
            { label: "Sun", orders: 26 },
          ]}
          dataKey="orders"
        />
        <SectionCard
          title="Recent activity"
          description="A clean operational timeline for the team."
        >
          <TimelineList
            items={[
              {
                title: "Order WB-3402 moved to paid",
                detail:
                  "Kevin Otieno completed payment and is waiting for packing.",
                meta: "Today",
              },
              {
                title: "Follow-up due for Neema Kileo",
                detail:
                  "Customer still needs pink bundle photos before confirming.",
                meta: "14:00",
              },
              {
                title: "Dispatch queued for Rashid Salum",
                detail:
                  "Courier requested a backup phone number before handoff.",
                meta: "Tomorrow",
              },
            ]}
          />
        </SectionCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
        <SectionCard
          title="Customer activity"
          description="Living customer records instead of scattered chat names."
        >
          <div className="space-y-3">
            {customers.slice(0, 4).map((customer) => (
              <CustomerRow key={customer.id} customer={customer} />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Quick actions"
          description="Move fast on the most common daily tasks."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/orders"
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
              href="/customers/new"
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
              href="/payments/new"
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
