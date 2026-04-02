import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Search,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

export function DashboardPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="space-y-5 lg:space-y-6">{children}</div>;
}

export function DashboardSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`grid gap-4 ${className}`.trim()}>{children}</section>;
}

export function DashboardHero({
  eyebrow,
  title,
  description,
  actions,
  aside,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_380px]">
      <div className="overflow-hidden rounded-[30px] border border-[#dfe7e2] bg-white p-5 shadow-[0_20px_60px_rgba(17,17,17,0.05)] sm:p-6 lg:p-7">
        <div className="inline-flex items-center rounded-full border border-[#dfe7e2] bg-[#f5faf7] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0f5d46]">
          {eyebrow}
        </div>
        <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-[-0.04em] text-[#111111] sm:text-4xl lg:text-[2.7rem] lg:leading-[1.02]">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5e6461] sm:text-base">
          {description}
        </p>
        {actions ? <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div> : null}
      </div>
      {aside ? (
        <div className="rounded-[30px] border border-[#dfe7e2] bg-white p-5 shadow-[0_20px_60px_rgba(17,17,17,0.05)] sm:p-6">
          {aside}
        </div>
      ) : null}
    </section>
  );
}

export function DashboardActionLink({
  href,
  children,
  tone = "secondary",
}: {
  href: string;
  children: React.ReactNode;
  tone?: "primary" | "secondary";
}) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all",
        tone === "primary"
          ? "bg-[#0f5d46] text-white shadow-[0_18px_32px_rgba(15,93,70,0.18)] hover:bg-[#0a3d2e]"
          : "border border-[#dfe7e2] bg-[#f8faf8] text-[#173728] hover:border-[#0f5d46]/18 hover:bg-[#f0f7f4]",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

