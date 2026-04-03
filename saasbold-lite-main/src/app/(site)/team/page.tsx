import { Users } from "lucide-react";
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
import { resolveLegacyBusinessIdForRequest } from "@/lib/repositories/supabase-legacy-repository";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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

export default async function TeamPage() {
  const businessId = await resolveLegacyBusinessIdForRequest();
  const client = createSupabaseServiceClient();

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

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title="Team"
        description="Team membership and role visibility for your seller operation."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <KpiCard
          label="Team members"
          value={String(members.length)}
          detail="Total active user memberships linked to this business."
          accent={<Users className="h-5 w-5" />}
        />
        <KpiCard
          label="Owner/Admin"
          value={String(ownerCount + adminCount)}
          detail={`${ownerCount} owner, ${adminCount} admin`}
          accent={<Users className="h-5 w-5" />}
        />
        <KpiCard
          label="Members"
          value={String(memberCount)}
          detail="Standard members currently assigned."
          accent={<Users className="h-5 w-5" />}
        />
      </section>

      <SectionCard
        title="Member list"
        description="Live team list from Supabase membership records."
      >
        {members.length ? (
          <>
            <div className="hidden md:block">
              <DataTable headers={["Name", "Contact", "Role", "Joined"]}>
                {members.map((member) => {
                  const profile = profileMap.get(member.user_id);
                  const nameLabel =
                    profile?.full_name || profile?.email || "Team member";
                  return (
                    <DataRow key={member.id}>
                      <DataCell>
                        <p className="font-semibold text-[var(--color-wb-text)]">
                          {nameLabel}
                        </p>
                        <p className="mt-1 text-xs text-[var(--color-wb-text-muted)]">
                          Workspace member
                        </p>
                      </DataCell>
                      <DataCell>
                        {(profile?.email || "No email") +
                          (profile?.phone ? ` • ${profile.phone}` : "")}
                      </DataCell>
                      <DataCell>
                        <span className="rounded-full border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] px-3 py-1 text-xs font-semibold capitalize text-[var(--color-wb-text-muted)]">
                          {member.role || "member"}
                        </span>
                      </DataCell>
                      <DataCell>
                        {member.created_at
                          ? formatDate(member.created_at)
                          : "N/A"}
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
                  profile?.full_name || profile?.email || "Team member";
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
                          {profile?.email || "No email"}
                        </p>
                        {profile?.phone ? (
                          <p className="mt-1 text-xs text-[var(--color-wb-text-muted)]">
                            {profile.phone}
                          </p>
                        ) : null}
                      </div>
                      <span className="rounded-full border border-[var(--color-wb-border)] bg-white px-3 py-1 text-xs font-semibold capitalize text-[var(--color-wb-text-muted)]">
                        {member.role || "member"}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-[var(--color-wb-text-muted)]">
                      Joined{" "}
                      {member.created_at
                        ? formatDate(member.created_at)
                        : "N/A"}
                    </p>
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          <EmptyState
            title="No team members yet"
            detail="Only your account is currently linked. Invite flow can attach more members."
          />
        )}
      </SectionCard>
    </div>
  );
}
