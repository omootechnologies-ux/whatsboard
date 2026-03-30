import { createClient } from "@/lib/supabase/server";

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
    const { data: businessData } = await supabase
      .from("businesses")
      .select("id, name, phone, brand_color, currency, created_at")
      .eq("id", profile.business_id)
      .single();

    business = businessData ?? null;
  }

  return {
    supabase,
    user,
    businessId: profile?.business_id ?? null,
    profile,
    business,
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
  const { user, profile, business, isAdmin } = await getViewerContext();

  return {
    user,
    profile,
    business,
    isAdmin
  };
}
