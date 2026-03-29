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

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      business_id: businessId,
      customer_id: customer.id,
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

  return { error: "", success: true };
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
  return { success: true };
}
