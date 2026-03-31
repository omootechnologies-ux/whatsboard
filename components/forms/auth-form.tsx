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
      className="form-submit w-full"
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
          <label className="form-label" htmlFor={field.name}>
            {field.label}
          </label>
          <input
            id={field.name}
            name={field.name}
            type={field.type ?? "text"}
            placeholder={field.placeholder}
            defaultValue={field.defaultValue}
            className="form-input"
          />
        </div>
      ))}
      {state.error ? <p className="form-note form-note-error">{state.error}</p> : null}
      <SubmitButton label={submitLabel} />
    </form>
  );
}
