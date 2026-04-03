import type {
  BuyerStatus,
  PaymentProvider,
  PaymentReconciliationStatus,
  CustomerRecord,
  CustomerProfileRecord,
  FollowUpRecord,
  OrderRecord,
  PaymentRecord,
  SourceChannel,
} from "@/data/whatsboard";
import type { User } from "@supabase/supabase-js";
import { WHATSBOARD_ACCESS_TOKEN_COOKIE } from "@/lib/auth/constants";
import { formatOrderReference } from "@/lib/display-labels";
import { statusFromDueDate } from "@/lib/follow-up-status";
import {
  calculateAverageOrderValue,
  calculateDaysSince,
  calculateRepeatPurchaseRate,
  resolveBuyerStatus,
} from "@/lib/customer-insights";
import type {
  AssignPaymentInput,
  AnalyticsPoint,
  AnalyticsSnapshot,
  CreateCustomerInput,
  CreateFollowUpInput,
  CreateOrderInput,
  CreatePaymentInput,
  CustomersQuery,
  DashboardSnapshot,
  DashboardStats,
  FollowUpsQuery,
  OrdersQuery,
  PaymentsQuery,
  ReconcileSmsInput,
  ReconcileSmsResult,
  UpdateCustomerInput,
  UpdateFollowUpInput,
  UpdateOrderInput,
  UpdatePaymentInput,
  WhatsboardRepository,
} from "@/lib/whatsboard-repository";
import { parsePaymentSms } from "@/lib/payments/sms-parser";
import {
  matchBandFromConfidence,
  providerToPaymentMethod,
  rankPaymentMatches,
} from "@/lib/payments/reconciliation";
import {
  BillingConstraintError,
  assertOrderCreationAllowedForBusiness,
} from "@/lib/billing/subscription";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

type LegacyCustomerRow = {
  id: string;
  business_id: string;
  name: string;
  phone: string | null;
  whatsapp_number: string | null;
  source_channel: SourceChannel | string | null;
  area: string | null;
  notes: string | null;
  status: "active" | "waiting" | "vip" | string | null;
  created_at: string;
  updated_at: string;
};

type LegacyOrderRow = {
  id: string;
  business_id: string;
  customer_id: string | null;
  product_name: string | null;
  amount: number | string | null;
  delivery_area: string | null;
  area: string | null;
  stage: OrderRecord["stage"] | string | null;
  payment_status: OrderRecord["paymentStatus"] | string | null;
  payment_method: PaymentRecord["method"] | string | null;
  payment_reference: string | null;
  payment_date: string | null;
  notes: string | null;
  source: SourceChannel | string | null;
  created_at: string;
  updated_at: string;
};

type LegacyPaymentRow = {
  id: string;
  business_id: string;
  order_id: string | null;
  customer_id: string | null;
  amount: number | string | null;
  method: PaymentRecord["method"] | string | null;
  status: PaymentRecord["status"] | string | null;
  reference: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  sender_name: string | null;
  sender_phone: string | null;
  provider: PaymentProvider | string | null;
  raw_sms: string | null;
  match_confidence: number | string | null;
  reconciliation_status: PaymentReconciliationStatus | string | null;
  suggested_order_id: string | null;
  matched_at: string | null;
  parsed_timestamp: string | null;
};

type LegacyFollowUpRow = {
  id: string;
  order_id: string | null;
  business_id: string;
  title: string | null;
  priority: FollowUpRecord["priority"] | string | null;
  due_at: string;
  note: string | null;
  completed: boolean | null;
  completed_at: string | null;
  created_at: string;
};

type LegacyBusinessMemberRow = {
  business_id: string;
  user_id: string;
  role: string | null;
};

type LegacyBusinessRow = {
  id: string;
  owner_id: string | null;
  name: string | null;
};

type LegacyProfileRow = {
  id: string;
  business_id: string | null;
  business_name: string | null;
  full_name: string | null;
  email: string | null;
};

export type LegacyBusinessContext = {
  userId: string;
  businessId: string;
  businessName: string;
  profileBusinessName: string | null;
  profileFullName: string | null;
  profileEmail: string | null;
};

const CHANNELS = ["WhatsApp", "Instagram", "TikTok", "Facebook"] as const;
const SOURCE_CHANNELS = [...CHANNELS, "Unknown"] as const;
const ORDER_STAGES = [
  "new_order",
  "waiting_payment",
  "paid",
  "packing",
  "dispatched",
  "delivered",
] as const;
const PAYMENT_STATUSES = ["unpaid", "partial", "paid", "cod"] as const;
const PAYMENT_METHODS = [
  "M-Pesa",
  "Tigopesa",
  "Airtel Money",
  "Cash",
  "Bank",
] as const;
const PRIORITIES = ["high", "medium", "low"] as const;
const PAYMENT_PROVIDERS = [
  "mpesa",
  "tigo",
  "airtel",
  "manual",
  "unknown",
] as const;
const RECONCILIATION_STATUSES = ["matched", "pending", "unmatched"] as const;
const LEGACY_ORDER_SELECT =
  "id,business_id,customer_id,product_name,amount,delivery_area,area,stage,payment_status,payment_method,payment_reference,payment_date,notes,source,created_at,updated_at";
const LEGACY_CUSTOMER_SELECT =
  "id,business_id,name,phone,whatsapp_number,source_channel,area,notes,status,created_at,updated_at";
const LEGACY_FOLLOW_UP_SELECT =
  "id,order_id,business_id,title,priority,due_at,note,completed,completed_at,created_at";
const LEGACY_PAYMENT_SELECT =
  "id,business_id,order_id,customer_id,amount,method,status,reference,paid_at,created_at,updated_at,sender_name,sender_phone,provider,raw_sms,match_confidence,reconciliation_status,suggested_order_id,matched_at,parsed_timestamp";

type EnsureBusinessOptions = {
  businessNameHint?: string | null;
  emailHint?: string | null;
  fullNameHint?: string | null;
  updateExistingBusinessName?: boolean;
};

function asNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function includesText(value: string, search: string) {
  return value.toLowerCase().includes(search.toLowerCase());
}

function asOrderStage(value: string | null | undefined): OrderRecord["stage"] {
  if (value && ORDER_STAGES.includes(value as (typeof ORDER_STAGES)[number])) {
    return value as OrderRecord["stage"];
  }
  return "new_order";
}

function asPaymentStatus(
  value: string | null | undefined,
): OrderRecord["paymentStatus"] {
  if (
    value &&
    PAYMENT_STATUSES.includes(value as (typeof PAYMENT_STATUSES)[number])
  ) {
    return value as OrderRecord["paymentStatus"];
  }
  return "unpaid";
}

function asPaymentMethod(
  value: string | null | undefined,
): PaymentRecord["method"] {
  if (
    value &&
    PAYMENT_METHODS.includes(value as (typeof PAYMENT_METHODS)[number])
  ) {
    return value as PaymentRecord["method"];
  }
  return "M-Pesa";
}

function asPaymentProvider(
  value: string | null | undefined,
): PaymentProvider {
  if (
    value &&
    PAYMENT_PROVIDERS.includes(value as (typeof PAYMENT_PROVIDERS)[number])
  ) {
    return value as PaymentProvider;
  }
  return "unknown";
}

function asReconciliationStatus(
  value: string | null | undefined,
): PaymentReconciliationStatus {
  if (
    value &&
    RECONCILIATION_STATUSES.includes(
      value as (typeof RECONCILIATION_STATUSES)[number],
    )
  ) {
    return value as PaymentReconciliationStatus;
  }
  return "matched";
}

function asCustomerStatus(
  value: string | null | undefined,
): CustomerRecord["status"] {
  if (value === "waiting" || value === "vip" || value === "active") {
    return value;
  }
  return "active";
}

function asSourceChannel(
  value: string | null | undefined,
): SourceChannel {
  if (
    value &&
    SOURCE_CHANNELS.includes(value as (typeof SOURCE_CHANNELS)[number])
  ) {
    return value as SourceChannel;
  }
  return "Unknown";
}

function asPriority(
  value: string | null | undefined,
): FollowUpRecord["priority"] {
  if (value && PRIORITIES.includes(value as (typeof PRIORITIES)[number])) {
    return value as FollowUpRecord["priority"];
  }
  return "medium";
}

