import { createHash, randomBytes } from "crypto";
import { parseBillingPlan, type BillingPlanKey } from "@/lib/billing/plans";
import { formatOrderReference } from "@/lib/display-labels";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { resolveLegacyBusinessContextForRequest } from "@/lib/repositories/supabase-legacy-repository";

export type ReceiptFooterMode =
  | "whatsboard_link"
  | "powered_by_whatsboard"
  | "hidden"
  | "white_label";

type BusinessRow = {
  id: string;
  name: string | null;
  billing_plan: string | null;
};

type OrderRow = {
  id: string;
  business_id: string;
  customer_id: string | null;
  product_name: string | null;
  amount: number | string | null;
  payment_status: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  source: string | null;
  stage: string | null;
  created_at: string;
  updated_at: string;
};

type CustomerRow = {
  id: string;
  name: string | null;
  phone: string | null;
};

type ReceiptRow = {
  id: string;
  business_id: string;
  order_id: string;
  token: string;
  shop_name: string | null;
  shop_logo_url: string | null;
  thank_you_message: string | null;
  footer_mode: ReceiptFooterMode;
  snapshot: Record<string, unknown> | null;
  viewed_count: number | string | null;
  last_viewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ReceiptPlanCapabilities = {
  plan: BillingPlanKey;
  canSetShopName: boolean;
  canSetLogo: boolean;
  canSetThankYouMessage: boolean;
  allowedFooterModes: ReceiptFooterMode[];
};

export type ReceiptIssueInput = {
  orderId: string;
  shopName?: string | null;
  shopLogoUrl?: string | null;
  thankYouMessage?: string | null;
  footerMode?: ReceiptFooterMode | null;
};

export type ReceiptIssueResult = {
  receiptId: string;
  token: string;
  orderId: string;
  publicPath: string;
  whatsappMessage: string;
};

export type ReceiptComposerState = {
  eligible: boolean;
  reason: string | null;
  existingReceipt: {
    id: string;
    token: string;
    publicPath: string;
    viewedCount: number;
    footerMode: ReceiptFooterMode;
    shopName: string | null;
    shopLogoUrl: string | null;
    thankYouMessage: string | null;
  } | null;
  capabilities: ReceiptPlanCapabilities;
  monthlyViews: number;
};

export type PublicReceiptDetails = {
  id: string;
  token: string;
  orderId: string;
  orderReference: string;
  date: string;
  items: Array<{ name: string; qty: number; price: number }>;
  totalAmount: number;
  paymentStatusLabel: "Paid" | "COD";
  paymentReference: string | null;
  shopName: string;
  shopLogoUrl: string | null;
  thankYouMessage: string | null;
  footerMode: ReceiptFooterMode;
  footerLinkPath: string;
  footerText: string | null;
  viewedCount: number;
  customerName: string | null;
  customerPhone: string | null;
};

function asNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function cleanText(value: unknown) {
  const parsed = String(value || "").trim();
  return parsed.length ? parsed : null;
}

function parseItemList(value: string | null | undefined) {
  if (!value) return ["Order item"];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function buildWhatsAppMessage(link: string) {
  return `Asante kwa order yako! 🙏 Hii ni receipt yako: ${link}`;
}

function isReceiptEligible(order: OrderRow) {
  const stage = (order.stage || "").toLowerCase();
  const paymentStatus = (order.payment_status || "").toLowerCase();
  return (
    stage === "delivered" ||
    paymentStatus === "paid" ||
    paymentStatus === "cod"
  );
}

function resolvePaymentStatusLabel(order: OrderRow): "Paid" | "COD" {
  const paymentStatus = (order.payment_status || "").toLowerCase();
  if (paymentStatus === "cod") return "COD";
  if (paymentStatus === "paid") return "Paid";
  const stage = (order.stage || "").toLowerCase();
  return stage === "delivered" ? "COD" : "Paid";
}

function generateReceiptToken() {
  return randomBytes(18).toString("base64url");
}

function safeFooterMode(value: unknown): ReceiptFooterMode {
  const normalized = String(value || "").trim().toLowerCase();
  if (
    normalized === "whatsboard_link" ||
    normalized === "powered_by_whatsboard" ||
    normalized === "hidden" ||
    normalized === "white_label"
  ) {
    return normalized;
  }
  return "whatsboard_link";
}

function getCapabilities(plan: BillingPlanKey): ReceiptPlanCapabilities {
  if (plan === "business") {
    return {
      plan,
      canSetShopName: true,
      canSetLogo: true,
      canSetThankYouMessage: true,
      allowedFooterModes: [
        "whatsboard_link",
        "powered_by_whatsboard",
        "hidden",
        "white_label",
      ],
    };
  }

  if (plan === "growth") {
    return {
      plan,
      canSetShopName: true,
      canSetLogo: true,
      canSetThankYouMessage: true,
      allowedFooterModes: [
        "whatsboard_link",
        "powered_by_whatsboard",
        "hidden",
      ],
    };
  }

  if (plan === "starter") {
    return {
      plan,
      canSetShopName: true,
      canSetLogo: false,
      canSetThankYouMessage: false,
      allowedFooterModes: ["whatsboard_link"],
    };
  }

  return {
    plan,
    canSetShopName: false,
    canSetLogo: false,
    canSetThankYouMessage: false,
    allowedFooterModes: ["whatsboard_link"],
  };
}

function enforceCustomization(
  plan: BillingPlanKey,
  input: ReceiptIssueInput,
  businessName: string,
  current?: ReceiptRow | null,
) {
  const capabilities = getCapabilities(plan);
  const currentShopName = cleanText(current?.shop_name);
  const currentLogo = cleanText(current?.shop_logo_url);
  const currentMessage = cleanText(current?.thank_you_message);
  const currentFooterMode = safeFooterMode(current?.footer_mode);

  const shopName = capabilities.canSetShopName
    ? cleanText(input.shopName) || currentShopName || businessName
    : currentShopName || "WhatsBoard Seller";

  const shopLogoUrl = capabilities.canSetLogo
    ? cleanText(input.shopLogoUrl) || currentLogo
    : null;

  const thankYouMessage = capabilities.canSetThankYouMessage
    ? cleanText(input.thankYouMessage) || currentMessage
    : null;

  const requestedFooterMode = safeFooterMode(input.footerMode || currentFooterMode);
  const footerMode = capabilities.allowedFooterModes.includes(requestedFooterMode)
    ? requestedFooterMode
    : capabilities.allowedFooterModes[0];

  return {
    shopName,
    shopLogoUrl,
    thankYouMessage,
    footerMode,
    capabilities,
  };
}

async function getBusinessById(id: string): Promise<BusinessRow | null> {
  const client = createSupabaseServiceClient();
  const { data, error } = await client
    .from("businesses")
    .select("id,name,billing_plan")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    throw new Error(`Failed to load business: ${JSON.stringify(error)}`);
  }
  return (data || null) as BusinessRow | null;
}

async function getOrderByIdForBusiness(
  businessId: string,
  orderId: string,
): Promise<OrderRow | null> {
  const client = createSupabaseServiceClient();
  const normalizedOrderId = cleanText(orderId);
  if (!normalizedOrderId) return null;

  const { data, error } = await client
    .from("orders")
    .select(
      "id,business_id,customer_id,product_name,amount,payment_status,payment_method,payment_reference,source,stage,created_at,updated_at",
    )
    .eq("business_id", businessId)
    .eq("id", normalizedOrderId)
    .maybeSingle();
  if (error) {
    throw new Error(`Failed to load order: ${JSON.stringify(error)}`);
  }
  if (data) {
    return data as OrderRow;
  }

  // Compatibility fallback: allow order references like WB-1042.
  const fallback = await client
    .from("orders")
    .select(
      "id,business_id,customer_id,product_name,amount,payment_status,payment_method,payment_reference,source,stage,created_at,updated_at",
    )
    .eq("business_id", businessId)
    .order("updated_at", { ascending: false })
    .limit(500);

  if (fallback.error) {
    throw new Error(
      `Failed to load fallback order candidates: ${JSON.stringify(fallback.error)}`,
    );
  }

  const wantedReference = normalizedOrderId.replace(/^order\s*#?/i, "").trim().toUpperCase();
  const matched = ((fallback.data || []) as OrderRow[]).find((row) => {
    const reference = formatOrderReference(row.id);
    if (!reference) return false;
    return reference.toUpperCase() === wantedReference;
  });

  return matched || null;
}

async function getReceiptByOrder(
  businessId: string,
  orderId: string,
): Promise<ReceiptRow | null> {
  const client = createSupabaseServiceClient();
  const { data, error } = await client
    .from("receipts")
    .select(
      "id,business_id,order_id,token,shop_name,shop_logo_url,thank_you_message,footer_mode,snapshot,viewed_count,last_viewed_at,created_at,updated_at",
    )
    .eq("business_id", businessId)
    .eq("order_id", orderId)
    .maybeSingle();
  if (error) {
    throw new Error(`Failed to load receipt: ${JSON.stringify(error)}`);
  }
  return (data || null) as ReceiptRow | null;
}

async function countReceiptViewsThisMonth(businessId: string) {
  const client = createSupabaseServiceClient();
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  ).toISOString();
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  ).toISOString();

  const { count, error } = await client
    .from("receipt_views")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId)
    .gte("created_at", start)
    .lt("created_at", end);

  if (error) {
    return 0;
  }
  return count || 0;
}

