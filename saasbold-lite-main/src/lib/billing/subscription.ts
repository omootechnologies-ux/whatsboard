import type { SupabaseClient } from "@supabase/supabase-js";
import {
  type BillingPlanKey,
  getBillingPlanConfig,
  parseBillingPlan,
} from "@/lib/billing/plans";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

type BusinessBillingRow = {
  id: string;
  name: string | null;
  currency: string | null;
  billing_plan: string | null;
  billing_status: string | null;
  billing_current_period_starts_at: string | null;
  billing_current_period_ends_at: string | null;
};

type BillingStatus = "active" | "inactive" | "past_due" | "cancelled" | string;

export type BusinessBillingState = {
  businessId: string;
  businessName: string;
  currency: string;
  plan: BillingPlanKey;
  status: BillingStatus;
  periodStartsAt: string | null;
  periodEndsAt: string | null;
  monthlyOrders: number;
  monthlyOrderLimit: number | null;
  teamMemberCount: number;
  teamMemberLimit: number;
};

export type BillingConstraintCode =
  | "ORDER_LIMIT_REACHED"
  | "TEAM_LIMIT_REACHED"
  | "DOWNGRADE_BLOCKED_BY_TEAM_SIZE";

export class BillingConstraintError extends Error {
  code: BillingConstraintCode;
  details?: Record<string, string | number>;

  constructor(
    code: BillingConstraintCode,
    message: string,
    details?: Record<string, string | number>,
  ) {
    super(message);
    this.name = "BillingConstraintError";
    this.code = code;
    this.details = details;
  }
}

function startOfMonthIso(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0),
  ).toISOString();
}

function startOfNextMonthIso(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1, 0, 0, 0, 0),
  ).toISOString();
}

function defaultClient(client?: SupabaseClient) {
  return client || createSupabaseServiceClient();
}

async function fetchBusinessBillingRow(
  businessId: string,
  client?: SupabaseClient,
) {
  const supabase = defaultClient(client);
  const { data, error } = await supabase
    .from("businesses")
    .select(
      "id,name,currency,billing_plan,billing_status,billing_current_period_starts_at,billing_current_period_ends_at",
    )
    .eq("id", businessId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load business billing profile: ${JSON.stringify(error)}`,
    );
  }
  if (!data) {
    throw new Error("Business billing profile not found.");
  }
  return data as BusinessBillingRow;
}

async function countBusinessMembers(businessId: string, client?: SupabaseClient) {
  const supabase = defaultClient(client);
  const { count, error } = await supabase
    .from("business_members")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId);

  if (error) {
    throw new Error(`Failed to count team members: ${JSON.stringify(error)}`);
  }
  return count || 0;
}

async function countMonthlyOrders(businessId: string, client?: SupabaseClient) {
  const supabase = defaultClient(client);
  const now = new Date();
  const { count, error } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId)
    .gte("created_at", startOfMonthIso(now))
    .lt("created_at", startOfNextMonthIso(now));

  if (error) {
    throw new Error(`Failed to count monthly orders: ${JSON.stringify(error)}`);
  }
  return count || 0;
}

export async function getBusinessBillingState(
  businessId: string,
  client?: SupabaseClient,
): Promise<BusinessBillingState> {
  const supabase = defaultClient(client);
  const [business, monthlyOrders, teamMemberCount] = await Promise.all([
    fetchBusinessBillingRow(businessId, supabase),
    countMonthlyOrders(businessId, supabase),
    countBusinessMembers(businessId, supabase),
  ]);

  const plan = parseBillingPlan(business.billing_plan);
  const config = getBillingPlanConfig(plan);

  return {
    businessId,
    businessName: business.name?.trim() || "WhatsBoard Business",
    currency: business.currency?.trim() || "TZS",
    plan,
    status: (business.billing_status || "inactive") as BillingStatus,
    periodStartsAt: business.billing_current_period_starts_at,
    periodEndsAt: business.billing_current_period_ends_at,
    monthlyOrders,
    monthlyOrderLimit: config.orderLimitPerMonth,
    teamMemberCount,
    teamMemberLimit: config.teamMemberLimit,
  };
}

export async function getBusinessMemberRole(
  businessId: string,
  userId: string,
  client?: SupabaseClient,
) {
  const supabase = defaultClient(client);
  const { data, error } = await supabase
    .from("business_members")
    .select("role")
    .eq("business_id", businessId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to resolve business membership role: ${JSON.stringify(error)}`,
    );
  }
  return (data?.role || null) as "owner" | "admin" | "member" | null;
}

