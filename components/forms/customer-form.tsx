"use client";

import { useActionState } from "react";
import { updateCustomerAction } from "@/app/dashboard/actions";

type CustomerRecord = {
  id: string;
  name?: string | null;
  phone?: string | null;
  area?: string | null;
  channel?: string | null;
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

export default function CustomerForm({ customer }: { customer: CustomerRecord }) {
  const action = updateCustomerAction.bind(null, customer.id);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Customer name">
          <input
            name="name"
            defaultValue={customer.name ?? ""}
            placeholder="Customer name"
            className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-emerald-400"
          />
        </Field>

        <Field label="Phone">
          <input
            name="phone"
            defaultValue={customer.phone ?? ""}
            placeholder="Phone"
            className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-emerald-400"
          />
        </Field>

        <Field label="Area">
          <input
            name="area"
            defaultValue={customer.area ?? ""}
            placeholder="Area"
            className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-emerald-400"
          />
        </Field>

        <Field label="Preferred channel">
          <select
            name="channel"
            defaultValue={customer.channel ?? ""}
            className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-emerald-400"
          >
            <option value="">Select channel</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram">Instagram</option>
            <option value="messenger">Messenger</option>
            <option value="tiktok">TikTok</option>
            <option value="call">Call</option>
          </select>
        </Field>
      </div>

      <Field label="Notes">
        <textarea
          name="notes"
          defaultValue={customer.notes ?? ""}
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
          Customer updated successfully.
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save changes"}
      </button>
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
