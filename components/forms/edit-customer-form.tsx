"use client";

import { useFormState } from "react-dom";

type ActionState = {
  success: boolean;
  error: string | null;
};

const initialState: ActionState = {
  success: false,
  error: null,
};

export default function EditCustomerForm({
  customer,
  action,
}: {
  customer: {
    id: string;
    name?: string | null;
    phone?: string | null;
    area?: string | null;
    channel?: string | null;
    notes?: string | null;
    status?: string | null;
  };
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, isPending] = useFormState(action, initialState);

  return (
    <form action={formAction} className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name">
          <input
            name="name"
            defaultValue={customer.name ?? ""}
            className="h-12 w-full rounded-2xl border border-slate-300 px-4 text-slate-900"
          />
        </Field>

        <Field label="Phone">
          <input
            name="phone"
            defaultValue={customer.phone ?? ""}
            className="h-12 w-full rounded-2xl border border-slate-300 px-4 text-slate-900"
          />
        </Field>

        <Field label="Area">
          <input
            name="area"
            defaultValue={customer.area ?? ""}
            className="h-12 w-full rounded-2xl border border-slate-300 px-4 text-slate-900"
          />
        </Field>

        <Field label="Channel">
          <input
            name="channel"
            defaultValue={customer.channel ?? ""}
            className="h-12 w-full rounded-2xl border border-slate-300 px-4 text-slate-900"
          />
        </Field>
      </div>

      <Field label="Notes">
        <textarea
          name="notes"
          defaultValue={customer.notes ?? ""}
          className="min-h-[120px] w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900"
        />
      </Field>

      {state.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {state.error}
        </div>
      ) : null}

      {state.success ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Customer updated successfully.
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
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
