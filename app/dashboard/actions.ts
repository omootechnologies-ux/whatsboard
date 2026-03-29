"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { orderSchema } from "@/lib/validations";

type OrderFormState = {
  error: string;
  success: boolean;
};

async function getBusinessId() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("id", userId)
    .single();

  if (!profile?.business_id) throw new Error("Business not found");
  return { supabase, businessId: profile.business_id };
}

export async function createOrderAction(
  prevState: OrderFormState,
  formData: FormData
): Promise<OrderFormState> {
  const parsed = orderSchema.safeParse({
    customerName: formData.get("customerName"),
    phone: formData.get("phone"),
    area: formData.get("area"),
    productName: formData.get("productName"),
    amount: formData.get("amount"),
    stage: formData.get("stage"),
    paymentStatus: formData.get("paymentStatus"),
    notes: formData.get("notes")
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid order data", success: false };
  }

  const { supabase, businessId } = await getBusinessId();

  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("id")
    .eq("business_id", businessId)
    .eq("phone", parsed.data.phone)
    .maybeSingle();

  let customerId = existingCustomer?.id ?? null;

  if (!customerId) {
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .insert({
        business_id: businessId,
        name: parsed.data.customerName,
        phone: parsed.data.phone,
        area: parsed.data.area
      })
      .select("id")
      .single();

    if (customerError || !customer) {
      return { error: customerError?.message ?? "Unable to create customer", success: false };
    }

    customerId = customer.id;
  } else {
    await supabase
      .from("customers")
      .update({
        name: parsed.data.customerName,
        area: parsed.data.area,
        updated_at: new Date().toISOString()
      })
      .eq("id", customerId);
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      business_id: businessId,
      customer_id: customerId,
      product_name: parsed.data.productName,
      amount: parsed.data.amount,
      delivery_area: parsed.data.area,
      stage: parsed.data.stage,
      payment_status: parsed.data.paymentStatus,
      notes: parsed.data.notes
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return { error: orderError?.message ?? "Unable to create order", success: false };
  }

  await supabase.from("order_activity").insert({
    order_id: order.id,
    business_id: businessId,
    action: "order_created",
    metadata: { stage: parsed.data.stage, payment_status: parsed.data.paymentStatus }
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/customers");
  revalidatePath(`/dashboard/orders/${order.id}`);

  return { error: "", success: true };
}

export async function updateOrderAction(formData: FormData) {
  const { supabase, businessId } = await getBusinessId();

  const orderId = String(formData.get("orderId") ?? "");
  const productName = String(formData.get("productName") ?? "").trim();
  const area = String(formData.get("area") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);
  const stage = String(formData.get("stage") ?? "new_order");
  const paymentStatus = String(formData.get("paymentStatus") ?? "unpaid");
  const notes = String(formData.get("notes") ?? "");

  if (!orderId || !productName || !area || Number.isNaN(amount)) {
    return { error: "Missing required order fields" };
  }

  const { error } = await supabase
    .from("orders")
    .update({
      product_name: productName,
      delivery_area: area,
      amount,
      stage,
      payment_status: paymentStatus,
      notes,
      updated_at: new Date().toISOString()
    })
    .eq("id", orderId)
    .eq("business_id", businessId);

  if (error) {
    return { error: error.message };
  }

  await supabase.from("order_activity").insert({
    order_id: orderId,
    business_id: businessId,
    action: "order_updated",
    metadata: { stage, payment_status: paymentStatus }
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${orderId}`);

  return { success: true };
}

export async function updateOrderStageAction(orderId: string, stage: string) {
  const { supabase, businessId } = await getBusinessId();

  const { error } = await supabase
    .from("orders")
    .update({ stage, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("business_id", businessId);

  if (error) return { error: error.message };

  await supabase.from("order_activity").insert({
    order_id: orderId,
    business_id: businessId,
    action: "stage_updated",
    metadata: { stage }
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${orderId}`);
  return { success: true };
}

export async function completeFollowUpAction(followUpId: string) {
  const { supabase, businessId } = await getBusinessId();

  const { error } = await supabase
    .from("follow_ups")
    .update({
      completed: true,
      completed_at: new Date().toISOString()
    })
    .eq("id", followUpId)
    .eq("business_id", businessId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/follow-ups");
  return { success: true };
}
