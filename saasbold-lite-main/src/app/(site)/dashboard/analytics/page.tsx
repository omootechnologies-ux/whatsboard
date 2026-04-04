import { PageHeader } from "@/components/whatsboard-dashboard/dashboard-ui";
import { AnalyticsDashboard } from "@/components/whatsboard-dashboard/analytics-dashboard";
import { getAnalyticsPageData } from "@/lib/analytics/analytics-page-data";

export const dynamic = "force-dynamic";

export default async function DashboardAnalyticsPage() {
  const { orders, payments, customers } = await getAnalyticsPageData();

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title="Analytics"
        description="Revenue, funnel, channel, payment, customer, and item insights with configurable time ranges."
      />
      <AnalyticsDashboard
        orders={orders}
        payments={payments}
        customers={customers}
      />
    </div>
  );
}