function parseItemList(productName: string | null | undefined) {
  if (!productName?.trim()) return ["Order item"];
  return productName
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function deriveFollowUpStatus(
  row: LegacyFollowUpRow,
): FollowUpRecord["status"] {
  if (row.completed) return "completed";
  return statusFromDueDate(row.due_at);
}

const businessCacheByUserId = new Map<string, string>();

function cleanText(value?: string | null) {
  const trimmed = String(value || "").trim();
  return trimmed.length ? trimmed : null;
}

function businessNameFromEmail(email?: string | null) {
  const local = (email || "").split("@")[0]?.trim();
  if (!local) return "WhatsBoard Business";
  const cleaned = local.replace(/[._-]+/g, " ").trim();
  if (!cleaned) return "WhatsBoard Business";
  return `${cleaned.replace(/\b\w/g, (char) => char.toUpperCase())} Business`;
}

function extractBusinessNameFromMetadata(user?: User | null) {
  if (!user) return null;
  const metadata = (user.user_metadata || {}) as Record<string, unknown>;
  return (
    cleanText(String(metadata.business_name || "")) ||
    cleanText(String(metadata.businessName || "")) ||
    cleanText(String(metadata.company_name || "")) ||
    cleanText(String(metadata.companyName || ""))
  );
}

function extractFullNameFromMetadata(user?: User | null) {
  if (!user) return null;
  const metadata = (user.user_metadata || {}) as Record<string, unknown>;
  return (
    cleanText(String(metadata.full_name || "")) ||
    cleanText(String(metadata.fullName || "")) ||
    cleanText(String(metadata.name || ""))
  );
}

async function getAuthUserContext(options?: { accessToken?: string | null }) {
  try {
    const tokenFromParam = cleanText(options?.accessToken);
    const cookieStore = await cookies();
    const cookieAccessToken = cleanText(
      cookieStore.get(WHATSBOARD_ACCESS_TOKEN_COOKIE)?.value || "",
    );
    const accessToken = tokenFromParam || cookieAccessToken;
    if (!accessToken) {
      return { userId: null, hadAccessToken: false, user: null };
    }

    const client = createSupabaseServiceClient();
    const { data, error } = await client.auth.getUser(accessToken);
    if (error || !data.user?.id) {
      return { userId: null, hadAccessToken: true, user: null };
    }
    return { userId: data.user.id, hadAccessToken: true, user: data.user };
  } catch {
    return { userId: null, hadAccessToken: false, user: null };
  }
}

async function ensureBusinessMember(
  userId: string,
  businessId: string,
  role: "owner" | "member" = "owner",
) {
  const client = createSupabaseServiceClient();
  const existingResult = await client
    .from("business_members")
    .select("id,business_id")
    .eq("user_id", userId)
    .limit(1);

  if (existingResult.error) {
    throw new Error(
      `Failed to query business membership: ${JSON.stringify(existingResult.error)}`,
    );
  }

  if (existingResult.data?.[0]?.id) {
    const existing = existingResult.data[0] as {
      id: string;
      business_id: string | null;
    };
    if (existing.business_id === businessId) return;

    const { error: updateError } = await client
      .from("business_members")
      .update({
        business_id: businessId,
        role,
        invited_by: userId,
      })
      .eq("id", existing.id);
    if (updateError) {
      throw new Error(
        `Failed to update business membership: ${JSON.stringify(updateError)}`,
      );
    }
    return;
  }

  const { error: insertError } = await client.from("business_members").insert({
    user_id: userId,
    business_id: businessId,
    role,
    invited_by: userId,
  });

  if (insertError) {
    throw new Error(
      `Failed to create business membership: ${JSON.stringify(insertError)}`,
    );
  }
}

async function ensureProfileBusiness(
  userId: string,
  businessId: string,
  input?: {
    businessName?: string | null;
    fullName?: string | null;
    email?: string | null;
  },
) {
  const client = createSupabaseServiceClient();
  const payload: {
    id: string;
    business_id: string;
    updated_at: string;
    business_name?: string;
    full_name?: string;
    email?: string;
  } = {
    id: userId,
    business_id: businessId,
    updated_at: new Date().toISOString(),
  };
  const businessName = cleanText(input?.businessName);
  const fullName = cleanText(input?.fullName);
  const email = cleanText(input?.email)?.toLowerCase();
  if (businessName) payload.business_name = businessName;
  if (fullName) payload.full_name = fullName;
  if (email) payload.email = email;

  const { error } = await client
    .from("profiles")
    .upsert(payload, { onConflict: "id" });
  if (error) {
    throw new Error(
      `Failed to ensure profile business link: ${JSON.stringify(error)}`,
    );
  }
}

async function maybeUpdateBusinessName(
  businessId: string,
  businessNameHint?: string | null,
) {
  const targetName = cleanText(businessNameHint);
  if (!targetName) return;

  const client = createSupabaseServiceClient();
  const { error } = await client
    .from("businesses")
    .update({
      name: targetName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", businessId);

  if (error) {
    throw new Error(`Failed to update business name: ${JSON.stringify(error)}`);
  }
}

async function ensureBusinessForUser(
  userId: string,
  options?: EnsureBusinessOptions,
) {
  const client = createSupabaseServiceClient();
  const authUser = await client.auth.admin.getUserById(userId);
  const authEmail = cleanText(options?.emailHint) || authUser.data.user?.email;
  const metadataBusinessName = extractBusinessNameFromMetadata(
    authUser.data.user,
  );
  const metadataFullName = extractFullNameFromMetadata(authUser.data.user);
  const explicitBusinessName = cleanText(options?.businessNameHint);
  const explicitFullName = cleanText(options?.fullNameHint);

  const memberResult = await client
    .from("business_members")
    .select("business_id,user_id,role")
    .eq("user_id", userId)
    .limit(1);
  if (!memberResult.error && memberResult.data?.[0]?.business_id) {
    const businessId = String(
      (memberResult.data[0] as LegacyBusinessMemberRow).business_id,
    );
    if (options?.updateExistingBusinessName && explicitBusinessName) {
      await maybeUpdateBusinessName(businessId, explicitBusinessName);
    }
    await ensureProfileBusiness(userId, businessId, {
      businessName: explicitBusinessName || metadataBusinessName,
      fullName: explicitFullName || metadataFullName,
      email: authEmail,
    });
    return businessId;
  }

  const ownedResult = await client
    .from("businesses")
    .select("id,owner_id,name")
    .eq("owner_id", userId)
    .limit(1);
  if (!ownedResult.error && ownedResult.data?.[0]?.id) {
    const business = ownedResult.data[0] as LegacyBusinessRow;
    await ensureBusinessMember(userId, business.id, "owner");
    if (options?.updateExistingBusinessName && explicitBusinessName) {
      await maybeUpdateBusinessName(business.id, explicitBusinessName);
    }
    await ensureProfileBusiness(userId, business.id, {
      businessName:
        explicitBusinessName || business.name || metadataBusinessName,
      fullName: explicitFullName || metadataFullName,
      email: authEmail,
    });
    return String(business.id);
  }

  const profileResult = await client
    .from("profiles")
    .select("id,business_id,business_name,full_name,email")
    .eq("id", userId)
    .maybeSingle();
  if (!profileResult.error && profileResult.data?.business_id) {
    const profile = profileResult.data as LegacyProfileRow;
    await ensureBusinessMember(userId, String(profile.business_id), "owner");
    if (options?.updateExistingBusinessName && explicitBusinessName) {
      await maybeUpdateBusinessName(
        String(profile.business_id),
        explicitBusinessName,
      );
    }
    await ensureProfileBusiness(userId, String(profile.business_id), {
      businessName:
        explicitBusinessName || profile.business_name || metadataBusinessName,
      fullName: explicitFullName || profile.full_name || metadataFullName,
      email: authEmail || profile.email,
    });
    return String(profile.business_id);
  }

  const profile = profileResult.data as LegacyProfileRow | null;
  const now = new Date();
  const nowIso = now.toISOString();
  const monthAheadIso = new Date(
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
  const businessName =
    explicitBusinessName ||
    profile?.business_name ||
    metadataBusinessName ||
    explicitFullName ||
    profile?.full_name ||
    metadataFullName ||
    businessNameFromEmail(authEmail || profile?.email);
  const { data: createdBusiness, error: createBusinessError } = await client
    .from("businesses")
    .insert({
      owner_id: userId,
      name: businessName,
      currency: "TZS",
      billing_plan: "free",
      billing_status: "active",
      billing_current_period_starts_at: nowIso,
      billing_current_period_ends_at: monthAheadIso,
    })
    .select("id,name")
    .single();

  if (createBusinessError || !createdBusiness?.id) {
    throw new Error(
      `Failed to bootstrap business for user: ${JSON.stringify(createBusinessError)}`,
    );
  }

  await ensureBusinessMember(userId, String(createdBusiness.id), "owner");
  await ensureProfileBusiness(userId, String(createdBusiness.id), {
    businessName: explicitBusinessName || createdBusiness.name || businessName,
    fullName: explicitFullName || metadataFullName || profile?.full_name,
    email: authEmail || profile?.email,
  });
  return String(createdBusiness.id);
}

async function resolveBusinessId(options?: {
  accessToken?: string | null;
  businessNameHint?: string | null;
  fullNameHint?: string | null;
  emailHint?: string | null;
  updateExistingBusinessName?: boolean;
}) {
  const { userId: authUserId, hadAccessToken } = await getAuthUserContext({
    accessToken: options?.accessToken,
  });

  if (hadAccessToken && !authUserId) {
    throw new Error("Invalid or expired authentication session.");
  }

  if (authUserId) {
    const cached = businessCacheByUserId.get(authUserId);
    if (
      cached &&
      !cleanText(options?.businessNameHint) &&
      !cleanText(options?.fullNameHint) &&
      !cleanText(options?.emailHint)
    ) {
      return cached;
    }

    const businessId = await ensureBusinessForUser(authUserId, {
      businessNameHint: options?.businessNameHint,
      fullNameHint: options?.fullNameHint,
      emailHint: options?.emailHint,
      updateExistingBusinessName: options?.updateExistingBusinessName,
    });
    businessCacheByUserId.set(authUserId, businessId);
    return businessId;
  }

  throw new Error("Authenticated business context is required.");
}

async function getLegacyCustomersByIds(ids: string[]) {
  if (!ids.length) return new Map<string, LegacyCustomerRow>();
  const client = createSupabaseServiceClient();
  const businessId = await resolveBusinessId();
  const { data, error } = await client
    .from("customers")
    .select(LEGACY_CUSTOMER_SELECT)
    .eq("business_id", businessId)
    .in("id", ids);

  if (error) {
    throw new Error(`Failed to query customers: ${JSON.stringify(error)}`);
  }

  return new Map<string, LegacyCustomerRow>(
    ((data || []) as LegacyCustomerRow[]).map((row) => [row.id, row]),
  );
}

async function listLegacyOrdersByBusiness() {
  const client = createSupabaseServiceClient();
  const businessId = await resolveBusinessId();
  const { data, error } = await client
    .from("orders")
    .select(LEGACY_ORDER_SELECT)
    .eq("business_id", businessId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to list orders: ${JSON.stringify(error)}`);
  }

  return (data || []) as LegacyOrderRow[];
}

async function listLegacyFollowUpsByBusiness() {
  const client = createSupabaseServiceClient();
  const businessId = await resolveBusinessId();
  const { data, error } = await client
    .from("follow_ups")
    .select(LEGACY_FOLLOW_UP_SELECT)
    .eq("business_id", businessId)
    .order("due_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to list follow-ups: ${JSON.stringify(error)}`);
  }

  return (data || []) as LegacyFollowUpRow[];
}

async function listLegacyPaymentsByBusiness() {
  const client = createSupabaseServiceClient();
  const businessId = await resolveBusinessId();
  const { data, error } = await client
    .from("payments")
    .select(LEGACY_PAYMENT_SELECT)
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) {
    const fallback = await client
      .from("payments")
      .select(
        "id,business_id,order_id,customer_id,amount,method,status,reference,paid_at,created_at,updated_at",
      )
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });
    if (fallback.error) {
      throw new Error(
        `Failed to list payments: ${JSON.stringify(error || fallback.error)}`,
      );
    }
    return (fallback.data || []) as LegacyPaymentRow[];
  }

  return (data || []) as LegacyPaymentRow[];
}

