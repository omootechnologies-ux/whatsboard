import Link from "next/link";
import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";

export function DashboardPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="space-y-5 sm:space-y-6">{children}</div>;
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
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
      <div className="rounded-[28px] border border-border bg-card p-5 shadow-sm sm:p-6 lg:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/60">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">{description}</p>
        {actions ? <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div> : null}
      </div>

      {aside ? <div className="rounded-[28px] border border-border bg-card p-5 shadow-sm sm:p-6">{aside}</div> : null}
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
        "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition",
        tone === "primary"
          ? "bg-primary text-primary-foreground hover:bg-[#0a3d2e]"
          : "border border-border bg-secondary/70 text-foreground hover:border-primary/20 hover:bg-primary/5 hover:text-primary",
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
    <section className={columns === "three" ? "grid gap-4 lg:grid-cols-3" : "grid gap-4 sm:grid-cols-2 xl:grid-cols-4"}>
      {children}
    </section>
  );
}

export function DashboardStatCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
          <p className="mt-3 break-words text-3xl font-black tracking-tight text-foreground">{value}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
        </div>
        {icon ? (
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {icon}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function DashboardPanel({
  children,
  muted = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <section className={`rounded-[26px] border border-border p-5 shadow-sm sm:p-6 ${muted ? "bg-secondary/50" : "bg-card"}`}>
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
        {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p> : null}
        <h2 className="mt-1 text-xl font-black tracking-tight text-foreground sm:text-2xl">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      {href && hrefLabel ? (
        <Link href={href} className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-[#0a3d2e]">
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
    <div className="rounded-[22px] border border-dashed border-border bg-secondary/30 px-4 py-10 text-center">
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
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
    neutral: "bg-secondary text-foreground/75",
    primary: "bg-primary/10 text-primary",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-[#f4e5e2] text-[#8f3e36]",
  } as const;

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
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
    <form method="get" className="rounded-[24px] border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <label className="grid min-w-0 flex-1 gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Search
          </span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              name={searchName}
              defaultValue={defaultSearch}
              placeholder={searchPlaceholder}
              className="h-11 w-full rounded-2xl border border-border bg-secondary/30 pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-primary/30 focus:bg-card"
            />
          </div>
        </label>

        {filters.map((filter) => (
          <label key={filter.name} className="grid gap-2 lg:w-[180px]">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {filter.name}
            </span>
            <select
              name={filter.name}
              defaultValue={filter.defaultValue ?? ""}
              className="h-11 rounded-2xl border border-border bg-secondary/30 px-4 text-sm text-foreground outline-none transition focus:border-primary/30 focus:bg-card"
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}

        <div className="flex gap-3 lg:justify-end">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0a3d2e]"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Apply
          </button>
          <Link
            href={clearHref}
            className="inline-flex items-center justify-center rounded-2xl border border-border bg-secondary/60 px-4 py-3 text-sm font-semibold text-foreground transition hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
          >
            Clear
          </Link>
        </div>
      </div>
    </form>
  );
}

export function DashboardLoadingState() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <div className="rounded-[28px] border border-border bg-card p-5 shadow-sm sm:p-6 lg:p-7">
          <div className="h-3 w-24 rounded-full bg-secondary/80" />
          <div className="mt-4 h-10 max-w-[28rem] rounded-2xl bg-secondary/80" />
          <div className="mt-4 h-4 max-w-[36rem] rounded-full bg-secondary/60" />
          <div className="mt-2 h-4 max-w-[24rem] rounded-full bg-secondary/60" />
          <div className="mt-6 flex gap-3">
            <div className="h-11 w-36 rounded-2xl bg-secondary/80" />
            <div className="h-11 w-32 rounded-2xl bg-secondary/60" />
          </div>
        </div>
        <div className="rounded-[28px] border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="grid gap-3">
            <div className="h-28 rounded-[22px] bg-secondary/70" />
            <div className="h-28 rounded-[22px] bg-secondary/50" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-[24px] border border-border bg-card p-5 shadow-sm">
            <div className="h-3 w-20 rounded-full bg-secondary/80" />
            <div className="mt-4 h-9 w-24 rounded-2xl bg-secondary/80" />
            <div className="mt-3 h-4 w-40 rounded-full bg-secondary/60" />
          </div>
        ))}
      </section>

      <section className="rounded-[26px] border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="h-3 w-24 rounded-full bg-secondary/80" />
        <div className="mt-4 h-8 w-48 rounded-2xl bg-secondary/80" />
        <div className="mt-3 h-4 w-72 rounded-full bg-secondary/60" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-20 rounded-[20px] bg-secondary/50" />
          ))}
        </div>
      </section>
    </div>
  );
}
