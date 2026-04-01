import { notFound } from "next/navigation";
import { ArrowLeft, BellRing, CheckCircle2 } from "lucide-react";
import { getDashboardWriteAccess, requireDashboardFeatureAccess } from "@/lib/dashboard-access";
import { getViewerContext } from "@/lib/queries";
import { updateFollowUpAction } from "@/app/dashboard/actions";
import EditFollowUpForm from "@/components/forms/edit-follow-up-form";
import {
  DashboardActionLink,
  DashboardHero,
  DashboardPage,
  DashboardPanel,
  DashboardPanelHeader,
  DashboardStatCard,
} from "@/components/dashboard/page-primitives";

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
    <DashboardPage>
      <DashboardHero
        eyebrow="Follow-ups"
        title="Edit follow-up task"
        description="Keep reminder timing and completion status clean so the seller always knows the next action."
        actions={
          <DashboardActionLink href="/dashboard/follow-ups">
            <ArrowLeft className="h-4 w-4" />
            Back to follow-ups
          </DashboardActionLink>
        }
        aside={
          <div className="grid gap-3">
            <DashboardStatCard
              label="Current state"
              value={followUp.completed ? "Completed" : "Pending"}
              detail="Completion flag on this reminder"
              icon={<CheckCircle2 className="h-5 w-5" />}
            />
            <DashboardStatCard
              label="Due time"
              value={followUp.due_at ? new Date(followUp.due_at).toLocaleDateString() : "Not set"}
              detail="Current reminder date"
              icon={<BellRing className="h-5 w-5" />}
            />
          </div>
        }
      />

      <DashboardPanel>
        <DashboardPanelHeader
          eyebrow="Reminder form"
          title="Follow-up details"
          description="Edit the due time, note, and completion state in the same dashboard form language as the rest of the app."
        />
        <div className="mt-5">
          <EditFollowUpForm followUp={followUp} action={updateFollowUpAction.bind(null, followUp.id)} canManageRecords={canManageRecords} />
        </div>
      </DashboardPanel>
    </DashboardPage>
  );
}
