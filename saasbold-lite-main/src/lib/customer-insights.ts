import type { BuyerStatus } from "@/data/whatsboard";

export function calculateDaysSince(dateValue?: string | null, now = new Date()) {
  if (!dateValue) return 0;
  const timestamp = Date.parse(dateValue);
  if (!Number.isFinite(timestamp)) return 0;
  const diffMs = now.getTime() - timestamp;
  if (diffMs <= 0) return 0;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function resolveBuyerStatus(input: {
  totalOrders: number;
  createdAt?: string | null;
  lastOrderAt?: string | null;
  now?: Date;
}): BuyerStatus {
  const now = input.now || new Date();
  const daysSinceLast = calculateDaysSince(input.lastOrderAt, now);
  const daysSinceCreated = calculateDaysSince(input.createdAt, now);

  if (daysSinceLast >= 45) return "lost";
  if (input.totalOrders >= 2 && daysSinceLast >= 21) return "at_risk";
  if (input.totalOrders >= 2) return "repeat";
  if (input.totalOrders <= 1 && daysSinceCreated < 30) return "new";
  return daysSinceLast >= 21 ? "at_risk" : "new";
}

export function calculateRepeatPurchaseRate(totalOrders: number) {
  if (totalOrders <= 1) return 0;
  return Math.round(((totalOrders - 1) / totalOrders) * 100);
}

export function calculateAverageOrderValue(totalSpend: number, totalOrders: number) {
  if (!totalOrders) return 0;
  return Math.round(totalSpend / totalOrders);
}
