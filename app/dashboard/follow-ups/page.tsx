import { completeFollowUpAction } from "@/app/dashboard/actions";
import { getFollowUpsData } from "@/lib/queries";

export default async function FollowUpsPage() {
  const items = await getFollowUpsData();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Follow-up center</h2>
        <p className="mt-2 text-slate-600">See abandoned, pending, and open follow-ups in one place.</p>
      </div>
      <div className="grid gap-4">
        {items.length ? items.map((item) => {
          async function completeAction() {
            "use server";
            await completeFollowUpAction(item.id);
          }
          return (
            <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{item.completed ? "Completed" : "Pending"}</span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">{item.area || "No area"}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{item.customerName}</h3>
                  <p className="text-sm text-slate-600">{item.phone}</p>
                  <p className="text-sm text-slate-700">{item.product}</p>
                  <p className="text-sm text-slate-500">Due: {item.dueAt ? new Date(item.dueAt).toLocaleString() : "No due date"}</p>
                  <p className="text-sm text-slate-600">{item.note || "No note"}</p>
                </div>
                {!item.completed ? (
                  <form action={completeAction}>
                    <button className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-600">Mark complete</button>
                  </form>
                ) : null}
              </div>
            </div>
          );
        }) : <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">No follow-ups yet.</div>}
      </div>
    </div>
  );
}
