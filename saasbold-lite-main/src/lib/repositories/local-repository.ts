import type { FollowUpRecord } from "@/data/whatsboard";
import {
  createCustomer as createCustomerInStore,
  createFollowUp as createFollowUpInStore,
  createOrder as createOrderInStore,
  createPayment as createPaymentInStore,
  getStoreState,
  statusFromDueDate,
  updateCustomer as updateCustomerInStore,
  updateFollowUp as updateFollowUpInStore,
  updateOrder as updateOrderInStore,
  updatePayment as updatePaymentInStore,
} from "@/lib/whatsboard-store";
import type {
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

function includesText(value: string, search: string) {
  return value.toLowerCase().includes(search.toLowerCase());
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
  return state.orders
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
  const followUpsByCustomer = new Map<string, string>();

  state.followUps
    .filter((item) => computeFollowUpStatus(item) !== "completed")
    .forEach((item) => {
      const existing = followUpsByCustomer.get(item.customerId);
      if (!existing || existing > item.dueAt) {
        followUpsByCustomer.set(item.customerId, item.dueAt);
      }
    });

  return state.customers
    .filter((customer) =>
      query.status ? customer.status === query.status : true,
    )
    .filter((customer) => {
      if (!search) return true;
      const haystack = [customer.name, customer.phone, customer.location].join(
        " ",
      );
      return includesText(haystack, search);
    })
    .map((customer) => ({
      ...customer,
      nextFollowUpAt:
        followUpsByCustomer.get(customer.id) || customer.nextFollowUpAt,
    }))
    .sort((a, b) => (a.lastOrderAt > b.lastOrderAt ? -1 : 1));
}

async function getCustomerById(id: string) {
  const state = getStoreState();
  return state.customers.find((customer) => customer.id === id) || null;
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
        payment.orderId,
        payment.customerName,
        payment.reference,
        payment.method,
      ].join(" ");
      return includesText(haystack, search);
    })
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
}

async function createPayment(input: CreatePaymentInput) {
  return createPaymentInStore(input);
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
