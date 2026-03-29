import Link from "next/link";

const items = [
  ["/dashboard", "Home"],
  ["/dashboard/orders", "Orders"],
  ["/dashboard/customers", "Customers"],
  ["/dashboard/settings", "Settings"]
] as const;

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-slate-950/95 px-4 py-3 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-xl items-center justify-between">
        {items.map(([href, label]) => (
          <Link key={href} href={href} className="text-sm text-slate-300 hover:text-white">
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
