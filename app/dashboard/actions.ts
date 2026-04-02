"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { getViewerContext } from "@/lib/queries";
import {
  canCreateOrders,
  canUsePlanCapability,
  getAllowedOrderStages,
  getAllowedPaymentStatuses,
  getMonthlyOrderLimit,
  getTeamMemberLimit,
} from "@/lib/plan-access";

type ActionState = {
  success: boolean;
  error: string | null;
};

type CatalogProductRecord = {
  id: string;
  name: string;
  price: number | string | null;
  stock_count: number | null;
  is_active: boolean | null;
};

type CreateOrderPayload = {
  customerName: string;
  phone: string;
  productName: string;
  catalogProductId?: string;
  amount: number;
  deliveryArea: string;
  stage: string;
  paymentStatus: string;
  notes: string;
  addFollowUp?: boolean;
  followUpDateRaw?: string;
  followUpNote?: string;
  tags?: string[];
};

async function getDashboardActionContext() {
  const context = await getViewerContext();

  if (context.businessId) {
    return context;
  }

  const user = context.user;

  if (!user) {
    return null;
  }

  const { data: profile } = await adminClient
    .from("profiles")
    .select("business_id, full_name, email, business_name")
    .eq("id", user.id)
    .maybeSingle();

  const { data: membership } = await adminClient
    .from("business_members")
    .select("business_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  let resolvedBusinessId = membership?.business_id ?? profile?.business_id ?? null;
  let resolvedRole = membership?.role ?? null;
  let business = context.business;

  if (!resolvedBusinessId) {
    const { data: ownedBusiness } = await adminClient
      .from("businesses")
      .select("id, owner_id, name, phone, brand_color, currency, created_at, referral_code, referral_credit_days, referred_by_business_id, billing_provider, billing_plan, billing_status, billing_provider_reference, billing_provider_session_reference, billing_last_paid_at, billing_current_period_starts_at, billing_current_period_ends_at")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (ownedBusiness?.id) {
      resolvedBusinessId = ownedBusiness.id;
      resolvedRole = "owner";
      business = ownedBusiness;
    }
  }

  if (!resolvedBusinessId) {
    const profileBusinessName = String(profile?.business_name ?? "").trim();
    const metadataBusinessName = String(user.user_metadata?.business_name ?? "").trim();
    const profileFullName = String(profile?.full_name ?? user.user_metadata?.full_name ?? "").trim();
    const emailPrefix = String(user.email ?? "").split("@")[0]?.trim();
    const businessName =
      profileBusinessName ||
      metadataBusinessName ||
      (profileFullName ? `${profileFullName}'s business` : "") ||
      (emailPrefix ? `${emailPrefix}'s business` : "") ||
      "My business";

    let businessInsert = await adminClient
      .from("businesses")
      .insert({
        owner_id: user.id,
        name: businessName,
        referral_code: generateReferralCode(businessName, user.id),
        billing_plan: "free",
        billing_status: "free",
      })
      .select("id, owner_id, name, phone, brand_color, currency, created_at, referral_code, referral_credit_days, referred_by_business_id, billing_provider, billing_plan, billing_status, billing_provider_reference, billing_provider_session_reference, billing_last_paid_at, billing_current_period_starts_at, billing_current_period_ends_at")
      .single();

    let errorMessage = businessInsert.error?.message?.toLowerCase() ?? "";

    if (businessInsert.error && (errorMessage.includes("column") || errorMessage.includes("does not exist"))) {
      businessInsert = await adminClient
        .from("businesses")
        .insert({
          owner_id: user.id,
          name: businessName,
          referral_code: generateReferralCode(businessName, user.id),
        })
        .select("id, owner_id, name, phone, brand_color, currency, created_at, referral_code, referral_credit_days, referred_by_business_id, billing_provider, billing_plan, billing_status, billing_provider_reference, billing_provider_session_reference, billing_last_paid_at, billing_current_period_starts_at, billing_current_period_ends_at")
        .single();
      errorMessage = businessInsert.error?.message?.toLowerCase() ?? "";
    }

    if (businessInsert.error && (errorMessage.includes("column") || errorMessage.includes("does not exist"))) {
      businessInsert = await adminClient
        .from("businesses")
        .insert({
          owner_id: user.id,
          name: businessName,
        })
        .select("id, owner_id, name, phone, brand_color, currency, created_at")
        .single();
    }

    if (businessInsert.data?.id) {
      resolvedBusinessId = businessInsert.data.id;
      resolvedRole = "owner";
      business = businessInsert.data;
    }
  }

  if (!resolvedBusinessId || !business) {
    return null;
  }

  await adminClient.from("profiles").upsert({
    id: user.id,
    business_id: resolvedBusinessId,
    full_name: profile?.full_name ?? user.user_metadata?.full_name ?? null,
    email: profile?.email ?? user.email ?? null,
    business_name: profile?.business_name ?? business.name ?? null,
  });

  const membershipInsert = await adminClient.from("business_members").insert({
    business_id: resolvedBusinessId,
    user_id: user.id,
    role: resolvedRole ?? "owner",
    invited_by: user.id,
  });

  const membershipErrorMessage = membershipInsert.error?.message?.toLowerCase() ?? "";

  if (membershipInsert.error && !membershipErrorMessage.includes("duplicate key")) {
    // Ignore repair failure here; business context is already resolved.
  }

  return {
    ...context,
    businessId: resolvedBusinessId,
    business,
    membershipRole: resolvedRole,
    isBusinessOwner: Boolean(business.owner_id && business.owner_id === user.id),
  };
}

async function getDashboardActionContextFromHint(hintedBusinessId: string) {
  const context = await getViewerContext();

  if (context.businessId || !context.user || !hintedBusinessId) {
    return context.businessId ? context : null;
  }

  const normalizedBusinessId = hintedBusinessId.trim();

  if (!normalizedBusinessId) {
    return null;
  }

  const { data: ownedBusiness } = await adminClient
    .from("businesses")
    .select("id, owner_id, name, phone, brand_color, currency, created_at, referral_code, referral_credit_days, referred_by_business_id, billing_provider, billing_plan, billing_status, billing_provider_reference, billing_provider_session_reference, billing_last_paid_at, billing_current_period_starts_at, billing_current_period_ends_at")
    .eq("id", normalizedBusinessId)
    .eq("owner_id", context.user.id)
    .maybeSingle();

  if (ownedBusiness) {
    await adminClient.from("profiles").upsert({
      id: context.user.id,
      business_id: normalizedBusinessId,
      email: context.user.email ?? null,
      full_name: context.user.user_metadata?.full_name ?? null,
    });

    const membershipInsert = await adminClient.from("business_members").insert({
      business_id: normalizedBusinessId,
      user_id: context.user.id,
      role: "owner",
      invited_by: context.user.id,
    });

    if (membershipInsert.error && !membershipInsert.error.message.toLowerCase().includes("duplicate key")) {
      // Ignore repair failure and still allow the owned business context.
    }

    return {
      ...context,
      businessId: normalizedBusinessId,
      business: ownedBusiness,
      membershipRole: "owner",
      isBusinessOwner: true,
    };
  }

  const { data: membership } = await adminClient
    .from("business_members")
    .select("business_id, role")
    .eq("business_id", normalizedBusinessId)
    .eq("user_id", context.user.id)
    .maybeSingle();

  if (!membership?.business_id) {
    return null;
  }

  const { data: business } = await adminClient
    .from("businesses")
    .select("id, owner_id, name, phone, brand_color, currency, created_at, referral_code, referral_credit_days, referred_by_business_id, billing_provider, billing_plan, billing_status, billing_provider_reference, billing_provider_session_reference, billing_last_paid_at, billing_current_period_starts_at, billing_current_period_ends_at")
    .eq("id", normalizedBusinessId)
    .maybeSingle();

  if (!business) {
    return null;
  }

  await adminClient
    .from("profiles")
    .update({ business_id: normalizedBusinessId })
    .eq("id", context.user.id);

  return {
    ...context,
    businessId: normalizedBusinessId,
    business,
    membershipRole: membership.role ?? context.membershipRole ?? null,
    isBusinessOwner: Boolean(business.owner_id && business.owner_id === context.user.id),
  };
}

function getCurrentMonthWindow() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

async function getCurrentMonthOrderCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  businessId: string
) {
  const { start, end } = getCurrentMonthWindow();
  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId)
    .gte("created_at", start)
    .lt("created_at", end);

  return count ?? 0;
}

