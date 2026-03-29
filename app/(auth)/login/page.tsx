import Link from "next/link";
import { AuthForm } from "@/components/forms/auth-form";
import { loginAction } from "../actions";

export default function LoginPage() {
  return (
    <main className="container-pad flex min-h-screen items-center justify-center py-16">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8">
        <h1 className="text-3xl font-semibold">Login</h1>
        <p className="mt-2 text-slate-600">Access your order board.</p>
        <AuthForm
          action={loginAction}
          submitLabel="Login"
          fields={[
            { name: "email", label: "Email", type: "email", placeholder: "you@business.com" },
            { name: "password", label: "Password", type: "password", placeholder: "••••••••" }
          ]}
        />
        <p className="mt-4 text-sm text-slate-500">
          No account? <Link href="/register" className="text-emerald-300">Create one</Link>
        </p>
      </div>
    </main>
  );
}
