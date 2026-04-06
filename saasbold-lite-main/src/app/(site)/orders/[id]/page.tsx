import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Edit3 } from "lucide-react";
import { getLocale } from "next-intl/server";
import {
  BuyerBadge,
  PaymentBadge,
  StageBadge,
  PageHeader,
  SectionCard,
  TimelineList,
} from "@/components/whatsboard-dashboard/dashboard-ui";
import { ReceiptShareActions } from "@/components/whatsboard-dashboard/receipt-share-actions";
import {
  formatCurrency,
  formatDate,
} from "@/components/whatsboard-dashboard/formatting";
import {
  getCustomerById,
  getOrderById,
  listOrderFollowUps,
  listOrderPayments,
} from "@/lib/whatsboard-repository";
import {
  formatOrderReference,
  getPrimaryOrderLabel,
} from "@/lib/display-labels";
import { getReceiptComposerStateForOrder } from "@/lib/receipts/receipt-service";
import { translateUiText } from "@/lib/ui-translations";

export default async function OrderDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    created?: string;
    updated?: string;
    receiptCreated?: string;
    receiptToken?: string;
    receiptError?: string;
    receiptErrorCode?: string;
  }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const locale = await getLocale();
  const tr = (value: string) => translateUiText(value, locale as "en" | "sw");
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  const customer = await getCustomerById(order.customerId);
  const orderPayments = await listOrderPayments(order.id);
  const orderFollowUps = await listOrderFollowUps(order.id);
  let receiptState: Awaited<
    ReturnType<typeof getReceiptComposerStateForOrder>
  > | null = null;
  let receiptStateLoadError: string | null = null;
  try {
    receiptState = await getReceiptComposerStateForOrder(order.id);
  } catch (error) {
    receiptStateLoadError =
      error instanceof Error ? error.message : tr("Unable to load receipt state.");
  }
  const receiptToken =
    query.receiptToken || receiptState?.existingReceipt?.token || null;

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title={`Order #${formatOrderReference(order.id) || "WB-00000"}`}
        description={tr(
          "Complete order context: customer, payment trail, dispatch status, and next follow-up actions.",
        )}
        primaryAction={
          <Link href={`/orders/${order.id}/edit`} className="wb-button-primary">
            <Edit3 className="h-4 w-4" />
            {tr("Edit Order")}
          </Link>
        }
        secondaryAction={
          <Link href="/orders" className="wb-button-secondary">
            <ArrowLeft className="h-4 w-4" />
            {tr("Back to Orders")}
          </Link>
        }
      />

      {query.created === "1" || query.updated === "1" ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
          {query.created === "1"
            ? tr("Order created successfully.")
            : tr("Order updated successfully.")}
        </div>
      ) : null}

      {query.receiptCreated === "1" && receiptToken ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
          {tr("Receipt is ready and shareable.")}
          <ReceiptShareActions token={receiptToken} className="mt-3" />
        </div>
      ) : null}

      {query.receiptError === "1" ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
          {query.receiptErrorCode === "missing-schema"
            ? tr(
                "Receipt schema is missing. Apply the latest Supabase receipt migration, then retry.",
              )
            : query.receiptErrorCode === "not-eligible"
              ? tr(
                  "Receipt is only available after payment is confirmed or the order is delivered.",
                )
              : tr("Could not generate the receipt. Try again.")}
        </div>
      ) : null}

      {receiptStateLoadError ? (
        <SectionCard
          title={tr("Send Receipt to Customer")}
          description={tr(
            "Issue a branded receipt link after paid or delivered orders.",
          )}
        >
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            {tr("Receipt module is unavailable right now.")}
            <br />
            <span className="font-semibold">
              {receiptStateLoadError.toLowerCase().includes("relation") &&
              (receiptStateLoadError.toLowerCase().includes("receipts") ||
                receiptStateLoadError
                  .toLowerCase()
                  .includes("receipt_views"))
                ? tr(
                    "Apply `saasbold-lite-main/supabase/manual_full_schema_sync.sql` in Supabase SQL Editor.",
                  )
                : tr("Check server logs and Supabase schema consistency.")}
            </span>
          </div>
        </SectionCard>
      ) : null}

      {receiptState ? (
        <SectionCard
          title={tr("Send Receipt to Customer")}
          description={tr(
            "Issue a branded receipt link after paid or delivered orders.",
          )}
        >
          <div className="space-y-4">
            <div className="rounded-[22px] border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4 text-sm text-[var(--color-wb-text-muted)]">
              <p className="font-semibold text-[var(--color-wb-text)]">
                {tr("Plan")}: {receiptState.capabilities.plan.toUpperCase()}
              </p>
              <p className="mt-1">
                {tr("Your receipts were viewed")} {receiptState.monthlyViews}{" "}
                {tr("times this month.")}
              </p>
            </div>

            {!receiptState.eligible ? (
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
                {receiptState.reason ||
                  tr("Receipt is available once order is Paid, COD, or Delivered.")}
              </div>
            ) : (
              <form
                action="/api/receipts/issue"
                method="post"
                className="grid gap-4 sm:grid-cols-2"
              >
                <input type="hidden" name="orderId" value={order.id} />
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
                    {tr("Shop name")}
                  </label>
                  <input
                    name="shopName"
                    className="wb-input"
                    defaultValue={receiptState.existingReceipt?.shopName || ""}
                    placeholder="Amani Collections"
                    disabled={!receiptState.capabilities.canSetShopName}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
                    {tr("Footer mode")}
                  </label>
                  <select
                    name="footerMode"
                    className="wb-input"
                    defaultValue={receiptState.existingReceipt?.footerMode || "whatsboard_link"}
                  >
                    {receiptState.capabilities.allowedFooterModes.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode === "whatsboard_link"
                          ? tr("Order tracked with Folapp")
                          : mode === "powered_by_whatsboard"
                            ? tr("Powered by Folapp")
                            : mode === "white_label"
                              ? tr("White-label (no Folapp footer)")
                              : tr("Hide footer")}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
                    {tr("Shop logo URL")}
                  </label>
                  <input
                    name="shopLogoUrl"
                    type="url"
                    className="wb-input"
                    defaultValue={receiptState.existingReceipt?.shopLogoUrl || ""}
                    placeholder="https://..."
                    disabled={!receiptState.capabilities.canSetLogo}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
                    {tr("Thank you message")}
                  </label>
                  <textarea
                    name="thankYouMessage"
                    className="wb-textarea"
                    defaultValue={receiptState.existingReceipt?.thankYouMessage || ""}
                    placeholder="Asante sana kwa ku-support biashara yetu."
                    disabled={!receiptState.capabilities.canSetThankYouMessage}
                  />
                </div>
                <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
                  <button type="submit" className="wb-button-primary">
                    {tr("Send Receipt to Customer")}
                  </button>
                  {receiptToken ? (
                    <ReceiptShareActions token={receiptToken} />
                  ) : null}
                </div>
              </form>
            )}
          </div>
        </SectionCard>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title={tr("Order summary")}
          description={tr("Operational details for this specific sale.")}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-wb-text-muted)]">
                {tr("Customer")}
              </p>
              <p className="mt-3 text-lg font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                {getPrimaryOrderLabel({
                  customerName: order.customerName,
                  customerPhone: customer?.phone || order.customerPhone,
                  orderId: order.id,
                  kind: "customer",
                })}
              </p>
              <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
                {customer?.phone || tr("No phone")} • {order.deliveryArea}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <BuyerBadge status={order.customerBuyerStatus} compact />
                <span className="text-xs font-semibold text-[var(--color-wb-text-muted)]">
                  LTV {formatCurrency(order.customerLifetimeValue || 0)}
                </span>
              </div>
            </div>
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-wb-text-muted)]">
                {tr("Amount")}
              </p>
              <p className="mt-3 text-lg font-black tracking-[-0.03em] text-[var(--color-wb-primary)]">
                {formatCurrency(order.amount)}
              </p>
              <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
                {order.channel} {tr("order")}
              </p>
            </div>
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-wb-text-muted)]">
                {tr("Stage")}
              </p>
              <div className="mt-3">
                <StageBadge stage={order.stage} />
              </div>
            </div>
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-wb-text-muted)]">
                Payment status
              </p>
              <div className="mt-3">
                <PaymentBadge status={order.paymentStatus} />
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-[24px] border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-wb-text-muted)]">
              Items
            </p>
            <ul className="mt-3 space-y-2 text-sm text-[var(--color-wb-text)]">
              {order.items.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </SectionCard>

        <SectionCard
          title="Dispatch and notes"
          description="What still needs to happen before and after delivery."
        >
          <div className="space-y-4">
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-wb-text-muted)]">
                Latest note
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--color-wb-text-muted)]">
                {order.notes}
              </p>
            </div>
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-wb-text-muted)]">
                Dispatch ETA
              </p>
              <p className="mt-3 text-lg font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                {order.dispatchEta ? formatDate(order.dispatchEta) : "Not set"}
              </p>
            </div>
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-wb-text-muted)]">
                Created / Updated
              </p>
              <p className="mt-3 text-sm text-[var(--color-wb-text-muted)]">
                {formatDate(order.createdAt)} / {formatDate(order.updatedAt)}
              </p>
            </div>
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          title="Payment trail"
          description="Proof of payment and settlement details."
        >
          <div className="space-y-3">
            {orderPayments.length ? (
              orderPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-col gap-3 rounded-[22px] border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-[var(--color-wb-text)]">
                      {payment.method}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
                      {payment.reference}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-[var(--color-wb-primary)]">
                      {formatCurrency(payment.amount)}
                    </span>
                    <PaymentBadge status={payment.status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--color-wb-text-muted)]">
                No payment records yet.
              </p>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Follow-up timeline"
          description="Track what happens after this order was created."
        >
          <TimelineList
            items={
              orderFollowUps.length
                ? orderFollowUps.map((item) => ({
                    title: item.title,
                    detail: item.note,
                    meta: formatDate(item.dueAt),
                  }))
                : [
                    {
                      title: "No follow-up logged",
                      detail: "This order has no next-action reminder yet.",
                    },
                  ]
            }
          />
        </SectionCard>
      </section>
    </div>
  );
}