async function getOrderWriteAccess(
  context: NonNullable<Awaited<ReturnType<typeof getDashboardActionContext>>>,
  mode: "create" | "edit"
) {
  if (context.isAdmin) {
    return {
      allowed: true,
      message: null,
      orderCountThisMonth: 0,
      monthlyOrderLimit: null as number | null,
    };
  }

  const orderCountThisMonth = await getCurrentMonthOrderCount(context.supabase, context.businessId);
  const monthlyOrderLimit = getMonthlyOrderLimit(context.business);

  if (mode === "create" && !canCreateOrders(context.business, orderCountThisMonth)) {
    return {
      allowed: false,
      message: `Free includes ${monthlyOrderLimit ?? 30} orders per month. Upgrade to Starter for unlimited orders.`,
      orderCountThisMonth,
      monthlyOrderLimit,
    };
  }

  return {
    allowed: true,
    message: null,
    orderCountThisMonth,
    monthlyOrderLimit,
  };
}

function validateOrderFieldsForPlan(
  business: NonNullable<Awaited<ReturnType<typeof getDashboardActionContext>>>["business"],
  payload: {
    stage: string;
    paymentStatus: string;
    addFollowUp?: boolean;
  }
) {
  const allowedStages = getAllowedOrderStages(business);
  const allowedPaymentStatuses = getAllowedPaymentStatuses(business);

  if (!allowedStages.includes(payload.stage as any)) {
    return {
      valid: false,
      error: canUsePlanCapability("dispatchTracking", business)
        ? "Stage is not allowed."
        : "Dispatch tracking starts on Growth. Upgrade to unlock packing, dispatch, and delivery stages.",
    };
  }

  if (!allowedPaymentStatuses.includes(payload.paymentStatus as any)) {
    return {
      valid: false,
      error: "Payment tracking starts on Starter. Free orders are saved as unpaid only.",
    };
  }

  if (payload.addFollowUp && !canUsePlanCapability("followUpReminders", business)) {
    return {
      valid: false,
      error: "Follow-up reminders start on Starter.",
    };
  }

  return { valid: true, error: null };
}

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

