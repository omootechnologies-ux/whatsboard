"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageToggle } from "@/components/i18n/language-toggle";
import { useLanguage } from "@/components/i18n/language-provider";
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
  canAccessDashboardFeatureForUser,
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
  { href: "/dashboard/catalog", label: "Catalog", icon: ShoppingBag },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/account", label: "Account", icon: ReceiptText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function NavItem({ href, label, icon: Icon, exact }: NavItemConfig) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={[
        "group flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-medium transition-all",
        active
          ? "border-[#173728]/14 bg-[#173728]/6 text-[#173728] shadow-[0_18px_40px_rgba(23,55,40,0.08)]"
          : "border-transparent text-[#173728]/62 hover:border-[#173728]/8 hover:bg-[#173728]/4 hover:text-[#173728]",
      ].join(" ")}
    >
      <span
        className={[
          "inline-flex h-10 w-10 items-center justify-center rounded-2xl transition-colors",
          active ? "bg-[#173728]/10 text-[#173728]" : "bg-[#173728]/5 text-[#173728]/55 group-hover:bg-[#173728]/8 group-hover:text-[#173728]",
        ].join(" ")}
      >
        <Icon className="h-4 w-4 shrink-0" />
      </span>

      <span className="min-w-0 truncate">{t(label)}</span>
      {active && <ChevronRight className="ml-auto h-4 w-4 text-[#173728]/80" />}
    </Link>
  );
}

