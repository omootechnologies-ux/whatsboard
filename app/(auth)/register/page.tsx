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
      <div className="w-full max-w-md rounded-3xl border border-[#173728]/12 bg-white p-8 shadow-[0_24px_80px_rgba(23,55,40,0.08)]">
        <h1 className="text-3xl font-semibold text-[#173728]">Create your account</h1>
        <p className="mt-2 text-[#173728]/68">Start tracking orders from WhatsApp, Instagram, and more.</p>
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
        <p className="mt-4 text-sm text-[#173728]/62">
          Already have an account? <Link href="/login" className="text-[#173728] underline">Login</Link>
        </p>
      </div>
    </main>
  );
}
