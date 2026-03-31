"use client";

import Link from "next/link";
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
  canManageRecords = true,
}: {
  customer: {
    id: string;
    name?: string | null;
    phone?: string | null;
    area?: string | null;
    notes?: string | null;
    status?: string | null;
  };
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  canManageRecords?: boolean;
}) {
  const [state, formAction, isPending] = useFormState(action, initialState);

  return (
    <form action={formAction} className="form-surface grid gap-4">
      {!canManageRecords ? (
        <div className="form-note form-note-warning">
          Free plan is view-only. Upgrade to Starter or above to edit customers.
          <Link href="/pricing" className="ml-2 font-semibold underline">
            Upgrade now
          </Link>
        </div>
      ) : null}

      <fieldset disabled={!canManageRecords} className="contents disabled:opacity-70">
      <div className="form-grid">
        <label className="form-field">
          <span className="form-label">Name</span>
          <input name="name" defaultValue={customer.name ?? ""} className="form-input" />
        </label>

        <label className="form-field">
          <span className="form-label">Phone</span>
          <input name="phone" defaultValue={customer.phone ?? ""} className="form-input" />
        </label>

        <label className="form-field">
          <span className="form-label">Area</span>
          <input name="area" defaultValue={customer.area ?? ""} className="form-input" />
        </label>

      </div>

      <label className="form-field">
        <span className="form-label">Notes</span>
        <textarea name="notes" defaultValue={customer.notes ?? ""} className="form-textarea" />
      </label>

      {state.error ? <div className="form-note form-note-error">{state.error}</div> : null}
      {state.success ? <div className="form-note form-note-success">Customer updated successfully.</div> : null}

      <button type="submit" disabled={isPending} className="form-submit">
        {isPending ? "Saving..." : "Save changes"}
      </button>
      </fieldset>
    </form>
  );
}
