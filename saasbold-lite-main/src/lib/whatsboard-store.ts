import fs from "node:fs";
import path from "node:path";
import type {
  CustomerRecord,
  FollowUpRecord,
  OrderRecord,
  PaymentRecord,
} from "@/data/whatsboard";
import { customers, followUps, orders, payments } from "@/data/whatsboard";

export type StoreState = {
  orders: OrderRecord[];
  customers: CustomerRecord[];
  followUps: FollowUpRecord[];
  payments: PaymentRecord[];
};

export type CreateOrderInput = {
  customerName: string;
  customerPhone?: string;
  channel: OrderRecord["channel"];
  stage: OrderRecord["stage"];
  paymentStatus: OrderRecord["paymentStatus"];
  amount: number;
  deliveryArea: string;
  notes: string;
  items: string[];
};

export type UpdateOrderInput = {
  customerName: string;
  stage: OrderRecord["stage"];
  paymentStatus: OrderRecord["paymentStatus"];
  amount: number;
  notes: string;
};

export type CreateCustomerInput = {
  name: string;
  phone: string;
  location: string;
  status: CustomerRecord["status"];
};

export type UpdateCustomerInput = Partial<CreateCustomerInput>;

export type CreateFollowUpInput = {
  customerName: string;
  orderId?: string;
  dueAt: string;
  priority: FollowUpRecord["priority"];
  note: string;
};

export type UpdateFollowUpInput = {
  title?: string;
  note?: string;
  dueAt?: string;
  status?: FollowUpRecord["status"];
  priority?: FollowUpRecord["priority"];
};

export type CreatePaymentInput = {
  orderId: string;
  amount: number;
  method: PaymentRecord["method"];
  status: PaymentRecord["status"];
  reference: string;
};

export type UpdatePaymentInput = Partial<CreatePaymentInput>;

export const DEFAULT_STORE_FILE = path.join("/tmp", "whatsboard-store.json");

function storeFilePath() {
  return process.env.WHATSBOARD_STORE_PATH || DEFAULT_STORE_FILE;
}

function cloneSeedState(): StoreState {
  return {
    orders: JSON.parse(JSON.stringify(orders)),
    customers: JSON.parse(JSON.stringify(customers)),
    followUps: JSON.parse(JSON.stringify(followUps)),
    payments: JSON.parse(JSON.stringify(payments)),
  };
}

export function ensureStore(): StoreState {
  const file = storeFilePath();
  try {
    if (!fs.existsSync(file)) {
      const initial = cloneSeedState();
      fs.writeFileSync(file, JSON.stringify(initial, null, 2), "utf8");
      return initial;
    }

    const raw = fs.readFileSync(file, "utf8");
    const parsed = JSON.parse(raw) as Partial<StoreState>;
    return {
      orders: parsed.orders ?? [],
      customers: parsed.customers ?? [],
      followUps: parsed.followUps ?? [],
      payments: parsed.payments ?? [],
    };
  } catch {
    return cloneSeedState();
  }
}

export function persistStore(state: StoreState) {
  const file = storeFilePath();
  try {
    fs.writeFileSync(file, JSON.stringify(state, null, 2), "utf8");
  } catch {
    // Keep runtime-safe behavior in restricted environments.
  }
}

function formatId(prefix: string, sequence: number) {
  return `${prefix}-${String(sequence).padStart(4, "0")}`;
}

function nextOrderId(list: OrderRecord[]) {
  const max = list.reduce((highest, order) => {
    const value = Number(order.id.replace("WB-", ""));
    return Number.isFinite(value) ? Math.max(highest, value) : highest;
  }, 3400);
  return `WB-${max + 1}`;
}

function nextCustomerId(list: CustomerRecord[]) {
  const max = list.reduce((highest, customer) => {
    const value = Number(customer.id.replace("cust-", ""));
    return Number.isFinite(value) ? Math.max(highest, value) : highest;
  }, 0);
  return `cust-${max + 1}`;
}

