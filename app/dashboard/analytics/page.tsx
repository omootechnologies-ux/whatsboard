import AnalyticsDashboard from "@/components/dashboard/analytics-dashboard";
import { DashboardPage } from "@/components/dashboard/page-primitives";
import { requireDashboardFeatureAccess } from "@/lib/dashboard-access";
import { getAnalyticsData } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AnalyticsPage() {
  await requireDashboardFeatureAccess("analytics");
  const { revenueData, paymentMix, areaData, summary } = await getAnalyticsData();

  return (
    <DashboardPage>
      <AnalyticsDashboard
        revenueData={revenueData}
        paymentMix={paymentMix}
        areaData={areaData}
        summary={summary}
      />
    </DashboardPage>
  );
}
