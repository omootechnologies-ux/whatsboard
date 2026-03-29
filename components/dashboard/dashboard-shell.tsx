import Link from "next/link";
import {
  BarChart3,
  BellRing,
  LayoutDashboard,
  LogOut,
  Settings,
  ShoppingBag,
  UserCircle2,
  Users
} from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/follow-ups", label: "Follow-ups", icon: BellRing },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/account", label: "Account", icon: UserCircle2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings }
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="container-pad flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600">WHATSBOARD</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Control your WhatsApp sales
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Orders, customers, follow-ups, analytics, account, and settings.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
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

            <form action={logoutAction}>
              <button className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700 transition hover:bg-rose-100">
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>

      <main className="container-pad pb-12 pt-8">{children}</main>
    </div>
  );
}
