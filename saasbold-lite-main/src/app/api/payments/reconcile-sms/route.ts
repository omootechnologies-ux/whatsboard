import { NextResponse } from "next/server";
import { reconcilePaymentSms } from "@/lib/whatsboard-repository";

export async function POST(request: Request) {
  let rawSms = "";

  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = (await request.json()) as {
      rawSms?: string;
      sms?: string;
      message?: string;
      text?: string;
    };
    rawSms = String(body.rawSms || body.sms || body.message || body.text || "");
  } else if (contentType.startsWith("text/plain")) {
    rawSms = String(await request.text());
  } else {
    const formData = await request.formData();
    rawSms = String(
      formData.get("rawSms") ||
        formData.get("sms") ||
        formData.get("message") ||
        formData.get("text") ||
        "",
    );
  }

  if (!rawSms.trim()) {
    return NextResponse.json(
      { ok: false, error: "SMS text is required." },
      { status: 400 },
    );
  }

  try {
    const result = await reconcilePaymentSms({ rawSms });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to reconcile payment SMS.",
      },
      { status: 500 },
    );
  }
}
