"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquareText, X } from "lucide-react";
import { formatCurrency } from "@/components/whatsboard-dashboard/formatting";
import { parsePaymentSmsPreview } from "@/lib/payments/sms-parser";
import type { ReconcileSmsResult } from "@/lib/whatsboard-repository";
import { formatOrderReference } from "@/lib/display-labels";

export type PaymentSmsOrderOption = {
  id: string;
  customerLabel: string;
  amount: number;
};

type ReconcileSmsResponse = {
  ok: boolean;
  error?: string;
  result?: ReconcileSmsResult;
};

type AssignResponse = {
  ok: boolean;
  error?: string;
};

export function PaymentSmsModal({
  orderOptions,
  triggerLabel = "Paste Payment SMS",
  triggerClassName = "wb-button-secondary",
}: {
  orderOptions: PaymentSmsOrderOption[];
  triggerLabel?: string;
  triggerClassName?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [smsText, setSmsText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [result, setResult] = useState<ReconcileSmsResult | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState("");

  const preview = useMemo(() => parsePaymentSmsPreview(smsText), [smsText]);

  const reset = () => {
    setSmsText("");
    setError(null);
    setLoading(false);
    setAssigning(false);
    setResult(null);
    setSelectedOrderId("");
  };

  const close = () => {
    setOpen(false);
    reset();
  };

  const submit = async () => {
    if (!smsText.trim()) {
      setError("Paste or forward an SMS first.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/payments/reconcile-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawSms: smsText }),
      });
      const payload = (await response.json()) as ReconcileSmsResponse;
      if (!response.ok || !payload.ok || !payload.result) {
        setError(payload.error || "Could not reconcile this SMS.");
        return;
      }
      setResult(payload.result);
      if (payload.result.suggestion?.orderId) {
        setSelectedOrderId(payload.result.suggestion.orderId);
      }
      if (payload.result.status === "matched") {
        router.refresh();
      }
    } catch {
      setError("Could not reconcile this SMS.");
    } finally {
      setLoading(false);
    }
  };

  const assign = async () => {
    if (!result?.payment.id || !selectedOrderId) {
      setError("Select an order to assign this payment.");
      return;
    }

    setAssigning(true);
    setError(null);
    try {
      const response = await fetch("/api/payments/reconcile-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: result.payment.id,
          orderId: selectedOrderId,
        }),
      });
      const payload = (await response.json()) as AssignResponse;
      if (!response.ok || !payload.ok) {
        setError(payload.error || "Could not assign payment.");
        return;
      }
      setResult({
        ...result,
        status: "matched",
        autoMatched: false,
        payment: {
          ...result.payment,
          orderId: selectedOrderId,
          suggestedOrderId: null,
          reconciliationStatus: "matched",
          status: "paid",
        },
      });
      router.refresh();
    } catch {
      setError("Could not assign payment.");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={triggerClassName}
        onClick={() => setOpen(true)}
      >
        <MessageSquareText className="h-4 w-4" />
        {triggerLabel}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center sm:p-6">
          <div className="wb-shell-card max-h-[92dvh] w-full max-w-3xl overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wb-primary)]">
                  Mobile money reconciliation
                </p>
                <h3 className="mt-2 text-2xl font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
                  Paste Payment SMS
                </h3>
                <p className="mt-2 text-sm text-[var(--color-wb-text-muted)]">
                  WhatsBoard parses the SMS and suggests the best order match.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
                  SMS text
                </label>
                <textarea
                  className="wb-textarea min-h-[170px]"
                  value={smsText}
                  onChange={(event) => setSmsText(event.target.value)}
                  placeholder="Paste M-Pesa, Tigopesa, or Airtel Money confirmation SMS..."
                />

                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="wb-button-primary"
                    onClick={submit}
                    disabled={loading || assigning}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Reconciling...
                      </>
                    ) : (
                      "Reconcile payment"
                    )}
                  </button>
                  <button
                    type="button"
                    className="wb-button-secondary"
                    onClick={close}
                    disabled={loading || assigning}
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <aside className="wb-soft-card p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-wb-text-muted)]">
                  Parse preview
                </p>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[var(--color-wb-text-muted)]">Provider</dt>
                    <dd className="font-semibold text-[var(--color-wb-text)]">
                      {preview.parserLabel}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[var(--color-wb-text-muted)]">Amount</dt>
                    <dd className="font-semibold text-[var(--color-wb-text)]">
                      {preview.amount !== null
                        ? formatCurrency(preview.amount)
                        : "Not found"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[var(--color-wb-text-muted)]">Sender</dt>
                    <dd className="max-w-[10rem] truncate font-semibold text-[var(--color-wb-text)]">
                      {preview.senderName || "Not found"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[var(--color-wb-text-muted)]">Phone</dt>
                    <dd className="font-semibold text-[var(--color-wb-text)]">
                      {preview.senderPhone || "Not found"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[var(--color-wb-text-muted)]">Reference</dt>
                    <dd className="font-semibold text-[var(--color-wb-text)]">
                      {preview.reference || "Not found"}
                    </dd>
                  </div>
                </dl>
                <div className="mt-3 rounded-xl border border-[var(--color-wb-border)] bg-white px-3 py-2 text-xs text-[var(--color-wb-text-muted)]">
                  {preview.parseable
                    ? "Format recognized. Ready to reconcile."
                    : "Paste full SMS text to improve parsing."}
                </div>
              </aside>
            </div>

            {error ? (
              <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            {result ? (
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4">
                  <p className="text-sm font-semibold text-[var(--color-wb-text)]">
                    {result.status === "matched"
                      ? "Payment auto-matched and order marked as paid."
                      : result.status === "pending"
                        ? "Suggested match found. Confirm assignment."
                        : "No confident match found. Assign manually."}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-wb-text-muted)]">
                    Reference: {result.payment.reference} • Confidence:{" "}
                    {Math.round(result.payment.matchConfidence || 0)}%
                  </p>
                </div>

                {result.suggestion ? (
                  <div className="rounded-2xl border border-[var(--color-wb-border)] bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wb-text-muted)]">
                      Suggested match
                    </p>
                    <p className="mt-2 font-semibold text-[var(--color-wb-text)]">
                      Order #{formatOrderReference(result.suggestion.orderId) || "WB-00000"} •{" "}
                      {result.suggestion.customerName}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
                      {formatCurrency(result.suggestion.amount)} •{" "}
                      {Math.round(result.suggestion.confidence)}% confidence
                    </p>
                  </div>
                ) : null}

                {result.status !== "matched" ? (
                  <div className="rounded-2xl border border-[var(--color-wb-border)] bg-white p-4">
                    <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
                      Manual override
                    </label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <select
                        className="wb-input"
                        value={selectedOrderId}
                        onChange={(event) => setSelectedOrderId(event.target.value)}
                      >
                        <option value="">Select order</option>
                        {orderOptions.map((order) => (
                          <option key={order.id} value={order.id}>
                            #{formatOrderReference(order.id) || "WB-00000"} •{" "}
                            {order.customerLabel} • {formatCurrency(order.amount)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="wb-button-primary w-full whitespace-nowrap sm:w-auto"
                        onClick={assign}
                        disabled={assigning || !selectedOrderId}
                      >
                        {assigning ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Assigning...
                          </>
                        ) : (
                          "Force match"
                        )}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
