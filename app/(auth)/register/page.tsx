import Link from "next/link";
import { AuthForm } from "@/components/forms/auth-form";
import { registerAction } from "../actions";

export default function RegisterPage() {
  return (
    <main className="container-pad flex min-h-screen items-center justify-center py-16">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8">
        <h1 className="text-3xl font-semibold">Create your account</h1>
        <p className="mt-2 text-slate-600">Start tracking orders from WhatsApp, Instagram, and more.</p>
        <AuthForm
          action={registerAction}
          submitLabel="Create account"
          fields={[
            { name: "businessName", label: "Business name", placeholder: "Amina Fashion House" },
            { name: "fullName", label: "Full name", placeholder: "Amina Selemani" },
            { name: "email", label: "Email", type: "email", placeholder: "you@business.com" },
            { name: "password", label: "Password", type: "password", placeholder: "••••••••" }
          ]}
        />
        <p className="mt-4 text-sm text-slate-500">
          Already have an account? <Link href="/login" className="text-emerald-300">Login</Link>
        </p>
      </div>
    </main>
  );
}
