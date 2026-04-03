import type {
  BuyerStatus,
  CustomerRecord,
  CustomerProfileRecord,
  FollowUpRecord,
  OrderRecord,
  PaymentRecord,
  PaymentReconciliationStatus,
  SourceChannel,
} from "@/data/whatsboard";
import type { ParsedSmsPayment } from "@/lib/payments/sms-parser";
import { createLocalRepository } from "@/lib/repositories/local-repository";
import {
  createSupabaseRepository,
  isSupabaseServerConfigured,
} from "@/lib/repositories/supabase-repository";

export type OrdersQuery = {
  search?: string;
  stage?: string;
  payment?: string;
};

export type CustomersQuery = {
  search?: string;
  status?: string;
  buyerStatus?: BuyerStatus;
  sourceChannel?: SourceChannel | "all";
  sort?: "ltv" | "last_order" | "total_orders" | "days_since_last_order";
};

export type FollowUpsQuery = {
  search?: string;
  status?: string;
};

export type PaymentsQuery = {
  search?: string;
  status?: string;
  method?: string;
};

export type DashboardStats = {
  revenueMonth: number;
  activeOrders: number;
  overdueFollowUps: number;
  customersThisMonth: number;
  conversionRate: number;
  payoutPending: number;
};

export type AnalyticsPoint = {
  label: string;
  revenue: number;
  orders: number;
};

export type AnalyticsSnapshot = {
  stats: DashboardStats;
  series: AnalyticsPoint[];
};

