"use client";

import { useFormState } from "react-dom";
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
  const [state, formAction, isPending] = useFormState(action, initialState);

  return (
    <form action={formAction} className="form-surface grid gap-4">
      <div className="form-grid">
        <Field label="Customer name">
          <input
            name="name"
            defaultValue={customer.name ?? ""}
            placeholder="Customer name"
            className="form-input"
          />
        </Field>

        <Field label="Phone">
          <input
            name="phone"
            defaultValue={customer.phone ?? ""}
            placeholder="Phone"
            className="form-input"
          />
        </Field>

        <Field label="Area">
          <input
            name="area"
            defaultValue={customer.area ?? ""}
            placeholder="Area"
            className="form-input"
          />
        </Field>

        <Field label="Preferred channel">
          <select
            name="channel"
            defaultValue={customer.channel ?? ""}
            className="form-select"
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
          className="form-textarea min-h-[130px]"
        />
      </Field>

      {state.error && (
        <div className="form-note form-note-error">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="form-note form-note-success">
          Customer updated successfully.
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="form-submit"
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
    <label className="form-field">
      <span className="form-label">{label}</span>
      {children}
    </label>
  );
}
