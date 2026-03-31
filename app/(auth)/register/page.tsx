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
      <div className="w-full max-w-md rounded-3xl border border-white/14 bg-white/8 p-8 backdrop-blur">
        <h1 className="text-3xl font-semibold text-white">Create your account</h1>
        <p className="mt-2 text-white/72">Start tracking orders from WhatsApp, Instagram, and more.</p>
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
        <p className="mt-4 text-sm text-white/62">
          Already have an account? <Link href="/login" className="text-white underline">Login</Link>
        </p>
      </div>
    </main>
  );
}
