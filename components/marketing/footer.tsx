import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-12">
      <div className="container-pad grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950 font-bold">
              W
            </div>
            <div>
              <p className="font-semibold text-white">WHATSBOARD</p>
              <p className="text-sm text-slate-400">WhatsApp-first order control</p>
            </div>
          </div>
          <p className="max-w-md text-slate-400">
            Built for businesses that already sell through WhatsApp and social media, but need more control after the chat starts.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="mb-3 text-sm font-semibold text-white">Product</p>
            <div className="space-y-2 text-sm text-slate-400">
              <p><a href="#preview" className="hover:text-white">Preview</a></p>
              <p><Link href="/pricing" className="hover:text-white">Pricing</Link></p>
              <p><a href="#testimonials" className="hover:text-white">Testimonials</a></p>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-white">Company</p>
            <div className="space-y-2 text-sm text-slate-400">
              <p><Link href="/login" className="hover:text-white">Login</Link></p>
              <p><Link href="/register" className="hover:text-white">Start free</Link></p>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-white">Promise</p>
            <div className="space-y-2 text-sm text-slate-400">
              <p>Less chaos</p>
              <p>Better follow-up</p>
              <p>More paid orders</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-pad mt-10 border-t border-white/10 pt-6 text-sm text-slate-500">
        © 2026 WHATSBOARD. Built for East African sellers.
      </div>
    </footer>
  );
}
