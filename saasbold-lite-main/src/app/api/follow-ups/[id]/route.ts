import { NextResponse } from "next/server";
import { updateFollowUp } from "@/lib/whatsboard-repository";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const formData = await request.formData();
  const title = String(formData.get("title") || "");
  const dueAt = String(formData.get("dueAt") || "");
  const priority = String(formData.get("priority") || "medium");
  const status = String(formData.get("status") || "");
  const note = String(formData.get("note") || "");

  if (!title.trim() || !dueAt || !note.trim()) {
    return NextResponse.redirect(
      new URL(`/follow-ups/${id}/edit?error=invalid`, request.url),
      303,
    );
  }

  try {
    const updated = await updateFollowUp(id, {
      title,
      dueAt,
      note,
      priority: (["high", "medium", "low"].includes(priority)
        ? priority
        : "medium") as "high" | "medium" | "low",
      status: (["overdue", "today", "upcoming", "completed"].includes(status)
        ? status
        : undefined) as
        | "overdue"
        | "today"
        | "upcoming"
        | "completed"
        | undefined,
    });

    if (!updated) {
      return NextResponse.redirect(
        new URL("/follow-ups?error=not-found", request.url),
        303,
      );
    }

    return NextResponse.redirect(
      new URL("/follow-ups?updated=1", request.url),
      303,
    );
  } catch {
    return NextResponse.redirect(
      new URL(`/follow-ups/${id}/edit?error=persistence`, request.url),
      303,
    );
  }
}
