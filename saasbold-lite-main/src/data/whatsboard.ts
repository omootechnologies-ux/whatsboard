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

export const dashboardStats = {
  revenueMonth: 4820000,
  activeOrders: 38,
  overdueFollowUps: 6,
  customersThisMonth: 21,
  conversionRate: 68,
  payoutPending: 1260000,
};

export const orders: OrderRecord[] = [
  {
    id: "WB-3401",
    customerId: "cust-1",
    customerName: "Amina Mushi",
    channel: "WhatsApp",
    stage: "waiting_payment",
    paymentStatus: "partial",
    amount: 85000,
    deliveryArea: "Dar es Salaam",
    createdAt: "2026-04-01T08:30:00.000Z",
    updatedAt: "2026-04-01T11:15:00.000Z",
    dueFollowUpAt: "2026-04-02T09:30:00.000Z",
    notes: "Customer asked to split payment after stock confirmation.",
    items: ["2x Ankara set", "1x delivery fee"],
    paymentReference: "MPESA-8831",
  },
  {
    id: "WB-3402",
    customerId: "cust-2",
    customerName: "Kevin Otieno",
    channel: "Instagram",
    stage: "paid",
    paymentStatus: "paid",
    amount: 120000,
    deliveryArea: "Nairobi",
    createdAt: "2026-04-01T07:15:00.000Z",
    updatedAt: "2026-04-01T10:40:00.000Z",
    dispatchEta: "2026-04-02T15:00:00.000Z",
    notes: "Paid in full, waiting for packing confirmation.",
    items: ["3x sneaker pairs"],
    paymentReference: "BANK-2201",
  },
  {
    id: "WB-3403",
    customerId: "cust-3",
    customerName: "Neema Kileo",
    channel: "TikTok",
    stage: "new_order",
    paymentStatus: "unpaid",
    amount: 45000,
    deliveryArea: "Arusha",
    createdAt: "2026-04-01T09:20:00.000Z",
    updatedAt: "2026-04-01T09:20:00.000Z",
    dueFollowUpAt: "2026-04-02T06:00:00.000Z",
    notes: "Asked for pink option before confirming.",
    items: ["1x beauty bundle"],
  },
  {
    id: "WB-3404",
    customerId: "cust-4",
    customerName: "Joyce Wairimu",
    channel: "Facebook",
    stage: "packing",
    paymentStatus: "paid",
    amount: 220000,
    deliveryArea: "Mombasa",
    createdAt: "2026-03-31T16:10:00.000Z",
    updatedAt: "2026-04-01T08:55:00.000Z",
    dispatchEta: "2026-04-02T12:00:00.000Z",
    notes: "Bulk order for reseller pickup.",
    items: ["10x skincare packs"],
    paymentReference: "MPESA-5512",
  },
  {
    id: "WB-3405",
    customerId: "cust-5",
    customerName: "Rashid Salum",
    channel: "WhatsApp",
    stage: "dispatched",
    paymentStatus: "paid",
    amount: 76000,
    deliveryArea: "Zanzibar",
    createdAt: "2026-03-31T13:40:00.000Z",
    updatedAt: "2026-04-01T07:50:00.000Z",
    dispatchEta: "2026-04-02T18:00:00.000Z",
    notes: "Courier requested extra contact confirmation.",
    items: ["2x polo shirts", "1x cap"],
    paymentReference: "MPESA-4412",
  },
  {
    id: "WB-3406",
    customerId: "cust-6",
    customerName: "Mercy Atieno",
    channel: "Instagram",
    stage: "delivered",
    paymentStatus: "cod",
    amount: 68000,
    deliveryArea: "Kampala",
    createdAt: "2026-03-30T12:10:00.000Z",
    updatedAt: "2026-04-01T06:20:00.000Z",
    notes: "COD order delivered yesterday evening.",
    items: ["1x hair kit"],
  },
];

