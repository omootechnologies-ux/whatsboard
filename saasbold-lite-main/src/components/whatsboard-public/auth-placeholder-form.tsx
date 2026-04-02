"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthMode = "login" | "register";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegister = mode === "register";

  return (
    <div className="wb-shell-card w-full max-w-lg p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-wb-primary)]">
        {isRegister ? "Create account" : "Welcome back"}
      </p>
      <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[var(--color-wb-text)] sm:text-4xl">
        {isRegister ? "Open your WhatsBoard workspace" : "Sign in to WhatsBoard"}
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
            const businessName = String(formData.get("businessName") || "").trim();

            if (!email || !password) {
              setErrorMessage("Email and password are required.");
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
                setErrorMessage(error.message);
                return;
              }

              if (!data.session) {
                setInfoMessage(
                  "Account created. Check your email to verify before signing in.",
                );
                return;
              }

              router.push("/dashboard");
              router.refresh();
              return;
            }

            const { error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });

            if (error) {
              setErrorMessage(error.message);
              return;
            }

            router.push("/dashboard");
            router.refresh();
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
          />
        </label>

        <button
          type="submit"
          className="wb-button-primary w-full justify-center"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Please wait..."
            : isRegister
              ? "Create account"
              : "Login"}
          <ArrowRight className="h-4 w-4" />
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
          <Link href="/login" className="font-semibold text-[var(--color-wb-primary)]">
            Already have an account?
          </Link>
        ) : (
          <Link href="/register" className="font-semibold text-[var(--color-wb-primary)]">
            Create account
          </Link>
        )}
      </div>
    </div>
  );
}
