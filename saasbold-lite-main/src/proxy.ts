import { NextRequest, NextResponse } from "next/server";
import {
  WHATSBOARD_ACCESS_TOKEN_COOKIE,
  WHATSBOARD_EXPIRES_AT_COOKIE,
  WHATSBOARD_REFRESH_TOKEN_COOKIE,
} from "@/lib/auth/constants";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/orders",
  "/products",
  "/customers",
  "/follow-ups",
  "/payments",
  "/team",
  "/billing",
  "/analytics",
  "/settings",
  "/api/customers",
  "/api/orders",
  "/api/follow-ups",
  "/api/payments",
] as const;

const AUTH_PAGES = ["/login", "/register"] as const;

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isAuthPage(pathname: string) {
  return AUTH_PAGES.some((route) => pathname === route);
}

function getSupabasePublicKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_KEY
  );
}

async function isSupabaseTokenValid(accessToken: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublicKey = getSupabasePublicKey();

  if (!supabaseUrl || !supabasePublicKey) {
    return false;
  }

  try {
    const response = await fetch(
      `${supabaseUrl.replace(/\/+$/, "")}/auth/v1/user`,
      {
        method: "GET",
        headers: {
          apikey: supabasePublicKey,
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      },
    );
    return response.ok;
  } catch {
    return false;
  }
}

function buildLoginRedirect(request: NextRequest) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return loginUrl;
}

function clearAuthCookies(response: NextResponse) {
  response.cookies.delete(WHATSBOARD_ACCESS_TOKEN_COOKIE);
  response.cookies.delete(WHATSBOARD_REFRESH_TOKEN_COOKIE);
  response.cookies.delete(WHATSBOARD_EXPIRES_AT_COOKIE);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const forceAuthPage = request.nextUrl.searchParams.get("force") === "1";

  if (pathname.startsWith("/_next/") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(
    WHATSBOARD_ACCESS_TOKEN_COOKIE,
  )?.value;

  if (isProtectedPath(pathname)) {
    if (!accessToken) {
      return NextResponse.redirect(buildLoginRedirect(request));
    }

    const tokenValid = await isSupabaseTokenValid(accessToken);
    if (!tokenValid) {
      const response = NextResponse.redirect(buildLoginRedirect(request));
      clearAuthCookies(response);
      return response;
    }

    return NextResponse.next();
  }

  if (isAuthPage(pathname) && accessToken && !forceAuthPage) {
    const tokenValid = await isSupabaseTokenValid(accessToken);
    if (tokenValid) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = "/dashboard";
      dashboardUrl.search = "";
      return NextResponse.redirect(dashboardUrl);
    }

    const response = NextResponse.next();
    clearAuthCookies(response);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
