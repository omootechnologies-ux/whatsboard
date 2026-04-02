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
import {
  createSupabaseServiceClient,
  isSupabaseServerConfigured,
} from "@/lib/supabase/server";
import { createSupabaseLegacyRepository } from "@/lib/repositories/supabase-legacy-repository";

type WorkspaceRow = {
  id: string;
  name: string;
};

type CustomerRow = {
  id: string;
  workspace_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  location: string | null;
  notes: string | null;
  status: CustomerRecord["status"] | null;
  total_orders: number | string | null;
  total_spent: number | string | null;
  last_order_at: string | null;
  created_at: string;
  updated_at: string;
};

type OrderRow = {
  id: string;
  workspace_id: string;
  customer_id: string | null;
  order_number: string;
  status: OrderRecord["stage"] | null;
  payment_status: OrderRecord["paymentStatus"] | null;
  subtotal: number | string | null;
  total: number | string | null;
  currency: string | null;
  notes: string | null;
  source: OrderRecord["channel"] | string | null;
  delivery_area: string | null;
  due_follow_up_at: string | null;
  dispatch_eta: string | null;
  payment_reference: string | null;
  created_at: string;
  updated_at: string;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  product_name: string;
  quantity: number | string;
  unit_price: number | string;
  total_price: number | string;
  created_at: string;
};

type FollowUpRow = {
  id: string;
  workspace_id: string;
  customer_id: string | null;
  order_id: string | null;
  title: string;
  notes: string | null;
  due_date: string;
  status: FollowUpRecord["status"] | null;
  priority: FollowUpRecord["priority"] | null;
  created_at: string;
  updated_at: string;
};

