"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Bell,
  BarChart3,
  Settings,
  Plus,
  LogOut,
  ChevronRight,
  Wallet,
} from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/follow-ups", label: "Follow-ups", icon: Bell },
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
        "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all",
        active
          ? "bg-emerald-500 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      ].join(" ")}
    >
      <span
        className={[
          "inline-flex h-10 w-10 items-center justify-center rounded-2xl transition-colors",
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
          "inline-flex h-10 w-10 items-center justify-center rounded-2xl transition-all",
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
        <aside className="hidden w-80 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="border-b border-slate-100 px-6 py-5">
            <Link href="/dashboard" className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-500 text-white shadow-sm">
                <Wallet className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Fintech Seller OS
                </p>
                <h1 className="text-lg font-black tracking-tight text-slate-900">WHATSBOARD</h1>
              </div>
            </Link>
          </div>

          <div className="px-5 pt-5">
            <div className="rounded-[28px] bg-slate-950 p-5 text-white shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
                Control Center
              </p>
              <h2 className="mt-3 text-xl font-black leading-tight">
                Money, orders, and follow-ups in one clean view.
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Less chaos. Better visibility. Faster decisions.
              </p>

              <Link
                href="/dashboard/orders/new"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                <Plus className="h-4 w-4" />
                Add New Order
              </Link>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-5 py-5">
            {NAV.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </nav>

          <div className="border-t border-slate-100 p-5">
            {isAdmin && (
              <div className="mb-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-xs font-semibold text-emerald-700">Admin Access</p>
                <p className="mt-1 text-xs text-emerald-600">
                  {profile?.full_name || profile?.email || "Admin"}
                </p>
                {business?.name ? (
                  <p className="mt-1 text-[11px] text-emerald-500">
                    Business: {business.name}
                  </p>
                ) : null}
              </div>
            )}

            <div className="mb-3 rounded-2xl bg-slate-50 p-3">
              <p className="text-xs font-semibold text-slate-900">Operations Mode</p>
              <p className="mt-1 text-xs text-slate-500">
                Built for fast-moving online sellers in East Africa.
              </p>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
                  <LogOut className="h-4 w-4" />
                </span>
                Sign out
              </button>
            </form>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-4 py-3 sm:px-5 lg:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Dashboard
                </p>
                <h2 className="text-lg font-black tracking-tight text-slate-900">
                  {business?.name || "Your Business Overview"}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/analytics"
                  className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
                >
                  View Analytics
                </Link>
                <Link
                  href="/dashboard/orders/new"
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
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
