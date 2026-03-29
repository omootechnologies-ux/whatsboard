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

const mainNav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/follow-ups", label: "Follow-ups", icon: BellRing },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/account", label: "Account", icon: UserCircle2 }
];

const footerNav = [{ href: "/dashboard/settings", label: "Settings", icon: Settings }];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="border-b border-slate-200 px-6 py-6">
            <p className="text-sm font-semibold tracking-wide text-emerald-600">WHATSBOARD</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              Control your sales
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Orders, customers, follow-ups, analytics, and account tools in one place.
            </p>
          </div>

          <div className="flex-1 px-4 py-5">
            <nav className="space-y-2">
              {mainNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-slate-200 px-4 py-4">
            <div className="space-y-2">
              {footerNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}

              <form action={logoutAction}>
                <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="border-b border-slate-200 bg-white lg:hidden">
            <div className="container-pad py-5">
              <p className="text-sm font-semibold tracking-wide text-emerald-600">WHATSBOARD</p>
              <h1 className="mt-1 text-xl font-bold text-slate-900">Dashboard</h1>
              <div className="mt-4 flex flex-wrap gap-2">
                {mainNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
                <Link
                  href="/dashboard/settings"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                <form action={logoutAction}>
                  <button className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600">
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          </div>

          <main className="container-pad pb-12 pt-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
