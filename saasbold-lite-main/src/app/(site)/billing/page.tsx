import { CreditCard } from "lucide-react";
import {
  DataCell,
  DataRow,
  DataTable,
  EmptyState,
  KpiCard,
  PageHeader,
  SectionCard,
} from "@/components/whatsboard-dashboard/dashboard-ui";
import {
  formatCurrency,
  formatDate,
} from "@/components/whatsboard-dashboard/formatting";
import {
  getBusinessBillingState,
  type BusinessBillingState,
} from "@/lib/billing/subscription";
import {
  formatPlanPriceLabel,
  listBillingPlanConfigs,
  parseBillingPlan,
} from "@/lib/billing/plans";
import { resolveLegacyBusinessIdForRequest } from "@/lib/repositories/supabase-legacy-repository";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type BillingSearchParams = Promise<{
  checkout?: string;
  updated?: string;
  plan?: string;
  error?: string;
}>;

type TransactionRow = {
  id: string;
  amount: number | string | null;
  currency: string | null;
  status: string | null;
  provider: string | null;
  provider_reference: string | null;
  created_at: string | null;
};

function asNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function renderLimit(limit: number | null, label: string) {
  if (limit === null) return `Unlimited ${label}`;
  return `${limit} ${label}`;
}

function isUpgrade(currentPlanAmount: number, targetPlanAmount: number) {
  return targetPlanAmount > currentPlanAmount;
}