function nextFollowUpId(list: FollowUpRecord[]) {
  const max = list.reduce((highest, item) => {
    const value = Number(item.id.replace("fu-", ""));
    return Number.isFinite(value) ? Math.max(highest, value) : highest;
  }, 0);
  return `fu-${max + 1}`;
}

function nextPaymentId(list: PaymentRecord[]) {
  const max = list.reduce((highest, item) => {
    const value = Number(item.id.replace("pay-", ""));
    return Number.isFinite(value) ? Math.max(highest, value) : highest;
  }, 0);
  return `pay-${max + 1}`;
}

export function statusFromDueDate(dueAt: string): FollowUpRecord["status"] {
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

export function recalculateCustomers(state: StoreState) {
  const ordersByCustomer = new Map<string, OrderRecord[]>();

  state.orders.forEach((order) => {
    const current = ordersByCustomer.get(order.customerId) ?? [];
    current.push(order);
    ordersByCustomer.set(order.customerId, current);
  });

  state.customers = state.customers.map((customer) => {
    const list = ordersByCustomer.get(customer.id) ?? [];
    const totalOrders = list.length;
    const totalSpend = list.reduce((sum, order) => sum + order.amount, 0);
    const lastOrderAt = list.length
      ? list.reduce(
          (latest, item) => (item.updatedAt > latest ? item.updatedAt : latest),
          list[0].updatedAt,
        )
      : customer.lastOrderAt;
    return {
      ...customer,
      totalOrders,
      totalSpend,
      lastOrderAt,
    };
  });
}

export function getStoreState() {
  return ensureStore();
}

export function createOrder(input: CreateOrderInput) {
  const state = ensureStore();
  const now = new Date().toISOString();
  const normalizedName = input.customerName.trim().toLowerCase();

  let customer = state.customers.find(
    (item) => item.name.trim().toLowerCase() === normalizedName,
  );
  if (!customer) {
    customer = {
      id: nextCustomerId(state.customers),
      name: input.customerName.trim(),
      phone: input.customerPhone?.trim() || "Not provided",
      location: input.deliveryArea.trim(),
      totalOrders: 0,
      totalSpend: 0,
      lastOrderAt: now,
      status: "active",
    };
    state.customers.push(customer);
  }

  const record: OrderRecord = {
    id: nextOrderId(state.orders),
    customerId: customer.id,
    customerName: customer.name,
    channel: input.channel,
    stage: input.stage,
    paymentStatus: input.paymentStatus,
    amount: input.amount,
    deliveryArea: input.deliveryArea.trim(),
    createdAt: now,
    updatedAt: now,
    notes: input.notes.trim() || "No note",
    items: input.items.length ? input.items : ["Unspecified item"],
  };

  state.orders.push(record);
  recalculateCustomers(state);
  persistStore(state);
  return record;
}

export function updateOrder(id: string, input: UpdateOrderInput) {
  const state = ensureStore();
  const index = state.orders.findIndex((order) => order.id === id);
  if (index < 0) return null;

  const current = state.orders[index];
  const updated: OrderRecord = {
    ...current,
    customerName: input.customerName.trim() || current.customerName,
    stage: input.stage,
    paymentStatus: input.paymentStatus,
    amount: input.amount,
    notes: input.notes.trim() || current.notes,
    updatedAt: new Date().toISOString(),
  };

  state.orders[index] = updated;
  recalculateCustomers(state);
  persistStore(state);
  return updated;
}

export function createCustomer(input: CreateCustomerInput) {
  const state = ensureStore();
  const now = new Date().toISOString();
  const customer: CustomerRecord = {
    id: nextCustomerId(state.customers),
    name: input.name.trim(),
    phone: input.phone.trim(),
    location: input.location.trim(),
    totalOrders: 0,
    totalSpend: 0,
    lastOrderAt: now,
    status: input.status,
  };
  state.customers.push(customer);
  persistStore(state);
  return customer;
}

export function updateCustomer(id: string, input: UpdateCustomerInput) {
  const state = ensureStore();
  const index = state.customers.findIndex((customer) => customer.id === id);
  if (index < 0) return null;

  const current = state.customers[index];
  const nextName = input.name?.trim() || current.name;
  const updated: CustomerRecord = {
    ...current,
    name: nextName,
    phone: input.phone?.trim() || current.phone,
    location: input.location?.trim() || current.location,
    status: input.status || current.status,
    lastOrderAt: current.lastOrderAt,
  };

  state.customers[index] = updated;

  state.orders = state.orders.map((order) =>
    order.customerId === id ? { ...order, customerName: nextName } : order,
  );
  state.followUps = state.followUps.map((item) =>
    item.customerId === id ? { ...item, customerName: nextName } : item,
  );
  state.payments = state.payments.map((payment) =>
    payment.customerName === current.name
      ? { ...payment, customerName: nextName }
      : payment,
  );

  recalculateCustomers(state);
  persistStore(state);
  return updated;
}

export function createFollowUp(input: CreateFollowUpInput) {
  const state = ensureStore();
  const customer =
    state.customers.find(
      (item) =>
        item.name.trim().toLowerCase() ===
        input.customerName.trim().toLowerCase(),
    ) ?? null;

  const followUp: FollowUpRecord = {
    id: nextFollowUpId(state.followUps),
    customerId: customer?.id || formatId("cust", state.customers.length + 1),
    customerName: input.customerName.trim(),
    orderId: input.orderId?.trim() || undefined,
    title: "Manual follow-up",
    note: input.note.trim(),
    dueAt: input.dueAt,
    status: statusFromDueDate(input.dueAt),
    priority: input.priority,
  };

  state.followUps.push(followUp);
  persistStore(state);
  return followUp;
}

export function updateFollowUp(id: string, input: UpdateFollowUpInput) {
  const state = ensureStore();
  const index = state.followUps.findIndex((item) => item.id === id);
  if (index < 0) return null;

  const current = state.followUps[index];
  const nextDueAt = input.dueAt || current.dueAt;
  const updated: FollowUpRecord = {
    ...current,
    title: input.title?.trim() || current.title,
    note: input.note?.trim() || current.note,
    dueAt: nextDueAt,
    status: input.status || statusFromDueDate(nextDueAt),
    priority: input.priority || current.priority,
  };

  state.followUps[index] = updated;
  persistStore(state);
  return updated;
}

export function createPayment(input: CreatePaymentInput) {
  const state = ensureStore();
  const order = state.orders.find((item) => item.id === input.orderId);
  const payment: PaymentRecord = {
    id: nextPaymentId(state.payments),
    orderId: input.orderId.trim(),
    customerName: order?.customerName || "Unknown customer",
    amount: input.amount,
    status: input.status,
    method: input.method,
    reference: input.reference.trim(),
    createdAt: new Date().toISOString(),
  };

  state.payments.push(payment);

  if (order) {
    order.paymentStatus = input.status;
    order.paymentReference = input.reference.trim();
    order.updatedAt = new Date().toISOString();
  }

  recalculateCustomers(state);
  persistStore(state);
  return payment;
}

export function updatePayment(id: string, input: UpdatePaymentInput) {
  const state = ensureStore();
  const index = state.payments.findIndex((item) => item.id === id);
  if (index < 0) return null;

  const current = state.payments[index];
  const nextOrderId = input.orderId?.trim() || current.orderId;
  const updated: PaymentRecord = {
    ...current,
    orderId: nextOrderId,
    amount: Number.isFinite(input.amount)
      ? Number(input.amount)
      : current.amount,
    method: input.method || current.method,
    status: input.status || current.status,
    reference: input.reference?.trim() || current.reference,
  };

  state.payments[index] = updated;

  const order = state.orders.find((item) => item.id === updated.orderId);
  if (order) {
    order.paymentStatus = updated.status;
    order.paymentReference = updated.reference;
    order.updatedAt = new Date().toISOString();
  }

  recalculateCustomers(state);
  persistStore(state);
  return updated;
}
