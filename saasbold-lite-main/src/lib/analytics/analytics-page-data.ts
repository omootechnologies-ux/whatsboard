import type { CustomerRecord, OrderRecord, PaymentRecord } from "@/data/whatsboard";
import { listCustomers, listOrders, listPayments } from "@/lib/whatsboard-repository";

export type AnalyticsPageData = {
  orders: OrderRecord[];
  payments: PaymentRecord[];
  customers: CustomerRecord[];
};

export async function getAnalyticsPageData(): Promise<AnalyticsPageData> {
  const [orders, payments, customers] = await Promise.all([
    listOrders(),
    listPayments(),
    listCustomers(),
  ]);

  return {
    orders,
    payments,
    customers,
  };
}

