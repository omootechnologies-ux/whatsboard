"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { clearAuthSessionCookies } from "@/lib/auth/cookies";

type AuthMode = "login" | "register";

type TranslateFn = (key: string) => string;

function resolveAuthErrorMessage(error: unknown, t: TranslateFn) {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("invalid login credentials")) {
      return t("auth.errors.invalidCredentials");
    }
    if (message.includes("email not confirmed")) {
      return t("auth.errors.emailNotConfirmed");
    }
    if (message.includes("user already registered")) {
      return t("auth.errors.alreadyRegistered");
    }
    if (message.includes("password should be at least")) {
      return t("auth.errors.passwordMinLength");
    }
    if (message.includes("missing required env var")) {
      return t("auth.errors.authNotConfigured");
    }
    if (
      message.includes("blocked session cookie") ||
      message.includes("could not persist session")
    ) {
      return t("auth.errors.cookiesBlocked");
    }
    return error.message;
  }
  return t("auth.errors.generic");
}

function getRedirectPath(nextParam: string | null) {
  if (!nextParam) return "/dashboard";
  if (!nextParam.startsWith("/") || nextParam.startsWith("//")) {
    return "/dashboard";
  }
  if (nextParam.startsWith("/login") || nextParam.startsWith("/register")) {
    return "/dashboard";
  }
  return nextParam;
}

