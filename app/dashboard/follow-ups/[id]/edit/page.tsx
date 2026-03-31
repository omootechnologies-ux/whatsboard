import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateFollowUpAction } from "@/app/dashboard/actions";
import EditFollowUpForm from "@/components/forms/edit-follow-up-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditFollowUpPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: followUp, error } = await supabase
    .from("follow_ups")
    .select("id, due_at, note, completed")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !followUp) notFound();

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

      <EditFollowUpForm followUp={followUp} action={updateFollowUpAction.bind(null, followUp.id)} />
    </div>
  );
}
