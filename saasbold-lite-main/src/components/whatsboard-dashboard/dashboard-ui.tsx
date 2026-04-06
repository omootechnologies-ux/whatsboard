"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Home,
  LayoutGrid,
  LogOut,
  Menu,
  Package2,
  Plus,
  Search,
  Settings,
  Users,
  Wallet,
  X,
} from "lucide-react";
import type {
  BuyerStatus,
  CustomerRecord,
  FollowUpRecord,
  OrderRecord,
  PaymentStatus,
} from "@/data/whatsboard";
import {
  formatCurrency,
  formatDate,
} from "@/components/whatsboard-dashboard/formatting";
import {
  formatOrderReference,
  getPrimaryOrderLabel,
} from "@/lib/display-labels";
import { clearAuthSessionCookies } from "@/lib/auth/cookies";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { translateUiText } from "@/lib/ui-translations";

type NavItem = {
  href: string;
  labelKey:
    | "overview"
    | "orders"
    | "products"
    | "customers"
    | "followUps"
    | "payments"
    | "team"
    | "billing"
    | "analytics"
    | "settings";
  group: "operations" | "control";
  icon: React.ComponentType<{ className?: string }>;
};

type ToolbarChip = {
  key: string;
  label: string;
  value?: string;
};

const desktopNav: NavItem[] = [
  {
    href: "/dashboard",
    labelKey: "overview",
    group: "operations",
    icon: Home,
  },
  { href: "/orders", labelKey: "orders", group: "operations", icon: Package2 },
  {
    href: "/products",
    labelKey: "products",
    group: "operations",
    icon: LayoutGrid,
  },
  {
    href: "/customers",
    labelKey: "customers",
    group: "operations",
    icon: Users,
  },
  {
    href: "/follow-ups",
    labelKey: "followUps",
    group: "operations",
    icon: Bell,
  },
  { href: "/payments", labelKey: "payments", group: "control", icon: Wallet },
  { href: "/team", labelKey: "team", group: "control", icon: Users },
  { href: "/billing", labelKey: "billing", group: "control", icon: CreditCard },
  {
    href: "/dashboard/analytics",
    labelKey: "analytics",
    group: "control",
    icon: BarChart3,
  },
  {
    href: "/settings",
    labelKey: "settings",
    group: "control",
    icon: Settings,
  },
];

const mobileNav = desktopNav.filter((item) =>
  ["/dashboard", "/orders", "/customers", "/payments", "/settings"].includes(
    item.href,
  ),
);