export const customers: CustomerRecord[] = [
  {
    id: "cust-1",
    name: "Amina Mushi",
    phone: "+255 754 220 811",
    location: "Dar es Salaam",
    totalOrders: 5,
    totalSpend: 312000,
    lastOrderAt: "2026-04-01T11:15:00.000Z",
    nextFollowUpAt: "2026-04-02T09:30:00.000Z",
    status: "vip",
  },
  {
    id: "cust-2",
    name: "Kevin Otieno",
    phone: "+254 701 342 129",
    location: "Nairobi",
    totalOrders: 3,
    totalSpend: 245000,
    lastOrderAt: "2026-04-01T10:40:00.000Z",
    status: "active",
  },
  {
    id: "cust-3",
    name: "Neema Kileo",
    phone: "+255 762 433 900",
    location: "Arusha",
    totalOrders: 2,
    totalSpend: 97000,
    lastOrderAt: "2026-04-01T09:20:00.000Z",
    nextFollowUpAt: "2026-04-02T06:00:00.000Z",
    status: "waiting",
  },
  {
    id: "cust-4",
    name: "Joyce Wairimu",
    phone: "+254 722 819 301",
    location: "Mombasa",
    totalOrders: 8,
    totalSpend: 660000,
    lastOrderAt: "2026-04-01T08:55:00.000Z",
    status: "vip",
  },
  {
    id: "cust-5",
    name: "Rashid Salum",
    phone: "+255 778 551 119",
    location: "Zanzibar",
    totalOrders: 4,
    totalSpend: 231000,
    lastOrderAt: "2026-04-01T07:50:00.000Z",
    status: "active",
  },
];

export const followUps: FollowUpRecord[] = [
  {
    id: "fu-1",
    customerId: "cust-1",
    customerName: "Amina Mushi",
    orderId: "WB-3401",
    title: "Confirm balance payment",
    note: "Customer promised to clear balance after lunch.",
    dueAt: "2026-04-02T09:30:00.000Z",
    status: "today",
    priority: "high",
  },
  {
    id: "fu-2",
    customerId: "cust-3",
    customerName: "Neema Kileo",
    orderId: "WB-3403",
    title: "Send pink bundle photos",
    note: "Needs photos before confirming payment.",
    dueAt: "2026-04-01T14:00:00.000Z",
    status: "overdue",
    priority: "high",
  },
  {
    id: "fu-3",
    customerId: "cust-5",
    customerName: "Rashid Salum",
    orderId: "WB-3405",
    title: "Delivery confirmation",
    note: "Courier asked for backup phone number.",
    dueAt: "2026-04-02T13:30:00.000Z",
    status: "upcoming",
    priority: "medium",
  },
  {
    id: "fu-4",
    customerId: "cust-2",
    customerName: "Kevin Otieno",
    orderId: "WB-3402",
    title: "Cross-sell after dispatch",
    note: "Offer matching socks after order is packed.",
    dueAt: "2026-04-03T10:00:00.000Z",
    status: "upcoming",
    priority: "low",
  },
  {
    id: "fu-5",
    customerId: "cust-4",
    customerName: "Joyce Wairimu",
    orderId: "WB-3390",
    title: "Restock reminder sent",
    note: "Bulk buyer already re-engaged this morning.",
    dueAt: "2026-03-31T09:00:00.000Z",
    status: "completed",
    priority: "low",
  },
];

export const payments: PaymentRecord[] = [
  {
    id: "pay-1",
    orderId: "WB-3401",
    customerName: "Amina Mushi",
    amount: 40000,
    status: "partial",
    method: "M-Pesa",
    reference: "MPESA-8831",
    createdAt: "2026-04-01T11:10:00.000Z",
  },
  {
    id: "pay-2",
    orderId: "WB-3402",
    customerName: "Kevin Otieno",
    amount: 120000,
    status: "paid",
    method: "Bank",
    reference: "BANK-2201",
    createdAt: "2026-04-01T09:20:00.000Z",
  },
  {
    id: "pay-3",
    orderId: "WB-3404",
    customerName: "Joyce Wairimu",
    amount: 220000,
    status: "paid",
    method: "M-Pesa",
    reference: "MPESA-5512",
    createdAt: "2026-03-31T17:20:00.000Z",
  },
  {
    id: "pay-4",
    orderId: "WB-3406",
    customerName: "Mercy Atieno",
    amount: 68000,
    status: "cod",
    method: "Cash",
    reference: "COD-3406",
    createdAt: "2026-04-01T06:20:00.000Z",
  },
];

export const analyticsSeries = [
  { label: "Mon", revenue: 320000, orders: 8 },
  { label: "Tue", revenue: 450000, orders: 11 },
  { label: "Wed", revenue: 610000, orders: 14 },
  { label: "Thu", revenue: 520000, orders: 12 },
  { label: "Fri", revenue: 710000, orders: 16 },
  { label: "Sat", revenue: 860000, orders: 20 },
  { label: "Sun", revenue: 590000, orders: 13 },
];

export function findOrderById(id: string) {
  return orders.find((order) => order.id === id) || null;
}

export function customerForOrder(orderId: string) {
  const order = findOrderById(orderId);
  if (!order) return null;
  return customers.find((customer) => customer.id === order.customerId) || null;
}