type PaymentRow = {
  id: string;
  workspace_id: string;
  order_id: string | null;
  customer_id: string | null;
  amount: number | string;
  method: PaymentRecord["method"] | string | null;
  status: PaymentRecord["status"] | null;
  reference: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
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
const PRIORITIES = ["high", "medium", "low"] as const;

function includesText(value: string, search: string) {
  return value.toLowerCase().includes(search.toLowerCase());
}

function asNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function asChannel(value: string | null | undefined): OrderRecord["channel"] {
  if (value && CHANNELS.includes(value as (typeof CHANNELS)[number])) {
    return value as OrderRecord["channel"];
  }
  return "WhatsApp";
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

function asFollowUpPriority(
  value: string | null | undefined,
): FollowUpRecord["priority"] {
  if (value && PRIORITIES.includes(value as (typeof PRIORITIES)[number])) {
    return value as FollowUpRecord["priority"];
  }
  return "medium";
}

function computeFollowUpStatus(
  status: string | null | undefined,
  dueDate: string,
): FollowUpRecord["status"] {
  if (status === "completed") return "completed";
  return statusFromDueDate(dueDate);
}

function requireData<T>(data: T | null, error: unknown, context: string): T {
  if (error) {
    throw new Error(
      `${context}: ${typeof error === "object" ? JSON.stringify(error) : String(error)}`,
    );
  }
  if (!data) {
    throw new Error(`${context}: no data returned`);
  }
  return data;
}

let cachedWorkspaceId: string | undefined;

async function resolveWorkspaceId() {
  if (cachedWorkspaceId) return cachedWorkspaceId;

  const client = createSupabaseServiceClient();
  const preferredWorkspaceId = process.env.WHATSBOARD_DEFAULT_WORKSPACE_ID;
  const preferredWorkspaceName =
    process.env.WHATSBOARD_DEFAULT_WORKSPACE_NAME || "WhatsBoard Workspace";

  if (preferredWorkspaceId) {
    const { data, error } = await client
      .from("workspaces")
      .upsert(
        {
          id: preferredWorkspaceId,
          name: preferredWorkspaceName,
        },
        { onConflict: "id" },
      )
      .select("id,name")
      .single();

    const workspace = requireData<WorkspaceRow>(
      data as WorkspaceRow | null,
      error,
      "Failed to ensure preferred workspace",
    );
    cachedWorkspaceId = workspace.id;
    return workspace.id;
  }

  const { data: existingRows, error: existingError } = await client
    .from("workspaces")
    .select("id,name")
    .eq("name", preferredWorkspaceName)
    .limit(1);

  if (existingError) {
    throw new Error(
      `Failed to query workspace: ${JSON.stringify(existingError)}`,
    );
  }

  if (existingRows && existingRows.length > 0) {
    cachedWorkspaceId = (existingRows[0] as WorkspaceRow).id;
    return cachedWorkspaceId;
  }

  const { data: createdRow, error: createError } = await client
    .from("workspaces")
    .insert({ name: preferredWorkspaceName })
    .select("id,name")
    .single();

  const workspace = requireData<WorkspaceRow>(
    createdRow as WorkspaceRow | null,
    createError,
    "Failed to create default workspace",
  );
  cachedWorkspaceId = workspace.id;
  return workspace.id;
}

async function getCustomerRowsByIds(ids: string[]) {
  if (!ids.length) return new Map<string, CustomerRow>();
  const client = createSupabaseServiceClient();
  const workspaceId = await resolveWorkspaceId();
  const { data, error } = await client
    .from("customers")
    .select(
      "id,workspace_id,name,phone,email,address,location,notes,status,total_orders,total_spent,last_order_at,created_at,updated_at",
    )
    .eq("workspace_id", workspaceId)
    .in("id", ids);

  if (error) {
    throw new Error(`Failed to query customers: ${JSON.stringify(error)}`);
  }

  return new Map<string, CustomerRow>(
    ((data || []) as CustomerRow[]).map((row) => [row.id, row]),
  );
}

async function getOrderItemRowsByOrderIds(orderIds: string[]) {
  if (!orderIds.length) return new Map<string, OrderItemRow[]>();
  const client = createSupabaseServiceClient();
  const { data, error } = await client
    .from("order_items")
    .select(
      "id,order_id,product_name,quantity,unit_price,total_price,created_at",
    )
    .in("order_id", orderIds)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to query order items: ${JSON.stringify(error)}`);
  }

  const map = new Map<string, OrderItemRow[]>();
  (data as OrderItemRow[] | null)?.forEach((row) => {
    const current = map.get(row.order_id) ?? [];
    current.push(row);
    map.set(row.order_id, current);
  });
  return map;
}

function mapCustomerRecord(
  row: CustomerRow,
  nextFollowUpAt?: string,
): CustomerRecord {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone || "Not provided",
    location: row.location || row.address || "Not specified",
    totalOrders: asNumber(row.total_orders),
    totalSpend: asNumber(row.total_spent),
    lastOrderAt: row.last_order_at || row.updated_at || row.created_at,
    nextFollowUpAt,
    status:
      row.status === "vip" ||
      row.status === "waiting" ||
      row.status === "active"
        ? row.status
        : "active",
  };
}

function mapOrderRecord(
  row: OrderRow,
  customer?: CustomerRow,
  orderItems?: OrderItemRow[],
): OrderRecord {
  const items =
    orderItems?.map((item) => item.product_name).filter(Boolean) ||
    (row.notes ? [row.notes] : ["Unspecified item"]);

  return {
    id: row.order_number,
    customerId: row.customer_id || customer?.id || "unknown-customer",
    customerName: customer?.name || "Unknown customer",
    customerPhone: customer?.phone || undefined,
    channel: asChannel(row.source),
    stage: asOrderStage(row.status),
    paymentStatus: asPaymentStatus(row.payment_status),
    amount: asNumber(row.total),
    deliveryArea: row.delivery_area || customer?.location || "Not specified",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    dueFollowUpAt: row.due_follow_up_at || undefined,
    dispatchEta: row.dispatch_eta || undefined,
    notes: row.notes || "No note",
    items,
    paymentReference: row.payment_reference || undefined,
  };
}

function mapFollowUpRecord(
  row: FollowUpRow,
  customerMap: Map<string, CustomerRow>,
  orderNumberMap: Map<string, string>,
): FollowUpRecord {
  const customer = row.customer_id
    ? customerMap.get(row.customer_id)
    : undefined;
  const status = computeFollowUpStatus(row.status, row.due_date);

  return {
    id: row.id,
    customerId: row.customer_id || "unknown-customer",
    customerName: customer?.name || "Unknown customer",
    orderId: row.order_id
      ? orderNumberMap.get(row.order_id) || undefined
      : undefined,
    title: row.title || "Manual follow-up",
    note: row.notes || "",
    dueAt: row.due_date,
    status,
    priority: asFollowUpPriority(row.priority),
  };
}

function mapPaymentRecord(
  row: PaymentRow,
  customerMap: Map<string, CustomerRow>,
  orderNumberMap: Map<string, string>,
): PaymentRecord {
  const customer = row.customer_id
    ? customerMap.get(row.customer_id)
    : undefined;
  return {
    id: row.id,
    orderId: row.order_id
      ? orderNumberMap.get(row.order_id) || "Unknown"
      : "Unknown",
    customerName: customer?.name || "Unknown customer",
    amount: asNumber(row.amount),
    status: asPaymentStatus(row.status),
    method:
      row.method === "M-Pesa" || row.method === "Bank" || row.method === "Cash"
        ? row.method
        : "Cash",
    reference: row.reference || "N/A",
    createdAt: row.created_at,
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
    (followUp) => followUp.status === "overdue",
  ).length;
  const revenueMonth = payments
    .filter((payment) => payment.status === "paid" || payment.status === "cod")
    .reduce((sum, payment) => sum + payment.amount, 0);
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
): AnalyticsPoint[] {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const buckets = labels.map((label) => ({ label, revenue: 0, orders: 0 }));

  orders.forEach((order) => {
    const day = new Date(order.createdAt).getDay();
    const mapped = day === 0 ? 6 : day - 1;
    buckets[mapped].orders += 1;
  });

  payments.forEach((payment) => {
    const day = new Date(payment.createdAt).getDay();
    const mapped = day === 0 ? 6 : day - 1;
    if (payment.status === "paid" || payment.status === "cod") {
      buckets[mapped].revenue += payment.amount;
    }
  });

  return buckets;
}

async function nextOrderNumber(workspaceId: string) {
  const client = createSupabaseServiceClient();
  const { data, error } = await client
    .from("orders")
    .select("order_number")
    .eq("workspace_id", workspaceId);

  if (error) {
    throw new Error(
      `Failed to determine next order number: ${JSON.stringify(error)}`,
    );
  }

  const max = ((data || []) as Array<{ order_number: string }>).reduce(
    (highest, row) => {
      const parsed = Number(String(row.order_number || "").replace("WB-", ""));
      return Number.isFinite(parsed) ? Math.max(highest, parsed) : highest;
    },
    3400,
  );

  return `WB-${max + 1}`;
}

async function findOrCreateCustomerByName(
  workspaceId: string,
  customerName: string,
  customerPhone?: string,
  location?: string,
) {
  const client = createSupabaseServiceClient();
  const normalizedName = customerName.trim();

  const { data: existingRows, error: existingError } = await client
    .from("customers")
    .select(
      "id,workspace_id,name,phone,email,address,location,notes,status,total_orders,total_spent,last_order_at,created_at,updated_at",
    )
    .eq("workspace_id", workspaceId)
    .ilike("name", normalizedName)
    .limit(1);

  if (existingError) {
    throw new Error(
      `Failed to query customer by name: ${JSON.stringify(existingError)}`,
    );
  }

  if (existingRows && existingRows.length > 0) {
    return existingRows[0] as CustomerRow;
  }

  const now = new Date().toISOString();
  const { data: createdRow, error: createError } = await client
    .from("customers")
    .insert({
      workspace_id: workspaceId,
      name: normalizedName,
      phone: customerPhone?.trim() || "Not provided",
      location: location?.trim() || "Not specified",
      address: location?.trim() || "Not specified",
      status: "active",
      total_orders: 0,
      total_spent: 0,
      last_order_at: now,
    })
    .select(
      "id,workspace_id,name,phone,email,address,location,notes,status,total_orders,total_spent,last_order_at,created_at,updated_at",
    )
    .single();

  return requireData<CustomerRow>(
    createdRow as CustomerRow | null,
    createError,
    "Failed to create customer",
  );
}

async function syncCustomerAggregates(workspaceId: string, customerId: string) {
  const client = createSupabaseServiceClient();
  const { data: rows, error } = await client
    .from("orders")
    .select("total,updated_at")
    .eq("workspace_id", workspaceId)
    .eq("customer_id", customerId);

  if (error) {
    throw new Error(
      `Failed to recalculate customer aggregates: ${JSON.stringify(error)}`,
    );
  }

  const totalOrders = rows?.length || 0;
  const totalSpent = (rows || []).reduce(
    (sum, row) =>
      sum + asNumber((row as { total: number | string | null }).total),
    0,
  );
  const lastOrderAt =
    (rows || []).reduce((latest, row) => {
      const updatedAt = (row as { updated_at: string }).updated_at;
      return updatedAt > latest ? updatedAt : latest;
    }, "") || null;

  const { error: updateError } = await client
    .from("customers")
    .update({
      total_orders: totalOrders,
      total_spent: totalSpent,
      last_order_at: lastOrderAt,
      updated_at: new Date().toISOString(),
    })
    .eq("workspace_id", workspaceId)
    .eq("id", customerId);

  if (updateError) {
    throw new Error(
      `Failed to update customer aggregates: ${JSON.stringify(updateError)}`,
    );
  }
}

async function getOrderRowByOrderNumber(
  workspaceId: string,
  orderNumber: string,
) {
  const client = createSupabaseServiceClient();
  const { data, error } = await client
    .from("orders")
    .select(
      "id,workspace_id,customer_id,order_number,status,payment_status,subtotal,total,currency,notes,source,delivery_area,due_follow_up_at,dispatch_eta,payment_reference,created_at,updated_at",
    )
    .eq("workspace_id", workspaceId)
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to fetch order by number ${orderNumber}: ${JSON.stringify(error)}`,
    );
  }

  return (data as OrderRow | null) || null;
}

