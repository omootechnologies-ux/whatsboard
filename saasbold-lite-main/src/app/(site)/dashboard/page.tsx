import Link from "next/link";
import { Bell, CreditCard, Package2, Users } from "lucide-react";
import { getLocale } from "next-intl/server";
import {
  BuyerBadge,
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
import { getReceiptViewsThisMonthForCurrentBusiness } from "@/lib/receipts/receipt-service";
import {
  formatOrderReference,
  formatPaymentStatusLabel,
  getPrimaryOrderLabel,
} from "@/lib/display-labels";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const locale = await getLocale();
  const isSw = locale === "sw";
  const [
    { stats: dashboardStats, customers, followUps, orders },
    payments,
    receiptViewsThisMonth,
  ] = await Promise.all([
    getDashboardSnapshot(),
    listPayments(),
    getReceiptViewsThisMonthForCurrentBusiness().catch(() => 0),
  ]);
  const totalUniqueCustomers = customers.length;
  const repeatCustomers = customers.filter((customer) => customer.isRepeatBuyer)
    .length;
  const atRiskCustomers = customers.filter(
    (customer) => customer.buyerStatus === "at_risk",
  ).length;
  const repeatBuyerPercentage = totalUniqueCustomers
    ? Math.round((repeatCustomers / totalUniqueCustomers) * 100)
    : 0;
  const now = new Date();
  const currentMonth = now.getUTCMonth();
  const currentYear = now.getUTCFullYear();
  const monthSpendByCustomer = new Map<string, number>();
  orders.forEach((order) => {
    const date = new Date(order.createdAt);
    if (
      date.getUTCMonth() !== currentMonth ||
      date.getUTCFullYear() !== currentYear
    ) {
      return;
    }
    const current = monthSpendByCustomer.get(order.customerId) || 0;
    monthSpendByCustomer.set(order.customerId, current + order.amount);
  });
  const bestCustomerEntry = Array.from(monthSpendByCustomer.entries()).sort(
    (a, b) => b[1] - a[1],
  )[0];
  const bestCustomerThisMonth = bestCustomerEntry
    ? customers.find((customer) => customer.id === bestCustomerEntry[0]) || null
    : null;

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
      title: `${isSw ? "Order #" : "Order #"}${formatOrderReference(order.id) || "WB-00000"} ${isSw ? "ipo" : "is"} ${order.stage.replaceAll("_", " ")}`,
      detail: `${getPrimaryOrderLabel({
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        orderId: order.id,
      })} • ${formatCurrency(order.amount)}`,
    })),
    ...followUps.map((item) => ({
      at: item.dueAt,
      title: `${item.status.toUpperCase()} ${isSw ? "follow-up" : "follow-up"}: ${item.title}`,
      detail: `${getPrimaryOrderLabel({
        customerName: item.customerName,
        orderId: item.orderId,
        kind: "customer",
      })}${item.orderId ? ` • Order #${formatOrderReference(item.orderId) || "WB-00000"}` : ""}`,
    })),
    ...payments.map((payment) => ({
      at: payment.createdAt,
      title: `${isSw ? "Malipo" : "Payment"} ${formatPaymentStatusLabel(payment.status)} • ${formatOrderReference(payment.orderId) || "WB-00000"}`,
      detail: `${getPrimaryOrderLabel({
        customerName: payment.customerName,
        orderId: payment.orderId,
        kind: "customer",
      })} • ${formatCurrency(payment.amount)} ${isSw ? "kupitia" : "via"} ${payment.method}`,
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
        title={isSw ? "Dashibodi" : "Dashboard"}
        description={
          isSw
            ? "Control room yako ya kila siku kwa orders, malipo, wateja, na follow-ups kwenye WhatsApp na channels za social."
            : "Your daily control room for orders, payments, customers, and follow-ups across WhatsApp and social channels."
        }
        secondaryAction={
          <Link href="/orders" className="wb-button-secondary">
            {isSw ? "Fungua Board ya Orders" : "Open Orders Board"}
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label={isSw ? "Orders active" : "Active orders"}
          value={String(dashboardStats.activeOrders)}
          detail={
            isSw
              ? "Orders zinazoendelea kwenye hatua zote."
              : "Orders currently in motion across all stages."
          }
          accent={<Package2 className="h-5 w-5" />}
        />
        <KpiCard
          label={isSw ? "Follow-ups zilizochelewa" : "Overdue follow-ups"}
          value={String(dashboardStats.overdueFollowUps)}
          detail={
            isSw
              ? "Wateja wanaosubiri jibu lako au ukumbusho wa malipo."
              : "Customers waiting for your next reply or payment reminder."
          }
          accent={<Bell className="h-5 w-5" />}
        />
        <KpiCard
          label={isSw ? "Mauzo mwezi huu" : "Sales this month"}
          value={formatCurrency(dashboardStats.revenueMonth)}
          detail={
            isSw
              ? "Mapato yaliyothibitishwa ndani ya Folapp."
              : "Confirmed revenue tracked inside Folapp."
          }
          accent={<CreditCard className="h-5 w-5" />}
        />
        <KpiCard
          label={isSw ? "Wateja walioongezwa" : "Customers added"}
          value={String(dashboardStats.customersThisMonth)}
          detail={
            isSw
              ? `${dashboardStats.conversionRate}% conversion kutoka inquiry ya chat hadi order iliyofuatiliwa.`
              : `${dashboardStats.conversionRate}% conversion from chat inquiry to tracked order.`
          }
          accent={<Users className="h-5 w-5" />}
        />
      </section>

      <StatStrip
        items={[
          {
            label: isSw ? "Inasubiri malipo" : "Awaiting payment",
            value: String(stageGroups.waitingPayment.length),
            tone: "warning",
          },
          {
            label: isSw ? "Tayari kutuma" : "Ready to dispatch",
            value: String(stageGroups.packing.length),
            tone: "neutral",
          },
          {
            label: isSw ? "Imefika" : "Delivered",
            value: String(
              stageGroups.dispatch.filter(
                (order) => order.stage === "delivered",
              ).length,
            ),
            tone: "success",
          },
          {
            label: isSw ? "Malipo yanayosubiri" : "Payout pending",
            value: formatCurrency(dashboardStats.payoutPending),
            tone: "danger",
          },
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard
          title={isSw ? "Insights za Wateja" : "Customer Insights"}
          description={
            isSw
              ? "Muhtasari wa retention na ukuaji kutoka tabia halisi ya wanunuzi."
              : "Retention and growth snapshot from real buyer behavior."
          }
          actions={
            <Link href="/customers?status=at_risk" className="wb-button-secondary">
              {isSw ? "Tazama wanunuzi wa hatari" : "View at-risk buyers"}
            </Link>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                {isSw ? "Jumla ya wateja wa kipekee" : "Total unique customers"}
              </p>
              <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--color-wb-text)]">
                {totalUniqueCustomers}
              </p>
            </div>
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                {isSw ? "Asilimia ya wanunuzi wa kurudia" : "Repeat buyer %"}
              </p>
              <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--color-wb-primary)]">
                {repeatBuyerPercentage}%
              </p>
            </div>
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                {isSw ? "Wateja wa hatari" : "At-risk customers"}
              </p>
              <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--color-wb-warning)]">
                {atRiskCustomers}
              </p>
            </div>
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                {isSw ? "Mteja bora mwezi huu" : "Best customer this month"}
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-wb-text)]">
                {bestCustomerThisMonth
                  ? `${bestCustomerThisMonth.name} • LTV ${formatCurrency(bestCustomerThisMonth.totalSpend)}`
                  : isSw
                    ? "Bado hakuna shughuli za wateja"
                    : "No customer activity yet"}
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title={isSw ? "Vikumbusho vya CRM" : "CRM nudges"}
          description={
            isSw
              ? "Mapendekezo ya hatua kulinda mapato ya wanunuzi wa kurudia."
              : "Action prompts to protect repeat revenue."
          }
        >
          <div className="space-y-3">
            <div className="rounded-[22px] border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4">
              <p className="text-sm font-semibold text-[var(--color-wb-text)]">
                {isSw ? "Receipts zilizotazamwa" : "Receipts viewed"}
              </p>
              <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
                {isSw
                  ? `Receipt zako zimetazamwa mara ${receiptViewsThisMonth} mwezi huu.`
                  : `Your receipts were viewed ${receiptViewsThisMonth} times this month.`}
              </p>
            </div>
            <div className="rounded-[22px] border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4">
              <p className="text-sm font-semibold text-[var(--color-wb-text)]">
                {isSw ? "Muhtasari wa leo" : "Daily digest"}
              </p>
              <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
                {atRiskCustomers > 0
                  ? `${atRiskCustomers} repeat buyers haven't ordered in 3 weeks — follow up today.`
                  : isSw
                    ? "Hakuna wanunuzi wa kurudia walio hatarini leo. Endelea na follow-up za mapema."
                    : "No repeat buyers at-risk today. Keep momentum with proactive follow-ups."}
              </p>
            </div>
            <div className="rounded-[22px] border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4">
              <p className="text-sm font-semibold text-[var(--color-wb-text)]">
                {isSw ? "Lengo la retention" : "Retention focus"}
              </p>
              <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
                {isSw
                  ? "Weka kipaumbele kwa wanunuzi wa kurudia wenye shughuli ndogo hivi karibuni ili kurejesha mapato yaliyonyamaza."
                  : "Prioritize repeat buyers with low recent activity to recover silent revenue."}
              </p>
            </div>
            <div className="rounded-[22px] border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4">
              <p className="text-sm font-semibold text-[var(--color-wb-text)]">
                {isSw ? "Afya ya wanunuzi" : "Buyer health"}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <BuyerBadge status="repeat" compact />
                <BuyerBadge status="at_risk" compact />
                <BuyerBadge status="lost" compact />
              </div>
            </div>
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          title={isSw ? "Follow-ups za haraka" : "Urgent follow-ups"}
          description={
            isSw
              ? "Vitendo vya wateja vilivyochelewa na vinavyodaiwa leo."
              : "Overdue and due-today customer actions."
          }
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
                title={
                  isSw ? "Hakuna follow-up za haraka" : "No urgent follow-ups"
                }
                detail={
                  isSw
                    ? "Kwa sasa huna vikumbusho vilivyochelewa au vya leo."
                    : "You have no overdue or due-today reminders right now."
                }
                action={
                  <Link href="/follow-ups/new" className="wb-button-secondary">
                    {isSw ? "Ongeza follow-up" : "Add follow-up"}
                  </Link>
                }
              />
            )}
          </div>
        </SectionCard>

        <SectionCard
          title={isSw ? "Orders zinazohitaji hatua" : "Orders needing action"}
          description={
            isSw
              ? "Orders mpya au zisizolipwa zinazoweza kuzuia mzunguko wa fedha wa kila siku."
              : "New or unpaid orders that can block daily cash flow."
          }
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
                      <div className="mt-2">
                        <BuyerBadge status={order.customerBuyerStatus} compact />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-[var(--color-wb-primary)]">
                      {formatCurrency(order.amount)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[var(--color-wb-text-muted)]">
                    {order.stage.replaceAll("_", " ")} • {isSw ? "Order #" : "Order #"}
                    {formatOrderReference(order.id) || "WB-00000"} • Updated{" "}
                    {isSw ? "Imeboreshwa" : "Updated"} {formatDate(order.updatedAt)}
                  </p>
                </Link>
              ))
            ) : (
              <EmptyState
                title={isSw ? "Hakuna orders zilizokwama" : "No blocked orders"}
                detail={
                  isSw
                    ? "Hakuna orders mpya au zinazosubiri malipo zinazohitaji hatua ya haraka."
                    : "No new or awaiting-payment orders need immediate action."
                }
                action={
                  <Link href="/orders/new" className="wb-button-secondary">
                    {isSw ? "Unda order" : "Create order"}
                  </Link>
                }
              />
            )}
          </div>
        </SectionCard>
      </section>

      <SectionCard
        title={isSw ? "Board ya Orders" : "Orders Board"}
        description={
          isSw
            ? "Workflow kuu kwa wauzaji wanaosogeza orders kutoka inquiry hadi delivery."
            : "The hero workflow for sellers moving orders from inquiry to delivery."
        }
        actions={
          <Link href="/orders" className="wb-button-secondary">
            {isSw ? "Tazama orders zote" : "View all orders"}
          </Link>
        }
      >
        <div className="grid gap-4 xl:grid-cols-4">
          <OrderStageBoard
            title={isSw ? "Order mpya" : "New order"}
            orders={stageGroups.newOrder}
          />
          <OrderStageBoard
            title={isSw ? "Inasubiri malipo" : "Awaiting payment"}
            orders={stageGroups.waitingPayment}
          />
          <OrderStageBoard
            title={isSw ? "Imelipwa / Inapakiwa" : "Paid / Packing"}
            orders={stageGroups.packing}
          />
          <OrderStageBoard
            title={isSw ? "Kutuma / Imefika" : "Dispatch / Delivered"}
            orders={stageGroups.dispatch}
          />
        </div>
      </SectionCard>

      <section className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <ChartCard
          title={isSw ? "Utendaji wa wiki" : "Weekly performance"}
          description={
            isSw
              ? "Muhtasari wa utendaji wa wiki (Mon–Sun)."
              : "Mon–Sun weekly performance snapshot."
          }
          data={weeklyPerformanceSeries}
          dataKey="amount"
        />
        <SectionCard
          title={isSw ? "Shughuli za karibuni" : "Recent activity"}
          description={
            isSw
              ? "Mstari wa muda safi wa operesheni kwa timu."
              : "A clean operational timeline for the team."
          }
        >
          {recentActivity.length ? (
            <TimelineList items={recentActivity} />
          ) : (
            <EmptyState
              title={isSw ? "Bado hakuna shughuli" : "No activity yet"}
              detail={
                isSw
                  ? "Orders mpya, malipo na follow-ups zitaonekana hapa timu yako itakapoanza kutumia workspace."
                  : "New orders, payments, and follow-ups will appear here as your team starts using the workspace."
              }
            />
          )}
        </SectionCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
        <SectionCard
          title={isSw ? "Shughuli za wateja" : "Customer activity"}
          description={
            isSw
              ? "Rekodi hai za wateja badala ya majina yaliotawanyika kwenye chat."
              : "Living customer records instead of scattered chat names."
          }
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
                title={isSw ? "Bado hakuna wateja" : "No customers yet"}
                detail={
                  isSw
                    ? "Ongeza order au mteja wako wa kwanza kuanza kujenga rekodi za wanunuzi."
                    : "Add your first order or customer to start building buyer records."
                }
                action={
                  <Link href="/customers/new" className="wb-button-secondary">
                    {isSw ? "Ongeza mteja" : "Add customer"}
                  </Link>
                }
              />
            )}
          </div>
        </SectionCard>

        <SectionCard
          title={isSw ? "Hatua za haraka" : "Quick actions"}
          description={
            isSw
              ? "Fanya haraka kazi za kila siku zinazotumika zaidi."
              : "Move fast on the most common daily tasks."
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/orders/new"
              className="wb-soft-card p-4 transition hover:bg-white"
            >
              <p className="text-sm font-semibold text-[var(--color-wb-text)]">
                {isSw ? "Unda order mpya" : "Create new order"}
              </p>
              <p className="mt-1 text-xs text-[var(--color-wb-text-muted)]">
                {isSw ? "Ongeza mauzo mapya kutoka chat." : "Add a fresh sale from chat."}
              </p>
            </Link>
            <Link
              href="/customers"
              className="wb-soft-card p-4 transition hover:bg-white"
            >
              <p className="text-sm font-semibold text-[var(--color-wb-text)]">
                {isSw ? "Fungua wateja" : "Open customers"}
              </p>
              <p className="mt-1 text-xs text-[var(--color-wb-text-muted)]">
                {isSw
                  ? "Angalia historia ya mnunuzi na matumizi."
                  : "Check buyer history and spend."}
              </p>
            </Link>
            <Link
              href="/follow-ups/new"
              className="wb-soft-card p-4 transition hover:bg-white"
            >
              <p className="text-sm font-semibold text-[var(--color-wb-text)]">
                {isSw ? "Panga follow-up" : "Schedule follow-up"}
              </p>
              <p className="mt-1 text-xs text-[var(--color-wb-text-muted)]">
                {isSw
                  ? "Zuia leads za leo zisipoweza kupoa."
                  : "Keep today’s leads from going cold."}
              </p>
            </Link>
            <Link
              href="/payments"
              className="wb-soft-card p-4 transition hover:bg-white"
            >
              <p className="text-sm font-semibold text-[var(--color-wb-text)]">
                {isSw ? "Kagua malipo" : "Review payments"}
              </p>
              <p className="mt-1 text-xs text-[var(--color-wb-text-muted)]">
                {isSw
                  ? "Thibitisha yaliyolipwa dhidi ya yanayosubiri haraka."
                  : "Confirm paid vs pending quickly."}
              </p>
            </Link>
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