async function getCurrentTeamMemberCount(businessId: string) {
  const { count, error } = await adminClient
    .from("business_members")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId)
    .eq("role", "member");

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

async function getCatalogProductById(
  supabase: Awaited<ReturnType<typeof createClient>>,
  businessId: string,
  catalogProductId: string
) {
  const { data, error } = await supabase
    .from("catalog_products")
    .select("id, name, price, stock_count, is_active")
    .eq("business_id", businessId)
    .eq("id", catalogProductId)
    .maybeSingle();

  return { product: (data as CatalogProductRecord | null) ?? null, error };
}

async function adjustCatalogStock(
  supabase: Awaited<ReturnType<typeof createClient>>,
  businessId: string,
  catalogProductId: string,
  delta: number
) {
  const { product, error } = await getCatalogProductById(supabase, businessId, catalogProductId);

  if (error) return { error };
  if (!product) return { error: new Error("Selected catalog product was not found.") };

  const nextStock = Number(product.stock_count ?? 0) + delta;

  if (nextStock < 0) {
    return { error: new Error(`${product.name} is out of stock.`) };
  }

  const { error: updateError } = await supabase
    .from("catalog_products")
    .update({ stock_count: nextStock })
    .eq("business_id", businessId)
    .eq("id", catalogProductId);

  return { error: updateError };
}

async function upsertCustomerForOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  businessId: string,
  customerName: string,
  phone: string,
  deliveryArea: string
) {
  const normalizedCustomerName = normalizeText(customerName);

  const { data: phoneMatches, error: phoneMatchesError } = await supabase
    .from("customers")
    .select("id, name")
    .eq("business_id", businessId)
    .eq("phone", phone);

  if (phoneMatchesError) return { customerId: null, error: phoneMatchesError };

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

    if (updateCustomerError) return { customerId: null, error: updateCustomerError };
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
        customerId: null,
        error: newCustomerError ?? new Error("Unable to create customer."),
      };
    }

    customerId = newCustomer.id;
  }

  return { customerId, error: null };
}