async function listOrders(query: OrdersQuery = {}) {
  const client = createSupabaseServiceClient();
  const workspaceId = await resolveWorkspaceId();

  let q = client
    .from("orders")
    .select(
      "id,workspace_id,customer_id,order_number,status,payment_status,subtotal,total,currency,notes,source,delivery_area,due_follow_up_at,dispatch_eta,payment_reference,created_at,updated_at",
    )
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false });

  if (query.stage) {
    q = q.eq("status", query.stage);
  }

  if (query.payment) {
    q = q.eq("payment_status", query.payment);
  }

  const { data, error } = await q;
  if (error) {
    throw new Error(`Failed to list orders: ${JSON.stringify(error)}`);
  }

  const rows = (data || []) as OrderRow[];
  const customerIds = rows
    .map((row) => row.customer_id)
    .filter((id): id is string => Boolean(id));
  const customerMap = await getCustomerRowsByIds(customerIds);
  const itemMap = await getOrderItemRowsByOrderIds(rows.map((row) => row.id));

  const mapped = rows.map((row) =>
    mapOrderRecord(
      row,
      customerMap.get(row.customer_id || ""),
      itemMap.get(row.id),
    ),
  );

  const search = query.search?.trim() ?? "";
  if (!search) return mapped;

  return mapped.filter((order) => {
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
  const workspaceId = await resolveWorkspaceId();
  const row = await getOrderRowByOrderNumber(workspaceId, id);
  if (!row) return null;

  const customerMap = await getCustomerRowsByIds(
    row.customer_id ? [row.customer_id] : [],
  );
  const itemMap = await getOrderItemRowsByOrderIds([row.id]);

  return mapOrderRecord(
    row,
    customerMap.get(row.customer_id || ""),
    itemMap.get(row.id),
  );
}

async function createOrder(input: CreateOrderInput) {
  const client = createSupabaseServiceClient();
  const workspaceId = await resolveWorkspaceId();
  const customer = await findOrCreateCustomerByName(
    workspaceId,
    input.customerName,
    input.customerPhone,
    input.deliveryArea,
  );
  const orderNumber = await nextOrderNumber(workspaceId);
  const now = new Date().toISOString();

  const { data: createdRow, error: createError } = await client
    .from("orders")
    .insert({
      workspace_id: workspaceId,
      customer_id: customer.id,
      order_number: orderNumber,
      status: input.stage,
      payment_status: input.paymentStatus,
      subtotal: input.amount,
      total: input.amount,
      currency: "TZS",
      notes: input.notes.trim() || "No note",
      source: input.channel,
      delivery_area: input.deliveryArea.trim(),
      created_at: now,
      updated_at: now,
    })
    .select(
      "id,workspace_id,customer_id,order_number,status,payment_status,subtotal,total,currency,notes,source,delivery_area,due_follow_up_at,dispatch_eta,payment_reference,created_at,updated_at",
    )
    .single();

  const orderRow = requireData<OrderRow>(
    createdRow as OrderRow | null,
    createError,
    "Failed to create order",
  );

  const normalizedItems = input.items.length
    ? input.items
    : ["Unspecified item"];
  const unitPrice = normalizedItems.length
    ? Math.max(Math.round(input.amount / normalizedItems.length), 0)
    : 0;

  const rows = normalizedItems.map((item) => ({
    order_id: orderRow.id,
    product_name: item,
    quantity: 1,
    unit_price: unitPrice,
    total_price: unitPrice,
  }));

  const { error: itemError } = await client.from("order_items").insert(rows);
  if (itemError) {
    throw new Error(
      `Failed to create order items: ${JSON.stringify(itemError)}`,
    );
  }

  await syncCustomerAggregates(workspaceId, customer.id);
  return requireData<OrderRecord>(
    await getOrderById(orderNumber),
    null,
    "Failed to fetch created order",
  );
}

async function updateOrder(id: string, input: UpdateOrderInput) {
  const client = createSupabaseServiceClient();
  const workspaceId = await resolveWorkspaceId();
  const existing = await getOrderRowByOrderNumber(workspaceId, id);
  if (!existing) return null;

  const customer = await findOrCreateCustomerByName(
    workspaceId,
    input.customerName,
    undefined,
    undefined,
  );

  const { error: updateError } = await client
    .from("orders")
    .update({
      customer_id: customer.id,
      status: input.stage,
      payment_status: input.paymentStatus,
      subtotal: input.amount,
      total: input.amount,
      notes: input.notes.trim() || existing.notes || "No note",
      updated_at: new Date().toISOString(),
    })
    .eq("workspace_id", workspaceId)
    .eq("id", existing.id);

  if (updateError) {
    throw new Error(`Failed to update order: ${JSON.stringify(updateError)}`);
  }

  if (existing.customer_id) {
    await syncCustomerAggregates(workspaceId, existing.customer_id);
  }
  await syncCustomerAggregates(workspaceId, customer.id);

  return getOrderById(id);
}

async function listCustomers(query: CustomersQuery = {}) {
  const client = createSupabaseServiceClient();
  const workspaceId = await resolveWorkspaceId();
  let q = client
    .from("customers")
    .select(
      "id,workspace_id,name,phone,email,address,location,notes,status,total_orders,total_spent,last_order_at,created_at,updated_at",
    )
    .eq("workspace_id", workspaceId)
    .order("last_order_at", { ascending: false, nullsFirst: false });

  if (query.status) {
    q = q.eq("status", query.status);
  }

  const { data, error } = await q;
  if (error) {
    throw new Error(`Failed to list customers: ${JSON.stringify(error)}`);
  }

  const rows = (data || []) as CustomerRow[];
  const search = query.search?.trim() ?? "";

  const { data: followUpRows, error: followUpError } = await client
    .from("follow_ups")
    .select("customer_id,due_date,status")
    .eq("workspace_id", workspaceId)
    .neq("status", "completed");

  if (followUpError) {
    throw new Error(
      `Failed to list customer follow-up hints: ${JSON.stringify(followUpError)}`,
    );
  }

  const nextDueByCustomer = new Map<string, string>();
  (followUpRows || []).forEach((row) => {
    const customerId = (row as { customer_id: string | null }).customer_id;
    const dueDate = (row as { due_date: string }).due_date;
    if (!customerId) return;
    const current = nextDueByCustomer.get(customerId);
    if (!current || dueDate < current) {
      nextDueByCustomer.set(customerId, dueDate);
    }
  });

  const mapped = rows.map((row) =>
    mapCustomerRecord(row, nextDueByCustomer.get(row.id)),
  );

  if (!search) return mapped;

  return mapped.filter((customer) =>
    includesText(
      [customer.name, customer.phone, customer.location].join(" "),
      search,
    ),
  );
}

async function getCustomerById(id: string) {
  const workspaceId = await resolveWorkspaceId();
  const client = createSupabaseServiceClient();
  const { data, error } = await client
    .from("customers")
    .select(
      "id,workspace_id,name,phone,email,address,location,notes,status,total_orders,total_spent,last_order_at,created_at,updated_at",
    )
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get customer: ${JSON.stringify(error)}`);
  }

  if (!data) return null;
  return mapCustomerRecord(data as CustomerRow);
}

async function createCustomer(input: CreateCustomerInput) {
  const client = createSupabaseServiceClient();
  const workspaceId = await resolveWorkspaceId();
  const now = new Date().toISOString();
  const { data, error } = await client
    .from("customers")
    .insert({
      workspace_id: workspaceId,
      name: input.name.trim(),
      phone: input.phone.trim(),
      location: input.location.trim(),
      address: input.location.trim(),
      status: input.status,
      total_orders: 0,
      total_spent: 0,
      last_order_at: now,
      created_at: now,
      updated_at: now,
    })
    .select(
      "id,workspace_id,name,phone,email,address,location,notes,status,total_orders,total_spent,last_order_at,created_at,updated_at",
    )
    .single();

  const row = requireData<CustomerRow>(
    data as CustomerRow | null,
    error,
    "Failed to create customer",
  );
  return mapCustomerRecord(row);
}

async function updateCustomer(id: string, input: UpdateCustomerInput) {
  const client = createSupabaseServiceClient();
  const workspaceId = await resolveWorkspaceId();
  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) updatePayload.name = input.name.trim();
  if (input.phone !== undefined) updatePayload.phone = input.phone.trim();
  if (input.location !== undefined) {
    updatePayload.location = input.location.trim();
    updatePayload.address = input.location.trim();
  }
  if (input.status !== undefined) updatePayload.status = input.status;

  const { data, error } = await client
    .from("customers")
    .update(updatePayload)
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .select(
      "id,workspace_id,name,phone,email,address,location,notes,status,total_orders,total_spent,last_order_at,created_at,updated_at",
    )
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update customer: ${JSON.stringify(error)}`);
  }
  if (!data) return null;

  return mapCustomerRecord(data as CustomerRow);
}

