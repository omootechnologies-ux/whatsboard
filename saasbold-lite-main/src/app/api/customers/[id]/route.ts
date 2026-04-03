import { NextResponse } from "next/server";
import type { SourceChannel } from "@/data/whatsboard";
import { getCustomerById, updateCustomer } from "@/lib/whatsboard-repository";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const formData = await request.formData();
  const existing = await getCustomerById(id);
  const name = String(formData.get("name") || existing?.name || "");
  const phone = String(formData.get("phone") || existing?.phone || "");
  const whatsappNumber = String(
    formData.get("whatsappNumber") || existing?.whatsappNumber || "",
  );
  const sourceChannel = String(
    formData.get("sourceChannel") || existing?.sourceChannel || "Unknown",
  );
  const notes = String(formData.get("notes") || existing?.notes || "");
  const location = String(formData.get("location") || existing?.location || "");
  const status = String(formData.get("status") || "active");
  const referer = request.headers.get("referer");
  const fromEdit = Boolean(referer?.includes(`/customers/${id}/edit`));
  const fromProfile = Boolean(referer?.includes(`/customers/${id}`)) && !fromEdit;

  if (!name.trim() || !phone.trim() || !location.trim()) {
    return NextResponse.redirect(
      new URL(
        fromProfile
          ? `/customers/${id}?error=invalid`
          : `/customers/${id}/edit?error=invalid`,
        request.url,
      ),
      303,
    );
  }

  try {
    const updated = await updateCustomer(id, {
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

    if (!updated) {
      return NextResponse.redirect(
        new URL("/customers?error=not-found", request.url),
        303,
      );
    }

    return NextResponse.redirect(
      new URL(
        fromProfile ? `/customers/${id}?updated=1` : "/customers?updated=1",
        request.url,
      ),
      303,
    );
  } catch {
    return NextResponse.redirect(
      new URL(
        fromProfile
          ? `/customers/${id}?error=persistence`
          : `/customers/${id}/edit?error=persistence`,
        request.url,
      ),
      303,
    );
  }
}
