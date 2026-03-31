import crypto from "node:crypto";
export { PLAN_CONFIG, getPlanConfig, getPlanName, type DashboardFeature, type PlanKey } from "@/lib/plan-access";

export function getAppUrl() {
  const explicitUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (explicitUrl) {
    return explicitUrl.replace(/\/+$/, "");
  }

  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

  if (vercelProductionUrl) {
    return `https://${vercelProductionUrl.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();

  if (vercelUrl) {
    return `https://${vercelUrl.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;
  }

  return "http://localhost:3000";
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