function buildSnapshot(order: OrderRow, customer: CustomerRow | null) {
  const items = parseItemList(order.product_name).map((name) => ({
    name,
    qty: 1,
    price: asNumber(order.amount),
  }));
  return {
    order_reference: formatOrderReference(order.id) || "WB-00000",
    order_date: order.updated_at || order.created_at,
    channel: cleanText(order.source) || "WhatsApp",
    items,
    total_amount: asNumber(order.amount),
    payment_status_label: resolvePaymentStatusLabel(order),
    payment_reference: cleanText(order.payment_reference),
    customer_name: cleanText(customer?.name),
    customer_phone: cleanText(customer?.phone),
  };
}

async function getCustomerById(id: string): Promise<CustomerRow | null> {
  const client = createSupabaseServiceClient();
  const { data, error } = await client
    .from("customers")
    .select("id,name,phone")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    throw new Error(`Failed to load customer: ${JSON.stringify(error)}`);
  }
  return (data || null) as CustomerRow | null;
}

export async function getReceiptComposerStateForOrder(
  orderId: string,
): Promise<ReceiptComposerState> {
  const context = await resolveLegacyBusinessContextForRequest();
  const [business, order, existingReceipt, monthlyViews] = await Promise.all([
    getBusinessById(context.businessId),
    getOrderByIdForBusiness(context.businessId, orderId),
    getReceiptByOrder(context.businessId, orderId),
    countReceiptViewsThisMonth(context.businessId),
  ]);

  if (!business || !order) {
    return {
      eligible: false,
      reason: "Order not found in your business workspace.",
      existingReceipt: null,
      capabilities: getCapabilities("free"),
      monthlyViews,
    };
  }

  const plan = parseBillingPlan(business.billing_plan);
  const eligible = isReceiptEligible(order);
  const reason = eligible
    ? null
    : "Receipt becomes available after order is Paid, COD, or Delivered.";

  return {
    eligible,
    reason,
    existingReceipt: existingReceipt
      ? {
          id: existingReceipt.id,
          token: existingReceipt.token,
          publicPath: `/receipt/${existingReceipt.token}`,
          viewedCount: asNumber(existingReceipt.viewed_count),
          footerMode: safeFooterMode(existingReceipt.footer_mode),
          shopName: cleanText(existingReceipt.shop_name),
          shopLogoUrl: cleanText(existingReceipt.shop_logo_url),
          thankYouMessage: cleanText(existingReceipt.thank_you_message),
        }
      : null,
    capabilities: getCapabilities(plan),
    monthlyViews,
  };
}

