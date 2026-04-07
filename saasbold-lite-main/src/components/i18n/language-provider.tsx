"use client";

import { useCallback, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import { AppLocale, isAppLocale, localeCookieName } from "@/i18n/config";

export function useLanguage() {
  const router = useRouter();
  const locale = useLocale();
  const [pendingLocale, setPendingLocale] = useState<AppLocale | null>(null);
  const activeLocale =
    pendingLocale || (isAppLocale(locale) ? locale : "en");

  const setLanguage = useCallback(
    async (nextLocale: AppLocale) => {
      if (!isAppLocale(nextLocale)) return;
      if (nextLocale === activeLocale) return;

      setPendingLocale(nextLocale);
      document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=${60 * 60 * 24 * 365}`;
      document.documentElement.lang = nextLocale;

      try {
        await fetch("/api/locale", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ locale: nextLocale }),
        });
      } catch {
        // Cookie fallback still allows server rendering with the selected locale.
      } finally {
        router.refresh();
        setPendingLocale(null);
      }
    },
    [activeLocale, router],
  );

  return {
    language: activeLocale,
    setLanguage,
  };
}
