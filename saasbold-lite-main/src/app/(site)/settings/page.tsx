import { Bell, Building2, Database, Shield, Smartphone } from "lucide-react";
import { getLocale } from "next-intl/server";
import {
  EmptyState,
  PageHeader,
  SectionCard,
} from "@/components/whatsboard-dashboard/dashboard-ui";
import {
  formatCurrency,
  formatDate,
} from "@/components/whatsboard-dashboard/formatting";
import {
  listCustomers,
  listFollowUps,
  listOrders,
  listPayments,
} from "@/lib/whatsboard-repository";
import { resolveLegacyBusinessContextForRequest } from "@/lib/repositories/supabase-legacy-repository";
import { isSupabaseServerConfigured } from "@/lib/supabase/server";
import { translateUiText } from "@/lib/ui-translations";

export const dynamic = "force-dynamic";

function mostFrequent(values: string[]) {
  const counts = new Map<string, number>();
  values.forEach((value) => {
    const key = value.trim();
    if (!key) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  let selected = "";
  let maxCount = 0;
  counts.forEach((count, key) => {
    if (count > maxCount) {
      selected = key;
      maxCount = count;
    }
  });
  return selected || null;
}

export default async function SettingsPage() {
  const locale = await getLocale();
  const tr = (value: string) => translateUiText(value, locale as "en" | "sw");
  const [orders, customers, followUps, payments, businessContext] =
    await Promise.all([
      listOrders(),
      listCustomers(),
      listFollowUps(),
      listPayments(),
      resolveLegacyBusinessContextForRequest(),
    ]);

  const topChannel = mostFrequent(orders.map((order) => order.channel));
  const topCity = mostFrequent(customers.map((customer) => customer.location));
  const totalRevenue = payments
    .filter((payment) => payment.status === "paid" || payment.status === "cod")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const lastActivityAt = [
    orders[0]?.updatedAt,
    payments[0]?.createdAt,
    followUps[0]?.dueAt,
  ]
    .filter(Boolean)
    .sort()
    .at(-1);
  const persistenceDriver =
    process.env.WHATSBOARD_PERSISTENCE_DRIVER?.trim() || "supabase (auto)";

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title={tr("Settings")}
        description={tr(
          "Live workspace configuration and system status based on real Supabase data.",
        )}
      />

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          title={tr("Workspace profile")}
          description={tr("Operational profile computed from your current data.")}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-wb-text-muted)]">
                {tr("Business name")}
              </p>
              <p className="mt-2 text-lg font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                {businessContext.businessName}
              </p>
            </div>
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-wb-text-muted)]">
                {tr("Account email")}
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-wb-text)]">
                {businessContext.profileEmail || tr("Not set")}
              </p>
            </div>
          </div>

          {orders.length || customers.length || payments.length ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="wb-soft-card p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-wb-text-muted)]">
                  {tr("Primary channel")}
                </p>
                <p className="mt-2 text-lg font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                  {topChannel || tr("Not enough data yet")}
                </p>
              </div>
              <div className="wb-soft-card p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-wb-text-muted)]">
                  {tr("Top delivery city")}
                </p>
                <p className="mt-2 text-lg font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                  {topCity || tr("Not enough data yet")}
                </p>
              </div>
              <div className="wb-soft-card p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-wb-text-muted)]">
                  {tr("Customers tracked")}
                </p>
                <p className="mt-2 text-lg font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                  {customers.length}
                </p>
              </div>
              <div className="wb-soft-card p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-wb-text-muted)]">
                  {tr("Revenue recorded")}
                </p>
                <p className="mt-2 text-lg font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
              <div className="wb-soft-card p-4 sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-wb-text-muted)]">
                  {tr("Latest activity")}
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--color-wb-text)]">
                  {lastActivityAt
                    ? formatDate(lastActivityAt)
                    : tr("No activity yet")}
                </p>
              </div>
            </div>
          ) : (
            <EmptyState
              title={tr("No workspace data yet")}
              detail={tr(
                "Create your first customer, order, follow-up, or payment to generate a live workspace profile.",
              )}
            />
          )}
        </SectionCard>

        <SectionCard
          title={tr("System and security status")}
          description={tr("Current persistence and app health configuration.")}
        >
          <div className="space-y-3">
            {[
              {
                icon: Database,
                label: tr("Persistence driver"),
                detail: persistenceDriver,
              },
              {
                icon: Shield,
                label: tr("Supabase configuration"),
                detail: isSupabaseServerConfigured()
                  ? tr("Configured")
                  : tr("Missing required environment variables"),
              },
              {
                icon: Building2,
                label: tr("Orders stored"),
                detail: `${orders.length} ${tr("records")}`,
              },
              {
                icon: Bell,
                label: tr("Follow-ups stored"),
                detail: `${followUps.length} ${tr("records")}`,
              },
              {
                icon: Smartphone,
                label: tr("Payments stored"),
                detail: `${payments.length} ${tr("records")}`,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-3 rounded-[22px] border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[var(--color-wb-primary)]">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--color-wb-text)]">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
                      {item.detail}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
