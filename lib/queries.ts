import { createClient } from "@/lib/supabase/server";
import { isMissingOptionalFieldError } from "@/lib/supabase-errors";

type ViewerBusiness = {
  id: string;
  name: string | null;
  phone: string | null;
  brand_color: string | null;
  currency: string | null;
  created_at: string | null;
  referral_code?: string | null;
  referral_credit_days?: number | null;
  referred_by_business_id?: string | null;
  billing_provider?: string | null;
  billing_plan?: string | null;
  billing_status?: string | null;
  billing_provider_reference?: string | null;
  billing_provider_session_reference?: string | null;
  billing_last_paid_at?: string | null;
  billing_current_period_starts_at?: string | null;
  billing_current_period_ends_at?: string | null;
};

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
    .select("business_id, full_name, email")
    .eq("id", user.id)
    .single();

  let isAdmin = false;

  if (user) {
    const { data: adminProfile, error: adminProfileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (!adminProfileError && adminProfile) {
      isAdmin = Boolean((adminProfile as { is_admin?: boolean | null }).is_admin);
    }
  }

  let business: ViewerBusiness | null = null;

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
    isAdmin,
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
      catalog_product_id,
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
      catalogProductId: item.catalog_product_id ?? undefined,
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
    setupRequired: Boolean(error && isMissingOptionalFieldError(error.message)),
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
    setupRequired: Boolean(error && isMissingOptionalFieldError(error.message)),
  };
}

export async function getOrderCatalogOptions() {
  const { supabase, businessId } = await getViewerContext();

  if (!businessId) return [];

  const { data } = await supabase
    .from("catalog_products")
    .select("id, name, price, stock_count, is_active")
    .eq("business_id", businessId)
    .order("name", { ascending: true });

  return (data ?? []).map((item: any) => ({
    id: item.id,
    name: item.name,
    price: Number(item.price ?? 0),
    stockCount: Number(item.stock_count ?? 0),
    isActive: Boolean(item.is_active),
  }));
}

export async function getAnalyticsData() {
  const [{ orders, metrics }, customers] = await Promise.all([
    getDashboardData(),
    getCustomersData(),
  ]);

  const now = new Date();
  const dailyMap = new Map<string, { day: string; revenue: number; orders: number }>();

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - offset);
    const key = date.toISOString().slice(0, 10);
    dailyMap.set(key, {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      revenue: 0,
      orders: 0,
    });
  }

  const paymentMixMap = new Map<string, number>([
    ["Paid", 0],
    ["Unpaid", 0],
    ["Partial", 0],
    ["COD", 0],
  ]);

  const areaMap = new Map<string, number>();
  const stageMap = new Map<string, number>([
    ["new_order", 0],
    ["waiting_payment", 0],
    ["paid", 0],
    ["packing", 0],
    ["dispatched", 0],
    ["delivered", 0],
  ]);

  for (const order of orders) {
    const orderDateKey = new Date(order.createdAt).toISOString().slice(0, 10);
    const dayBucket = dailyMap.get(orderDateKey);

    if (dayBucket) {
      dayBucket.orders += 1;
      if (order.paymentStatus === "paid" || order.paymentStatus === "cod") {
        dayBucket.revenue += order.amount;
      }
    }

    const paymentLabel =
      order.paymentStatus === "paid"
        ? "Paid"
        : order.paymentStatus === "partial"
        ? "Partial"
        : order.paymentStatus === "cod"
        ? "COD"
        : "Unpaid";
    paymentMixMap.set(paymentLabel, (paymentMixMap.get(paymentLabel) ?? 0) + 1);

    const areaLabel = order.area?.trim() || "Unknown";
    areaMap.set(areaLabel, (areaMap.get(areaLabel) ?? 0) + 1);

    if (stageMap.has(order.stage)) {
      stageMap.set(order.stage, (stageMap.get(order.stage) ?? 0) + 1);
    }
  }

  const revenueData = Array.from(dailyMap.values());
  const paymentMix = Array.from(paymentMixMap.entries())
    .map(([name, value]) => ({ name, value }))
    .filter((entry) => entry.value > 0);
  const areaData = Array.from(areaMap.entries())
    .map(([area, count]) => ({ area, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const bestDay = revenueData.reduce(
    (best, item) => (item.revenue > best.revenue ? item : best),
    revenueData[0] ?? { day: "N/A", revenue: 0, orders: 0 }
  );

  const highestStage = Array.from(stageMap.entries()).reduce(
    (best, entry) => (entry[1] > best[1] ? entry : best),
    ["new_order", 0] as [string, number]
  );

  const repeatCustomers = customers.filter((customer) => customer.isRepeat).length;
  const dormantCustomers = customers.filter((customer) => {
    const lastOrderTime = new Date(customer.lastOrderDate).getTime();
    return Number.isFinite(lastOrderTime) && now.getTime() - lastOrderTime >= 30 * 24 * 60 * 60 * 1000;
  }).length;

  return {
    orders,
    customers,
    metrics,
    revenueData,
    paymentMix,
    areaData,
    summary: {
      bestDay: bestDay.day,
      bestDayRevenue: bestDay.revenue,
      bestDayOrders: bestDay.orders,
      topStage: highestStage[0],
      repeatCustomers,
      dormantCustomers,
    },
  };
}
