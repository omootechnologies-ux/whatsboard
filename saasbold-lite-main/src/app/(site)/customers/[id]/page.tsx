import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle, PencilLine, Save } from "lucide-react";
import { getLocale } from "next-intl/server";
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
import { translateUiText } from "@/lib/ui-translations";

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
  const locale = await getLocale();
  const tr = (value: string) => translateUiText(value, locale as "en" | "sw");
  const profile = await getCustomerProfileById(id);

  if (!profile) notFound();

  const { customer, orderHistory } = profile;
  const followUpMessage = `${locale === "sw" ? "Habari" : "Hi"} ${customer.name}, ${locale === "sw" ? "asante kwa order yako ya mwisho" : "asante for your last order"}${
    profile.lastBoughtProduct ? ` (${profile.lastBoughtProduct})` : ""
  } ${locale === "sw" ? "tarehe" : "on"} ${formatDate(profile.lastOrderDate)}. ${locale === "sw" ? "Uko tayari kwa order yako inayofuata leo?" : "Ready for your next order today?"}`;
  const followUpHref = whatsappLink(
    customer.whatsappNumber || customer.phone,
    followUpMessage,
  );

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title={customer.name}
        description={tr(
          "Customer profile with retention metrics, order history, and one-tap follow-up actions.",
        )}
        primaryAction={
          followUpHref ? (
            <a
              href={followUpHref}
              target="_blank"
              rel="noreferrer"
              className="wb-button-primary"
            >
              <MessageCircle className="h-4 w-4" />
              {tr("Follow up")}
            </a>
          ) : undefined
        }
        secondaryAction={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link href={`/customers/${customer.id}/edit`} className="wb-button-secondary">
              <PencilLine className="h-4 w-4" />
              {tr("Edit")}
            </Link>
            <Link href="/customers" className="wb-button-secondary">
              <ArrowLeft className="h-4 w-4" />
              {tr("Back")}
            </Link>
          </div>
        }
      />

      {query.updated === "1" ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
          {tr("Customer profile updated successfully.")}
        </div>
      ) : null}

      {query.error === "invalid" || query.error === "persistence" ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
          {query.error === "invalid"
            ? tr("Please complete required fields before saving.")
            : tr("Could not update customer profile. Try again.")}
        </div>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard
          title={tr("Customer details")}
          description={tr("Identity, channel source, and repeat-buyer health.")}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                {tr("Full name")}
              </p>
              <p className="mt-2 text-lg font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                {customer.name}
              </p>
            </div>
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                {tr("Source channel")}
              </p>
              <p className="mt-2 text-lg font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                {customer.sourceChannel || tr("Unknown")}
              </p>
            </div>
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                {tr("Phone")}
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-wb-text)]">
                {customer.phone}
              </p>
            </div>
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                {tr("WhatsApp")}
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
          title={tr("Retention metrics")}
          description={tr("LTV and repeat-buy behavior from real order history.")}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                {tr("Total orders")}
              </p>
              <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--color-wb-text)]">
                {customer.totalOrders}
              </p>
            </div>
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                {tr("Lifetime value")}
              </p>
              <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--color-wb-primary)]">
                {formatCurrency(profile.totalLifetimeValue)}
              </p>
            </div>
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                {tr("Average order value")}
              </p>
              <p className="mt-2 text-xl font-black tracking-[-0.04em] text-[var(--color-wb-text)]">
                {formatCurrency(profile.averageOrderValue)}
              </p>
            </div>
            <div className="wb-soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                {tr("Repeat purchase rate")}
              </p>
              <p className="mt-2 text-xl font-black tracking-[-0.04em] text-[var(--color-wb-text)]">
                {profile.repeatPurchaseRate}%
              </p>
            </div>
            <div className="wb-soft-card p-4 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                {tr("Last order")}
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-wb-text)]">
                {formatDate(profile.lastOrderDate)} •{" "}
                {locale === "sw"
                  ? `${profile.daysSinceLastOrder} siku zilizopita`
                  : `${profile.daysSinceLastOrder} days ago`}
              </p>
              {profile.lastBoughtProduct ? (
                <p className="mt-2 text-sm text-[var(--color-wb-text-muted)]">
                  {locale === "sw"
                    ? `Alinunua ${profile.lastBoughtProduct} mara ya mwisho tarehe ${formatDate(profile.lastOrderDate)}. Yuko tayari kuagiza tena?`
                    : `Last bought ${profile.lastBoughtProduct} on ${formatDate(profile.lastOrderDate)}. Ready to reorder?`}
                </p>
              ) : null}
            </div>
          </div>
        </SectionCard>
      </section>

      <SectionCard
        title={tr("Private notes")}
        description={tr("Internal CRM notes visible only to your team.")}
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
            placeholder={tr(
              "Add private notes about customer preferences, delivery behavior, or payment habits.",
            )}
          />
          <button type="submit" className="wb-button-primary">
            <Save className="h-4 w-4" />
            {tr("Save notes")}
          </button>
        </form>
      </SectionCard>

      <SectionCard
        title={tr("Order history")}
        description={tr(
          "Date, items, amount, status, and payment method for every order.",
        )}
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
                      {tr("Order #")}
                      {order.orderReference}
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
                    {order.paymentMethod || tr("Not set")}
                  </span>
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-xs font-semibold text-[var(--color-wb-primary)] hover:underline"
                  >
                    {tr("View order")}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-wb-text-muted)]">
            {tr("No order history yet for this customer.")}
          </p>
        )}
      </SectionCard>
    </div>
  );
}
