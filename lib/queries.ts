import { createClient } from "@/lib/supabase/server";

export async function getViewerContext() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { supabase, user: null, businessId: null, profile: null };

  const { data: profile } = await supabase.from("profiles").select("business_id, full_name").eq("id", user.id).single();
  return { supabase, user, businessId: profile?.business_id ?? null, profile };
}

export async function getDashboardData() {
  const { supabase, businessId } = await getViewerContext();
  if (!businessId) return { orders: [], metrics: null };

  const { data: orders } = await supabase
    .from("orders")
    .select("id, product_name, amount, delivery_area, stage, payment_status, updated_at, created_at, assigned_staff, notes, tags, customers(id, name, phone)")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  const normalizedOrders = (orders ?? []).map((item: any) => ({
    id: item.id,
    customerId: item.customers?.id ?? "",
    customerName: item.customers?.name ?? "Unknown",
    phone: item.customers?.phone ?? "",
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
  }));

  const paidOrders = normalizedOrders.filter((o) => o.paymentStatus === "paid").length;
  const unpaidOrders = normalizedOrders.filter((o) => o.paymentStatus === "unpaid").length;
  const unpaidValue = normalizedOrders.filter((o) => o.paymentStatus === "unpaid").reduce((sum, o) => sum + o.amount, 0);
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
    const totalSpent = (item.orders ?? []).reduce((sum: number, order: any) => sum + Number(order.amount), 0);
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
