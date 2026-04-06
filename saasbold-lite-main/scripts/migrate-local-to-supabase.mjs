#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function localStorePath() {
  return process.env.WHATSBOARD_STORE_PATH || "/tmp/whatsboard-store.json";
}

function readLocalState() {
  const file = localStorePath();
  if (!fs.existsSync(file)) {
    throw new Error(
      `Local store file not found at ${file}. Set WHATSBOARD_STORE_PATH to your exported local data JSON.`,
    );
  }

  const raw = fs.readFileSync(file, "utf8");
  const parsed = JSON.parse(raw);
  return {
    orders: parsed.orders || [],
    customers: parsed.customers || [],
    followUps: parsed.followUps || [],
    payments: parsed.payments || [],
  };
}

async function ensureWorkspace(client) {
  const preferredWorkspaceId = process.env.WHATSBOARD_DEFAULT_WORKSPACE_ID;
  const preferredWorkspaceName =
    process.env.WHATSBOARD_DEFAULT_WORKSPACE_NAME || "Folapp Workspace";

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
      .select("id")
      .single();

    if (error) throw error;
    return data.id;
  }

  const { data: existingRows, error: existingError } = await client
    .from("workspaces")
    .select("id")
    .eq("name", preferredWorkspaceName)
    .limit(1);

  if (existingError) throw existingError;
  if (existingRows?.length) return existingRows[0].id;

  const { data, error } = await client
    .from("workspaces")
    .insert({ name: preferredWorkspaceName })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

function statusFromDueDate(dueAt) {
  const now = new Date();
  const due = new Date(dueAt);
  const nowStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const dueStart = new Date(
    due.getFullYear(),
    due.getMonth(),
    due.getDate(),
  ).getTime();
  if (dueStart < nowStart) return "overdue";
  if (dueStart === nowStart) return "today";
  return "upcoming";
}

function asPaymentStatus(status) {
  return ["unpaid", "partial", "paid", "cod"].includes(status)
    ? status
    : "unpaid";
}

function asOrderStatus(status) {
  return [
    "new_order",
    "waiting_payment",
    "paid",
    "packing",
    "dispatched",
    "delivered",
  ].includes(status)
    ? status
    : "new_order";
}

function asChannel(source) {
  return ["WhatsApp", "Instagram", "TikTok", "Facebook"].includes(source)
    ? source
    : "WhatsApp";
}

function asPriority(priority) {
  return ["high", "medium", "low"].includes(priority) ? priority : "medium";
}

