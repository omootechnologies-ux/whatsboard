import { NextResponse } from "next/server";
import {
  issueReceiptForOrder,
  type ReceiptFooterMode,
} from "@/lib/receipts/receipt-service";

function asFooterMode(value: string): ReceiptFooterMode | null {
  const normalized = value.trim().toLowerCase();
  if (
    normalized === "whatsboard_link" ||
    normalized === "powered_by_whatsboard" ||
    normalized === "hidden" ||
    normalized === "white_label"
  ) {
    return normalized;
  }
  return null;
}

function redirectWithParams(
  request: Request,
  orderId: string,
  params: Record<string, string>,
) {
  const target = new URL(`/orders/${orderId}`, request.url);
  Object.entries(params).forEach(([key, value]) =>
    target.searchParams.set(key, value),
  );
  return NextResponse.redirect(target, 303);
}

function normalizeErrorCode(message: string) {
  const text = message.toLowerCase();
  if (
    text.includes("relation") &&
    (text.includes("receipts") || text.includes("receipt_views"))
  ) {
    return "missing-schema";
  }
  if (text.includes("order not found")) return "order-not-found";
  if (text.includes("delivered") || text.includes("paid/cod")) {
    return "not-eligible";
  }
  return "unknown";
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  let orderId = "";
  let shopName = "";
  let shopLogoUrl = "";
  let thankYouMessage = "";
  let footerMode: ReceiptFooterMode | null = null;

  if (isJson) {
    const body = (await request.json().catch(() => ({}))) as {
      orderId?: string;
      shopName?: string;
      shopLogoUrl?: string;
      thankYouMessage?: string;
      footerMode?: string;
    };
    orderId = String(body.orderId || "").trim();
    shopName = String(body.shopName || "").trim();
    shopLogoUrl = String(body.shopLogoUrl || "").trim();
    thankYouMessage = String(body.thankYouMessage || "").trim();
    footerMode = body.footerMode ? asFooterMode(String(body.footerMode)) : null;
  } else {
    const formData = await request.formData();
    orderId = String(formData.get("orderId") || "").trim();
    shopName = String(formData.get("shopName") || "").trim();
    shopLogoUrl = String(formData.get("shopLogoUrl") || "").trim();
    thankYouMessage = String(formData.get("thankYouMessage") || "").trim();
    footerMode = asFooterMode(String(formData.get("footerMode") || ""));
  }

  if (!orderId) {
    if (isJson) {
      return NextResponse.json(
        { ok: false, error: "orderId is required." },
        { status: 400 },
      );
    }
    return NextResponse.redirect(new URL("/orders?error=not-found", request.url), 303);
  }

  try {
    const result = await issueReceiptForOrder({
      orderId,
      shopName: shopName || null,
      shopLogoUrl: shopLogoUrl || null,
      thankYouMessage: thankYouMessage || null,
      footerMode,
    });

    if (isJson) {
      return NextResponse.json({ ok: true, result });
    }
    return redirectWithParams(request, orderId, {
      receiptCreated: "1",
      receiptToken: result.token,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate receipt.";
    if (isJson) {
      return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
    return redirectWithParams(request, orderId, {
      receiptError: "1",
      receiptErrorCode: normalizeErrorCode(message),
    });
  }
}
