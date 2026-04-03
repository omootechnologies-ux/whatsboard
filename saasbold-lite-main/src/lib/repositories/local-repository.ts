import type {
  CustomerProfileRecord,
  FollowUpRecord,
  PaymentReconciliationStatus,
  SourceChannel,
} from "@/data/whatsboard";
import {
  createCustomer as createCustomerInStore,
  createFollowUp as createFollowUpInStore,
  createOrder as createOrderInStore,
  createPayment as createPaymentInStore,
  getStoreState,
  updateCustomer as updateCustomerInStore,
  updateFollowUp as updateFollowUpInStore,
  updateOrder as updateOrderInStore,
  updatePayment as updatePaymentInStore,
} from "@/lib/whatsboard-store";
import { statusFromDueDate } from "@/lib/follow-up-status";
import {
  calculateAverageOrderValue,
  calculateDaysSince,
  calculateRepeatPurchaseRate,
  resolveBuyerStatus,
} from "@/lib/customer-insights";
import { parsePaymentSms } from "@/lib/payments/sms-parser";
import {
  matchBandFromConfidence,
  providerToPaymentMethod,
  rankPaymentMatches,
} from "@/lib/payments/reconciliation";
import { formatOrderReference } from "@/lib/display-labels";
import type {
  AssignPaymentInput,
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

function includesText(value: string, search: string) {
  return value.toLowerCase().includes(search.toLowerCase());
}

function resolveSourceChannel(value?: string | null): SourceChannel {
  if (value === "WhatsApp" || value === "Instagram" || value === "Facebook" || value === "TikTok") {
    return value;
  }
  return "Unknown";
}

function computeFollowUpStatus(
  record: FollowUpRecord,
): FollowUpRecord["status"] {
  if (record.status === "completed") return "completed";
  return statusFromDueDate(record.dueAt);
}

function computeDashboardStats(): DashboardStats {
  const state = getStoreState();
  const activeOrders = state.orders.filter(
    (order) => order.stage !== "delivered",
  ).length;
  const overdueFollowUps = state.followUps.filter(
    (followUp) => computeFollowUpStatus(followUp) === "overdue",
  ).length;
  const revenueMonth = state.payments
    .filter((payment) => payment.status === "paid" || payment.status === "cod")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const payoutPending = state.orders
    .filter(
      (order) =>
        order.paymentStatus === "unpaid" || order.paymentStatus === "partial",
    )
    .reduce((sum, order) => sum + order.amount, 0);
  const delivered = state.orders.filter(
    (order) => order.stage === "delivered",
  ).length;
  const conversionRate = state.orders.length
    ? Math.round((delivered / state.orders.length) * 100)
    : 0;
  const customersThisMonth = state.customers.length;

  return {
    revenueMonth,
    activeOrders,
    overdueFollowUps,
    customersThisMonth,
    conversionRate,
    payoutPending,
  };
}

function computeAnalyticsSeries() {
  const state = getStoreState();
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const buckets = labels.map((label) => ({ label, revenue: 0, orders: 0 }));

  state.orders.forEach((order) => {
    const day = new Date(order.createdAt).getDay();
    const mapped = day === 0 ? 6 : day - 1;
    buckets[mapped].orders += 1;
  });

  state.payments.forEach((payment) => {
    const day = new Date(payment.createdAt).getDay();
    const mapped = day === 0 ? 6 : day - 1;
    if (payment.status === "paid" || payment.status === "cod") {
      buckets[mapped].revenue += payment.amount;
    }
  });

  return buckets;
}

async function listOrders(query: OrdersQuery = {}) {
  const state = getStoreState();
  const search = query.search?.trim() ?? "";
  const orderStatsByCustomer = new Map<
    string,
    { totalOrders: number; totalSpend: number }
  >();
  state.orders.forEach((order) => {
    const current = orderStatsByCustomer.get(order.customerId) || {
      totalOrders: 0,
      totalSpend: 0,
    };
    current.totalOrders += 1;
    current.totalSpend += order.amount;
    orderStatsByCustomer.set(order.customerId, current);
  });

  return state.orders
    .map((order) => {
      const stats = orderStatsByCustomer.get(order.customerId) || {
        totalOrders: 0,
        totalSpend: 0,
      };
      return {
        ...order,
        customerTotalOrders: stats.totalOrders,
        customerLifetimeValue: stats.totalSpend,
        customerBuyerStatus: (stats.totalOrders > 1 ? "repeat" : "new") as
          | "repeat"
          | "new",
      };
    })
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
    })
    .sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1));
}

