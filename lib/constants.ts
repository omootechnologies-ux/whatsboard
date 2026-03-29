import { OrderStage } from "./types";

export const ORDER_STAGES: { key: OrderStage; label: string }[] = [
  { key: "new_order", label: "New Order" },
  { key: "waiting_payment", label: "Waiting Payment" },
  { key: "paid", label: "Paid" },
  { key: "packing", label: "Packing" },
  { key: "dispatched", label: "Dispatched" },
  { key: "delivered", label: "Delivered" },
  { key: "follow_up", label: "Follow-up" }
];

export const PAIN_POINTS = [
  "bei gani?",
  "nitachukua kesho",
  "natumia namba gani kulipa?",
  "nimetuma",
  "ume-dispatch?",
  "mteja yuko Mbezi",
  "hii order ilishaenda?"
];
