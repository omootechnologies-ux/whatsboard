import { NextResponse } from "next/server";
import type { PaymentRecord } from "@/data/whatsboard";
import { createPayment } from "@/lib/whatsboard-repository";

export async function POST(request: Request) {
  const formData = await request.formData();
  const orderId = String(formData.get("orderId") || "");
  const amount = Number(formData.get("amount") || 0);
  const method = String(formData.get("method") || "M-Pesa");
  const status = String(formData.get("status") || "paid");
  const reference = String(formData.get("reference") || "");

  if (
    !orderId.trim() ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !reference.trim()
  ) {
    return NextResponse.redirect(
      new URL("/payments/new?error=invalid", request.url),
      303,
    );
  }

  try {
    await createPayment({
      orderId,
      amount,
      method: (["M-Pesa", "Tigopesa", "Airtel Money", "Bank", "Cash"].includes(
        method,
      )
        ? method
        : "M-Pesa") as PaymentRecord["method"],
      status: (["unpaid", "partial", "paid", "cod"].includes(status)
        ? status
        : "paid") as "unpaid" | "partial" | "paid" | "cod",
      reference,
    });

    return NextResponse.redirect(
      new URL("/payments?created=1", request.url),
      303,
    );
  } catch {
    return NextResponse.redirect(
      new URL("/payments/new?error=persistence", request.url),
      303,
    );
  }
}
