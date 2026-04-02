import { NextResponse } from "next/server";
import { createFollowUp } from "@/lib/whatsboard-store";

export async function POST(request: Request) {
  const formData = await request.formData();
  const customerName = String(formData.get("customerName") || "");
  const orderId = String(formData.get("orderId") || "");
  const dueAt = String(formData.get("dueAt") || "");
  const priority = String(formData.get("priority") || "medium");
  const note = String(formData.get("note") || "");

  if (!customerName.trim() || !dueAt || !note.trim()) {
    return NextResponse.redirect(
      new URL("/follow-ups/new?error=invalid", request.url),
    );
  }

  createFollowUp({
    customerName,
    orderId,
    dueAt,
    priority: (["high", "medium", "low"].includes(priority)
      ? priority
      : "medium") as "high" | "medium" | "low",
    note,
  });

  return NextResponse.redirect(new URL("/follow-ups?created=1", request.url));
}
