import Link from "next/link";
import { Coins, CreditCard, ReceiptText, ShieldCheck, Users } from "lucide-react";
import { getAccountData, getCurrentMonthOrderUsage } from "@/lib/queries";
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
  DashboardActionLink,
  DashboardBadge,
  DashboardHero,
  DashboardInfoGrid,
  DashboardPage,
  DashboardPanel,
  DashboardPanelHeader,
  DashboardStatCard,
} from "@/components/dashboard/page-primitives";
import { formatTZS } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BillingPage() {
  const { business, billingTransaction, isAdmin, teamMembers } = await getAccountData();
  const effectivePlan = getEffectivePlanKey(business);
  const monthlyOrderLimit = getMonthlyOrderLimit(business);
  const orderCountThisMonth = await getCurrentMonthOrderUsage();
  const remainingMonthlyOrders = getRemainingMonthlyOrders(business, orderCountThisMonth);
  const teamMemberLimit = getTeamMemberLimitForUser(business, isAdmin);
  const teamSeatsUsed = teamMembers.filter((member) => member.role !== "owner").length;
  const unlockedFeatures = [
    { label: "Orders", allowed: canAccessDashboardFeatureForUser("orders", business, isAdmin) },
    { label: "Customers", allowed: canAccessDashboardFeatureForUser("customers", business, isAdmin) },
    { label: "Follow-ups", allowed: canAccessDashboardFeatureForUser("followUps", business, isAdmin) },
    { label: "Catalog", allowed: canAccessDashboardFeatureForUser("catalog", business, isAdmin) },
    { label: "Analytics", allowed: canAccessDashboardFeatureForUser("analytics", business, isAdmin) },
    { label: "Team", allowed: true },
    { label: "Billing", allowed: true },
    { label: "Settings", allowed: canAccessDashboardFeatureForUser("settings", business, isAdmin) },
  ];

  return (
    <DashboardPage>
      <DashboardHero
        eyebrow="Billing"
        title="Keep plan, usage, and billing state clear and easy to trust."
        description="See what plan the workspace is on, how much capacity is left, and the latest payment record without mixing that information into team or profile settings."
        actions={
          <>
            <DashboardActionLink href="/pricing" tone="primary">
              Manage plan
            </DashboardActionLink>
            <DashboardActionLink href="/dashboard/settings">Open settings</DashboardActionLink>
          </>
        }
        aside={
          <div className="grid gap-3">
            <DashboardStatCard
              label="Current plan"
              value={getPlanName(effectivePlan)}
              detail="Feature level currently active on this workspace"
              icon={<CreditCard className="h-5 w-5" />}
            />
            <DashboardStatCard
              label="Billing status"
              value={effectivePlan === "free" ? "free" : business?.billing_status ?? "inactive"}
              detail="Latest known plan state"
              icon={<ShieldCheck className="h-5 w-5" />}
            />
          </div>
        }
      />

      <DashboardInfoGrid columns="three">
        <DashboardStatCard
          label="Order allowance"
          value={monthlyOrderLimit === null ? "Unlimited" : `${orderCountThisMonth}/${monthlyOrderLimit}`}
          detail={
            monthlyOrderLimit === null
              ? "This plan does not cap monthly order creation."
              : `${remainingMonthlyOrders ?? 0} orders left this month`
          }
          icon={<ReceiptText className="h-5 w-5" />}
        />
        <DashboardStatCard
          label="Team seats"
          value={teamMemberLimit > 0 ? `${teamSeatsUsed}/${teamMemberLimit}` : "0"}
          detail={teamMemberLimit > 0 ? "Seats available on this plan" : "Team starts on Growth"}
          icon={<Users className="h-5 w-5" />}
        />
        <DashboardStatCard
          label="Latest payment"
          value={billingTransaction?.status ?? "none"}
          detail={billingTransaction ? formatTZS(Number(billingTransaction.amount ?? 0)) : "No billing transaction yet"}
          icon={<Coins className="h-5 w-5" />}
        />
      </DashboardInfoGrid>

      <DashboardPanel>
        <DashboardPanelHeader
          eyebrow="Plan summary"
          title="Current plan and usage"
          description="A clean summary of what this workspace gets right now."
        />
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoTile label="Plan" value={getPlanName(effectivePlan)} />
          <InfoTile label="Billing status" value={effectivePlan === "free" ? "free" : business?.billing_status ?? "inactive"} />
          <InfoTile
            label="Renews / ends"
            value={
              business?.billing_current_period_ends_at
                ? new Date(business.billing_current_period_ends_at).toLocaleDateString()
                : "Not available"
            }
          />
          <InfoTile
            label="Provider reference"
            value={
              business?.billing_provider_reference ??
              billingTransaction?.payment_reference ??
              billingTransaction?.session_reference ??
              "Not available"
            }
            breakWords
          />
        </div>
      </DashboardPanel>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <DashboardPanel>
          <DashboardPanelHeader
            eyebrow="Workspace access"
            title="Features unlocked on this plan"
            description="Everything the current workspace can access right now."
          />
          <div className="mt-5 flex flex-wrap gap-2">
            {unlockedFeatures.map((feature) => (
              <DashboardBadge key={feature.label} tone={feature.allowed ? "success" : "neutral"}>
                {feature.label}
              </DashboardBadge>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-border bg-secondary/50 p-4">
            <p className="text-xs text-muted-foreground">Plan details</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {PLAN_CONFIG[effectivePlan].features.map((feature) => (
                <DashboardBadge key={feature.label} tone={feature.comingSoon ? "neutral" : "primary"}>
                  {feature.label}
                  {feature.comingSoon ? " (coming soon)" : ""}
                </DashboardBadge>
              ))}
            </div>
          </div>
        </DashboardPanel>

        <DashboardPanel>
          <DashboardPanelHeader
            eyebrow="Payments"
            title="Latest transaction"
            description="Current billing transaction detail from the live system."
          />
          <div className="mt-5 grid gap-4">
            <InfoTile label="Status" value={billingTransaction?.status ?? "No transaction yet"} />
            <InfoTile
              label="Amount"
              value={billingTransaction ? formatTZS(Number(billingTransaction.amount ?? 0)) : "Not available"}
            />
            <InfoTile
              label="Paid at"
              value={billingTransaction?.paid_at ? new Date(billingTransaction.paid_at).toLocaleString() : "Not paid yet"}
            />
            {billingTransaction?.checkout_url ? (
              <Link
                href={billingTransaction.checkout_url}
                target="_blank"
                className="inline-flex items-center justify-center rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
              >
                Open latest checkout
              </Link>
            ) : null}
          </div>
        </DashboardPanel>
      </section>
    </DashboardPage>
  );
}

function InfoTile({
  label,
  value,
  breakWords = false,
}: {
  label: string;
  value: string;
  breakWords?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/50 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-2 font-medium text-foreground ${breakWords ? "break-all text-sm" : ""}`}>{value}</p>
    </div>
  );
}
