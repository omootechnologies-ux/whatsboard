import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <section className="wb-shell-card w-full p-6 text-center sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-wb-primary)]">
          WhatsBoard
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[var(--color-wb-text)] sm:text-4xl">
          Page not found
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--color-wb-text-muted)] sm:text-base">
          This page does not exist or was moved. Go back to your dashboard
          workspace and continue managing orders, payments, and follow-ups.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/" className="wb-button-primary">
            Open dashboard
          </Link>
          <Link href="/orders" className="wb-button-secondary">
            View orders
          </Link>
        </div>
      </section>
    </main>
  );
}
