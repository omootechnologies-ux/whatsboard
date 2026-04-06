"use client";

import { AlertTriangle, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatCurrency,
  formatDate,
} from "./formatting";
import { useTranslations } from "next-intl";

const STATUS_COLORS = {
  paid: "#0F5D46",
  partial: "#D98A2F",
  unpaid: "#C7675D",
};

const CHANNEL_COLORS: Record<string, string> = {
  WhatsApp: "#0F5D46",
  Instagram: "#3A6A5B",
  Facebook: "#6A8E83",
  Other: "#9AA8A2",
};

function formatCompact(value: number) {
  return new Intl.NumberFormat("en-TZ", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

type ChannelRow = {
  channel: keyof typeof CHANNEL_COLORS | string;
  revenue: number;
  orders: number;
};

type FunnelRow = {
  label: string;
  count: number;
  conversion: number;
};

export type AnalyticsVisualsProps = {
  receiptViews: number;
  revenueSeries: Array<{ label: string; revenue: number }>;
  lastMonthRevenue: number;
  averageOrderValueThisMonth: number;
  funnel: { rows: FunnelRow[]; dropIndex: number };
  channelBreakdown: {
    rows: ChannelRow[];
    best: ChannelRow;
    bestPercent: number;
  };
  paymentHealthSeries: Array<{
    channel: string;
    paid: number;
    partial: number;
    unpaid: number;
  }>;
  outstandingAmount: number;
  avgPaymentDaysByChannel: Array<{ channel: string; avgDays: number }>;
  topCustomers: Array<{
    id: string | null;
    name: string;
    totalAmount: number;
    totalOrders: number;
    lastOrderAt: string;
  }>;
  itemInsights: {
    byRevenue: Array<{ name: string; revenue: number }>;
    byFrequency: Array<{ name: string; frequency: number }>;
  };
};

export function AnalyticsVisuals({
  receiptViews,
  revenueSeries,
  lastMonthRevenue,
  averageOrderValueThisMonth,
  funnel,
  channelBreakdown,
  paymentHealthSeries,
  outstandingAmount,
  avgPaymentDaysByChannel,
  topCustomers,
  itemInsights,
}: AnalyticsVisualsProps) {
  const t = useTranslations();
  const chartTooltipStyle = {
    borderRadius: "12px",
    border: "1px solid var(--color-wb-border)",
    backgroundColor: "#fff",
  };

  return (
    <div className="space-y-4">
      <section className="space-y-4 rounded-[24px] border border-[var(--color-wb-border)] bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wb-primary)]">
              {t("Revenue overview")}
            </p>
            <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-[var(--color-wb-text)] sm:text-2xl">
              {formatCurrency(revenueSeries.reduce((sum, point) => sum + point.revenue, 0))}
            </h2>
            <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-[var(--color-wb-text-muted)]">
              <span>{t("Receipt views this month")}</span>
              <span className="text-[var(--color-wb-primary)]">
                {formatCompact(receiptViews)}
              </span>
            </p>
            <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
              {t("Total revenue this month")}
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <article className="wb-soft-card min-w-[13rem] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                {t("Vs last month")}
              </p>
              <p className="mt-2 flex items-center gap-2 text-lg font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                {revenueSeries.length && revenueSeries[0].revenue >= 0 ? (
                  <span className="text-emerald-600">▲</span>
                ) : (
                  <span className="text-rose-600">▼</span>
                )}
                {formatPercent(
                  lastMonthRevenue
                    ?
                      ((revenueSeries.reduce((s, item) => s + item.revenue, 0) - lastMonthRevenue) /
                        lastMonthRevenue) *
                        100
                    : 0,
                )}
              </p>
              <p className="mt-1 text-xs text-[var(--color-wb-text-muted)]">
                {t("Last month:")} {formatCurrency(lastMonthRevenue)}
              </p>
            </article>
            <article className="wb-soft-card min-w-[13rem] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                {t("Avg order value")}
              </p>
              <p className="mt-2 text-lg font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                {formatCurrency(averageOrderValueThisMonth)}
              </p>
              <p className="mt-1 text-xs text-[var(--color-wb-text-muted)]">
                {t("This month")}
              </p>
            </article>
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[680px]">
            <ResponsiveContainer width="100%" height={310}>
              <LineChart data={revenueSeries} margin={{ top: 16, right: 18, left: 6, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e2" />
                <XAxis dataKey="label" stroke="#5E6461" fontSize={11} />
                <YAxis
                  stroke="#5E6461"
                  fontSize={11}
                  tickFormatter={(value) => formatCompact(value as number)}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value ?? 0))}
                  contentStyle={chartTooltipStyle}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0F5D46"
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-[24px] border border-[var(--color-wb-border)] bg-white p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wb-primary)]">
          {t("Order funnel")}
        </p>
        <div className="overflow-x-auto">
          <div className="grid min-w-[760px] grid-cols-5 gap-3">
            {funnel.rows.map((stage, index) => (
              <article
                key={stage.label}
                className={`rounded-2xl border p-3 ${
                  funnel.dropIndex === index
                    ? "border-amber-300 bg-amber-50"
                    : "border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)]"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                  {t(stage.label)}
                </p>
                <p className="mt-2 text-2xl font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                  {stage.count}
                </p>
                <p className="mt-1 text-xs text-[var(--color-wb-text-muted)]">
                  {stage.conversion}% {t("conversion")}
                </p>
                {funnel.dropIndex === index ? (
                  <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                    <AlertTriangle className="h-3 w-3" />
                    {t("Biggest drop-off")}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="space-y-4 rounded-[24px] border border-[var(--color-wb-border)] bg-white p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wb-primary)]">
            {t("Channel breakdown")}
          </p>
          <div className="grid gap-4 sm:grid-cols-[1fr_0.95fr] sm:items-center">
            <div className="overflow-x-auto">
              <div className="min-w-[280px]">
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie
                      data={channelBreakdown.rows}
                      dataKey="revenue"
                      nameKey="channel"
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={88}
                      paddingAngle={2}
                    >
                      {channelBreakdown.rows.map((entry) => (
                        <Cell key={entry.channel} fill={CHANNEL_COLORS[entry.channel] || "#0F5D46"} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value ?? 0))}
                      contentStyle={chartTooltipStyle}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="space-y-2.5">
              {channelBreakdown.rows.map((row) => (
                <div
                  key={row.channel}
                  className="rounded-xl border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-3"
                >
                  <p className="text-sm font-semibold text-[var(--color-wb-text)]">
                    {row.channel}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
                    {row.orders} {t("orders")} • {formatCurrency(row.revenue)}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-800">
              {t("Best channel")}
            </p>
            <p className="mt-1 text-base font-black tracking-[-0.02em] text-emerald-900">
              {channelBreakdown.best.channel} {t("brings")} {channelBreakdown.bestPercent}% {t("of your revenue")}
            </p>
          </div>
        </article>

        <article className="space-y-4 rounded-[24px] border border-[var(--color-wb-border)] bg-white p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wb-primary)]">
            {t("Payment health")}
          </p>
          <div className="overflow-x-auto">
            <div className="min-w-[680px]">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={paymentHealthSeries} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e2" />
                  <XAxis dataKey="channel" stroke="#5E6461" fontSize={11} />
                  <YAxis
                    stroke="#5E6461"
                    fontSize={11}
                    tickFormatter={(value) => formatCompact(Number(value))}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value ?? 0))}
                    contentStyle={chartTooltipStyle}
                  />
                  <Bar dataKey="paid" stackId="payments" fill={STATUS_COLORS.paid} name={t("Paid")} />
                  <Bar dataKey="partial" stackId="payments" fill={STATUS_COLORS.partial} name={t("Partial")} />
                  <Bar dataKey="unpaid" stackId="payments" fill={STATUS_COLORS.unpaid} name={t("Unpaid")} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <article className="rounded-2xl border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                {t("Outstanding amount")}
              </p>
              <p className={`mt-2 text-2xl font-black tracking-[-0.03em] ${outstandingAmount > 0 ? "text-rose-700" : "text-emerald-700"}`}>
                {formatCurrency(outstandingAmount)}
              </p>
            </article>
            <article className="rounded-2xl border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                {t("Avg days to payment")}
              </p>
              <div className="mt-2 space-y-1 text-sm text-[var(--color-wb-text)]">
                {avgPaymentDaysByChannel.map((row) => (
                  <p key={row.channel} className="flex items-center justify-between gap-2">
                    <span>{row.channel}</span>
                    <span className="font-semibold">
                      {row.avgDays.toFixed(1)} {t("days")}
                    </span>
                  </p>
                ))}
              </div>
            </article>
          </div>
        </article>
      </div>

      <section className="rounded-[24px] border border-[var(--color-wb-border)] bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wb-primary)]">
            {t("Top customers")}
          </p>
          <p className="text-xs text-[var(--color-wb-text-muted)]">{t("Mini CRM view")}</p>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[700px] w-full border-collapse">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.12em] text-[var(--color-wb-text-muted)]">
                <th className="border-b border-[var(--color-wb-border)] px-3 py-2">{t("Customer")}</th>
                <th className="border-b border-[var(--color-wb-border)] px-3 py-2">{t("Total orders")}</th>
                <th className="border-b border-[var(--color-wb-border)] px-3 py-2">{t("Total TZS")}</th>
                <th className="border-b border-[var(--color-wb-border)] px-3 py-2">{t("Last order")}</th>
                <th className="border-b border-[var(--color-wb-border)] px-3 py-2">{t("Profile")}</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.length ? (
                topCustomers.map((customer) => (
                  <tr key={`${customer.id}-${customer.name}`} className="text-sm text-[var(--color-wb-text)]">
                    <td className="border-b border-[var(--color-wb-border)] px-3 py-3 font-semibold">
                      {customer.name}
                    </td>
                    <td className="border-b border-[var(--color-wb-border)] px-3 py-3">{customer.totalOrders}</td>
                    <td className="border-b border-[var(--color-wb-border)] px-3 py-3 font-semibold text-[var(--color-wb-primary)]">
                      {formatCurrency(customer.totalAmount)}
                    </td>
                    <td className="border-b border-[var(--color-wb-border)] px-3 py-3 text-[var(--color-wb-text-muted)]">
                      {formatDate(customer.lastOrderAt)}
                    </td>
                    <td className="border-b border-[var(--color-wb-border)] px-3 py-3 text-[var(--color-wb-primary)]">
                      {customer.id ? (
                        <span className="text-sm font-semibold underline">{t("View order")}</span>
                      ) : (
                        <span className="text-[var(--color-wb-text-muted)]">{t("N/A")}</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="border-b border-[var(--color-wb-border)] px-3 py-6 text-center text-sm text-[var(--color-wb-text-muted)]">
                    {t("No customer activity in this date range yet.")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-[24px] border border-[var(--color-wb-border)] bg-white p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wb-primary)]">
            {t("Product / Item Insights")}
          </p>
          <p className="mt-2 text-sm text-[var(--color-wb-text-muted)]">{t("Top 5 items by revenue")}</p>
          <div className="mt-3 space-y-2">
            {itemInsights.byRevenue.length ? (
              itemInsights.byRevenue.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] px-3 py-2.5 text-sm"
                >
                  <span className="font-semibold text-[var(--color-wb-text)]">
                    {index + 1}. {item.name}
                  </span>
                  <span className="font-semibold text-[var(--color-wb-primary)]">{formatCurrency(item.revenue)}</span>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] px-3 py-4 text-sm text-[var(--color-wb-text-muted)]">
                {t("No item-level revenue data in this date range.")}
              </p>
            )}
          </div>
        </article>
        <article className="rounded-[24px] border border-[var(--color-wb-border)] bg-white p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wb-primary)]">
            {t("Product / Item Insights")}
          </p>
          <p className="mt-2 text-sm text-[var(--color-wb-text-muted)]">{t("Top 5 items by order frequency")}</p>
          <div className="mt-3 space-y-2">
            {itemInsights.byFrequency.length ? (
              itemInsights.byFrequency.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] px-3 py-2.5 text-sm"
                >
                  <span className="font-semibold text-[var(--color-wb-text)]">
                    {index + 1}. {item.name}
                  </span>
                  <span className="font-semibold text-[var(--color-wb-text)]">
                    {item.frequency} {t("orders")}
                  </span>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] px-3 py-4 text-sm text-[var(--color-wb-text-muted)]">
                {t("No item frequency data in this date range.")}
              </p>
            )}
          </div>
        </article>
      </section>

      <section className="rounded-[24px] border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4 text-sm text-[var(--color-wb-text-muted)] sm:p-5">
        <p className="flex items-center gap-2 font-semibold text-[var(--color-wb-text)]">
          <TrendingUp className="h-4 w-4 text-[var(--color-wb-primary)]" />
          {t("Analytics in Growth plan")}
        </p>
        <p className="mt-2 leading-7">
          {t(
            "These metrics update from your real orders, payments, and customer history so you can spot drop-offs, chase outstanding payments, and scale what is already working.",
          )}
        </p>
      </section>
    </div>
  );
}
