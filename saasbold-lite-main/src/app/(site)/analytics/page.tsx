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

export default async function AnalyticsPage() {
  const { stats: dashboardStats, series: analyticsSeries } =
    await getAnalyticsSnapshot();

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title="Analytics"
        description="Practical seller metrics with clean charts and no dashboard noise."
        primaryAction={
          <button className="wb-button-primary">
            <BarChart3 className="h-4 w-4" />
            Export Report
          </button>
        }
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
            label: "Best conversion days",
            value: "Fri / Sat",
            tone: "success",
          },
          { label: "Slowest day", value: "Mon", tone: "warning" },
          {
            label: "Top operational risk",
            value: "Late follow-up",
            tone: "danger",
          },
          {
            label: "Priority action",
            value: "Confirm pending pay",
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
              Protect conversion first
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-wb-text-muted)]">
              When conversion dips, check overdue follow-ups and waiting
              payments before adding new campaigns.
            </p>
          </div>
          <div className="wb-soft-card p-4">
            <p className="text-sm font-semibold text-[var(--color-wb-text)]">
              Align dispatch rhythm
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-wb-text-muted)]">
              Match packing and courier scheduling to peak order days so
              deliveries stay predictable.
            </p>
          </div>
          <div className="wb-soft-card p-4">
            <p className="text-sm font-semibold text-[var(--color-wb-text)]">
              Scale repeat buyers
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-wb-text-muted)]">
              Focus on high-spend customer segments and convert one-time buyers
              into repeat order flows.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
