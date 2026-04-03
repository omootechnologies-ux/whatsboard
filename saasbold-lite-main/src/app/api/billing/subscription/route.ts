import { NextResponse } from "next/server";
import {
  BillingConstraintError,
  getBusinessMemberRole,
  updateBusinessSubscriptionPlan,
} from "@/lib/billing/subscription";
import { parseBillingPlan } from "@/lib/billing/plans";
import { resolveLegacyBusinessContextForRequest } from "@/lib/repositories/supabase-legacy-repository";

function redirectToBilling(request: Request, query: string) {
  return NextResponse.redirect(new URL(`/billing${query}`, request.url), 303);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const targetPlan = parseBillingPlan(String(formData.get("plan") || ""));

  try {
    const context = await resolveLegacyBusinessContextForRequest();
    const role = await getBusinessMemberRole(context.businessId, context.userId);

    if (role !== "owner" && role !== "admin") {
      return redirectToBilling(request, "?error=forbidden");
    }

    await updateBusinessSubscriptionPlan({
      businessId: context.businessId,
      actorUserId: context.userId,
      targetPlan,
      source: "billing",
    });

    return redirectToBilling(
      request,
      `?updated=1&plan=${encodeURIComponent(targetPlan)}`,
    );
  } catch (error) {
    if (
      error instanceof BillingConstraintError &&
      error.code === "DOWNGRADE_BLOCKED_BY_TEAM_SIZE"
    ) {
      return redirectToBilling(
        request,
        `?error=team-limit&plan=${encodeURIComponent(targetPlan)}`,
      );
    }

    return redirectToBilling(
      request,
      `?error=persistence&plan=${encodeURIComponent(targetPlan)}`,
    );
  }
}
