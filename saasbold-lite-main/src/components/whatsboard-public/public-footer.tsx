import Image from "next/image";
import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-white/20 bg-[var(--color-wb-primary)]">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-[0_16px_30px_rgba(0,0,0,0.2)]">
            <Image
              src="/whatsboard-logo.png"
              alt="WhatsBoard logo"
              width={2000}
              height={2000}
              className="h-9 w-9 object-contain"
            />
          </span>
          <div>
            <p className="text-sm font-black tracking-[-0.03em] text-white">
              WhatsBoard
            </p>
            <p className="mt-1 text-sm text-white/80">
              From chat chaos to sales control.
            </p>
            <p className="mt-1 text-sm text-white/75">
              Built for East African online sellers
            </p>
          </div>
        </div>

        <div className="grid gap-3 text-sm font-semibold sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/#product"
            className="rounded-xl px-3 py-2 text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            Product
          </Link>
          <Link
            href="/pricing"
            className="rounded-xl px-3 py-2 text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            Pricing
          </Link>
          <Link
            href="/login?next=%2Fdashboard"
            className="rounded-xl px-3 py-2 text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            Demo
          </Link>
          <Link
            href="/login"
            className="rounded-xl px-3 py-2 text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            Login
          </Link>
          <Link
            href="/register?force=1"
            className="rounded-xl px-3 py-2 text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            Start Free
          </Link>
          <a
            href="mailto:hello@whatsboard.africa"
            className="rounded-xl px-3 py-2 text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            Contact
          </a>
          <Link
            href="/privacy"
            className="rounded-xl px-3 py-2 text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="rounded-xl px-3 py-2 text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
