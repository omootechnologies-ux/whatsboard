import { NextResponse } from "next/server";
import { hashVisitorIp, trackReceiptReferralClick } from "@/lib/receipts/receipt-service";

function extractVisitorIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return null;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const visitorIpHash = hashVisitorIp(extractVisitorIp(request));

  try {
    await trackReceiptReferralClick({
      token,
      visitorIpHash,
    });
  } catch {
    // Do not block redirect for tracking errors.
  }

  const destination = new URL("/register", request.url);
  destination.searchParams.set("ref", token);
  return NextResponse.redirect(destination, 302);
}
