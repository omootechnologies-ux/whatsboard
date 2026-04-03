import type { ParsedSmsPayment, SmsPaymentProvider } from "@/lib/payments/sms-parser";

export type PaymentOrderCandidate = {
  orderId: string;
  customerName: string;
  customerPhone?: string | null;
  amount: number;
};

export type PaymentMatchCandidateScore = {
  orderId: string;
  confidence: number;
  amountScore: number;
  nameScore: number;
  phoneBonus: number;
  amountDelta: number;
};

export type PaymentMatchBand = "high" | "medium" | "low";

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeName(value?: string | null) {
  if (!value) return "";
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ");
}

function tokenizeName(value?: string | null) {
  return normalizeName(value)
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);
}

function normalizePhone(value?: string | null) {
  if (!value) return "";
  return value.replace(/\D/g, "");
}

function computeNameScore(senderName?: string | null, customerName?: string | null) {
  const left = normalizeName(senderName);
  const right = normalizeName(customerName);
  if (!left || !right) return 35;
  if (left === right) return 100;
  if (left.includes(right) || right.includes(left)) return 92;

  const leftTokens = new Set(tokenizeName(left));
  const rightTokens = new Set(tokenizeName(right));
  if (!leftTokens.size || !rightTokens.size) return 35;

  let intersection = 0;
  leftTokens.forEach((token) => {
    if (rightTokens.has(token)) intersection += 1;
  });
  const unionTokens = new Set<string>();
  leftTokens.forEach((token) => unionTokens.add(token));
  rightTokens.forEach((token) => unionTokens.add(token));
  const union = unionTokens.size;
  if (!union) return 35;

  const jaccard = intersection / union;
  return Math.round(Math.max(jaccard * 100, 20));
}

function computeAmountScore(parsedAmount: number | null, orderAmount: number) {
  if (!Number.isFinite(orderAmount) || orderAmount <= 0 || parsedAmount === null) {
    return 0;
  }
  const delta = Math.abs(parsedAmount - orderAmount);
  const ratio = delta / Math.max(parsedAmount, orderAmount, 1);
  if (ratio <= 0.005) return 100;
  if (ratio <= 0.03) return 95;
  if (ratio <= 0.08) return 85;
  if (ratio <= 0.15) return 70;
  if (ratio <= 0.25) return 55;
  return 20;
}

function computePhoneBonus(senderPhone?: string | null, customerPhone?: string | null) {
  const left = normalizePhone(senderPhone);
  const right = normalizePhone(customerPhone);
  if (!left || !right) return 0;
  if (left === right) return 10;
  if (left.length >= 7 && right.length >= 7 && left.slice(-7) === right.slice(-7)) {
    return 7;
  }
  return 0;
}

export function computePaymentMatchScore(
  parsed: ParsedSmsPayment,
  candidate: PaymentOrderCandidate,
): PaymentMatchCandidateScore {
  const amountScore = computeAmountScore(parsed.amount, candidate.amount);
  const nameScore = computeNameScore(parsed.senderName, candidate.customerName);
  const phoneBonus = computePhoneBonus(parsed.senderPhone, candidate.customerPhone);
  const confidence = Math.min(
    100,
    Math.round(amountScore * 0.65 + nameScore * 0.35 + phoneBonus),
  );

  return {
    orderId: candidate.orderId,
    confidence,
    amountScore,
    nameScore,
    phoneBonus,
    amountDelta:
      parsed.amount === null
        ? candidate.amount
        : Math.abs(candidate.amount - parsed.amount),
  };
}

export function rankPaymentMatches(
  parsed: ParsedSmsPayment,
  candidates: PaymentOrderCandidate[],
) {
  return candidates
    .map((candidate) => computePaymentMatchScore(parsed, candidate))
    .sort((a, b) => {
      if (b.confidence !== a.confidence) return b.confidence - a.confidence;
      if (a.amountDelta !== b.amountDelta) return a.amountDelta - b.amountDelta;
      return b.amountScore - a.amountScore;
    });
}

export function matchBandFromConfidence(confidence: number): PaymentMatchBand {
  if (confidence > 85) return "high";
  if (confidence >= 60) return "medium";
  return "low";
}

export function providerToPaymentMethod(provider: SmsPaymentProvider) {
  if (provider === "mpesa") return "M-Pesa" as const;
  if (provider === "tigo") return "Tigopesa" as const;
  if (provider === "airtel") return "Airtel Money" as const;
  return "M-Pesa" as const;
}
