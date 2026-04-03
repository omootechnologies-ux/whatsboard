"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  clearAuthSessionCookies,
  persistAuthSessionCookies,
} from "@/lib/auth/cookies";

type AuthMode = "login" | "register";

function resolveAuthErrorMessage(error: unknown) {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("invalid login credentials")) {
      return "Email or password is incorrect. Please try again.";
    }
    if (message.includes("email not confirmed")) {
      return "Please confirm your email first, then sign in.";
    }
    if (message.includes("user already registered")) {
      return "This email is already registered. Please sign in instead.";
    }
    if (message.includes("password should be at least")) {
      return "Password must be at least 8 characters.";
    }
    if (message.includes("missing required env var")) {
      return "Authentication is not configured correctly. Contact support.";
    }
    return error.message;
  }
  return "Something went wrong. Please try again.";
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
  accessToken: string;
  businessName?: string;
}) {
  const response = await fetch("/api/auth/bootstrap", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${options.accessToken}`,
    },
    body: JSON.stringify({
      businessName: options.businessName || undefined,
    }),
  });

  if (response.ok) return;

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
  };
  throw new Error(payload.error || "Failed to prepare your business profile.");
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [redirectPath, setRedirectPath] = useState("/dashboard");
  const [forceAuthFlow, setForceAuthFlow] = useState(false);
  const [paramsReady, setParamsReady] = useState(false);

  const isRegister = mode === "register";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRedirectPath(getRedirectPath(params.get("next")));
    setForceAuthFlow(params.get("force") === "1");
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
          setErrorMessage(resolveAuthErrorMessage(error));
          return;
        }

        if (data.session) {
          persistAuthSessionCookies(data.session);
          await bootstrapBusinessContext({
            accessToken: data.session.access_token,
          });
          router.replace(redirectPath);
          router.refresh();
          return;
        }
        clearAuthSessionCookies();
      } catch (error) {
        setErrorMessage(resolveAuthErrorMessage(error));
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
  }, [forceAuthFlow, paramsReady, redirectPath, router]);

  if (isCheckingSession) {
    return (
      <div className="wb-shell-card w-full max-w-lg p-8">
        <div className="flex items-center gap-3 text-[var(--color-wb-text-muted)]">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--color-wb-primary)]" />
          <span className="text-sm font-semibold">
            Checking your session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="wb-shell-card w-full max-w-lg p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-wb-primary)]">
        {isRegister ? "Create account" : "Welcome back"}
      </p>
      <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[var(--color-wb-text)] sm:text-4xl">
        {isRegister
          ? "Open your WhatsBoard workspace"
          : "Sign in to WhatsBoard"}
      </h1>
      <p className="mt-3 text-sm leading-7 text-[var(--color-wb-text-muted)] sm:text-base">
        {isRegister
          ? "Set up your seller workspace for orders, payments, follow-ups, and customer tracking."
          : "Access your seller control room and continue managing daily operations."}
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
              setErrorMessage("Email and password are required.");
              return;
            }
            if (!email.includes("@")) {
              setErrorMessage("Enter a valid email address.");
              return;
            }
            if (isRegister && password.length < 8) {
              setErrorMessage("Password must be at least 8 characters.");
              return;
            }
            if (isRegister && password !== confirmPassword) {
              setErrorMessage("Passwords do not match.");
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
                setErrorMessage(resolveAuthErrorMessage(error));
                return;
              }

              if (!data.session) {
                setInfoMessage(
                  "Account created. Check your email to verify before signing in.",
                );
                clearAuthSessionCookies();
                return;
              }

              persistAuthSessionCookies(data.session);
              await bootstrapBusinessContext({
                accessToken: data.session.access_token,
                businessName,
              });
              router.push(redirectPath);
              router.refresh();
              return;
            }

            const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });

            if (error) {
              setErrorMessage(resolveAuthErrorMessage(error));
              return;
            }

            if (!data.session) {
              const { data: sessionData } = await supabase.auth.getSession();
              if (!sessionData.session) {
                setErrorMessage(
                  "Login succeeded but session is not active yet. Refresh and try again.",
                );
                clearAuthSessionCookies();
                return;
              }
              persistAuthSessionCookies(sessionData.session);
              await bootstrapBusinessContext({
                accessToken: sessionData.session.access_token,
              });
            } else {
              persistAuthSessionCookies(data.session);
              await bootstrapBusinessContext({
                accessToken: data.session.access_token,
              });
            }

            router.push(redirectPath);
            router.refresh();
          } catch (error) {
            setErrorMessage(resolveAuthErrorMessage(error));
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        {isRegister ? (
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-wb-text-muted)]">
              Business Name
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
            Email
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
            Password
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
              Confirm Password
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
              Please wait...
            </>
          ) : isRegister ? (
            "Create account"
          ) : (
            "Login"
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
          Powered by Supabase Auth
        </p>
        {isRegister ? (
          <Link
            href="/login?force=1"
            className="font-semibold text-[var(--color-wb-primary)]"
          >
            Already have an account?
          </Link>
        ) : (
          <Link
            href="/register?force=1"
            className="font-semibold text-[var(--color-wb-primary)]"
          >
            Create account
          </Link>
        )}
      </div>
    </div>
  );
}
