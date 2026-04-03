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
import { resolveLegacyBusinessIdForRequest } from "@/lib/repositories/supabase-legacy-repository";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type BusinessRow = {
  id: string;
  name: string | null;
  billing_plan: string | null;
  billing_status: string | null;
  billing_current_period_starts_at: string | null;
  billing_current_period_ends_at: string | null;
  currency: string | null;
};

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

export default async function BillingPage() {
  const businessId = await resolveLegacyBusinessIdForRequest();
  const client = createSupabaseServiceClient();

  const [
    { data: businessData, error: businessError },
    { data: txnData, error: txnError },
  ] = await Promise.all([
    client
      .from("businesses")
      .select(
        "id,name,billing_plan,billing_status,billing_current_period_starts_at,billing_current_period_ends_at,currency",
      )
      .eq("id", businessId)
      .maybeSingle(),
    client
      .from("billing_transactions")
      .select(
        "id,amount,currency,status,provider,provider_reference,created_at",
      )
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  if (businessError) {
    throw new Error(
      `Failed to load business billing profile: ${JSON.stringify(businessError)}`,
    );
  }
  if (txnError) {
    throw new Error(
      `Failed to load billing transactions: ${JSON.stringify(txnError)}`,
    );
  }

  const business = businessData as BusinessRow | null;
  const transactions = (txnData || []) as TransactionRow[];
  const paidTransactions = transactions.filter((txn) => txn.status === "paid");
  const lifetimePaid = paidTransactions.reduce(
    (sum, txn) => sum + asNumber(txn.amount),
    0,
  );

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title="Billing"
        description="Plan, status, and transaction history for your WhatsBoard workspace."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <KpiCard
          label="Current plan"
          value={(business?.billing_plan || "free").toUpperCase()}
          detail="Plan currently assigned to your business."
          accent={<CreditCard className="h-5 w-5" />}
        />
        <KpiCard
          label="Billing status"
          value={(business?.billing_status || "inactive").toUpperCase()}
          detail="Current billing lifecycle status from your provider."
          accent={<CreditCard className="h-5 w-5" />}
        />
        <KpiCard
          label="Lifetime paid"
          value={formatCurrency(lifetimePaid)}
          detail="Sum of paid billing transactions recorded in Supabase."
          accent={<CreditCard className="h-5 w-5" />}
        />
      </section>

      <SectionCard
        title="Subscription window"
        description="Current period boundaries from your business billing profile."
      >
        {business ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <article className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-wb-text-muted)]">
                Period start
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-wb-text)]">
                {business.billing_current_period_starts_at
                  ? formatDate(business.billing_current_period_starts_at)
                  : "Not set"}
              </p>
            </article>
            <article className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-wb-text-muted)]">
                Period end
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-wb-text)]">
                {business.billing_current_period_ends_at
                  ? formatDate(business.billing_current_period_ends_at)
                  : "Not set"}
              </p>
            </article>
          </div>
        ) : (
          <EmptyState
            title="Billing profile not found"
            detail="No billing profile is linked to this business yet."
          />
        )}
      </SectionCard>

      <SectionCard
        title="Transaction history"
        description="Recent billing transactions recorded for this business."
      >
        {transactions.length ? (
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
        ) : (
          <EmptyState
            title="No billing transactions yet"
            detail="Transactions will appear here after plan upgrades or renewal events."
          />
        )}
      </SectionCard>
    </div>
  );
}
