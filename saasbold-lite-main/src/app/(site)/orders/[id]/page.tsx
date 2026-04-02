import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Edit3 } from "lucide-react";
import { PaymentBadge, StageBadge, PageHeader, SectionCard, TimelineList } from "@/components/whatsboard-dashboard/dashboard-ui";
import { formatCurrency, formatDate } from "@/components/whatsboard-dashboard/formatting";
import { getCustomerById, getOrderById, listOrderFollowUps, listOrderPayments } from "@/lib/whatsboard-repository";

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = getOrderById(id);

  if (!order) {
    notFound();
  }

  const customer = getCustomerById(order.customerId);
  const orderPayments = listOrderPayments(order.id);
  const orderFollowUps = listOrderFollowUps(order.id);

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title={`Order ${order.id}`}
        description="Complete order context: customer, payment trail, dispatch status, and next follow-up actions."
        primaryAction={
          <Link href={`/orders/${order.id}/edit`} className="wb-button-primary">
            <Edit3 className="h-4 w-4" />
            Edit Order
          </Link>
        }
        secondaryAction={
          <Link href="/orders" className="wb-button-secondary">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Order summary" description="Operational details for this specific sale.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-wb-text-muted)]">Customer</p>
              <p className="mt-3 text-lg font-black tracking-[-0.03em] text-[var(--color-wb-text)]">{order.customerName}</p>
              <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">{customer?.phone || "No phone"} • {order.deliveryArea}</p>
            </div>
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-wb-text-muted)]">Amount</p>
              <p className="mt-3 text-lg font-black tracking-[-0.03em] text-[var(--color-wb-primary)]">{formatCurrency(order.amount)}</p>
              <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">{order.channel} order</p>
            </div>
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-wb-text-muted)]">Stage</p>
              <div className="mt-3"><StageBadge stage={order.stage} /></div>
            </div>
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-wb-text-muted)]">Payment status</p>
              <div className="mt-3"><PaymentBadge status={order.paymentStatus} /></div>
            </div>
          </div>

          <div className="mt-4 rounded-[24px] border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-wb-text-muted)]">Items</p>
            <ul className="mt-3 space-y-2 text-sm text-[var(--color-wb-text)]">
              {order.items.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </SectionCard>

        <SectionCard title="Dispatch and notes" description="What still needs to happen before and after delivery.">
          <div className="space-y-4">
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-wb-text-muted)]">Latest note</p>
              <p className="mt-3 text-sm leading-6 text-[var(--color-wb-text-muted)]">{order.notes}</p>
            </div>
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-wb-text-muted)]">Dispatch ETA</p>
              <p className="mt-3 text-lg font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                {order.dispatchEta ? formatDate(order.dispatchEta) : "Not set"}
              </p>
            </div>
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-wb-text-muted)]">Created / Updated</p>
              <p className="mt-3 text-sm text-[var(--color-wb-text-muted)]">
                {formatDate(order.createdAt)} / {formatDate(order.updatedAt)}
              </p>
            </div>
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Payment trail" description="Proof of payment and settlement details.">
          <div className="space-y-3">
            {orderPayments.length ? (
              orderPayments.map((payment) => (
                <div key={payment.id} className="flex flex-col gap-3 rounded-[22px] border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-[var(--color-wb-text)]">{payment.method}</p>
                    <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">{payment.reference}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-[var(--color-wb-primary)]">{formatCurrency(payment.amount)}</span>
                    <PaymentBadge status={payment.status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--color-wb-text-muted)]">No payment records yet.</p>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Follow-up timeline" description="Track what happens after this order was created.">
          <TimelineList
            items={
              orderFollowUps.length
                ? orderFollowUps.map((item) => ({
                    title: item.title,
                    detail: item.note,
                    meta: formatDate(item.dueAt),
                  }))
                : [{ title: "No follow-up set", detail: "This order has no next-action reminder yet." }]
            }
          />
        </SectionCard>
      </section>
    </div>
  );
}