export type DashboardSnapshot = {
  stats: DashboardStats;
  orders: OrderRecord[];
  customers: CustomerRecord[];
  followUps: FollowUpRecord[];
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
  whatsappNumber?: string;
  sourceChannel?: SourceChannel;
  notes?: string;
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

export type ReconcileSmsInput = {
  rawSms: string;
};

export type PaymentMatchSuggestion = {
  orderId: string;
  customerName: string;
  amount: number;
  confidence: number;
  amountDelta: number;
};

export type ReconcileSmsResult = {
  payment: PaymentRecord;
  parsed: ParsedSmsPayment;
  status: PaymentReconciliationStatus;
  autoMatched: boolean;
  suggestion: PaymentMatchSuggestion | null;
};

export type AssignPaymentInput = {
  paymentId: string;
  orderId: string;
};

export interface WhatsboardRepository {
  listOrders(query?: OrdersQuery): Promise<OrderRecord[]>;
  getOrderById(id: string): Promise<OrderRecord | null>;
  createOrder(input: CreateOrderInput): Promise<OrderRecord>;
  updateOrder(id: string, input: UpdateOrderInput): Promise<OrderRecord | null>;

  listCustomers(query?: CustomersQuery): Promise<CustomerRecord[]>;
  getCustomerById(id: string): Promise<CustomerRecord | null>;
  getCustomerProfileById(id: string): Promise<CustomerProfileRecord | null>;
  createCustomer(input: CreateCustomerInput): Promise<CustomerRecord>;
  updateCustomer(
    id: string,
    input: UpdateCustomerInput,
  ): Promise<CustomerRecord | null>;

  listFollowUps(query?: FollowUpsQuery): Promise<FollowUpRecord[]>;
  createFollowUp(input: CreateFollowUpInput): Promise<FollowUpRecord>;
  updateFollowUp(
    id: string,
    input: UpdateFollowUpInput,
  ): Promise<FollowUpRecord | null>;
  listOrderFollowUps(orderId: string): Promise<FollowUpRecord[]>;

  listPayments(query?: PaymentsQuery): Promise<PaymentRecord[]>;
  createPayment(input: CreatePaymentInput): Promise<PaymentRecord>;
  updatePayment(
    id: string,
    input: UpdatePaymentInput,
  ): Promise<PaymentRecord | null>;
  listOrderPayments(orderId: string): Promise<PaymentRecord[]>;
  listUnmatchedPayments(): Promise<PaymentRecord[]>;
  reconcilePaymentSms(input: ReconcileSmsInput): Promise<ReconcileSmsResult>;
  assignPaymentToOrder(input: AssignPaymentInput): Promise<PaymentRecord | null>;
  getPaymentsReconciledTodayCount(): Promise<number>;

  getAnalyticsSnapshot(): Promise<AnalyticsSnapshot>;
  getDashboardSnapshot(): Promise<DashboardSnapshot>;
}

type PersistenceDriver = "local" | "supabase";

let cachedRepository:
  | {
      driver: PersistenceDriver;
      repository: WhatsboardRepository;
    }
  | undefined;

function resolveDriver(): PersistenceDriver {
  const configured =
    process.env.WHATSBOARD_PERSISTENCE_DRIVER?.trim().toLowerCase();
  const vercelEnvironment = process.env.VERCEL_ENV?.trim().toLowerCase();
  const isProduction = vercelEnvironment === "production";

  if (isProduction && configured === "local") {
    throw new Error(
      "WHATSBOARD_PERSISTENCE_DRIVER=local is not allowed in production. Use supabase.",
    );
  }

  if (configured === "local") return "local";
  if (configured === "supabase") return "supabase";

  // Safety default: Vercel production should not silently write to /tmp storage.
  if (isProduction) {
    return "supabase";
  }

  return isSupabaseServerConfigured() ? "supabase" : "local";
}

function getRepository(): WhatsboardRepository {
  const driver = resolveDriver();

  if (cachedRepository && cachedRepository.driver === driver) {
    return cachedRepository.repository;
  }

  if (driver === "supabase") {
    if (!isSupabaseServerConfigured()) {
      throw new Error(
        "Supabase persistence selected but required server env vars are missing.",
      );
    }
    const repository = createSupabaseRepository();
    cachedRepository = { driver, repository };
    return repository;
  }

  const repository = createLocalRepository();
  cachedRepository = { driver, repository };
  return repository;
}

export function resetRepositoryCacheForTests() {
  cachedRepository = undefined;
}

export async function listOrders(query: OrdersQuery = {}) {
  return getRepository().listOrders(query);
}

export async function getOrderById(id: string) {
  return getRepository().getOrderById(id);
}

export async function createOrder(input: CreateOrderInput) {
  return getRepository().createOrder(input);
}

export async function updateOrder(id: string, input: UpdateOrderInput) {
  return getRepository().updateOrder(id, input);
}

export async function listCustomers(query: CustomersQuery = {}) {
  return getRepository().listCustomers(query);
}

export async function getCustomerById(id: string) {
  return getRepository().getCustomerById(id);
}

export async function getCustomerProfileById(id: string) {
  return getRepository().getCustomerProfileById(id);
}

export async function createCustomer(input: CreateCustomerInput) {
  return getRepository().createCustomer(input);
}

export async function updateCustomer(id: string, input: UpdateCustomerInput) {
  return getRepository().updateCustomer(id, input);
}

export async function listFollowUps(query: FollowUpsQuery = {}) {
  return getRepository().listFollowUps(query);
}

export async function createFollowUp(input: CreateFollowUpInput) {
  return getRepository().createFollowUp(input);
}

export async function updateFollowUp(id: string, input: UpdateFollowUpInput) {
  return getRepository().updateFollowUp(id, input);
}

export async function listOrderFollowUps(orderId: string) {
  return getRepository().listOrderFollowUps(orderId);
}

export async function listPayments(query: PaymentsQuery = {}) {
  return getRepository().listPayments(query);
}

export async function createPayment(input: CreatePaymentInput) {
  return getRepository().createPayment(input);
}

export async function updatePayment(id: string, input: UpdatePaymentInput) {
  return getRepository().updatePayment(id, input);
}

export async function listOrderPayments(orderId: string) {
  return getRepository().listOrderPayments(orderId);
}

export async function listUnmatchedPayments() {
  return getRepository().listUnmatchedPayments();
}

export async function reconcilePaymentSms(input: ReconcileSmsInput) {
  return getRepository().reconcilePaymentSms(input);
}

export async function assignPaymentToOrder(input: AssignPaymentInput) {
  return getRepository().assignPaymentToOrder(input);
}

export async function getPaymentsReconciledTodayCount() {
  return getRepository().getPaymentsReconciledTodayCount();
}

export async function getAnalyticsSnapshot() {
  return getRepository().getAnalyticsSnapshot();
}

export async function getDashboardSnapshot() {
  return getRepository().getDashboardSnapshot();
}
