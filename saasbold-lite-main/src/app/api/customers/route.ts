import { NextResponse } from "next/server";
import { createCustomer } from "@/lib/whatsboard-store";

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = String(formData.get("name") || "");
  const phone = String(formData.get("phone") || "");
  const location = String(formData.get("location") || "");
  const status = String(formData.get("status") || "active");

  if (!name.trim() || !phone.trim() || !location.trim()) {
    return NextResponse.redirect(new URL("/customers/new?error=invalid", request.url));
  }

  createCustomer({
    name,
    phone,
    location,
    status: (["active", "waiting", "vip"].includes(status) ? status : "active") as "active" | "waiting" | "vip",
  });

  return NextResponse.redirect(new URL("/customers?created=1", request.url));
}
