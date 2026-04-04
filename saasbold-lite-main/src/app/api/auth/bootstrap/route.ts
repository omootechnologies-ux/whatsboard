import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  WHATSBOARD_ACCESS_TOKEN_COOKIE,
  WHATSBOARD_EXPIRES_AT_COOKIE,
  WHATSBOARD_REFRESH_TOKEN_COOKIE,
} from "@/lib/auth/constants";
import { provisionLegacyBusinessForAccessToken } from "@/lib/repositories/supabase-legacy-repository";
import { attributeReceiptReferralConversion } from "@/lib/receipts/receipt-service";

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

function cleanToken(value: unknown) {
  const parsed = String(value || "").trim();
  return parsed.length ? parsed : null;
}

function parseExpiresAt(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(1, Math.floor(parsed));
}

function isSecureRequest(request: Request) {
  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const isJson = request.headers.get("content-type")?.includes("application/json");
    const payload = isJson
        ? ((await request.json().catch(() => ({}))) as {
          businessName?: unknown;
          accessToken?: unknown;
          refreshToken?: unknown;
          expiresAt?: unknown;
          referralToken?: unknown;
        })
      : {};

    const tokenFromHeader = extractBearerToken(request.headers.get("authorization"));
    const tokenFromBody = cleanToken(payload.accessToken);
    const tokenFromCookie =
      cookieStore.get(WHATSBOARD_ACCESS_TOKEN_COOKIE)?.value || null;
    const accessToken = tokenFromBody || tokenFromHeader || tokenFromCookie;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Missing authentication session." },
        { status: 401 },
      );
    }

    const businessNameHint = cleanBusinessName(payload.businessName);
    const refreshToken = cleanToken(payload.refreshToken);
    const expiresAt = parseExpiresAt(payload.expiresAt);
    const referralToken = cleanToken(payload.referralToken);

    const context = await provisionLegacyBusinessForAccessToken({
      accessToken,
      businessNameHint,
    });

    if (referralToken) {
      try {
        await attributeReceiptReferralConversion({
          token: referralToken,
          convertedUserId: context.userId,
        });
      } catch {
        // Referral attribution must never block auth bootstrap.
      }
    }

    const response = NextResponse.json({
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

    const secure = isSecureRequest(request);
    const nowSeconds = Math.floor(Date.now() / 1000);
    const effectiveExpiresAt = expiresAt && expiresAt > nowSeconds
      ? expiresAt
      : nowSeconds + 3600;
    const accessMaxAge = Math.max(60, effectiveExpiresAt - nowSeconds);

    response.cookies.set(WHATSBOARD_ACCESS_TOKEN_COOKIE, accessToken, {
      path: "/",
      maxAge: accessMaxAge,
      sameSite: "lax",
      secure,
      httpOnly: false,
    });

    if (refreshToken) {
      response.cookies.set(WHATSBOARD_REFRESH_TOKEN_COOKIE, refreshToken, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
        secure,
        httpOnly: false,
      });
    }

    response.cookies.set(WHATSBOARD_EXPIRES_AT_COOKIE, String(effectiveExpiresAt), {
      path: "/",
      maxAge: accessMaxAge,
      sameSite: "lax",
      secure,
      httpOnly: false,
    });

    return response;
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
