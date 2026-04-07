"use client";

import { useCallback } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import { AppLocale, isAppLocale, localeCookieName } from "@/i18n/config";

export function useLanguage() {
  const router = useRouter();
  const locale = useLocale();

  const setLanguage = useCallback(
    async (nextLocale: AppLocale) => {
      if (!isAppLocale(nextLocale)) return;

      document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=${60 * 60 * 24 * 365}`;
      document.documentElement.lang = nextLocale;

      router.refresh();
    },
    [router],
  );

  return {
    language: isAppLocale(locale) ? locale : "en",
    setLanguage,
  };
}