async function getLegacyPaymentById(businessId: string, paymentId: string) {
  const client = createSupabaseServiceClient();
  const primary = await client
    .from("payments")
    .select(LEGACY_PAYMENT_SELECT)
    .eq("business_id", businessId)
    .eq("id", paymentId)
    .maybeSingle();

  if (!primary.error) {
    return (primary.data || null) as LegacyPaymentRow | null;
  }

  const fallback = await client
    .from("payments")
    .select(
      "id,business_id,order_id,customer_id,amount,method,status,reference,paid_at,created_at,updated_at",
    )
    .eq("business_id", businessId)
    .eq("id", paymentId)
    .maybeSingle();

  if (fallback.error) {
    throw new Error(
      `Failed to fetch payment: ${JSON.stringify(primary.error || fallback.error)}`,
    );
  }

  return (fallback.data || null) as LegacyPaymentRow | null;
}

function normalizeOrderIdentifier(value: string) {
  return value
    .trim()
    .replace(/^order\s*#?/i, "")
    .replace(/^#/i, "");
}

async function findLegacyOrderByIdentifier(
  businessId: string,
  identifier: string,
) {
  const normalized = normalizeOrderIdentifier(identifier);
  if (!normalized) return null;

  const client = createSupabaseServiceClient();
  const exact = await client
    .from("orders")
    .select(LEGACY_ORDER_SELECT)
    .eq("business_id", businessId)
    .eq("id", normalized)
    .maybeSingle();

  if (exact.error) {
    throw new Error(`Failed to query order: ${JSON.stringify(exact.error)}`);
  }
  if (exact.data) return exact.data as LegacyOrderRow;

  const desiredRef = normalizeOrderIdentifier(normalized).toUpperCase();
  const candidates = await client
    .from("orders")
    .select(LEGACY_ORDER_SELECT)
    .eq("business_id", businessId)
    .order("updated_at", { ascending: false })
    .limit(500);

  if (candidates.error) {
    throw new Error(
      `Failed to query order candidates: ${JSON.stringify(candidates.error)}`,
    );
  }

  const matched = ((candidates.data || []) as LegacyOrderRow[]).find((row) => {
    const reference = formatOrderReference(row.id);
    return reference?.toUpperCase() === desiredRef;
  });

  return matched || null;
}

function mapOrderRecord(
  row: LegacyOrderRow,
  customerMap: Map<string, LegacyCustomerRow>,
  dueFollowUpByOrderId: Map<string, string>,
  orderStatsByCustomerId: Map<string, { totalOrders: number; totalSpend: number }>,
): OrderRecord {
  const customer =
    (row.customer_id ? customerMap.get(row.customer_id) : undefined) || null;
  const deliveryArea =
    row.delivery_area || row.area || customer?.area || "Unknown area";
  const sourceChannel = asSourceChannel(row.source);
  const customerStats = row.customer_id
    ? orderStatsByCustomerId.get(row.customer_id)
    : null;
  const totalOrders = customerStats?.totalOrders || 0;
  const totalSpend = customerStats?.totalSpend || 0;
  const buyerStatus: BuyerStatus =
    totalOrders > 1 ? "repeat" : "new";

  return {
    id: row.id,
    customerId: row.customer_id || "unknown-customer",
    customerName: customer?.name || "Unknown customer",
    customerPhone: customer?.phone || undefined,
    channel:
      sourceChannel === "Unknown"
        ? "WhatsApp"
        : (sourceChannel as OrderRecord["channel"]),
    stage: asOrderStage(row.stage),
    paymentStatus: asPaymentStatus(row.payment_status),
    amount: asNumber(row.amount),
    deliveryArea,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    dueFollowUpAt: dueFollowUpByOrderId.get(row.id),
    notes: row.notes || "",
    items: parseItemList(row.product_name),
    paymentReference: row.payment_reference || undefined,
    paymentMethod: row.payment_method ? asPaymentMethod(row.payment_method) : null,
    customerTotalOrders: totalOrders,
    customerLifetimeValue: totalSpend,
    customerBuyerStatus: buyerStatus,
  };
}

function mapPaymentFromOrder(
  row: LegacyOrderRow,
  customerMap: Map<string, LegacyCustomerRow>,
): PaymentRecord {
  const customer =
    (row.customer_id ? customerMap.get(row.customer_id) : undefined) || null;
  return {
    id: `pay-${row.id}`,
    orderId: row.id || null,
    customerId: row.customer_id || null,
    customerName: customer?.name || "Unknown customer",
    amount: asNumber(row.amount),
    status: asPaymentStatus(row.payment_status),
    method: asPaymentMethod(row.payment_method),
    reference: row.payment_reference || `ORDER-${row.id.slice(0, 8)}`,
    createdAt: row.payment_date || row.updated_at || row.created_at,
    provider: "manual",
    reconciliationStatus: "matched",
    matchConfidence: 100,
    matchedAt: row.payment_date || row.updated_at || row.created_at,
  };
}

function mapPaymentRecord(
  row: LegacyPaymentRow,
  customerMap: Map<string, LegacyCustomerRow>,
  orderMap: Map<string, LegacyOrderRow>,
): PaymentRecord {
  const order = row.order_id ? orderMap.get(row.order_id) : null;
  const customer = row.customer_id
    ? customerMap.get(row.customer_id)
    : order?.customer_id
      ? customerMap.get(order.customer_id)
      : null;

  return {
    id: row.id,
    orderId: row.order_id || null,
    customerId: row.customer_id || order?.customer_id || null,
    customerName: customer?.name || row.sender_name || "Unassigned payment",
    amount: asNumber(row.amount),
    status: asPaymentStatus(row.status),
    method: asPaymentMethod(row.method),
    reference: row.reference || `PAY-${row.id.slice(0, 8).toUpperCase()}`,
    createdAt: row.paid_at || row.created_at,
    senderName: row.sender_name || null,
    senderPhone: row.sender_phone || null,
    provider: asPaymentProvider(row.provider),
    rawSms: row.raw_sms || null,
    matchConfidence:
      row.match_confidence === null || row.match_confidence === undefined
        ? null
        : asNumber(row.match_confidence),
    reconciliationStatus: asReconciliationStatus(row.reconciliation_status),
    suggestedOrderId: row.suggested_order_id || null,
    matchedAt: row.matched_at || null,
  };
}

function computeDashboardStats(
  orders: OrderRecord[],
  followUps: FollowUpRecord[],
  payments: PaymentRecord[],
  customers: CustomerRecord[],
): DashboardStats {
  const activeOrders = orders.filter(
    (order) => order.stage !== "delivered",
  ).length;
  const overdueFollowUps = followUps.filter(
    (item) => item.status === "overdue",
  ).length;
  const revenueMonth = payments
    .filter((item) => item.status === "paid" || item.status === "cod")
    .reduce((sum, item) => sum + item.amount, 0);
  const payoutPending = orders
    .filter(
      (order) =>
        order.paymentStatus === "unpaid" || order.paymentStatus === "partial",
    )
    .reduce((sum, order) => sum + order.amount, 0);
  const delivered = orders.filter(
    (order) => order.stage === "delivered",
  ).length;
  const conversionRate = orders.length
    ? Math.round((delivered / orders.length) * 100)
    : 0;

  return {
    revenueMonth,
    activeOrders,
    overdueFollowUps,
    customersThisMonth: customers.length,
    conversionRate,
    payoutPending,
  };
}

function computeAnalyticsSeries(
  orders: OrderRecord[],
  payments: PaymentRecord[],
) {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const series = labels.map((label) => ({ label, revenue: 0, orders: 0 }));

  orders.forEach((order) => {
    const day = new Date(order.createdAt).getDay();
    const index = day === 0 ? 6 : day - 1;
    series[index].orders += 1;
  });

  payments.forEach((payment) => {
    if (payment.status !== "paid" && payment.status !== "cod") return;
    const day = new Date(payment.createdAt).getDay();
    const index = day === 0 ? 6 : day - 1;
    series[index].revenue += payment.amount;
  });

  return series;
}

async function listOrders(query: OrdersQuery = {}) {
  const search = query.search?.trim() ?? "";
  const [orderRows, followUpRows] = await Promise.all([
    listLegacyOrdersByBusiness(),
    listLegacyFollowUpsByBusiness(),
  ]);

  const customerIds = Array.from(
    new Set(
      orderRows.map((row) => row.customer_id).filter(Boolean) as string[],
    ),
  );
  const customersById = await getLegacyCustomersByIds(customerIds);

  const dueFollowUpByOrderId = new Map<string, string>();
  followUpRows
    .filter((row) => !row.completed && row.order_id)
    .forEach((row) => {
      const key = String(row.order_id);
      const current = dueFollowUpByOrderId.get(key);
      if (!current || current > row.due_at) {
        dueFollowUpByOrderId.set(key, row.due_at);
      }
    });

  const orderStatsByCustomerId = new Map<
    string,
    { totalOrders: number; totalSpend: number }
  >();
  orderRows.forEach((row) => {
    if (!row.customer_id) return;
    const current = orderStatsByCustomerId.get(row.customer_id) || {
      totalOrders: 0,
      totalSpend: 0,
    };
    current.totalOrders += 1;
    current.totalSpend += asNumber(row.amount);
    orderStatsByCustomerId.set(row.customer_id, current);
  });

  return orderRows
    .map((row) =>
      mapOrderRecord(
        row,
        customersById,
        dueFollowUpByOrderId,
        orderStatsByCustomerId,
      ),
    )
    .filter((order) => (query.stage ? order.stage === query.stage : true))
    .filter((order) =>
      query.payment ? order.paymentStatus === query.payment : true,
    )
    .filter((order) => {
      if (!search) return true;
      const haystack = [
        order.id,
        order.customerName,
        order.channel,
        order.deliveryArea,
        order.items.join(" "),
      ].join(" ");
      return includesText(haystack, search);
    });
}

async function getOrderById(id: string) {
  const businessId = await resolveBusinessId();
  const client = createSupabaseServiceClient();
  const { data, error } = await client
    .from("orders")
    .select(
      "id,business_id,customer_id,product_name,amount,delivery_area,area,stage,payment_status,payment_method,payment_reference,payment_date,notes,source,created_at,updated_at",
    )
    .eq("business_id", businessId)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch order: ${JSON.stringify(error)}`);
  }
  if (!data) return null;

  const orderRow = data as LegacyOrderRow;
  const customerMap = await getLegacyCustomersByIds(
    orderRow.customer_id ? [orderRow.customer_id] : [],
  );
  const allOrders = await listLegacyOrdersByBusiness();
  const orderStatsByCustomerId = new Map<
    string,
    { totalOrders: number; totalSpend: number }
  >();
  allOrders.forEach((row) => {
    if (!row.customer_id) return;
    const current = orderStatsByCustomerId.get(row.customer_id) || {
      totalOrders: 0,
      totalSpend: 0,
    };
    current.totalOrders += 1;
    current.totalSpend += asNumber(row.amount);
    orderStatsByCustomerId.set(row.customer_id, current);
  });
  const followUps = await listLegacyFollowUpsByBusiness();
  const dueFollowUpByOrderId = new Map<string, string>();
  followUps
    .filter((row) => row.order_id === id && !row.completed)
    .forEach((row) => {
      const current = dueFollowUpByOrderId.get(id);
      if (!current || current > row.due_at) {
        dueFollowUpByOrderId.set(id, row.due_at);
      }
    });
  return mapOrderRecord(
    orderRow,
    customerMap,
    dueFollowUpByOrderId,
    orderStatsByCustomerId,
  );
}

async function findOrCreateCustomer(
  businessId: string,
  name: string,
  phone?: string,
  area?: string,
  sourceChannel?: SourceChannel,
) {
  const client = createSupabaseServiceClient();
  if (phone?.trim()) {
    const byPhone = await client
      .from("customers")
      .select(LEGACY_CUSTOMER_SELECT)
      .eq("business_id", businessId)
      .eq("phone", phone.trim())
      .maybeSingle();
    if (!byPhone.error && byPhone.data)
      return byPhone.data as LegacyCustomerRow;
  }

  const byName = await client
    .from("customers")
    .select(LEGACY_CUSTOMER_SELECT)
    .eq("business_id", businessId)
    .eq("name", name.trim())
    .maybeSingle();
  if (!byName.error && byName.data) return byName.data as LegacyCustomerRow;

  const { data, error } = await client
    .from("customers")
    .insert({
      business_id: businessId,
      name: name.trim(),
      phone: phone?.trim() || null,
      whatsapp_number: phone?.trim() || null,
      source_channel: sourceChannel || "WhatsApp",
      area: area?.trim() || null,
      notes: null,
      status: "active",
    })
    .select(LEGACY_CUSTOMER_SELECT)
    .single();

  if (error || !data) {
    throw new Error(`Failed to create customer: ${JSON.stringify(error)}`);
  }
  return data as LegacyCustomerRow;
}

async function createOrder(input: CreateOrderInput) {
  const businessId = await resolveBusinessId();
  await assertOrderCreationAllowedForBusiness(businessId);
  const client = createSupabaseServiceClient();
  const customer = await findOrCreateCustomer(
    businessId,
    input.customerName,
    input.customerPhone,
    input.deliveryArea,
    input.channel,
  );

  const { data, error } = await client
    .from("orders")
    .insert({
      business_id: businessId,
      customer_id: customer.id,
      product_name: input.items.join(", ") || "Order item",
      amount: input.amount,
      delivery_area: input.deliveryArea,
      area: input.deliveryArea,
      stage: input.stage,
      payment_status: input.paymentStatus,
      payment_method: null,
      payment_reference: null,
      payment_date: null,
      notes: input.notes || null,
      source: input.channel,
    })
    .select(
      "id,business_id,customer_id,product_name,amount,delivery_area,area,stage,payment_status,payment_method,payment_reference,payment_date,notes,source,created_at,updated_at",
    )
    .single();

  if (error || !data) {
    const errorMessage = JSON.stringify(error);
    if (errorMessage.toLowerCase().includes("monthly order limit reached")) {
      throw new BillingConstraintError(
        "ORDER_LIMIT_REACHED",
        "Free plan monthly order limit reached.",
      );
    }
    throw new Error(`Failed to create order: ${JSON.stringify(error)}`);
  }

  return mapOrderRecord(
    data as LegacyOrderRow,
    new Map([[customer.id, customer]]),
    new Map(),
    new Map([[customer.id, { totalOrders: 1, totalSpend: asNumber(data.amount) }]]),
  );
}

async function updateOrder(id: string, input: UpdateOrderInput) {
  const businessId = await resolveBusinessId();
  const client = createSupabaseServiceClient();

  const existing = await client
    .from("orders")
    .select(
      "id,business_id,customer_id,product_name,amount,delivery_area,area,stage,payment_status,payment_method,payment_reference,payment_date,notes,source,created_at,updated_at",
    )
    .eq("business_id", businessId)
    .eq("id", id)
    .maybeSingle();
  if (existing.error) {
    throw new Error(`Failed to query order: ${JSON.stringify(existing.error)}`);
  }
  if (!existing.data) return null;

  const current = existing.data as LegacyOrderRow;
  const customer = await findOrCreateCustomer(
    businessId,
    input.customerName,
    undefined,
    current.delivery_area || current.area || undefined,
    current.source ? asSourceChannel(current.source) : undefined,
  );

  const { data, error } = await client
    .from("orders")
    .update({
      customer_id: customer.id,
      amount: input.amount,
      stage: input.stage,
      payment_status: input.paymentStatus,
      notes: input.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("business_id", businessId)
    .eq("id", id)
    .select(
      "id,business_id,customer_id,product_name,amount,delivery_area,area,stage,payment_status,payment_method,payment_reference,payment_date,notes,source,created_at,updated_at",
    )
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update order: ${JSON.stringify(error)}`);
  }
  if (!data) return null;

  return mapOrderRecord(
    data as LegacyOrderRow,
    new Map([[customer.id, customer]]),
    new Map(),
    new Map([[customer.id, { totalOrders: 1, totalSpend: asNumber(data.amount) }]]),
  );
}