async function bootstrapBusinessContext(options: {
  session: Session;
  businessName?: string;
  referralToken?: string | null;
}) {
  const response = await fetch("/api/auth/bootstrap", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      accessToken: options.session.access_token,
      refreshToken: options.session.refresh_token,
      expiresAt: options.session.expires_at,
      businessName: options.businessName || undefined,
      referralToken: options.referralToken || undefined,
    }),
  });

  if (response.ok) return;

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
  };
  throw new Error(payload.error || "bootstrap_failed");
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const t = useTranslations();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [redirectPath, setRedirectPath] = useState("/dashboard");
  const [forceAuthFlow, setForceAuthFlow] = useState(false);
  const [paramsReady, setParamsReady] = useState(false);
  const [authSwitchQuery, setAuthSwitchQuery] = useState("");
  const [referralToken, setReferralToken] = useState<string | null>(null);
  const redirectInFlightRef = useRef(false);

  const isRegister = mode === "register";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRedirectPath(getRedirectPath(params.get("next")));
    setForceAuthFlow(params.get("force") === "1");
    const switchParams = new URLSearchParams();
    const next = params.get("next");
    const plan = params.get("plan");
    const force = params.get("force");
    const ref = params.get("ref");
    if (next) switchParams.set("next", next);
    if (plan) switchParams.set("plan", plan);
    if (force === "1") switchParams.set("force", "1");
    if (ref) switchParams.set("ref", ref);
    setReferralToken(ref);
    const nextQuery = switchParams.toString();
    setAuthSwitchQuery(nextQuery ? `?${nextQuery}` : "");
    setParamsReady(true);
  }, []);

  useEffect(() => {
    if (!paramsReady) return;
    let mounted = true;

    async function checkSession() {
      if (forceAuthFlow) {
        if (mounted) {
          setIsCheckingSession(false);
        }
        return;
      }

      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setErrorMessage(resolveAuthErrorMessage(error, t));
          return;
        }

        if (data.session) {
          await bootstrapBusinessContext({
            session: data.session,
            referralToken,
          });
          if (!redirectInFlightRef.current) {
            redirectInFlightRef.current = true;
            window.location.assign(redirectPath);
          }
          return;
        }
        clearAuthSessionCookies();
      } catch (error) {
        redirectInFlightRef.current = false;
        const resolvedMessage =
          error instanceof Error && error.message === "bootstrap_failed"
            ? t("auth.errors.bootstrapFailed")
            : resolveAuthErrorMessage(error, t);
        setErrorMessage(resolvedMessage);
      } finally {
        if (mounted) {
          setIsCheckingSession(false);
        }
      }
    }

    checkSession();

    return () => {
      mounted = false;
    };
  }, [forceAuthFlow, paramsReady, redirectPath, referralToken, t]);

  if (isCheckingSession) {
    return (
      <div className="wb-shell-card w-full max-w-lg p-8">
        <div className="flex items-center gap-3 text-[var(--color-wb-text-muted)]">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--color-wb-primary)]" />
            <span className="text-sm font-semibold">
              {t("auth.checkingSession")}
            </span>
          </div>
      </div>
    );
  }

  return (
    <div className="wb-shell-card w-full max-w-lg p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-wb-primary)]">
        {isRegister ? t("auth.createAccount") : t("auth.welcomeBack")}
      </p>
      <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[var(--color-wb-text)] sm:text-4xl">
        {isRegister
          ? t("auth.openWorkspace")
          : t("auth.signInTitle")}
      </h1>
      <p className="mt-3 text-sm leading-7 text-[var(--color-wb-text-muted)] sm:text-base">
        {isRegister
          ? t("auth.registerDescription")
          : t("auth.loginDescription")}
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setErrorMessage(null);
          setInfoMessage(null);
          setIsSubmitting(true);

          try {
            const formData = new FormData(event.currentTarget);
            const email = String(formData.get("email") || "").trim();
            const password = String(formData.get("password") || "");
            const confirmPassword = String(
              formData.get("confirmPassword") || "",
            );
            const businessName = String(
              formData.get("businessName") || "",
            ).trim();

            if (!email || !password) {
              setErrorMessage(t("auth.errors.emailPasswordRequired"));
              return;
            }
            if (!email.includes("@")) {
              setErrorMessage(t("auth.errors.invalidEmail"));
              return;
            }
            if (isRegister && password.length < 8) {
              setErrorMessage(t("auth.errors.passwordMinLength"));
              return;
            }
            if (isRegister && password !== confirmPassword) {
              setErrorMessage(t("auth.errors.passwordMismatch"));
              return;
            }

            const supabase = createSupabaseBrowserClient();

            if (isRegister) {
              const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                  data: {
                    business_name: businessName || undefined,
                  },
                },
              });

              if (error) {
                setErrorMessage(resolveAuthErrorMessage(error, t));
                return;
              }

              if (!data.session) {
                setInfoMessage(t("auth.messages.checkEmail"));
                clearAuthSessionCookies();
                return;
              }

              await bootstrapBusinessContext({
                session: data.session,
                businessName,
                referralToken,
              });
              window.location.assign(redirectPath);
              return;
            }

            const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });

            if (error) {
              setErrorMessage(resolveAuthErrorMessage(error, t));
              return;
            }

            if (!data.session) {
              const { data: sessionData } = await supabase.auth.getSession();
              if (!sessionData.session) {
                setErrorMessage(
                  t("auth.errors.sessionNotActive"),
                );
                clearAuthSessionCookies();
                return;
              }
              await bootstrapBusinessContext({
                session: sessionData.session,
                referralToken,
              });
            } else {
              await bootstrapBusinessContext({
                session: data.session,
                referralToken,
              });
            }

            window.location.assign(redirectPath);
          } catch (error) {
            const resolvedMessage =
              error instanceof Error && error.message === "bootstrap_failed"
                ? t("auth.errors.bootstrapFailed")
                : resolveAuthErrorMessage(error, t);
            setErrorMessage(resolvedMessage);
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        {isRegister ? (
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-wb-text-muted)]">
              {t("auth.businessName")}
            </span>
            <input
              name="businessName"
              required
              placeholder="Amani Collections"
              className="wb-input"
              autoComplete="organization"
            />
          </label>
        ) : null}

        <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-wb-text-muted)]">
              {t("auth.email")}
            </span>
          <input
            name="email"
            type="email"
            required
            placeholder="you@business.com"
            className="wb-input"
            autoComplete="email"
          />
        </label>

        <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-wb-text-muted)]">
              {t("auth.password")}
            </span>
          <input
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="wb-input"
            autoComplete={isRegister ? "new-password" : "current-password"}
          />
        </label>

        {isRegister ? (
          <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-wb-text-muted)]">
                {t("auth.confirmPassword")}
              </span>
            <input
              name="confirmPassword"
              type="password"
              required
              placeholder="••••••••"
              className="wb-input"
              autoComplete="new-password"
            />
          </label>
        ) : null}

        <button
          type="submit"
          className="wb-button-primary w-full justify-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("auth.pleaseWait")}
            </>
          ) : isRegister ? (
            t("auth.createAccountButton")
          ) : (
            t("auth.loginButton")
          )}
          {!isSubmitting ? <ArrowRight className="h-4 w-4" /> : null}
        </button>
      </form>

      {errorMessage ? (
        <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      {infoMessage ? (
        <div className="mt-4 rounded-2xl border border-[var(--color-wb-border)] bg-[var(--color-wb-primary-soft)] p-4 text-sm text-[var(--color-wb-primary)]">
          {infoMessage}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-2 text-sm text-[var(--color-wb-text-muted)] sm:flex-row sm:items-center sm:justify-between">
        <p className="inline-flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[var(--color-wb-primary)]" />
          {t("auth.poweredBy")}
        </p>
        {isRegister ? (
          <Link
            href={`/login${authSwitchQuery}`}
            className="font-semibold text-[var(--color-wb-primary)]"
          >
            {t("auth.alreadyHaveAccount")}
          </Link>
        ) : (
          <Link
            href={`/register${authSwitchQuery}`}
            className="font-semibold text-[var(--color-wb-primary)]"
          >
            {t("auth.switchToCreate")}
          </Link>
        )}
      </div>
    </div>
  );
}
