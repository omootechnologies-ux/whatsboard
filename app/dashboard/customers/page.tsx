export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getCustomersData } from "@/lib/queries";
import { formatTZS } from "@/lib/utils";

export default async function CustomersPage() {
  const customers = await getCustomersData();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Customers</h2>
        <p className="mt-2 text-slate-600">See who buys often, who went quiet, and who needs follow-up.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {customers.map((customer) => (
          <div key={customer.id} className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{customer.name}</h3>
                <p className="text-sm text-slate-500">{customer.phone}</p>
              </div>
              {customer.isRepeat ? <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-xs text-emerald-300">Repeat</span> : null}
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>Area: {customer.area}</p>
              <p>Orders: {customer.orderCount}</p>
              <p>Total spent: {formatTZS(customer.totalSpent)}</p>
              <p>Last order: {new Date(customer.lastOrderDate).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
