import type {
  CustomerRecord,
  FollowUpRecord,
  OrderRecord,
  PaymentRecord,
} from "@/data/whatsboard";
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
import { createSupabaseServiceClient } from "@/lib/supabase/server";

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
  due_at: string;
  note: string | null;
  completed: boolean | null;
  completed_at: string | null;
  created_at: string;
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

function asPriority(value: string | null | undefined): FollowUpRecord["priority"] {
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

function deriveFollowUpStatus(row: LegacyFollowUpRow): FollowUpRecord["status"] {
  if (row.completed) return "completed";
  return statusFromDueDate(row.due_at);
}

let cachedBusinessId: string | undefined;

async function resolveBusinessId() {
  if (cachedBusinessId) return cachedBusinessId;

  const client = createSupabaseServiceClient();
  const preferredBusinessId =
    process.env.WHATSBOARD_DEFAULT_WORKSPACE_ID?.trim() || undefined;

  if (preferredBusinessId) {
    cachedBusinessId = preferredBusinessId;
    return preferredBusinessId;
  }

  const fromBusinesses = await client.from("businesses").select("id").limit(1);
  if (!fromBusinesses.error && fromBusinesses.data?.[0]?.id) {
    cachedBusinessId = String(fromBusinesses.data[0].id);
    return cachedBusinessId;
  }

  const fromProfiles = await client.from("profiles").select("business_id").limit(1);
  if (!fromProfiles.error && fromProfiles.data?.[0]?.business_id) {
    cachedBusinessId = String(fromProfiles.data[0].business_id);
    return cachedBusinessId;
  }

  const fromOrders = await client.from("orders").select("business_id").limit(1);
  if (!fromOrders.error && fromOrders.data?.[0]?.business_id) {
    cachedBusinessId = String(fromOrders.data[0].business_id);
    return cachedBusinessId;
  }

  const fromCustomers = await client
    .from("customers")
    .select("business_id")
    .limit(1);
  if (!fromCustomers.error && fromCustomers.data?.[0]?.business_id) {
    cachedBusinessId = String(fromCustomers.data[0].business_id);
    return cachedBusinessId;
  }

  throw new Error(
    "Unable to resolve business context. Set WHATSBOARD_DEFAULT_WORKSPACE_ID to an existing businesses.id value.",
  );
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
    .select(
      "id,business_id,customer_id,product_name,amount,delivery_area,area,stage,payment_status,payment_method,payment_reference,payment_date,notes,created_at,updated_at",
    )
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
    .select(
      "id,order_id,business_id,due_at,note,completed,completed_at,created_at",
    )
    .eq("business_id", businessId)
    .order("due_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to list follow-ups: ${JSON.stringify(error)}`);
  }

  return (data || []) as LegacyFollowUpRow[];
}

function mapOrderRecord(
  row: LegacyOrderRow,
  customerMap: Map<string, LegacyCustomerRow>,
  dueFollowUpByOrderId: Map<string, string>,
): OrderRecord {
  const customer =
    (row.customer_id ? customerMap.get(row.customer_id) : undefined) || null;
  const deliveryArea = row.delivery_area || row.area || customer?.area || "Unknown area";

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
  const activeOrders = orders.filter((order) => order.stage !== "delivered").length;
  const overdueFollowUps = followUps.filter((item) => item.status === "overdue").length;
  const revenueMonth = payments
    .filter((item) => item.status === "paid" || item.status === "cod")
    .reduce((sum, item) => sum + item.amount, 0);
  const payoutPending = orders
    .filter((order) => order.paymentStatus === "unpaid" || order.paymentStatus === "partial")
    .reduce((sum, order) => sum + order.amount, 0);
  const delivered = orders.filter((order) => order.stage === "delivered").length;
  const conversionRate = orders.length ? Math.round((delivered / orders.length) * 100) : 0;

  return {
    revenueMonth,
    activeOrders,
    overdueFollowUps,
    customersThisMonth: customers.length,
    conversionRate,
    payoutPending,
  };
}

function computeAnalyticsSeries(orders: OrderRecord[], payments: PaymentRecord[]) {
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
    new Set(orderRows.map((row) => row.customer_id).filter(Boolean) as string[]),
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
    .filter((order) => (query.payment ? order.paymentStatus === query.payment : true))
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
      .select("id,business_id,name,phone,area,notes,status,created_at,updated_at")
      .eq("business_id", businessId)
      .eq("phone", phone.trim())
      .maybeSingle();
    if (!byPhone.error && byPhone.data) return byPhone.data as LegacyCustomerRow;
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
        .select("id,business_id,name,phone,area,notes,status,created_at,updated_at")
        .eq("business_id", businessId)
        .order("updated_at", { ascending: false }),
      listLegacyOrdersByBusiness(),
      listLegacyFollowUpsByBusiness(),
    ]);

  if (customerError) {
    throw new Error(`Failed to list customers: ${JSON.stringify(customerError)}`);
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
    if (current.lastOrderAt < order.created_at) current.lastOrderAt = order.created_at;
    orderStatsByCustomer.set(order.customer_id, current);
  }

  const orderById = new Map<string, LegacyOrderRow>(orders.map((row) => [row.id, row]));
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

  return {
    id: row.id,
    customerId: order?.customer_id || "unknown-customer",
    customerName: customer?.name || "Unknown customer",
    orderId: row.order_id || undefined,
    title: order ? `Follow-up for ${order.id}` : "Customer follow-up",
    note: row.note || "",
    dueAt: row.due_at,
    status: deriveFollowUpStatus(row),
    priority: asPriority(row.completed ? "low" : "medium"),
  };
}

