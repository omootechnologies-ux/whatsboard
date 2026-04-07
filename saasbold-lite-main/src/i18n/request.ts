import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { WHATSBOARD_ACCESS_TOKEN_COOKIE } from "@/lib/auth/constants";
import { createSupabaseServiceClient, isSupabaseServerConfigured } from "@/lib/supabase/server";
import {
  appLocales,
  defaultAppLocale,
  isAppLocale,
  localeCookieName,
  type AppLocale,
} from "@/i18n/config";

function resolveLocaleFromAcceptLanguage(value?: string | null): AppLocale | null {
  if (!value) return null;

  const normalized = value.toLowerCase();
  if (normalized.includes("sw")) return "sw";
  if (normalized.includes("en")) return "en";

  return null;
}

function isMissingColumnError(error: unknown) {
  const text = JSON.stringify(error || {}).toLowerCase();
  return text.includes("42703") || text.includes("column");
}

async function resolveLocaleFromProfile(
  accessToken: string | null | undefined,
): Promise<AppLocale | null> {
  if (!accessToken || !isSupabaseServerConfigured()) return null;

  try {
    const client = createSupabaseServiceClient();
    const authResult = await client.auth.getUser(accessToken);
    const userId = authResult.data.user?.id;
    if (!userId) return null;

    const candidates = ["preferred_locale", "locale", "language"] as const;
    for (const column of candidates) {
      const { data, error } = await client
        .from("profiles")
        .select(column)
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        if (isMissingColumnError(error)) continue;
        return null;
      }

      const raw = (data as Record<string, unknown> | null)?.[column];
      const maybeLocale = typeof raw === "string" ? raw : null;
      if (isAppLocale(maybeLocale)) {
        return maybeLocale;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const cookieLocale = cookieStore.get(localeCookieName)?.value || null;
  const accessToken =
    cookieStore.get(WHATSBOARD_ACCESS_TOKEN_COOKIE)?.value || null;
  const profileLocale = await resolveLocaleFromProfile(accessToken);
  const headerLocale = resolveLocaleFromAcceptLanguage(
    headerStore.get("accept-language"),
  );
  const locale = isAppLocale(cookieLocale)
    ? cookieLocale
    : profileLocale || headerLocale || defaultAppLocale;

  const messages = (
    await import(`@/messages/${locale}.json`)
  ).default as Record<string, unknown>;

  return {
    locale,
    messages,
    timeZone: "Africa/Dar_es_Salaam",
    now: new Date(),
    formats: {
      number: {
        integer: {
          maximumFractionDigits: 0,
        },
      },
      dateTime: {
        short: {
          day: "2-digit",
          month: "short",
          year: "numeric",
        },
      },
    },
  };
});

export const locales = appLocales;
