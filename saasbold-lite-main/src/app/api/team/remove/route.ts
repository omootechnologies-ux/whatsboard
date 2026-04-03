import { NextResponse } from "next/server";
import { getBusinessMemberRole } from "@/lib/billing/subscription";
import { resolveLegacyBusinessContextForRequest } from "@/lib/repositories/supabase-legacy-repository";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

function redirectToTeam(request: Request, query: string) {
  return NextResponse.redirect(new URL(`/team${query}`, request.url), 303);
}

type TeamMemberRow = {
  id: string;
  business_id: string;
  user_id: string;
  role: string | null;
};

export async function POST(request: Request) {
  const formData = await request.formData();
  const memberId = String(formData.get("memberId") || "").trim();

  if (!memberId) {
    return redirectToTeam(request, "?error=invalid-member");
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

    const { data: memberRow, error: memberError } = await client
      .from("business_members")
      .select("id,business_id,user_id,role")
      .eq("business_id", context.businessId)
      .eq("id", memberId)
      .maybeSingle();

    if (memberError) {
      throw new Error(
        `Failed to resolve member before removal: ${JSON.stringify(memberError)}`,
      );
    }

    const member = (memberRow || null) as TeamMemberRow | null;
    if (!member) {
      return redirectToTeam(request, "?error=not-found");
    }

    if (member.role === "owner") {
      return redirectToTeam(request, "?error=owner-protected");
    }

    const { error: deleteError } = await client
      .from("business_members")
      .delete()
      .eq("business_id", context.businessId)
      .eq("id", member.id);

    if (deleteError) {
      throw new Error(`Failed to remove member: ${JSON.stringify(deleteError)}`);
    }

    return redirectToTeam(request, "?removed=1");
  } catch {
    return redirectToTeam(request, "?error=persistence");
  }
}