export async function issueReceiptForOrder(
  input: ReceiptIssueInput,
): Promise<ReceiptIssueResult> {
  const context = await resolveLegacyBusinessContextForRequest();
  const businessId = context.businessId;
  const [business, order, currentReceipt] = await Promise.all([
    getBusinessById(businessId),
    getOrderByIdForBusiness(businessId, input.orderId),
    getReceiptByOrder(businessId, input.orderId),
  ]);

  if (!business || !order) {
    throw new Error("Order not found for this business.");
  }
  if (!isReceiptEligible(order)) {
    throw new Error(
      "Receipt can only be sent when order is Delivered or payment is confirmed (Paid/COD).",
    );
  }

  const customer = order.customer_id ? await getCustomerById(order.customer_id) : null;
  const plan = parseBillingPlan(business.billing_plan);
  const customization = enforceCustomization(
    plan,
    input,
    cleanText(business.name) || "WhatsBoard Seller",
    currentReceipt,
  );
  const snapshot = buildSnapshot(order, customer);
  const client = createSupabaseServiceClient();
  const nowIso = new Date().toISOString();
  const token = currentReceipt?.token || generateReceiptToken();
  let receiptId = currentReceipt?.id || "";

  if (currentReceipt) {
    const { error } = await client
      .from("receipts")
      .update({
        shop_name: customization.shopName,
        shop_logo_url: customization.shopLogoUrl,
        thank_you_message: customization.thankYouMessage,
        footer_mode: customization.footerMode,
        snapshot,
        updated_at: nowIso,
      })
      .eq("business_id", businessId)
      .eq("id", currentReceipt.id);
    if (error) {
      throw new Error(`Failed to update receipt: ${JSON.stringify(error)}`);
    }
  } else {
    const { data: createdData, error } = await client
      .from("receipts")
      .insert({
        business_id: businessId,
        order_id: order.id,
        token,
        shop_name: customization.shopName,
        shop_logo_url: customization.shopLogoUrl,
        thank_you_message: customization.thankYouMessage,
        footer_mode: customization.footerMode,
        snapshot,
        viewed_count: 0,
        created_at: nowIso,
        updated_at: nowIso,
      })
      .select("id")
      .single();
    if (error) {
      throw new Error(`Failed to create receipt: ${JSON.stringify(error)}`);
    }
    receiptId = String((createdData as { id?: string } | null)?.id || "");
  }

  const publicPath = `/receipt/${token}`;
  return {
    receiptId,
    token,
    orderId: order.id,
    publicPath,
    whatsappMessage: buildWhatsAppMessage(publicPath),
  };
}

