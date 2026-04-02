"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

type AuthMode = "login" | "register";

export function AuthPlaceholderForm({ mode }: { mode: AuthMode }) {
  const [message, setMessage] = useState<string | null>(null);

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
        onSubmit={(event) => {
          event.preventDefault();
          setMessage(
            "Authentication backend wiring is pending in this app build. UI route is active and ready for integration.",
          );
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

        <button type="submit" className="wb-button-primary w-full justify-center">
          {isRegister ? "Create account" : "Login"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      {message ? (
        <div className="mt-4 rounded-2xl border border-[var(--color-wb-border)] bg-[var(--color-wb-primary-soft)] p-4 text-sm text-[var(--color-wb-primary)]">
          {message}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-2 text-sm text-[var(--color-wb-text-muted)] sm:flex-row sm:items-center sm:justify-between">
        <p className="inline-flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[var(--color-wb-primary)]" />
          Ready for Supabase Auth integration
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

      <Link
        href="/dashboard"
        className="mt-4 inline-flex text-sm font-semibold text-[var(--color-wb-text)] underline underline-offset-4"
      >
        Continue to dashboard demo
      </Link>
    </div>
  );
}
