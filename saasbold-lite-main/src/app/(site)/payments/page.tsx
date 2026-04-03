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
  listOrders,
  listPayments,
  listUnmatchedPayments,
} from "@/lib/whatsboard-repository";
import {
  formatOrderReference,
  getPrimaryOrderLabel,
} from "@/lib/display-labels";
import { PaymentSmsModal } from "@/components/whatsboard-dashboard/payment-sms-modal";

type PaymentsPageSearchParams = Promise<{
  search?: string;
  status?: string;
  method?: string;
  created?: string;
  updated?: string;
  assigned?: string;
  assignError?: string;
  assignNotFound?: string;
  error?: string;
}>;

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: PaymentsPageSearchParams;
}) {
  const query = await searchParams;
  const [records, unmatchedPayments, allOrders, { stats, series }] =
    await Promise.all([
      listPayments({
        search: query.search,
        status: query.status,
        method: query.method,
      }),
      listUnmatchedPayments(),
      listOrders(),
      getAnalyticsSnapshot(),
    ]);
  const orderMap = new Map(allOrders.map((order) => [order.id, order]));
  const orderOptions = allOrders.map((order) => ({
    id: order.id,
    customerLabel: getPrimaryOrderLabel({
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      orderId: order.id,
      kind: "customer",
    }),
    amount: order.amount,
  }));

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
        secondaryAction={<PaymentSmsModal orderOptions={orderOptions} />}
      />

      {query.created === "1" || query.updated === "1" ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
          {query.created === "1"
            ? "Payment recorded successfully."
            : "Payment updated successfully."}
        </div>
      ) : null}

      {query.assigned === "1" ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
          Payment assigned to order and marked as paid.
        </div>
      ) : null}

      {query.assignError === "1" || query.assignNotFound === "1" ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
          {query.assignNotFound === "1"
            ? "Could not find that payment or order."
            : "Could not assign payment. Try again."}
        </div>
      ) : null}

      {query.error === "not-found" ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
          Payment record was not found.
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
          { key: "method", label: "Tigopesa", value: "Tigopesa" },
          { key: "method", label: "Airtel Money", value: "Airtel Money" },
          { key: "method", label: "Bank", value: "Bank" },
          { key: "method", label: "Cash", value: "Cash" },
        ]}
      />

      <SectionCard
        title="Unmatched payments inbox"
        description="Pending or unmatched mobile money confirmations requiring manual assignment."
      >
        {unmatchedPayments.length ? (
          <div className="space-y-3">
            {unmatchedPayments.map((payment) => {
              const suggestedOrder = payment.suggestedOrderId
                ? orderMap.get(payment.suggestedOrderId)
                : null;
              return (
                <article
                  key={payment.id}
                  className="rounded-[22px] border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--color-wb-text)]">
                        {getPrimaryOrderLabel({
                          customerName:
                            payment.senderName || payment.customerName,
                          customerPhone: payment.senderPhone,
                          orderId: payment.orderId || payment.suggestedOrderId,
                          kind: "customer",
                        })}
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
                        {payment.provider?.toUpperCase() || "UNKNOWN"} •{" "}
                        {formatCurrency(payment.amount)} • Ref {payment.reference}
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-wb-text-muted)]">
                        Confidence {Math.round(payment.matchConfidence || 0)}%
                        {suggestedOrder
                          ? ` • Suggested #${formatOrderReference(suggestedOrder.id) || "WB-00000"}`
                          : ""}
                      </p>
                    </div>
                    <span className="inline-flex rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-semibold capitalize text-amber-700">
                      {payment.reconciliationStatus || "unmatched"}
                    </span>
                  </div>

                  <form
                    action="/api/payments/reconcile-assign"
                    method="post"
                    className="mt-3 flex flex-col gap-2 sm:flex-row"
                  >
                    <input type="hidden" name="paymentId" value={payment.id} />
                    <select
                      name="orderId"
                      defaultValue={payment.suggestedOrderId || ""}
                      required
                      className="wb-input"
                    >
                      <option value="">Select order</option>
                      {allOrders.map((order) => (
                        <option key={order.id} value={order.id}>
                          #{formatOrderReference(order.id) || "WB-00000"} •{" "}
                          {getPrimaryOrderLabel({
                            customerName: order.customerName,
                            customerPhone: order.customerPhone,
                            orderId: order.id,
                            kind: "customer",
                          })}{" "}
                          • {formatCurrency(order.amount)}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="wb-button-primary whitespace-nowrap">
                      Assign payment
                    </button>
                  </form>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No unmatched payments"
            detail="All parsed mobile money confirmations are currently matched."
          />
        )}
      </SectionCard>

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
            <>
              <div className="hidden md:block">
                <DataTable
                  headers={[
                    "Customer",
                    "Order",
                    "Method",
                    "Amount",
                    "Status",
                    "Date",
                    "Action",
                  ]}
                >
                  {records.map((payment) => (
                    <DataRow key={payment.id}>
                      <DataCell>
                        {getPrimaryOrderLabel({
                          customerName: payment.customerName,
                          orderId: payment.orderId || payment.suggestedOrderId,
                          kind: "customer",
                        })}
                      </DataCell>
                      <DataCell>
                        Order #
                        {formatOrderReference(
                          payment.orderId || payment.suggestedOrderId,
                        ) || "WB-00000"}
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
                      <DataCell compact>
                        <Link
                          href={`/payments/${payment.id}/edit`}
                          className="text-sm font-semibold text-[var(--color-wb-primary)] hover:underline"
                        >
                          Edit
                        </Link>
                      </DataCell>
                    </DataRow>
                  ))}
                </DataTable>
              </div>

              <div className="space-y-3 md:hidden">
                {records.map((payment) => (
                  <article
                    key={payment.id}
                    className="rounded-[22px] border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--color-wb-text)]">
                          {getPrimaryOrderLabel({
                            customerName: payment.customerName,
                            orderId: payment.orderId || payment.suggestedOrderId,
                            kind: "customer",
                          })}
                        </p>
                        <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
                          Order #
                          {formatOrderReference(
                            payment.orderId || payment.suggestedOrderId,
                          ) || "WB-00000"}
                        </p>
                      </div>
                      <PaymentBadge status={payment.status} />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                      <span className="font-semibold text-[var(--color-wb-primary)]">
                        {formatCurrency(payment.amount)}
                      </span>
                      <span className="text-[var(--color-wb-text-muted)]">
                        {payment.method}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[var(--color-wb-text-muted)]">
                      <span>{formatDate(payment.createdAt)}</span>
                      <Link
                        href={`/payments/${payment.id}/edit`}
                        className="font-semibold text-[var(--color-wb-primary)]"
                      >
                        Edit
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </>
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