function MobileBottomNavItem({ href, label, icon: Icon, exact }: NavItemConfig) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={[
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-2 py-2 text-[10px] font-medium transition-all",
        active ? "text-[#173728]" : "text-[#173728]/42 hover:text-[#173728]/85",
      ].join(" ")}
    >
      <span
        className={[
          "inline-flex h-10 w-10 items-center justify-center rounded-2xl border transition-all",
          active
            ? "border-[#173728]/18 bg-[#173728]/10 text-[#173728]"
            : "border-transparent bg-transparent text-inherit",
        ].join(" ")}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="truncate">{t(label)}</span>
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
  const { t } = useLanguage();
  const effectivePlan = getEffectivePlanKey(business);
  const visiblePrimaryNav = PRIMARY_NAV.filter((item) => {
    if (item.href === "/dashboard/customers") {
      return canAccessDashboardFeatureForUser("customers", business, isAdmin);
    }

    if (item.href === "/dashboard/follow-ups") {
      return canAccessDashboardFeatureForUser("followUps", business, isAdmin);
    }

    return true;
  });
  const visibleSecondaryNav = SECONDARY_NAV.filter((item) => {
    if (item.href === "/dashboard/catalog") {
      return canAccessDashboardFeatureForUser("catalog", business, isAdmin);
    }

    if (item.href === "/dashboard/analytics") {
      return canAccessDashboardFeatureForUser("analytics", business, isAdmin);
    }

    return true;
  });
  const pathname = usePathname();
  const currentSection =
    [...visiblePrimaryNav, ...visibleSecondaryNav].find((item) =>
      item.exact ? pathname === item.href : pathname.startsWith(item.href)
    )?.label ??
    "Overview";
  const userLabel = profile?.full_name || profile?.email || t("Team Member");
  const initials =
    userLabel
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "WB";

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-12rem] top-[-10rem] h-[24rem] w-[24rem] rounded-full bg-[#0f5d46]/5 blur-3xl" />
        <div className="absolute right-[-8rem] top-[8rem] h-[20rem] w-[20rem] rounded-full bg-black/5 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-[18%] h-[24rem] w-[24rem] rounded-full bg-[#0f5d46]/4 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen">
        <aside className="hidden w-[18.5rem] shrink-0 border-r border-border bg-card lg:flex lg:flex-col xl:w-[20rem]">
          <div className="border-b border-[#e8e8e2] px-6 py-6">
            <Link href="/dashboard" className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl border border-[#e8e8e2] bg-[#0f5d46] text-white shadow-[0_16px_30px_rgba(15,93,70,0.12)]">
                <Wallet className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#5e6461]">
                  {t("Seller OS")}
                </p>
                <h1 className="text-lg font-black tracking-tight text-[#111111]">WHATSBOARD</h1>
              </div>
            </Link>
          </div>

          <div className="px-5 pt-5">
            <div className="rounded-[28px] border border-border bg-secondary/40 p-5 text-foreground shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#5e6461]">
                    {t("Current plan")}
                  </p>
                  <p className="mt-2 text-lg font-black tracking-tight text-foreground">
                    {getPlanName(effectivePlan)}
                  </p>
                </div>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShoppingBag className="h-4 w-4" />
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-[#5e6461]">
                {t("Orders, customers, follow-ups, and delivery steps in one simple workflow.")}
              </p>

              <Link
                href={
                  canCreateOrders
                    ? "/dashboard/orders/new"
                    : "/pricing?status=upgrade&message=Upgrade%20when%20you%20need%20more%20than%2030%20orders%20this%20month"
                }
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#0f5d46] bg-[#0f5d46] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0a3d2e]"
              >
                <Plus className="h-4 w-4" />
                {canCreateOrders ? t("Add New Order") : t("Upgrade Plan")}
              </Link>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-5 py-5">
            <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5e6461]">
              {t("Main navigation")}
            </p>
            {visiblePrimaryNav.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </nav>

          <div className="border-t border-[#e8e8e2] p-5">
            <div className="mb-3 space-y-1">
              <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5e6461]">
                {t("Workspace")}
              </p>
              {visibleSecondaryNav.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </div>

            {isAdmin && (
              <div className="mb-3 rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-[#111111]">
                  <ShieldCheck className="h-4 w-4" />
                  <p className="text-xs font-semibold">{t("Admin Access")}</p>
                </div>
                <p className="mt-2 text-xs text-[#5e6461]">
                  {profile?.full_name || profile?.email || "Admin"}
                </p>
                {business?.name ? (
                  <p className="mt-1 text-[11px] text-[#5e6461]">{t("Business: ")}{business.name}</p>
                ) : null}
              </div>
            )}

            <div className="mb-3 rounded-2xl border border-border bg-card p-4">
              <p className="text-xs font-semibold text-foreground">{t("Operations Mode")}</p>
              <p className="mt-1 text-xs text-[#5e6461]">
                {t("Focused on orders, payments, customers, and follow-ups.")}
              </p>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-2xl border border-border px-3 py-3 text-sm font-medium text-[#5e6461] transition hover:bg-secondary hover:text-foreground"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary">
                  <LogOut className="h-4 w-4" />
                </span>
                {t("Sign out")}
              </button>
            </form>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-border bg-background/92 backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-5 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((value) => !value)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#173728]/10 bg-[#173728]/4 text-[#173728] lg:hidden"
                  aria-label="Open menu"
                  aria-expanded={mobileMenuOpen}
                >
                  <Menu className="h-4 w-4" />
                </button>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#173728]/35">
                    {t(currentSection)}
                  </p>
                  <h2 className="truncate text-lg font-black tracking-tight text-[#173728]">
                    {business?.name || "Your Business Overview"}
                  </h2>
                </div>
              </div>

              <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                <div className="hidden min-w-0 items-center gap-3 rounded-2xl border border-[#173728]/10 bg-[#173728]/4 px-3 py-2 text-[#173728]/80 md:flex">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#173728]/12 bg-[#173728] text-xs font-bold text-white">
                    {initials}
                  </span>
                  <div className="min-w-0 max-w-[10rem] xl:max-w-[12rem]">
                    <p className="truncate text-sm font-semibold text-[#173728]">{userLabel}</p>
                    <p className="text-xs text-[#173728]/45">{t("Live workspace")}</p>
                  </div>
                </div>

                <LanguageToggle />

                <Link
                  href={
                    canCreateOrders
                      ? "/dashboard/orders/new"
                      : "/pricing?status=upgrade&message=Upgrade%20when%20you%20need%20more%20than%2030%20orders%20this%20month"
                  }
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#173728] bg-[#173728] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f281d] sm:px-4"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">{canCreateOrders ? t("New Order") : t("Upgrade")}</span>
                </Link>
              </div>
            </div>

            {mobileMenuOpen ? (
              <nav className="border-t border-white/8 lg:hidden">
                <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-2 px-4 py-3 sm:px-5">
                  <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5e6461]">
                    {t("Main navigation")}
                  </p>
                  {visiblePrimaryNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-[#173728]/10 bg-[#173728]/4 px-3 py-2 text-xs font-semibold text-[#173728]/80 transition hover:bg-[#173728]/7 hover:text-[#173728]"
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      {t(item.label)}
                    </Link>
                  ))}

                  <p className="mt-2 px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5e6461]">
                    {t("Workspace")}
                  </p>
                  {visibleSecondaryNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-[#173728]/10 bg-[#173728]/4 px-3 py-2 text-xs font-semibold text-[#173728]/80 transition hover:bg-[#173728]/7 hover:text-[#173728]"
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      {t(item.label)}
                    </Link>
                  ))}

                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-2xl border border-[#173728]/10 bg-[#173728]/4 px-3 py-2 text-xs font-semibold text-[#173728] transition hover:bg-[#173728]/7"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      {t("Sign out")}
                    </button>
                  </form>
                </div>
              </nav>
            ) : null}
          </header>

          <main className="w-full max-w-[1600px] flex-1 px-3 py-4 pb-24 font-sans sm:px-4 lg:px-6 lg:py-6 lg:pb-8 xl:px-8">
            {children}
          </main>

          <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur-xl lg:hidden">
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
