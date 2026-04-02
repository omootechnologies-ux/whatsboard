import { NextResponse } from "next/server";
import { updateOrder } from "@/lib/whatsboard-store";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const formData = await request.formData();
  const customerName = String(formData.get("customerName") || "");
  const stage = String(formData.get("stage") || "new_order");
  const paymentStatus = String(formData.get("paymentStatus") || "unpaid");
  const amount = Number(formData.get("amount") || 0);
  const notes = String(formData.get("notes") || "");

  if (!customerName.trim() || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.redirect(
      new URL(`/orders/${id}/edit?error=invalid`, request.url),
    );
  }

  const record = updateOrder(id, {
    customerName,
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
    paymentStatus: (["unpaid", "partial", "paid", "cod"].includes(paymentStatus)
      ? paymentStatus
      : "unpaid") as "unpaid" | "partial" | "paid" | "cod",
    amount,
    notes,
  });

  if (!record) {
    return NextResponse.redirect(
      new URL("/orders?error=not-found", request.url),
    );
  }

  return NextResponse.redirect(new URL(`/orders/${id}?updated=1`, request.url));
}
