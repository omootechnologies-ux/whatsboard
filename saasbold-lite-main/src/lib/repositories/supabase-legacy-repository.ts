import type {
  CustomerRecord,
  FollowUpRecord,
  OrderRecord,
  PaymentRecord,
} from "@/data/whatsboard";
import type { User } from "@supabase/supabase-js";
import { WHATSBOARD_ACCESS_TOKEN_COOKIE } from "@/lib/auth/constants";
import { formatOrderReference } from "@/lib/display-labels";
import { statusFromDueDate } from "@/lib/follow-up-status";
import type {
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
  UpdateCustomerInput,
  UpdateFollowUpInput,
  UpdateOrderInput,
  UpdatePaymentInput,
  WhatsboardRepository,
} from "@/lib/whatsboard-repository";
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
  created_at: string;
  updated_at: string;
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
const ORDER_STAGES = [
  "new_order",
  "waiting_payment",
  "paid",
  "packing",
  "dispatched",
  "delivered",
] as const;
const PAYMENT_STATUSES = ["unpaid", "partial", "paid", "cod"] as const;
const PAYMENT_METHODS = ["M-Pesa", "Cash", "Bank"] as const;
const PRIORITIES = ["high", "medium", "low"] as const;
const LEGACY_ORDER_SELECT =
  "id,business_id,customer_id,product_name,amount,delivery_area,area,stage,payment_status,payment_method,payment_reference,payment_date,notes,created_at,updated_at";
const LEGACY_FOLLOW_UP_SELECT =
  "id,order_id,business_id,title,priority,due_at,note,completed,completed_at,created_at";

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

function asCustomerStatus(
  value: string | null | undefined,
): CustomerRecord["status"] {
  if (value === "waiting" || value === "vip" || value === "active") {
    return value;
  }
  return "active";
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
    .select("id,business_id,name,phone,area,notes,status,created_at,updated_at")
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
): OrderRecord {
  const customer =
    (row.customer_id ? customerMap.get(row.customer_id) : undefined) || null;
  const deliveryArea =
    row.delivery_area || row.area || customer?.area || "Unknown area";

  return {
    id: row.id,
    customerId: row.customer_id || "unknown-customer",
    customerName: customer?.name || "Unknown customer",
    channel: CHANNELS.includes("WhatsApp")
      ? "WhatsApp"
      : ("WhatsApp" as OrderRecord["channel"]),
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
    orderId: row.id,
    customerName: customer?.name || "Unknown customer",
    amount: asNumber(row.amount),
    status: asPaymentStatus(row.payment_status),
    method: asPaymentMethod(row.payment_method),
    reference: row.payment_reference || `ORDER-${row.id.slice(0, 8)}`,
    createdAt: row.payment_date || row.updated_at || row.created_at,
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

  return orderRows
    .map((row) => mapOrderRecord(row, customersById, dueFollowUpByOrderId))
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
      "id,business_id,customer_id,product_name,amount,delivery_area,area,stage,payment_status,payment_method,payment_reference,payment_date,notes,created_at,updated_at",
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
  return mapOrderRecord(orderRow, customerMap, dueFollowUpByOrderId);
}

async function findOrCreateCustomer(
  businessId: string,
  name: string,
  phone?: string,
  area?: string,
) {
  const client = createSupabaseServiceClient();
  if (phone?.trim()) {
    const byPhone = await client
      .from("customers")
      .select(
        "id,business_id,name,phone,area,notes,status,created_at,updated_at",
      )
      .eq("business_id", businessId)
      .eq("phone", phone.trim())
      .maybeSingle();
    if (!byPhone.error && byPhone.data)
      return byPhone.data as LegacyCustomerRow;
  }

  const byName = await client
    .from("customers")
    .select("id,business_id,name,phone,area,notes,status,created_at,updated_at")
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
      area: area?.trim() || null,
      notes: null,
      status: "active",
    })
    .select("id,business_id,name,phone,area,notes,status,created_at,updated_at")
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
    })
    .select(
      "id,business_id,customer_id,product_name,amount,delivery_area,area,stage,payment_status,payment_method,payment_reference,payment_date,notes,created_at,updated_at",
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
  );
}

async function updateOrder(id: string, input: UpdateOrderInput) {
  const businessId = await resolveBusinessId();
  const client = createSupabaseServiceClient();

  const existing = await client
    .from("orders")
    .select(
      "id,business_id,customer_id,product_name,amount,delivery_area,area,stage,payment_status,payment_method,payment_reference,payment_date,notes,created_at,updated_at",
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
      "id,business_id,customer_id,product_name,amount,delivery_area,area,stage,payment_status,payment_method,payment_reference,payment_date,notes,created_at,updated_at",
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
  );
}

