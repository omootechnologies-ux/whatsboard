import Link from "next/link";
import { ArrowRight, MessageCircle, Pencil, Users } from "lucide-react";
import { getCustomersData } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CustomersPage() {
  const customers = await getCustomersData();
  const repeatCustomers = customers.filter((customer) => customer.isRepeat).length;
  const now = Date.now();
  const dormantCustomers = customers.filter((customer) => {
    const lastOrderTime = new Date(customer.lastOrderDate).getTime();
    return Number.isFinite(lastOrderTime) && now - lastOrderTime >= 30 * 24 * 60 * 60 * 1000;
  });

  return (
    <div className="space-y-6">
      <section className="grid gap-4 2xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#08192d] p-6 text-white shadow-[0_24px_100px_rgba(2,8,23,0.28)] sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-200/80">Customers</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Customer relationship board</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
            See who is buying, who is repeating, and jump straight into edits without losing context on smaller screens.
          </p>
          <Link
            href="/dashboard/orders"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Go to orders
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-7">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Customer base</p>
              <p className="text-xs text-slate-500">Saved automatically from active orders</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-[22px] bg-slate-50 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Total</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{customers.length}</p>
            </div>
            <div className="rounded-[22px] bg-slate-50 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Repeat</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{repeatCustomers}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Customer re-engagement</p>
            <p className="mt-1 text-xs text-slate-500">
              Sellers who have not ordered in 30+ days and are ready for a follow-up.
            </p>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            {dormantCustomers.length} dormant customers
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {dormantCustomers.length ? (
            dormantCustomers.slice(0, 6).map((customer) => (
              <div key={customer.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{customer.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Last order {new Date(customer.lastOrderDate).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={`https://wa.me/${encodeURIComponent((customer.phone || "").replace(/[^\d]/g, ""))}?text=${encodeURIComponent(`Hi ${customer.name}, it has been a while since your last order. We have new stock ready for you.`)}`}
                  target="_blank"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
                >
                  <MessageCircle className="h-4 w-4" />
                  Send follow-up
                </a>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
              No dormant customers right now.
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4 md:hidden">
        {customers.length > 0 ? (
          customers.map((customer) => (
            <div key={customer.id} className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{customer.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{customer.phone || "—"}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {customer.status || "active"}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-400">Area</p>
                  <p className="mt-1 text-slate-700">{customer.area || "—"}</p>
                </div>
                <div>
                  <p className="text-slate-400">Orders</p>
                  <p className="mt-1 font-semibold text-slate-900">{customer.orderCount}</p>
                </div>
              </div>

              <Link
                href={`/dashboard/customers/${customer.id}/edit`}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <Pencil className="h-4 w-4" />
                Edit customer
              </Link>
            </div>
          ))
        ) : (
          <div className="rounded-[26px] border border-dashed border-slate-300 bg-white px-4 py-12 text-center text-sm text-slate-500">
            No customers found.
          </div>
        )}
      </section>

      <section className="hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.06)] md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Name</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Area</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Orders</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Status</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-4 font-semibold text-slate-900">{customer.name}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{customer.phone || "—"}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{customer.area || "—"}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{customer.orderCount}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{customer.status || "active"}</td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/dashboard/customers/${customer.id}/edit`}
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
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">
                    No customers found.
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