async function listCustomers(query: CustomersQuery = {}) {
  const businessId = await resolveBusinessId();
  const client = createSupabaseServiceClient();
  const search = query.search?.trim() ?? "";
  const now = new Date();

  const [{ data: customersData, error: customerError }, orders, followUps] =
    await Promise.all([
      client
        .from("customers")
        .select(LEGACY_CUSTOMER_SELECT)
        .eq("business_id", businessId)
        .order("updated_at", { ascending: false }),
      listLegacyOrdersByBusiness(),
      listLegacyFollowUpsByBusiness(),
    ]);

  if (customerError) {
    throw new Error(
      `Failed to list customers: ${JSON.stringify(customerError)}`,
    );
  }

  const orderStatsByCustomer = new Map<
    string,
    {
      totalOrders: number;
      totalSpend: number;
      lastOrderAt: string;
      firstOrderAt: string;
      sourceChannel: SourceChannel;
    }
  >();
  for (const order of orders) {
    if (!order.customer_id) continue;
    const current = orderStatsByCustomer.get(order.customer_id) || {
      totalOrders: 0,
      totalSpend: 0,
      lastOrderAt: order.created_at,
      firstOrderAt: order.created_at,
      sourceChannel: asSourceChannel(order.source),
    };
    current.totalOrders += 1;
    current.totalSpend += asNumber(order.amount);
    if (current.lastOrderAt < order.created_at)
      current.lastOrderAt = order.created_at;
    if (current.firstOrderAt > order.created_at)
      current.firstOrderAt = order.created_at;
    orderStatsByCustomer.set(order.customer_id, current);
  }

  const orderById = new Map<string, LegacyOrderRow>(
    orders.map((row) => [row.id, row]),
  );
  const nextFollowUpByCustomer = new Map<string, string>();
  followUps
    .filter((row) => !row.completed && row.order_id)
    .forEach((row) => {
      const order = orderById.get(String(row.order_id));
      if (!order?.customer_id) return;
      const current = nextFollowUpByCustomer.get(order.customer_id);
      if (!current || current > row.due_at) {
        nextFollowUpByCustomer.set(order.customer_id, row.due_at);
      }
    });

  const records = ((customersData || []) as LegacyCustomerRow[])
    .map((row): CustomerRecord => {
      const stats = orderStatsByCustomer.get(row.id);
      const totalOrders = stats?.totalOrders || 0;
      const totalSpend = stats?.totalSpend || 0;
      const lastOrderAt = stats?.lastOrderAt || row.updated_at || row.created_at;
      const daysSinceLastOrder = calculateDaysSince(lastOrderAt, now);
      const buyerStatus = resolveBuyerStatus({
        totalOrders,
        createdAt: row.created_at,
        lastOrderAt,
        now,
      });
      return {
        id: row.id,
        name: row.name,
        phone: row.phone || "Not provided",
        whatsappNumber: row.whatsapp_number || row.phone || undefined,
        sourceChannel: asSourceChannel(
          row.source_channel || stats?.sourceChannel || "Unknown",
        ),
        location: row.area || "Not specified",
        totalOrders,
        totalSpend,
        lastOrderAt,
        averageOrderValue: calculateAverageOrderValue(totalSpend, totalOrders),
        daysSinceLastOrder,
        repeatPurchaseRate: calculateRepeatPurchaseRate(totalOrders),
        buyerStatus,
        isRepeatBuyer: totalOrders > 1,
        notes: row.notes || undefined,
        createdAt: row.created_at,
        nextFollowUpAt: nextFollowUpByCustomer.get(row.id),
        status: asCustomerStatus(row.status),
      };
    })
    .filter((item) => {
      if (query.status && query.status !== "all") {
        if (query.status === "new") return item.buyerStatus === "new";
        if (query.status === "repeat") return item.buyerStatus === "repeat";
        if (query.status === "at_risk") return item.buyerStatus === "at_risk";
        if (query.status === "lost") return item.buyerStatus === "lost";
        return item.status === query.status;
      }
      return true;
    })
    .filter((item) =>
      query.buyerStatus ? item.buyerStatus === query.buyerStatus : true,
    )
    .filter((item) => {
      if (!query.sourceChannel || query.sourceChannel === "all") return true;
      return item.sourceChannel === query.sourceChannel;
    })
    .filter((item) => {
      if (!search) return true;
      const haystack = [
        item.name,
        item.phone,
        item.whatsappNumber || "",
        item.location,
        item.sourceChannel || "",
        item.notes || "",
      ].join(" ");
      return includesText(haystack, search);
    });

  const sortBy = query.sort || "last_order";
  const sorted = [...records].sort((a, b) => {
    if (sortBy === "ltv") return b.totalSpend - a.totalSpend;
    if (sortBy === "total_orders") return b.totalOrders - a.totalOrders;
    if (sortBy === "days_since_last_order")
      return (b.daysSinceLastOrder || 0) - (a.daysSinceLastOrder || 0);
    return a.lastOrderAt > b.lastOrderAt ? -1 : 1;
  });

  return sorted;
}

