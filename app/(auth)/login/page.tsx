import Link from "next/link";
import { AuthForm } from "@/components/forms/auth-form";
import { loginAction } from "../actions";

export default function LoginPage() {
  return (
    <main className="container-pad flex min-h-screen items-center justify-center py-16">
      <div className="w-full max-w-md rounded-3xl border border-white/14 bg-white/8 p-8 backdrop-blur">
        <h1 className="text-3xl font-semibold text-white">Login</h1>
        <p className="mt-2 text-white/72">Access your order board.</p>
        <AuthForm
          action={loginAction}
          submitLabel="Login"
          fields={[
            { name: "email", label: "Email", type: "email", placeholder: "you@business.com" },
            { name: "password", label: "Password", type: "password", placeholder: "••••••••" }
          ]}
        />
        <p className="mt-4 text-sm text-white/62">
          No account? <Link href="/register" className="text-white underline">Create one</Link>
        </p>
      </div>
    </main>
  );
}