async function listCustomers(query: CustomersQuery = {}) {
  const businessId = await resolveBusinessId();
  const client = createSupabaseServiceClient();
  const search = query.search?.trim() ?? "";

  const [{ data: customersData, error: customerError }, orders, followUps] =
    await Promise.all([
      client
        .from("customers")
        .select(
          "id,business_id,name,phone,area,notes,status,created_at,updated_at",
        )
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
    { totalOrders: number; totalSpend: number; lastOrderAt: string }
  >();
  for (const order of orders) {
    if (!order.customer_id) continue;
    const current = orderStatsByCustomer.get(order.customer_id) || {
      totalOrders: 0,
      totalSpend: 0,
      lastOrderAt: order.created_at,
    };
    current.totalOrders += 1;
    current.totalSpend += asNumber(order.amount);
    if (current.lastOrderAt < order.created_at)
      current.lastOrderAt = order.created_at;
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

  return ((customersData || []) as LegacyCustomerRow[])
    .map((row): CustomerRecord => {
      const stats = orderStatsByCustomer.get(row.id);
      return {
        id: row.id,
        name: row.name,
        phone: row.phone || "Not provided",
        location: row.area || "Not specified",
        totalOrders: stats?.totalOrders || 0,
        totalSpend: stats?.totalSpend || 0,
        lastOrderAt: stats?.lastOrderAt || row.updated_at || row.created_at,
        nextFollowUpAt: nextFollowUpByCustomer.get(row.id),
        status: asCustomerStatus(row.status),
      };
    })
    .filter((item) => (query.status ? item.status === query.status : true))
    .filter((item) => {
      if (!search) return true;
      const haystack = [item.name, item.phone, item.location].join(" ");
      return includesText(haystack, search);
    })
    .sort((a, b) => (a.lastOrderAt > b.lastOrderAt ? -1 : 1));
}

async function getCustomerById(id: string) {
  const records = await listCustomers();
  return records.find((item) => item.id === id) || null;
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
      area: input.location || null,
      notes: null,
      status: input.status,
    })
    .select("id,business_id,name,phone,area,notes,status,created_at,updated_at")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create customer: ${JSON.stringify(error)}`);
  }

  const row = data as LegacyCustomerRow;
  return {
    id: row.id,
    name: row.name,
    phone: row.phone || "Not provided",
    location: row.area || "Not specified",
    totalOrders: 0,
    totalSpend: 0,
    lastOrderAt: row.created_at,
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
      area: input.location || undefined,
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

async function listPayments(query: PaymentsQuery = {}) {
  const search = query.search?.trim() ?? "";
  const orderRows = await listLegacyOrdersByBusiness();
  const customersById = await getLegacyCustomersByIds(
    Array.from(
      new Set(
        orderRows.map((row) => row.customer_id).filter(Boolean) as string[],
      ),
    ),
  );

  return orderRows
    .map((row) => mapPaymentFromOrder(row, customersById))
    .filter((item) => (query.status ? item.status === query.status : true))
    .filter((item) => (query.method ? item.method === query.method : true))
    .filter((item) => {
      if (!search) return true;
      const haystack = [
        item.orderId,
        item.customerName,
        item.reference,
        item.method,
      ].join(" ");
      return includesText(haystack, search);
    })
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
}

async function createPayment(input: CreatePaymentInput) {
  const businessId = await resolveBusinessId();
  const client = createSupabaseServiceClient();
  const targetOrder = await findLegacyOrderByIdentifier(
    businessId,
    input.orderId,
  );
  if (!targetOrder) {
    throw new Error(`Order not found for payment: ${input.orderId}`);
  }

  const { data, error } = await client
    .from("orders")
    .update({
      payment_status: input.status,
      payment_method: input.method,
      payment_reference: input.reference,
      payment_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("business_id", businessId)
    .eq("id", targetOrder.id)
    .select(LEGACY_ORDER_SELECT)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to create payment: ${JSON.stringify(error)}`);
  }
  if (!data) {
    throw new Error(`Order not found for payment: ${input.orderId}`);
  }

  const customerMap = await getLegacyCustomersByIds(
    data.customer_id ? [String(data.customer_id)] : [],
  );
  return mapPaymentFromOrder(data as LegacyOrderRow, customerMap);
}

async function updatePayment(id: string, input: UpdatePaymentInput) {
  const orderIdentifier = (input.orderId || id.replace(/^pay-/, "")).trim();
  if (!orderIdentifier) return null;
  const businessId = await resolveBusinessId();
  const client = createSupabaseServiceClient();
  const targetOrder = await findLegacyOrderByIdentifier(
    businessId,
    orderIdentifier,
  );
  if (!targetOrder) return null;

  const payload: Record<string, unknown> = {
    payment_status: input.status || undefined,
    payment_method: input.method || undefined,
    payment_reference: input.reference || undefined,
    payment_date:
      input.status === "paid" || input.status === "cod"
        ? new Date().toISOString()
        : undefined,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await client
    .from("orders")
    .update(payload)
    .eq("business_id", businessId)
    .eq("id", targetOrder.id)
    .select(LEGACY_ORDER_SELECT)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update payment: ${JSON.stringify(error)}`);
  }
  if (!data) return null;

  const customerMap = await getLegacyCustomersByIds(
    data.customer_id ? [String(data.customer_id)] : [],
  );
  return mapPaymentFromOrder(data as LegacyOrderRow, customerMap);
}

async function listOrderPayments(orderId: string) {
  const records = await listPayments();
  return records.filter((item) => item.orderId === orderId);
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
