import Link from "next/link";
import { BarChart3, LayoutDashboard, Settings, ShoppingBag, Users } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings }
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="container-pad flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600">WHATSBOARD</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Control your WhatsApp sales</h1>
            <p className="mt-1 text-sm text-slate-500">Less confusion. Better follow-up. More paid orders.</p>
          </div>

          <nav className="flex flex-wrap gap-2">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:text-slate-900 hover:shadow-sm"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <main className="container-pad pb-12 pt-8">{children}</main>
    </div>
  );
}
