"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  CalendarRange,
  TrendingUp,
} from "lucide-react";
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
import type {
  CustomerRecord,
  OrderRecord,
  OrderStage,
  PaymentRecord,
} from "@/data/whatsboard";
import { formatCurrency, formatDate } from "@/components/whatsboard-dashboard/formatting";

type FilterPreset = "this_week" | "this_month" | "last_month" | "last_3_months" | "custom";
type ChartGranularity = "daily" | "weekly" | "monthly";

type DateRange = {
  start: Date;
  end: Date;
};

type AnalyticsDashboardProps = {
  orders: OrderRecord[];
  payments: PaymentRecord[];
  customers: CustomerRecord[];
};

type TimeBucket = {
  key: string;
  label: string;
  start: Date;
  end: Date;
};

const FILTER_PRESETS: Array<{ key: FilterPreset; label: string }> = [
  { key: "this_week", label: "This week" },
  { key: "this_month", label: "This month" },
  { key: "last_month", label: "Last month" },
  { key: "last_3_months", label: "Last 3 months" },
  { key: "custom", label: "Custom range" },
];

const CHANNELS = ["WhatsApp", "Instagram", "Facebook", "Other"] as const;

const CHANNEL_COLORS: Record<(typeof CHANNELS)[number], string> = {
  WhatsApp: "#0F5D46",
  Instagram: "#3A6A5B",
  Facebook: "#6A8E83",
  Other: "#9AA8A2",
};

const STATUS_COLORS = {
  paid: "#0F5D46",
  partial: "#D98A2F",
  unpaid: "#C7675D",
};

const STAGE_PROGRESS: Record<OrderStage, number> = {
  new_order: 0,
  waiting_payment: 1,
  paid: 2,
  packing: 3,
  dispatched: 4,
  delivered: 5,
};

function toDayStart(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 0, 0, 0, 0);
}

function toDayEnd(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 23, 59, 59, 999);
}