async function getOrderById(id: string) {
  const state = getStoreState();
  return state.orders.find((order) => order.id === id) || null;
}

async function createOrder(input: CreateOrderInput) {
  return createOrderInStore(input);
}

async function updateOrder(id: string, input: UpdateOrderInput) {
  return updateOrderInStore(id, input);
}

async function listCustomers(query: CustomersQuery = {}) {
  const state = getStoreState();
  const search = query.search?.trim() ?? "";
  const now = new Date();
  const followUpsByCustomer = new Map<string, string>();

  state.followUps
    .filter((item) => computeFollowUpStatus(item) !== "completed")
    .forEach((item) => {
      const existing = followUpsByCustomer.get(item.customerId);
      if (!existing || existing > item.dueAt) {
        followUpsByCustomer.set(item.customerId, item.dueAt);
      }
    });

  const records = state.customers
    .map((customer) => {
      const totalOrders = customer.totalOrders || 0;
      const totalSpend = customer.totalSpend || 0;
      const lastOrderAt = customer.lastOrderAt || customer.createdAt || new Date().toISOString();
      const daysSinceLastOrder = calculateDaysSince(lastOrderAt, now);
      const buyerStatus = resolveBuyerStatus({
        totalOrders,
        createdAt: customer.createdAt || customer.lastOrderAt,
        lastOrderAt,
        now,
      });
      return {
        ...customer,
        sourceChannel: resolveSourceChannel(customer.sourceChannel),
        whatsappNumber: customer.whatsappNumber || customer.phone,
        averageOrderValue: calculateAverageOrderValue(totalSpend, totalOrders),
        daysSinceLastOrder,
        repeatPurchaseRate: calculateRepeatPurchaseRate(totalOrders),
        buyerStatus,
        isRepeatBuyer: totalOrders > 1,
      };
    })
    .filter((customer) => {
      if (query.status && query.status !== "all") {
        if (query.status === "new") return customer.buyerStatus === "new";
        if (query.status === "repeat") return customer.buyerStatus === "repeat";
        if (query.status === "at_risk") return customer.buyerStatus === "at_risk";
        if (query.status === "lost") return customer.buyerStatus === "lost";
        return customer.status === query.status;
      }
      return true;
    })
    .filter((customer) =>
      query.buyerStatus ? customer.buyerStatus === query.buyerStatus : true,
    )
    .filter((customer) => {
      if (!query.sourceChannel || query.sourceChannel === "all") return true;
      return customer.sourceChannel === query.sourceChannel;
    })
    .filter((customer) => {
      if (!search) return true;
      const haystack = [
        customer.name,
        customer.phone,
        customer.whatsappNumber || "",
        customer.location,
        customer.sourceChannel || "",
        customer.notes || "",
      ].join(" ");
      return includesText(haystack, search);
    })
    .map((customer) => ({
      ...customer,
      nextFollowUpAt:
        followUpsByCustomer.get(customer.id) || customer.nextFollowUpAt,
    }));

  const sortBy = query.sort || "last_order";
  return records.sort((a, b) => {
    if (sortBy === "ltv") return b.totalSpend - a.totalSpend;
    if (sortBy === "total_orders") return b.totalOrders - a.totalOrders;
    if (sortBy === "days_since_last_order")
      return (b.daysSinceLastOrder || 0) - (a.daysSinceLastOrder || 0);
    return a.lastOrderAt > b.lastOrderAt ? -1 : 1;
  });
}

async function getCustomerById(id: string) {
  const records = await listCustomers();
  return records.find((customer) => customer.id === id) || null;
}