async function listFollowUps(query: FollowUpsQuery = {}) {
  const client = createSupabaseServiceClient();
  const workspaceId = await resolveWorkspaceId();
  const { data, error } = await client
    .from("follow_ups")
    .select(
      "id,workspace_id,customer_id,order_id,title,notes,due_date,status,priority,created_at,updated_at",
    )
    .eq("workspace_id", workspaceId)
    .order("due_date", { ascending: true });

  if (error) {
    throw new Error(`Failed to list follow-ups: ${JSON.stringify(error)}`);
  }

  const rows = (data || []) as FollowUpRow[];
  const customerIds = rows
    .map((row) => row.customer_id)
    .filter((id): id is string => Boolean(id));
  const orderIds = rows
    .map((row) => row.order_id)
    .filter((id): id is string => Boolean(id));

  const customerMap = await getCustomerRowsByIds(customerIds);
  const orderNumberMap = new Map<string, string>();
  if (orderIds.length) {
    const { data: orderRows, error: orderError } = await client
      .from("orders")
      .select("id,order_number")
      .eq("workspace_id", workspaceId)
      .in("id", orderIds);

    if (orderError) {
      throw new Error(
        `Failed to resolve follow-up order references: ${JSON.stringify(orderError)}`,
      );
    }

    (orderRows || []).forEach((row) => {
      orderNumberMap.set(
        (row as { id: string }).id,
        (row as { order_number: string }).order_number,
      );
    });
  }

  const mapped = rows.map((row) =>
    mapFollowUpRecord(row, customerMap, orderNumberMap),
  );

  const filteredByStatus = query.status
    ? mapped.filter((item) => item.status === query.status)
    : mapped;

  const search = query.search?.trim() ?? "";
  if (!search) return filteredByStatus;

  return filteredByStatus.filter((followUp) =>
    includesText(
      [
        followUp.title,
        followUp.customerName,
        followUp.note,
        followUp.orderId || "",
      ].join(" "),
      search,
    ),
  );
}

