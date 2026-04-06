import { NextRequest, NextResponse } from "next/server";
import { WHATSBOARD_ACCESS_TOKEN_COOKIE } from "@/lib/auth/constants";
import {
  defaultAppLocale,
  isAppLocale,
  localeCookieName,
} from "@/i18n/config";
import { createSupabaseServiceClient, isSupabaseServerConfigured } from "@/lib/supabase/server";

function isMissingColumnError(error: unknown) {
  const text = JSON.stringify(error || {}).toLowerCase();
  return text.includes("42703") || text.includes("column");
}

async function persistLocaleOnProfile(
  accessToken: string | null | undefined,
  locale: "en" | "sw",
) {
  if (!accessToken || !isSupabaseServerConfigured()) return;

  try {
    const client = createSupabaseServiceClient();
    const userResult = await client.auth.getUser(accessToken);
    const userId = userResult.data.user?.id;
    if (!userId) return;

    const columns = ["preferred_locale", "locale", "language"] as const;
    for (const column of columns) {
      const { error } = await client
        .from("profiles")
        .update({ [column]: locale })
        .eq("id", userId);
      if (!error) {
        return;
      }
      if (!isMissingColumnError(error)) {
        return;
      }
    }
  } catch {
    // Ignore profile write failures and keep cookie fallback.
  }
}

export async function POST(request: NextRequest) {
  let locale = defaultAppLocale;

  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const payload = (await request.json().catch(() => ({}))) as {
        locale?: string;
      };
      if (isAppLocale(payload.locale)) {
        locale = payload.locale;
      }
    }
  } catch {
    // Ignore malformed locale payload and keep default.
  }

  const accessToken =
    request.cookies.get(WHATSBOARD_ACCESS_TOKEN_COOKIE)?.value || null;
  await persistLocaleOnProfile(accessToken, locale);

  const response = NextResponse.json({ ok: true, locale });
  response.cookies.set(localeCookieName, locale, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    path: "/",
  });
  return response;
}
