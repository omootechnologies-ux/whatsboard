export const appLocales = ["en", "sw"] as const;

export type AppLocale = (typeof appLocales)[number];

export const defaultAppLocale: AppLocale = "en";

export const localeCookieName = "wb-locale";

export function isAppLocale(value?: string | null): value is AppLocale {
  return !!value && appLocales.includes(value as AppLocale);
}

export function normalizeAppLocale(value?: string | null): AppLocale {
  return isAppLocale(value) ? value : defaultAppLocale;
}

