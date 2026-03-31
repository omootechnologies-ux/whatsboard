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

function toLocalDateTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function EditFollowUpForm({
  followUp,
  action,
  canManageRecords = true,
}: {
  followUp: {
    id: string;
    due_at?: string | null;
    note?: string | null;
    completed?: boolean | null;
  };
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  canManageRecords?: boolean;
}) {
  const [state, formAction, isPending] = useFormState(action, initialState);

  return (
    <form action={formAction} className="form-surface grid gap-4">
      {!canManageRecords ? (
        <div className="form-note form-note-warning">
          Free plan is view-only. Upgrade to Starter or above to edit follow-ups.
          <Link href="/pricing" className="ml-2 font-semibold underline">
            Upgrade now
          </Link>
        </div>
      ) : null}

      <fieldset disabled={!canManageRecords} className="contents disabled:opacity-70">
      <label className="form-field">
        <span className="form-label">Due date</span>
        <input name="dueAt" type="datetime-local" defaultValue={toLocalDateTime(followUp.due_at)} className="form-input" />
      </label>

      <label className="form-field">
        <span className="form-label">Note</span>
        <textarea name="note" defaultValue={followUp.note ?? ""} className="form-textarea" />
      </label>

      <label className="form-check-row">
        <input type="checkbox" name="completed" defaultChecked={Boolean(followUp.completed)} className="h-4 w-4" />
        <span className="text-sm font-semibold text-foreground">Mark as completed</span>
      </label>

      {state.error ? <div className="form-note form-note-error">{state.error}</div> : null}
      {state.success ? <div className="form-note form-note-success">Follow-up updated successfully.</div> : null}

      <button type="submit" disabled={isPending} className="form-submit">
        {isPending ? "Saving..." : "Save changes"}
      </button>
      </fieldset>
    </form>
  );
}