export async function getPublicReceiptByToken(
  token: string,
): Promise<PublicReceiptDetails | null> {
  const cleanTokenValue = cleanText(token);
  if (!cleanTokenValue) return null;

  const client = createSupabaseServiceClient();
  const { data: receiptData, error: receiptError } = await client
    .from("receipts")
    .select(
      "id,business_id,order_id,token,shop_name,shop_logo_url,thank_you_message,footer_mode,snapshot,viewed_count,last_viewed_at,created_at,updated_at",
    )
    .eq("token", cleanTokenValue)
    .maybeSingle();

  if (receiptError) {
    throw new Error(`Failed to load receipt: ${JSON.stringify(receiptError)}`);
  }
  const receipt = (receiptData || null) as ReceiptRow | null;
  if (!receipt) return null;

  const [orderData, businessData] = await Promise.all([
    client
      .from("orders")
      .select(
        "id,business_id,customer_id,product_name,amount,payment_status,payment_method,payment_reference,source,stage,created_at,updated_at",
      )
      .eq("id", receipt.order_id)
      .maybeSingle(),
    client
      .from("businesses")
      .select("id,name,billing_plan")
      .eq("id", receipt.business_id)
      .maybeSingle(),
  ]);

  if (orderData.error) {
    throw new Error(`Failed to load receipt order: ${JSON.stringify(orderData.error)}`);
  }
  if (businessData.error) {
    throw new Error(`Failed to load receipt business: ${JSON.stringify(businessData.error)}`);
  }
  const order = (orderData.data || null) as OrderRow | null;
  const business = (businessData.data || null) as BusinessRow | null;
  if (!order || !business) return null;

  let customer: CustomerRow | null = null;
  if (order.customer_id) {
    const customerData = await client
      .from("customers")
      .select("id,name,phone")
      .eq("id", order.customer_id)
      .maybeSingle();
    if (customerData.error) {
      throw new Error(`Failed to load receipt customer: ${JSON.stringify(customerData.error)}`);
    }
    customer = (customerData.data || null) as CustomerRow | null;
  }

  const snapshot = (receipt.snapshot || {}) as Record<string, unknown>;
  const fallbackSnapshot = buildSnapshot(order, customer);
  const orderReference =
    cleanText(String(snapshot.order_reference || "")) ||
    fallbackSnapshot.order_reference;
  const orderDate =
    cleanText(String(snapshot.order_date || "")) ||
    fallbackSnapshot.order_date;
  const items = Array.isArray(snapshot.items)
    ? (snapshot.items as Array<{ name?: unknown; qty?: unknown; price?: unknown }>)
        .map((item) => ({
          name: cleanText(item.name) || "Order item",
          qty: Math.max(1, asNumber(item.qty as number | string | null)),
          price: Math.max(0, asNumber(item.price as number | string | null)),
        }))
        .slice(0, 20)
    : fallbackSnapshot.items;

  const totalAmount =
    asNumber(snapshot.total_amount as number | string | null) ||
    fallbackSnapshot.total_amount;

  const paymentStatusLabel =
    cleanText(String(snapshot.payment_status_label || "")) === "COD"
      ? "COD"
      : resolvePaymentStatusLabel(order);

  const plan = parseBillingPlan(business.billing_plan);
  const capabilities = getCapabilities(plan);
  const safeMode = safeFooterMode(receipt.footer_mode);
  const footerMode = capabilities.allowedFooterModes.includes(safeMode)
    ? safeMode
    : capabilities.allowedFooterModes[0];

  let footerText: string | null = null;
  if (footerMode === "whatsboard_link") {
    footerText = "Order tracked with WhatsBoard · whatsboard.vercel.app";
  } else if (footerMode === "powered_by_whatsboard") {
    footerText = "Powered by WhatsBoard";
  } else {
    footerText = null;
  }

  return {
    id: receipt.id,
    token: receipt.token,
    orderId: order.id,
    orderReference,
    date: orderDate,
    items,
    totalAmount,
    paymentStatusLabel,
    paymentReference:
      cleanText(String(snapshot.payment_reference || "")) ||
      cleanText(order.payment_reference),
    shopName:
      cleanText(receipt.shop_name) ||
      cleanText(business.name) ||
      "WhatsBoard Seller",
    shopLogoUrl: cleanText(receipt.shop_logo_url),
    thankYouMessage: cleanText(receipt.thank_you_message),
    footerMode,
    footerLinkPath: `/r/${receipt.token}`,
    footerText,
    viewedCount: asNumber(receipt.viewed_count),
    customerName:
      cleanText(String(snapshot.customer_name || "")) || cleanText(customer?.name),
    customerPhone:
      cleanText(String(snapshot.customer_phone || "")) || cleanText(customer?.phone),
  };
}

