import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-sm font-black text-black">
                W
              </span>
              <div>
                <p className="text-lg font-black tracking-tight">WHATSBOARD</p>
                <p className="text-xs uppercase tracking-[0.22em] text-white/45">
                  Seller OS
                </p>
              </div>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-white/65">
              Acha biashara yako isiendeshwe kwa screenshot na kumbukumbu.
              WHATSBOARD helps online sellers organize orders, payments, follow-ups,
              dispatch, and delivery after the chat starts.
            </p>
          </div>

          <div>
            <p className="text-sm font-bold text-white">Quick Links</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/70">
              <Link href="/" className="transition hover:text-emerald-400">
                Home
              </Link>
              <Link href="/pricing" className="transition hover:text-emerald-400">
                Pricing
              </Link>
              <Link href="/login" className="transition hover:text-emerald-400">
                Log in
              </Link>
              <Link href="/register" className="transition hover:text-emerald-400">
                Get Started
              </Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-white">Why sellers like it</p>
            <div className="mt-4 space-y-3 text-sm text-white/70">
              <p>• Clear order tracking</p>
              <p>• Better payment visibility</p>
              <p>• Less follow-up embarrassment</p>
              <p>• More control, less chaos</p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 WHATSBOARD. Built for East African online sellers.</p>
          <p>From chat chaos to sales control.</p>
        </div>
      </div>
    </footer>
  );
}
