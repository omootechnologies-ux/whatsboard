import { redirect } from "next/navigation";
import {
  canAccessDashboardFeature,
  getFeatureLabel,
  getMinimumPlanForFeature,
  getPlanName,
  type DashboardFeature,
} from "@/lib/plan-access";
import { getViewerContext } from "@/lib/queries";

export async function requireDashboardAccess() {
  const context = await getViewerContext();

  if (!context.user) {
    redirect("/login");
  }

  if (context.isAdmin) {
    return context;
  }

  if (!canAccessDashboardFeature("overview", context.business)) {
    redirect("/pricing?status=required&message=Pay%20for%20a%20plan%20to%20open%20the%20dashboard");
  }

  return context;
}

export async function requireDashboardFeatureAccess(feature: DashboardFeature) {
  const context = await requireDashboardAccess();

  if (context.isAdmin) {
    return context;
  }

  if (!canAccessDashboardFeature(feature, context.business)) {
    const minimumPlan = getMinimumPlanForFeature(feature);
    const featureLabel = getFeatureLabel(feature);
    const message = `${featureLabel} requires the ${getPlanName(minimumPlan)} plan or higher.`;
    redirect(`/pricing?status=upgrade&message=${encodeURIComponent(message)}`);
  }

  return context;
}
