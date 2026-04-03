"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/login", label: "Login" },
];

export function PublicNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition ${
        scrolled
          ? "border-[var(--color-wb-border)] bg-[var(--color-wb-background)]/96 backdrop-blur-xl"
          : "border-transparent bg-[var(--color-wb-background)]/90"
      }`}
    >
      <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-wb-primary)] text-sm font-black text-white shadow-[0_16px_30px_rgba(15,93,70,0.25)]">
            WB
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-[0.2em] text-[var(--color-wb-text-muted)]">
              WHATSBOARD
            </p>
            <p className="text-sm font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
              Sales Control
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navLinks.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-[var(--color-wb-primary-soft)] text-[var(--color-wb-primary)]"
                    : "text-[var(--color-wb-text-muted)] hover:text-[var(--color-wb-text)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login?next=%2Fdashboard" className="wb-button-secondary">
            Watch Demo
          </Link>
          <Link href="/register?force=1" className="wb-button-primary">
            Start Free
          </Link>
        </div>

        <button
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-wb-border)] bg-white md:hidden"
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-[var(--color-wb-border)] bg-white md:hidden">
          <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-1 px-4 py-3 sm:px-6">
            {navLinks.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                    active
                      ? "bg-[var(--color-wb-primary-soft)] text-[var(--color-wb-primary)]"
                      : "text-[var(--color-wb-text-muted)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link
                href="/login?next=%2Fdashboard"
                className="wb-button-secondary"
              >
                Watch Demo
              </Link>
              <Link href="/register?force=1" className="wb-button-primary">
                Start Free
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
