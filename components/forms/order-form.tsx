"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createOrderAction } from "@/app/dashboard/actions";
import { ORDER_STAGES } from "@/lib/constants";

const PAYMENT_OPTIONS = ["unpaid", "partial", "paid", "cod"];

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
    error: "",
    success: false
  });

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <input name="customerName" placeholder="Customer name" className="rounded-2xl border border-slate-200 bg-white px-4 py-3" />
      <input name="phone" placeholder="Phone number" className="rounded-2xl border border-slate-200 bg-white px-4 py-3" />
      <input name="area" placeholder="Delivery area" className="rounded-2xl border border-slate-200 bg-white px-4 py-3" />
      <input name="productName" placeholder="Product or service" className="rounded-2xl border border-slate-200 bg-white px-4 py-3" />
      <input name="amount" type="number" placeholder="Amount" className="rounded-2xl border border-slate-200 bg-white px-4 py-3" />
      <select name="stage" defaultValue="new_order" className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
        {ORDER_STAGES.map((stage) => (
          <option key={stage.key} value={stage.key}>
            {stage.label}
          </option>
        ))}
      </select>
      <select name="paymentStatus" defaultValue="unpaid" className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
        {PAYMENT_OPTIONS.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <textarea name="notes" placeholder="Notes" className="min-h-28 rounded-2xl border border-slate-200 bg-white px-4 py-3 md:col-span-2" />
      {state?.error ? <p className="text-sm text-rose-300 md:col-span-2">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-emerald-300 md:col-span-2">Order created successfully.</p> : null}
      <div className="md:col-span-2">
        <SubmitButton />
      </div>
    </form>
  );
}