export function DashboardInfoGrid({
  children,
  columns = "four",
}: {
  children: React.ReactNode;
  columns?: "three" | "four";
}) {
  return (
    <section
      className={
        columns === "three"
          ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          : "grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      }
    >
      {children}
    </section>
  );
}

export function DashboardStatCard({
  label,
  value,
  detail,
  icon,
  trend,
}: {
  label: string;
  value: string;
  detail: string;
  icon?: React.ReactNode;
  trend?: { value: string; tone?: "up" | "down" | "neutral" };
}) {
  const trendTone = trend?.tone ?? "neutral";

  return (
    <div className="rounded-[28px] border border-[#dfe7e2] bg-white p-5 shadow-[0_14px_40px_rgba(17,17,17,0.045)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5e6461]">{label}</p>
          <p className="mt-3 break-words text-3xl font-black tracking-[-0.04em] text-[#111111]">{value}</p>
          <p className="mt-2 text-sm leading-6 text-[#5e6461]">{detail}</p>
        </div>
        {icon ? (
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#dfe7e2] bg-[#f3f8f5] text-[#0f5d46]">
            {icon}
          </span>
        ) : null}
      </div>
      {trend ? (
        <div
          className={[
            "mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
            trendTone === "up"
              ? "bg-emerald-50 text-emerald-700"
              : trendTone === "down"
                ? "bg-[#f9efed] text-[#8f3e36]"
                : "bg-[#f3f6f4] text-[#5e6461]",
          ].join(" ")}
        >
          {trendTone === "up" ? <TrendingUp className="h-3.5 w-3.5" /> : null}
          {trendTone === "down" ? <TrendingDown className="h-3.5 w-3.5" /> : null}
          {trend.value}
        </div>
      ) : null}
    </div>
  );
}

export function DashboardPanel({
  children,
  muted = false,
  className = "",
}: {
  children: React.ReactNode;
  muted?: boolean;
  className?: string;
}) {
  return (
    <section
      className={[
        "rounded-[28px] border p-5 shadow-[0_16px_44px_rgba(17,17,17,0.05)] sm:p-6",
        muted ? "border-[#dfe7e2] bg-[#f8fbf9]" : "border-[#dfe7e2] bg-white",
        className,
      ].join(" ")}
    >
      {children}
    </section>
  );
}

export function DashboardPanelHeader({
  eyebrow,
  title,
  description,
  href,
  hrefLabel,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5e6461]">{eyebrow}</p> : null}
        <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-[#111111] sm:text-[1.45rem]">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-6 text-[#5e6461]">{description}</p> : null}
      </div>
      {href && hrefLabel ? (
        <Link
          href={href}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#0f5d46] transition hover:text-[#0a3d2e]"
        >
          {hrefLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

export function DashboardEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-[#d5ddd8] bg-[#f9fbfa] px-5 py-10 text-center">
      <p className="font-semibold text-[#111111]">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#5e6461]">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function DashboardBadge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "primary" | "success" | "warning" | "danger";
}) {
  const tones = {
    neutral: "border-[#dfe7e2] bg-[#f3f6f4] text-[#3f4743]",
    primary: "border-[#d3e5de] bg-[#edf7f2] text-[#0f5d46]",
    success: "border-emerald-100 bg-emerald-50 text-emerald-700",
    warning: "border-amber-100 bg-amber-50 text-amber-700",
    danger: "border-[#efd8d4] bg-[#f9efed] text-[#8f3e36]",
  } as const;

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function DashboardChip({
  children,
  active = false,
  href,
}: {
  children: React.ReactNode;
  active?: boolean;
  href?: string;
}) {
  const className = [
    "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition",
    active
      ? "border-[#0f5d46]/18 bg-[#edf7f2] text-[#0f5d46]"
      : "border-[#dfe7e2] bg-white text-[#5e6461] hover:border-[#0f5d46]/12 hover:bg-[#f6faf8] hover:text-[#173728]",
  ].join(" ");

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return <span className={className}>{children}</span>;
}

type FilterOption = {
  label: string;
  value: string;
};

export function DashboardFilterBar({
  searchName = "q",
  searchPlaceholder = "Search",
  defaultSearch = "",
  filters = [],
  clearHref,
}: {
  searchName?: string;
  searchPlaceholder?: string;
  defaultSearch?: string;
  filters?: Array<{
    name: string;
    defaultValue?: string;
    options: FilterOption[];
  }>;
  clearHref: string;
}) {
  return (
    <form method="get" className="rounded-[26px] border border-[#dfe7e2] bg-white p-4 shadow-[0_16px_44px_rgba(17,17,17,0.05)]">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
        <label className="grid min-w-0 flex-1 gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5e6461]">Search</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5e6461]" />
            <input
              type="search"
              name={searchName}
              defaultValue={defaultSearch}
              placeholder={searchPlaceholder}
              className="h-12 w-full rounded-2xl border border-[#dfe7e2] bg-[#f7faf8] pl-11 pr-4 text-sm text-[#111111] outline-none transition focus:border-[#0f5d46]/30 focus:bg-white"
            />
          </div>
        </label>

        {filters.map((filter) => (
          <label key={filter.name} className="grid gap-2 xl:w-[180px]">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5e6461] capitalize">
              {filter.name}
            </span>
            <select
              name={filter.name}
              defaultValue={filter.defaultValue ?? ""}
              className="h-12 rounded-2xl border border-[#dfe7e2] bg-[#f7faf8] px-4 text-sm text-[#111111] outline-none transition focus:border-[#0f5d46]/30 focus:bg-white"
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}

        <div className="flex gap-3 xl:justify-end">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0f5d46] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0a3d2e]"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Apply
          </button>
          <Link
            href={clearHref}
            className="inline-flex items-center justify-center rounded-2xl border border-[#dfe7e2] bg-[#f8faf8] px-4 py-3 text-sm font-semibold text-[#173728] transition hover:border-[#0f5d46]/18 hover:bg-[#f0f7f4]"
          >
            Clear
          </Link>
        </div>
      </div>
    </form>
  );
}

export function DashboardChartCard({
  title,
  subtitle,
  data,
  footer,
}: {
  title: string;
  subtitle: string;
  data: Array<{ label: string; value: number }>;
  footer?: string;
}) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <DashboardPanel>
      <DashboardPanelHeader title={title} description={subtitle} />
      <div className="mt-6">
        <div className="flex h-48 items-end gap-3 rounded-[24px] border border-[#eef2ef] bg-[#fbfcfb] px-4 pb-4 pt-8">
          {data.map((item) => (
            <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-3">
              <div className="relative flex h-full w-full items-end justify-center">
                <div
                  className="w-full max-w-[54px] rounded-t-[18px] bg-gradient-to-b from-[#1a7a5b] to-[#0f5d46]"
                  style={{ height: `${Math.max((item.value / maxValue) * 100, 10)}%` }}
                />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-[#111111]">{item.value}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[#5e6461]">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
        {footer ? <p className="mt-4 text-sm text-[#5e6461]">{footer}</p> : null}
      </div>
    </DashboardPanel>
  );
}

export function DashboardTimeline({
  items,
}: {
  items: Array<{ title: string; detail: string; meta?: string; tone?: "neutral" | "primary" | "success" | "warning" }>;
}) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={`${item.title}-${index}`} className="flex gap-4">
          <div className="flex flex-col items-center">
            <span
              className={[
                "mt-1 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm",
                item.tone === "success"
                  ? "bg-emerald-500"
                  : item.tone === "warning"
                    ? "bg-amber-500"
                    : item.tone === "primary"
                      ? "bg-[#0f5d46]"
                      : "bg-[#a9b7b0]",
              ].join(" ")}
            />
            {index !== items.length - 1 ? <span className="mt-2 h-full w-px bg-[#dfe7e2]" /> : null}
          </div>
          <div className="min-w-0 flex-1 rounded-[22px] border border-[#eef2ef] bg-[#fbfcfb] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-[#111111]">{item.title}</p>
              {item.meta ? <span className="text-xs font-medium text-[#5e6461]">{item.meta}</span> : null}
            </div>
            <p className="mt-2 text-sm leading-6 text-[#5e6461]">{item.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

type BoardOrder = {
  id: string;
  customerName: string;
  product: string;
  amount: number;
  area?: string;
  paymentStatus?: string;
};

export function DashboardOrderStageBoard({
  columns,
  emptyMessage = "No orders in this stage yet.",
}: {
  columns: Array<{
    key: string;
    title: string;
    tone?: "neutral" | "warning" | "primary" | "success";
    orders: BoardOrder[];
  }>;
  emptyMessage?: string;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-4">
      {columns.map((column) => (
        <div key={column.key} className="rounded-[24px] border border-[#dfe7e2] bg-[#f8fbf9] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#111111]">{column.title}</p>
              <p className="mt-1 text-xs text-[#5e6461]">{column.orders.length} orders</p>
            </div>
            <DashboardBadge tone={column.tone ?? "neutral"}>{column.orders.length}</DashboardBadge>
          </div>
          <div className="mt-4 space-y-3">
            {column.orders.length ? (
              column.orders.map((order) => (
                <div key={order.id} className="rounded-[20px] border border-[#e8eeea] bg-white p-4 shadow-[0_10px_24px_rgba(17,17,17,0.04)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#111111]">{order.customerName}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-[#5e6461]">{order.product}</p>
                    </div>
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[#8ca096]" />
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#0f5d46]">TZS {order.amount.toLocaleString()}</p>
                      <p className="mt-1 text-xs text-[#5e6461]">{order.area || "Area not set"}</p>
                    </div>
                    {order.paymentStatus ? (
                      <DashboardBadge tone={order.paymentStatus === "paid" ? "success" : order.paymentStatus === "partial" ? "warning" : "danger"}>
                        {order.paymentStatus}
                      </DashboardBadge>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[18px] border border-dashed border-[#d5ddd8] bg-white px-4 py-8 text-center text-sm text-[#5e6461]">
                {emptyMessage}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardLoadingState() {
  return (
    <div className="space-y-5 lg:space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_380px]">
        <div className="rounded-[30px] border border-[#dfe7e2] bg-white p-6 shadow-[0_16px_44px_rgba(17,17,17,0.05)]">
          <div className="h-6 w-28 rounded-full bg-[#eef3ef]" />
          <div className="mt-4 h-12 max-w-[30rem] rounded-2xl bg-[#eef3ef]" />
          <div className="mt-4 h-4 max-w-[40rem] rounded-full bg-[#f2f5f3]" />
          <div className="mt-2 h-4 max-w-[28rem] rounded-full bg-[#f2f5f3]" />
        </div>
        <div className="rounded-[30px] border border-[#dfe7e2] bg-white p-6 shadow-[0_16px_44px_rgba(17,17,17,0.05)]">
          <div className="h-24 rounded-[24px] bg-[#eef3ef]" />
          <div className="mt-4 h-24 rounded-[24px] bg-[#f2f5f3]" />
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-[28px] border border-[#dfe7e2] bg-white p-5 shadow-[0_16px_44px_rgba(17,17,17,0.05)]">
            <div className="h-3 w-20 rounded-full bg-[#eef3ef]" />
            <div className="mt-4 h-8 w-24 rounded-2xl bg-[#eef3ef]" />
            <div className="mt-3 h-4 w-40 rounded-full bg-[#f2f5f3]" />
          </div>
        ))}
      </section>
    </div>
  );
}
