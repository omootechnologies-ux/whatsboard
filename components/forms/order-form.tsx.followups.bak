"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createOrderAction } from "@/app/dashboard/actions";
import { ORDER_STAGES } from "@/lib/constants";

const PAYMENT_OPTIONS = ["unpaid", "partial", "paid", "cod"];

type OrderFormState = {
  error: string | null;
  success: boolean;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      className="w-full rounded-2xl bg-emerald-400 px-4 py-3 font-medium text-slate-950 disabled:opacity-60"
    >
      {pending ? "Saving..." : "Create order"}
    </button>
  );
}

export function OrderForm() {
  const [state, formAction] = useFormState(createOrderAction, {
    error: null,
    success: false,
  });

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <input name="customerName" placeholder="Customer name" className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3" />
      <input name="phone" placeholder="Phone number" className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3" />
      <input name="area" placeholder="Delivery area" className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3" />
      <input name="product" placeholder="Product or service" className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3" />
      <input name="amount" type="number" placeholder="Amount" className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3" />

      <select name="stage" defaultValue="new_order" className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3">
        {ORDER_STAGES.map((stage) => (
          <option key={stage.key} value={stage.key}>
            {stage.label}
          </option>
        ))}
      </select>

      <select name="paymentStatus" defaultValue="unpaid" className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3">
        {PAYMENT_OPTIONS.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 md:col-span-2">
        <input type="checkbox" name="addFollowUp" className="h-4 w-4" />
        <span>Add follow-up</span>
      </label>

      <input name="followUpDate" type="datetime-local" className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3" />
      <input name="followUpNote" placeholder="Follow-up note" className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3" />

      <textarea name="notes" placeholder="Notes" className="min-h-28 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 md:col-span-2" />

      {state.error ? <p className="text-sm text-rose-300 md:col-span-2">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-300 md:col-span-2">Order created successfully.</p> : null}

      <div className="md:col-span-2">
        <SubmitButton />
      </div>
    </form>
  );
}