async function getCustomerById(id: string) {
  const records = await listCustomers();
  return records.find((item) => item.id === id) || null;
}

async function getCustomerProfileById(id: string): Promise<CustomerProfileRecord | null> {
  const businessId = await resolveBusinessId();
  const client = createSupabaseServiceClient();
  const customerResult = await client
    .from("customers")
    .select(LEGACY_CUSTOMER_SELECT)
    .eq("business_id", businessId)
    .eq("id", id)
    .maybeSingle();

  if (customerResult.error) {
    throw new Error(
      `Failed to load customer profile: ${JSON.stringify(customerResult.error)}`,
    );
  }
  if (!customerResult.data) return null;

  const customerRow = customerResult.data as LegacyCustomerRow;
  const [orderRows, followUpRows] = await Promise.all([
    listLegacyOrdersByBusiness(),
    listLegacyFollowUpsByBusiness(),
  ]);

  const dueFollowUpByOrderId = new Map<string, string>();
  followUpRows
    .filter((row) => !row.completed && row.order_id)
    .forEach((row) => {
      const key = String(row.order_id);
      const current = dueFollowUpByOrderId.get(key);
      if (!current || current > row.due_at) {
        dueFollowUpByOrderId.set(key, row.due_at);
      }
    });

  const orderStatsByCustomerId = new Map<
    string,
    { totalOrders: number; totalSpend: number }
  >();
  orderRows.forEach((row) => {
    if (!row.customer_id) return;
    const current = orderStatsByCustomerId.get(row.customer_id) || {
      totalOrders: 0,
      totalSpend: 0,
    };
    current.totalOrders += 1;
    current.totalSpend += asNumber(row.amount);
    orderStatsByCustomerId.set(row.customer_id, current);
  });

  const customerOrders = orderRows
    .filter((row) => row.customer_id === id)
    .map((row) =>
      mapOrderRecord(
        row,
        new Map([[id, customerRow]]),
        dueFollowUpByOrderId,
        orderStatsByCustomerId,
      ),
    )
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

  const totalLifetimeValue = customerOrders.reduce(
    (sum, row) => sum + row.amount,
    0,
  );
  const totalOrders = customerOrders.length;
  const lastOrderDate =
    customerOrders[0]?.createdAt || customerRow.updated_at || customerRow.created_at;
  const daysSinceLastOrder = calculateDaysSince(lastOrderDate);
  const repeatPurchaseRate = calculateRepeatPurchaseRate(totalOrders);
  const averageOrderValue = calculateAverageOrderValue(
    totalLifetimeValue,
    totalOrders,
  );
  const buyerStatus = resolveBuyerStatus({
    totalOrders,
    createdAt: customerRow.created_at,
    lastOrderAt: lastOrderDate,
  });
  const sourceChannel =
    asSourceChannel(customerRow.source_channel) !== "Unknown"
      ? asSourceChannel(customerRow.source_channel)
      : customerOrders[0]?.channel || "Unknown";

  const customer: CustomerRecord = {
    id: customerRow.id,
    name: customerRow.name,
    phone: customerRow.phone || "Not provided",
    whatsappNumber: customerRow.whatsapp_number || customerRow.phone || undefined,
    sourceChannel,
    location: customerRow.area || "Not specified",
    totalOrders,
    totalSpend: totalLifetimeValue,
    lastOrderAt: lastOrderDate,
    averageOrderValue,
    daysSinceLastOrder,
    repeatPurchaseRate,
    buyerStatus,
    isRepeatBuyer: totalOrders > 1,
    notes: customerRow.notes || undefined,
    createdAt: customerRow.created_at,
    status: asCustomerStatus(customerRow.status),
  };

  return {
    customer,
    orderHistory: customerOrders.map((order) => ({
      id: order.id,
      orderReference: formatOrderReference(order.id) || "WB-00000",
      date: order.createdAt,
      items: order.items,
      amount: order.amount,
      status: order.stage,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod || null,
    })),
    totalLifetimeValue,
    averageOrderValue,
    repeatPurchaseRate,
    daysSinceLastOrder,
    lastOrderDate,
    lastBoughtProduct: customerOrders[0]?.items?.[0] || undefined,
  };
}

async function createCustomer(input: CreateCustomerInput) {
  const businessId = await resolveBusinessId();
  const client = createSupabaseServiceClient();
  const { data, error } = await client
    .from("customers")
    .insert({
      business_id: businessId,
      name: input.name,
      phone: input.phone || null,
      whatsapp_number: input.whatsappNumber || input.phone || null,
      source_channel: input.sourceChannel || "Unknown",
      area: input.location || null,
      notes: input.notes || null,
      status: input.status,
    })
    .select(LEGACY_CUSTOMER_SELECT)
    .single();

  if (error || !data) {
    throw new Error(`Failed to create customer: ${JSON.stringify(error)}`);
  }

  const row = data as LegacyCustomerRow;
  return {
    id: row.id,
    name: row.name,
    phone: row.phone || "Not provided",
    whatsappNumber: row.whatsapp_number || row.phone || undefined,
    sourceChannel: asSourceChannel(row.source_channel),
    location: row.area || "Not specified",
    totalOrders: 0,
    totalSpend: 0,
    lastOrderAt: row.created_at,
    averageOrderValue: 0,
    daysSinceLastOrder: 0,
    repeatPurchaseRate: 0,
    buyerStatus: "new" as const,
    isRepeatBuyer: false,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    status: asCustomerStatus(row.status),
  };
}

