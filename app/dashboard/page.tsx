import Link from "next/link";
import { Plus } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { KanbanBoard } from "@/components/dashboard/kanban-board";
import { formatTZS } from "@/lib/utils";
import { getDashboardData } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const { orders, metrics } = await getDashboardData();

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Overview</h2>
          <p className="mt-2 text-slate-600">
            See what is paid, stuck, delayed, and ready for follow-up.
          </p>
        </div>

        <Link
          href="/dashboard/orders/new"
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-emerald-600"
        >
          <Plus className="h-4 w-4" />
          Create Order
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Orders today"
          value={String(metrics?.totalOrders ?? 0)}
          hint="Tracked from chat to cash"
        />
        <StatCard
          label="Paid orders"
          value={String(metrics?.paidOrders ?? 0)}
          hint="Confirmed and moving"
        />
        <StatCard
          label="Unpaid orders"
          value={String(metrics?.unpaidOrders ?? 0)}
          hint="Needs follow-up"
        />
        <StatCard
          label="Unpaid value"
          value={formatTZS(metrics?.unpaidValue ?? 0)}
          hint="Money still stuck"
        />
      </section>

      <section>
        <KanbanBoard orders={orders} />
      </section>
    </div>
  );
}
