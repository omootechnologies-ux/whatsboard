import Link from "next/link";
import {
  Building2,
  CalendarDays,
  Coins,
  CreditCard,
  LogOut,
  Palette,
  Phone,
  UserCircle2,
  UserPlus2,
  Users,
} from "lucide-react";
import { getAccountData, getCurrentMonthOrderUsage } from "@/lib/queries";
import { logoutAction } from "@/app/(auth)/actions";
import { addTeamMemberAction, removeTeamMemberAction } from "@/app/dashboard/actions";
import { PLAN_CONFIG } from "@/lib/billing";
import {
  canAccessDashboardFeatureForUser,
  getEffectivePlanKey,
  getMonthlyOrderLimit,
  getPlanName,
  getRemainingMonthlyOrders,
  getTeamMemberLimitForUser,
} from "@/lib/plan-access";
import {
  DashboardBadge,
  DashboardEmptyState,
  DashboardHero,
  DashboardInfoGrid,
  DashboardPage,
  DashboardPanel,
  DashboardPanelHeader,
  DashboardStatCard,
} from "@/components/dashboard/page-primitives";

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
  const teamMemberLimit = getTeamMemberLimitForUser(business, isAdmin);
  const orderCountThisMonth = await getCurrentMonthOrderUsage();
  const remainingMonthlyOrders = getRemainingMonthlyOrders(business, orderCountThisMonth);
  const teamSeatsUsed = teamMembers.filter((member) => member.role !== "owner").length;
  const canManageTeam = Boolean(isAdmin || isBusinessOwner);
  const unlockedFeatures = [
    { label: "Orders", allowed: canAccessDashboardFeatureForUser("orders", business, isAdmin) },
    { label: "Customers", allowed: canAccessDashboardFeatureForUser("customers", business, isAdmin) },
    { label: "Follow-ups", allowed: canAccessDashboardFeatureForUser("followUps", business, isAdmin) },
    { label: "Catalog", allowed: canAccessDashboardFeatureForUser("catalog", business, isAdmin) },
    { label: "Analytics", allowed: canAccessDashboardFeatureForUser("analytics", business, isAdmin) },
    { label: "Account", allowed: canAccessDashboardFeatureForUser("account", business, isAdmin) },
    { label: "Settings", allowed: canAccessDashboardFeatureForUser("settings", business, isAdmin) },
  ];

  return (
    <DashboardPage>
      <DashboardHero
        eyebrow="Account"
        title="Manage your workspace, billing, and team from one place."
        description="This page brings together user identity, business details, billing visibility, and team seats without sending you across multiple admin screens."
        aside={
          <div className="space-y-3">
            <DashboardStatCard label="Current plan" value={getPlanName(effectivePlan)} detail="Billing access and feature level" icon={<CreditCard className="h-5 w-5" />} />
            <DashboardStatCard
              label="Monthly usage"
              value={monthlyOrderLimit === null ? String(orderCountThisMonth) : `${orderCountThisMonth}/${monthlyOrderLimit}`}
              detail={monthlyOrderLimit === null ? "Unlimited plan" : `${remainingMonthlyOrders ?? 0} orders left this month`}
              icon={<Users className="h-5 w-5" />}
            />
          </div>
        }
      />

      {resolvedSearch.team_message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            resolvedSearch.team_status === "success"
              ? "border-primary/20 bg-primary/10 text-primary"
              : "border-[#e9d4d1] bg-[#f9efed] text-[#8f3e36]"
          }`}
        >
          {resolvedSearch.team_message}
        </div>
      ) : null}

      <DashboardInfoGrid columns="three">
        <DashboardStatCard label="Billing status" value={effectivePlan === "free" ? "free" : business?.billing_status ?? "inactive"} detail="Current billing state for this business" icon={<CreditCard className="h-5 w-5" />} />
        <DashboardStatCard label="Team seats" value={teamMemberLimit > 0 ? `${teamSeatsUsed}/${teamMemberLimit}` : "0"} detail={teamMemberLimit > 0 ? "Seats used on this plan" : "Starts on Growth"} icon={<Users className="h-5 w-5" />} />
        <DashboardStatCard label="Latest transaction" value={billingTransaction?.status ?? "none"} detail="Most recent billing transaction status" icon={<Coins className="h-5 w-5" />} />
      </DashboardInfoGrid>

      <section className="grid gap-4 xl:grid-cols-2">
        <DashboardPanel>
          <DashboardPanelHeader
            eyebrow="User"
            title="User profile"
            description="Information for the currently signed-in user."
          />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-secondary/50 p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <UserCircle2 className="h-4 w-4" />
                <p className="text-xs">Full name</p>
              </div>
              <p className="mt-2 font-medium text-foreground">{profile?.full_name ?? "Not set"}</p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/50 p-4">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="mt-2 font-medium text-foreground">{profile?.email ?? user?.email ?? "Not set"}</p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/50 p-4 md:col-span-2">
              <p className="text-xs text-muted-foreground">User ID</p>
              <p className="mt-2 break-all text-sm font-medium text-foreground">{user?.id ?? "Not available"}</p>
            </div>
          </div>
        </DashboardPanel>

        <DashboardPanel>
          <DashboardPanelHeader
            eyebrow="Workspace"
            title="Business profile"
            description="The business currently connected to this account."
          />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-secondary/50 p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <p className="text-xs">Business name</p>
              </div>
              <p className="mt-2 font-medium text-foreground">{business?.name ?? "Not set"}</p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/50 p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <p className="text-xs">Business phone</p>
              </div>
              <p className="mt-2 font-medium text-foreground">{business?.phone ?? "Not set"}</p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/50 p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Palette className="h-4 w-4" />
                <p className="text-xs">Brand color</p>
              </div>
              <p className="mt-2 font-medium text-foreground">{business?.brand_color ?? "#22c55e"}</p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/50 p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Coins className="h-4 w-4" />
                <p className="text-xs">Currency</p>
              </div>
              <p className="mt-2 font-medium text-foreground">{business?.currency ?? "TZS"}</p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/50 p-4 md:col-span-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                <p className="text-xs">Business created</p>
              </div>
              <p className="mt-2 font-medium text-foreground">
                {business?.created_at ? new Date(business.created_at).toLocaleString() : "Not available"}
              </p>
            </div>
          </div>

          <form action={logoutAction} className="mt-5">
            <button className="inline-flex items-center gap-2 rounded-2xl border border-[#e9d4d1] bg-[#f9efed] px-4 py-3 text-sm font-medium text-[#8f3e36] transition hover:bg-[#f3e1de]">
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </DashboardPanel>
      </section>

      <DashboardPanel>
        <DashboardPanelHeader
          eyebrow="Billing"
          title="Plan and billing visibility"
          description="Plan state, allowance, provider reference, and unlocked features."
        />
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border bg-secondary/50 p-4">
            <p className="text-xs text-muted-foreground">Current plan</p>
            <p className="mt-2 font-medium text-foreground">{getPlanName(effectivePlan)}</p>
          </div>
          <div className="rounded-2xl border border-border bg-secondary/50 p-4">
            <p className="text-xs text-muted-foreground">Billing status</p>
            <p className="mt-2 font-medium text-foreground">{effectivePlan === "free" ? "free" : business?.billing_status ?? "inactive"}</p>
          </div>
          <div className="rounded-2xl border border-border bg-secondary/50 p-4">
            <p className="text-xs text-muted-foreground">Paid through</p>
            <p className="mt-2 font-medium text-foreground">
              {business?.billing_current_period_ends_at
                ? new Date(business.billing_current_period_ends_at).toLocaleDateString()
                : "Not available"}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-secondary/50 p-4">
            <p className="text-xs text-muted-foreground">Latest transaction</p>
            <p className="mt-2 font-medium text-foreground">{billingTransaction?.status ?? "None yet"}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(260px,0.9fr)]">
          <div className="rounded-2xl border border-border bg-secondary/50 p-4">
            <p className="text-xs text-muted-foreground">Order allowance this month</p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {monthlyOrderLimit === null
                ? `${orderCountThisMonth} orders used this month. Your plan is unlimited.`
                : `${orderCountThisMonth} of ${monthlyOrderLimit} orders used this month${
                    remainingMonthlyOrders !== null ? ` • ${remainingMonthlyOrders} left` : ""
                  }.`}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-secondary/50 p-4">
            <p className="text-xs text-muted-foreground">Unlocked dashboard features</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {unlockedFeatures.map((feature) => (
                <DashboardBadge key={feature.label} tone={feature.allowed ? "success" : "neutral"}>
                  {feature.label}
                </DashboardBadge>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-secondary/50 p-4">
            <p className="text-xs text-muted-foreground">Provider reference</p>
            <p className="mt-2 break-all text-sm font-medium text-foreground">
              {business?.billing_provider_reference ??
                billingTransaction?.payment_reference ??
                billingTransaction?.session_reference ??
                "Not available"}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-secondary/50 p-4">
          <p className="text-xs text-muted-foreground">What this plan includes</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {PLAN_CONFIG[effectivePlan].features.map((feature) => (
              <DashboardBadge key={feature.label} tone={feature.comingSoon ? "neutral" : "success"}>
                {feature.label}
                {feature.comingSoon ? " (coming soon)" : ""}
              </DashboardBadge>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
          >
            Manage plan on pricing page
          </Link>
        </div>
      </DashboardPanel>

      <DashboardPanel>
        <DashboardPanelHeader
          eyebrow="Team"
          title="Team members"
          description="Growth supports 2 team members. Business supports 5."
        />

        {teamMemberLimit > 0 ? (
          <>
            <div className="mt-5 rounded-2xl border border-border bg-secondary/50 p-4">
              <p className="text-xs text-muted-foreground">Seats used</p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {teamSeatsUsed} of {teamMemberLimit} team seats used on {getPlanName(effectivePlan)}.
              </p>
            </div>

            {canManageTeam ? (
              <form action={addTeamMemberAction} className="mt-4 rounded-2xl border border-border bg-secondary/50 p-4">
                <label className="text-xs text-muted-foreground" htmlFor="team-email">
                  Add member by email
                </label>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    id="team-email"
                    name="email"
                    type="email"
                    required
                    placeholder="seller@example.com"
                    className="min-w-0 flex-1 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/30"
                  />
                  <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white transition hover:bg-[#0a3d2e]">
                    <UserPlus2 className="h-4 w-4" />
                    Add member
                  </button>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  The user must already have a WhatsBoard account before you can add them to your team.
                </p>
              </form>
            ) : null}

            <div className="mt-4 space-y-3">
              {teamMembers.length ? (
                teamMembers.map((member) => (
                  <div
                    key={member.userId}
                    className="flex flex-col gap-3 rounded-2xl border border-border bg-secondary/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{member.fullName || member.email || "Unnamed user"}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{member.email || "No email"}</p>
                      <div className="mt-2">
                        <DashboardBadge tone={member.role === "owner" ? "primary" : "neutral"}>
                          {member.role === "owner" ? "Owner" : "Team member"}
                        </DashboardBadge>
                      </div>
                    </div>

                    {canManageTeam && member.role !== "owner" ? (
                      <form action={removeTeamMemberAction}>
                        <input type="hidden" name="memberId" value={member.userId} />
                        <button className="inline-flex items-center justify-center rounded-2xl border border-[#e9d4d1] bg-card px-4 py-3 text-sm font-medium text-[#8f3e36] transition hover:bg-[#f9efed]">
                          Remove
                        </button>
                      </form>
                    ) : null}
                  </div>
                ))
              ) : (
                <DashboardEmptyState title="No team members yet" description="Add people here when your plan supports seats." />
              )}
            </div>
          </>
        ) : (
          <DashboardEmptyState
            title="Team members start on Growth"
            description="Upgrade to Growth for 2 team members or Business for 5."
            action={
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
              >
                Upgrade on pricing page
              </Link>
            }
          />
        )}
      </DashboardPanel>
    </DashboardPage>
  );
}
