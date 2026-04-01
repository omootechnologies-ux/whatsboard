import { NextResponse } from "next/server";
import { canAccessDashboardFeatureForUser } from "@/lib/plan-access";
import { getViewerContext } from "@/lib/queries";
import { getDashboardData } from "@/lib/queries";

export async function GET() {
  const { user, businessId, isAdmin, business } = await getViewerContext();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!businessId) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  if (!isAdmin && !canAccessDashboardFeatureForUser("overview", business, isAdmin)) {
    return NextResponse.json({ error: "Upgrade required" }, { status: 403 });
  }

  const data = await getDashboardData();
  return NextResponse.json(data);
}
