import Link from "next/link";
import { Mail, ShieldCheck, UserPlus2, Users } from "lucide-react";
import { addTeamMemberAction, removeTeamMemberAction } from "@/app/dashboard/actions";
import { getAccountData } from "@/lib/queries";
import { getEffectivePlanKey, getPlanName, getTeamMemberLimitForUser } from "@/lib/plan-access";
import {
  DashboardActionLink,
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

export default async function TeamPage({
  searchParams,
}: {
  searchParams?: Promise<{ team_status?: string; team_message?: string }>;
}) {
  const resolvedSearch = (await searchParams) ?? {};
  const { isAdmin, isBusinessOwner, teamMembers, business } = await getAccountData();
  const effectivePlan = getEffectivePlanKey(business);
  const teamMemberLimit = getTeamMemberLimitForUser(business, isAdmin);
  const teamSeatsUsed = teamMembers.filter((member) => member.role !== "owner").length;
  const canManageTeam = Boolean(isAdmin || isBusinessOwner);

  return (
    <DashboardPage>
      <DashboardHero
        eyebrow="Team"
        title="Manage team access without mixing it into billing or settings."
        description="This page keeps seat management, member visibility, and invite actions in one administrative workspace."
        actions={
          <>
            <DashboardActionLink href="/dashboard/billing">View billing</DashboardActionLink>
            <DashboardActionLink href="/dashboard/settings">Workspace settings</DashboardActionLink>
          </>
        }
        aside={
          <div className="grid gap-3">
            <DashboardStatCard
              label="Current plan"
              value={getPlanName(effectivePlan)}
              detail="Team seats depend on your current plan"
              icon={<ShieldCheck className="h-5 w-5" />}
            />
            <DashboardStatCard
              label="Seats used"
              value={teamMemberLimit > 0 ? `${teamSeatsUsed}/${teamMemberLimit}` : "0"}
              detail={teamMemberLimit > 0 ? "Member seats currently used" : "Upgrade to Growth to invite team members"}
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
        <DashboardStatCard
          label="Owners/admins"
          value={String(teamMembers.filter((member) => member.role === "owner").length)}
          detail="Workspace owners with full control"
          icon={<ShieldCheck className="h-5 w-5" />}
        />
        <DashboardStatCard
          label="Members"
          value={String(teamSeatsUsed)}
          detail="Invited team members currently active"
          icon={<Users className="h-5 w-5" />}
        />
        <DashboardStatCard
          label="Seat limit"
          value={teamMemberLimit > 0 ? String(teamMemberLimit) : "0"}
          detail={teamMemberLimit > 0 ? "Available on this plan" : "Starts on Growth"}
          icon={<Mail className="h-5 w-5" />}
        />
      </DashboardInfoGrid>

      {teamMemberLimit > 0 && canManageTeam ? (
        <DashboardPanel>
          <DashboardPanelHeader
            eyebrow="Invite"
            title="Add team member"
            description="The user must already have a Folapp account before you can add them."
          />
          <form action={addTeamMemberAction} className="mt-5 rounded-2xl border border-border bg-secondary/50 p-4">
            <label className="form-field">
              <span className="form-label">Team member email</span>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="seller@example.com"
                  className="form-input min-w-0 flex-1"
                />
                <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0a3d2e]">
                  <UserPlus2 className="h-4 w-4" />
                  Invite member
                </button>
              </div>
            </label>
          </form>
        </DashboardPanel>
      ) : null}

      <DashboardPanel>
        <DashboardPanelHeader
          eyebrow="Members"
          title="Team list"
          description="Everyone currently attached to this workspace."
        />

        {teamMemberLimit > 0 ? (
          <div className="mt-5 space-y-3">
            {teamMembers.length ? (
              teamMembers.map((member) => (
                <div
                  key={member.userId}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-secondary/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{member.fullName || member.email || "Unnamed user"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{member.email || "No email"}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <DashboardBadge tone={member.role === "owner" ? "primary" : "neutral"}>
                        {member.role === "owner" ? "Owner" : "Team member"}
                      </DashboardBadge>
                      {member.createdAt ? (
                        <DashboardBadge tone="neutral">
                          Joined {new Date(member.createdAt).toLocaleDateString()}
                        </DashboardBadge>
                      ) : null}
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
              <DashboardEmptyState
                title="No team members yet"
                description="Invite people here when your plan supports seats."
              />
            )}
          </div>
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
