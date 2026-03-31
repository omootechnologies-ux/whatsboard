import Link from "next/link";
import { AuthForm } from "@/components/forms/auth-form";
import { LanguageToggle } from "@/components/i18n/language-toggle";
import { TranslatedText } from "@/components/i18n/translated-text";
import { loginAction } from "../actions";

export default function LoginPage() {
  return (
    <main className="container-pad flex min-h-screen items-center justify-center py-16">
      <div className="w-full max-w-md rounded-[2rem] border border-[#e8e8e2] bg-white p-8 shadow-[0_24px_80px_rgba(17,17,17,0.06)]">
        <div className="flex justify-end">
          <LanguageToggle />
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#0f5d46]"><TranslatedText text="Welcome back" /></p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#111111]"><TranslatedText text="Access your order board" /></h1>
        <p className="mt-2 text-[#5e6461]"><TranslatedText text="Log in to track orders, payments, and follow-ups." /></p>
        <AuthForm
          action={loginAction}
          submitLabel="Login"
          fields={[
            { name: "email", label: "Email", type: "email", placeholder: "you@business.com" },
            { name: "password", label: "Password", type: "password", placeholder: "••••••••" }
          ]}
        />
        <p className="mt-4 text-sm text-[#5e6461]">
          <TranslatedText text="No account?" /> <Link href="/register" className="text-[#111111] underline"><TranslatedText text="Create one" /></Link>
        </p>
      </div>
    </main>
  );
}
