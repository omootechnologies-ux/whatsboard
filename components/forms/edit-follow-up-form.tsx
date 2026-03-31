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
    <form action={formAction} className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      {!canManageRecords ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Free plan is view-only. Upgrade to Starter or above to edit follow-ups.
          <Link href="/pricing" className="ml-2 font-semibold underline">
            Upgrade now
          </Link>
        </div>
      ) : null}

      <fieldset disabled={!canManageRecords} className="contents disabled:opacity-70">
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-slate-700">Due date</span>
        <input name="dueAt" type="datetime-local" defaultValue={toLocalDateTime(followUp.due_at)} className="h-12 w-full rounded-2xl border border-slate-300 px-4 text-slate-900" />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-semibold text-slate-700">Note</span>
        <textarea name="note" defaultValue={followUp.note ?? ""} className="min-h-[120px] w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900" />
      </label>

      <label className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-3">
        <input type="checkbox" name="completed" defaultChecked={Boolean(followUp.completed)} className="h-4 w-4" />
        <span className="text-sm font-semibold text-slate-700">Mark as completed</span>
      </label>

      {state.error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{state.error}</div> : null}
      {state.success ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Follow-up updated successfully.</div> : null}

      <button type="submit" disabled={isPending} className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
        {isPending ? "Saving..." : "Save changes"}
      </button>
      </fieldset>
    </form>
  );
}
