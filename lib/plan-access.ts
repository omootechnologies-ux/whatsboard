export type PlanKey = "free" | "starter" | "growth" | "business";
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
  free: {
    key: "free",
    name: "Free",
    priceLabel: "TZS 0",
    amount: 0,
    currency: "TZS",
    periodDays: 0,
    description: "Free read-only dashboard plan",
  },
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
  free: 0,
  starter: 1,
  growth: 2,
  business: 3,
};

const FEATURE_MIN_PLAN: Record<DashboardFeature, PlanKey> = {
  overview: "free",
  orders: "free",
  customers: "free",
  followUps: "free",
  settings: "free",
  account: "free",
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
  if (!planKey) return "Free";
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

export function hasPaidPlan(business?: BillingBusiness | null) {
  return getEffectivePlanKey(business) !== "free";
}

export function canManageImportantRecords(business?: BillingBusiness | null) {
  return hasPaidPlan(business);
}

export function canAccessDashboardFeature(feature: DashboardFeature, business?: BillingBusiness | null) {
  const currentPlan = getEffectivePlanKey(business);

  return PLAN_ORDER[currentPlan] >= PLAN_ORDER[FEATURE_MIN_PLAN[feature]];
}

export function getAccessibleDashboardFeatures(business?: BillingBusiness | null) {
  return (Object.keys(FEATURE_MIN_PLAN) as DashboardFeature[]).filter((feature) =>
    canAccessDashboardFeature(feature, business)
  );
}
