import Link from "next/link";
import { getDashboardData } from "@/lib/queries";
import { formatTZS } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OrdersPage() {
  const { orders } = await getDashboardData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Orders</h2>
          <p className="mt-2 text-slate-600">
            Search, filter, and update the orders that started in chat.
          </p>
        </div>

        <Link
          href="/dashboard/orders/new"
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-emerald-600"
        >
          Create Order
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Area</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-slate-100 last:border-none">
                  <td className="px-4 py-3 font-medium text-slate-900">{order.customerName}</td>
                  <td className="px-4 py-3 text-slate-700">{order.product}</td>
                  <td className="px-4 py-3 text-slate-600">{order.area}</td>
                  <td className="px-4 py-3 text-emerald-600">{formatTZS(order.amount)}</td>
                  <td className="px-4 py-3 text-slate-700">{order.stage}</td>
                  <td className="px-4 py-3 text-slate-700">{order.paymentStatus}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="inline-flex rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
