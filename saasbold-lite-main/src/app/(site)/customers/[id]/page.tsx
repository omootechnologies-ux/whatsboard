import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle, PencilLine, Save } from "lucide-react";
import {
  BuyerBadge,
  PageHeader,
  PaymentBadge,
  SectionCard,
  StageBadge,
} from "@/components/whatsboard-dashboard/dashboard-ui";
import {
  formatCurrency,
  formatDate,
} from "@/components/whatsboard-dashboard/formatting";
import { getCustomerProfileById } from "@/lib/whatsboard-repository";

function whatsappLink(phone: string, message: string) {
  const normalizedPhone = phone.replace(/[^\d]/g, "");
  if (!normalizedPhone) return null;
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}

export default async function CustomerProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ updated?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const profile = await getCustomerProfileById(id);

  if (!profile) notFound();

  const { customer, orderHistory } = profile;
  const followUpMessage = `Hi ${customer.name}, asante for your last order${
    profile.lastBoughtProduct ? ` (${profile.lastBoughtProduct})` : ""
  } on ${formatDate(profile.lastOrderDate)}. Ready for your next order today?`;
  const followUpHref = whatsappLink(
    customer.whatsappNumber || customer.phone,
    followUpMessage,
  );

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title={customer.name}
        description="Customer profile with retention metrics, order history, and one-tap follow-up actions."
        primaryAction={
          followUpHref ? (
            <a
              href={followUpHref}
              target="_blank"
              rel="noreferrer"
              className="wb-button-primary"
            >
              <MessageCircle className="h-4 w-4" />
              Follow up
            </a>
          ) : undefined
        }
        secondaryAction={
          <div className="flex gap-2">
            <Link href={`/customers/${customer.id}/edit`} className="wb-button-secondary">
              <PencilLine className="h-4 w-4" />
              Edit
            </Link>
            <Link href="/customers" className="wb-button-secondary">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>
        }
      />

      {query.updated === "1" ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
          Customer profile updated successfully.
        </div>
      ) : null}

      {query.error === "invalid" || query.error === "persistence" ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
          {query.error === "invalid"
            ? "Please complete required fields before saving."
            : "Could not update customer profile. Try again."}
        </div>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard
          title="Customer details"
          description="Identity, channel source, and repeat-buyer health."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                Full name
              </p>
              <p className="mt-2 text-lg font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                {customer.name}
              </p>
            </div>
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                Source channel
              </p>
              <p className="mt-2 text-lg font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                {customer.sourceChannel || "Unknown"}
              </p>
            </div>
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                Phone
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-wb-text)]">
                {customer.phone}
              </p>
            </div>
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                WhatsApp
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-wb-text)]">
                {customer.whatsappNumber || customer.phone}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <BuyerBadge status={customer.buyerStatus} />
          </div>
        </SectionCard>

        <SectionCard
          title="Retention metrics"
          description="LTV and repeat-buy behavior from real order history."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                Total orders
              </p>
              <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--color-wb-text)]">
                {customer.totalOrders}
              </p>
            </div>
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                Lifetime value
              </p>
              <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--color-wb-primary)]">
                {formatCurrency(profile.totalLifetimeValue)}
              </p>
            </div>
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                Average order value
              </p>
              <p className="mt-2 text-xl font-black tracking-[-0.04em] text-[var(--color-wb-text)]">
                {formatCurrency(profile.averageOrderValue)}
              </p>
            </div>
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                Repeat purchase rate
              </p>
              <p className="mt-2 text-xl font-black tracking-[-0.04em] text-[var(--color-wb-text)]">
                {profile.repeatPurchaseRate}%
              </p>
            </div>
            <div className="wb-soft-card p-4 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                Last order
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-wb-text)]">
                {formatDate(profile.lastOrderDate)} • {profile.daysSinceLastOrder} days ago
              </p>
              {profile.lastBoughtProduct ? (
                <p className="mt-2 text-sm text-[var(--color-wb-text-muted)]">
                  Last bought {profile.lastBoughtProduct} on {formatDate(profile.lastOrderDate)}. Ready to reorder?
                </p>
              ) : null}
            </div>
          </div>
        </SectionCard>
      </section>

      <SectionCard
        title="Private notes"
        description="Internal CRM notes visible only to your team."
      >
        <form
          action={`/api/customers/${customer.id}`}
          method="post"
          className="space-y-3"
        >
          <input type="hidden" name="name" value={customer.name} />
          <input type="hidden" name="phone" value={customer.phone} />
          <input type="hidden" name="whatsappNumber" value={customer.whatsappNumber || customer.phone} />
          <input type="hidden" name="sourceChannel" value={customer.sourceChannel || "Unknown"} />
          <input type="hidden" name="location" value={customer.location} />
          <input type="hidden" name="status" value={customer.status} />
          <textarea
            name="notes"
            defaultValue={customer.notes || ""}
            className="wb-textarea min-h-[120px]"
            placeholder="Add private notes about customer preferences, delivery behavior, or payment habits."
          />
          <button type="submit" className="wb-button-primary">
            <Save className="h-4 w-4" />
            Save notes
          </button>
        </form>
      </SectionCard>

      <SectionCard
        title="Order history"
        description="Date, items, amount, status, and payment method for every order."
      >
        {orderHistory.length ? (
          <div className="space-y-3">
            {orderHistory.map((order) => (
              <article
                key={order.id}
                className="rounded-[22px] border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[var(--color-wb-text)]">
                      Order #{order.orderReference}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
                      {formatDate(order.date)} • {order.items.join(", ")}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-[var(--color-wb-primary)]">
                    {formatCurrency(order.amount)}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StageBadge stage={order.status} />
                  <PaymentBadge status={order.paymentStatus} />
                  <span className="rounded-full border border-[var(--color-wb-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--color-wb-text-muted)]">
                    {order.paymentMethod || "Not set"}
                  </span>
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-xs font-semibold text-[var(--color-wb-primary)] hover:underline"
                  >
                    View order
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-wb-text-muted)]">
            No order history yet for this customer.
          </p>
        )}
      </SectionCard>
    </div>
  );
}