function statusMessage(
  search: Awaited<BillingSearchParams>,
  state: BusinessBillingState,
) {
  if (search.updated === "1") {
    const plan = parseBillingPlan(search.plan || state.plan);
    return {
      tone: "success" as const,
      text: `Plan updated successfully. Your workspace is now on ${plan.toUpperCase()}.`,
    };
  }

  if (search.error === "team-limit") {
    return {
      tone: "danger" as const,
      text: "Plan change blocked: reduce your current team members first to fit the selected plan limit.",
    };
  }

  if (search.error === "forbidden") {
    return {
      tone: "danger" as const,
      text: "Only owner/admin can change billing plans.",
    };
  }

  if (search.error === "persistence") {
    return {
      tone: "danger" as const,
      text: "Could not update billing plan right now. Please try again.",
    };
  }

  if (search.checkout) {
    const checkoutPlan = parseBillingPlan(search.checkout);
    if (checkoutPlan !== state.plan) {
      return {
        tone: "info" as const,
        text: `Checkout ready: confirm ${checkoutPlan.toUpperCase()} to activate this plan.`,
      };
    }
  }

  return null;
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: BillingSearchParams;
}) {
  const search = await searchParams;
  const businessId = await resolveLegacyBusinessIdForRequest();
  const client = createSupabaseServiceClient();
  const billingState = await getBusinessBillingState(businessId, client);

  const { data: txnData, error: txnError } = await client
    .from("billing_transactions")
    .select(
      "id,amount,currency,status,provider,provider_reference,created_at",
    )
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (txnError) {
    throw new Error(
      `Failed to load billing transactions: ${JSON.stringify(txnError)}`,
    );
  }

  const transactions = (txnData || []) as TransactionRow[];
  const paidTransactions = transactions.filter(
    (txn) => txn.status === "paid" || txn.status === "free",
  );
  const lifetimePaid = paidTransactions
    .filter((txn) => txn.status === "paid")
    .reduce((sum, txn) => sum + asNumber(txn.amount), 0);
  const activePlan = parseBillingPlan(billingState.plan);
  const activePlanConfig = listBillingPlanConfigs().find(
    (plan) => plan.key === activePlan,
  );
  const checkoutPlan = search.checkout ? parseBillingPlan(search.checkout) : null;
  const flash = statusMessage(search, billingState);

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title="Billing"
        description="Plan selection, billing state, and hard limits that protect workflow quality."
      />

      {flash ? (
        <div
          className={`rounded-2xl border p-4 text-sm ${
            flash.tone === "success"
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
              : flash.tone === "info"
                ? "border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] text-[var(--color-wb-text)]"
                : "border-rose-100 bg-rose-50 text-rose-700"
          }`}
        >
          {flash.text}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        <KpiCard
          label="Current plan"
          value={activePlan.toUpperCase()}
          detail="Plan currently assigned to your workspace."
          accent={<CreditCard className="h-5 w-5" />}
        />
        <KpiCard
          label="Billing status"
          value={(billingState.status || "inactive").toUpperCase()}
          detail="Current billing lifecycle state."
          accent={<CreditCard className="h-5 w-5" />}
        />
        <KpiCard
          label="Monthly orders"
          value={String(billingState.monthlyOrders)}
          detail={renderLimit(
            billingState.monthlyOrderLimit,
            "orders per month",
          )}
          accent={<CreditCard className="h-5 w-5" />}
        />
        <KpiCard
          label="Team members"
          value={String(billingState.teamMemberCount)}
          detail={`${billingState.teamMemberLimit} member limit on ${activePlan.toUpperCase()}`}
          accent={<CreditCard className="h-5 w-5" />}
        />
      </section>

      <SectionCard
        title="Plan management"
        description="Upgrade or downgrade plans. Team and order limits are enforced server-side."
      >
        <div className="grid gap-4 xl:grid-cols-4">
          {listBillingPlanConfigs().map((plan) => {
            const isCurrent = plan.key === activePlan;
            const highlight = checkoutPlan === plan.key;
            const blockedByTeamSize =
              billingState.teamMemberCount > plan.teamMemberLimit;
            const ctaLabel = isCurrent
              ? "Current plan"
              : blockedByTeamSize
                ? "Reduce team first"
                : isUpgrade(activePlanConfig?.priceTzs || 0, plan.priceTzs)
                  ? "Upgrade"
                  : "Downgrade";

            return (
              <article
                key={plan.key}
                className={`rounded-[24px] border p-5 ${
                  isCurrent
                    ? "border-[var(--color-wb-primary)] bg-[var(--color-wb-primary-soft)]"
                    : highlight
                      ? "border-[var(--color-wb-primary)] bg-white"
                      : "border-[var(--color-wb-border)] bg-white"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-wb-primary)]">
                  {plan.name}
                </p>
                <p className="mt-2 text-2xl font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                  {formatPlanPriceLabel(plan.priceTzs)}
                </p>
                <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
                  {plan.priceTzs === 0 ? "/forever" : "/month"}
                </p>

                <ul className="mt-4 space-y-2 text-sm text-[var(--color-wb-text-muted)]">
                  <li>{renderLimit(plan.orderLimitPerMonth, "orders/month")}</li>
                  <li>{`${plan.teamMemberLimit} team members`}</li>
                </ul>

                {isCurrent || blockedByTeamSize ? (
                  <button className="mt-5 wb-button-secondary w-full justify-center" disabled>
                    {ctaLabel}
                  </button>
                ) : (
                  <form
                    action="/api/billing/subscription"
                    method="post"
                    className="mt-5"
                  >
                    <input type="hidden" name="plan" value={plan.key} />
                    <button className="wb-button-primary w-full justify-center" type="submit">
                      {ctaLabel}
                    </button>
                  </form>
                )}
              </article>
            );
          })}
        </div>

        <p className="mt-4 text-sm text-[var(--color-wb-text-muted)]">
          Free allows dashboard access and up to 30 new orders per month.
          Growth allows up to 2 team members. Business allows up to 5.
        </p>
      </SectionCard>

      <SectionCard
        title="Subscription window"
        description="Current billing period boundaries."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <article className="wb-soft-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-wb-text-muted)]">
              Period start
            </p>
            <p className="mt-2 text-sm font-semibold text-[var(--color-wb-text)]">
              {billingState.periodStartsAt
                ? formatDate(billingState.periodStartsAt)
                : "Not set"}
            </p>
          </article>
          <article className="wb-soft-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-wb-text-muted)]">
              Period end
            </p>
            <p className="mt-2 text-sm font-semibold text-[var(--color-wb-text)]">
              {billingState.periodEndsAt
                ? formatDate(billingState.periodEndsAt)
                : "Not set"}
            </p>
          </article>
        </div>
      </SectionCard>

      <SectionCard
        title="Transaction history"
        description="Recent billing events saved in Supabase."
      >
        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <article className="wb-soft-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-wb-text-muted)]">
              Lifetime paid
            </p>
            <p className="mt-2 text-lg font-black tracking-[-0.03em] text-[var(--color-wb-primary)]">
              {formatCurrency(lifetimePaid)}
            </p>
          </article>
          <article className="wb-soft-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-wb-text-muted)]">
              Currency
            </p>
            <p className="mt-2 text-lg font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
              {billingState.currency}
            </p>
          </article>
        </div>

        {transactions.length ? (
          <>
            <div className="hidden md:block">
              <DataTable
                headers={["Amount", "Status", "Provider", "Reference", "Date"]}
              >
                {transactions.map((txn) => (
                  <DataRow key={txn.id}>
                    <DataCell>
                      <span className="font-semibold text-[var(--color-wb-primary)]">
                        {formatCurrency(asNumber(txn.amount))}
                      </span>
                    </DataCell>
                    <DataCell>
                      <span className="rounded-full border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] px-3 py-1 text-xs font-semibold capitalize text-[var(--color-wb-text-muted)]">
                        {txn.status || "pending"}
                      </span>
                    </DataCell>
                    <DataCell>{txn.provider || "N/A"}</DataCell>
                    <DataCell>{txn.provider_reference || "N/A"}</DataCell>
                    <DataCell>
                      {txn.created_at ? formatDate(txn.created_at) : "N/A"}
                    </DataCell>
                  </DataRow>
                ))}
              </DataTable>
            </div>

            <div className="space-y-3 md:hidden">
              {transactions.map((txn) => (
                <article
                  key={txn.id}
                  className="rounded-[22px] border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-wb-text-muted)]">
                        Amount
                      </p>
                      <p className="mt-1 font-semibold text-[var(--color-wb-primary)]">
                        {formatCurrency(asNumber(txn.amount))}
                      </p>
                    </div>
                    <span className="rounded-full border border-[var(--color-wb-border)] bg-white px-3 py-1 text-xs font-semibold capitalize text-[var(--color-wb-text-muted)]">
                      {txn.status || "pending"}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-wb-text-muted)]">
                        Provider
                      </p>
                      <p className="mt-1 text-[var(--color-wb-text)]">
                        {txn.provider || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-wb-text-muted)]">
                        Reference
                      </p>
                      <p className="mt-1 text-[var(--color-wb-text)]">
                        {txn.provider_reference || "N/A"}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-[var(--color-wb-text-muted)]">
                    {txn.created_at ? formatDate(txn.created_at) : "N/A"}
                  </p>
                </article>
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            title="No billing transactions yet"
            detail="Transactions will appear here after plan changes or renewals."
          />
        )}
      </SectionCard>
    </div>
  );
}