async function getCustomerProfileById(id: string): Promise<CustomerProfileRecord | null> {
  const [customer, orders] = await Promise.all([getCustomerById(id), listOrders()]);
  if (!customer) return null;

  const orderHistory = orders
    .filter((order) => order.customerId === id)
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
    .map((order) => ({
      id: order.id,
      orderReference: formatOrderReference(order.id) || "WB-00000",
      date: order.createdAt,
      items: order.items,
      amount: order.amount,
      status: order.stage,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod || null,
    }));

  const lastOrderDate = orderHistory[0]?.date || customer.lastOrderAt;
  return {
    customer,
    orderHistory,
    totalLifetimeValue: customer.totalSpend,
    averageOrderValue: customer.averageOrderValue || 0,
    repeatPurchaseRate: customer.repeatPurchaseRate || 0,
    daysSinceLastOrder: customer.daysSinceLastOrder || 0,
    lastOrderDate,
    lastBoughtProduct: orderHistory[0]?.items?.[0] || undefined,
  };
}

async function createCustomer(input: CreateCustomerInput) {
  return createCustomerInStore(input);
}

async function updateCustomer(id: string, input: UpdateCustomerInput) {
  return updateCustomerInStore(id, input);
}

async function listFollowUps(query: FollowUpsQuery = {}) {
  const state = getStoreState();
  const search = query.search?.trim() ?? "";
  return state.followUps
    .map((item) => ({ ...item, status: computeFollowUpStatus(item) }))
    .filter((followUp) =>
      query.status ? followUp.status === query.status : true,
    )
    .filter((followUp) => {
      if (!search) return true;
      const haystack = [
        followUp.title,
        followUp.customerName,
        followUp.note,
        followUp.orderId || "",
      ].join(" ");
      return includesText(haystack, search);
    })
    .sort((a, b) => (a.dueAt > b.dueAt ? 1 : -1));
}

async function createFollowUp(input: CreateFollowUpInput) {
  return createFollowUpInStore(input);
}

async function updateFollowUp(id: string, input: UpdateFollowUpInput) {
  return updateFollowUpInStore(id, input);
}

async function listOrderFollowUps(orderId: string) {
  const state = getStoreState();
  return state.followUps
    .filter((item) => item.orderId === orderId)
    .map((item) => ({ ...item, status: computeFollowUpStatus(item) }))
    .sort((a, b) => (a.dueAt > b.dueAt ? 1 : -1));
}

async function listPayments(query: PaymentsQuery = {}) {
  const state = getStoreState();
  const search = query.search?.trim() ?? "";
  return state.payments
    .filter((payment) =>
      query.status ? payment.status === query.status : true,
    )
    .filter((payment) =>
      query.method ? payment.method === query.method : true,
    )
    .filter((payment) => {
      if (!search) return true;
      const haystack = [
        payment.orderId || "",
        payment.suggestedOrderId || "",
        payment.customerName,
        payment.senderName || "",
        payment.senderPhone || "",
        payment.reference,
        payment.method,
      ].join(" ");
      return includesText(haystack, search);
    })
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
}

async function createPayment(input: CreatePaymentInput) {
  return createPaymentInStore({
    ...input,
    reconciliationStatus: "matched",
    provider: "manual",
    matchedAt: new Date().toISOString(),
  });
}

async function updatePayment(id: string, input: UpdatePaymentInput) {
  return updatePaymentInStore(id, input);
}

async function listOrderPayments(orderId: string) {
  const state = getStoreState();
  return state.payments
    .filter((item) => item.orderId === orderId)
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
}

async function listUnmatchedPayments() {
  const records = await listPayments();
  return records.filter(
    (payment) =>
      payment.reconciliationStatus === "pending" ||
      payment.reconciliationStatus === "unmatched" ||
      !payment.orderId,
  );
}

