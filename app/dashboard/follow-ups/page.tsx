import Link from "next/link";
import { ArrowRight, BellRing, Pencil } from "lucide-react";
import { getFollowUpsData } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FollowUpsPage() {
  const followUps = await getFollowUpsData();
  const pendingCount = followUps.filter((item) => !item.completed).length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#08192d] p-6 text-white shadow-[0_24px_100px_rgba(2,8,23,0.28)] sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-200/80">Follow-ups</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Stay ahead of delayed conversions</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
            Keep polite persistence organized, track pending callbacks, and maintain a clear next-action list on both mobile and desktop.
          </p>
          <Link
            href="/dashboard/orders"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Back to orders
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-7">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <BellRing className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Pending nudges</p>
              <p className="text-xs text-slate-500">Follow-up tasks still waiting</p>
            </div>
          </div>
          <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950">{pendingCount}</h2>
          <p className="mt-2 text-sm text-slate-500">{followUps.length} total follow-ups currently linked to orders.</p>
        </div>
      </section>

      <section className="space-y-4 md:hidden">
        {followUps.length > 0 ? (
          followUps.map((item) => (
            <div key={item.id} className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{item.customerName}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.phone || "—"}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    item.completed ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {item.completed ? "Completed" : "Pending"}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-400">Product</p>
                  <p className="mt-1 text-slate-700">{item.product || "—"}</p>
                </div>
                <div>
                  <p className="text-slate-400">Area</p>
                  <p className="mt-1 text-slate-700">{item.area || "—"}</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Note</p>
                <p className="mt-2 text-sm text-slate-700">{item.note || "—"}</p>
              </div>

              <Link
                href={`/dashboard/follow-ups/${item.id}/edit`}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <Pencil className="h-4 w-4" />
                Edit follow-up
              </Link>
            </div>
          ))
        ) : (
          <div className="rounded-[26px] border border-dashed border-slate-300 bg-white px-4 py-12 text-center text-sm text-slate-500">
            No follow-ups found.
          </div>
        )}
      </section>

      <section className="hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.06)] md:block">
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
