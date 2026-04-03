import { NextResponse } from "next/server";
import { updatePayment } from "@/lib/whatsboard-repository";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
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
      new URL(`/payments/${id}/edit?error=invalid`, request.url),
      303,
    );
  }

  try {
    const updated = await updatePayment(id, {
      orderId,
      amount,
      method: (["M-Pesa", "Bank", "Cash"].includes(method)
        ? method
        : "M-Pesa") as "M-Pesa" | "Bank" | "Cash",
      status: (["unpaid", "partial", "paid", "cod"].includes(status)
        ? status
        : "paid") as "unpaid" | "partial" | "paid" | "cod",
      reference,
    });

    if (!updated) {
      return NextResponse.redirect(
        new URL("/payments?error=not-found", request.url),
        303,
      );
    }

    return NextResponse.redirect(
      new URL("/payments?updated=1", request.url),
      303,
    );
  } catch {
    return NextResponse.redirect(
      new URL(`/payments/${id}/edit?error=persistence`, request.url),
      303,
    );
  }
}
