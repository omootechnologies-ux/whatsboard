import type { CustomerRecord, OrderRecord, PaymentRecord } from "@/data/whatsboard";
import { listCustomers, listOrders, listPayments } from "@/lib/whatsboard-repository";
import { getReceiptViewsThisMonthForCurrentBusiness } from "@/lib/receipts/receipt-service";

export type AnalyticsPageData = {
  orders: OrderRecord[];
  payments: PaymentRecord[];
  customers: CustomerRecord[];
  receiptViews: number;
};

export async function getAnalyticsPageData(): Promise<AnalyticsPageData> {
  const [orders, payments, customers, receiptViews] = await Promise.all([
    listOrders(),
    listPayments(),
    listCustomers(),
    getReceiptViewsThisMonthForCurrentBusiness().catch(() => 0),
  ]);

  return {
    orders,
    payments,
    customers,
    receiptViews: receiptViews ?? 0,
  };
}