async function updateCustomer(id: string, input: UpdateCustomerInput) {
  const businessId = await resolveBusinessId();
  const client = createSupabaseServiceClient();
  const { error } = await client
    .from("customers")
    .update({
      name: input.name || undefined,
      phone: input.phone || undefined,
      whatsapp_number: input.whatsappNumber || undefined,
      source_channel: input.sourceChannel || undefined,
      area: input.location || undefined,
      notes: input.notes === undefined ? undefined : input.notes || null,
      status: input.status || undefined,
      updated_at: new Date().toISOString(),
    })
    .eq("business_id", businessId)
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update customer: ${JSON.stringify(error)}`);
  }
  return getCustomerById(id);
}

function mapFollowUpRecord(
  row: LegacyFollowUpRow,
  ordersById: Map<string, LegacyOrderRow>,
  customersById: Map<string, LegacyCustomerRow>,
): FollowUpRecord {
  const order = row.order_id ? ordersById.get(String(row.order_id)) : undefined;
  const customer = order?.customer_id
    ? customersById.get(order.customer_id)
    : undefined;

  const orderReference = order ? formatOrderReference(order.id) : null;

  return {
    id: row.id,
    customerId: order?.customer_id || "unknown-customer",
    customerName: customer?.name || "Unknown customer",
    orderId: row.order_id || undefined,
    title:
      row.title?.trim() ||
      (orderReference
        ? `Follow-up for Order #${orderReference}`
        : "Customer follow-up"),
    note: row.note || "",
    dueAt: row.due_at,
    status: deriveFollowUpStatus(row),
    priority: asPriority(row.priority || (row.completed ? "low" : "medium")),
  };
}

async function listFollowUps(query: FollowUpsQuery = {}) {
  const search = query.search?.trim() ?? "";
  const [followUps, orders] = await Promise.all([
    listLegacyFollowUpsByBusiness(),
    listLegacyOrdersByBusiness(),
  ]);
  const customersById = await getLegacyCustomersByIds(
    Array.from(
      new Set(orders.map((row) => row.customer_id).filter(Boolean) as string[]),
    ),
  );
  const ordersById = new Map<string, LegacyOrderRow>(
    orders.map((row) => [row.id, row]),
  );

  return followUps
    .map((row) => mapFollowUpRecord(row, ordersById, customersById))
    .filter((item) => (query.status ? item.status === query.status : true))
    .filter((item) => {
      if (!search) return true;
      const haystack = [
        item.title,
        item.customerName,
        item.note,
        item.orderId || "",
      ].join(" ");
      return includesText(haystack, search);
    })
    .sort((a, b) => (a.dueAt > b.dueAt ? 1 : -1));
}

async function createFollowUp(input: CreateFollowUpInput) {
  const businessId = await resolveBusinessId();
  const client = createSupabaseServiceClient();
  const dueAtIso = new Date(input.dueAt).toISOString();

  let orderId: string | null = null;
  if (input.orderId?.trim()) {
    const order = await findLegacyOrderByIdentifier(businessId, input.orderId);
    if (!order) {
      throw new Error(`Order not found for follow-up: ${input.orderId}`);
    }
    orderId = String(order.id);
  }

  const { data, error } = await client
    .from("follow_ups")
    .insert({
      business_id: businessId,
      order_id: orderId,
      title: input.customerName?.trim()
        ? `Follow up: ${input.customerName.trim()}`
        : "Customer follow-up",
      priority: input.priority,
      due_at: dueAtIso,
      note: input.note,
      completed: false,
      completed_at: null,
    })
    .select(LEGACY_FOLLOW_UP_SELECT)
    .single();

  if (error || !data) {
    throw new Error(`Failed to create follow-up: ${JSON.stringify(error)}`);
  }

  const orders = await listLegacyOrdersByBusiness();
  const ordersById = new Map<string, LegacyOrderRow>(
    orders.map((row) => [row.id, row]),
  );
  const customersById = await getLegacyCustomersByIds(
    Array.from(
      new Set(orders.map((row) => row.customer_id).filter(Boolean) as string[]),
    ),
  );
  return mapFollowUpRecord(
    data as LegacyFollowUpRow,
    ordersById,
    customersById,
  );
}

async function updateFollowUp(id: string, input: UpdateFollowUpInput) {
  const businessId = await resolveBusinessId();
  const client = createSupabaseServiceClient();
  const updatePayload: Record<string, unknown> = {
    title: input.title?.trim() || undefined,
    priority: input.priority || undefined,
    note: input.note ?? undefined,
    due_at: input.dueAt ? new Date(input.dueAt).toISOString() : undefined,
  };
  if (input.status === "completed") {
    updatePayload.completed = true;
    updatePayload.completed_at = new Date().toISOString();
  } else if (
    input.status === "overdue" ||
    input.status === "today" ||
    input.status === "upcoming"
  ) {
    updatePayload.completed = false;
    updatePayload.completed_at = null;
  }

  const { data, error } = await client
    .from("follow_ups")
    .update(updatePayload)
    .eq("business_id", businessId)
    .eq("id", id)
    .select(LEGACY_FOLLOW_UP_SELECT)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update follow-up: ${JSON.stringify(error)}`);
  }
  if (!data) return null;

  const orders = await listLegacyOrdersByBusiness();
  const ordersById = new Map<string, LegacyOrderRow>(
    orders.map((row) => [row.id, row]),
  );
  const customersById = await getLegacyCustomersByIds(
    Array.from(
      new Set(orders.map((row) => row.customer_id).filter(Boolean) as string[]),
    ),
  );
  return mapFollowUpRecord(
    data as LegacyFollowUpRow,
    ordersById,
    customersById,
  );
}

async function listOrderFollowUps(orderId: string) {
  const records = await listFollowUps();
  return records.filter((item) => item.orderId === orderId);
}

async function updateLegacyOrderPaymentState(input: {
  businessId: string;
  orderId: string;
  status: PaymentRecord["status"];
  method?: PaymentRecord["method"] | null;
  reference?: string | null;
}) {
  const client = createSupabaseServiceClient();
  const paymentDate =
    input.status === "paid" || input.status === "cod"
      ? new Date().toISOString()
      : null;
  const currentOrder = await client
    .from("orders")
    .select("stage")
    .eq("business_id", input.businessId)
    .eq("id", input.orderId)
    .maybeSingle();
  if (currentOrder.error) {
    throw new Error(
      `Failed to query order stage for payment sync: ${JSON.stringify(currentOrder.error)}`,
    );
  }

  const shouldMoveToPaidStage =
    (input.status === "paid" || input.status === "cod") &&
    currentOrder.data?.stage &&
    ["new_order", "waiting_payment"].includes(
      asOrderStage(String(currentOrder.data.stage)),
    );

  const { data, error } = await client
    .from("orders")
    .update({
      payment_status: input.status,
      payment_method: input.method || null,
      payment_reference: input.reference || null,
      payment_date: paymentDate,
      stage: shouldMoveToPaidStage ? "paid" : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq("business_id", input.businessId)
    .eq("id", input.orderId)
    .select(LEGACY_ORDER_SELECT)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to sync order payment state: ${JSON.stringify(error)}`);
  }

  return (data || null) as LegacyOrderRow | null;
}

async function insertLegacyPaymentRow(
  businessId: string,
  payload: Record<string, unknown>,
) {
  const client = createSupabaseServiceClient();
  const primary = await client
    .from("payments")
    .insert(payload)
    .select(LEGACY_PAYMENT_SELECT)
    .single();

  if (!primary.error && primary.data) {
    return primary.data as LegacyPaymentRow;
  }

  const fallback = await client
    .from("payments")
    .insert({
      business_id: businessId,
      order_id: payload.order_id ?? null,
      customer_id: payload.customer_id ?? null,
      amount: payload.amount ?? 0,
      method: payload.method ?? "M-Pesa",
      status: payload.status ?? "unpaid",
      reference: payload.reference ?? null,
      paid_at: payload.paid_at ?? null,
    })
    .select(
      "id,business_id,order_id,customer_id,amount,method,status,reference,paid_at,created_at,updated_at",
    )
    .single();

  if (fallback.error || !fallback.data) {
    throw new Error(
      `Failed to insert payment: ${JSON.stringify(primary.error || fallback.error)}`,
    );
  }

  return fallback.data as LegacyPaymentRow;
}

async function listPayments(query: PaymentsQuery = {}) {
  const search = query.search?.trim() ?? "";
  const [paymentRows, orderRows] = await Promise.all([
    listLegacyPaymentsByBusiness(),
    listLegacyOrdersByBusiness(),
  ]);

  const customerIds = Array.from(
    new Set(
      [
        ...orderRows.map((row) => row.customer_id),
        ...paymentRows.map((row) => row.customer_id),
      ].filter(Boolean) as string[],
    ),
  );
  const customersById = await getLegacyCustomersByIds(customerIds);
  const ordersById = new Map<string, LegacyOrderRow>(
    orderRows.map((row) => [row.id, row]),
  );

  const tablePayments = paymentRows.map((row) =>
    mapPaymentRecord(row, customersById, ordersById),
  );
  const tableLinkedOrderIds = new Set(
    tablePayments.map((item) => item.orderId).filter(Boolean) as string[],
  );
  const inferredPayments = orderRows
    .filter(
      (row) =>
        !tableLinkedOrderIds.has(row.id) &&
        (Boolean(row.payment_reference) ||
          Boolean(row.payment_method) ||
          Boolean(row.payment_date) ||
          asPaymentStatus(row.payment_status) !== "unpaid"),
    )
    .map((row) => mapPaymentFromOrder(row, customersById));

  return [...tablePayments, ...inferredPayments]
    .filter((item) => (query.status ? item.status === query.status : true))
    .filter((item) => (query.method ? item.method === query.method : true))
    .filter((item) => {
      if (!search) return true;
      const haystack = [
        item.orderId || "",
        item.suggestedOrderId || "",
        item.customerName,
        item.senderName || "",
        item.senderPhone || "",
        item.reference,
        item.method,
      ].join(" ");
      return includesText(haystack, search);
    })
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
}

