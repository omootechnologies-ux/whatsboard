import { StatCard } from "@/components/dashboard/stat-card";
import { KanbanBoard } from "@/components/dashboard/kanban-board";
import { formatTZS } from "@/lib/utils";
import { getDashboardData } from "@/lib/queries";
import { OrderForm } from "@/components/forms/order-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const { orders, metrics } = await getDashboardData();

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold">Overview</h2>
        <p className="mt-2 text-slate-300">
          See what is paid, stuck, delayed, and ready for follow-up.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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

      <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="mb-4">
          <h3 className="text-xl font-semibold">Create new order</h3>
          <p className="mt-1 text-sm text-slate-400">
            Capture the order before it gets lost in chat.
          </p>
        </div>
        <OrderForm />
      </section>

      <section>
        <KanbanBoard orders={orders} />
      </section>
    </div>
  );
}
