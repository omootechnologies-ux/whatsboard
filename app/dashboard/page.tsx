import Link from "next/link";
import { BarChart3, BellRing, Plus, Settings, ShoppingBag, UserCircle2, Users } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { KanbanBoard } from "@/components/dashboard/kanban-board";
import { formatTZS } from "@/lib/utils";
import { getDashboardData } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const tools = [
  { href: "/dashboard/orders/new", label: "Create Order", icon: Plus, tone: "bg-emerald-50 text-emerald-700" },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag, tone: "bg-slate-100 text-slate-700" },
  { href: "/dashboard/customers", label: "Customers", icon: Users, tone: "bg-slate-100 text-slate-700" },
  { href: "/dashboard/follow-ups", label: "Follow-ups", icon: BellRing, tone: "bg-slate-100 text-slate-700" },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, tone: "bg-slate-100 text-slate-700" },
  { href: "/dashboard/account", label: "Account", icon: UserCircle2, tone: "bg-slate-100 text-slate-700" },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, tone: "bg-slate-100 text-slate-700" }
];

export default async function DashboardPage() {
  const { orders, metrics } = await getDashboardData();

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Overview</h2>
          <p className="mt-2 text-slate-600">
            Your complete operational dashboard for orders, customers, follow-ups, analytics, account, and settings.
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

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-slate-900">Dashboard tools</h3>
          <p className="mt-1 text-sm text-slate-500">
            Jump into each working part of the dashboard.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-1 hover:bg-white hover:shadow-md"
              >
                <div className={`mb-4 inline-flex rounded-2xl p-3 ${tool.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-slate-900">{tool.label}</h4>
                <p className="mt-1 text-sm text-slate-500">Open {tool.label.toLowerCase()}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <KanbanBoard orders={orders} />
      </section>
    </div>
  );
}
