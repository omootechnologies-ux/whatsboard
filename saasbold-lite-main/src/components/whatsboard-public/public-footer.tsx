import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function PublicFooter() {
  const t = useTranslations();
  return (
    <footer className="border-t border-white/20 bg-[var(--color-wb-primary)]">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-[0_16px_30px_rgba(0,0,0,0.2)]">
            <Image
              src="/whatsboard-logo.png"
              alt="Folapp logo"
              width={40}
              height={40}
              className="h-9 w-9 object-contain"
            />
          </span>
          <div>
            <p className="text-sm font-black tracking-[-0.03em] text-white">
              {t("app.name")}
            </p>
            <p className="mt-1 text-sm text-white/80">
              {t("footer.tagline")}
            </p>
            <p className="mt-1 text-sm text-white/75">
              {t("footer.builtFor")}
            </p>
          </div>
        </div>

        <div className="grid gap-3 text-sm font-semibold sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/#product"
            className="rounded-xl px-3 py-2 text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            {t("footer.product")}
          </Link>
          <Link
            href="/pricing"
            className="rounded-xl px-3 py-2 text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            {t("footer.pricing")}
          </Link>
          <Link
            href="/login?next=%2Fdashboard"
            className="rounded-xl px-3 py-2 text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            {t("footer.demo")}
          </Link>
          <Link
            href="/login"
            className="rounded-xl px-3 py-2 text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            {t("footer.login")}
          </Link>
          <Link
            href="/register?force=1"
            className="rounded-xl px-3 py-2 text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            {t("footer.startFree")}
          </Link>
          <a
            href="mailto:hello@whatsboard.africa"
            className="rounded-xl px-3 py-2 text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            {t("footer.contact")}
          </a>
          <Link
            href="/privacy"
            className="rounded-xl px-3 py-2 text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            {t("footer.privacyPolicy")}
          </Link>
          <Link
            href="/terms"
            className="rounded-xl px-3 py-2 text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            {t("footer.terms")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
