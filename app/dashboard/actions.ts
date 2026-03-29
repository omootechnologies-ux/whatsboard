"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionState = {
  success: boolean;
  error: string | null;
};

export async function createOrderAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  const payload = {
    customer_name: String(formData.get("customerName") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    product: String(formData.get("product") || "").trim(),
    amount: Number(formData.get("amount") || 0),
    area: String(formData.get("area") || "").trim(),
    stage: String(formData.get("stage") || "new_order").trim(),
    payment_status: String(formData.get("paymentStatus") || "unpaid").trim(),
    notes: String(formData.get("notes") || "").trim(),
  };

  if (!payload.customer_name) {
    return { success: false, error: "Customer name is required." };
  }

  if (!payload.product) {
    return { success: false, error: "Product is required." };
  }

  if (!Number.isFinite(payload.amount) || payload.amount < 0) {
    return { success: false, error: "Amount must be a valid number." };
  }

  const { error } = await supabase.from("orders").insert(payload);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");

  return { success: true, error: null };
}

export async function updateOrderStageAction(id: string, stage: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("orders").update({ stage }).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${id}`);
}

export async function updateOrderAction(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  const payload = {
    customer_name: String(formData.get("customerName") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    product: String(formData.get("product") || "").trim(),
    amount: Number(formData.get("amount") || 0),
    area: String(formData.get("area") || "").trim(),
    stage: String(formData.get("stage") || "new_order").trim(),
    payment_status: String(formData.get("paymentStatus") || "unpaid").trim(),
    notes: String(formData.get("notes") || "").trim(),
  };

  if (!payload.customer_name) {
    return { success: false, error: "Customer name is required." };
  }

  if (!payload.product) {
    return { success: false, error: "Product is required." };
  }

  if (!Number.isFinite(payload.amount) || payload.amount < 0) {
    return { success: false, error: "Amount must be a valid number." };
  }

  const { error } = await supabase.from("orders").update(payload).eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${id}`);
  revalidatePath(`/dashboard/orders/${id}/edit`);

  return { success: true, error: null };
}

export async function updateCustomerAction(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  const payload = {
    name: String(formData.get("name") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    area: String(formData.get("area") || "").trim(),
    channel: String(formData.get("channel") || "").trim(),
    notes: String(formData.get("notes") || "").trim(),
  };

  if (!payload.name) {
    return { success: false, error: "Customer name is required." };
  }

  const { error } = await supabase.from("customers").update(payload).eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/customers");
  revalidatePath(`/dashboard/customers/${id}`);
  revalidatePath(`/dashboard/customers/${id}/edit`);
  revalidatePath("/dashboard");

  return { success: true, error: null };
}

export async function completeFollowUpAction(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("follow_ups")
    .update({
      completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/follow-ups");
  revalidatePath("/dashboard");
}
