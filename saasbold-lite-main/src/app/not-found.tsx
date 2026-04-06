import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFoundPage() {
  const t = await getTranslations();
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <section className="wb-shell-card w-full p-6 text-center sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-wb-primary)]">
          Folapp
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[var(--color-wb-text)] sm:text-4xl">
          {t("notFound.title")}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--color-wb-text-muted)] sm:text-base">
          {t("notFound.description")}
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/dashboard" className="wb-button-primary">
            {t("notFound.openDashboard")}
          </Link>
          <Link href="/" className="wb-button-secondary">
            {t("notFound.backHome")}
          </Link>
        </div>
      </section>
    </main>
  );
}
