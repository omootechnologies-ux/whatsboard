import { NextResponse } from "next/server";
import { assignPaymentToOrder } from "@/lib/whatsboard-repository";

function redirectWithStatus(request: Request, status: string) {
  const referer = request.headers.get("referer");
  const target = referer ? new URL(referer) : new URL("/payments", request.url);
  target.searchParams.set(status, "1");
  return NextResponse.redirect(target, 303);
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  const fromJson = contentType.includes("application/json");

  let paymentId = "";
  let orderId = "";

  if (fromJson) {
    const body = (await request.json()) as { paymentId?: string; orderId?: string };
    paymentId = String(body.paymentId || "");
    orderId = String(body.orderId || "");
  } else {
    const formData = await request.formData();
    paymentId = String(formData.get("paymentId") || "");
    orderId = String(formData.get("orderId") || "");
  }

  if (!paymentId.trim() || !orderId.trim()) {
    if (fromJson) {
      return NextResponse.json(
        { ok: false, error: "paymentId and orderId are required." },
        { status: 400 },
      );
    }
    return redirectWithStatus(request, "assignError");
  }

  try {
    const record = await assignPaymentToOrder({ paymentId, orderId });
    if (!record) {
      if (fromJson) {
        return NextResponse.json(
          { ok: false, error: "Payment or order not found." },
          { status: 404 },
        );
      }
      return redirectWithStatus(request, "assignNotFound");
    }

    if (fromJson) {
      return NextResponse.json({ ok: true, payment: record });
    }
    return redirectWithStatus(request, "assigned");
  } catch (error) {
    if (fromJson) {
      return NextResponse.json(
        {
          ok: false,
          error:
            error instanceof Error
              ? error.message
              : "Could not assign payment to order.",
        },
        { status: 500 },
      );
    }
    return redirectWithStatus(request, "assignError");
  }
}
