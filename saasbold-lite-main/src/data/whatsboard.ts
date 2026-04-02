export type OrderStage =
  | "new_order"
  | "waiting_payment"
  | "paid"
  | "packing"
  | "dispatched"
  | "delivered";

export type PaymentStatus = "unpaid" | "partial" | "paid" | "cod";

export type OrderRecord = {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  channel: "WhatsApp" | "Instagram" | "TikTok" | "Facebook";
  stage: OrderStage;
  paymentStatus: PaymentStatus;
  amount: number;
  deliveryArea: string;
  createdAt: string;
  updatedAt: string;
  dueFollowUpAt?: string;
  dispatchEta?: string;
  notes: string;
  items: string[];
  paymentReference?: string;
};

export type CustomerRecord = {
  id: string;
  name: string;
  phone: string;
  location: string;
  totalOrders: number;
  totalSpend: number;
  lastOrderAt: string;
  nextFollowUpAt?: string;
  status: "active" | "waiting" | "vip";
};

export type FollowUpRecord = {
  id: string;
  customerId: string;
  customerName: string;
  orderId?: string;
  title: string;
  note: string;
  dueAt: string;
  status: "overdue" | "today" | "upcoming" | "completed";
  priority: "high" | "medium" | "low";
};

export type PaymentRecord = {
  id: string;
  orderId: string;
  customerName: string;
  amount: number;
  status: PaymentStatus;
  method: "M-Pesa" | "Cash" | "Bank";
  reference: string;
  createdAt: string;
};
