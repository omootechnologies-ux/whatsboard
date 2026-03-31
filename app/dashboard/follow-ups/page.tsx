import Link from "next/link";
import { Pencil } from "lucide-react";
import { getFollowUpsData } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FollowUpsPage() {
  const followUps = await getFollowUpsData();

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-600">Follow-ups</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Follow-up page</h1>
        <p className="mt-2 text-sm text-slate-500">
          All follow-ups linked to orders appear here.
        </p>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Product</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Area</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Note</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Status</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {followUps.length > 0 ? (
                followUps.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-4 font-semibold text-slate-900">{item.customerName}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{item.phone || "—"}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{item.product || "—"}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{item.area || "—"}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{item.note || "—"}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      {item.completed ? "Completed" : "Pending"}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/dashboard/follow-ups/${item.id}/edit`}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">
                    No follow-ups found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
