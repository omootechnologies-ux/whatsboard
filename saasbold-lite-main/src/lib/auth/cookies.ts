import type { Session } from "@supabase/supabase-js";
import {
  WHATSBOARD_ACCESS_TOKEN_COOKIE,
  WHATSBOARD_EXPIRES_AT_COOKIE,
  WHATSBOARD_REFRESH_TOKEN_COOKIE,
} from "@/lib/auth/constants";

function cookieSecureSuffix() {
  if (typeof window === "undefined") return "";
  return window.location.protocol === "https:" ? "; Secure" : "";
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${Math.max(
    1,
    Math.floor(maxAgeSeconds),
  )}; SameSite=Lax${cookieSecureSuffix()}`;
}

export function persistAuthSessionCookies(session: Session) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const expiresAt = session.expires_at ?? nowSeconds + 3600;
  const maxAge = Math.max(60, expiresAt - nowSeconds);

  if (session.access_token) {
    setCookie(WHATSBOARD_ACCESS_TOKEN_COOKIE, session.access_token, maxAge);
  }
  if (session.refresh_token) {
    setCookie(WHATSBOARD_REFRESH_TOKEN_COOKIE, session.refresh_token, 60 * 60 * 24 * 30);
  }
  setCookie(WHATSBOARD_EXPIRES_AT_COOKIE, String(expiresAt), maxAge);
}

export function clearAuthSessionCookies() {
  setCookie(WHATSBOARD_ACCESS_TOKEN_COOKIE, "", 0);
  setCookie(WHATSBOARD_REFRESH_TOKEN_COOKIE, "", 0);
  setCookie(WHATSBOARD_EXPIRES_AT_COOKIE, "", 0);
}
