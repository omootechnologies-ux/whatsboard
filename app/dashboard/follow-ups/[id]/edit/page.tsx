import Link from "next/link";
import { notFound } from "next/navigation";
import { getDashboardWriteAccess, requireDashboardFeatureAccess } from "@/lib/dashboard-access";
import { getViewerContext } from "@/lib/queries";
import { updateFollowUpAction } from "@/app/dashboard/actions";
import EditFollowUpForm from "@/components/forms/edit-follow-up-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditFollowUpPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireDashboardFeatureAccess("followUps");
  const { canManageRecords } = await getDashboardWriteAccess();
  const { supabase, businessId } = await getViewerContext();
  const { id } = await params;

  if (!businessId) notFound();

  const { data: followUp } = await supabase
    .from("follow_ups")
    .select("id, due_at, note, completed")
    .eq("business_id", businessId)
    .eq("id", id)
    .maybeSingle();

  if (!followUp) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-600">Follow-ups</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Edit follow-up</h1>
        </div>
        <Link
          href="/dashboard/follow-ups"
          className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Back
        </Link>
      </div>

      <EditFollowUpForm followUp={followUp} action={updateFollowUpAction.bind(null, followUp.id)} canManageRecords={canManageRecords} />
    </div>
  );
}
