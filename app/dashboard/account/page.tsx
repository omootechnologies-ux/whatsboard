import Link from "next/link";
import { UserCircle2, Building2, Mail, Phone, Palette, Coins, CalendarDays, CreditCard, LogOut, UserPlus2, Users } from "lucide-react";
import { getAccountData, getCurrentMonthOrderUsage } from "@/lib/queries";
import { logoutAction } from "@/app/(auth)/actions";
import { addTeamMemberAction, removeTeamMemberAction } from "@/app/dashboard/actions";
import { PLAN_CONFIG } from "@/lib/billing";
import {
  canAccessDashboardFeature,
  getEffectivePlanKey,
  getMonthlyOrderLimit,
  getPlanName,
  getRemainingMonthlyOrders,
  getTeamMemberLimit,
} from "@/lib/plan-access";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AccountPage({
  searchParams,
}: {
  searchParams?: Promise<{ team_status?: string; team_message?: string }>;
}) {
  const { user, profile, business, billingTransaction, isAdmin, isBusinessOwner, teamMembers } = await getAccountData();
  const resolvedSearch = (await searchParams) ?? {};
  const effectivePlan = getEffectivePlanKey(business);
  const monthlyOrderLimit = getMonthlyOrderLimit(business);
  const teamMemberLimit = getTeamMemberLimit(business);
  const orderCountThisMonth = await getCurrentMonthOrderUsage();
  const remainingMonthlyOrders = getRemainingMonthlyOrders(business, orderCountThisMonth);
  const teamSeatsUsed = teamMembers.filter((member) => member.role !== "owner").length;
  const canManageTeam = Boolean(isAdmin || isBusinessOwner);
  const unlockedFeatures = [
    { label: "Orders", allowed: canAccessDashboardFeature("orders", business) },
    { label: "Customers", allowed: canAccessDashboardFeature("customers", business) },
    { label: "Follow-ups", allowed: canAccessDashboardFeature("followUps", business) },
    { label: "Analytics", allowed: canAccessDashboardFeature("analytics", business) },
    { label: "Account", allowed: canAccessDashboardFeature("account", business) },
    { label: "Settings", allowed: canAccessDashboardFeature("settings", business) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Account</h2>
        <p className="mt-2 text-slate-600">
          Your user information and the business connected to this account.
        </p>
      </div>

      {resolvedSearch.team_message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            resolvedSearch.team_status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {resolvedSearch.team_message}
        </div>
      ) : null}

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
            <p className="mt-2 font-medium capitalize text-slate-900">
              {getPlanName(effectivePlan)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Billing status</p>
            <p className="mt-2 font-medium capitalize text-slate-900">
              {effectivePlan === "free" ? "free" : business?.billing_status ?? "inactive"}
            </p>
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
          <p className="text-xs text-slate-500">Order allowance this month</p>
          <p className="mt-2 text-sm font-medium text-slate-900">
            {monthlyOrderLimit === null
              ? `${orderCountThisMonth} orders used this month. Your plan is unlimited.`
              : `${orderCountThisMonth} of ${monthlyOrderLimit} orders used this month${
                  remainingMonthlyOrders !== null ? ` • ${remainingMonthlyOrders} left` : ""
                }.`}
          </p>
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
          <p className="text-xs text-slate-500">What this plan includes</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {PLAN_CONFIG[effectivePlan].features.map((feature) => (
              <span
                key={feature.label}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  feature.comingSoon ? "bg-slate-200 text-slate-600" : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {feature.label}
                {feature.comingSoon ? " (coming soon)" : ""}
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

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Team members</h3>
            <p className="text-sm text-slate-500">Growth supports 2 team members. Business supports 5.</p>
          </div>
        </div>

        {teamMemberLimit > 0 ? (
          <>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Seats used</p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {teamSeatsUsed} of {teamMemberLimit} team seats used on {getPlanName(effectivePlan)}.
              </p>
            </div>

            {canManageTeam ? (
              <form action={addTeamMemberAction} className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="text-xs text-slate-500" htmlFor="team-email">
                  Add member by email
                </label>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    id="team-email"
                    name="email"
                    type="email"
                    required
                    placeholder="seller@example.com"
                    className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400"
                  />
                  <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700">
                    <UserPlus2 className="h-4 w-4" />
                    Add member
                  </button>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  The user must already have a WhatsBoard account before you can add them to your team.
                </p>
              </form>
            ) : null}

            <div className="mt-4 space-y-3">
              {teamMembers.length ? (
                teamMembers.map((member) => (
                  <div
                    key={member.userId}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">
                        {member.fullName || member.email || "Unnamed user"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{member.email || "No email"}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                        {member.role === "owner" ? "Owner" : "Team member"}
                      </p>
                    </div>

                    {canManageTeam && member.role !== "owner" ? (
                      <form action={removeTeamMemberAction}>
                        <input type="hidden" name="memberId" value={member.userId} />
                        <button className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50">
                          Remove
                        </button>
                      </form>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No team members yet. Add people here when your plan supports seats.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-900">Team members start on Growth.</p>
            <p className="mt-2 text-sm text-slate-500">
              Upgrade to Growth for 2 team members or Business for 5.
            </p>
            <Link
              href="/pricing"
              className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition hover:border-slate-400"
            >
              Upgrade on pricing page
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
