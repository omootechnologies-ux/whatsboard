"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/(auth)/actions";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Bell,
  BarChart2,
  Settings,
  Plus,
  LogOut,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/follow-ups", label: "Follow-ups", icon: Bell },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function NavItem({ href, label, icon: Icon, exact }: (typeof NAV)[0]) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={[
        "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all",
        active
          ? "bg-emerald-500 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      ].join(" ")}
    >
      <span
        className={[
          "inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
          active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-white",
        ].join(" ")}
      >
        <Icon className="h-4 w-4 shrink-0" />
      </span>

      <span>{label}</span>
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
        active ? "text-emerald-600" : "text-slate-400 hover:text-slate-700",
      ].join(" ")}
    >
      <span
        className={[
          "inline-flex h-9 w-9 items-center justify-center rounded-2xl transition-all",
          active ? "bg-emerald-50 text-emerald-600" : "text-inherit",
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
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="border-b border-slate-100 px-5 py-5">
            <Link href="/dashboard" className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-sm">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Seller OS
                </p>
                <h1 className="text-lg font-black tracking-tight text-slate-900">WHATSBOARD</h1>
              </div>
            </Link>
          </div>

          <div className="px-4 pt-5">
            <div className="rounded-3xl bg-slate-950 p-4 text-white shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
                    Today
                  </p>
                  <h2 className="mt-2 text-lg font-bold leading-tight">
                    Orders should move, not hide in chats.
                  </h2>
                </div>
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>

              <Link
                href="/dashboard/orders/new"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                <Plus className="h-4 w-4" />
                New Order
              </Link>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-4 py-5">
            {NAV.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </nav>

          <div className="border-t border-slate-100 p-4">
            {isAdmin && (
              <div className="mb-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-xs font-semibold text-emerald-700">Admin Access</p>
                <p className="mt-1 text-xs text-emerald-600">
                  Signed in as {profile?.full_name || profile?.email || "Admin"}.
                </p>
                {business?.name ? (
                  <p className="mt-1 text-[11px] text-emerald-500">
                    Business: {business.name}
                  </p>
                ) : null}
              </div>
            )}

            <div className="mb-3 rounded-2xl bg-slate-50 p-3">
              <p className="text-xs font-semibold text-slate-900">Starter Plan</p>
              <p className="mt-1 text-xs text-slate-500">Built for fast-moving online sellers.</p>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                  <LogOut className="h-4 w-4" />
                </span>
                Sign out
              </button>
            </form>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur lg:hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <Link href="/dashboard" className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-sm font-black tracking-tight text-slate-900">WHATSBOARD</span>
              </Link>

              <Link
                href="/dashboard/orders/new"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-white"
              >
                <Plus className="h-3.5 w-3.5" />
                New
              </Link>
            </div>
          </header>

          <main className="w-full max-w-[1600px] flex-1 px-3 py-4 pb-24 sm:px-4 lg:px-8 lg:py-8 lg:pb-8">
            {children}
          </main>

          <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
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