export function hashVisitorIp(value: string | null) {
  const clean = cleanText(value);
  if (!clean) return null;
  return createHash("sha256").update(clean).digest("hex");
}

export async function recordReceiptViewByToken(options: {
  token: string;
  visitorIpHash?: string | null;
}) {
  const cleanTokenValue = cleanText(options.token);
  if (!cleanTokenValue) return;
  const client = createSupabaseServiceClient();
  const { data: receiptData, error: receiptError } = await client
    .from("receipts")
    .select("id,business_id,viewed_count")
    .eq("token", cleanTokenValue)
    .maybeSingle();
  if (receiptError || !receiptData) return;

  const receiptId = (receiptData as { id: string }).id;
  const businessId = (receiptData as { business_id: string }).business_id;
  const viewedCount = asNumber((receiptData as { viewed_count: number | string | null }).viewed_count);
  const nowIso = new Date().toISOString();

  await client.from("receipt_views").insert({
    receipt_id: receiptId,
    business_id: businessId,
    visitor_ip_hash: cleanText(options.visitorIpHash),
    created_at: nowIso,
  });

  await client
    .from("receipts")
    .update({
      viewed_count: viewedCount + 1,
      last_viewed_at: nowIso,
      updated_at: nowIso,
    })
    .eq("id", receiptId);
}

export async function getReceiptViewsThisMonthForCurrentBusiness() {
  const context = await resolveLegacyBusinessContextForRequest();
  return countReceiptViewsThisMonth(context.businessId);
}

export async function trackReceiptReferralClick(options: {
  token: string;
  visitorIpHash?: string | null;
}) {
  const cleanTokenValue = cleanText(options.token);
  if (!cleanTokenValue) return false;

  const client = createSupabaseServiceClient();
  const { data: receiptData, error: receiptError } = await client
    .from("receipts")
    .select("id")
    .eq("token", cleanTokenValue)
    .maybeSingle();

  if (receiptError || !receiptData) return false;

  const receiptId = (receiptData as { id: string }).id;
  const { error } = await client.from("referral_events").insert({
    source_receipt_id: receiptId,
    visitor_ip_hash: cleanText(options.visitorIpHash),
    created_at: new Date().toISOString(),
  });

  return !error;
}

export async function attributeReceiptReferralConversion(options: {
  token: string;
  convertedUserId: string;
}) {
  const cleanTokenValue = cleanText(options.token);
  const userId = cleanText(options.convertedUserId);
  if (!cleanTokenValue || !userId) return false;

  const client = createSupabaseServiceClient();
  const { data: receiptData, error: receiptError } = await client
    .from("receipts")
    .select("id")
    .eq("token", cleanTokenValue)
    .maybeSingle();
  if (receiptError || !receiptData) return false;

  const receiptId = (receiptData as { id: string }).id;
  const sevenDaysAgoIso = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data: existingConversion } = await client
    .from("referral_events")
    .select("id")
    .eq("source_receipt_id", receiptId)
    .eq("converted_to_seller_id", userId)
    .limit(1);
  if (existingConversion && existingConversion.length > 0) return true;

  const { data: eventData, error: eventError } = await client
    .from("referral_events")
    .select("id")
    .eq("source_receipt_id", receiptId)
    .is("converted_to_seller_id", null)
    .gte("created_at", sevenDaysAgoIso)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (eventError || !eventData) return false;

  const { error: updateError } = await client
    .from("referral_events")
    .update({
      converted_to_seller_id: userId,
      converted_at: new Date().toISOString(),
    })
    .eq("id", (eventData as { id: string }).id);

  return !updateError;
}
