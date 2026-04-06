import { Users } from "lucide-react";
import { getLocale } from "next-intl/server";
import {
  DataCell,
  DataRow,
  DataTable,
  EmptyState,
  KpiCard,
  PageHeader,
  SectionCard,
} from "@/components/whatsboard-dashboard/dashboard-ui";
import { formatDate } from "@/components/whatsboard-dashboard/formatting";
import { getBusinessBillingState } from "@/lib/billing/subscription";
import { resolveLegacyBusinessIdForRequest } from "@/lib/repositories/supabase-legacy-repository";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { translateUiText } from "@/lib/ui-translations";

export const dynamic = "force-dynamic";

type TeamSearchParams = Promise<{
  invited?: string;
  updated?: string;
  removed?: string;
  error?: string;
}>;

type TeamMemberRow = {
  id: string;
  business_id: string;
  user_id: string;
  role: string | null;
  created_at: string | null;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
};

function teamFlashMessage(
  query: Awaited<TeamSearchParams>,
  tr: (value: string) => string,
) {
  if (query.invited === "1") {
    return {
      tone: "success" as const,
      text: tr("Team member added successfully."),
    };
  }
  if (query.updated === "1") {
    return {
      tone: "success" as const,
      text: tr("Team member role updated successfully."),
    };
  }
  if (query.removed === "1") {
    return {
      tone: "success" as const,
      text: tr("Team member removed successfully."),
    };
  }

  if (query.error === "team-limit") {
    return {
      tone: "danger" as const,
      text: tr(
        "Team member limit reached for your current plan. Upgrade to add more members.",
      ),
    };
  }
  if (query.error === "user-not-found") {
    return {
      tone: "danger" as const,
      text: tr("No account found with that email. Ask the user to sign up first."),
    };
  }
  if (query.error === "already-in-another-business") {
    return {
      tone: "danger" as const,
      text: tr("That user already belongs to another business workspace."),
    };
  }
  if (query.error === "owner-protected") {
    return {
      tone: "danger" as const,
      text: tr("Owner membership cannot be removed."),
    };
  }
  if (query.error === "forbidden") {
    return {
      tone: "danger" as const,
      text: tr("Only owner/admin can manage team membership."),
    };
  }
  if (query.error) {
    return {
      tone: "danger" as const,
      text: tr("Team action failed. Please try again."),
    };
  }

  return null;
}