async function createFollowUp(input: CreateFollowUpInput) {
  const client = createSupabaseServiceClient();
  const workspaceId = await resolveWorkspaceId();
  const customer = await findOrCreateCustomerByName(
    workspaceId,
    input.customerName,
    undefined,
    undefined,
  );
  const order = input.orderId?.trim()
    ? await getOrderRowByOrderNumber(workspaceId, input.orderId.trim())
    : null;

  const now = new Date().toISOString();
  const dueDate = input.dueAt;
  const status = statusFromDueDate(dueDate);

  const { data, error } = await client
    .from("follow_ups")
    .insert({
      workspace_id: workspaceId,
      customer_id: customer.id,
      order_id: order?.id || null,
      title: "Manual follow-up",
      notes: input.note.trim(),
      due_date: dueDate,
      status,
      priority: input.priority,
      created_at: now,
      updated_at: now,
    })
    .select(
      "id,workspace_id,customer_id,order_id,title,notes,due_date,status,priority,created_at,updated_at",
    )
    .single();

  const row = requireData<FollowUpRow>(
    data as FollowUpRow | null,
    error,
    "Failed to create follow-up",
  );
  return mapFollowUpRecord(
    row,
    new Map([[customer.id, customer]]),
    order ? new Map([[order.id, order.order_number]]) : new Map(),
  );
}

