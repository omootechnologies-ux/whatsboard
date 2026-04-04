"use client";

import Image from "next/image";
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
          ? "border-white/20 bg-[var(--color-wb-primary)]/95 shadow-[0_16px_36px_rgba(10,61,46,0.35)] backdrop-blur-xl"
          : "border-transparent bg-[var(--color-wb-primary)]"
      }`}
    >
      <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-[0_16px_30px_rgba(0,0,0,0.2)] sm:h-11 sm:w-11">
            <Image
              src="/whatsboard-logo.png"
              alt="WhatsBoard logo"
              width={40}
              height={40}
              className="h-8 w-8 object-contain sm:h-9 sm:w-9"
            />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="text-xs font-semibold tracking-[0.18em] text-white/75 sm:text-sm sm:tracking-[0.2em]">
              WHATSBOARD
            </p>
            <p className="hidden text-sm font-black tracking-[-0.03em] text-white sm:block">
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
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login?next=%2Fdashboard"
            className="inline-flex items-center justify-center rounded-xl border border-white/35 bg-transparent px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Watch Demo
          </Link>
          <Link
            href="/register?force=1"
            className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[var(--color-wb-primary)] transition hover:bg-white/90"
          >
            Start Free
          </Link>
        </div>

        <button
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/30 bg-white/10 text-white md:hidden"
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/20 bg-[var(--color-wb-primary)] md:hidden">
          <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-1 px-4 py-3 sm:px-6">
            {navLinks.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                    active ? "bg-white/20 text-white" : "text-white/85"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-2 grid grid-cols-2 gap-2 max-[360px]:grid-cols-1">
              <Link
                href="/login?next=%2Fdashboard"
                className="inline-flex items-center justify-center rounded-xl border border-white/35 bg-transparent px-4 py-2 text-sm font-semibold text-white"
              >
                Watch Demo
              </Link>
              <Link
                href="/register?force=1"
                className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[var(--color-wb-primary)]"
              >
                Start Free
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
