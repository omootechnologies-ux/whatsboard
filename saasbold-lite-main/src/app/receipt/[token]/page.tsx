import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  getPublicReceiptByToken,
  hashVisitorIp,
  recordReceiptViewByToken,
} from "@/lib/receipts/receipt-service";

export const dynamic = "force-dynamic";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-TZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function extractVisitorIpFromHeaders(headerStore: Headers) {
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = headerStore.get("x-real-ip");
  return realIp?.trim() || null;
}

export default async function ReceiptPublicPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const headerStore = await headers();

  const receipt = await getPublicReceiptByToken(token);
  if (!receipt) {
    notFound();
  }

  const visitorIpHash = hashVisitorIp(extractVisitorIpFromHeaders(headerStore));
  try {
    await recordReceiptViewByToken({ token, visitorIpHash });
  } catch {
    // Do not block rendering for tracking errors.
  }

  return (
    <main className="min-h-screen bg-[#f7f8f6] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-xl rounded-3xl border border-[#e2e8e3] bg-white p-5 shadow-[0_12px_28px_rgba(17,17,17,0.08)] sm:p-7">
        <header className="border-b border-[#e2e8e3] pb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5f6368]">
                Receipt
              </p>
              <h1 className="mt-1 text-xl font-black tracking-[-0.03em] text-[#111111]">
                {receipt.shopName}
              </h1>
            </div>
            {receipt.shopLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={receipt.shopLogoUrl}
                alt={`${receipt.shopName} logo`}
                className="h-12 w-12 rounded-xl border border-[#e2e8e3] object-cover"
                loading="lazy"
              />
            ) : null}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-[#e2e8e3] bg-[#f8faf9] px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.14em] text-[#5f6368]">
                Order
              </p>
              <p className="mt-1 font-semibold text-[#111111]">
                {receipt.orderReference}
              </p>
            </div>
            <div className="rounded-xl border border-[#e2e8e3] bg-[#f8faf9] px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.14em] text-[#5f6368]">
                Date
              </p>
              <p className="mt-1 font-semibold text-[#111111]">
                {formatDate(receipt.date)}
              </p>
            </div>
          </div>
        </header>

        <section className="pt-5">
          <div className="space-y-2">
            {receipt.items.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-[#e2e8e3] px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold text-[#111111]">
                    {item.name}
                  </p>
                  <p className="text-xs text-[#5f6368]">Qty {item.qty}</p>
                </div>
                <p className="text-sm font-semibold text-[#111111]">
                  {formatCurrency(item.price * item.qty)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-[#cfe6db] bg-[#f1f8f4] p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-[#5f6368]">Total</span>
              <span className="text-lg font-black tracking-[-0.03em] text-[#0F5D46]">
                {formatCurrency(receipt.totalAmount)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-sm">
              <span className="text-[#5f6368]">Payment</span>
              <span className="inline-flex rounded-full border border-[#d7e7de] bg-white px-2.5 py-1 text-xs font-semibold text-[#0F5D46]">
                {receipt.paymentStatusLabel}
              </span>
            </div>
            {receipt.paymentReference ? (
              <p className="mt-2 text-xs text-[#5f6368]">
                Ref: {receipt.paymentReference}
              </p>
            ) : null}
          </div>
        </section>

        {receipt.thankYouMessage ? (
          <section className="pt-5">
            <div className="rounded-xl border border-[#e2e8e3] bg-[#f8faf9] px-3 py-3 text-sm text-[#5f6368]">
              {receipt.thankYouMessage}
            </div>
          </section>
        ) : null}

        {receipt.footerText ? (
          <footer className="mt-6 border-t border-[#e2e8e3] pt-4 text-center text-xs text-[#5f6368]">
            <Link
              href={receipt.footerLinkPath}
              className="font-medium text-[#0F5D46] hover:underline"
            >
              {receipt.footerText}
            </Link>
          </footer>
        ) : null}
      </div>
    </main>
  );
}