async function updateFollowUp(id: string, input: UpdateFollowUpInput) {
  const client = createSupabaseServiceClient();
  const workspaceId = await resolveWorkspaceId();

  const { data: currentData, error: currentError } = await client
    .from("follow_ups")
    .select(
      "id,workspace_id,customer_id,order_id,title,notes,due_date,status,priority,created_at,updated_at",
    )
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .maybeSingle();

  if (currentError) {
    throw new Error(
      `Failed to read follow-up for update: ${JSON.stringify(currentError)}`,
    );
  }
  if (!currentData) return null;
  const current = currentData as FollowUpRow;

  const dueDate = input.dueAt || current.due_date;
  const computedStatus =
    input.status ||
    (current.status === "completed" ? "completed" : statusFromDueDate(dueDate));

  const { data, error } = await client
    .from("follow_ups")
    .update({
      title: input.title?.trim() || current.title,
      notes: input.note?.trim() || current.notes,
      due_date: dueDate,
      status: computedStatus,
      priority: input.priority || current.priority,
      updated_at: new Date().toISOString(),
    })
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .select(
      "id,workspace_id,customer_id,order_id,title,notes,due_date,status,priority,created_at,updated_at",
    )
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update follow-up: ${JSON.stringify(error)}`);
  }
  if (!data) return null;

  const row = data as FollowUpRow;
  const customerMap = await getCustomerRowsByIds(
    row.customer_id ? [row.customer_id] : [],
  );
  const orderNumberMap = new Map<string, string>();
  if (row.order_id) {
    const { data: orderRow } = await client
      .from("orders")
      .select("id,order_number")
      .eq("workspace_id", workspaceId)
      .eq("id", row.order_id)
      .maybeSingle();
    if (orderRow) {
      orderNumberMap.set(
        (orderRow as { id: string }).id,
        (orderRow as { order_number: string }).order_number,
      );
    }
  }

  return mapFollowUpRecord(row, customerMap, orderNumberMap);
}

async function listOrderFollowUps(orderId: string) {
  const workspaceId = await resolveWorkspaceId();
  const order = await getOrderRowByOrderNumber(workspaceId, orderId);
  if (!order) return [];
  const followUps = await listFollowUps();
  return followUps.filter((item) => item.orderId === order.order_number);
}

async function listPayments(query: PaymentsQuery = {}) {
  const client = createSupabaseServiceClient();
  const workspaceId = await resolveWorkspaceId();

  let q = client
    .from("payments")
    .select(
      "id,workspace_id,order_id,customer_id,amount,method,status,reference,paid_at,created_at,updated_at",
    )
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (query.status) q = q.eq("status", query.status);
  if (query.method) q = q.eq("method", query.method);

  const { data, error } = await q;
  if (error) {
    throw new Error(`Failed to list payments: ${JSON.stringify(error)}`);
  }

  const rows = (data || []) as PaymentRow[];
  const customerIds = rows
    .map((row) => row.customer_id)
    .filter((id): id is string => Boolean(id));
  const orderIds = rows
    .map((row) => row.order_id)
    .filter((id): id is string => Boolean(id));

  const customerMap = await getCustomerRowsByIds(customerIds);
  const orderNumberMap = new Map<string, string>();
  if (orderIds.length) {
    const { data: orderRows, error: orderError } = await client
      .from("orders")
      .select("id,order_number")
      .eq("workspace_id", workspaceId)
      .in("id", orderIds);

    if (orderError) {
      throw new Error(
        `Failed to resolve payment order references: ${JSON.stringify(orderError)}`,
      );
    }

    (orderRows || []).forEach((row) => {
      orderNumberMap.set(
        (row as { id: string }).id,
        (row as { order_number: string }).order_number,
      );
    });
  }

  const mapped = rows.map((row) =>
    mapPaymentRecord(row, customerMap, orderNumberMap),
  );
  const search = query.search?.trim() ?? "";
  if (!search) return mapped;

  return mapped.filter((payment) =>
    includesText(
      [
        payment.orderId,
        payment.customerName,
        payment.reference,
        payment.method,
      ].join(" "),
      search,
    ),
  );
}

async function createPayment(input: CreatePaymentInput) {
  const client = createSupabaseServiceClient();
  const workspaceId = await resolveWorkspaceId();
  const now = new Date().toISOString();
  const order = await getOrderRowByOrderNumber(
    workspaceId,
    input.orderId.trim(),
  );

  const { data, error } = await client
    .from("payments")
    .insert({
      workspace_id: workspaceId,
      order_id: order?.id || null,
      customer_id: order?.customer_id || null,
      amount: input.amount,
      method: input.method,
      status: input.status,
      reference: input.reference.trim(),
      paid_at: input.status === "paid" || input.status === "cod" ? now : null,
      created_at: now,
      updated_at: now,
    })
    .select(
      "id,workspace_id,order_id,customer_id,amount,method,status,reference,paid_at,created_at,updated_at",
    )
    .single();

  const row = requireData<PaymentRow>(
    data as PaymentRow | null,
    error,
    "Failed to create payment",
  );

  if (order) {
    const { error: orderUpdateError } = await client
      .from("orders")
      .update({
        payment_status: input.status,
        payment_reference: input.reference.trim(),
        updated_at: now,
      })
      .eq("workspace_id", workspaceId)
      .eq("id", order.id);

    if (orderUpdateError) {
      throw new Error(
        `Failed to sync order payment state: ${JSON.stringify(orderUpdateError)}`,
      );
    }

    if (order.customer_id) {
      await syncCustomerAggregates(workspaceId, order.customer_id);
    }
  }

  return mapPaymentRecord(
    row,
    await getCustomerRowsByIds(row.customer_id ? [row.customer_id] : []),
    order ? new Map([[order.id, order.order_number]]) : new Map(),
  );
}

async function updatePayment(id: string, input: UpdatePaymentInput) {
  const client = createSupabaseServiceClient();
  const workspaceId = await resolveWorkspaceId();

  const { data: currentData, error: currentError } = await client
    .from("payments")
    .select(
      "id,workspace_id,order_id,customer_id,amount,method,status,reference,paid_at,created_at,updated_at",
    )
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .maybeSingle();

  if (currentError) {
    throw new Error(`Failed to fetch payment: ${JSON.stringify(currentError)}`);
  }
  if (!currentData) return null;

  const current = currentData as PaymentRow;
  const order = input.orderId?.trim()
    ? await getOrderRowByOrderNumber(workspaceId, input.orderId.trim())
    : null;

  const { data, error } = await client
    .from("payments")
    .update({
      order_id: order ? order.id : current.order_id,
      customer_id: order?.customer_id || current.customer_id,
      amount: Number.isFinite(input.amount)
        ? Number(input.amount)
        : current.amount,
      method: input.method || current.method,
      status: input.status || current.status,
      reference: input.reference?.trim() || current.reference,
      paid_at:
        (input.status || current.status) === "paid" ||
        (input.status || current.status) === "cod"
          ? new Date().toISOString()
          : null,
      updated_at: new Date().toISOString(),
    })
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .select(
      "id,workspace_id,order_id,customer_id,amount,method,status,reference,paid_at,created_at,updated_at",
    )
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update payment: ${JSON.stringify(error)}`);
  }
  if (!data) return null;

  const updated = data as PaymentRow;
  if (updated.order_id) {
    const { error: syncError } = await client
      .from("orders")
      .update({
        payment_status: updated.status,
        payment_reference: updated.reference,
        updated_at: new Date().toISOString(),
      })
      .eq("workspace_id", workspaceId)
      .eq("id", updated.order_id);

    if (syncError) {
      throw new Error(
        `Failed to sync order from payment: ${JSON.stringify(syncError)}`,
      );
    }
  }

  const orderNumberMap = new Map<string, string>();
  if (updated.order_id) {
    const { data: orderRow } = await client
      .from("orders")
      .select("id,order_number")
      .eq("workspace_id", workspaceId)
      .eq("id", updated.order_id)
      .maybeSingle();
    if (orderRow) {
      orderNumberMap.set(
        (orderRow as { id: string }).id,
        (orderRow as { order_number: string }).order_number,
      );
    }
  }

  return mapPaymentRecord(
    updated,
    await getCustomerRowsByIds(
      updated.customer_id ? [updated.customer_id] : [],
    ),
    orderNumberMap,
  );
}

async function listOrderPayments(orderId: string) {
  const workspaceId = await resolveWorkspaceId();
  const order = await getOrderRowByOrderNumber(workspaceId, orderId);
  if (!order) return [];
  const records = await listPayments();
  return records.filter((payment) => payment.orderId === order.order_number);
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
    series: computeAnalyticsSeries(orders, payments),
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

export function createSupabaseRepository(): WhatsboardRepository {
  // Production currently uses a legacy Supabase schema with business_id-based
  // tables. Use the compatibility repository to keep dashboard flows working.
  return createSupabaseLegacyRepository();
}

export { isSupabaseServerConfigured };
