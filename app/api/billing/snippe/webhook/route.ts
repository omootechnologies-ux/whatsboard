import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { getPlanConfig, verifySnippeWebhookSignature } from "@/lib/billing";
import { isMissingRelationError } from "@/lib/supabase-errors";

function addDays(value: string, days: number) {
  const date = new Date(value);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("X-Webhook-Signature");
  const secret = process.env.SNIPPE_WEBHOOK_SECRET;

  if (!signature || !secret || !verifySnippeWebhookSignature(payload, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(payload) as {
    id?: string;
    type?: string;
    data?: {
      reference?: string;
      session_reference?: string;
      status?: string;
      completed_at?: string;
      customer?: {
        name?: string;
        phone?: string;
        email?: string;
      };
      metadata?: {
        billing_transaction_id?: string;
        business_id?: string;
        plan_key?: string;
      };
    };
  };

  if (!event.type || !event.data) {
    return NextResponse.json({ received: true });
  }

  const billingTransactionId = event.data.metadata?.billing_transaction_id;
  const businessId = event.data.metadata?.business_id;
  const planKey = event.data.metadata?.plan_key;

  if (!billingTransactionId || !businessId || !planKey) {
    return NextResponse.json({ received: true });
  }

  const plan = getPlanConfig(planKey);

  if (!plan) {
    return NextResponse.json({ received: true });
  }

  const eventId = event.id ?? `${event.type}:${event.data.reference ?? event.data.session_reference ?? "unknown"}`;

  const { data: existingTransaction, error: existingTransactionError } = await adminClient
    .from("billing_transactions")
    .select("id, webhook_event_id")
    .eq("id", billingTransactionId)
    .maybeSingle();

  if (existingTransactionError && isMissingRelationError(existingTransactionError.message)) {
    return NextResponse.json({ received: true, setupRequired: true });
  }

  if (!existingTransaction) {
    return NextResponse.json({ received: true });
  }

  if (existingTransaction.webhook_event_id === eventId) {
    return NextResponse.json({ received: true });
  }

  if (event.type === "payment.completed") {
    const paidAt = event.data.completed_at ?? new Date().toISOString();
    const periodEndsAt = addDays(paidAt, plan.periodDays);

    const completedUpdate = await adminClient
      .from("billing_transactions")
      .update({
        status: "completed",
        payment_reference: event.data.reference ?? null,
        session_reference: event.data.session_reference ?? null,
        webhook_event_id: eventId,
        customer_name: event.data.customer?.name ?? null,
        customer_phone: event.data.customer?.phone ?? null,
        customer_email: event.data.customer?.email ?? null,
        paid_at: paidAt,
        period_starts_at: paidAt,
        period_ends_at: periodEndsAt,
      })
      .eq("id", billingTransactionId);

    if (completedUpdate.error && isMissingRelationError(completedUpdate.error.message)) {
      return NextResponse.json({ received: true, setupRequired: true });
    }

    await adminClient
      .from("businesses")
      .update({
        billing_provider: "snippe",
        billing_plan: plan.key,
        billing_status: "active",
        billing_provider_reference: event.data.reference ?? null,
        billing_provider_session_reference: event.data.session_reference ?? null,
        billing_last_paid_at: paidAt,
        billing_current_period_starts_at: paidAt,
        billing_current_period_ends_at: periodEndsAt,
      })
      .eq("id", businessId);
  }

  if (event.type === "payment.failed") {
    const failedUpdate = await adminClient
      .from("billing_transactions")
      .update({
        status: "failed",
        payment_reference: event.data.reference ?? null,
        session_reference: event.data.session_reference ?? null,
        webhook_event_id: eventId,
      })
      .eq("id", billingTransactionId);

    if (failedUpdate.error && isMissingRelationError(failedUpdate.error.message)) {
      return NextResponse.json({ received: true, setupRequired: true });
    }
  }

  return NextResponse.json({ received: true });
}