async function upsertCustomers(client, workspaceId, state) {
  const customerIdMap = new Map();
  for (const customer of state.customers) {
    const payload = {
      workspace_id: workspaceId,
      legacy_id: customer.id,
      name: customer.name || "Unknown customer",
      phone: customer.phone || "Not provided",
      location: customer.location || "Not specified",
      address: customer.location || "Not specified",
      status: ["active", "waiting", "vip"].includes(customer.status)
        ? customer.status
        : "active",
      total_orders: Number(customer.totalOrders || 0),
      total_spent: Number(customer.totalSpend || 0),
      last_order_at: customer.lastOrderAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await client
      .from("customers")
      .upsert(payload, { onConflict: "workspace_id,legacy_id" })
      .select("id")
      .single();

    if (error) {
      throw new Error(
        `Failed to upsert customer ${customer.id}: ${JSON.stringify(error)}`,
      );
    }

    customerIdMap.set(customer.id, data.id);
  }

  return customerIdMap;
}

async function upsertOrders(client, workspaceId, state, customerIdMap) {
  const orderInternalIdMap = new Map();

  for (const order of state.orders) {
    const payload = {
      workspace_id: workspaceId,
      customer_id: customerIdMap.get(order.customerId) || null,
      order_number: order.id,
      status: asOrderStatus(order.stage),
      payment_status: asPaymentStatus(order.paymentStatus),
      subtotal: Number(order.amount || 0),
      total: Number(order.amount || 0),
      currency: "TZS",
      notes: order.notes || "No note",
      source: asChannel(order.channel),
      delivery_area: order.deliveryArea || "Not specified",
      due_follow_up_at: order.dueFollowUpAt || null,
      dispatch_eta: order.dispatchEta || null,
      payment_reference: order.paymentReference || null,
      created_at: order.createdAt || new Date().toISOString(),
      updated_at: order.updatedAt || new Date().toISOString(),
    };

    const { data, error } = await client
      .from("orders")
      .upsert(payload, { onConflict: "workspace_id,order_number" })
      .select("id,order_number")
      .single();

    if (error) {
      throw new Error(
        `Failed to upsert order ${order.id}: ${JSON.stringify(error)}`,
      );
    }

    orderInternalIdMap.set(order.id, data.id);

    const { error: deleteItemsError } = await client
      .from("order_items")
      .delete()
      .eq("order_id", data.id);

    if (deleteItemsError) {
      throw new Error(
        `Failed to clear order items for ${order.id}: ${JSON.stringify(deleteItemsError)}`,
      );
    }

    const items = (
      order.items?.length ? order.items : ["Unspecified item"]
    ).map((item) => ({
      order_id: data.id,
      product_name: item,
      quantity: 1,
      unit_price: Number(order.amount || 0),
      total_price: Number(order.amount || 0),
    }));

    const { error: insertItemsError } = await client
      .from("order_items")
      .insert(items);

    if (insertItemsError) {
      throw new Error(
        `Failed to insert order items for ${order.id}: ${JSON.stringify(insertItemsError)}`,
      );
    }
  }

  return orderInternalIdMap;
}

async function upsertFollowUps(
  client,
  workspaceId,
  state,
  customerIdMap,
  orderInternalIdMap,
) {
  for (const followUp of state.followUps) {
    const payload = {
      workspace_id: workspaceId,
      legacy_id: followUp.id,
      customer_id: customerIdMap.get(followUp.customerId) || null,
      order_id: followUp.orderId
        ? orderInternalIdMap.get(followUp.orderId) || null
        : null,
      title: followUp.title || "Manual follow-up",
      notes: followUp.note || "",
      due_date: followUp.dueAt,
      status:
        followUp.status === "completed"
          ? "completed"
          : statusFromDueDate(followUp.dueAt),
      priority: asPriority(followUp.priority),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await client
      .from("follow_ups")
      .upsert(payload, { onConflict: "workspace_id,legacy_id" });

    if (error) {
      throw new Error(
        `Failed to upsert follow-up ${followUp.id}: ${JSON.stringify(error)}`,
      );
    }
  }
}

async function upsertPayments(
  client,
  workspaceId,
  state,
  orderInternalIdMap,
  customerIdMap,
) {
  for (const payment of state.payments) {
    const matchingOrder = state.orders.find(
      (order) => order.id === payment.orderId,
    );
    const payload = {
      workspace_id: workspaceId,
      legacy_id: payment.id,
      order_id: orderInternalIdMap.get(payment.orderId) || null,
      customer_id:
        (matchingOrder ? customerIdMap.get(matchingOrder.customerId) : null) ||
        null,
      amount: Number(payment.amount || 0),
      method: ["M-Pesa", "Bank", "Cash"].includes(payment.method)
        ? payment.method
        : "Cash",
      status: asPaymentStatus(payment.status),
      reference: payment.reference || null,
      paid_at:
        payment.status === "paid" || payment.status === "cod"
          ? payment.createdAt || new Date().toISOString()
          : null,
      created_at: payment.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await client
      .from("payments")
      .upsert(payload, { onConflict: "workspace_id,legacy_id" });

    if (error) {
      throw new Error(
        `Failed to upsert payment ${payment.id}: ${JSON.stringify(error)}`,
      );
    }
  }
}

async function validateMigration(client, workspaceId, state) {
  const [
    { count: customersCount, error: customersCountError },
    { count: ordersCount, error: ordersCountError },
    { count: followUpsCount, error: followUpsCountError },
    { count: paymentsCount, error: paymentsCountError },
    { count: orderItemsCount, error: orderItemsCountError },
  ] = await Promise.all([
    client
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspaceId),
    client
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspaceId),
    client
      .from("follow_ups")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspaceId),
    client
      .from("payments")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspaceId),
    client.from("order_items").select("*", { count: "exact", head: true }),
  ]);

  if (
    customersCountError ||
    ordersCountError ||
    followUpsCountError ||
    paymentsCountError ||
    orderItemsCountError
  ) {
    throw new Error("Failed to validate migration counts.");
  }

  const expectedOrderItems = state.orders.reduce(
    (sum, order) => sum + (order.items?.length || 1),
    0,
  );

  const validations = [
    {
      name: "customers",
      expected: state.customers.length,
      actual: customersCount || 0,
    },
    {
      name: "orders",
      expected: state.orders.length,
      actual: ordersCount || 0,
    },
    {
      name: "followUps",
      expected: state.followUps.length,
      actual: followUpsCount || 0,
    },
    {
      name: "payments",
      expected: state.payments.length,
      actual: paymentsCount || 0,
    },
    {
      name: "orderItems",
      expected: expectedOrderItems,
      actual: orderItemsCount || 0,
    },
  ];

  const mismatches = validations.filter((item) => item.actual < item.expected);
  if (mismatches.length) {
    throw new Error(
      `Count mismatch after migration: ${JSON.stringify(mismatches)}`,
    );
  }

  const { count: orphanOrders, error: orphanOrdersError } = await client
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .is("customer_id", null);

  if (orphanOrdersError) {
    throw new Error("Failed to validate orphan orders.");
  }

  const { count: orphanFollowUps, error: orphanFollowUpsError } = await client
    .from("follow_ups")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .is("customer_id", null);

  if (orphanFollowUpsError) {
    throw new Error("Failed to validate orphan follow-ups.");
  }

  return {
    validations,
    orphanOrders: orphanOrders || 0,
    orphanFollowUps: orphanFollowUps || 0,
  };
}

async function main() {
  const supabaseUrl = required("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = required("SUPABASE_SERVICE_ROLE_KEY");
  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const state = readLocalState();
  const workspaceId = await ensureWorkspace(client);

  const customerIdMap = await upsertCustomers(client, workspaceId, state);
  const orderInternalIdMap = await upsertOrders(
    client,
    workspaceId,
    state,
    customerIdMap,
  );
  await upsertFollowUps(
    client,
    workspaceId,
    state,
    customerIdMap,
    orderInternalIdMap,
  );
  await upsertPayments(
    client,
    workspaceId,
    state,
    orderInternalIdMap,
    customerIdMap,
  );

  const validation = await validateMigration(client, workspaceId, state);

  console.log("Migration completed.");
  console.table(validation.validations);
  console.log(`Workspace: ${workspaceId}`);
  console.log(`Orphan orders: ${validation.orphanOrders}`);
  console.log(`Orphan follow-ups: ${validation.orphanFollowUps}`);
}

main().catch((error) => {
  console.error("Migration failed.");
  console.error(error);
  process.exit(1);
});
