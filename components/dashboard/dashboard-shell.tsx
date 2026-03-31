"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  ChevronRight,
  Menu,
  LayoutDashboard,
  LogOut,
  Plus,
  ReceiptText,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";
import {
  canAccessDashboardFeature,
  getEffectivePlanKey,
  getPlanName,
} from "@/lib/plan-access";

type NavItemConfig = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

const PRIMARY_NAV: NavItemConfig[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/follow-ups", label: "Follow-ups", icon: Bell },
];

const SECONDARY_NAV: NavItemConfig[] = [
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/account", label: "Account", icon: ReceiptText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function NavItem({ href, label, icon: Icon, exact }: NavItemConfig) {
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
          active ? "bg-white/14 text-white" : "bg-white/7 text-white/55 group-hover:bg-white/12 group-hover:text-white",
        ].join(" ")}
      >
        <Icon className="h-4 w-4 shrink-0" />
      </span>

      <span className="min-w-0 truncate">{label}</span>
      {active && <ChevronRight className="ml-auto h-4 w-4 text-white/80" />}
    </Link>
  );
}

function MobileBottomNavItem({ href, label, icon: Icon, exact }: NavItemConfig) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={[
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-2 py-2 text-[10px] font-medium transition-all",
        active ? "text-white" : "text-white/42 hover:text-white/85",
      ].join(" ")}
    >
      <span
        className={[
          "inline-flex h-10 w-10 items-center justify-center rounded-2xl border transition-all",
          active
            ? "border-white/20 bg-white/12 text-white"
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
  canCreateOrders,
  profile,
  business,
}: {
  children: React.ReactNode;
  isAdmin: boolean;
  canCreateOrders: boolean;
  profile?: { full_name?: string | null; email?: string | null } | null;
  business?: {
    name?: string | null;
    billing_plan?: string | null;
    billing_status?: string | null;
    billing_current_period_ends_at?: string | null;
  } | null;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const effectivePlan = getEffectivePlanKey(business);
  const visiblePrimaryNav = PRIMARY_NAV.filter((item) => {
    if (item.href === "/dashboard/customers") {
      return canAccessDashboardFeature("customers", business);
    }

    if (item.href === "/dashboard/follow-ups") {
      return canAccessDashboardFeature("followUps", business);
    }

    return true;
  });
  const visibleSecondaryNav = SECONDARY_NAV.filter((item) => {
    if (item.href === "/dashboard/analytics") {
      return canAccessDashboardFeature("analytics", business);
    }

    return true;
  });
  const pathname = usePathname();
  const currentSection =
    [...visiblePrimaryNav, ...visibleSecondaryNav].find((item) =>
      item.exact ? pathname === item.href : pathname.startsWith(item.href)
    )?.label ??
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
    <div className="min-h-screen bg-[#0b7a43] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-12rem] top-[-10rem] h-[24rem] w-[24rem] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute right-[-8rem] top-[8rem] h-[20rem] w-[20rem] rounded-full bg-white/8 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-[18%] h-[24rem] w-[24rem] rounded-full bg-black/10 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen">
        <aside className="hidden w-[20rem] shrink-0 border-r border-white/10 bg-[#0b653a]/88 xl:flex xl:flex-col 2xl:w-[22rem]">
          <div className="border-b border-white/8 px-6 py-6">
            <Link href="/dashboard" className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl border border-white/16 bg-white/10 text-white shadow-[0_16px_30px_rgba(0,0,0,0.16)]">
                <Wallet className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/40">
                  Seller Operations
                </p>
                <h1 className="text-lg font-black tracking-tight text-white">WHATSBOARD</h1>
              </div>
            </Link>
          </div>

          <div className="px-5 pt-5">
            <div className="rounded-[30px] border border-white/12 bg-white/7 p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/88">
                <ShoppingBag className="h-3.5 w-3.5" />
                Daily Workflow
              </div>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
                Built for chat orders
              </p>
              <h2 className="mt-3 text-lg font-black leading-tight 2xl:text-xl">
                Keep orders, payments, follow-ups, and delivery steps in one place.
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Made for WhatsApp sellers who need less screenshot hunting and clearer daily control.
              </p>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Current plan</p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {getPlanName(effectivePlan)}
                </p>
              </div>

              <Link
                href={
                  canCreateOrders
                    ? "/dashboard/orders/new"
                    : "/pricing?status=upgrade&message=Upgrade%20when%20you%20need%20more%20than%2030%20orders%20this%20month"
                }
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/16 bg-white/12 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/16"
              >
                <Plus className="h-4 w-4" />
                {canCreateOrders ? "Add New Order" : "Upgrade Plan"}
              </Link>

              <div className="mt-5 grid grid-cols-1 gap-3 2xl:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-black/10 p-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Focus</p>
                  <p className="mt-2 text-sm font-semibold text-white">Order control</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/10 p-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Priority</p>
                  <p className="mt-2 text-sm font-semibold text-white">Fast follow-up</p>
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-5 py-5">
            {visiblePrimaryNav.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </nav>

          <div className="border-t border-white/8 p-5">
            <div className="mb-3 space-y-1">
              {visibleSecondaryNav.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </div>

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
                Focused on orders, payments, customers, and follow-ups.
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
          <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b653a]/82 backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-5 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((value) => !value)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white lg:hidden"
                  aria-label="Open menu"
                  aria-expanded={mobileMenuOpen}
                >
                  <Menu className="h-4 w-4" />
                </button>
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
                <div className="hidden min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white/80 lg:flex">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/16 bg-white/12 text-xs font-bold text-white">
                    {initials}
                  </span>
                  <div className="min-w-0 max-w-[10rem] xl:max-w-[12rem]">
                    <p className="truncate text-sm font-semibold text-white">{userLabel}</p>
                    <p className="text-xs text-white/45">Live workspace</p>
                  </div>
                </div>

                <Link
                  href={
                    canCreateOrders
                      ? "/dashboard/orders/new"
                      : "/pricing?status=upgrade&message=Upgrade%20when%20you%20need%20more%20than%2030%20orders%20this%20month"
                  }
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/16 bg-white/12 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/16"
                >
                  <Plus className="h-4 w-4" />
                  {canCreateOrders ? "New Order" : "Upgrade"}
                </Link>
              </div>
            </div>

            {mobileMenuOpen ? (
              <nav className="border-t border-white/8 lg:hidden">
                <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-2 px-4 py-3 sm:px-5">
                  {visibleSecondaryNav
                    .filter((item) => item.href === "/dashboard/account" || item.href === "/dashboard/settings")
                    .map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                      >
                        <item.icon className="h-3.5 w-3.5" />
                        {item.label}
                      </Link>
                    ))}

                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-2xl border border-red-500/20 bg-white/5 px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/10"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign out
                    </button>
                  </form>
                </div>
              </nav>
            ) : null}
          </header>

          <main className="w-full max-w-[1600px] flex-1 px-3 py-4 pb-24 sm:px-4 lg:px-8 lg:py-8 lg:pb-8">
            {children}
          </main>

          <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0b653a]/92 backdrop-blur-xl lg:hidden">
            <div className="mx-auto flex max-w-screen-sm items-stretch justify-between px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
              {visiblePrimaryNav.slice(0, 5).map((item) => (
                <MobileBottomNavItem key={item.href} {...item} />
              ))}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
