import Link from "next/link";
import { Pencil, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type CustomerRow = {
  id: string;
  name: string | null;
  phone: string | null;
  area: string | null;
  channel: string | null;
  notes: string | null;
};

export default async function CustomersPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("customers")
    .select("id, name, phone, area, channel, notes")
    .order("name", { ascending: true });

  const customers = (data ?? []) as CustomerRow[];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-600">Customers</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Manage customers</h1>
          <p className="mt-2 text-sm text-slate-500">
            Open and edit saved customer details directly from this page.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
          <Users className="h-4 w-4" />
          {customers.length} customers
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Name</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Area</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Channel</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Notes</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">{customer.name || "Unnamed customer"}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">{customer.phone || "—"}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{customer.area || "—"}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{customer.channel || "—"}</td>
                    <td className="max-w-[260px] px-4 py-4 text-sm text-slate-500">
                      <span className="line-clamp-2">{customer.notes || "—"}</span>
                    </td>
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
