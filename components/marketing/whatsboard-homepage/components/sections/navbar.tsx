"use client";

import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500 text-sm font-black text-white">
            W
          </span>
          <div className="leading-tight">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Seller OS
            </p>
            <p className="text-base font-black tracking-tight text-slate-900">
              WHATSBOARD
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Log in
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            Get Started
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-2xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Log in
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
