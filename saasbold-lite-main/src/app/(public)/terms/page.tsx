import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: `${t("pages.terms.title")} | ${t("app.name")}`,
    description: t("pages.terms.description"),
  };
}

export default async function TermsPage() {
  const t = await getTranslations();
  return (
    <main className="mx-auto w-full max-w-[900px] px-4 py-10 sm:px-6 lg:py-14">
      <h1 className="text-3xl font-black tracking-[-0.04em] text-[var(--color-wb-text)] sm:text-4xl">
        {t("pages.terms.title")}
      </h1>
      <p className="mt-4 text-base leading-8 text-[var(--color-wb-text-muted)]">
        {t("pages.terms.description")}
      </p>
      <div className="mt-8 wb-shell-card p-6">
        <p className="text-sm leading-7 text-[var(--color-wb-text-muted)]">
          {t("pages.terms.contactPrefix")}{" "}
          <a
            href="mailto:hello@whatsboard.africa"
            className="font-semibold text-[var(--color-wb-primary)]"
          >
            hello@whatsboard.africa
          </a>{" "}
          {t("pages.terms.contactSuffix")}
        </p>
      </div>
    </main>
  );
}
