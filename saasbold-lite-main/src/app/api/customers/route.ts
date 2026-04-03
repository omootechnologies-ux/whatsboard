import { NextResponse } from "next/server";
import type { SourceChannel } from "@/data/whatsboard";
import { createCustomer } from "@/lib/whatsboard-repository";

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = String(formData.get("name") || "");
  const phone = String(formData.get("phone") || "");
  const whatsappNumber = String(formData.get("whatsappNumber") || "");
  const sourceChannel = String(formData.get("sourceChannel") || "Unknown");
  const notes = String(formData.get("notes") || "");
  const location = String(formData.get("location") || "");
  const status = String(formData.get("status") || "active");

  if (!name.trim() || !phone.trim() || !location.trim()) {
    return NextResponse.redirect(
      new URL("/customers/new?error=invalid", request.url),
      303,
    );
  }

  try {
    await createCustomer({
      name,
      phone,
      whatsappNumber,
      sourceChannel: ([
        "WhatsApp",
        "Instagram",
        "Facebook",
        "TikTok",
        "Unknown",
      ].includes(sourceChannel)
        ? sourceChannel
        : "Unknown") as SourceChannel,
      notes,
      location,
      status: (["active", "waiting", "vip"].includes(status)
        ? status
        : "active") as "active" | "waiting" | "vip",
    });

    return NextResponse.redirect(
      new URL("/customers?created=1", request.url),
      303,
    );
  } catch {
    return NextResponse.redirect(
      new URL("/customers/new?error=persistence", request.url),
      303,
    );
  }
}
