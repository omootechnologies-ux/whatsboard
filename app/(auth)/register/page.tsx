import Link from "next/link";
import { AuthForm } from "@/components/forms/auth-form";
import { registerAction } from "../actions";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<{ ref?: string }>;
}) {
  const resolvedSearch = (await searchParams) ?? {};

  return (
    <main className="container-pad flex min-h-screen items-center justify-center py-16">
      <div className="w-full max-w-md rounded-[2rem] border border-[#e8e8e2] bg-white p-8 shadow-[0_24px_80px_rgba(17,17,17,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0f5d46]">Get started</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#111111]">Create your account</h1>
        <p className="mt-2 text-[#5e6461]">Start tracking orders from WhatsApp, Instagram, and more.</p>
        <AuthForm
          action={registerAction}
          submitLabel="Create account"
          fields={[
            { name: "businessName", label: "Business name", placeholder: "Amina Fashion House" },
            { name: "fullName", label: "Full name", placeholder: "Amina Selemani" },
            { name: "email", label: "Email", type: "email", placeholder: "you@business.com" },
            { name: "password", label: "Password", type: "password", placeholder: "••••••••" },
            { name: "referralCode", label: "Referral code", placeholder: "Optional", defaultValue: resolvedSearch.ref ?? "" },
          ]}
        />
        <p className="mt-4 text-sm text-[#5e6461]">
          Already have an account? <Link href="/login" className="text-[#111111] underline">Login</Link>
        </p>
      </div>
    </main>
  );
}
