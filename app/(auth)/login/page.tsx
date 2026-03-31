import Link from "next/link";
import { AuthForm } from "@/components/forms/auth-form";
import { loginAction } from "../actions";

export default function LoginPage() {
  return (
    <main className="container-pad flex min-h-screen items-center justify-center py-16">
      <div className="w-full max-w-md rounded-3xl border border-[#173728]/12 bg-white p-8 shadow-[0_24px_80px_rgba(23,55,40,0.08)]">
        <h1 className="text-3xl font-semibold text-[#173728]">Login</h1>
        <p className="mt-2 text-[#173728]/68">Access your order board.</p>
        <AuthForm
          action={loginAction}
          submitLabel="Login"
          fields={[
            { name: "email", label: "Email", type: "email", placeholder: "you@business.com" },
            { name: "password", label: "Password", type: "password", placeholder: "••••••••" }
          ]}
        />
        <p className="mt-4 text-sm text-[#173728]/62">
          No account? <Link href="/register" className="text-[#173728] underline">Create one</Link>
        </p>
      </div>
    </main>
  );
}
