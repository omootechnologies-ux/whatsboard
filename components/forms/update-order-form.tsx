"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateOrderAction } from "@/app/dashboard/actions";

const STAGES = [
  { key: "new_order", label: "New Order" },
  { key: "waiting_payment", label: "Waiting Payment" },
  { key: "confirmed", label: "Confirmed" },
  { key: "packing", label: "Packing" },
  { key: "dispatched", label: "Dispatched" },
  { key: "delivered", label: "Delivered" },
];

const PAYMENT_STATUSES = [
  { key: "unpaid", label: "Unpaid" },
  { key: "paid", label: "Paid" },
  { key: "cod", label: "Cash on Delivery" },
];

type Props = {
  orderId: string;
  currentStage: string;
  currentPaymentStatus: string;
  currentProductName: string;
  currentArea: string;
  currentAmount: number;
  currentNotes: string;
};

const initialState = { error: "", success: false };

export function UpdateOrderForm({
  orderId,
  currentStage,
  currentPaymentStatus,
  currentProductName,
  currentArea,
  currentAmount,
  currentNotes,
}: Props) {
  const router = useRouter();

  async function updateAction(_: any, formData: FormData) {
    const result = await updateOrderAction(formData);
    return result ?? { error: "", success: false };
  }

  const [state, formAction, isPending] = useActionState(updateAction, initialState);

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state?.success]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="orderId" value={orderId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Product Name
          </label>
          <input
            name="productName"
            defaultValue={currentProductName}
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Delivery Area
          </label>
          <input
            name="area"
            defaultValue={currentArea}
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Amount (TZS)
          </label>
          <input
            name="amount"
            type="number"
            defaultValue={currentAmount}
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Stage
          </label>
          <select
            name="stage"
            defaultValue={currentStage}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          >
            {STAGES.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Payment Status
          </label>
          <select
            name="paymentStatus"
            defaultValue={currentPaymentStatus}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          >
            {PAYMENT_STATUSES.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          defaultValue={currentNotes}
          rows={3}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 resize-none"
        />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      {state?.success && (
        <p className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700 font-medium">
          ✓ Order updated successfully
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors disabled:opacity-60"
      >
        {isPending ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
