import { NextResponse } from "next/server";
import { createOrder } from "@/lib/whatsboard-repository";

export async function POST(request: Request) {
  const formData = await request.formData();
  const customerName = String(formData.get("customerName") || "");
  const customerPhone = String(formData.get("customerPhone") || "");
  const channel = String(formData.get("channel") || "WhatsApp");
  const stage = String(formData.get("stage") || "new_order");
  const paymentStatus = String(formData.get("paymentStatus") || "unpaid");
  const amount = Number(formData.get("amount") || 0);
  const deliveryArea = String(formData.get("deliveryArea") || "");
  const notes = String(formData.get("notes") || "");
  const itemsInput = String(formData.get("items") || "");

  if (
    !customerName.trim() ||
    !deliveryArea.trim() ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return NextResponse.redirect(
      new URL("/orders/new?error=invalid", request.url),
      303,
    );
  }

  try {
    const record = await createOrder({
      customerName,
      customerPhone,
      channel: (["WhatsApp", "Instagram", "TikTok", "Facebook"].includes(
        channel,
      )
        ? channel
        : "WhatsApp") as "WhatsApp" | "Instagram" | "TikTok" | "Facebook",
      stage: ([
        "new_order",
        "waiting_payment",
        "paid",
        "packing",
        "dispatched",
        "delivered",
      ].includes(stage)
        ? stage
        : "new_order") as
        | "new_order"
        | "waiting_payment"
        | "paid"
        | "packing"
        | "dispatched"
        | "delivered",
      paymentStatus: (["unpaid", "partial", "paid", "cod"].includes(
        paymentStatus,
      )
        ? paymentStatus
        : "unpaid") as "unpaid" | "partial" | "paid" | "cod",
      amount,
      deliveryArea,
      notes,
      items: itemsInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    });

    return NextResponse.redirect(
      new URL(`/orders/${record.id}?created=1`, request.url),
      303,
    );
  } catch {
    return NextResponse.redirect(
      new URL("/orders/new?error=persistence", request.url),
      303,
    );
  }
}
