import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-[var(--color-wb-border)] bg-white">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="text-sm font-black tracking-[-0.03em] text-[var(--color-wb-text)]">
            WhatsBoard
          </p>
          <p className="mt-1 text-sm text-[var(--color-wb-text-muted)]">
            From chat chaos to sales control.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
          <Link
            href="/pricing"
            className="rounded-xl px-3 py-2 text-[var(--color-wb-text-muted)] transition hover:bg-[var(--color-wb-primary-soft)] hover:text-[var(--color-wb-primary)]"
          >
            Pricing
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
            Register
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl px-3 py-2 text-[var(--color-wb-text-muted)] transition hover:bg-[var(--color-wb-primary-soft)] hover:text-[var(--color-wb-primary)]"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </footer>
  );
}
