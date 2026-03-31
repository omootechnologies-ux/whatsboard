"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getViewerContext } from "@/lib/queries";

type ActionState = {
  success: boolean;
  error: string | null;
};

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function generateReferralCode(value: string, businessId: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 6)
    .padEnd(4, "x");

  return `${slug}-${businessId.replace(/-/g, "").slice(0, 6)}`.toUpperCase();
}

export async function createOrderAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, businessId } = await getViewerContext();

  if (!businessId) return { success: false, error: "Business not found." };

  const customerName = String(formData.get("customerName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const productName = String(formData.get("product") || "").trim();
  const amount = Number(formData.get("amount") || 0);
  const deliveryArea = String(formData.get("area") || "").trim();
  const stage = String(formData.get("stage") || "new_order").trim();
  const paymentStatus = String(formData.get("paymentStatus") || "unpaid").trim();
  const notes = String(formData.get("notes") || "").trim();
  const addFollowUp = String(formData.get("addFollowUp") || "") === "on";
  const followUpDateRaw = String(formData.get("followUpDate") || "").trim();
  const followUpNote = String(formData.get("followUpNote") || "").trim();

  if (!customerName) return { success: false, error: "Customer name is required." };
  if (!phone) return { success: false, error: "Phone number is required." };
  if (!productName) return { success: false, error: "Product is required." };
  if (!Number.isFinite(amount) || amount < 0) {
    return { success: false, error: "Amount must be a valid number." };
  }

  const normalizedCustomerName = normalizeText(customerName);

  const { data: phoneMatches, error: phoneMatchesError } = await supabase
    .from("customers")
    .select("id, name")
    .eq("business_id", businessId)
    .eq("phone", phone);

  if (phoneMatchesError) return { success: false, error: phoneMatchesError.message };

  const matchedCustomer =
    (phoneMatches ?? []).find(
      (customer) => normalizeText(customer.name ?? "") === normalizedCustomerName
    ) ?? null;

  let customerId: string | null = null;

  if (matchedCustomer?.id) {
    customerId = matchedCustomer.id;

    const { error: updateCustomerError } = await supabase
      .from("customers")
      .update({
        name: customerName,
        area: deliveryArea,
      })
      .eq("id", customerId);

    if (updateCustomerError) return { success: false, error: updateCustomerError.message };
  } else {
    const { data: newCustomer, error: newCustomerError } = await supabase
      .from("customers")
      .insert({
        business_id: businessId,
        name: customerName,
        phone,
        area: deliveryArea,
        status: "active",
      })
      .select("id")
      .single();

    if (newCustomerError || !newCustomer) {
      return {
        success: false,
        error: newCustomerError?.message || "Unable to create customer.",
      };
    }

    customerId = newCustomer.id;
  }

  const { data: createdOrder, error: orderError } = await supabase
    .from("orders")
    .insert({
      business_id: businessId,
      customer_id: customerId,
      product_name: productName,
      amount,
      delivery_area: deliveryArea,
      stage,
      payment_status: paymentStatus,
      notes,
    })
    .select("id")
    .single();

  if (orderError || !createdOrder) {
    return { success: false, error: orderError?.message || "Unable to create order." };
  }

  if (addFollowUp) {
    const dueAt = followUpDateRaw
      ? new Date(followUpDateRaw).toISOString()
      : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error: followUpError } = await supabase.from("follow_ups").insert({
      business_id: businessId,
      order_id: createdOrder.id,
      due_at: dueAt,
      note: followUpNote || `Follow up with ${customerName} about ${productName}`,
      completed: false,
    });

    if (followUpError) return { success: false, error: followUpError.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/customers");
  revalidatePath("/dashboard/follow-ups");

  return { success: true, error: null };
}

export async function updateOrderStageAction(id: string, stage: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("orders").update({ stage }).eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${id}`);
}

export async function updateOrderAction(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, businessId } = await getViewerContext();

  if (!businessId) return { success: false, error: "Business not found." };

  const customerName = String(formData.get("customerName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const productName = String(formData.get("product") || "").trim();
  const amount = Number(formData.get("amount") || 0);
  const deliveryArea = String(formData.get("area") || "").trim();
  const stage = String(formData.get("stage") || "new_order").trim();
  const paymentStatus = String(formData.get("paymentStatus") || "unpaid").trim();
  const notes = String(formData.get("notes") || "").trim();
  const addFollowUp = String(formData.get("addFollowUp") || "") === "on";
  const followUpDateRaw = String(formData.get("followUpDate") || "").trim();
  const followUpNote = String(formData.get("followUpNote") || "").trim();

  if (!customerName) return { success: false, error: "Customer name is required." };
  if (!phone) return { success: false, error: "Phone number is required." };
  if (!productName) return { success: false, error: "Product is required." };
  if (!Number.isFinite(amount) || amount < 0) {
    return { success: false, error: "Amount must be a valid number." };
  }

  const { data: currentOrder, error: currentOrderError } = await supabase
    .from("orders")
    .select("id, customer_id")
    .eq("business_id", businessId)
    .eq("id", id)
    .single();

  if (currentOrderError || !currentOrder) {
    return { success: false, error: currentOrderError?.message || "Order not found." };
  }

  let customerId = currentOrder.customer_id;

  if (customerId) {
    const { error: updateCustomerError } = await supabase
      .from("customers")
      .update({
        name: customerName,
        phone,
        area: deliveryArea,
      })
      .eq("business_id", businessId)
      .eq("id", customerId);

    if (updateCustomerError) return { success: false, error: updateCustomerError.message };
  } else {
    const normalizedCustomerName = normalizeText(customerName);

    const { data: phoneMatches, error: phoneMatchesError } = await supabase
      .from("customers")
      .select("id, name")
      .eq("business_id", businessId)
      .eq("phone", phone);

    if (phoneMatchesError) return { success: false, error: phoneMatchesError.message };

    const matchedCustomer =
      (phoneMatches ?? []).find(
        (customer) => normalizeText(customer.name ?? "") === normalizedCustomerName
      ) ?? null;

    if (matchedCustomer?.id) {
      customerId = matchedCustomer.id;
    } else {
      const { data: newCustomer, error: newCustomerError } = await supabase
        .from("customers")
        .insert({
          business_id: businessId,
          name: customerName,
          phone,
          area: deliveryArea,
          status: "active",
        })
        .select("id")
        .single();

      if (newCustomerError || !newCustomer) {
        return {
          success: false,
          error: newCustomerError?.message || "Unable to create customer.",
        };
      }

      customerId = newCustomer.id;
    }
  }

  const { error } = await supabase
    .from("orders")
    .update({
      customer_id: customerId,
      product_name: productName,
      amount,
      delivery_area: deliveryArea,
      stage,
      payment_status: paymentStatus,
      notes,
    })
    .eq("business_id", businessId)
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  if (addFollowUp) {
    const dueAt = followUpDateRaw
      ? new Date(followUpDateRaw).toISOString()
      : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data: existingFollowUp } = await supabase
      .from("follow_ups")
      .select("id")
      .eq("business_id", businessId)
      .eq("order_id", id)
      .eq("completed", false)
      .maybeSingle();

    if (existingFollowUp?.id) {
      const { error: updateFollowUpError } = await supabase
        .from("follow_ups")
        .update({
          due_at: dueAt,
          note: followUpNote || `Follow up with ${customerName} about ${productName}`,
        })
        .eq("business_id", businessId)
        .eq("id", existingFollowUp.id);

      if (updateFollowUpError) return { success: false, error: updateFollowUpError.message };
    } else {
      const { error: createFollowUpError } = await supabase.from("follow_ups").insert({
        business_id: businessId,
        order_id: id,
        due_at: dueAt,
        note: followUpNote || `Follow up with ${customerName} about ${productName}`,
        completed: false,
      });

      if (createFollowUpError) return { success: false, error: createFollowUpError.message };
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${id}`);
  revalidatePath(`/dashboard/orders/${id}/edit`);
  revalidatePath("/dashboard/customers");
  revalidatePath("/dashboard/follow-ups");

  return { success: true, error: null };
}

export async function updateCustomerAction(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, businessId } = await getViewerContext();

  if (!businessId) return { success: false, error: "Business not found." };

  const payload = {
    name: String(formData.get("name") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    area: String(formData.get("area") || "").trim(),
    notes: String(formData.get("notes") || "").trim(),
  };

  if (!payload.name) return { success: false, error: "Customer name is required." };

  const { error } = await supabase
    .from("customers")
    .update(payload)
    .eq("business_id", businessId)
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/customers");
  revalidatePath(`/dashboard/customers/${id}`);
  revalidatePath(`/dashboard/customers/${id}/edit`);
  revalidatePath("/dashboard");

  return { success: true, error: null };
}

export async function updateFollowUpAction(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, businessId } = await getViewerContext();

  if (!businessId) return { success: false, error: "Business not found." };

  const dueAtRaw = String(formData.get("dueAt") || "").trim();
  const note = String(formData.get("note") || "").trim();
  const completed = String(formData.get("completed") || "") === "on";

  if (!dueAtRaw) return { success: false, error: "Follow-up date is required." };

  const due_at = new Date(dueAtRaw).toISOString();

  const { error } = await supabase
    .from("follow_ups")
    .update({
      due_at,
      note,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq("business_id", businessId)
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/follow-ups");
  revalidatePath(`/dashboard/follow-ups/${id}/edit`);
  revalidatePath("/dashboard");

  return { success: true, error: null };
}

export async function ensureReferralCodeAction() {
  const { supabase, businessId, business } = await getViewerContext();

  if (!businessId || !business?.name) return;
  if ((business as any).referral_code) return;

  await supabase
    .from("businesses")
    .update({
      referral_code: generateReferralCode(business.name, businessId),
    })
    .eq("id", businessId);

  revalidatePath("/dashboard/referrals");
}

export async function createCatalogProductAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, businessId } = await getViewerContext();

  if (!businessId) return { success: false, error: "Business not found." };

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  const price = Number(formData.get("price") || 0);
  const stockCount = Number(formData.get("stockCount") || 0);

  if (!name) return { success: false, error: "Product name is required." };
  if (!Number.isFinite(price) || price < 0) return { success: false, error: "Price must be valid." };
  if (!Number.isFinite(stockCount) || stockCount < 0) return { success: false, error: "Stock count must be valid." };

  const { error } = await supabase.from("catalog_products").insert({
    business_id: businessId,
    name,
    description: description || null,
    image_url: imageUrl || null,
    price,
    stock_count: stockCount,
    is_active: true,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/catalog");
  revalidatePath("/dashboard");

  return { success: true, error: null };
}

export async function updateCatalogStockAction(id: string, formData: FormData) {
  const { supabase, businessId } = await getViewerContext();

  if (!businessId) return;

  const stockCount = Number(formData.get("stockCount") || 0);
  const isActive = String(formData.get("isActive") || "") === "on";

  await supabase
    .from("catalog_products")
    .update({
      stock_count: Number.isFinite(stockCount) ? stockCount : 0,
      is_active: isActive,
    })
    .eq("business_id", businessId)
    .eq("id", id);

  revalidatePath("/dashboard/catalog");
}

export async function completeFollowUpAction(id: string) {
  const { supabase, businessId } = await getViewerContext();

  if (!businessId) throw new Error("Business not found.");

  const { error } = await supabase
    .from("follow_ups")
    .update({
      completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq("business_id", businessId)
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/follow-ups");
  revalidatePath("/dashboard");
}
