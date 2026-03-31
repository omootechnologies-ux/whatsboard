"use client";

import { useFormState, useFormStatus } from "react-dom";

type AuthFormState = {
  error: string;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      className="w-full rounded-2xl border border-[#0f5d46] bg-[#0f5d46] px-4 py-3 font-medium text-white transition hover:bg-[#0a3d2e] disabled:opacity-60"
    >
      {pending ? "Please wait..." : label}
    </button>
  );
}

export function AuthForm({
  action,
  fields,
  submitLabel
}: {
  action: (state: AuthFormState, payload: FormData) => Promise<AuthFormState>;
  fields: Array<{ name: string; label: string; type?: string; placeholder: string; defaultValue?: string }>;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, { error: "" });

  return (
    <form action={formAction} className="mt-6 space-y-4">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <label className="text-sm text-[#5e6461]" htmlFor={field.name}>
            {field.label}
          </label>
          <input
            id={field.name}
            name={field.name}
            type={field.type ?? "text"}
            placeholder={field.placeholder}
            defaultValue={field.defaultValue}
            className="w-full rounded-2xl border border-[#e8e8e2] bg-[#fcfcfa] px-4 py-3 text-[#111111] placeholder:text-[#5e6461]/70"
          />
        </div>
      ))}
      {state.error ? <p className="text-sm text-[#c7675d]">{state.error}</p> : null}
      <SubmitButton label={submitLabel} />
    </form>
  );
}