async function createPayment(input: CreatePaymentInput) {
  const businessId = await resolveBusinessId();
  const targetOrder = await findLegacyOrderByIdentifier(
    businessId,
    input.orderId,
  );
  if (!targetOrder) {
    throw new Error(`Order not found for payment: ${input.orderId}`);
  }

  const nowIso = new Date().toISOString();
  const paymentRow = await insertLegacyPaymentRow(businessId, {
    business_id: businessId,
    order_id: targetOrder.id,
    customer_id: targetOrder.customer_id || null,
    amount: input.amount,
    method: input.method,
    status: input.status,
    reference: input.reference,
    paid_at: input.status === "paid" || input.status === "cod" ? nowIso : null,
    provider: "manual",
    sender_name: null,
    sender_phone: null,
    raw_sms: null,
    match_confidence: 100,
    reconciliation_status: "matched",
    suggested_order_id: null,
    matched_at: nowIso,
    parsed_timestamp: null,
  });

  await updateLegacyOrderPaymentState({
    businessId,
    orderId: targetOrder.id,
    status: input.status,
    method: input.method,
    reference: input.reference,
  });

  const [orderRows, customerMap] = await Promise.all([
    listLegacyOrdersByBusiness(),
    getLegacyCustomersByIds(
      [targetOrder.customer_id].filter(Boolean) as string[],
    ),
  ]);
  const orderMap = new Map<string, LegacyOrderRow>(
    orderRows.map((row) => [row.id, row]),
  );
  return mapPaymentRecord(paymentRow, customerMap, orderMap);
}

async function updatePayment(id: string, input: UpdatePaymentInput) {
  const businessId = await resolveBusinessId();
  const client = createSupabaseServiceClient();

  let paymentRow = await getLegacyPaymentById(businessId, id);

  if (paymentRow) {
    let resolvedOrderId: string | null = paymentRow.order_id;
    if (input.orderId?.trim()) {
      const targetOrder = await findLegacyOrderByIdentifier(
        businessId,
        input.orderId,
      );
      if (!targetOrder) return null;
      resolvedOrderId = targetOrder.id;
    }

    const payload: Record<string, unknown> = {
      order_id: resolvedOrderId,
      amount:
        typeof input.amount === "number" && Number.isFinite(input.amount)
          ? input.amount
          : undefined,
      method: input.method || undefined,
      status: input.status || undefined,
      reference: input.reference || undefined,
      paid_at:
        input.status === "paid" || input.status === "cod"
          ? new Date().toISOString()
          : undefined,
      updated_at: new Date().toISOString(),
    };

    const updatedResult = await client
      .from("payments")
      .update(payload)
      .eq("business_id", businessId)
      .eq("id", id)
      .select(LEGACY_PAYMENT_SELECT)
      .maybeSingle();

    if (updatedResult.error) {
      const fallbackResult = await client
        .from("payments")
        .update({
          order_id: resolvedOrderId,
          amount: payload.amount,
          method: payload.method,
          status: payload.status,
          reference: payload.reference,
          paid_at: payload.paid_at,
          updated_at: payload.updated_at,
        })
        .eq("business_id", businessId)
        .eq("id", id)
        .select(
          "id,business_id,order_id,customer_id,amount,method,status,reference,paid_at,created_at,updated_at",
        )
        .maybeSingle();
      if (fallbackResult.error) {
        throw new Error(
          `Failed to update payment: ${JSON.stringify(updatedResult.error || fallbackResult.error)}`,
        );
      }
      if (!fallbackResult.data) return null;
      paymentRow = fallbackResult.data as LegacyPaymentRow;
    } else {
      if (!updatedResult.data) return null;
      paymentRow = updatedResult.data as LegacyPaymentRow;
    }

    if (paymentRow.order_id) {
      await updateLegacyOrderPaymentState({
        businessId,
        orderId: paymentRow.order_id,
        status: asPaymentStatus(paymentRow.status),
        method: asPaymentMethod(paymentRow.method),
        reference: paymentRow.reference || null,
      });
    }

    const [orderRows, customersById] = await Promise.all([
      listLegacyOrdersByBusiness(),
      getLegacyCustomersByIds(
        [
          paymentRow.customer_id,
          paymentRow.order_id
            ? (await findLegacyOrderByIdentifier(businessId, paymentRow.order_id))
                ?.customer_id
            : null,
        ].filter(Boolean) as string[],
      ),
    ]);
    const orderMap = new Map<string, LegacyOrderRow>(
      orderRows.map((row) => [row.id, row]),
    );

    return mapPaymentRecord(paymentRow, customersById, orderMap);
  }

  // Compatibility path for older synthetic IDs (pay-<orderId>) generated from
  // order records before the dedicated payments table was used.
  const orderIdentifier = (input.orderId || id.replace(/^pay-/, "")).trim();
  if (!orderIdentifier) return null;
  const targetOrder = await findLegacyOrderByIdentifier(
    businessId,
    orderIdentifier,
  );
  if (!targetOrder) return null;

  const status = input.status || asPaymentStatus(targetOrder.payment_status);
  const method = input.method || asPaymentMethod(targetOrder.payment_method);
  const reference =
    input.reference ||
    targetOrder.payment_reference ||
    `ORDER-${targetOrder.id.slice(0, 8).toUpperCase()}`;
  const amount =
    typeof input.amount === "number" && Number.isFinite(input.amount)
      ? input.amount
      : asNumber(targetOrder.amount);

  const nowIso = new Date().toISOString();
  const inserted = await insertLegacyPaymentRow(businessId, {
    business_id: businessId,
    order_id: targetOrder.id,
    customer_id: targetOrder.customer_id || null,
    amount,
    method,
    status,
    reference,
    paid_at: status === "paid" || status === "cod" ? nowIso : null,
    provider: "manual",
    sender_name: null,
    sender_phone: null,
    raw_sms: null,
    match_confidence: 100,
    reconciliation_status: "matched",
    suggested_order_id: null,
    matched_at: nowIso,
    parsed_timestamp: null,
  });

  await updateLegacyOrderPaymentState({
    businessId,
    orderId: targetOrder.id,
    status,
    method,
    reference,
  });

  const customerMap = await getLegacyCustomersByIds(
    [targetOrder.customer_id].filter(Boolean) as string[],
  );
  const orderMap = new Map<string, LegacyOrderRow>([[targetOrder.id, targetOrder]]);
  return mapPaymentRecord(inserted, customerMap, orderMap);
}

async function listOrderPayments(orderId: string) {
  const businessId = await resolveBusinessId();
  const order = await findLegacyOrderByIdentifier(businessId, orderId);
  const resolvedOrderId = order?.id || orderId;
  const records = await listPayments();
  return records.filter((item) => item.orderId === resolvedOrderId);
}

async function listUnmatchedPayments() {
  const payments = await listPayments();
  return payments.filter(
    (payment) =>
      payment.reconciliationStatus === "pending" ||
      payment.reconciliationStatus === "unmatched" ||
      !payment.orderId,
  );
}

async function reconcilePaymentSms(
  input: ReconcileSmsInput,
): Promise<ReconcileSmsResult> {
  const businessId = await resolveBusinessId();
  const parsed = parsePaymentSms(input.rawSms);
  const [orderRows] = await Promise.all([listLegacyOrdersByBusiness()]);
  const openOrderRows = orderRows.filter((row) => {
    const paymentStatus = asPaymentStatus(row.payment_status);
    const stage = asOrderStage(row.stage);
    return (
      paymentStatus === "unpaid" ||
      paymentStatus === "partial" ||
      stage === "new_order" ||
      stage === "waiting_payment"
    );
  });

  const customerMap = await getLegacyCustomersByIds(
    Array.from(
      new Set(
        openOrderRows.map((row) => row.customer_id).filter(Boolean) as string[],
      ),
    ),
  );

  const ranked = rankPaymentMatches(
    parsed,
    openOrderRows.map((row) => ({
      orderId: row.id,
      customerName: (row.customer_id ? customerMap.get(row.customer_id)?.name : null) || "",
      customerPhone: row.customer_id ? customerMap.get(row.customer_id)?.phone : null,
      amount: asNumber(row.amount),
    })),
  );
  const best = ranked[0];
  const bestOrder = best
    ? openOrderRows.find((row) => row.id === best.orderId) || null
    : null;
  const confidence = best?.confidence || 0;
  const band = matchBandFromConfidence(confidence);
  const nowIso = new Date().toISOString();
  const amount = parsed.amount ?? 0;
  const reference = parsed.reference || `SMS-${Date.now()}`;
  const method = providerToPaymentMethod(parsed.provider);
  const provider =
    parsed.provider === "unknown" ? ("unknown" as const) : parsed.provider;

  let row: LegacyPaymentRow;
  let status: PaymentReconciliationStatus = "unmatched";
  let autoMatched = false;

  if (bestOrder && band === "high") {
    status = "matched";
    autoMatched = true;
    row = await insertLegacyPaymentRow(businessId, {
      business_id: businessId,
      order_id: bestOrder.id,
      customer_id: bestOrder.customer_id || null,
      amount,
      method,
      status: "paid",
      reference,
      paid_at: nowIso,
      sender_name: parsed.senderName,
      sender_phone: parsed.senderPhone,
      provider,
      raw_sms: parsed.rawSms,
      match_confidence: confidence,
      reconciliation_status: "matched",
      suggested_order_id: null,
      matched_at: nowIso,
      parsed_timestamp: parsed.timestamp,
    });

    await updateLegacyOrderPaymentState({
      businessId,
      orderId: bestOrder.id,
      status: "paid",
      method,
      reference,
    });
  } else if (bestOrder && band === "medium") {
    status = "pending";
    row = await insertLegacyPaymentRow(businessId, {
      business_id: businessId,
      order_id: null,
      customer_id: bestOrder.customer_id || null,
      amount,
      method,
      status: "unpaid",
      reference,
      paid_at: null,
      sender_name: parsed.senderName,
      sender_phone: parsed.senderPhone,
      provider,
      raw_sms: parsed.rawSms,
      match_confidence: confidence,
      reconciliation_status: "pending",
      suggested_order_id: bestOrder.id,
      matched_at: null,
      parsed_timestamp: parsed.timestamp,
    });
  } else {
    status = "unmatched";
    row = await insertLegacyPaymentRow(businessId, {
      business_id: businessId,
      order_id: null,
      customer_id: null,
      amount,
      method,
      status: "unpaid",
      reference,
      paid_at: null,
      sender_name: parsed.senderName,
      sender_phone: parsed.senderPhone,
      provider,
      raw_sms: parsed.rawSms,
      match_confidence: confidence || null,
      reconciliation_status: "unmatched",
      suggested_order_id: null,
      matched_at: null,
      parsed_timestamp: parsed.timestamp,
    });
  }

  const allOrders = await listLegacyOrdersByBusiness();
  const orderMap = new Map<string, LegacyOrderRow>(
    allOrders.map((item) => [item.id, item]),
  );
  const payment = mapPaymentRecord(row, customerMap, orderMap);

  return {
    payment,
    parsed,
    status,
    autoMatched,
    suggestion:
      bestOrder && best
        ? {
            orderId: bestOrder.id,
            customerName:
              customerMap.get(bestOrder.customer_id || "")?.name ||
              "Unknown customer",
            amount: asNumber(bestOrder.amount),
            confidence: best.confidence,
            amountDelta: best.amountDelta,
          }
        : null,
  };
}