async function reconcilePaymentSms(
  input: ReconcileSmsInput,
): Promise<ReconcileSmsResult> {
  const parsed = parsePaymentSms(input.rawSms);
  const orders = await listOrders();
  const openOrders = orders.filter(
    (order) =>
      order.paymentStatus === "unpaid" || order.paymentStatus === "partial",
  );
  const ranked = rankPaymentMatches(
    parsed,
    openOrders.map((order) => ({
      orderId: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      amount: order.amount,
    })),
  );

  const best = ranked[0];
  const bestOrder = best
    ? openOrders.find((order) => order.id === best.orderId) || null
    : null;
  const confidence = best?.confidence || 0;
  const band = matchBandFromConfidence(confidence);
  const now = new Date().toISOString();
  const amount = parsed.amount ?? 0;
  const method = providerToPaymentMethod(parsed.provider);
  const reference = parsed.reference || `SMS-${Date.now()}`;
  const provider =
    parsed.provider === "unknown" ? ("unknown" as const) : parsed.provider;

  let status: PaymentReconciliationStatus = "unmatched";
  let autoMatched = false;
  let created;

  if (bestOrder && band === "high") {
    status = "matched";
    autoMatched = true;
    created = await createPaymentInStore({
      orderId: bestOrder.id,
      customerId: bestOrder.customerId,
      customerName: bestOrder.customerName,
      amount,
      method,
      status: "paid",
      reference,
      provider,
      senderName: parsed.senderName,
      senderPhone: parsed.senderPhone,
      rawSms: parsed.rawSms,
      matchConfidence: confidence,
      reconciliationStatus: "matched",
      suggestedOrderId: null,
      matchedAt: now,
    });
  } else if (bestOrder && band === "medium") {
    status = "pending";
    created = await createPaymentInStore({
      orderId: null,
      customerId: null,
      customerName: parsed.senderName || "Unassigned payment",
      amount,
      method,
      status: "unpaid",
      reference,
      provider,
      senderName: parsed.senderName,
      senderPhone: parsed.senderPhone,
      rawSms: parsed.rawSms,
      matchConfidence: confidence,
      reconciliationStatus: "pending",
      suggestedOrderId: bestOrder.id,
      matchedAt: null,
    });
  } else {
    status = "unmatched";
    created = await createPaymentInStore({
      orderId: null,
      customerId: null,
      customerName: parsed.senderName || "Unassigned payment",
      amount,
      method,
      status: "unpaid",
      reference,
      provider,
      senderName: parsed.senderName,
      senderPhone: parsed.senderPhone,
      rawSms: parsed.rawSms,
      matchConfidence: confidence || null,
      reconciliationStatus: "unmatched",
      suggestedOrderId: null,
      matchedAt: null,
    });
  }

  return {
    payment: created,
    parsed,
    status,
    autoMatched,
    suggestion:
      bestOrder && best
        ? {
            orderId: bestOrder.id,
            customerName: bestOrder.customerName,
            amount: bestOrder.amount,
            confidence: best.confidence,
            amountDelta: best.amountDelta,
          }
        : null,
  };
}

async function assignPaymentToOrder(input: AssignPaymentInput) {
  const [payments, orders] = await Promise.all([listPayments(), listOrders()]);
  const payment = payments.find((record) => record.id === input.paymentId);
  const order = orders.find((record) => record.id === input.orderId);
  if (!payment || !order) return null;

  return updatePaymentInStore(input.paymentId, {
    orderId: order.id,
    customerId: order.customerId,
    customerName: order.customerName,
    status: "paid",
    reference: payment.reference || formatOrderReference(order.id) || "WB-00000",
    reconciliationStatus: "matched",
    suggestedOrderId: null,
    matchedAt: new Date().toISOString(),
  });
}

async function getPaymentsReconciledTodayCount() {
  const records = await listPayments();
  const today = new Date();
  const start = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );
  const end = start + 24 * 60 * 60 * 1000;

  return records.filter((payment) => {
    if (payment.reconciliationStatus !== "matched") return false;
    const value = Date.parse(payment.matchedAt || payment.createdAt);
    return Number.isFinite(value) && value >= start && value < end;
  }).length;
}

async function getAnalyticsSnapshot(): Promise<AnalyticsSnapshot> {
  return {
    stats: computeDashboardStats(),
    series: computeAnalyticsSeries(),
  };
}

async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const state = getStoreState();
  return {
    stats: computeDashboardStats(),
    orders: state.orders,
    customers: await listCustomers(),
    followUps: state.followUps.map((item) => ({
      ...item,
      status: computeFollowUpStatus(item),
    })),
  };
}

export function createLocalRepository(): WhatsboardRepository {
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
