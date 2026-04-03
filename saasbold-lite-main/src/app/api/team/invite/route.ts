import { NextResponse } from "next/server";
import {
  BillingConstraintError,
  assertTeamInviteAllowedForBusiness,
  getBusinessMemberRole,
} from "@/lib/billing/subscription";
import { resolveLegacyBusinessContextForRequest } from "@/lib/repositories/supabase-legacy-repository";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

function redirectToTeam(request: Request, query: string) {
  return NextResponse.redirect(new URL(`/team${query}`, request.url), 303);
}

type ExistingMemberRow = {
  id: string;
  business_id: string;
  user_id: string;
  role: string | null;
};

type ProfileLookupRow = {
  id: string;
  email: string | null;
  full_name: string | null;
};

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const roleInput = String(formData.get("role") || "member")
    .trim()
    .toLowerCase();
  const role = roleInput === "admin" ? "admin" : "member";

  if (!email || !email.includes("@")) {
    return redirectToTeam(request, "?error=invalid-email");
  }

  try {
    const context = await resolveLegacyBusinessContextForRequest();
    const client = createSupabaseServiceClient();
    const actorRole = await getBusinessMemberRole(
      context.businessId,
      context.userId,
      client,
    );

    if (actorRole !== "owner" && actorRole !== "admin") {
      return redirectToTeam(request, "?error=forbidden");
    }

    const { data: profileRows, error: profileError } = await client
      .from("profiles")
      .select("id,email,full_name")
      .ilike("email", email)
      .limit(1);

    if (profileError) {
      throw new Error(`Profile lookup failed: ${JSON.stringify(profileError)}`);
    }

    const targetProfile = (profileRows?.[0] || null) as ProfileLookupRow | null;
    if (!targetProfile?.id) {
      return redirectToTeam(request, "?error=user-not-found");
    }

    const { data: existingMembershipRows, error: existingMembershipError } =
      await client
        .from("business_members")
        .select("id,business_id,user_id,role")
        .eq("user_id", targetProfile.id)
        .limit(1);

    if (existingMembershipError) {
      throw new Error(
        `Membership lookup failed: ${JSON.stringify(existingMembershipError)}`,
      );
    }

    const existing = (existingMembershipRows?.[0] || null) as
      | ExistingMemberRow
      | null;

    if (existing?.business_id && existing.business_id !== context.businessId) {
      return redirectToTeam(request, "?error=already-in-another-business");
    }

    if (existing?.id && existing.business_id === context.businessId) {
      const { error: updateError } = await client
        .from("business_members")
        .update({
          role,
        })
        .eq("id", existing.id);

      if (updateError) {
        throw new Error(
          `Failed to update existing member role: ${JSON.stringify(updateError)}`,
        );
      }

      return redirectToTeam(request, "?updated=1");
    }

    await assertTeamInviteAllowedForBusiness(context.businessId, client);

    const { error: insertError } = await client.from("business_members").insert({
      business_id: context.businessId,
      user_id: targetProfile.id,
      role,
      invited_by: context.userId,
    });

    if (insertError) {
      throw new Error(`Failed to insert team member: ${JSON.stringify(insertError)}`);
    }

    return redirectToTeam(request, "?invited=1");
  } catch (error) {
    if (
      error instanceof BillingConstraintError &&
      error.code === "TEAM_LIMIT_REACHED"
    ) {
      return redirectToTeam(request, "?error=team-limit");
    }

    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("team member limit reached")
    ) {
      return redirectToTeam(request, "?error=team-limit");
    }

    return redirectToTeam(request, "?error=persistence");
  }
}
