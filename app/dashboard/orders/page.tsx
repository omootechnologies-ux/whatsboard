import Link from "next/link";
import { getDashboardData } from "@/lib/queries";
import { formatTZS } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OrdersPage() {
  const { orders } = await getDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Orders</h2>
        <p className="mt-2 text-slate-300">
          Search, filter, and update the orders that started in chat.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-slate-400">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Area</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Payment</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-white/5 last:border-none">
                <td className="px-4 py-3">
                  <Link href={`/dashboard/orders/${order.id}`} className="hover:text-emerald-300">
                    {order.customerName}
                  </Link>
                </td>
                <td className="px-4 py-3">{order.product}</td>
                <td className="px-4 py-3">{order.area}</td>
                <td className="px-4 py-3">{formatTZS(order.amount)}</td>
                <td className="px-4 py-3">{order.stage}</td>
                <td className="px-4 py-3">{order.paymentStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
