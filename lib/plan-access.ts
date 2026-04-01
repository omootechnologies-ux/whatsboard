import type { OrderStage, PaymentStatus } from "@/lib/types";

export type PlanKey = "free" | "starter" | "growth" | "business";
export type DashboardFeature =
  | "overview"
  | "orders"
  | "customers"
  | "followUps"
  | "analytics"
  | "catalog"
  | "settings"
  | "account";

export type PlanCapability =
  | "createOrders"
  | "paymentTracking"
  | "customerProfiles"
  | "followUpReminders"
  | "whatsAppNotifications"
  | "dispatchTracking"
  | "analytics"
  | "catalog"
  | "teamMembers2"
  | "teamMembers5"
  | "prioritySupport"
  | "customBranding"
  | "mpesaReconciliation";

type PlanFeatureLine = {
  label: string;
  comingSoon?: boolean;
};

type BillingBusiness = {
  billing_plan?: string | null;
  billing_status?: string | null;
  billing_current_period_ends_at?: string | null;
};

export const PLAN_CONFIG: Record<
  PlanKey,
  {
    key: PlanKey;
    name: string;
    priceLabel: string;
    amount: number;
    currency: "TZS";
    periodDays: number;
    monthlyOrderLimit: number | null;
    teamMemberLimit: number;
    description: string;
    badge: string;
    highlight?: boolean;
    features: PlanFeatureLine[];
  }
> = {
  free: {
    key: "free",
    name: "Free",
    priceLabel: "TZS 0",
    amount: 0,
    currency: "TZS",
    periodDays: 0,
    monthlyOrderLimit: 30,
    teamMemberLimit: 0,
    description: "Your first 30 orders, free. Feel what it's like to run a real business.",
    badge: "Start here",
    features: [
      { label: "30 orders per month" },
      { label: "Basic dashboard" },
      { label: "Order tracking" },
      { label: "Mobile-first" },
    ],
  },
  starter: {
    key: "starter",
    name: "Starter",
    priceLabel: "TZS 15,000",
    amount: 15000,
    currency: "TZS",
    periodDays: 30,
    monthlyOrderLimit: null,
    teamMemberLimit: 0,
    description: "You're serious now. This is the plan most active sellers use.",
    badge: "Most active sellers",
    highlight: true,
    features: [
      { label: "Unlimited orders" },
      { label: "Follow-up reminders" },
      { label: "Payment tracking" },
      { label: "Customer profiles" },
      { label: "WhatsApp notifications", comingSoon: true },
    ],
  },
  growth: {
    key: "growth",
    name: "Growth",
    priceLabel: "TZS 35,000",
    amount: 35000,
    currency: "TZS",
    periodDays: 30,
    monthlyOrderLimit: null,
    teamMemberLimit: 2,
    description: "Growing team, bigger volume. Built for sellers scaling up.",
    badge: "Scaling teams",
    features: [
      { label: "Everything in Starter" },
      { label: "2 team members" },
      { label: "Dispatch tracking" },
      { label: "Reports & analytics" },
    ],
  },
  business: {
    key: "business",
    name: "Business",
    priceLabel: "TZS 70,000",
    amount: 70000,
    currency: "TZS",
    periodDays: 30,
    monthlyOrderLimit: null,
    teamMemberLimit: 5,
    description: "For multi-channel sellers running a real team operation.",
    badge: "For real teams",
    features: [
      { label: "Everything in Growth" },
      { label: "5 team members" },
      { label: "Priority support" },
      { label: "Custom branding", comingSoon: true },
      { label: "M-Pesa reconciliation", comingSoon: true },
    ],
  },
};

const PLAN_ORDER: Record<PlanKey, number> = {
  free: 0,
  starter: 1,
  growth: 2,
  business: 3,
};

const DASHBOARD_FEATURE_MIN_PLAN: Record<DashboardFeature, PlanKey> = {
  overview: "free",
  orders: "free",
  customers: "starter",
  followUps: "starter",
  analytics: "growth",
  catalog: "growth",
  settings: "free",
  account: "free",
};

const FEATURE_LABELS: Record<DashboardFeature, string> = {
  overview: "Dashboard overview",
  orders: "Orders",
  customers: "Customer profiles",
  followUps: "Follow-up reminders",
  analytics: "Reports & analytics",
  catalog: "Catalog",
  settings: "Settings",
  account: "Account",
};

const CAPABILITY_MIN_PLAN: Record<PlanCapability, PlanKey> = {
  createOrders: "free",
  paymentTracking: "starter",
  customerProfiles: "starter",
  followUpReminders: "starter",
  whatsAppNotifications: "starter",
  dispatchTracking: "growth",
  analytics: "growth",
  catalog: "growth",
  teamMembers2: "growth",
  teamMembers5: "business",
  prioritySupport: "business",
  customBranding: "business",
  mpesaReconciliation: "business",
};

