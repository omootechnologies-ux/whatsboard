import { createClient } from "@/lib/supabase/server";

function matchesMissingRelationError(message?: string) {
  const value = (message || "").toLowerCase();
  return (
    value.includes("schema cache") ||
    value.includes("could not find the table") ||
    value.includes('relation "public.') ||
    value.includes("relation ") && value.includes(" does not exist")
  );
}

function matchesMissingOptionalFieldError(message?: string) {
  const value = (message || "").toLowerCase();
  return (
    matchesMissingRelationError(message) ||
    value.includes("column") ||
    value.includes("does not exist")
  );
}

export async function getViewerContext() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return {
      supabase,
      user: null,
      businessId: null,
      profile: null,
      business: null,
      billingTransaction: null,
      isAdmin: false,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_id, full_name, email, is_admin")
    .eq("id", user.id)
    .single();

  let business = null;

  if (profile?.business_id) {
    const { data: baseBusinessData } = await supabase
      .from("businesses")
      .select("id, name, phone, brand_color, currency, created_at")
      .eq("id", profile.business_id)
      .single();

    business = baseBusinessData ?? null;

    const { data: extendedBusinessData, error: extendedBusinessError } = await supabase
      .from("businesses")
      .select("referral_code, referral_credit_days, referred_by_business_id, billing_provider, billing_plan, billing_status, billing_provider_reference, billing_provider_session_reference, billing_last_paid_at, billing_current_period_starts_at, billing_current_period_ends_at")
      .eq("id", profile.business_id)
      .maybeSingle();

    if (!extendedBusinessError && extendedBusinessData && business) {
      business = {
        ...business,
        ...extendedBusinessData,
      };
    }
  }

  let billingTransaction = null;

  if (profile?.business_id) {
    const { data: billingTransactionData, error: billingTransactionError } = await supabase
      .from("billing_transactions")
      .select("id, plan_key, status, amount, currency, checkout_url, session_reference, payment_reference, paid_at, period_starts_at, period_ends_at, created_at")
      .eq("business_id", profile.business_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!billingTransactionError || !matchesMissingOptionalFieldError(billingTransactionError.message)) {
      billingTransaction = billingTransactionData ?? null;
    }
  }

  return {
    supabase,
    user,
    businessId: profile?.business_id ?? null,
    profile,
    business,
    billingTransaction,
    isAdmin: profile?.is_admin ?? false,
  };
}

export async function getDashboardData() {
  const { supabase, businessId } = await getViewerContext();

  if (!businessId) {
    return { orders: [], metrics: null };
  }

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id,
      product_name,
      amount,
      delivery_area,
      stage,
      payment_status,
      updated_at,
      created_at,
      assigned_staff,
      notes,
      tags,
      customers(id, name, phone)
    `)
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  const normalizedOrders = (orders ?? []).map((item: any) => {
    const customer = Array.isArray(item.customers) ? item.customers[0] : item.customers;

    return {
      id: item.id,
      customerId: customer?.id ?? "",
      customerName: customer?.name ?? "Unknown",
      phone: customer?.phone ?? "",
      product: item.product_name,
      amount: Number(item.amount),
      area: item.delivery_area ?? "",
      stage: item.stage,
      paymentStatus: item.payment_status,
      updatedAt: item.updated_at,
      createdAt: item.created_at,
      assignedStaff: item.assigned_staff ?? undefined,
      notes: item.notes ?? undefined,
      tags: item.tags ?? []
    };
  });

  const paidOrders = normalizedOrders.filter((o) => o.paymentStatus === "paid").length;
  const unpaidOrders = normalizedOrders.filter((o) => o.paymentStatus === "unpaid").length;
  const unpaidValue = normalizedOrders
    .filter((o) => o.paymentStatus === "unpaid")
    .reduce((sum, o) => sum + o.amount, 0);

  const avgOrderValue = normalizedOrders.length
    ? normalizedOrders.reduce((sum, o) => sum + o.amount, 0) / normalizedOrders.length
    : 0;

  return {
    orders: normalizedOrders,
    metrics: {
      totalOrders: normalizedOrders.length,
      paidOrders,
      unpaidOrders,
      unpaidValue,
      avgOrderValue
    }
  };
}

export async function getCustomersData() {
  const { supabase, businessId } = await getViewerContext();

  if (!businessId) return [];

  const { data } = await supabase
    .from("customers")
    .select("id, name, phone, area, status, created_at, orders(amount, created_at)")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((item: any) => {
    const totalSpent = (item.orders ?? []).reduce(
      (sum: number, order: any) => sum + Number(order.amount),
      0
    );

    const orderCount = item.orders?.length ?? 0;
    const lastOrderDate = item.orders?.[0]?.created_at ?? item.created_at;

    return {
      id: item.id,
      name: item.name,
      phone: item.phone,
      area: item.area ?? "",
      totalSpent,
      orderCount,
      lastOrderDate,
      isRepeat: orderCount > 1,
      status: item.status
    };
  });
}

export async function getFollowUpsData() {
  const { supabase, businessId } = await getViewerContext();

  if (!businessId) return [];

  const { data } = await supabase
    .from("follow_ups")
    .select(`
      id,
      due_at,
      note,
      completed,
      orders(
        id,
        product_name,
        delivery_area,
        customers(name, phone)
      )
    `)
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((item: any) => {
    const order = Array.isArray(item.orders) ? item.orders[0] : item.orders;
    const customer = Array.isArray(order?.customers) ? order.customers[0] : order?.customers;

    return {
      id: item.id,
      dueAt: item.due_at,
      note: item.note,
      completed: item.completed,
      orderId: order?.id ?? "",
      product: order?.product_name ?? "",
      area: order?.delivery_area ?? "",
      customerName: customer?.name ?? "Unknown",
      phone: customer?.phone ?? ""
    };
  });
}

export async function getAccountData() {
  const { user, profile, business, billingTransaction, isAdmin } = await getViewerContext();

  return {
    user,
    profile,
    business,
    billingTransaction,
    isAdmin
  };
}

export async function getReferralProgramData() {
  const { supabase, businessId, business } = await getViewerContext();

  if (!businessId) {
    return { business: null, referralEvents: [], setupRequired: false };
  }

  const { data: referralEvents, error } = await supabase
    .from("referral_events")
    .select("id, referred_email, referral_code, reward_days, status, created_at, converted_at")
    .eq("referrer_business_id", businessId)
    .order("created_at", { ascending: false });

  return {
    business,
    referralEvents: referralEvents ?? [],
    setupRequired: Boolean(error && matchesMissingRelationError(error.message)),
  };
}

export async function getCatalogProductsData() {
  const { supabase, businessId, business } = await getViewerContext();

  if (!businessId) {
    return { business: null, products: [], setupRequired: false };
  }

  const { data: products, error } = await supabase
    .from("catalog_products")
    .select("id, name, description, image_url, price, stock_count, is_active, created_at")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  return {
    business,
    products: (products ?? []).map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description ?? "",
      imageUrl: item.image_url ?? "",
      price: Number(item.price ?? 0),
      stockCount: Number(item.stock_count ?? 0),
      isActive: Boolean(item.is_active),
      createdAt: item.created_at,
    })),
    setupRequired: Boolean(error && matchesMissingRelationError(error.message)),
  };
}
