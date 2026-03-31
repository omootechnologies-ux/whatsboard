"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  Boxes,
  ChevronRight,
  Gift,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/follow-ups", label: "Follow-ups", icon: Bell },
  { href: "/dashboard/ai-order-capture", label: "AI Capture", icon: Sparkles },
  { href: "/dashboard/catalog", label: "Catalog", icon: Boxes },
  { href: "/dashboard/referrals", label: "Referrals", icon: Gift },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function NavItem({ href, label, icon: Icon, exact }: (typeof NAV)[0]) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={[
        "group flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-medium transition-all",
        active
          ? "border-emerald-300/20 bg-gradient-to-r from-emerald-400/20 to-cyan-400/10 text-white shadow-[0_18px_40px_rgba(16,185,129,0.12)]"
          : "border-transparent text-white/62 hover:border-white/8 hover:bg-white/6 hover:text-white",
      ].join(" ")}
    >
      <span
        className={[
          "inline-flex h-10 w-10 items-center justify-center rounded-2xl transition-colors",
          active ? "bg-white/12 text-white" : "bg-white/6 text-white/55 group-hover:bg-white/10 group-hover:text-white",
        ].join(" ")}
      >
        <Icon className="h-4 w-4 shrink-0" />
      </span>

      <span className="min-w-0 truncate">{label}</span>
      {active && <ChevronRight className="ml-auto h-4 w-4 text-white/80" />}
    </Link>
  );
}

function MobileBottomNavItem({ href, label, icon: Icon, exact }: (typeof NAV)[0]) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={[
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-2 py-2 text-[10px] font-medium transition-all",
        active ? "text-emerald-200" : "text-white/42 hover:text-white/85",
      ].join(" ")}
    >
      <span
        className={[
          "inline-flex h-10 w-10 items-center justify-center rounded-2xl border transition-all",
          active
            ? "border-emerald-300/20 bg-emerald-400/12 text-emerald-200"
            : "border-transparent bg-transparent text-inherit",
        ].join(" ")}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function DashboardShell({
  children,
  isAdmin,
  profile,
  business,
}: {
  children: React.ReactNode;
  isAdmin: boolean;
  profile?: { full_name?: string | null; email?: string | null } | null;
  business?: { name?: string | null } | null;
}) {
  const pathname = usePathname();
  const currentSection =
    NAV.find((item) => (item.exact ? pathname === item.href : pathname.startsWith(item.href)))?.label ??
    "Overview";
  const userLabel = profile?.full_name || profile?.email || "Team Member";
  const initials =
    userLabel
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "WB";

  return (
    <div className="min-h-screen bg-[#07111f] text-slate-900">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-12rem] top-[-10rem] h-[24rem] w-[24rem] rounded-full bg-emerald-400/16 blur-3xl" />
        <div className="absolute right-[-8rem] top-[8rem] h-[20rem] w-[20rem] rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-[18%] h-[24rem] w-[24rem] rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen">
        <aside className="hidden w-[20rem] shrink-0 border-r border-white/8 bg-[#08111e]/88 xl:flex xl:flex-col 2xl:w-[22rem]">
          <div className="border-b border-white/8 px-6 py-6">
            <Link href="/dashboard" className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-slate-950 shadow-[0_16px_30px_rgba(16,185,129,0.28)]">
                <Wallet className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/40">
                  Seller Treasury OS
                </p>
                <h1 className="text-lg font-black tracking-tight text-white">WHATSBOARD</h1>
              </div>
            </Link>
          </div>

          <div className="px-5 pt-5">
            <div className="rounded-[30px] border border-white/10 bg-white/6 p-5 text-white shadow-[0_24px_80px_rgba(2,8,23,0.45)]">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
                <Sparkles className="h-3.5 w-3.5" />
                Live Control
              </div>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
                Treasury cockpit
              </p>
              <h2 className="mt-3 text-lg font-black leading-tight 2xl:text-xl">
                Cash, pipeline, and customer momentum in one operating view.
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Built to feel less like admin software and more like a compact fintech console.
              </p>

              <Link
                href="/dashboard/orders/new"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-95"
              >
                <Plus className="h-4 w-4" />
                Add New Order
              </Link>

              <div className="mt-5 grid grid-cols-1 gap-3 2xl:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-slate-950/35 p-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Mode</p>
                  <p className="mt-2 text-sm font-semibold text-white">Collections-first</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-slate-950/35 p-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Priority</p>
                  <p className="mt-2 text-sm font-semibold text-white">Fast decisions</p>
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-5 py-5">
            {NAV.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </nav>

          <div className="border-t border-white/8 p-5">
            {isAdmin && (
              <div className="mb-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-4">
                <div className="flex items-center gap-2 text-emerald-100">
                  <ShieldCheck className="h-4 w-4" />
                  <p className="text-xs font-semibold">Admin Access</p>
                </div>
                <p className="mt-2 text-xs text-emerald-100/80">
                  {profile?.full_name || profile?.email || "Admin"}
                </p>
                {business?.name ? (
                  <p className="mt-1 text-[11px] text-emerald-200/75">Business: {business.name}</p>
                ) : null}
              </div>
            )}

            <div className="mb-3 rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="text-xs font-semibold text-white">Operations Mode</p>
              <p className="mt-1 text-xs text-white/55">
                Tuned for mobile-first commerce teams that need clean cash visibility.
              </p>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-2xl border border-white/8 px-3 py-3 text-sm font-medium text-white/65 transition hover:bg-red-500/10 hover:text-red-200"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5">
                  <LogOut className="h-4 w-4" />
                </span>
                Sign out
              </button>
            </form>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-[#07111f]/82 backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-5 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white lg:hidden">
                  <Wallet className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
                    {currentSection}
                  </p>
                  <h2 className="truncate text-lg font-black tracking-tight text-white">
                    {business?.name || "Your Business Overview"}
                  </h2>
                </div>
              </div>

              <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                <form action={logoutAction} className="sm:hidden">
                  <button
                    type="submit"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/80 transition hover:bg-red-500/10 hover:text-red-200"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </form>

                <div className="hidden min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white/80 lg:flex">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-xs font-bold text-slate-950">
                    {initials}
                  </span>
                  <div className="min-w-0 max-w-[10rem] xl:max-w-[12rem]">
                    <p className="truncate text-sm font-semibold text-white">{userLabel}</p>
                    <p className="text-xs text-white/45">Live workspace</p>
                  </div>
                </div>

                <Link
                  href="/dashboard/analytics"
                  className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/85 transition hover:bg-white/10 sm:inline-flex"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  View Analytics
                </Link>
                <Link
                  href="/dashboard/orders/new"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-95"
                >
                  <Plus className="h-4 w-4" />
                  New Order
                </Link>
              </div>
            </div>
          </header>

          <main className="w-full max-w-[1600px] flex-1 px-3 py-4 pb-24 sm:px-4 lg:px-8 lg:py-8 lg:pb-8">
            {children}
          </main>

          <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#07111f]/92 backdrop-blur-xl lg:hidden">
            <div className="mx-auto flex max-w-screen-sm items-stretch justify-between px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
              {NAV.slice(0, 5).map((item) => (
                <MobileBottomNavItem key={item.href} {...item} />
              ))}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