function addDays(value: Date, days: number) {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(value: Date) {
  const start = toDayStart(value);
  const weekday = start.getDay();
  const mondayOffset = (weekday + 6) % 7;
  return addDays(start, -mondayOffset);
}

function startOfMonth(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(value: Date) {
  return new Date(value.getFullYear(), value.getMonth() + 1, 0, 23, 59, 59, 999);
}

function parseDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function toInputDate(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function inRange(dateValue: string | null | undefined, range: DateRange) {
  if (!dateValue) return false;
  const parsed = parseDate(dateValue);
  if (!parsed) return false;
  return parsed >= range.start && parsed <= range.end;
}

function normalizeChannel(value: string | null | undefined) {
  if (value === "WhatsApp" || value === "Instagram" || value === "Facebook") {
    return value;
  }
  return "Other";
}

function isRevenuePayment(payment: PaymentRecord) {
  return payment.status === "paid" || payment.status === "cod";
}

function getPresetRange(preset: FilterPreset, now: Date, customStart: string, customEnd: string): DateRange {
  if (preset === "custom") {
    const start = parseDate(customStart);
    const end = parseDate(customEnd);
    if (start && end) {
      return {
        start: toDayStart(start),
        end: toDayEnd(end),
      };
    }
    return {
      start: startOfMonth(now),
      end: toDayEnd(now),
    };
  }

  if (preset === "this_week") {
    return {
      start: startOfWeek(now),
      end: toDayEnd(now),
    };
  }

  if (preset === "this_month") {
    return {
      start: startOfMonth(now),
      end: toDayEnd(now),
    };
  }

  if (preset === "last_month") {
    const reference = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return {
      start: startOfMonth(reference),
      end: endOfMonth(reference),
    };
  }

  const start = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 2, 1));
  return {
    start,
    end: toDayEnd(now),
  };
}

function getTimeBucketKey(date: Date, granularity: ChartGranularity) {
  if (granularity === "daily") {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }
  if (granularity === "weekly") {
    const weekStart = startOfWeek(date);
    return `${weekStart.getFullYear()}-${weekStart.getMonth() + 1}-${weekStart.getDate()}`;
  }
  return `${date.getFullYear()}-${date.getMonth() + 1}`;
}

function formatBucketLabel(date: Date, granularity: ChartGranularity) {
  if (granularity === "daily") {
    return new Intl.DateTimeFormat("en-TZ", {
      day: "2-digit",
      month: "short",
    }).format(date);
  }
  if (granularity === "weekly") {
    return `Wk ${new Intl.DateTimeFormat("en-TZ", {
      day: "2-digit",
      month: "short",
    }).format(startOfWeek(date))}`;
  }
  return new Intl.DateTimeFormat("en-TZ", {
    month: "short",
    year: "2-digit",
  }).format(date);
}

function buildBuckets(range: DateRange, granularity: ChartGranularity): TimeBucket[] {
  const buckets: TimeBucket[] = [];

  if (granularity === "daily") {
    let cursor = toDayStart(range.start);
    while (cursor <= range.end) {
      const start = toDayStart(cursor);
      const end = toDayEnd(cursor);
      buckets.push({
        key: getTimeBucketKey(start, granularity),
        label: formatBucketLabel(start, granularity),
        start,
        end,
      });
      cursor = addDays(cursor, 1);
    }
    return buckets;
  }

  if (granularity === "weekly") {
    let cursor = startOfWeek(range.start);
    while (cursor <= range.end) {
      const start = toDayStart(cursor);
      const end = toDayEnd(addDays(start, 6));
      buckets.push({
        key: getTimeBucketKey(start, granularity),
        label: formatBucketLabel(start, granularity),
        start,
        end,
      });
      cursor = addDays(cursor, 7);
    }
    return buckets;
  }

  let cursor = startOfMonth(range.start);
  while (cursor <= range.end) {
    const start = startOfMonth(cursor);
    const end = endOfMonth(cursor);
    buckets.push({
      key: getTimeBucketKey(start, granularity),
      label: formatBucketLabel(start, granularity),
      start,
      end,
    });
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }
  return buckets;
}

function sum<T>(list: T[], getter: (item: T) => number) {
  return list.reduce((total, item) => total + getter(item), 0);
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-TZ", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function AnalyticsDashboard({
  orders,
  payments,
  customers,
}: AnalyticsDashboardProps) {
  const now = useMemo(() => new Date(), []);
  const [preset, setPreset] = useState<FilterPreset>("this_month");
  const [granularity, setGranularity] = useState<ChartGranularity>("daily");
  const [customStart, setCustomStart] = useState(toInputDate(startOfMonth(now)));
  const [customEnd, setCustomEnd] = useState(toInputDate(now));

  const activeRange = useMemo(
    () => getPresetRange(preset, now, customStart, customEnd),
    [preset, now, customStart, customEnd],
  );

  const filteredOrders = useMemo(
    () => orders.filter((order) => inRange(order.createdAt, activeRange)),
    [orders, activeRange],
  );

  const filteredPayments = useMemo(
    () => payments.filter((payment) => inRange(payment.createdAt, activeRange)),
    [payments, activeRange],
  );

  const thisMonthRange = useMemo(
    () => ({
      start: startOfMonth(now),
      end: toDayEnd(now),
    }),
    [now],
  );

  const lastMonthRange = useMemo(() => {
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return {
      start: startOfMonth(lastMonthDate),
      end: endOfMonth(lastMonthDate),
    };
  }, [now]);

  const thisMonthRevenue = useMemo(
    () =>
      sum(
        payments.filter(
          (payment) =>
            isRevenuePayment(payment) && inRange(payment.createdAt, thisMonthRange),
        ),
        (payment) => payment.amount,
      ),
    [payments, thisMonthRange],
  );

  const lastMonthRevenue = useMemo(
    () =>
      sum(
        payments.filter(
          (payment) =>
            isRevenuePayment(payment) && inRange(payment.createdAt, lastMonthRange),
        ),
        (payment) => payment.amount,
      ),
    [payments, lastMonthRange],
  );

  const revenueDeltaPercent =
    lastMonthRevenue === 0
      ? thisMonthRevenue === 0
        ? 0
        : 100
      : ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

  const averageOrderValueThisMonth = useMemo(() => {
    const monthOrders = orders.filter((order) =>
      inRange(order.createdAt, thisMonthRange),
    );
    if (!monthOrders.length) return 0;
    return sum(monthOrders, (order) => order.amount) / monthOrders.length;
  }, [orders, thisMonthRange]);

  const revenueBuckets = useMemo(
    () => buildBuckets(activeRange, granularity),
    [activeRange, granularity],
  );

  const revenueSeries = useMemo(() => {
    const totals = new Map<string, number>();
    revenueBuckets.forEach((bucket) => totals.set(bucket.key, 0));

    filteredPayments.forEach((payment) => {
      if (!isRevenuePayment(payment)) return;
      const date = parseDate(payment.createdAt);
      if (!date) return;
      const key = getTimeBucketKey(date, granularity);
      totals.set(key, (totals.get(key) || 0) + payment.amount);
    });

    return revenueBuckets.map((bucket) => ({
      label: bucket.label,
      revenue: totals.get(bucket.key) || 0,
    }));
  }, [filteredPayments, revenueBuckets, granularity]);

  const funnel = useMemo(() => {
    const total = filteredOrders.length;
    const countReached = (minimumRank: number) =>
      filteredOrders.filter((order) => STAGE_PROGRESS[order.stage] >= minimumRank)
        .length;

    const rows = [
      { label: "New", rank: 0 },
      { label: "Confirmed", rank: 1 },
      { label: "Packed", rank: 3 },
      { label: "Dispatched", rank: 4 },
      { label: "Delivered", rank: 5 },
    ].map((step) => {
      const count = countReached(step.rank);
      const conversion = total ? Math.round((count / total) * 100) : 0;
      return {
        ...step,
        count,
        conversion,
      };
    });

    let dropIndex = -1;
    let maxDrop = -1;
    for (let index = 0; index < rows.length - 1; index += 1) {
      const drop = rows[index].count - rows[index + 1].count;
      if (drop > maxDrop) {
        maxDrop = drop;
        dropIndex = index + 1;
      }
    }

    return {
      rows,
      dropIndex,
    };
  }, [filteredOrders]);

  const channelBreakdown = useMemo(() => {
    const map = new Map<string, { channel: (typeof CHANNELS)[number]; revenue: number; orders: number }>();
    CHANNELS.forEach((channel) =>
      map.set(channel, {
        channel,
        revenue: 0,
        orders: 0,
      }),
    );

    filteredOrders.forEach((order) => {
      const channel = normalizeChannel(order.channel);
      const current = map.get(channel)!;
      current.orders += 1;
      if (order.paymentStatus === "paid" || order.paymentStatus === "cod") {
        current.revenue += order.amount;
      }
    });

    const rows = CHANNELS.map((channel) => map.get(channel)!);
    const totalRevenue = sum(rows, (row) => row.revenue);
    const best = [...rows].sort((a, b) => b.revenue - a.revenue)[0];
    const bestPercent = totalRevenue
      ? Math.round((best.revenue / totalRevenue) * 100)
      : 0;

    return {
      rows,
      totalRevenue,
      best,
      bestPercent,
    };
  }, [filteredOrders]);

  const paymentHealthSeries = useMemo(() => {
    const byChannel = new Map<
      (typeof CHANNELS)[number],
      { channel: (typeof CHANNELS)[number]; paid: number; unpaid: number; partial: number }
    >();
    CHANNELS.forEach((channel) =>
      byChannel.set(channel, { channel, paid: 0, unpaid: 0, partial: 0 }),
    );

    filteredOrders.forEach((order) => {
      const row = byChannel.get(normalizeChannel(order.channel))!;
      if (order.paymentStatus === "paid" || order.paymentStatus === "cod") {
        row.paid += order.amount;
      } else if (order.paymentStatus === "partial") {
        row.partial += order.amount;
      } else {
        row.unpaid += order.amount;
      }
    });

    return CHANNELS.map((channel) => byChannel.get(channel)!);
  }, [filteredOrders]);

  const outstandingAmount = useMemo(
    () =>
      sum(paymentHealthSeries, (row) => row.unpaid + row.partial),
    [paymentHealthSeries],
  );

  const avgPaymentDaysByChannel = useMemo(() => {
    const firstPaidAtByOrder = new Map<string, Date>();
    payments.forEach((payment) => {
      if (!isRevenuePayment(payment) || !payment.orderId) return;
      const paidAt = parseDate(payment.createdAt);
      if (!paidAt) return;
      const existing = firstPaidAtByOrder.get(payment.orderId);
      if (!existing || paidAt < existing) {
        firstPaidAtByOrder.set(payment.orderId, paidAt);
      }
    });

    const channelTotals = new Map<
      (typeof CHANNELS)[number],
      { days: number; count: number }
    >();
    CHANNELS.forEach((channel) => channelTotals.set(channel, { days: 0, count: 0 }));

    filteredOrders.forEach((order) => {
      if (!(order.paymentStatus === "paid" || order.paymentStatus === "cod")) {
        return;
      }
      const start = parseDate(order.createdAt);
      const end = firstPaidAtByOrder.get(order.id) || parseDate(order.updatedAt);
      if (!start || !end) return;
      const days = Math.max(
        0,
        Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
      );
      const channel = normalizeChannel(order.channel);
      const current = channelTotals.get(channel)!;
      current.days += days;
      current.count += 1;
    });

    return CHANNELS.map((channel) => {
      const entry = channelTotals.get(channel)!;
      return {
        channel,
        avgDays: entry.count ? entry.days / entry.count : 0,
      };
    });
  }, [filteredOrders, payments]);

  const topCustomers = useMemo(() => {
    const customerLookup = new Map(customers.map((customer) => [customer.id, customer]));
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        totalOrders: number;
        totalAmount: number;
        lastOrderAt: string;
      }
    >();

    filteredOrders.forEach((order) => {
      const key = order.customerId || order.customerName || `customer-${order.id}`;
      const lookup = customerLookup.get(order.customerId);
      const name = lookup?.name || order.customerName || "Unknown customer";
      const current = map.get(key) || {
        id: order.customerId,
        name,
        totalOrders: 0,
        totalAmount: 0,
        lastOrderAt: order.createdAt,
      };
      current.totalOrders += 1;
      current.totalAmount += order.amount;
      if (order.createdAt > current.lastOrderAt) {
        current.lastOrderAt = order.createdAt;
      }
      map.set(key, current);
    });

    return Array.from(map.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 8);
  }, [filteredOrders, customers]);

  const itemInsights = useMemo(() => {
    const map = new Map<string, { name: string; revenue: number; frequency: number }>();

    filteredOrders.forEach((order) => {
      const items = order.items?.length ? order.items : [order.notes || "Order item"];
      const normalized = items.map((item) => item.trim()).filter(Boolean);
      if (!normalized.length) return;
      const splitRevenue = order.amount / normalized.length;
      normalized.forEach((item) => {
        const current = map.get(item) || {
          name: item,
          revenue: 0,
          frequency: 0,
        };
        current.revenue += splitRevenue;
        current.frequency += 1;
        map.set(item, current);
      });
    });

    const values = Array.from(map.values());
    return {
      byRevenue: [...values].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
      byFrequency: [...values].sort((a, b) => b.frequency - a.frequency).slice(0, 5),
    };
  }, [filteredOrders]);

  const chartTooltipStyle = {
    borderRadius: "12px",
    border: "1px solid var(--color-wb-border)",
    backgroundColor: "#fff",
  };

  return (
    <div className="space-y-5 lg:space-y-6">
      <section className="rounded-[24px] border border-[var(--color-wb-border)] bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wb-primary)]">
              Date range
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {FILTER_PRESETS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setPreset(option.key)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                    preset === option.key
                      ? "border-[var(--color-wb-primary)] bg-[var(--color-wb-primary-soft)] text-[var(--color-wb-primary)]"
                      : "border-[var(--color-wb-border)] bg-white text-[var(--color-wb-text-muted)] hover:text-[var(--color-wb-text)]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            {preset === "custom" ? (
              <>
                <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                  Start
                  <input
                    type="date"
                    value={customStart}
                    onChange={(event) => setCustomStart(event.target.value)}
                    className="wb-input min-w-[10rem]"
                  />
                </label>
                <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                  End
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(event) => setCustomEnd(event.target.value)}
                    className="wb-input min-w-[10rem]"
                  />
                </label>
              </>
            ) : null}

            <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
              Revenue chart
              <select
                value={granularity}
                onChange={(event) => setGranularity(event.target.value as ChartGranularity)}
                className="wb-input min-w-[10rem]"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>
          </div>
        </div>

        <p className="mt-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
          <CalendarRange className="h-3.5 w-3.5" />
          {formatDate(activeRange.start.toISOString())} - {formatDate(activeRange.end.toISOString())}
        </p>
      </section>

      <section className="space-y-4 rounded-[24px] border border-[var(--color-wb-border)] bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wb-primary)]">
              Revenue Overview
            </p>
            <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-[var(--color-wb-text)] sm:text-2xl">
              {formatCurrency(thisMonthRevenue)}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
              Total revenue this month
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <article className="wb-soft-card min-w-[13rem] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                Vs last month
              </p>
              <p className="mt-2 flex items-center gap-2 text-lg font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                {revenueDeltaPercent >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-rose-600" />
                )}
                {formatPercent(Math.abs(revenueDeltaPercent))}
              </p>
              <p className="mt-1 text-xs text-[var(--color-wb-text-muted)]">
                Last month: {formatCurrency(lastMonthRevenue)}
              </p>
            </article>

            <article className="wb-soft-card min-w-[13rem] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                Avg order value
              </p>
              <p className="mt-2 text-lg font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                {formatCurrency(averageOrderValueThisMonth)}
              </p>
              <p className="mt-1 text-xs text-[var(--color-wb-text-muted)]">
                This month
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
                  tickFormatter={(value) => formatCompactNumber(Number(value))}
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
          Order Funnel
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
                  {stage.label}
                </p>
                <p className="mt-2 text-2xl font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                  {stage.count}
                </p>
                <p className="mt-1 text-xs text-[var(--color-wb-text-muted)]">
                  {stage.conversion}% conversion
                </p>
                {funnel.dropIndex === index ? (
                  <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                    <AlertTriangle className="h-3 w-3" />
                    Biggest drop-off
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="space-y-4 rounded-[24px] border border-[var(--color-wb-border)] bg-white p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wb-primary)]">
            Channel Breakdown
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
                        <Cell
                          key={entry.channel}
                          fill={CHANNEL_COLORS[entry.channel]}
                        />
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
                    {row.orders} orders • {formatCurrency(row.revenue)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-800">
              Best channel
            </p>
            <p className="mt-1 text-base font-black tracking-[-0.02em] text-emerald-900">
              {channelBreakdown.best.channel} brings {channelBreakdown.bestPercent}%
              {" "}of your revenue
            </p>
          </div>
        </article>

        <article className="space-y-4 rounded-[24px] border border-[var(--color-wb-border)] bg-white p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wb-primary)]">
            Payment Health
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
                    tickFormatter={(value) => formatCompactNumber(Number(value))}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value ?? 0))}
                    contentStyle={chartTooltipStyle}
                  />
                  <Bar dataKey="paid" stackId="payments" fill={STATUS_COLORS.paid} name="Paid" />
                  <Bar dataKey="partial" stackId="payments" fill={STATUS_COLORS.partial} name="Partial" />
                  <Bar dataKey="unpaid" stackId="payments" fill={STATUS_COLORS.unpaid} name="Unpaid" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <article className="rounded-2xl border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                Outstanding amount
              </p>
              <p className={`mt-2 text-2xl font-black tracking-[-0.03em] ${outstandingAmount > 0 ? "text-rose-700" : "text-emerald-700"}`}>
                {formatCurrency(outstandingAmount)}
              </p>
            </article>
            <article className="rounded-2xl border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                Avg days to payment
              </p>
              <div className="mt-2 space-y-1 text-sm text-[var(--color-wb-text)]">
                {avgPaymentDaysByChannel.map((row) => (
                  <p key={row.channel} className="flex items-center justify-between gap-2">
                    <span>{row.channel}</span>
                    <span className="font-semibold">{row.avgDays.toFixed(1)} days</span>
                  </p>
                ))}
              </div>
            </article>
          </div>
        </article>
      </section>

      <section className="rounded-[24px] border border-[var(--color-wb-border)] bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wb-primary)]">
            Top Customers
          </p>
          <p className="text-xs text-[var(--color-wb-text-muted)]">
            Mini CRM view
          </p>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[700px] w-full border-collapse">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.12em] text-[var(--color-wb-text-muted)]">
                <th className="border-b border-[var(--color-wb-border)] px-3 py-2">Customer</th>
                <th className="border-b border-[var(--color-wb-border)] px-3 py-2">Total orders</th>
                <th className="border-b border-[var(--color-wb-border)] px-3 py-2">Total TZS</th>
                <th className="border-b border-[var(--color-wb-border)] px-3 py-2">Last order</th>
                <th className="border-b border-[var(--color-wb-border)] px-3 py-2">Profile</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.length ? (
                topCustomers.map((customer) => (
                  <tr key={`${customer.id}-${customer.name}`} className="text-sm text-[var(--color-wb-text)]">
                    <td className="border-b border-[var(--color-wb-border)] px-3 py-3 font-semibold">
                      {customer.name}
                    </td>
                    <td className="border-b border-[var(--color-wb-border)] px-3 py-3">
                      {customer.totalOrders}
                    </td>
                    <td className="border-b border-[var(--color-wb-border)] px-3 py-3 font-semibold text-[var(--color-wb-primary)]">
                      {formatCurrency(customer.totalAmount)}
                    </td>
                    <td className="border-b border-[var(--color-wb-border)] px-3 py-3 text-[var(--color-wb-text-muted)]">
                      {formatDate(customer.lastOrderAt)}
                    </td>
                    <td className="border-b border-[var(--color-wb-border)] px-3 py-3">
                      {customer.id && customer.id !== "unknown-customer" ? (
                        <Link
                          href={`/customers/${customer.id}`}
                          className="text-sm font-semibold text-[var(--color-wb-primary)] hover:underline"
                        >
                          Open profile
                        </Link>
                      ) : (
                        <span className="text-[var(--color-wb-text-muted)]">N/A</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="border-b border-[var(--color-wb-border)] px-3 py-6 text-center text-sm text-[var(--color-wb-text-muted)]"
                  >
                    No customer activity in this date range yet.
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
            Product / Item Insights
          </p>
          <p className="mt-2 text-sm text-[var(--color-wb-text-muted)]">
            Top 5 items by revenue
          </p>
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
                  <span className="font-semibold text-[var(--color-wb-primary)]">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] px-3 py-4 text-sm text-[var(--color-wb-text-muted)]">
                No item-level revenue data in this date range.
              </p>
            )}
          </div>
        </article>

        <article className="rounded-[24px] border border-[var(--color-wb-border)] bg-white p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wb-primary)]">
            Product / Item Insights
          </p>
          <p className="mt-2 text-sm text-[var(--color-wb-text-muted)]">
            Top 5 items by order frequency
          </p>
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
                    {item.frequency} orders
                  </span>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] px-3 py-4 text-sm text-[var(--color-wb-text-muted)]">
                No item frequency data in this date range.
              </p>
            )}
          </div>
        </article>
      </section>

      <section className="rounded-[24px] border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4 text-sm text-[var(--color-wb-text-muted)] sm:p-5">
        <p className="flex items-center gap-2 font-semibold text-[var(--color-wb-text)]">
          <TrendingUp className="h-4 w-4 text-[var(--color-wb-primary)]" />
          Analytics in Growth plan
        </p>
        <p className="mt-2 leading-7">
          These metrics update from your real orders, payments, and customer history so you can spot drop-offs, chase outstanding payments, and scale what is already working.
        </p>
      </section>
    </div>
  );
}
