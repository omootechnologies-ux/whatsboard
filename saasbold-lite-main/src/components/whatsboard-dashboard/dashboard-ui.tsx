"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Home,
  LayoutGrid,
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
  CustomerRecord,
  FollowUpRecord,
  OrderRecord,
  PaymentStatus,
} from "@/data/whatsboard";
import {
  formatCurrency,
  formatDate,
} from "@/components/whatsboard-dashboard/formatting";

type NavItem = {
  href: string;
  label: string;
  group: "Operations" | "Control";
  icon: React.ComponentType<{ className?: string }>;
};

type ToolbarChip = {
  key: string;
  label: string;
  value?: string;
};

const desktopNav: NavItem[] = [
  { href: "/", label: "Dashboard", group: "Operations", icon: Home },
  { href: "/orders", label: "Orders", group: "Operations", icon: Package2 },
  { href: "/customers", label: "Customers", group: "Operations", icon: Users },
  { href: "/follow-ups", label: "Follow-ups", group: "Operations", icon: Bell },
  { href: "/payments", label: "Payments", group: "Control", icon: Wallet },
  { href: "/analytics", label: "Analytics", group: "Control", icon: BarChart3 },
  { href: "/settings", label: "Settings", group: "Control", icon: Settings },
];

const mobileNav = desktopNav.filter((item) =>
  ["/", "/orders", "/customers", "/payments", "/settings"].includes(item.href),
);

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
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const currentLabel =
    desktopNav.find((item) =>
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href),
    )?.label ?? "Dashboard";
  const groupedNav = useMemo(
    () =>
      (["Operations", "Control"] as const).map((group) => ({
        group,
        items: desktopNav.filter((item) => item.group === group),
      })),
    [],
  );

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
                    WhatsBoard
                  </p>
                  <p className="text-sm font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                    Seller control room
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
                  Built for East African sellers
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--color-wb-text-muted)]">
                  Turn WhatsApp, Instagram, TikTok, and Facebook orders into one
                  clean daily workflow.
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
                      {section.group}
                    </p>
                  ) : null}
                  <div className={`space-y-2 ${collapsed ? "" : "mt-2"}`}>
                    {section.items.map((item) => (
                      <AppLink
                        key={item.href}
                        item={item}
                        pathname={pathname}
                        collapsed={collapsed}
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
            <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
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
                    WhatsBoard
                  </h1>
                </div>
              </div>

              <label className="relative hidden max-w-md flex-1 md:block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-wb-text-muted)]" />
                <input
                  className="wb-input pl-11"
                  placeholder="Search orders, customers, payments..."
                />
              </label>

              <div className="flex items-center gap-2 sm:gap-3">
                <span className="hidden items-center gap-2 rounded-full border border-[var(--color-wb-border)] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-wb-primary)] xl:inline-flex">
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Live workspace
                </span>
                <Link href="/orders/new" className="wb-button-primary">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Order</span>
                </Link>
              </div>
            </div>
          </header>

          {mobileOpen ? (
            <div className="fixed inset-0 z-40 lg:hidden">
              <button
                className="absolute inset-0 bg-black/30"
                onClick={() => setMobileOpen(false)}
              />
              <div className="absolute left-0 top-0 h-full w-[84vw] max-w-[22rem] border-r border-[var(--color-wb-border)] bg-white p-4 shadow-[0_30px_60px_rgba(17,17,17,0.18)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                      WhatsBoard
                    </p>
                    <p className="text-sm text-[var(--color-wb-text-muted)]">
                      Seller control room
                    </p>
                  </div>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-5 space-y-5">
                  {groupedNav.map((section) => (
                    <section key={section.group}>
                      <p className="px-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-wb-text-muted)]">
                        {section.group}
                      </p>
                      <div className="mt-2 space-y-2">
                        {section.items.map((item) => (
                          <AppLink
                            key={item.href}
                            item={item}
                            pathname={pathname}
                            onClick={() => setMobileOpen(false)}
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-4 pb-28 sm:px-6 lg:px-8 lg:py-6 lg:pb-10">
            {children}
          </main>

          <Link
            href="/orders/new"
            className="fixed bottom-24 right-4 z-20 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[var(--color-wb-primary)] px-5 text-sm font-semibold text-white shadow-[0_24px_40px_rgba(15,93,70,0.26)] transition hover:bg-[var(--color-wb-primary-dark)] lg:bottom-8 lg:right-8"
          >
            <Plus className="h-4 w-4" />
            Add Order
            <ArrowUpRight className="h-4 w-4" />
          </Link>

          <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--color-wb-border)] bg-white/96 backdrop-blur-xl lg:hidden">
            <div className="mx-auto flex max-w-screen-sm items-stretch justify-between px-2 pb-[max(0.55rem,env(safe-area-inset-bottom))] pt-2">
              {mobileNav.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;
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
                    <span className="truncate">{item.label}</span>
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
  pathname,
  collapsed = false,
  onClick,
}: {
  item: NavItem;
  pathname: string;
  collapsed?: boolean;
  onClick?: () => void;
}) {
  const active =
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-semibold transition-all ${
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
      {!collapsed ? <span className="truncate">{item.label}</span> : null}
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
  return (
    <div className="wb-shell-card p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-wb-primary)]">
            WhatsBoard
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[var(--color-wb-text)] sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-wb-text-muted)] sm:text-base">
            {description}
          </p>
        </div>
        {primaryAction || secondaryAction ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            {secondaryAction}
            {primaryAction}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function FilterBar({
  searchPlaceholder = "Search orders, customers, or payments",
  children,
}: {
  searchPlaceholder?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="wb-soft-card p-4">
      <div className="flex flex-col gap-4">
        <SearchBar placeholder={searchPlaceholder} />
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
  return (
    <div className="rounded-[22px] border border-dashed border-[var(--color-wb-border-strong)] bg-[var(--color-wb-surface-alt)] px-5 py-8 text-center">
      <p className="text-base font-semibold text-[var(--color-wb-text)]">
        {title}
      </p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--color-wb-text-muted)]">
        {detail}
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
  return (
    <div className="overflow-x-auto rounded-[22px] border border-[var(--color-wb-border)] bg-white">
      <table className="min-w-full divide-y divide-[var(--color-wb-border)]">
        <thead className="bg-[var(--color-wb-surface-alt)]">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]"
              >
                {header}
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
      className={`${compact ? "px-4 py-3" : "px-4 py-4"} text-sm text-[var(--color-wb-text)]`}
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
  return (
    <div className="wb-shell-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-wb-text-muted)]">
            {label}
          </p>
          <p className="mt-3 text-3xl font-black tracking-[-0.04em] text-[var(--color-wb-text)]">
            {value}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-wb-text-muted)]">
            {detail}
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
  return (
    <section className="wb-shell-card p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
            {title}
          </h3>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-[var(--color-wb-text-muted)]">
              {description}
            </p>
          ) : null}
        </div>
        {actions}
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
  return (
    <button
      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
        active
          ? "border-[var(--color-wb-border)] bg-[var(--color-wb-primary-soft)] text-[var(--color-wb-primary)]"
          : "border-[var(--color-wb-border)] bg-white text-[var(--color-wb-text-muted)]"
      }`}
    >
      {label}
    </button>
  );
}

export function FilterToolbar({
  searchPlaceholder = "Search records",
  searchKey = "search",
  chips = [],
}: {
  searchPlaceholder?: string;
  searchKey?: string;
  chips?: ToolbarChip[];
}) {
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
              placeholder={searchPlaceholder}
              value={search}
              onChange={setSearch}
            />
          </div>
          <button type="submit" className="wb-button-secondary">
            Apply
          </button>
        </form>
        {chips.length ? (
          <div className="flex flex-wrap gap-2">
            {chips.map((chip) => {
              const current = params.get(chip.key);
              const active = chip.value ? current === chip.value : !current;
              return (
                <Link
                  key={`${chip.key}-${chip.label}`}
                  href={buildHref({ [chip.key]: chip.value ?? null })}
                >
                  <FilterChip label={chip.label} active={active} />
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
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
      {status}
    </span>
  );
}

export function StageBadge({ stage }: { stage: OrderRecord["stage"] }) {
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
      {stage.replaceAll("_", " ")}
    </span>
  );
}

export function OrderCard({ order }: { order: OrderRecord }) {
  return (
    <div className="rounded-[24px] border border-[var(--color-wb-border)] bg-white p-4 shadow-[0_14px_28px_rgba(17,17,17,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-[var(--color-wb-text)]">
            {order.customerName}
          </p>
          <p className="mt-1 text-xs text-[var(--color-wb-text-muted)]">
            {order.channel} • {order.deliveryArea}
          </p>
        </div>
        <StageBadge stage={order.stage} />
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-[var(--color-wb-text)]">
          {order.items[0]}
        </p>
        <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
          {order.items.length > 1
            ? `${order.items.length} items total`
            : "1 item total"}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-black tracking-[-0.03em] text-[var(--color-wb-primary)]">
            {formatCurrency(order.amount)}
          </p>
          <p className="mt-1 text-xs text-[var(--color-wb-text-muted)]">
            Updated {formatDate(order.updatedAt)}
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
  return (
    <div className="rounded-[24px] border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-[var(--color-wb-text)]">{title}</p>
          <p className="mt-1 text-xs text-[var(--color-wb-text-muted)]">
            {orders.length} orders
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {orders.length ? (
          orders.map((order) => <OrderCard key={order.id} order={order} />)
        ) : (
          <div className="rounded-[20px] border border-dashed border-[var(--color-wb-border)] bg-white px-4 py-8 text-center text-sm text-[var(--color-wb-text-muted)]">
            No orders in this stage.
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
                {item.title}
              </p>
              {item.meta ? (
                <span className="text-xs text-[var(--color-wb-text-muted)]">
                  {item.meta}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--color-wb-text-muted)]">
              {item.detail}
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
  const max = Math.max(...data.map((item) => Number(item[dataKey])), 1);

  return (
    <SectionCard title={title} description={description}>
      <div className="flex h-64 items-end gap-3 rounded-[24px] border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4">
        {data.map((item) => (
          <div
            key={String(item.label)}
            className="flex min-w-0 flex-1 flex-col items-center gap-3"
          >
            <div className="relative flex h-full w-full items-end justify-center">
              <div
                className="w-full max-w-[52px] rounded-t-[18px] bg-gradient-to-b from-[#1f7c5d] to-[var(--color-wb-primary)]"
                style={{
                  height: `${Math.max((Number(item[dataKey]) / max) * 100, 10)}%`,
                }}
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[var(--color-wb-text)]">
                {Number(item[dataKey]).toLocaleString()}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                {String(item.label)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

export function SearchBar({
  placeholder = "Search orders, customers, or payments",
  value,
  onChange,
}: {
  placeholder?: string;
  value?: string;
  onChange?: (nextValue: string) => void;
}) {
  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-wb-text-muted)]" />
      <input
        className="wb-input pl-11"
        placeholder={placeholder}
        value={value}
        onChange={
          onChange ? (event) => onChange(event.target.value) : undefined
        }
      />
    </label>
  );
}

export function CustomerRow({ customer }: { customer: CustomerRecord }) {
  return (
    <div className="flex flex-col gap-3 rounded-[22px] border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-semibold text-[var(--color-wb-text)]">
          {customer.name}
        </p>
        <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
          {customer.phone} • {customer.location}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="font-semibold text-[var(--color-wb-primary)]">
          {formatCurrency(customer.totalSpend)}
        </span>
        <span className="rounded-full border border-[var(--color-wb-border)] bg-white px-3 py-1 text-xs font-semibold capitalize text-[var(--color-wb-text-muted)]">
          {customer.status}
        </span>
      </div>
    </div>
  );
}

export function FollowUpCard({ item }: { item: FollowUpRecord }) {
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
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-[var(--color-wb-text)]">
            {item.title}
          </p>
          <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
            {item.customerName}
          </p>
        </div>
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${tone}`}
        >
          {item.status}
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-[var(--color-wb-text-muted)]">
        {item.note}
      </p>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-[var(--color-wb-text)]">
          {formatDate(item.dueAt)}
        </span>
        <span className="rounded-full bg-[var(--color-wb-surface-alt)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-wb-primary)]">
          {item.priority}
        </span>
      </div>
    </div>
  );
}