async function createOrderWithExistingFlow(
  supabase: Awaited<ReturnType<typeof createClient>>,
  businessId: string,
  payload: CreateOrderPayload
): Promise<ActionState> {
  const customerName = payload.customerName.trim();
  const phone = payload.phone.trim();
  const deliveryArea = payload.deliveryArea.trim();
  const stage = payload.stage.trim() || "new_order";
  const paymentStatus = payload.paymentStatus.trim() || "unpaid";
  const notes = payload.notes.trim();
  const addFollowUp = Boolean(payload.addFollowUp);
  const followUpDateRaw = payload.followUpDateRaw?.trim() ?? "";
  const followUpNote = payload.followUpNote?.trim() ?? "";
  const catalogProductId = payload.catalogProductId?.trim() ?? "";

  if (!customerName) return { success: false, error: "Customer name is required." };
  if (!phone) return { success: false, error: "Phone number is required." };

  let resolvedProductName = payload.productName.trim();
  let resolvedAmount = Number(payload.amount ?? 0);

  if (catalogProductId) {
    const { product, error: catalogError } = await getCatalogProductById(supabase, businessId, catalogProductId);

    if (catalogError) return { success: false, error: catalogError.message };
    if (!product) return { success: false, error: "Selected catalog product was not found." };
    if (!product.is_active) return { success: false, error: "Selected catalog product is hidden." };
    if (Number(product.stock_count ?? 0) < 1) return { success: false, error: `${product.name} is out of stock.` };

    resolvedProductName = product.name;
    resolvedAmount = Number(product.price ?? 0);
  }

  if (!resolvedProductName) return { success: false, error: "Product is required." };
  if (!Number.isFinite(resolvedAmount) || resolvedAmount < 0) {
    return { success: false, error: "Amount must be a valid number." };
  }

  const { customerId, error: customerError } = await upsertCustomerForOrder(
    supabase,
    businessId,
    customerName,
    phone,
    deliveryArea
  );

  if (customerError || !customerId) {
    return { success: false, error: customerError?.message || "Unable to link customer." };
  }

  const { data: createdOrder, error: orderError } = await supabase
    .from("orders")
    .insert({
      business_id: businessId,
      customer_id: customerId,
      catalog_product_id: catalogProductId || null,
      product_name: resolvedProductName,
      amount: resolvedAmount,
      delivery_area: deliveryArea,
      stage,
      payment_status: paymentStatus,
      notes,
      tags: payload.tags?.length ? payload.tags : null,
    })
    .select("id")
    .single();

  if (orderError || !createdOrder) {
    return { success: false, error: orderError?.message || "Unable to create order." };
  }

  if (catalogProductId) {
    const { error: stockError } = await adjustCatalogStock(supabase, businessId, catalogProductId, -1);

    if (stockError) {
      await supabase.from("orders").delete().eq("business_id", businessId).eq("id", createdOrder.id);
      return { success: false, error: stockError.message };
    }
  }

  if (addFollowUp) {
    const dueAt = followUpDateRaw
      ? new Date(followUpDateRaw).toISOString()
      : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error: followUpError } = await supabase.from("follow_ups").insert({
      business_id: businessId,
      order_id: createdOrder.id,
      due_at: dueAt,
      note: followUpNote || `Follow up with ${customerName} about ${resolvedProductName}`,
      completed: false,
    });

    if (followUpError) return { success: false, error: followUpError.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/customers");
  revalidatePath("/dashboard/follow-ups");
  revalidatePath("/dashboard/analytics");

  return { success: true, error: null };
}

export async function createOrderAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const hintedBusinessId = String(formData.get("businessId") || "").trim();
  const context = (await getDashboardActionContext()) ?? (await getDashboardActionContextFromHint(hintedBusinessId));
  if (!context) return { success: false, error: "Business not found." };
  const orderAccess = await getOrderWriteAccess(context, "create");
  if (!orderAccess.allowed) return { success: false, error: orderAccess.message };
  const { supabase, businessId } = context;

  const customerName = String(formData.get("customerName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const productName = String(formData.get("product") || "").trim();
  const catalogProductId = String(formData.get("catalogProductId") || "").trim();
  const amount = Number(formData.get("amount") || 0);
  const deliveryArea = String(formData.get("area") || "").trim();
  const stage = String(formData.get("stage") || "new_order").trim();
  const paymentStatus = String(formData.get("paymentStatus") || "unpaid").trim();
  const notes = String(formData.get("notes") || "").trim();
  const addFollowUp = String(formData.get("addFollowUp") || "") === "on";
  const followUpDateRaw = String(formData.get("followUpDate") || "").trim();
  const followUpNote = String(formData.get("followUpNote") || "").trim();
  const validation = validateOrderFieldsForPlan(context.business, {
    stage,
    paymentStatus,
    addFollowUp,
  });

  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  return createOrderWithExistingFlow(supabase, businessId, {
    customerName,
    phone,
    productName,
    catalogProductId,
    amount,
    deliveryArea,
    stage,
    paymentStatus,
    notes,
    addFollowUp,
    followUpDateRaw,
    followUpNote,
  });
}

export async function createOrderForBusinessAction(
  businessId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const normalizedBusinessId = businessId.trim();

  if (!normalizedBusinessId) {
    return { success: false, error: "Business not found." };
  }

  const { data: business, error: businessError } = await adminClient
    .from("businesses")
    .select("id, owner_id, name, phone, brand_color, currency, created_at, referral_code, referral_credit_days, referred_by_business_id, billing_provider, billing_plan, billing_status, billing_provider_reference, billing_provider_session_reference, billing_last_paid_at, billing_current_period_starts_at, billing_current_period_ends_at")
    .eq("id", normalizedBusinessId)
    .maybeSingle();

  if (businessError || !business) {
    return { success: false, error: "Business not found." };
  }

  const customerName = String(formData.get("customerName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const productName = String(formData.get("product") || "").trim();
  const catalogProductId = String(formData.get("catalogProductId") || "").trim();
  const amount = Number(formData.get("amount") || 0);
  const deliveryArea = String(formData.get("area") || "").trim();
  const stage = String(formData.get("stage") || "new_order").trim();
  const paymentStatus = String(formData.get("paymentStatus") || "unpaid").trim();
  const notes = String(formData.get("notes") || "").trim();
  const addFollowUp = String(formData.get("addFollowUp") || "") === "on";
  const followUpDateRaw = String(formData.get("followUpDate") || "").trim();
  const followUpNote = String(formData.get("followUpNote") || "").trim();

  const { count } = await adminClient
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("business_id", normalizedBusinessId)
    .gte("created_at", getCurrentMonthWindow().start)
    .lt("created_at", getCurrentMonthWindow().end);

  if (!canCreateOrders(business, count ?? 0)) {
    const monthlyOrderLimit = getMonthlyOrderLimit(business);
    return {
      success: false,
      error: `Free includes ${monthlyOrderLimit ?? 30} orders per month. Upgrade to Starter for unlimited orders.`,
    };
  }

  const validation = validateOrderFieldsForPlan(business, {
    stage,
    paymentStatus,
    addFollowUp,
  });

  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  return createOrderWithExistingFlow(adminClient as any, normalizedBusinessId, {
    customerName,
    phone,
    productName,
    catalogProductId,
    amount,
    deliveryArea,
    stage,
    paymentStatus,
    notes,
    addFollowUp,
    followUpDateRaw,
    followUpNote,
  });
}

export async function updateOrderStageAction(id: string, stage: string) {
  const context = await getDashboardActionContext();
  if (!context) throw new Error("Business not found.");
  if (!context.isAdmin) {
    const validation = validateOrderFieldsForPlan(context.business, {
      stage,
      paymentStatus: "unpaid",
    });

    if (!validation.valid) {
      throw new Error(validation.error ?? "Stage is not allowed.");
    }
  }
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
  const context = await getDashboardActionContext();
  if (!context) return { success: false, error: "Business not found." };
  const orderAccess = await getOrderWriteAccess(context, "edit");
  if (!orderAccess.allowed) return { success: false, error: orderAccess.message };
  const { supabase, businessId } = context;

  const customerName = String(formData.get("customerName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const productName = String(formData.get("product") || "").trim();
  const catalogProductId = String(formData.get("catalogProductId") || "").trim();
  const amount = Number(formData.get("amount") || 0);
  const deliveryArea = String(formData.get("area") || "").trim();
  const stage = String(formData.get("stage") || "new_order").trim();
  const paymentStatus = String(formData.get("paymentStatus") || "unpaid").trim();
  const notes = String(formData.get("notes") || "").trim();
  const addFollowUp = String(formData.get("addFollowUp") || "") === "on";
  const followUpDateRaw = String(formData.get("followUpDate") || "").trim();
  const followUpNote = String(formData.get("followUpNote") || "").trim();
  const validation = validateOrderFieldsForPlan(context.business, {
    stage,
    paymentStatus,
    addFollowUp,
  });

  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  if (!customerName) return { success: false, error: "Customer name is required." };
  if (!phone) return { success: false, error: "Phone number is required." };
  let resolvedProductName = productName;
  let resolvedAmount = amount;

  if (catalogProductId) {
    const { product, error: catalogError } = await getCatalogProductById(supabase, businessId, catalogProductId);

    if (catalogError) return { success: false, error: catalogError.message };
    if (!product) return { success: false, error: "Selected catalog product was not found." };
    if (!product.is_active) return { success: false, error: "Selected catalog product is hidden." };

    resolvedProductName = product.name;
    resolvedAmount = Number(product.price ?? 0);
  }

  if (!resolvedProductName) return { success: false, error: "Product is required." };
  if (!Number.isFinite(resolvedAmount) || resolvedAmount < 0) {
    return { success: false, error: "Amount must be a valid number." };
  }

  const { data: currentOrder, error: currentOrderError } = await supabase
    .from("orders")
    .select("id, customer_id, catalog_product_id")
    .eq("business_id", businessId)
    .eq("id", id)
    .single();

  if (currentOrderError || !currentOrder) {
    return { success: false, error: currentOrderError?.message || "Order not found." };
  }

  const previousCatalogProductId = currentOrder.catalog_product_id ?? null;
  if (catalogProductId && previousCatalogProductId !== catalogProductId) {
    const { product: nextCatalogProduct, error: nextCatalogProductError } = await getCatalogProductById(
      supabase,
      businessId,
      catalogProductId
    );

    if (nextCatalogProductError) return { success: false, error: nextCatalogProductError.message };
    if (!nextCatalogProduct) return { success: false, error: "Selected catalog product was not found." };
    if (Number(nextCatalogProduct.stock_count ?? 0) < 1) {
      return { success: false, error: `${nextCatalogProduct.name} is out of stock.` };
    }
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
      catalog_product_id: catalogProductId || null,
      product_name: resolvedProductName,
      amount: resolvedAmount,
      delivery_area: deliveryArea,
      stage,
      payment_status: paymentStatus,
      notes,
    })
    .eq("business_id", businessId)
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  if (previousCatalogProductId !== (catalogProductId || null)) {
    if (catalogProductId) {
      const { error: decrementError } = await adjustCatalogStock(supabase, businessId, catalogProductId, -1);
      if (decrementError) return { success: false, error: decrementError.message };
    }

    if (previousCatalogProductId) {
      const { error: restoreError } = await adjustCatalogStock(supabase, businessId, previousCatalogProductId, 1);
      if (restoreError) return { success: false, error: restoreError.message };
    }
  }

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
          note: followUpNote || `Follow up with ${customerName} about ${resolvedProductName}`,
        })
        .eq("business_id", businessId)
        .eq("id", existingFollowUp.id);

      if (updateFollowUpError) return { success: false, error: updateFollowUpError.message };
    } else {
      const { error: createFollowUpError } = await supabase.from("follow_ups").insert({
        business_id: businessId,
        order_id: id,
        due_at: dueAt,
        note: followUpNote || `Follow up with ${customerName} about ${resolvedProductName}`,
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
  const context = await getDashboardActionContext();
  if (!context) return { success: false, error: "Business not found." };
  if (!context.isAdmin && !canUsePlanCapability("customerProfiles", context.business)) {
    return { success: false, error: "Customer profiles start on Starter." };
  }
  const { supabase, businessId } = context;

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
  const context = await getDashboardActionContext();
  if (!context) return { success: false, error: "Business not found." };
  if (!context.isAdmin && !canUsePlanCapability("followUpReminders", context.business)) {
    return { success: false, error: "Follow-up reminders start on Starter." };
  }
  const { supabase, businessId } = context;

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

export async function createCatalogProductAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const context = await getDashboardActionContext();
  if (!context) return { success: false, error: "Business not found." };
  if (!context.isAdmin && !canUsePlanCapability("catalog", context.business)) {
    return { success: false, error: "Catalog access starts on Growth." };
  }
  const { supabase, businessId } = context;

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  const uploadedImageUrl = String(formData.get("uploadedImageUrl") || "").trim();
  const price = Number(formData.get("price") || 0);
  const stockCount = Number(formData.get("stockCount") || 0);

  if (!name) return { success: false, error: "Product name is required." };
  if (!Number.isFinite(price) || price < 0) return { success: false, error: "Price must be valid." };
  if (!Number.isFinite(stockCount) || stockCount < 0) return { success: false, error: "Stock count must be valid." };

  const { error } = await supabase.from("catalog_products").insert({
    business_id: businessId,
    name,
    description: description || null,
    image_url: uploadedImageUrl || imageUrl || null,
    price,
    stock_count: stockCount,
    is_active: true,
  });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("schema cache") || message.includes("could not find the table")) {
      return {
        success: false,
        error: "Catalog database setup is not applied yet. Run the latest Supabase migration, then try again.",
      };
    }

    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/catalog");
  revalidatePath("/dashboard");

  return { success: true, error: null };
}

export async function updateCatalogStockAction(id: string, formData: FormData) {
  const context = await getDashboardActionContext();
  if (!context) return;
  if (!context.isAdmin && !canUsePlanCapability("catalog", context.business)) return;
  const { supabase, businessId } = context;

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
  const context = await getDashboardActionContext();
  if (!context) throw new Error("Business not found.");
  if (!context.isAdmin && !canUsePlanCapability("followUpReminders", context.business)) {
    throw new Error("Follow-up reminders start on Starter.");
  }
  const { supabase, businessId } = context;

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

export async function saveAiOrderCaptureAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const context = await getDashboardActionContext();
  if (!context) return { success: false, error: "Business not found." };
  if (!context.isAdmin) {
    return { success: false, error: "AI capture is not part of the current launch plans." };
  }
  const { supabase, businessId } = context;

  const customerName = String(formData.get("customerName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const productName = String(formData.get("productName") || "").trim();
  const quantity = String(formData.get("quantity") || "").trim();
  const variant = String(formData.get("variant") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const paymentStatus = String(formData.get("paymentStatus") || "unpaid").trim();
  const notes = String(formData.get("notes") || "").trim();
  const amount = Number(formData.get("amount") || 0);
  const addFollowUp = String(formData.get("addFollowUp") || "") === "on";
  const rawChat = String(formData.get("rawChat") || "").trim();

  const stage = paymentStatus === "paid" || paymentStatus === "cod" ? "paid" : "waiting_payment";
  const metadataLines = [
    quantity ? `Quantity: ${quantity}` : null,
    variant ? `Variant: ${variant}` : null,
    "Source: ai_chat_capture",
    rawChat ? `Captured chat:\n${rawChat.slice(0, 1200)}` : null,
  ].filter(Boolean);

  const combinedNotes = [notes, ...metadataLines].filter(Boolean).join("\n\n");

  return createOrderWithExistingFlow(supabase, businessId, {
    customerName,
    phone,
    productName,
    amount,
    deliveryArea: location,
    stage,
    paymentStatus,
    notes: combinedNotes,
    addFollowUp,
    followUpNote: addFollowUp ? `Follow up with ${customerName} from AI chat capture` : "",
    tags: ["ai_chat_capture"],
  });
}

export async function addTeamMemberAction(formData: FormData) {
  const context = await getDashboardActionContext();

  if (!context || !context.businessId || !context.user) {
    redirect("/dashboard/team?team_status=error&team_message=Business%20not%20found");
  }

  if (!context.isAdmin && !context.isBusinessOwner) {
    redirect("/dashboard/team?team_status=error&team_message=Only%20the%20business%20owner%20can%20manage%20team%20members");
  }

  const teamMemberLimit = context.isAdmin
    ? getTeamMemberLimit({ billing_plan: "business", billing_status: "active" })
    : getTeamMemberLimit(context.business);

  if (teamMemberLimit < 1) {
    redirect("/dashboard/team?team_status=error&team_message=Team%20members%20start%20on%20Growth");
  }

  const email = String(formData.get("email") || "").trim().toLowerCase();

  if (!email) {
    redirect("/dashboard/team?team_status=error&team_message=Team%20member%20email%20is%20required");
  }

  try {
    const currentCount = await getCurrentTeamMemberCount(context.businessId);

    if (currentCount >= teamMemberLimit) {
      redirect(
        `/dashboard/team?team_status=error&team_message=${encodeURIComponent(
          `Your current plan supports up to ${teamMemberLimit} team members.`
        )}`
      );
    }

    const { data: memberProfile, error: memberProfileError } = await adminClient
      .from("profiles")
      .select("id, business_id, full_name, email")
      .eq("email", email)
      .maybeSingle();

    if (memberProfileError) {
      redirect(
        `/dashboard/team?team_status=error&team_message=${encodeURIComponent(memberProfileError.message)}`
      );
    }

    if (!memberProfile?.id) {
      redirect("/dashboard/team?team_status=error&team_message=That%20user%20needs%20to%20sign%20up%20first");
    }

    if (memberProfile.id === context.business?.owner_id) {
      redirect("/dashboard/team?team_status=error&team_message=The%20business%20owner%20is%20already%20part%20of%20this%20team");
    }

    const { data: existingMembership } = await adminClient
      .from("business_members")
      .select("business_id, role")
      .eq("user_id", memberProfile.id)
      .maybeSingle();

    if (existingMembership?.business_id === context.businessId) {
      redirect("/dashboard/team?team_status=error&team_message=That%20user%20is%20already%20on%20your%20team");
    }

    if (existingMembership?.business_id && existingMembership.business_id !== context.businessId) {
      redirect("/dashboard/team?team_status=error&team_message=That%20user%20already%20belongs%20to%20another%20business");
    }

    const { error: profileUpdateError } = await adminClient
      .from("profiles")
      .update({ business_id: context.businessId })
      .eq("id", memberProfile.id);

    if (profileUpdateError) {
      redirect(
        `/dashboard/team?team_status=error&team_message=${encodeURIComponent(profileUpdateError.message)}`
      );
    }

    const { error: membershipUpsertError } = await adminClient
      .from("business_members")
      .upsert(
        {
          business_id: context.businessId,
          user_id: memberProfile.id,
          role: "member",
          invited_by: context.user.id,
        },
        { onConflict: "user_id" }
      );

    if (membershipUpsertError) {
      redirect(
        `/dashboard/team?team_status=error&team_message=${encodeURIComponent(membershipUpsertError.message)}`
      );
    }

    revalidatePath("/dashboard/team");
    redirect("/dashboard/team?team_status=success&team_message=Team%20member%20added%20successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to add team member.";
    redirect(`/dashboard/team?team_status=error&team_message=${encodeURIComponent(message)}`);
  }
}

export async function removeTeamMemberAction(formData: FormData) {
  const context = await getDashboardActionContext();

  if (!context || !context.businessId || !context.user) {
    redirect("/dashboard/team?team_status=error&team_message=Business%20not%20found");
  }

  if (!context.isAdmin && !context.isBusinessOwner) {
    redirect("/dashboard/team?team_status=error&team_message=Only%20the%20business%20owner%20can%20manage%20team%20members");
  }

  const memberId = String(formData.get("memberId") || "").trim();

  if (!memberId) {
    redirect("/dashboard/team?team_status=error&team_message=Team%20member%20not%20found");
  }

  if (memberId === context.business?.owner_id) {
    redirect("/dashboard/team?team_status=error&team_message=The%20business%20owner%20cannot%20be%20removed");
  }

  const { data: membership, error: membershipError } = await adminClient
    .from("business_members")
    .select("business_id, role")
    .eq("user_id", memberId)
    .maybeSingle();

  if (membershipError) {
    redirect(`/dashboard/team?team_status=error&team_message=${encodeURIComponent(membershipError.message)}`);
  }

  if (!membership || membership.business_id !== context.businessId) {
    redirect("/dashboard/team?team_status=error&team_message=That%20user%20is%20not%20on%20your%20team");
  }

  const { error: deleteMembershipError } = await adminClient
    .from("business_members")
    .delete()
    .eq("user_id", memberId)
    .eq("business_id", context.businessId);

  if (deleteMembershipError) {
    redirect(
      `/dashboard/team?team_status=error&team_message=${encodeURIComponent(deleteMembershipError.message)}`
    );
  }

  const { error: profileUpdateError } = await adminClient
    .from("profiles")
    .update({ business_id: null })
    .eq("id", memberId)
    .eq("business_id", context.businessId);

  if (profileUpdateError) {
    redirect(
      `/dashboard/team?team_status=error&team_message=${encodeURIComponent(profileUpdateError.message)}`
    );
  }

  revalidatePath("/dashboard/team");
  redirect("/dashboard/team?team_status=success&team_message=Team%20member%20removed");
}
