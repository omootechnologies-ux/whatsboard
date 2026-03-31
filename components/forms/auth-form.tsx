"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useLanguage } from "@/components/i18n/language-provider";

type AuthFormState = {
  error: string;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  const { t } = useLanguage();

  return (
    <button
      disabled={pending}
      className="form-submit w-full"
    >
      {pending ? t("Please wait...") : t(label)}
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
  const { t } = useLanguage();

  return (
    <form action={formAction} className="mt-6 space-y-4">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <label className="form-label" htmlFor={field.name}>
            {t(field.label)}
          </label>
          <input
            id={field.name}
            name={field.name}
            type={field.type ?? "text"}
            placeholder={t(field.placeholder)}
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
