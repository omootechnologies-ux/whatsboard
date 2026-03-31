"use server";

import { redirect } from "next/navigation";
import { getViewerContext } from "@/lib/queries";
import { createSnippeSession, getAppUrl, getPlanConfig } from "@/lib/billing";

export async function startPlanCheckoutAction(planKey: string) {
  const plan = getPlanConfig(planKey);

  if (!plan) {
    redirect("/pricing?status=error&message=Invalid%20plan");
  }

  const { supabase, businessId, business, profile, user } = await getViewerContext();

  if (!user) {
    redirect("/login");
  }

  if (!businessId || !business) {
    redirect("/pricing?status=error&message=No%20business%20found");
  }

  const { data: transaction, error: transactionError } = await supabase
    .from("billing_transactions")
    .insert({
      business_id: businessId,
      provider: "snippe",
      plan_key: plan.key,
      status: "pending",
      amount: plan.amount,
      currency: plan.currency,
      customer_name: profile?.full_name ?? user.email ?? business.name,
      customer_phone: business.phone ?? null,
      customer_email: profile?.email ?? user.email ?? null,
      metadata: {
        initiated_by: user.id,
        business_name: business.name,
      },
    })
    .select("id")
    .single();

  if (transactionError || !transaction) {
    redirect(
      `/pricing?status=error&message=${encodeURIComponent(transactionError?.message ?? "Unable to create billing record")}`
    );
  }

  const appUrl = getAppUrl();

  try {
    const session = await createSnippeSession({
      amount: plan.amount,
      currency: plan.currency,
      description: `${plan.name} plan for ${business.name}`,
      redirectUrl: `${appUrl}/pricing?status=processing&message=${encodeURIComponent("Payment received. We are confirming your plan now.")}`,
      webhookUrl: `${appUrl}/api/billing/snippe/webhook`,
      customer: {
        name: profile?.full_name ?? business.name,
        phone: business.phone ?? undefined,
        email: profile?.email ?? user.email ?? undefined,
      },
      metadata: {
        billing_transaction_id: transaction.id,
        business_id: businessId,
        plan_key: plan.key,
        user_id: user.id,
      },
      lineItems: [
        {
          name: `${plan.name} Plan`,
          quantity: 1,
          unit_price: plan.amount,
          description: `${plan.priceLabel} every ${plan.periodDays} days`,
        },
      ],
      idempotencyKey: transaction.id,
    });

    const { error: updateError } = await supabase
      .from("billing_transactions")
      .update({
        session_reference: session.reference,
        checkout_url: session.checkout_url,
      })
      .eq("id", transaction.id);

    if (updateError) {
      redirect(`/pricing?status=error&message=${encodeURIComponent(updateError.message)}`);
    }

    redirect(session.checkout_url);
  } catch (error) {
    await supabase
      .from("billing_transactions")
      .update({
        status: "failed",
      })
      .eq("id", transaction.id);

    redirect(
      `/pricing?status=error&message=${encodeURIComponent(
        error instanceof Error ? error.message : "Unable to start checkout"
      )}`
    );
  }
}
