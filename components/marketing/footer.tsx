import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12">
      <div className="container-pad grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-500 text-white font-bold">
              W
            </div>
            <div>
              <p className="font-semibold text-slate-900">WHATSBOARD</p>
              <p className="text-sm text-slate-500">WhatsApp-first order control</p>
            </div>
          </div>
          <p className="max-w-md text-slate-500">
            Built for businesses that already sell through WhatsApp and social media, but need more control after the chat starts.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-900">Product</p>
            <div className="space-y-2 text-sm text-slate-500">
              <p><a href="#preview" className="hover:text-slate-900">Preview</a></p>
              <p><Link href="/pricing" className="hover:text-slate-900">Pricing</Link></p>
              <p><a href="#testimonials" className="hover:text-slate-900">Testimonials</a></p>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-slate-900">Company</p>
            <div className="space-y-2 text-sm text-slate-500">
              <p><Link href="/login" className="hover:text-slate-900">Login</Link></p>
              <p><Link href="/register" className="hover:text-slate-900">Start free</Link></p>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-slate-900">Promise</p>
            <div className="space-y-2 text-sm text-slate-500">
              <p className="text-green-600">Less chaos</p>
              <p className="text-red-500">Fewer lost orders</p>
              <p className="text-green-600">More paid sales</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-pad mt-10 border-t border-slate-200 pt-6 text-sm text-slate-500">
        © 2026 WHATSBOARD. Built for East African sellers.
      </div>
    </footer>
  );
}
