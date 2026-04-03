import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { WHATSBOARD_ACCESS_TOKEN_COOKIE } from "@/lib/auth/constants";
import { provisionLegacyBusinessForAccessToken } from "@/lib/repositories/supabase-legacy-repository";

function extractBearerToken(value: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed.toLowerCase().startsWith("bearer ")) return null;
  const token = trimmed.slice(7).trim();
  return token.length ? token : null;
}

function cleanBusinessName(value: unknown) {
  const parsed = String(value || "").trim();
  return parsed.length ? parsed : null;
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const tokenFromHeader = extractBearerToken(
      request.headers.get("authorization"),
    );
    const tokenFromCookie =
      cookieStore.get(WHATSBOARD_ACCESS_TOKEN_COOKIE)?.value || null;
    const accessToken = tokenFromHeader || tokenFromCookie;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Missing authentication session." },
        { status: 401 },
      );
    }

    let businessNameHint: string | null = null;
    if (request.headers.get("content-type")?.includes("application/json")) {
      const payload = (await request.json().catch(() => ({}))) as {
        businessName?: unknown;
      };
      businessNameHint = cleanBusinessName(payload.businessName);
    }

    const context = await provisionLegacyBusinessForAccessToken({
      accessToken,
      businessNameHint,
    });

    return NextResponse.json({
      ok: true,
      business: {
        id: context.businessId,
        name: context.businessName,
      },
      profile: {
        fullName: context.profileFullName,
        email: context.profileEmail,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to initialize business context.";
    const status =
      message.toLowerCase().includes("authentication") ||
      message.toLowerCase().includes("session")
        ? 401
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