async function assignPaymentToOrder(input: AssignPaymentInput) {
  const businessId = await resolveBusinessId();
  const client = createSupabaseServiceClient();
  const targetOrder = await findLegacyOrderByIdentifier(
    businessId,
    input.orderId,
  );
  if (!targetOrder) return null;

  const payment = await getLegacyPaymentById(businessId, input.paymentId);
  if (!payment) return null;
  const nowIso = new Date().toISOString();
  const method = asPaymentMethod(payment.method);
  const reference =
    payment.reference || `ORDER-${targetOrder.id.slice(0, 8).toUpperCase()}`;

  const updateResult = await client
    .from("payments")
    .update({
      order_id: targetOrder.id,
      customer_id: targetOrder.customer_id || null,
      status: "paid",
      method,
      reference,
      paid_at: nowIso,
      reconciliation_status: "matched",
      suggested_order_id: null,
      matched_at: nowIso,
      updated_at: nowIso,
    })
    .eq("business_id", businessId)
    .eq("id", input.paymentId)
    .select(LEGACY_PAYMENT_SELECT)
    .maybeSingle();

  let updatedPaymentRow: LegacyPaymentRow | null = null;
  if (updateResult.error) {
    const fallbackUpdate = await client
      .from("payments")
      .update({
        order_id: targetOrder.id,
        customer_id: targetOrder.customer_id || null,
        status: "paid",
        method,
        reference,
        paid_at: nowIso,
        updated_at: nowIso,
      })
      .eq("business_id", businessId)
      .eq("id", input.paymentId)
      .select(
        "id,business_id,order_id,customer_id,amount,method,status,reference,paid_at,created_at,updated_at",
      )
      .maybeSingle();
    if (fallbackUpdate.error) {
      throw new Error(
        `Failed to assign payment to order: ${JSON.stringify(updateResult.error || fallbackUpdate.error)}`,
      );
    }
    updatedPaymentRow = (fallbackUpdate.data || null) as LegacyPaymentRow | null;
  } else {
    updatedPaymentRow = (updateResult.data || null) as LegacyPaymentRow | null;
  }
  if (!updatedPaymentRow) return null;

  await updateLegacyOrderPaymentState({
    businessId,
    orderId: targetOrder.id,
    status: "paid",
    method,
    reference,
  });

  const [orderRows, customerMap] = await Promise.all([
    listLegacyOrdersByBusiness(),
    getLegacyCustomersByIds([targetOrder.customer_id].filter(Boolean) as string[]),
  ]);
  const orderMap = new Map<string, LegacyOrderRow>(
    orderRows.map((row) => [row.id, row]),
  );
  return mapPaymentRecord(updatedPaymentRow, customerMap, orderMap);
}

async function getPaymentsReconciledTodayCount() {
  const businessId = await resolveBusinessId();
  const client = createSupabaseServiceClient();
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  ).toISOString();
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  ).toISOString();

  const { count, error } = await client
    .from("payments")
    .select("id", { head: true, count: "exact" })
    .eq("business_id", businessId)
    .eq("reconciliation_status", "matched")
    .gte("matched_at", start)
    .lt("matched_at", end);

  if (error) {
    const fallback = await listPayments();
    return fallback.filter((payment) => {
      if (payment.reconciliationStatus !== "matched") return false;
      const matchedAt = Date.parse(payment.matchedAt || payment.createdAt);
      return Number.isFinite(matchedAt) && matchedAt >= Date.parse(start) && matchedAt < Date.parse(end);
    }).length;
  }

  return count || 0;
}

async function getAnalyticsSnapshot(): Promise<AnalyticsSnapshot> {
  const [orders, payments, followUps, customers] = await Promise.all([
    listOrders(),
    listPayments(),
    listFollowUps(),
    listCustomers(),
  ]);

  return {
    stats: computeDashboardStats(orders, followUps, payments, customers),
    series: computeAnalyticsSeries(orders, payments) as AnalyticsPoint[],
  };
}

async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const [orders, customers, followUps, payments] = await Promise.all([
    listOrders(),
    listCustomers(),
    listFollowUps(),
    listPayments(),
  ]);

  return {
    stats: computeDashboardStats(orders, followUps, payments, customers),
    orders,
    customers,
    followUps,
  };
}

async function resolveBusinessContext(options?: {
  accessToken?: string | null;
  businessNameHint?: string | null;
  fullNameHint?: string | null;
  emailHint?: string | null;
  updateExistingBusinessName?: boolean;
}): Promise<LegacyBusinessContext> {
  const authContext = await getAuthUserContext({
    accessToken: options?.accessToken,
  });
  if (authContext.hadAccessToken && !authContext.userId) {
    throw new Error("Invalid or expired authentication session.");
  }
  if (!authContext.userId) {
    throw new Error("Authenticated user is required.");
  }

  const businessId = await resolveBusinessId({
    accessToken: options?.accessToken,
    businessNameHint: options?.businessNameHint,
    fullNameHint: options?.fullNameHint,
    emailHint: options?.emailHint || authContext.user?.email,
    updateExistingBusinessName: options?.updateExistingBusinessName,
  });
  const client = createSupabaseServiceClient();
  const [{ data: businessRow, error: businessError }, { data: profileRow }] =
    await Promise.all([
      client
        .from("businesses")
        .select("id,name")
        .eq("id", businessId)
        .maybeSingle(),
      client
        .from("profiles")
        .select("id,business_name,full_name,email")
        .eq("id", authContext.userId)
        .maybeSingle(),
    ]);

  if (businessError) {
    throw new Error(
      `Failed to resolve business context: ${JSON.stringify(businessError)}`,
    );
  }

  const profile = (profileRow || null) as {
    business_name?: string | null;
    full_name?: string | null;
    email?: string | null;
  } | null;
  const businessName =
    cleanText((businessRow as { name?: string | null } | null)?.name) ||
    cleanText(profile?.business_name) ||
    cleanText(options?.businessNameHint) ||
    extractBusinessNameFromMetadata(authContext.user) ||
    businessNameFromEmail(
      authContext.user?.email || cleanText(options?.emailHint),
    );

  return {
    userId: authContext.userId,
    businessId,
    businessName: businessName || "WhatsBoard Business",
    profileBusinessName: cleanText(profile?.business_name),
    profileFullName:
      cleanText(profile?.full_name) ||
      extractFullNameFromMetadata(authContext.user),
    profileEmail:
      cleanText(profile?.email) || cleanText(authContext.user?.email),
  };
}

export function createSupabaseLegacyRepository(): WhatsboardRepository {
  return {
    listOrders,
    getOrderById,
    createOrder,
    updateOrder,
    listCustomers,
    getCustomerById,
    getCustomerProfileById,
    createCustomer,
    updateCustomer,
    listFollowUps,
    createFollowUp,
    updateFollowUp,
    listOrderFollowUps,
    listPayments,
    createPayment,
    updatePayment,
    listOrderPayments,
    listUnmatchedPayments,
    reconcilePaymentSms,
    assignPaymentToOrder,
    getPaymentsReconciledTodayCount,
    getAnalyticsSnapshot,
    getDashboardSnapshot,
  };
}

export async function resolveLegacyBusinessIdForRequest() {
  const context = await resolveBusinessContext();
  return context.businessId;
}

export async function resolveLegacyBusinessContextForRequest() {
  return resolveBusinessContext();
}

export async function provisionLegacyBusinessForAccessToken(options: {
  accessToken: string;
  businessNameHint?: string | null;
}) {
  return resolveBusinessContext({
    accessToken: options.accessToken,
    businessNameHint: options.businessNameHint,
    updateExistingBusinessName: Boolean(cleanText(options.businessNameHint)),
  });
}
