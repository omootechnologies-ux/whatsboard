export type PlanKey = "starter" | "growth" | "business";
export type DashboardFeature =
  | "overview"
  | "orders"
  | "customers"
  | "followUps"
  | "catalog"
  | "settings"
  | "account"
  | "aiCapture"
  | "analytics"
  | "referrals";

export const PLAN_CONFIG: Record<
  PlanKey,
  {
    key: PlanKey;
    name: string;
    priceLabel: string;
    amount: number;
    currency: "TZS";
    periodDays: number;
    description: string;
  }
> = {
  starter: {
    key: "starter",
    name: "Starter",
    priceLabel: "TZS 29,000",
    amount: 29000,
    currency: "TZS",
    periodDays: 30,
    description: "Starter monthly plan",
  },
  growth: {
    key: "growth",
    name: "Growth",
    priceLabel: "TZS 79,000",
    amount: 79000,
    currency: "TZS",
    periodDays: 30,
    description: "Growth monthly plan",
  },
  business: {
    key: "business",
    name: "Business",
    priceLabel: "TZS 149,000",
    amount: 149000,
    currency: "TZS",
    periodDays: 30,
    description: "Business monthly plan",
  },
};

const PLAN_ORDER: Record<PlanKey, number> = {
  starter: 1,
  growth: 2,
  business: 3,
};

const FEATURE_MIN_PLAN: Record<DashboardFeature, PlanKey> = {
  overview: "starter",
  orders: "starter",
  customers: "starter",
  followUps: "starter",
  settings: "starter",
  account: "starter",
  catalog: "growth",
  aiCapture: "business",
  analytics: "business",
  referrals: "business",
};

const FEATURE_LABELS: Record<DashboardFeature, string> = {
  overview: "Dashboard overview",
  orders: "Orders",
  customers: "Customers",
  followUps: "Follow-ups",
  settings: "Settings",
  account: "Account",
  catalog: "Catalog",
  aiCapture: "AI Order Capture",
  analytics: "Analytics",
  referrals: "Referrals",
};

type BillingBusiness = {
  billing_plan?: string | null;
  billing_status?: string | null;
  billing_current_period_ends_at?: string | null;
};

export function getPlanConfig(planKey: string) {
  if (!(planKey in PLAN_CONFIG)) return null;
  return PLAN_CONFIG[planKey as PlanKey];
}

export function getPlanName(planKey?: string | null) {
  if (!planKey) return null;
  return getPlanConfig(planKey)?.name ?? planKey;
}

export function getMinimumPlanForFeature(feature: DashboardFeature) {
  return FEATURE_MIN_PLAN[feature];
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

export function canAccessDashboardFeature(feature: DashboardFeature, business?: BillingBusiness | null) {
  if (!isBillingActive(business)) {
    return false;
  }

  const currentPlan = business?.billing_plan ? getPlanConfig(business.billing_plan)?.key ?? null : null;

  if (!currentPlan) {
    return false;
  }

  return PLAN_ORDER[currentPlan] >= PLAN_ORDER[FEATURE_MIN_PLAN[feature]];
}

export function getAccessibleDashboardFeatures(business?: BillingBusiness | null) {
  return (Object.keys(FEATURE_MIN_PLAN) as DashboardFeature[]).filter((feature) =>
    canAccessDashboardFeature(feature, business)
  );
}
