import crypto from "node:crypto";

export type PlanKey = "starter" | "growth" | "business";

export const PLAN_CONFIG: Record<
  PlanKey,
  {
    key: PlanKey;
    name: string;
    priceLabel: string;
    amount: number;
    currency: "TZS";
    periodDays: number;
    description: string;
  }
> = {
  starter: {
    key: "starter",
    name: "Starter",
    priceLabel: "TZS 29,000",
    amount: 29000,
    currency: "TZS",
    periodDays: 30,
    description: "Starter monthly plan",
  },
  growth: {
    key: "growth",
    name: "Growth",
    priceLabel: "TZS 79,000",
    amount: 79000,
    currency: "TZS",
    periodDays: 30,
    description: "Growth monthly plan",
  },
  business: {
    key: "business",
    name: "Business",
    priceLabel: "TZS 149,000",
    amount: 149000,
    currency: "TZS",
    periodDays: 30,
    description: "Business monthly plan",
  },
};

export function getPlanConfig(planKey: string) {
  if (!(planKey in PLAN_CONFIG)) return null;
  return PLAN_CONFIG[planKey as PlanKey];
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export function getSnippeBaseUrl() {
  return process.env.SNIPPE_API_BASE_URL || "https://api.snippe.sh";
}

export function verifySnippeWebhookSignature(payload: string, signature: string, secret: string) {
  const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  if (signature.length !== expectedSignature.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

export async function createSnippeSession({
  amount,
  currency,
  description,
  redirectUrl,
  webhookUrl,
  customer,
  metadata,
  lineItems,
  idempotencyKey,
}: {
  amount: number;
  currency: string;
  description: string;
  redirectUrl: string;
  webhookUrl: string;
  customer: {
    name?: string | null;
    phone?: string | null;
    email?: string | null;
  };
  metadata: Record<string, string>;
  lineItems: Array<{ name: string; quantity: number; unit_price: number; description?: string }>;
  idempotencyKey: string;
}) {
  const apiKey = process.env.SNIPPE_API_KEY;

  if (!apiKey) {
    throw new Error("SNIPPE_API_KEY is not configured.");
  }

  const response = await fetch(`${getSnippeBaseUrl()}/api/v1/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      amount,
      currency,
      allowed_methods: ["mobile_money", "card", "qr"],
      customer,
      redirect_url: redirectUrl,
      webhook_url: webhookUrl,
      description,
      metadata,
      line_items: lineItems,
      display: {
        show_line_items: true,
        line_items_style: "compact",
        show_description: true,
        show_merchant_logo: true,
        theme: "light",
        success_message: "Payment received. Your plan is being activated.",
        button_text: "Pay Now",
      },
      expires_in: 3600,
    }),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.data?.checkout_url || !payload?.data?.reference) {
    throw new Error(payload?.message || "Failed to create Snippe checkout session.");
  }

  return payload.data as {
    reference: string;
    checkout_url: string;
    expires_at?: string;
  };
}