export async function assertOrderCreationAllowedForBusiness(
  businessId: string,
  client?: SupabaseClient,
) {
  const state = await getBusinessBillingState(businessId, client);
  if (
    state.monthlyOrderLimit !== null &&
    state.monthlyOrders >= state.monthlyOrderLimit
  ) {
    throw new BillingConstraintError(
      "ORDER_LIMIT_REACHED",
      `Free plan monthly order limit reached (${state.monthlyOrderLimit}).`,
      {
        monthlyOrders: state.monthlyOrders,
        monthlyOrderLimit: state.monthlyOrderLimit,
        plan: state.plan,
      },
    );
  }
  return state;
}

export async function assertTeamInviteAllowedForBusiness(
  businessId: string,
  client?: SupabaseClient,
) {
  const state = await getBusinessBillingState(businessId, client);
  if (state.teamMemberCount >= state.teamMemberLimit) {
    throw new BillingConstraintError(
      "TEAM_LIMIT_REACHED",
      `Team member limit reached for ${state.plan} plan (${state.teamMemberLimit}).`,
      {
        teamMemberCount: state.teamMemberCount,
        teamMemberLimit: state.teamMemberLimit,
        plan: state.plan,
      },
    );
  }
  return state;
}

export async function updateBusinessSubscriptionPlan(options: {
  businessId: string;
  actorUserId: string;
  targetPlan: BillingPlanKey;
  source?: "pricing" | "billing" | "admin";
  client?: SupabaseClient;
}) {
  const supabase = defaultClient(options.client);
  const before = await getBusinessBillingState(options.businessId, supabase);
  const targetConfig = getBillingPlanConfig(options.targetPlan);

  if (before.teamMemberCount > targetConfig.teamMemberLimit) {
    throw new BillingConstraintError(
      "DOWNGRADE_BLOCKED_BY_TEAM_SIZE",
      `Cannot switch to ${options.targetPlan} while team has ${before.teamMemberCount} members and limit is ${targetConfig.teamMemberLimit}.`,
      {
        currentMembers: before.teamMemberCount,
        targetLimit: targetConfig.teamMemberLimit,
        targetPlan: options.targetPlan,
      },
    );
  }

  const alreadyActive =
    before.plan === options.targetPlan && before.status === "active";

  if (!alreadyActive) {
    const now = new Date();
    const periodStartsAt = now.toISOString();
    const periodEndsAt = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth() + 1,
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds(),
        now.getUTCMilliseconds(),
      ),
    ).toISOString();

    const { error: updateError } = await supabase
      .from("businesses")
      .update({
        billing_plan: options.targetPlan,
        billing_status: "active",
        currency: "TZS",
        billing_last_paid_at:
          targetConfig.priceTzs > 0 ? periodStartsAt : before.periodStartsAt,
        billing_current_period_starts_at: periodStartsAt,
        billing_current_period_ends_at: periodEndsAt,
        updated_at: periodStartsAt,
      })
      .eq("id", options.businessId);

    if (updateError) {
      throw new Error(
        `Failed to update business subscription: ${JSON.stringify(updateError)}`,
      );
    }

    const { error: txnError } = await supabase.from("billing_transactions").insert({
      business_id: options.businessId,
      amount: targetConfig.priceTzs,
      currency: "TZS",
      status: targetConfig.priceTzs > 0 ? "paid" : "free",
      provider: "manual",
      provider_reference: `PLAN-${options.targetPlan.toUpperCase()}-${Date.now()}`,
      metadata: {
        source: options.source || "billing",
        actor_user_id: options.actorUserId,
        previous_plan: before.plan,
        next_plan: options.targetPlan,
      },
    });

    if (txnError) {
      throw new Error(
        `Failed to record billing transaction: ${JSON.stringify(txnError)}`,
      );
    }
  }

  const after = await getBusinessBillingState(options.businessId, supabase);
  return {
    changed: !alreadyActive,
    before,
    after,
  };
}