async function listFollowUps(query: FollowUpsQuery = {}) {
  const search = query.search?.trim() ?? "";
  const [followUps, orders] = await Promise.all([
    listLegacyFollowUpsByBusiness(),
    listLegacyOrdersByBusiness(),
  ]);
  const customersById = await getLegacyCustomersByIds(
    Array.from(new Set(orders.map((row) => row.customer_id).filter(Boolean) as string[])),
  );
  const ordersById = new Map<string, LegacyOrderRow>(orders.map((row) => [row.id, row]));

  return followUps
    .map((row) => mapFollowUpRecord(row, ordersById, customersById))
    .filter((item) => (query.status ? item.status === query.status : true))
    .filter((item) => {
      if (!search) return true;
      const haystack = [item.title, item.customerName, item.note, item.orderId || ""].join(
        " ",
      );
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
    const { data } = await client
      .from("orders")
      .select("id")
      .eq("business_id", businessId)
      .eq("id", input.orderId.trim())
      .maybeSingle();
    if (data?.id) {
      orderId = String(data.id);
    }
  }

  const { data, error } = await client
    .from("follow_ups")
    .insert({
      business_id: businessId,
      order_id: orderId,
      due_at: dueAtIso,
      note: input.note,
      completed: false,
      completed_at: null,
    })
    .select("id,order_id,business_id,due_at,note,completed,completed_at,created_at")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create follow-up: ${JSON.stringify(error)}`);
  }

  const orders = await listLegacyOrdersByBusiness();
  const ordersById = new Map<string, LegacyOrderRow>(orders.map((row) => [row.id, row]));
  const customersById = await getLegacyCustomersByIds(
    Array.from(new Set(orders.map((row) => row.customer_id).filter(Boolean) as string[])),
  );
  return mapFollowUpRecord(data as LegacyFollowUpRow, ordersById, customersById);
}

async function updateFollowUp(id: string, input: UpdateFollowUpInput) {
  const businessId = await resolveBusinessId();
  const client = createSupabaseServiceClient();
  const updatePayload: Record<string, unknown> = {
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
    .select("id,order_id,business_id,due_at,note,completed,completed_at,created_at")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update follow-up: ${JSON.stringify(error)}`);
  }
  if (!data) return null;

  const orders = await listLegacyOrdersByBusiness();
  const ordersById = new Map<string, LegacyOrderRow>(orders.map((row) => [row.id, row]));
  const customersById = await getLegacyCustomersByIds(
    Array.from(new Set(orders.map((row) => row.customer_id).filter(Boolean) as string[])),
  );
  return mapFollowUpRecord(data as LegacyFollowUpRow, ordersById, customersById);
}

async function listOrderFollowUps(orderId: string) {
  const records = await listFollowUps();
  return records.filter((item) => item.orderId === orderId);
}

async function listPayments(query: PaymentsQuery = {}) {
  const search = query.search?.trim() ?? "";
  const orderRows = await listLegacyOrdersByBusiness();
  const customersById = await getLegacyCustomersByIds(
    Array.from(new Set(orderRows.map((row) => row.customer_id).filter(Boolean) as string[])),
  );

  return orderRows
    .map((row) => mapPaymentFromOrder(row, customersById))
    .filter((item) => (query.status ? item.status === query.status : true))
    .filter((item) => (query.method ? item.method === query.method : true))
    .filter((item) => {
      if (!search) return true;
      const haystack = [item.orderId, item.customerName, item.reference, item.method].join(
        " ",
      );
      return includesText(haystack, search);
    })
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
}

async function createPayment(input: CreatePaymentInput) {
  const businessId = await resolveBusinessId();
  const client = createSupabaseServiceClient();
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
    .eq("id", input.orderId)
    .select(
      "id,business_id,customer_id,product_name,amount,delivery_area,area,stage,payment_status,payment_method,payment_reference,payment_date,notes,created_at,updated_at",
    )
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
  const orderId = (input.orderId || id.replace(/^pay-/, "")).trim();
  if (!orderId) return null;
  const businessId = await resolveBusinessId();
  const client = createSupabaseServiceClient();

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
    .eq("id", orderId)
    .select(
      "id,business_id,customer_id,product_name,amount,delivery_area,area,stage,payment_status,payment_method,payment_reference,payment_date,notes,created_at,updated_at",
    )
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
