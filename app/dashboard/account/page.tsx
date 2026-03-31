import Link from "next/link";
import { UserCircle2, Building2, Mail, Phone, Palette, Coins, CalendarDays, CreditCard, LogOut } from "lucide-react";
import { getAccountData } from "@/lib/queries";
import { logoutAction } from "@/app/(auth)/actions";
import { canAccessDashboardFeature } from "@/lib/plan-access";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AccountPage() {
  const { user, profile, business, billingTransaction } = await getAccountData();
  const unlockedFeatures = [
    { label: "Orders", allowed: canAccessDashboardFeature("orders", business) },
    { label: "Customers", allowed: canAccessDashboardFeature("customers", business) },
    { label: "Follow-ups", allowed: canAccessDashboardFeature("followUps", business) },
    { label: "Catalog", allowed: canAccessDashboardFeature("catalog", business) },
    { label: "AI Capture", allowed: canAccessDashboardFeature("aiCapture", business) },
    { label: "Analytics", allowed: canAccessDashboardFeature("analytics", business) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Account</h2>
        <p className="mt-2 text-slate-600">
          Your user information and the business connected to this account.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <UserCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">User profile</h3>
              <p className="text-sm text-slate-500">Information for the logged-in user</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Full name</p>
              <p className="mt-2 font-medium text-slate-900">{profile?.full_name ?? "Not set"}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Email</p>
              <p className="mt-2 font-medium text-slate-900">{profile?.email ?? user?.email ?? "Not set"}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
              <p className="text-xs text-slate-500">User ID</p>
              <p className="mt-2 break-all text-sm font-medium text-slate-900">{user?.id ?? "Not available"}</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Business profile</h3>
              <p className="text-sm text-slate-500">The business aligned to this account</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Building2 className="h-4 w-4" />
                <p className="text-xs">Business name</p>
              </div>
              <p className="mt-2 font-medium text-slate-900">{business?.name ?? "Not set"}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Phone className="h-4 w-4" />
                <p className="text-xs">Business phone</p>
              </div>
              <p className="mt-2 font-medium text-slate-900">{business?.phone ?? "Not set"}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Palette className="h-4 w-4" />
                <p className="text-xs">Brand color</p>
              </div>
              <p className="mt-2 font-medium text-slate-900">{business?.brand_color ?? "#22c55e"}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Coins className="h-4 w-4" />
                <p className="text-xs">Currency</p>
              </div>
              <p className="mt-2 font-medium text-slate-900">{business?.currency ?? "TZS"}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
              <div className="flex items-center gap-2 text-slate-500">
                <CalendarDays className="h-4 w-4" />
                <p className="text-xs">Business created</p>
              </div>
              <p className="mt-2 font-medium text-slate-900">
                {business?.created_at ? new Date(business.created_at).toLocaleString() : "Not available"}
              </p>
            </div>
          </div>

          <form action={logoutAction} className="mt-6">
            <button className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 hover:bg-rose-100">
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </section>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Billing</h3>
            <p className="text-sm text-slate-500">Current plan and latest payment state</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Current plan</p>
            <p className="mt-2 font-medium capitalize text-slate-900">{business?.billing_plan ?? "No active plan"}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Billing status</p>
            <p className="mt-2 font-medium capitalize text-slate-900">{business?.billing_status ?? "inactive"}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Paid through</p>
            <p className="mt-2 font-medium text-slate-900">
              {business?.billing_current_period_ends_at
                ? new Date(business.billing_current_period_ends_at).toLocaleDateString()
                : "Not available"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Latest transaction</p>
            <p className="mt-2 font-medium capitalize text-slate-900">{billingTransaction?.status ?? "None yet"}</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Unlocked dashboard features</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {unlockedFeatures.map((feature) => (
              <span
                key={feature.label}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  feature.allowed ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-600"
                }`}
              >
                {feature.label}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Provider reference</p>
          <p className="mt-2 break-all text-sm font-medium text-slate-900">
            {business?.billing_provider_reference ?? billingTransaction?.payment_reference ?? billingTransaction?.session_reference ?? "Not available"}
          </p>
        </div>

        <div className="mt-6">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition hover:border-slate-400"
          >
            Manage plan on pricing page
          </Link>
        </div>
      </section>
    </div>
  );
}