function isPathMatch(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getActiveNavHref(pathname: string) {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const matches = desktopNav
    .filter((item) => isPathMatch(normalized, item.href))
    .sort((a, b) => b.href.length - a.href.length);
  return matches[0]?.href ?? "/dashboard";
}

export function paymentBadgeTone(status: PaymentStatus) {
  switch (status) {
    case "paid":
      return "success";
    case "partial":
      return "warning";
    case "cod":
      return "neutral";
    default:
      return "danger";
  }
}

export function stageTone(stage: OrderRecord["stage"]) {
  if (stage === "waiting_payment") return "warning";
  if (stage === "paid" || stage === "packing" || stage === "dispatched")
    return "primary";
  if (stage === "delivered") return "success";
  return "neutral";
}

export function DashboardShellFrame({
  children,
  workspaceName,
  paymentsReconciledToday = 0,
}: {
  children: React.ReactNode;
  workspaceName?: string | null;
  paymentsReconciledToday?: number;
}) {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const activeNavHref = getActiveNavHref(pathname);
  const currentLabelKey =
    desktopNav.find((item) => item.href === activeNavHref)?.labelKey || "overview";
  const currentLabel = t(`dashboardShell.nav.${currentLabelKey}`);
  const groupedNav = useMemo(
    () =>
      (["operations", "control"] as const).map((group) => ({
        group,
        items: desktopNav.filter((item) => item.group === group),
      })),
    [],
  );
  const workspaceLabel =
    workspaceName?.trim() || t("dashboardShell.defaultWorkspace");
  const workspaceTagline = t("dashboardShell.tagline", {
    workspace: workspaceLabel,
  });

  const onSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch {
      // If sign-out request fails, still clear local auth state.
    } finally {
      clearAuthSessionCookies();
      router.push("/login");
      router.refresh();
      setIsSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-8rem] h-72 w-72 rounded-full bg-[var(--color-wb-primary)]/8 blur-3xl" />
        <div className="absolute bottom-[-6rem] right-[-6rem] h-72 w-72 rounded-full bg-black/5 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen">
        <aside
          className={[
            "hidden border-r border-[var(--color-wb-border)] bg-[var(--color-wb-surface)] lg:flex lg:flex-col lg:sticky lg:top-0 lg:h-screen",
            collapsed ? "w-24" : "w-[280px]",
          ].join(" ")}
        >
          <div className="flex items-center justify-between border-b border-[var(--color-wb-border)] px-5 py-5">
            <div
              className={`flex items-center gap-3 ${collapsed ? "mx-auto" : ""}`}
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-[var(--color-wb-primary)] text-white shadow-[0_20px_40px_rgba(15,93,70,0.2)]">
                <Wallet className="h-5 w-5" />
              </span>
              {!collapsed ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-wb-text-muted)]">
                    {t("app.name")}
                  </p>
                  <p className="text-sm font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                    {workspaceLabel}
                  </p>
                </div>
              ) : null}
            </div>
            {!collapsed ? (
              <button
                onClick={() => setCollapsed(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          {collapsed ? (
            <div className="px-3 pt-4">
              <button
                onClick={() => setCollapsed(false)}
                className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)]"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="px-4 pt-4">
              <div className="wb-soft-card p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-wb-text-muted)]">
                  {t("dashboardShell.builtForTitle")}
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--color-wb-text-muted)]">
                  {t("dashboardShell.builtForBody")}
                </p>
              </div>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto px-3 py-5">
            <div className="space-y-5">
              {groupedNav.map((section) => (
                <section key={section.group}>
                  {!collapsed ? (
                    <p className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-wb-text-muted)]">
                      {t(`dashboardShell.groups.${section.group}`)}
                    </p>
                  ) : null}
                  <div className={`space-y-2 ${collapsed ? "" : "mt-2"}`}>
                    {section.items.map((item) => (
                      <AppLink
                        key={item.href}
                        item={item}
                        activeHref={activeNavHref}
                        collapsed={collapsed}
                        label={t(`dashboardShell.nav.${item.labelKey}`)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-[var(--color-wb-border)] bg-[var(--color-wb-background)]/92 backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-[1600px] items-start justify-between gap-3 px-3 py-3 sm:items-center sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  onClick={() => setMobileOpen(true)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-wb-border)] bg-white lg:hidden"
                >
                  <Menu className="h-4 w-4" />
                </button>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-wb-text-muted)]">
                    {currentLabel}
                  </p>
                  <h1 className="truncate text-lg font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                    {workspaceLabel}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <span className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700 lg:inline-flex">
                  <Wallet className="h-3.5 w-3.5" />
                  {t("dashboardShell.reconciledToday", {
                    count: paymentsReconciledToday,
                  })}
                </span>
                <LanguageSwitcher compact className="hidden sm:inline-flex" />
                <span className="hidden items-center gap-2 rounded-full border border-[var(--color-wb-border)] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-wb-primary)] xl:inline-flex">
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span className="max-w-[16rem] truncate">
                    {workspaceLabel}
                  </span>
                </span>
                <button
                  onClick={onSignOut}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-[var(--color-wb-border)] bg-white px-2.5 text-sm font-semibold text-[var(--color-wb-text-muted)] transition hover:text-[var(--color-wb-text)] sm:h-11 sm:px-3"
                  disabled={isSigningOut}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {isSigningOut ? t("actions.signingOut") : t("actions.logout")}
                  </span>
                </button>
              </div>
            </div>
          </header>

          {mobileOpen ? (
            <div className="fixed inset-0 z-40 lg:hidden">
              <button
                className="absolute inset-0 bg-black/30"
                onClick={() => setMobileOpen(false)}
              />
              <div className="absolute left-0 top-0 flex h-full w-[86vw] max-w-[22rem] flex-col overflow-hidden border-r border-[var(--color-wb-border)] bg-white p-4 shadow-[0_30px_60px_rgba(17,17,17,0.18)]">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-lg font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                      {workspaceLabel}
                    </p>
                    <p className="break-words text-sm text-[var(--color-wb-text-muted)]">
                      {workspaceTagline}
                    </p>
                  </div>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-5 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
                  <div className="space-y-5 pb-3">
                    {groupedNav.map((section) => (
                      <section key={section.group}>
                        <p className="px-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-wb-text-muted)]">
                          {t(`dashboardShell.groups.${section.group}`)}
                        </p>
                        <div className="mt-2 space-y-2">
                          {section.items.map((item) => (
                            <AppLink
                              key={item.href}
                              item={item}
                              activeHref={activeNavHref}
                              label={t(`dashboardShell.nav.${item.labelKey}`)}
                              onClick={() => setMobileOpen(false)}
                            />
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                </div>
                <div className="mt-4 border-t border-[var(--color-wb-border)] pt-4">
                  <div className="mb-3">
                    <LanguageSwitcher compact className="w-full justify-between" />
                  </div>
                  <button
                    onClick={onSignOut}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-[var(--color-wb-border)] bg-white text-sm font-semibold text-[var(--color-wb-text-muted)]"
                    disabled={isSigningOut}
                  >
                    <LogOut className="h-4 w-4" />
                    {isSigningOut ? t("actions.signingOut") : t("actions.logout")}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <main className="mx-auto w-full max-w-[1600px] flex-1 px-3 py-4 pb-36 sm:px-6 sm:pb-40 lg:px-8 lg:py-6 lg:pb-12">
            {children}
          </main>

          <Link
            href="/orders/new"
            className="fixed bottom-[calc(5.05rem+env(safe-area-inset-bottom))] right-3 z-20 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--color-wb-primary)] px-4 text-sm font-semibold text-white shadow-[0_24px_40px_rgba(15,93,70,0.26)] transition hover:bg-[var(--color-wb-primary-dark)] max-[430px]:h-11 max-[430px]:w-11 max-[430px]:px-0 sm:bottom-24 sm:right-4 sm:h-12 sm:px-5 lg:bottom-8 lg:right-8 lg:h-14 lg:px-6"
          >
            <Plus className="h-4 w-4" />
            <span className="max-[430px]:hidden">{t("actions.addOrder")}</span>
            <ArrowUpRight className="h-4 w-4 max-[430px]:hidden" />
          </Link>

          <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--color-wb-border)] bg-white/96 backdrop-blur-xl lg:hidden">
            <div className="mx-auto flex max-w-screen-sm items-stretch justify-between px-1.5 pb-[max(0.55rem,env(safe-area-inset-bottom))] pt-2">
              {mobileNav.map((item) => {
                const active = item.href === activeNavHref;
                const Icon = item.icon;
                const label = t(`dashboardShell.nav.${item.labelKey}`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-2 py-2 text-[10px] font-semibold ${
                      active
                        ? "text-[var(--color-wb-primary)]"
                        : "text-[var(--color-wb-text-muted)]"
                    }`}
                  >
                    <span
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${
                        active ? "bg-[var(--color-wb-primary-soft)]" : ""
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="truncate text-[11px]">{label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}

function AppLink({
  item,
  label,
  activeHref,
  collapsed = false,
  onClick,
}: {
  item: NavItem;
  label: string;
  activeHref: string;
  collapsed?: boolean;
  onClick?: () => void;
}) {
  const active = item.href === activeHref;
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm font-semibold transition-all ${
        active
          ? "border-[var(--color-wb-border)] bg-[var(--color-wb-primary-soft)] text-[var(--color-wb-primary)]"
          : "border-transparent text-[var(--color-wb-text-muted)] hover:border-[var(--color-wb-border)] hover:bg-white hover:text-[var(--color-wb-text)]"
      } ${collapsed ? "justify-center px-0" : ""}`}
    >
      <span
        className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-wb-border)] ${
          active ? "bg-white" : "bg-[var(--color-wb-surface-alt)]"
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      {!collapsed ? <span className="truncate">{label}</span> : null}
    </Link>
  );
}

export function PageHeader({
  title,
  description,
  primaryAction,
  secondaryAction,
}: {
  title: string;
  description: string;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
}) {
  const t = useTranslations();
  const locale = useLocale();
  return (
    <div className="wb-shell-card p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-wb-primary)]">
            {t("app.name")}
          </p>
          <h2 className="mt-3 break-words text-2xl font-black tracking-[-0.04em] text-[var(--color-wb-text)] sm:text-3xl lg:text-4xl">
            {translateUiText(title, locale as "en" | "sw")}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-wb-text-muted)] sm:text-base">
            {translateUiText(description, locale as "en" | "sw")}
          </p>
        </div>
        {primaryAction || secondaryAction ? (
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            {secondaryAction ? (
              <div className="w-full min-w-0 sm:w-auto [&>*]:max-w-full [&>*]:w-full [&>*]:justify-center sm:[&>*]:w-auto">
                {secondaryAction}
              </div>
            ) : null}
            {primaryAction ? (
              <div className="w-full min-w-0 sm:w-auto [&>*]:max-w-full [&>*]:w-full [&>*]:justify-center sm:[&>*]:w-auto">
                {primaryAction}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function FilterBar({
  searchPlaceholder,
  children,
}: {
  searchPlaceholder?: string;
  children?: React.ReactNode;
}) {
  const t = useTranslations();
  return (
    <div className="wb-soft-card p-4">
      <div className="flex flex-col gap-4">
        <SearchBar
          placeholder={searchPlaceholder || t("shared.searchEverything")}
        />
        {children ? (
          <div className="flex flex-wrap gap-2">{children}</div>
        ) : null}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  detail,
  action,
}: {
  title: string;
  detail: string;
  action?: React.ReactNode;
}) {
  const locale = useLocale();
  return (
    <div className="rounded-[22px] border border-dashed border-[var(--color-wb-border-strong)] bg-[var(--color-wb-surface-alt)] px-5 py-8 text-center">
      <p className="text-base font-semibold text-[var(--color-wb-text)]">
        {translateUiText(title, locale as "en" | "sw")}
      </p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--color-wb-text-muted)]">
        {translateUiText(detail, locale as "en" | "sw")}
      </p>
      {action ? <div className="mt-4 inline-flex">{action}</div> : null}
    </div>
  );
}

export function DataTable({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  const locale = useLocale();
  return (
    <div className="-mx-2 overflow-x-auto rounded-[22px] border border-[var(--color-wb-border)] bg-white sm:mx-0">
      <table className="min-w-[680px] divide-y divide-[var(--color-wb-border)] sm:min-w-full">
        <thead className="bg-[var(--color-wb-surface-alt)]">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]"
              >
                {translateUiText(header, locale as "en" | "sw")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-wb-border)]">
          {children}
        </tbody>
      </table>
    </div>
  );
}

export function DataRow({ children }: { children: React.ReactNode }) {
  return (
    <tr className="align-top transition hover:bg-[var(--color-wb-surface-alt)]/60">
      {children}
    </tr>
  );
}

export function DataCell({
  children,
  compact = false,
}: {
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <td
      className={`${compact ? "px-4 py-3" : "px-4 py-4"} break-words text-sm text-[var(--color-wb-text)]`}
    >
      {children}
    </td>
  );
}

export function StatStrip({
  items,
}: {
  items: Array<{
    label: string;
    value: string;
    tone?: "neutral" | "success" | "warning" | "danger";
  }>;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const toneClass =
          item.tone === "success"
            ? "text-[var(--color-wb-success)]"
            : item.tone === "warning"
              ? "text-[var(--color-wb-warning)]"
              : item.tone === "danger"
                ? "text-[var(--color-wb-danger)]"
                : "text-[var(--color-wb-text)]";
        return (
          <div key={item.label} className="wb-soft-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
              {item.label}
            </p>
            <p
              className={`mt-2 text-2xl font-black tracking-[-0.04em] ${toneClass}`}
            >
              {item.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  detail,
  accent,
}: {
  label: string;
  value: string;
  detail: string;
  accent?: React.ReactNode;
}) {
  const locale = useLocale();
  return (
    <div className="wb-shell-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-wb-text-muted)]">
            {translateUiText(label, locale as "en" | "sw")}
          </p>
          <p className="mt-3 break-words text-2xl font-black tracking-[-0.04em] text-[var(--color-wb-text)] sm:text-3xl">
            {value}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-wb-text-muted)]">
            {translateUiText(detail, locale as "en" | "sw")}
          </p>
        </div>
        {accent ? (
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-wb-primary-soft)] text-[var(--color-wb-primary)]">
            {accent}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function SectionCard({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const locale = useLocale();
  return (
    <section className="wb-shell-card p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="break-words text-lg font-black tracking-[-0.03em] text-[var(--color-wb-text)] sm:text-xl">
            {translateUiText(title, locale as "en" | "sw")}
          </h3>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-[var(--color-wb-text-muted)]">
              {translateUiText(description, locale as "en" | "sw")}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="w-full min-w-0 sm:w-auto [&>*]:max-w-full [&>*]:w-full [&>*]:justify-center sm:[&>*]:w-auto">
            {actions}
          </div>
        ) : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function FilterChip({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  const locale = useLocale();
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:py-2 sm:text-sm ${
        active
          ? "border-[var(--color-wb-border)] bg-[var(--color-wb-primary-soft)] text-[var(--color-wb-primary)]"
          : "border-[var(--color-wb-border)] bg-white text-[var(--color-wb-text-muted)]"
      }`}
    >
      {translateUiText(label, locale as "en" | "sw")}
    </span>
  );
}

export function FilterToolbar({
  searchPlaceholder,
  searchKey = "search",
  chips = [],
}: {
  searchPlaceholder?: string;
  searchKey?: string;
  chips?: ToolbarChip[];
}) {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get(searchKey) ?? "");

  useEffect(() => {
    setSearch(params.get(searchKey) ?? "");
  }, [params, searchKey]);

  const buildHref = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    const query = next.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const onSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(buildHref({ [searchKey]: search.trim() || null }));
  };

  return (
    <div className="wb-soft-card p-4">
      <div className="flex flex-col gap-4">
        <form
          onSubmit={onSearchSubmit}
          className="flex flex-col gap-2 sm:flex-row sm:items-center"
        >
          <div className="flex-1">
            <SearchBar
              placeholder={searchPlaceholder || t("shared.searchRecords")}
              value={search}
              onChange={setSearch}
            />
          </div>
          <button
            type="submit"
            className="wb-button-secondary w-full sm:w-auto"
          >
            {t("actions.apply")}
          </button>
        </form>
        {chips.length ? (
          <div className="-mx-1 overflow-x-auto pb-1 sm:mx-0 sm:overflow-visible sm:pb-0">
            <div className="flex min-w-max gap-2 px-1 sm:min-w-0 sm:flex-wrap sm:px-0">
              {chips.map((chip) => {
                const current = params.get(chip.key);
                const active = chip.value ? current === chip.value : !current;
                return (
                  <Link
                    key={`${chip.key}-${chip.label}`}
                    href={buildHref({ [chip.key]: chip.value ?? null })}
                    className="shrink-0"
                  >
                    <FilterChip label={chip.label} active={active} />
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const t = useTranslations();
  const tone = paymentBadgeTone(status);
  const tones = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    danger: "bg-rose-50 text-rose-700 border-rose-100",
    neutral: "bg-slate-50 text-slate-700 border-slate-100",
  } as const;

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${tones[tone]}`}
    >
      {t(`badges.payment.${status}`)}
    </span>
  );
}

export function StageBadge({ stage }: { stage: OrderRecord["stage"] }) {
  const t = useTranslations();
  const tone = stageTone(stage);
  const tones = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    primary:
      "bg-[var(--color-wb-primary-soft)] text-[var(--color-wb-primary)] border-[var(--color-wb-border)]",
    neutral: "bg-slate-50 text-slate-700 border-slate-100",
  } as const;

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${tones[tone]}`}
    >
      {t(`badges.stage.${stage}`)}
    </span>
  );
}

export function BuyerBadge({
  status,
  compact = false,
}: {
  status?: BuyerStatus;
  compact?: boolean;
}) {
  const t = useTranslations();
  const resolved = status || "new";
  const tones: Record<BuyerStatus, string> = {
    new: "bg-slate-50 text-slate-700 border-slate-100",
    repeat:
      "bg-[var(--color-wb-primary-soft)] text-[var(--color-wb-primary)] border-[var(--color-wb-border)]",
    at_risk: "bg-amber-50 text-amber-700 border-amber-100",
    lost: "bg-rose-50 text-rose-700 border-rose-100",
  };

  return (
    <span
      className={`inline-flex rounded-full border ${compact ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs"} font-semibold capitalize ${tones[resolved]}`}
    >
      {t(`badges.buyer.${resolved}`)}
    </span>
  );
}

export function OrderCard({ order }: { order: OrderRecord }) {
  const t = useTranslations();
  const primaryLabel = getPrimaryOrderLabel({
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    orderId: order.id,
  });
  const reference = formatOrderReference(order.id);

  return (
    <div className="rounded-[24px] border border-[var(--color-wb-border)] bg-white p-4 shadow-[0_14px_28px_rgba(17,17,17,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words font-semibold text-[var(--color-wb-text)]">
            {primaryLabel}
          </p>
          <div className="mt-2">
            <BuyerBadge status={order.customerBuyerStatus} compact />
          </div>
          <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
            {order.channel} • {formatCurrency(order.amount)} •{" "}
            {t(`badges.payment.${order.paymentStatus}`)}
          </p>
        </div>
        <StageBadge stage={order.stage} />
      </div>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3 border-t border-[var(--color-wb-border)] pt-3">
        <div className="min-w-0">
          <p className="break-words text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-wb-text-muted)]">
            {reference
              ? `Order #${reference}`
              : t("shared.orderUntitled")}
          </p>
          {order.paymentReference ? (
            <p className="mt-1 break-words text-xs font-semibold text-[var(--color-wb-primary)]">
              {t("shared.paymentRef", { reference: order.paymentReference })}
            </p>
          ) : null}
          <p className="mt-1 text-xs text-[var(--color-wb-text-muted)]">
            {t("shared.updatedAt", { date: formatDate(order.updatedAt) })}
          </p>
        </div>
        <PaymentBadge status={order.paymentStatus} />
      </div>
    </div>
  );
}

export function OrderStageBoard({
  title,
  orders,
}: {
  title: string;
  orders: OrderRecord[];
}) {
  const t = useTranslations();
  const locale = useLocale();
  return (
    <div className="rounded-[24px] border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-[var(--color-wb-text)]">
            {translateUiText(title, locale as "en" | "sw")}
          </p>
          <p className="mt-1 text-xs text-[var(--color-wb-text-muted)]">
            {t("shared.ordersCount", { count: orders.length })}
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {orders.length ? (
          orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`} className="block">
              <OrderCard order={order} />
            </Link>
          ))
        ) : (
          <div className="rounded-[20px] border border-dashed border-[var(--color-wb-border)] bg-white px-4 py-8 text-center text-sm text-[var(--color-wb-text-muted)]">
            {t("shared.noOrdersStage")}
          </div>
        )}
      </div>
    </div>
  );
}

export function TimelineList({
  items,
}: {
  items: Array<{ title: string; detail: string; meta?: string }>;
}) {
  const locale = useLocale();
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={`${item.title}-${index}`} className="flex gap-4">
          <div className="flex flex-col items-center">
            <span className="mt-1 h-3.5 w-3.5 rounded-full bg-[var(--color-wb-primary)]" />
            {index !== items.length - 1 ? (
              <span className="mt-2 h-full w-px bg-[var(--color-wb-border)]" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1 rounded-[22px] border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-[var(--color-wb-text)]">
                {translateUiText(item.title, locale as "en" | "sw")}
              </p>
              {item.meta ? (
                <span className="text-xs text-[var(--color-wb-text-muted)]">
                  {item.meta}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--color-wb-text-muted)]">
              {translateUiText(item.detail, locale as "en" | "sw")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChartCard({
  title,
  description,
  data,
  dataKey,
}: {
  title: string;
  description: string;
  data: Array<Record<string, string | number>>;
  dataKey: string;
}) {
  const locale = useLocale();
  const normalized = data.map((item, index) => {
    const rawValue = Number(item[dataKey]);
    const value = Number.isFinite(rawValue) ? rawValue : 0;
    const rawLabel =
      typeof item.label === "string" ? item.label : String(item.label || "");
    const label = rawLabel.trim() || `D${index + 1}`;

    return {
      label: label.slice(0, 3).toUpperCase(),
      value,
    };
  });

  const max = Math.max(...normalized.map((item) => item.value), 1);

  const formatValue = (value: number) =>
    new Intl.NumberFormat(locale === "sw" ? "sw-TZ" : "en-TZ", {
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <SectionCard title={title} description={description}>
      <div className="rounded-[24px] border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-3 sm:p-4">
        <div className="-mx-1 overflow-x-auto pb-1">
          <div className="flex h-56 min-w-[420px] items-end gap-2 px-1 sm:min-w-0 sm:gap-3 sm:px-0">
            {normalized.map((item) => {
              const heightPercent =
                item.value > 0 ? Math.max((item.value / max) * 100, 8) : 0;

              return (
                <div
                  key={item.label}
                  className="group relative flex min-w-0 flex-1 flex-col items-center"
                >
                  <div className="relative flex h-[calc(100%-1.5rem)] w-full items-end justify-center">
                    <span className="absolute inset-x-0 bottom-0 border-t border-[var(--color-wb-border-strong)]" />

                    {item.value > 0 ? (
                      <div
                        className="relative h-full w-full max-w-[44px] overflow-hidden rounded-t-[14px] bg-[var(--color-wb-border)]/40"
                      >
                        <span
                          className="absolute inset-x-0 bottom-0 block rounded-t-[14px] bg-gradient-to-b from-[#1f7c5d] to-[var(--color-wb-primary)] transition group-hover:brightness-110"
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                    ) : (
                      <span className="relative mb-[1px] inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-wb-border-strong)]" />
                    )}

                    <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-[var(--color-wb-border)] bg-white px-2.5 py-1 text-xs font-semibold text-[var(--color-wb-text)] shadow-[0_10px_24px_rgba(17,17,17,0.1)] group-hover:inline-flex">
                      {formatValue(item.value)}
                    </span>
                  </div>

                  <p className="mt-2 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)] sm:text-xs">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

export function SearchBar({
  placeholder,
  value,
  onChange,
}: {
  placeholder?: string;
  value?: string;
  onChange?: (nextValue: string) => void;
}) {
  const t = useTranslations();
  const locale = useLocale();
  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-wb-text-muted)]" />
      <input
        className="wb-input pl-11"
        placeholder={translateUiText(
          placeholder || t("shared.searchEverything"),
          locale as "en" | "sw",
        )}
        value={value}
        onChange={
          onChange ? (event) => onChange(event.target.value) : undefined
        }
      />
    </label>
  );
}

export function CustomerRow({
  customer,
  actionHref,
  actionLabel,
}: {
  customer: CustomerRecord;
  actionHref?: string;
  actionLabel?: string;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const customerLabel = getPrimaryOrderLabel({
    customerName: customer.name,
    customerPhone: customer.phone,
    kind: "customer",
  });
  return (
    <div className="flex flex-col gap-3 rounded-[22px] border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="break-words font-semibold text-[var(--color-wb-text)]">
          {customerLabel}
        </p>
        <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
          {customer.phone} • {customer.location}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2.5 text-sm sm:justify-end">
        <span className="font-semibold text-[var(--color-wb-primary)]">
          {formatCurrency(customer.totalSpend)}
        </span>
        <BuyerBadge status={customer.buyerStatus} compact />
        <span className="rounded-full border border-[var(--color-wb-border)] bg-white px-3 py-1 text-xs font-semibold capitalize text-[var(--color-wb-text-muted)]">
          {customer.status}
        </span>
        {actionHref ? (
          <Link
            href={actionHref}
            className="rounded-full border border-[var(--color-wb-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--color-wb-primary)] transition hover:bg-[var(--color-wb-primary-soft)]"
          >
            {translateUiText(actionLabel || t("actions.edit"), locale as "en" | "sw")}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function FollowUpCard({
  item,
  actionHref,
  actionLabel,
}: {
  item: FollowUpRecord;
  actionHref?: string;
  actionLabel?: string;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const customerLabel = getPrimaryOrderLabel({
    customerName: item.customerName,
    orderId: item.orderId,
    kind: "customer",
  });
  const tone =
    item.status === "overdue"
      ? "border-rose-100 bg-rose-50 text-rose-700"
      : item.status === "today"
        ? "border-amber-100 bg-amber-50 text-amber-700"
        : item.status === "completed"
          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
          : "border-[var(--color-wb-border)] bg-white text-[var(--color-wb-text-muted)]";

  return (
    <div className="rounded-[24px] border border-[var(--color-wb-border)] bg-white p-4 shadow-[0_14px_28px_rgba(17,17,17,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words font-semibold text-[var(--color-wb-text)]">
            {item.title}
          </p>
          <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
            {customerLabel}
          </p>
        </div>
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${tone}`}
        >
          {t(`badges.followUpStatus.${item.status}`)}
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-[var(--color-wb-text-muted)]">
        {item.note}
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-[var(--color-wb-text)]">
          {formatDate(item.dueAt)}
        </span>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <span className="rounded-full bg-[var(--color-wb-surface-alt)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-wb-primary)]">
            {t(`badges.priority.${item.priority}`)}
          </span>
          {actionHref ? (
            <Link
              href={actionHref}
            className="rounded-full border border-[var(--color-wb-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--color-wb-primary)] transition hover:bg-[var(--color-wb-primary-soft)]"
          >
              {translateUiText(actionLabel || t("actions.edit"), locale as "en" | "sw")}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
