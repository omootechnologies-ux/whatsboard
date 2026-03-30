import Link from "next/link";

const links = [
  { label: "Pricing", href: "/pricing" },
  { label: "Log in", href: "/login" },
  { label: "Get Started", href: "/register" },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="text-lg font-black tracking-tight text-slate-900">WHATSBOARD</p>
          <p className="mt-2 max-w-md text-sm text-slate-600">
            Acha biashara yako isiendeshwe kwa screenshot na kumbukumbu.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          {links.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-semibold text-slate-600 transition hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
