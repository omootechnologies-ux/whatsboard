import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="container-pad flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-500 text-white font-bold shadow-lg shadow-green-500/20">
            W
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-slate-900">WHATSBOARD</p>
            <p className="text-[11px] text-slate-500">WhatsApp Order Control</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <a href="#problem" className="text-sm text-slate-600 hover:text-slate-900">Problem</a>
          <a href="#preview" className="text-sm text-slate-600 hover:text-slate-900">Preview</a>
          <a href="#testimonials" className="text-sm text-slate-600 hover:text-slate-900">Testimonials</a>
          <Link href="/pricing" className="text-sm text-slate-600 hover:text-slate-900">Pricing</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="pulse-soft">
            <Link href="/register">Start Free</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
