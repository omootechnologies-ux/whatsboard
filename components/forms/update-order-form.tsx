"use client";

import { useActionState } from "react";
import { updateOrderAction } from "@/app/dashboard/actions";

type OrderRecord = {
  id: string;
  customer_name?: string | null;
  phone?: string | null;
  product?: string | null;
  amount?: number | null;
  area?: string | null;
  stage?: string | null;
  payment_status?: string | null;
  notes?: string | null;
};

type ActionState = {
  success: boolean;
  error: string | null;
};

const initialState: ActionState = {
  success: false,
  error: null,
};

export default function UpdateOrderForm({ order }: { order: OrderRecord }) {
  const action = updateOrderAction.bind(null, order.id);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Customer name">
          <input
            name="customerName"
            defaultValue={order.customer_name ?? ""}
            placeholder="Customer name"
            className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-emerald-400"
          />
        </Field>

        <Field label="Phone">
          <input
            name="phone"
            defaultValue={order.phone ?? ""}
            placeholder="Phone"
            className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-emerald-400"
          />
        </Field>

        <Field label="Product">
          <input
            name="product"
            defaultValue={order.product ?? ""}
            placeholder="Product"
            className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-emerald-400"
          />
        </Field>

        <Field label="Amount">
          <input
            name="amount"
            type="number"
            min="0"
            defaultValue={order.amount ?? 0}
            placeholder="Amount"
            className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-emerald-400"
          />
        </Field>

        <Field label="Area">
          <input
            name="area"
            defaultValue={order.area ?? ""}
            placeholder="Area"
            className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-emerald-400"
          />
        </Field>

        <Field label="Stage">
          <select
            name="stage"
            defaultValue={order.stage ?? "new_order"}
            className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-emerald-400"
          >
            <option value="new_order">New Order</option>
            <option value="waiting_payment">Waiting Payment</option>
            <option value="confirmed">Confirmed</option>
            <option value="packing">Packing</option>
            <option value="dispatched">Dispatched</option>
            <option value="delivered">Delivered</option>
          </select>
        </Field>

        <Field label="Payment status">
          <select
            name="paymentStatus"
            defaultValue={order.payment_status ?? "unpaid"}
            className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-emerald-400"
          >
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
          </select>
        </Field>
      </div>

      <Field label="Notes">
        <textarea
          name="notes"
          defaultValue={order.notes ?? ""}
          placeholder="Notes"
          className="min-h-[130px] w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400"
        />
      </Field>

      {state.error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Order updated successfully.
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}
