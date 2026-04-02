import Link from "next/link";
import { CreditCard, Wallet } from "lucide-react";
import {
  ChartCard,
  DataCell,
  DataRow,
  DataTable,
  EmptyState,
  FilterToolbar,
  KpiCard,
  PageHeader,
  PaymentBadge,
  SectionCard,
} from "@/components/whatsboard-dashboard/dashboard-ui";
import {
  formatCurrency,
  formatDate,
} from "@/components/whatsboard-dashboard/formatting";
import {
  getAnalyticsSnapshot,
  listPayments,
} from "@/lib/whatsboard-repository";
import {
  formatOrderReference,
  getPrimaryOrderLabel,
} from "@/lib/display-labels";

type PaymentsPageSearchParams = Promise<{
  search?: string;
  status?: string;
  method?: string;
  created?: string;
}>;

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: PaymentsPageSearchParams;
}) {
  const query = await searchParams;
  const records = await listPayments({
    search: query.search,
    status: query.status,
    method: query.method,
  });
  const { stats, series } = await getAnalyticsSnapshot();

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title="Payments"
        description="Track paid, partial, and unpaid orders with clean records tied to real customer sales."
        primaryAction={
          <Link href="/payments/new" className="wb-button-primary">
            <CreditCard className="h-4 w-4" />
            Record Payment
          </Link>
        }
      />

      {query.created === "1" ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
          Payment recorded successfully.
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <KpiCard
          label="Collected"
          value={formatCurrency(
            records
              .filter((payment) => payment.status === "paid")
              .reduce((sum, payment) => sum + payment.amount, 0),
          )}
          detail="Confirmed paid value visible in the dashboard."
          accent={<Wallet className="h-5 w-5" />}
        />
        <KpiCard
          label="Pending"
          value={formatCurrency(stats.payoutPending)}
          detail="Revenue still waiting for full confirmation."
          accent={<CreditCard className="h-5 w-5" />}
        />
        <KpiCard
          label="Transactions"
          value={String(records.length)}
          detail="Recent payment records tied to active orders."
          accent={<CreditCard className="h-5 w-5" />}
        />
      </section>

      <FilterToolbar
        searchPlaceholder="Search by order ID, customer, method, or reference"
        chips={[
          { key: "status", label: "All status" },
          { key: "status", label: "Paid", value: "paid" },
          { key: "status", label: "Partial", value: "partial" },
          { key: "status", label: "Unpaid", value: "unpaid" },
          { key: "status", label: "COD", value: "cod" },
          { key: "method", label: "M-Pesa", value: "M-Pesa" },
          { key: "method", label: "Bank", value: "Bank" },
          { key: "method", label: "Cash", value: "Cash" },
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <ChartCard
          title="Collections trend"
          description="Daily payment flow for this week."
          data={series}
          dataKey="revenue"
        />
        <SectionCard
          title="Payment records"
          description="Clean ledger for payment state, amount, and reference."
        >
          {records.length ? (
            <DataTable
              headers={[
                "Customer",
                "Order",
                "Method",
                "Amount",
                "Status",
                "Date",
              ]}
            >
              {records.map((payment) => (
                <DataRow key={payment.id}>
                  <DataCell>
                    {getPrimaryOrderLabel({
                      customerName: payment.customerName,
                      orderId: payment.orderId,
                      kind: "customer",
                    })}
                  </DataCell>
                  <DataCell>
                    Order #{formatOrderReference(payment.orderId) || "WB-00000"}
                  </DataCell>
                  <DataCell>{payment.method}</DataCell>
                  <DataCell>
                    <span className="font-semibold text-[var(--color-wb-primary)]">
                      {formatCurrency(payment.amount)}
                    </span>
                  </DataCell>
                  <DataCell>
                    <PaymentBadge status={payment.status} />
                  </DataCell>
                  <DataCell>
                    <span className="text-xs text-[var(--color-wb-text-muted)]">
                      {formatDate(payment.createdAt)}
                    </span>
                  </DataCell>
                </DataRow>
              ))}
            </DataTable>
          ) : (
            <EmptyState
              title="No payments recorded"
              detail="Record your first payment to start building the ledger."
              action={
                <Link href="/payments/new" className="wb-button-secondary">
                  Record payment
                </Link>
              }
            />
          )}
        </SectionCard>
      </section>
    </div>
  );
}
