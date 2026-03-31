import { getCustomersData } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CustomersPage() {
  const customers = await getCustomersData();

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-600">Customers</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Customer page</h1>
        <p className="mt-2 text-sm text-slate-500">
          All customers saved from orders should appear here.
        </p>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Name</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Area</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Orders</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Status</th>
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500">
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
