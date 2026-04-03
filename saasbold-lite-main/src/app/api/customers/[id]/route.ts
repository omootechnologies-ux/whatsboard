import { NextResponse } from "next/server";
import { updateCustomer } from "@/lib/whatsboard-repository";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const formData = await request.formData();
  const name = String(formData.get("name") || "");
  const phone = String(formData.get("phone") || "");
  const location = String(formData.get("location") || "");
  const status = String(formData.get("status") || "active");

  if (!name.trim() || !phone.trim() || !location.trim()) {
    return NextResponse.redirect(
      new URL(`/customers/${id}/edit?error=invalid`, request.url),
      303,
    );
  }

  try {
    const updated = await updateCustomer(id, {
      name,
      phone,
      location,
      status: (["active", "waiting", "vip"].includes(status)
        ? status
        : "active") as "active" | "waiting" | "vip",
    });

    if (!updated) {
      return NextResponse.redirect(
        new URL("/customers?error=not-found", request.url),
        303,
      );
    }

    return NextResponse.redirect(
      new URL("/customers?updated=1", request.url),
      303,
    );
  } catch {
    return NextResponse.redirect(
      new URL(`/customers/${id}/edit?error=persistence`, request.url),
      303,
    );
  }
}
