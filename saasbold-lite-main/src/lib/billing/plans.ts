export const BILLING_PLAN_KEYS = [
  "free",
  "starter",
  "growth",
  "business",
] as const;

export type BillingPlanKey = (typeof BILLING_PLAN_KEYS)[number];

export type BillingPlanConfig = {
  key: BillingPlanKey;
  name: string;
  priceTzs: number;
  orderLimitPerMonth: number | null;
  teamMemberLimit: number;
};

const BILLING_PLAN_CONFIG: Record<BillingPlanKey, BillingPlanConfig> = {
  free: {
    key: "free",
    name: "Free",
    priceTzs: 0,
    orderLimitPerMonth: 30,
    teamMemberLimit: 1,
  },
  starter: {
    key: "starter",
    name: "Starter",
    priceTzs: 15_000,
    orderLimitPerMonth: null,
    teamMemberLimit: 1,
  },
  growth: {
    key: "growth",
    name: "Growth",
    priceTzs: 35_000,
    orderLimitPerMonth: null,
    teamMemberLimit: 2,
  },
  business: {
    key: "business",
    name: "Business",
    priceTzs: 70_000,
    orderLimitPerMonth: null,
    teamMemberLimit: 5,
  },
};

export function isBillingPlanKey(value: string): value is BillingPlanKey {
  return BILLING_PLAN_KEYS.includes(value as BillingPlanKey);
}

export function parseBillingPlan(value: string | null | undefined) {
  if (!value) return "free" as BillingPlanKey;
  const normalized = value.trim().toLowerCase();
  if (!isBillingPlanKey(normalized)) return "free";
  return normalized;
}

export function getBillingPlanConfig(plan: BillingPlanKey): BillingPlanConfig {
  return BILLING_PLAN_CONFIG[plan];
}

export function listBillingPlanConfigs(): BillingPlanConfig[] {
  return BILLING_PLAN_KEYS.map((key) => BILLING_PLAN_CONFIG[key]);
}

export function formatPlanPriceLabel(priceTzs: number) {
  return `TZS ${priceTzs.toLocaleString("en-TZ")}`;
}

export function buildBillingCheckoutPath(plan: BillingPlanKey) {
  return `/billing?checkout=${plan}`;
}

export function buildPlanRegisterHref(plan: BillingPlanKey) {
  return `/register?next=${encodeURIComponent(buildBillingCheckoutPath(plan))}&plan=${plan}`;
}