export default async function TeamPage({
  searchParams,
}: {
  searchParams: TeamSearchParams;
}) {
  const query = await searchParams;
  const locale = await getLocale();
  const tr = (value: string) => translateUiText(value, locale as "en" | "sw");
  const businessId = await resolveLegacyBusinessIdForRequest();
  const client = createSupabaseServiceClient();
  const billingState = await getBusinessBillingState(businessId, client);
  const flash = teamFlashMessage(query, tr);

  const { data: membersData, error: membersError } = await client
    .from("business_members")
    .select("id,business_id,user_id,role,created_at")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true });

  if (membersError) {
    throw new Error(
      `Failed to load team members: ${JSON.stringify(membersError)}`,
    );
  }

  const members = (membersData || []) as TeamMemberRow[];
  const memberUserIds = Array.from(
    new Set(members.map((member) => member.user_id)),
  );

  let profileMap = new Map<string, ProfileRow>();
  if (memberUserIds.length) {
    const { data: profileRows, error: profilesError } = await client
      .from("profiles")
      .select("id,full_name,email,phone")
      .in("id", memberUserIds);
    if (profilesError) {
      throw new Error(
        `Failed to load profile rows: ${JSON.stringify(profilesError)}`,
      );
    }
    profileMap = new Map(
      ((profileRows || []) as ProfileRow[]).map((profile) => [
        profile.id,
        profile,
      ]),
    );
  }

  const ownerCount = members.filter((member) => member.role === "owner").length;
  const adminCount = members.filter((member) => member.role === "admin").length;
  const memberCount = members.filter(
    (member) => member.role !== "owner" && member.role !== "admin",
  ).length;
  const teamLimitReached =
    billingState.teamMemberCount >= billingState.teamMemberLimit;

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title={tr("Team")}
        description={tr("Invite and manage team members with plan-based seat limits.")}
      />

      {flash ? (
        <div
          className={`rounded-2xl border p-4 text-sm ${
            flash.tone === "success"
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
              : "border-rose-100 bg-rose-50 text-rose-700"
          }`}
        >
          {flash.text}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        <KpiCard
          label={tr("Team members")}
          value={String(members.length)}
          detail={tr("Total active user memberships linked to this business.")}
          accent={<Users className="h-5 w-5" />}
        />
        <KpiCard
          label={tr("Owner/Admin")}
          value={String(ownerCount + adminCount)}
          detail={`${ownerCount} ${tr("owner")}, ${adminCount} ${tr("admin")}`}
          accent={<Users className="h-5 w-5" />}
        />
        <KpiCard
          label={tr("Members")}
          value={String(memberCount)}
          detail={tr("Standard members currently assigned.")}
          accent={<Users className="h-5 w-5" />}
        />
        <KpiCard
          label={tr("Plan seat limit")}
          value={`${billingState.teamMemberCount}/${billingState.teamMemberLimit}`}
          detail={`${billingState.plan.toUpperCase()} ${tr("plan capacity")}`}
          accent={<Users className="h-5 w-5" />}
        />
      </section>

      <SectionCard
        title={tr("Invite team member")}
        description={tr(
          "Add an existing Folapp user by email. Seat limits are enforced by plan.",
        )}
      >
        {teamLimitReached ? (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {tr("Team limit reached for")} {billingState.plan.toUpperCase()} (
            {billingState.teamMemberLimit} members). Upgrade your plan in Billing
            {" "}
            {tr("to invite more members.")}
          </div>
        ) : null}

        <form
          action="/api/team/invite"
          method="post"
          className="grid gap-4 md:grid-cols-[1.4fr_0.8fr_auto]"
        >
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              {tr("Team member email")}
            </span>
            <input
              name="email"
              type="email"
              required
              placeholder="teammate@business.com"
              className="wb-input"
              disabled={teamLimitReached}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              {tr("Role")}
            </span>
            <select
              name="role"
              className="wb-input"
              defaultValue="member"
              disabled={teamLimitReached}
            >
              <option value="member">{tr("Member")}</option>
              <option value="admin">{tr("Admin")}</option>
            </select>
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              className="wb-button-primary w-full justify-center sm:w-auto"
              disabled={teamLimitReached}
            >
              {tr("Invite")}
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard
        title={tr("Member list")}
        description={tr("Live team list from Supabase membership records.")}
      >
        {members.length ? (
          <>
            <div className="hidden md:block">
              <DataTable
                headers={[
                  tr("Name"),
                  tr("Contact"),
                  tr("Role"),
                  tr("Joined"),
                  tr("Action"),
                ]}
              >
                {members.map((member) => {
                  const profile = profileMap.get(member.user_id);
                  const nameLabel =
                    profile?.full_name || profile?.email || tr("Team member");
                  const isOwner = member.role === "owner";
                  return (
                    <DataRow key={member.id}>
                      <DataCell>
                        <p className="font-semibold text-[var(--color-wb-text)]">
                          {nameLabel}
                        </p>
                        <p className="mt-1 text-xs text-[var(--color-wb-text-muted)]">
                          {tr("Workspace member")}
                        </p>
                      </DataCell>
                      <DataCell>
                        {(profile?.email || tr("No email")) +
                          (profile?.phone ? ` • ${profile.phone}` : "")}
                      </DataCell>
                      <DataCell>
                        <span className="rounded-full border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] px-3 py-1 text-xs font-semibold capitalize text-[var(--color-wb-text-muted)]">
                          {member.role || tr("member")}
                        </span>
                      </DataCell>
                      <DataCell>
                        {member.created_at
                          ? formatDate(member.created_at)
                          : tr("N/A")}
                      </DataCell>
                      <DataCell>
                        {isOwner ? (
                          <span className="text-xs text-[var(--color-wb-text-muted)]">
                            {tr("Owner")}
                          </span>
                        ) : (
                          <form action="/api/team/remove" method="post">
                            <input type="hidden" name="memberId" value={member.id} />
                            <button
                              type="submit"
                              className="text-sm font-semibold text-rose-600 hover:underline"
                            >
                              {tr("Remove")}
                            </button>
                          </form>
                        )}
                      </DataCell>
                    </DataRow>
                  );
                })}
              </DataTable>
            </div>

            <div className="space-y-3 md:hidden">
              {members.map((member) => {
                const profile = profileMap.get(member.user_id);
                const nameLabel =
                  profile?.full_name || profile?.email || tr("Team member");
                const isOwner = member.role === "owner";
                return (
                  <article
                    key={member.id}
                    className="rounded-[22px] border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--color-wb-text)]">
                          {nameLabel}
                        </p>
                        <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
                          {profile?.email || tr("No email")}
                        </p>
                        {profile?.phone ? (
                          <p className="mt-1 text-xs text-[var(--color-wb-text-muted)]">
                            {profile.phone}
                          </p>
                        ) : null}
                      </div>
                      <span className="rounded-full border border-[var(--color-wb-border)] bg-white px-3 py-1 text-xs font-semibold capitalize text-[var(--color-wb-text-muted)]">
                        {member.role || tr("member")}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-xs text-[var(--color-wb-text-muted)]">
                        {tr("Joined")}{" "}
                        {member.created_at
                          ? formatDate(member.created_at)
                          : tr("N/A")}
                      </p>
                      {isOwner ? (
                        <span className="text-xs text-[var(--color-wb-text-muted)]">
                          {tr("Owner")}
                        </span>
                      ) : (
                        <form action="/api/team/remove" method="post">
                          <input type="hidden" name="memberId" value={member.id} />
                          <button
                            type="submit"
                            className="text-xs font-semibold uppercase tracking-[0.12em] text-rose-600"
                          >
                            {tr("Remove")}
                          </button>
                        </form>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          <EmptyState
            title={tr("No team members yet")}
            detail={tr(
              "Only your account is currently linked. Invite another existing user to collaborate.",
            )}
          />
        )}
      </SectionCard>
    </div>
  );
}
