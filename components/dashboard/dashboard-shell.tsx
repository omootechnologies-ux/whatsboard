"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Package2,
  Plus,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";
import { LanguageToggle } from "@/components/i18n/language-toggle";
import { useLanguage } from "@/components/i18n/language-provider";
import { canAccessDashboardFeatureForUser, getEffectivePlanKey, getPlanName } from "@/lib/plan-access";

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
  { href: "/dashboard/catalog", label: "Catalog", icon: Package2 },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/team", label: "Team", icon: Users },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function AppNavItem({
  item,
  collapsed = false,
  onClick,
}: {
  item: NavItemConfig;
  collapsed?: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={[
        "group flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-medium transition-all",
        active
          ? "border-[#d8e7df] bg-[#edf7f2] text-[#0f5d46] shadow-[0_16px_32px_rgba(15,93,70,0.08)]"
          : "border-transparent text-[#42514a] hover:border-[#e2e9e4] hover:bg-[#f6faf8] hover:text-[#173728]",
        collapsed ? "justify-center px-0" : "",
      ].join(" ")}
      title={collapsed ? t(item.label) : undefined}
    >
      <span
        className={[
          "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-colors",
          active
            ? "border-[#d4e3db] bg-white text-[#0f5d46]"
            : "border-[#edf2ef] bg-[#f9fbfa] text-[#5e6461] group-hover:border-[#dce8e0] group-hover:text-[#173728]",
        ].join(" ")}
      >
        <Icon className="h-4 w-4" />
      </span>
      {!collapsed ? (
        <>
          <span className="min-w-0 truncate">{t(item.label)}</span>
          {active ? <ChevronRight className="ml-auto h-4 w-4 text-[#0f5d46]" /> : null}
        </>
      ) : null}
    </Link>
  );
}