const FREE_ORDER_STAGES: OrderStage[] = ["new_order", "waiting_payment"];
const STARTER_ORDER_STAGES: OrderStage[] = ["new_order", "waiting_payment", "paid", "follow_up"];
const GROWTH_ORDER_STAGES: OrderStage[] = [
  "new_order",
  "waiting_payment",
  "paid",
  "packing",
  "dispatched",
  "delivered",
  "follow_up",
];

const FREE_PAYMENT_STATUSES: PaymentStatus[] = ["unpaid"];
const PAID_PAYMENT_STATUSES: PaymentStatus[] = ["unpaid", "partial", "paid", "cod"];

export function getPlanConfig(planKey?: string | null) {
  if (!planKey || !(planKey in PLAN_CONFIG)) return null;
  return PLAN_CONFIG[planKey as PlanKey];
}

export function getPlanName(planKey?: string | null) {
  if (!planKey) return "Free";
  return getPlanConfig(planKey)?.name ?? planKey;
}

export function getMinimumPlanForFeature(feature: DashboardFeature) {
  return DASHBOARD_FEATURE_MIN_PLAN[feature];
}

export function getFeatureLabel(feature: DashboardFeature) {
  return FEATURE_LABELS[feature];
}

export function isBillingActive(business?: BillingBusiness | null) {
  if (!business || business.billing_status !== "active") {
    return false;
  }

  if (!business.billing_current_period_ends_at) {
    return true;
  }

  const endsAt = new Date(business.billing_current_period_ends_at).getTime();

  if (!Number.isFinite(endsAt)) {
    return true;
  }

  return endsAt >= Date.now();
}

export function getEffectivePlanKey(business?: BillingBusiness | null): PlanKey {
  const rawPlan = business?.billing_plan?.trim().toLowerCase();

  if (rawPlan === "free") {
    return "free";
  }

  if (rawPlan && rawPlan in PLAN_CONFIG && isBillingActive(business)) {
    return rawPlan as PlanKey;
  }

  return "free";
}

export function canAccessDashboardFeature(feature: DashboardFeature, business?: BillingBusiness | null) {
  const currentPlan = getEffectivePlanKey(business);
  return PLAN_ORDER[currentPlan] >= PLAN_ORDER[DASHBOARD_FEATURE_MIN_PLAN[feature]];
}

export function canUsePlanCapability(capability: PlanCapability, business?: BillingBusiness | null) {
  const currentPlan = getEffectivePlanKey(business);
  return PLAN_ORDER[currentPlan] >= PLAN_ORDER[CAPABILITY_MIN_PLAN[capability]];
}

export function getMonthlyOrderLimit(business?: BillingBusiness | null) {
  return PLAN_CONFIG[getEffectivePlanKey(business)].monthlyOrderLimit;
}

export function getTeamMemberLimit(business?: BillingBusiness | null) {
  return PLAN_CONFIG[getEffectivePlanKey(business)].teamMemberLimit;
}

export function getRemainingMonthlyOrders(
  business: BillingBusiness | null | undefined,
  currentMonthOrderCount: number
) {
  const limit = getMonthlyOrderLimit(business);

  if (limit === null) {
    return null;
  }

  return Math.max(limit - currentMonthOrderCount, 0);
}

export function canCreateOrders(
  business: BillingBusiness | null | undefined,
  currentMonthOrderCount: number
) {
  const remaining = getRemainingMonthlyOrders(business, currentMonthOrderCount);
  return remaining === null || remaining > 0;
}

export function getAllowedOrderStages(business?: BillingBusiness | null): OrderStage[] {
  const plan = getEffectivePlanKey(business);

  if (plan === "free") {
    return FREE_ORDER_STAGES;
  }

  if (plan === "starter") {
    return STARTER_ORDER_STAGES;
  }

  return GROWTH_ORDER_STAGES;
}

export function getAllowedPaymentStatuses(business?: BillingBusiness | null): PaymentStatus[] {
  return canUsePlanCapability("paymentTracking", business) ? PAID_PAYMENT_STATUSES : FREE_PAYMENT_STATUSES;
}

export function canManageOrders(business?: BillingBusiness | null) {
  return canUsePlanCapability("createOrders", business);
}

export function getAccessibleDashboardFeatures(business?: BillingBusiness | null) {
  return (Object.keys(DASHBOARD_FEATURE_MIN_PLAN) as DashboardFeature[]).filter((feature) =>
    canAccessDashboardFeature(feature, business)
  );
}
