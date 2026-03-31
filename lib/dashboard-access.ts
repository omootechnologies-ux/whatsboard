import { redirect } from "next/navigation";
import {
  canAccessDashboardFeature,
  canCreateOrders,
  canManageOrders,
  getFeatureLabel,
  getMonthlyOrderLimit,
  getMinimumPlanForFeature,
  getPlanName,
  getRemainingMonthlyOrders,
  getEffectivePlanKey,
  type DashboardFeature,
} from "@/lib/plan-access";
import { getViewerContext } from "@/lib/queries";

function getCurrentMonthWindow() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

async function getCurrentMonthOrderCount(
  supabase: Awaited<ReturnType<typeof getViewerContext>>["supabase"],
  businessId: string
) {
  const { start, end } = getCurrentMonthWindow();
  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId)
    .gte("created_at", start)
    .lt("created_at", end);

  return count ?? 0;
}

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

export async function getDashboardWriteAccess() {
  const context = await requireDashboardAccess();
  const orderCountThisMonth = context.businessId
    ? await getCurrentMonthOrderCount(context.supabase, context.businessId)
    : 0;
  const currentPlan = getEffectivePlanKey(context.business);
  const monthlyOrderLimit = getMonthlyOrderLimit(context.business);

  return {
    ...context,
    currentPlan,
    monthlyOrderLimit,
    orderCountThisMonth,
    remainingMonthlyOrders:
      monthlyOrderLimit === null ? null : getRemainingMonthlyOrders(context.business, orderCountThisMonth),
    canManageRecords: context.isAdmin || canManageOrders(context.business),
    canCreateOrders: context.isAdmin || canCreateOrders(context.business, orderCountThisMonth),
  };
}

export async function requireDashboardWriteAccess() {
  const context = await getDashboardWriteAccess();

  if (!context.canManageRecords) {
    redirect("/pricing?status=upgrade&message=Upgrade%20to%20a%20paid%20plan%20to%20add%20or%20edit%20records");
  }

  return context;
}
