import AnalyticsDashboard from "@/components/dashboard/analytics-dashboard";
import { requireDashboardFeatureAccess } from "@/lib/dashboard-access";
import { getAnalyticsData } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AnalyticsPage() {
  await requireDashboardFeatureAccess("analytics");
  const { revenueData, paymentMix, areaData, summary } = await getAnalyticsData();

  return (
    <div className="space-y-6">
      <AnalyticsDashboard
        revenueData={revenueData}
        paymentMix={paymentMix}
        areaData={areaData}
        summary={summary}
      />
    </div>
  );
}
