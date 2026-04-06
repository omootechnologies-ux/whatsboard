"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { CalendarRange } from "lucide-react";
import type {
  CustomerRecord,
  OrderRecord,
  OrderStage,
  PaymentRecord,
} from "@/data/whatsboard";
import { formatDate } from "@/components/whatsboard-dashboard/formatting";
import { translateUiText } from "@/lib/ui-translations";
import type { AnalyticsVisualsProps } from "./analytics-visuals";

const AnalyticsVisuals = dynamic(
  () =>
    import("./analytics-visuals").then((module) => module.AnalyticsVisuals),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4 rounded-[24px] border border-[var(--color-wb-border)] bg-white p-6 text-center text-sm text-[var(--color-wb-text-muted)]">
        <p>Loading analytics…</p>
      </div>
    ),
  },
);

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
  receiptViews: number;
};

type TimeBucket = {
  key: string;
  label: string;
  start: Date;
  end: Date;
};

const FILTER_PRESETS: FilterPreset[] = [
  "this_week",
  "this_month",
  "last_month",
  "last_3_months",
  "custom",
];

const CHANNELS = ["WhatsApp", "Instagram", "Facebook", "Other"] as const;

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

function getPresetRange(
  preset: FilterPreset,
  now: Date,
  customStart: string,
  customEnd: string,
): DateRange {
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

function formatBucketLabel(
  date: Date,
  granularity: ChartGranularity,
  localeTag: "en-TZ" | "sw-TZ",
) {
  if (granularity === "daily") {
    return new Intl.DateTimeFormat(localeTag, {
      day: "2-digit",
      month: "short",
    }).format(date);
  }
  if (granularity === "weekly") {
    return `Wk ${new Intl.DateTimeFormat(localeTag, {
      day: "2-digit",
      month: "short",
    }).format(startOfWeek(date))}`;
  }
  return new Intl.DateTimeFormat(localeTag, {
    month: "short",
    year: "2-digit",
  }).format(date);
}

function buildBuckets(
  range: DateRange,
  granularity: ChartGranularity,
  localeTag: "en-TZ" | "sw-TZ",
): TimeBucket[] {
  const buckets: TimeBucket[] = [];

  if (granularity === "daily") {
    let cursor = toDayStart(range.start);
    while (cursor <= range.end) {
      const start = toDayStart(cursor);
      const end = toDayEnd(cursor);
      buckets.push({
        key: getTimeBucketKey(start, granularity),
        label: formatBucketLabel(start, granularity, localeTag),
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
        label: formatBucketLabel(start, granularity, localeTag),
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
      label: formatBucketLabel(start, granularity, localeTag),
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

const FILTER_PRESET_LABELS: Record<FilterPreset, string> = {
  this_week: "This week",
  this_month: "This month",
  last_month: "Last month",
  last_3_months: "Last 3 months",
  custom: "Custom range",
};

const GRANULARITY_LABELS: Record<ChartGranularity, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

export function AnalyticsDashboard({
  orders,
  payments,
  customers,
  receiptViews,
}: AnalyticsDashboardProps) {
  const locale = useLocale() as "en" | "sw";
  const tr = useCallback(
    (value: string) => translateUiText(value, locale),
    [locale],
  );
  const localeTag = locale === "sw" ? "sw-TZ" : "en-TZ";
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

  const averageOrderValueThisMonth = useMemo(() => {
    const monthOrders = orders.filter((order) =>
      inRange(order.createdAt, thisMonthRange),
    );
    if (!monthOrders.length) return 0;
    return sum(monthOrders, (order) => order.amount) / monthOrders.length;
  }, [orders, thisMonthRange]);

  const revenueBuckets = useMemo(
    () => buildBuckets(activeRange, granularity, localeTag),
    [activeRange, granularity, localeTag],
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
    const bestPercent = totalRevenue ? Math.round((best.revenue / totalRevenue) * 100) : 0;

    return {
      rows,
      best,
      bestPercent,
      totalRevenue,
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
    () => sum(paymentHealthSeries, (row) => row.unpaid + row.partial),
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
      const name =
        lookup?.name || order.customerName || tr("Unknown customer");
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
  }, [filteredOrders, customers, tr]);

  const itemInsights = useMemo(() => {
    const map = new Map<string, { name: string; revenue: number; frequency: number }>();

    filteredOrders.forEach((order) => {
      const items = order.items?.length
        ? order.items
        : [order.notes || tr("Order item")];
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
  }, [filteredOrders, tr]);

  const visualProps = useMemo<AnalyticsVisualsProps>(
    () => ({
      receiptViews,
      revenueSeries,
      lastMonthRevenue,
      averageOrderValueThisMonth,
      funnel,
      channelBreakdown: {
        rows: channelBreakdown.rows,
        best: channelBreakdown.best,
        bestPercent: channelBreakdown.bestPercent,
      },
      paymentHealthSeries,
      outstandingAmount,
      avgPaymentDaysByChannel,
      topCustomers,
      itemInsights,
    }),
    [
      receiptViews,
      revenueSeries,
      lastMonthRevenue,
      averageOrderValueThisMonth,
      funnel,
      channelBreakdown.best,
      channelBreakdown.bestPercent,
      channelBreakdown.rows,
      paymentHealthSeries,
      outstandingAmount,
      avgPaymentDaysByChannel,
      topCustomers,
      itemInsights,
    ],
  );

  return (
    <div className="space-y-5 lg:space-y-6">
      <section className="rounded-[24px] border border-[var(--color-wb-border)] bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wb-primary)]">
              {tr("Date range")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {FILTER_PRESETS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setPreset(option)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                    preset === option
                      ? "border-[var(--color-wb-primary)] bg-[var(--color-wb-primary-soft)] text-[var(--color-wb-primary)]"
                      : "border-[var(--color-wb-border)] bg-white text-[var(--color-wb-text-muted)] hover:text-[var(--color-wb-text)]"
                  }`}
                >
                  {tr(FILTER_PRESET_LABELS[option])}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            {preset === "custom" ? (
              <>
                <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                  {tr("Start")}
                  <input
                    type="date"
                    value={customStart}
                    onChange={(event) => setCustomStart(event.target.value)}
                    className="wb-input min-w-[10rem]"
                  />
                </label>
                <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                  {tr("End")}
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
              {tr("Revenue chart")}
              <select
                value={granularity}
                onChange={(event) => setGranularity(event.target.value as ChartGranularity)}
                className="wb-input min-w-[10rem]"
              >
                <option value="daily">{tr(GRANULARITY_LABELS.daily)}</option>
                <option value="weekly">{tr(GRANULARITY_LABELS.weekly)}</option>
                <option value="monthly">{tr(GRANULARITY_LABELS.monthly)}</option>
              </select>
            </label>
          </div>
        </div>

        <p className="mt-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
          <CalendarRange className="h-3.5 w-3.5" />
          {formatDate(activeRange.start.toISOString())} - {formatDate(activeRange.end.toISOString())}
        </p>
      </section>

      <AnalyticsVisuals {...visualProps} />
    </div>
  );
}
