import { PageHeader } from "@/components/whatsboard-dashboard/dashboard-ui";
import { AnalyticsDashboard } from "@/components/whatsboard-dashboard/analytics-dashboard";
import { getAnalyticsPageData } from "@/lib/analytics/analytics-page-data";
import { getLocale } from "next-intl/server";
import { translateUiText } from "@/lib/ui-translations";

export const dynamic = "force-dynamic";

export default async function DashboardAnalyticsPage() {
  const locale = await getLocale();
  const tr = (value: string) => translateUiText(value, locale as "en" | "sw");
  const { orders, payments, customers, receiptViews } = await getAnalyticsPageData();

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title={tr("Analytics")}
        description={tr(
          "Revenue, funnel, channel, payment, customer, and item insights with configurable time ranges.",
        )}
      />
      <AnalyticsDashboard
        orders={orders}
        payments={payments}
        customers={customers}
        receiptViews={receiptViews}
      />
    </div>
  );
}