function MobileBottomNavItem({ item }: { item: NavItemConfig }) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={[
        "flex flex-1 min-w-0 flex-col items-center justify-center gap-1 px-2 py-2 text-[10px] font-semibold transition-all",
        active ? "text-[#0f5d46]" : "text-[#6c7a74]",
      ].join(" ")}
    >
      <span
        className={[
          "inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition-all",
          active ? "border-[#d8e7df] bg-[#edf7f2]" : "border-transparent bg-transparent",
        ].join(" ")}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="truncate">{t(item.label)}</span>
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
  const { t } = useLanguage();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const effectivePlan = getEffectivePlanKey(business);
  const userLabel = profile?.full_name || profile?.email || t("Team Member");
  const initials =
    userLabel
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "WB";

  const visiblePrimaryNav = useMemo(
    () =>
      PRIMARY_NAV.filter((item) => {
        if (item.href === "/dashboard/customers") {
          return canAccessDashboardFeatureForUser("customers", business, isAdmin);
        }

        if (item.href === "/dashboard/follow-ups") {
          return canAccessDashboardFeatureForUser("followUps", business, isAdmin);
        }

        return true;
      }),
    [business, isAdmin]
  );

  const visibleSecondaryNav = useMemo(
    () =>
      SECONDARY_NAV.filter((item) => {
        if (item.href === "/dashboard/catalog") {
          return canAccessDashboardFeatureForUser("catalog", business, isAdmin);
        }

        if (item.href === "/dashboard/analytics") {
          return canAccessDashboardFeatureForUser("analytics", business, isAdmin);
        }

        return true;
      }),
    [business, isAdmin]
  );

  const currentSection =
    [...visiblePrimaryNav, ...visibleSecondaryNav].find((item) =>
      item.exact ? pathname === item.href : pathname.startsWith(item.href)
    )?.label ?? "Overview";

  const floatingOrderHref = canCreateOrders
    ? "/dashboard/orders/new"
    : "/pricing?status=upgrade&message=Upgrade%20to%20Starter%20for%20more%20orders";

  return (
    <div className="min-h-screen bg-[#f7faf8] text-[#111111]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-12rem] top-[-10rem] h-[28rem] w-[28rem] rounded-full bg-[#0f5d46]/6 blur-3xl" />
        <div className="absolute right-[-8rem] top-[6rem] h-[22rem] w-[22rem] rounded-full bg-black/4 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen">
        <aside
          className={[
            "hidden shrink-0 border-r border-[#dfe7e2] bg-white transition-[width] duration-300 lg:flex lg:flex-col",
            desktopCollapsed ? "lg:w-[6rem]" : "lg:w-[18.75rem]",
          ].join(" ")}
        >
          <div className="flex items-center justify-between border-b border-[#eef2ef] px-4 py-5">
            <Link href="/dashboard" className={`flex items-center gap-3 ${desktopCollapsed ? "mx-auto" : ""}`}>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-[#0f5d46] text-white shadow-[0_16px_32px_rgba(15,93,70,0.16)]">
                <ShoppingBag className="h-5 w-5" />
              </span>
              {!desktopCollapsed ? (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#5e6461]">Folapp</p>
                  <p className="text-sm font-black tracking-[-0.03em] text-[#111111]">
                    Chat chaos to control
                  </p>
                </div>
              ) : null}
            </Link>
            {!desktopCollapsed ? (
              <button
                type="button"
                onClick={() => setDesktopCollapsed(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#e6ece8] bg-[#f9fbfa] text-[#5e6461]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          {desktopCollapsed ? (
            <div className="px-3 pt-4">
              <button
                type="button"
                onClick={() => setDesktopCollapsed(false)}
                className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-[#e6ece8] bg-[#f9fbfa] text-[#173728]"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="px-4 pt-4">
              <div className="rounded-[28px] border border-[#dfe7e2] bg-[#f8fbf9] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5e6461]">
                  {t("Current plan")}
                </p>
                <p className="mt-2 text-lg font-black tracking-[-0.03em] text-[#111111]">{getPlanName(effectivePlan)}</p>
                <p className="mt-2 text-sm leading-6 text-[#5e6461]">
                  Orders, customers, payments, and follow-ups in one workflow.
                </p>
                <Link
                  href={floatingOrderHref}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f5d46] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0a3d2e]"
                >
                  <Plus className="h-4 w-4" />
                  {canCreateOrders ? t("Add New Order") : t("Upgrade Plan")}
                </Link>
              </div>
            </div>
          )}

          <nav className="flex-1 space-y-5 px-3 py-5">
            <div className="space-y-2">
              {!desktopCollapsed ? (
                <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5e6461]">
                  Operations
                </p>
              ) : null}
              {visiblePrimaryNav.map((item) => (
                <AppNavItem key={item.href} item={item} collapsed={desktopCollapsed} />
              ))}
            </div>
            <div className="space-y-2">
              {!desktopCollapsed ? (
                <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5e6461]">
                  Workspace
                </p>
              ) : null}
              {visibleSecondaryNav.map((item) => (
                <AppNavItem key={item.href} item={item} collapsed={desktopCollapsed} />
              ))}
            </div>
          </nav>

          <div className="border-t border-[#eef2ef] p-3">
            <div className={`rounded-[24px] border border-[#e6ece8] bg-[#f9fbfa] p-3 ${desktopCollapsed ? "text-center" : ""}`}>
              <div className={`flex items-center gap-3 ${desktopCollapsed ? "justify-center" : ""}`}>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0f5d46] text-sm font-bold text-white">
                  {initials}
                </span>
                {!desktopCollapsed ? (
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#111111]">{userLabel}</p>
                    <p className="text-xs text-[#5e6461]">{business?.name || "Live workspace"}</p>
                  </div>
                ) : null}
              </div>
              {!desktopCollapsed && isAdmin ? (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#edf7f2] px-3 py-1 text-[11px] font-semibold text-[#0f5d46]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {t("Admin Access")}
                </div>
              ) : null}
            </div>

            <form action={logoutAction} className="mt-3">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#e6ece8] bg-white px-3 py-3 text-sm font-medium text-[#5e6461] transition hover:bg-[#f8faf8] hover:text-[#173728]"
              >
                <LogOut className="h-4 w-4" />
                {!desktopCollapsed ? t("Sign out") : null}
              </button>
            </form>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-[#dfe7e2] bg-[#f7faf8]/92 backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-[1680px] items-center justify-between gap-3 px-4 py-3 sm:px-5 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#dfe7e2] bg-white text-[#173728] lg:hidden"
                >
                  <Menu className="h-4 w-4" />
                </button>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5e6461]">{t(currentSection)}</p>
                  <h2 className="truncate text-lg font-black tracking-[-0.03em] text-[#111111]">
                    {business?.name || "Seller workspace"}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden items-center gap-3 rounded-2xl border border-[#dfe7e2] bg-white px-3 py-2 md:flex">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#edf7f2] text-sm font-bold text-[#0f5d46]">
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="max-w-[11rem] truncate text-sm font-semibold text-[#111111]">{userLabel}</p>
                    <p className="text-xs text-[#5e6461]">{getPlanName(effectivePlan)}</p>
                  </div>
                </div>
                <LanguageToggle />
              </div>
            </div>
          </header>

          {mobileMenuOpen ? (
            <div className="fixed inset-0 z-40 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="absolute inset-0 bg-black/30"
                aria-label="Close menu"
              />
              <div className="absolute left-0 top-0 h-full w-[86vw] max-w-[22rem] border-r border-[#dfe7e2] bg-white p-4 shadow-[0_24px_60px_rgba(17,17,17,0.18)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-[#0f5d46] text-white">
                      <ShoppingBag className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-black text-[#111111]">Folapp</p>
                      <p className="text-xs text-[#5e6461]">{business?.name || "Seller workspace"}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#dfe7e2] bg-[#f9fbfa] text-[#173728]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-5 rounded-[24px] border border-[#dfe7e2] bg-[#f8fbf9] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5e6461]">Quick action</p>
                  <Link
                    href={floatingOrderHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f5d46] px-4 py-3 text-sm font-semibold text-white"
                  >
                    <Plus className="h-4 w-4" />
                    {canCreateOrders ? t("New Order") : t("Upgrade")}
                  </Link>
                </div>

                <div className="mt-5 space-y-5">
                  <div className="space-y-2">
                    <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5e6461]">Operations</p>
                    {visiblePrimaryNav.map((item) => (
                      <AppNavItem key={item.href} item={item} onClick={() => setMobileMenuOpen(false)} />
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5e6461]">Workspace</p>
                    {visibleSecondaryNav.map((item) => (
                      <AppNavItem key={item.href} item={item} onClick={() => setMobileMenuOpen(false)} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <main className="mx-auto w-full max-w-[1680px] flex-1 px-3 py-4 pb-28 sm:px-4 lg:px-8 lg:py-6 lg:pb-10">
            {children}
          </main>

          <Link
            href={floatingOrderHref}
            className="fixed bottom-24 right-4 z-30 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#0f5d46] px-5 text-sm font-semibold text-white shadow-[0_24px_44px_rgba(15,93,70,0.28)] transition hover:bg-[#0a3d2e] lg:bottom-8 lg:right-8"
          >
            <Plus className="h-4 w-4" />
            {canCreateOrders ? t("Add New Order") : t("Upgrade Plan")}
          </Link>

          <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#dfe7e2] bg-white/96 backdrop-blur-xl lg:hidden">
            <div className="mx-auto flex max-w-screen-sm items-stretch justify-between px-2 pb-[max(0.55rem,env(safe-area-inset-bottom))] pt-2">
              {visiblePrimaryNav.slice(0, 4).map((item) => (
                <MobileBottomNavItem key={item.href} item={item} />
              ))}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
