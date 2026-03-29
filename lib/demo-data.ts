import { Customer, Order } from "./types";

export const demoCustomers: Customer[] = [
  {
    id: "c1",
    name: "Amina Selemani",
    phone: "+255712000111",
    area: "Mbezi",
    totalSpent: 185000,
    orderCount: 3,
    lastOrderDate: "2026-03-28",
    isRepeat: true,
    status: "active"
  },
  {
    id: "c2",
    name: "Neema Ally",
    phone: "+255744332211",
    area: "Kariakoo",
    totalSpent: 45000,
    orderCount: 1,
    lastOrderDate: "2026-03-29",
    isRepeat: false,
    status: "active"
  },
  {
    id: "c3",
    name: "Kelvin Mushi",
    phone: "+255765771234",
    area: "Sinza",
    totalSpent: 320000,
    orderCount: 5,
    lastOrderDate: "2026-03-27",
    isRepeat: true,
    status: "active"
  }
];

export const demoOrders: Order[] = [
  {
    id: "o1",
    customerId: "c1",
    customerName: "Amina Selemani",
    phone: "+255712000111",
    product: "2 satin dresses",
    amount: 85000,
    area: "Mbezi",
    stage: "waiting_payment",
    paymentStatus: "unpaid",
    updatedAt: "2026-03-29T08:10:00Z",
    createdAt: "2026-03-29T07:30:00Z",
    tags: ["Instagram", "High intent"]
  },
  {
    id: "o2",
    customerId: "c2",
    customerName: "Neema Ally",
    phone: "+255744332211",
    product: "Face serum bundle",
    amount: 45000,
    area: "Kariakoo",
    stage: "packing",
    paymentStatus: "paid",
    updatedAt: "2026-03-29T09:20:00Z",
    createdAt: "2026-03-29T08:55:00Z",
    assignedStaff: "Joyce",
    tags: ["Repeat follow-up"]
  },
  {
    id: "o3",
    customerId: "c3",
    customerName: "Kelvin Mushi",
    phone: "+255765771234",
    product: "Bluetooth speaker",
    amount: 120000,
    area: "Masaki",
    stage: "dispatched",
    paymentStatus: "paid",
    updatedAt: "2026-03-29T10:10:00Z",
    createdAt: "2026-03-29T09:00:00Z",
    assignedStaff: "Musa",
    tags: ["TikTok", "Express"]
  }
];
