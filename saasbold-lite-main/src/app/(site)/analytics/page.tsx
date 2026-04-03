import { BarChart3, TrendingUp } from "lucide-react";
import {
  ChartCard,
  KpiCard,
  PageHeader,
  SectionCard,
  StatStrip,
} from "@/components/whatsboard-dashboard/dashboard-ui";
import { formatCurrency } from "@/components/whatsboard-dashboard/formatting";
import { getAnalyticsSnapshot } from "@/lib/whatsboard-repository";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const { stats: dashboardStats, series: analyticsSeries } =
    await getAnalyticsSnapshot();
  const maxRevenuePoint = [...analyticsSeries].sort(
    (a, b) => b.revenue - a.revenue,
  )[0];
  const minRevenuePoint = [...analyticsSeries].sort(
    (a, b) => a.revenue - b.revenue,
  )[0];
  const topOrderPoint = [...analyticsSeries].sort(
    (a, b) => b.orders - a.orders,
  )[0];

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title="Analytics"
        description="Practical seller metrics with clean charts and no dashboard noise."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <KpiCard
          label="Conversion rate"
          value={`${dashboardStats.conversionRate}%`}
          detail="How efficiently chat leads turn into tracked sales."
          accent={<TrendingUp className="h-5 w-5" />}
        />
        <KpiCard
          label="Revenue month"
          value={formatCurrency(dashboardStats.revenueMonth)}
          detail="Confirmed value moved through the board."
          accent={<BarChart3 className="h-5 w-5" />}
        />
        <KpiCard
          label="New customers"
          value={String(dashboardStats.customersThisMonth)}
          detail="Customers added through order workflows."
          accent={<TrendingUp className="h-5 w-5" />}
        />
      </section>

      <ChartCard
        title="Weekly performance"
        description="Single high-signal view of weekly revenue movement."
        data={analyticsSeries}
        dataKey="revenue"
      />

      <StatStrip
        items={[
          {
            label: "Highest revenue day",
            value: maxRevenuePoint ? `${maxRevenuePoint.label}` : "N/A",
            tone: "success",
          },
          {
            label: "Lowest revenue day",
            value: minRevenuePoint ? `${minRevenuePoint.label}` : "N/A",
            tone: "warning",
          },
          {
            label: "Top order volume",
            value: topOrderPoint
              ? `${topOrderPoint.label} (${topOrderPoint.orders})`
              : "N/A",
            tone: "danger",
          },
          {
            label: "Payout pending",
            value: formatCurrency(dashboardStats.payoutPending),
            tone: "neutral",
          },
        ]}
      />

      <SectionCard
        title="How to use this page"
        description="Use these signals to prioritize the next seller action."
      >
        <div className="grid gap-3 md:grid-cols-3">
          <div className="wb-soft-card p-4">
            <p className="text-sm font-semibold text-[var(--color-wb-text)]">
              Revenue trend
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-wb-text-muted)]">
              Based on live payment records from your workspace.
            </p>
          </div>
          <div className="wb-soft-card p-4">
            <p className="text-sm font-semibold text-[var(--color-wb-text)]">
              Conversion health
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-wb-text-muted)]">
              {dashboardStats.conversionRate}% of tracked orders have reached
              delivered.
            </p>
          </div>
          <div className="wb-soft-card p-4">
            <p className="text-sm font-semibold text-[var(--color-wb-text)]">
              Follow-up pressure
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-wb-text-muted)]">
              {dashboardStats.overdueFollowUps} overdue follow-ups currently
              need action.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
