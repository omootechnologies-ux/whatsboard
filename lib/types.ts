export type OrderStage =
  | "new_order"
  | "waiting_payment"
  | "paid"
  | "packing"
  | "dispatched"
  | "delivered"
  | "follow_up";

export type PaymentStatus = "unpaid" | "partial" | "paid" | "cod";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  area: string;
  totalSpent: number;
  orderCount: number;
  lastOrderDate: string;
  isRepeat: boolean;
  status: "active" | "inactive";
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  product: string;
  amount: number;
  area: string;
  stage: OrderStage;
  paymentStatus: PaymentStatus;
  updatedAt: string;
  createdAt: string;
  assignedStaff?: string;
  notes?: string;
  tags?: string[];
}
