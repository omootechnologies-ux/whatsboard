import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-[var(--color-wb-border)] bg-white">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
            WhatsBoard
          </p>
          <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
            From chat chaos to sales control.
          </p>
          <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
            Built for East African online sellers
          </p>
        </div>

        <div className="grid gap-3 text-sm font-semibold sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/#product"
            className="rounded-xl px-3 py-2 text-[var(--color-wb-text-muted)] transition hover:bg-[var(--color-wb-primary-soft)] hover:text-[var(--color-wb-primary)]"
          >
            Product
          </Link>
          <Link
            href="/pricing"
            className="rounded-xl px-3 py-2 text-[var(--color-wb-text-muted)] transition hover:bg-[var(--color-wb-primary-soft)] hover:text-[var(--color-wb-primary)]"
          >
            Pricing
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl px-3 py-2 text-[var(--color-wb-text-muted)] transition hover:bg-[var(--color-wb-primary-soft)] hover:text-[var(--color-wb-primary)]"
          >
            Demo
          </Link>
          <Link
            href="/login"
            className="rounded-xl px-3 py-2 text-[var(--color-wb-text-muted)] transition hover:bg-[var(--color-wb-primary-soft)] hover:text-[var(--color-wb-primary)]"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-xl px-3 py-2 text-[var(--color-wb-text-muted)] transition hover:bg-[var(--color-wb-primary-soft)] hover:text-[var(--color-wb-primary)]"
          >
            Start Free
          </Link>
          <a
            href="mailto:hello@whatsboard.africa"
            className="rounded-xl px-3 py-2 text-[var(--color-wb-text-muted)] transition hover:bg-[var(--color-wb-primary-soft)] hover:text-[var(--color-wb-primary)]"
          >
            Contact
          </a>
          <Link
            href="/privacy"
            className="rounded-xl px-3 py-2 text-[var(--color-wb-text-muted)] transition hover:bg-[var(--color-wb-primary-soft)] hover:text-[var(--color-wb-primary)]"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="rounded-xl px-3 py-2 text-[var(--color-wb-text-muted)] transition hover:bg-[var(--color-wb-primary-soft)] hover:text-[var(--color-wb-primary)]"
          >
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
