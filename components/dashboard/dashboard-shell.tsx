"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Bell,
  BarChart2,
  Settings,
  Plus,
  LogOut,
  ChevronRight,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/follow-ups", label: "Follow-ups", icon: Bell },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function NavItem({ href, label, icon: Icon, exact }: (typeof NAV)[0]) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
      {active && <ChevronRight className="ml-auto h-3 w-3 text-emerald-400" />}
    </Link>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* Sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">

        {/* Logo */}
        <div className="flex h-14 items-center border-b border-slate-100 px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-base font-bold tracking-tight text-slate-900">WHATSBOARD</span>
          </Link>
        </div>

        {/* New order CTA */}
        <div className="px-3 pt-4 pb-2">
          <Link
            href="/dashboard/orders/new"
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-3 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Order
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-100 p-3">
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* Mobile header */}
        <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-bold text-slate-900">WHATSBOARD</span>
          </Link>
          <Link
            href="/dashboard/orders/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            New Order
          </Link>
        </header>

        {/* Mobile nav */}
        <nav className="flex overflow-x-auto border-b border-slate-200 bg-white px-4 lg:hidden">
          {NAV.slice(0, 5).map((item) => (
            <MobileNavItem key={item.href} {...item} />
          ))}
        </nav>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 max-w-screen-xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function MobileNavItem({ href, label, icon: Icon, exact }: (typeof NAV)[0]) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex shrink-0 flex-col items-center gap-1 border-b-2 px-3 py-2.5 text-xs font-medium transition-colors ${
        active
          ? "border-emerald-500 text-emerald-600"
          : "border-transparent text-slate-400 hover:text-slate-600"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
