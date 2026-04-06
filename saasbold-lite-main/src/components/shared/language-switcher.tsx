"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";

const LOCALES = [
  { code: "en", label: "English" },
  { code: "sw", label: "Kiswahili" },
];

type LanguageSwitcherProps = {
  compact?: boolean;
  className?: string;
};

export function LanguageSwitcher({ compact = false, className = "" }: LanguageSwitcherProps) {
  const locale = useLocale();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const queryString = searchParams?.toString();

  const currentSearch = queryString ? `?${queryString}` : "";

  return (
    <div
      className={`flex items-center gap-1 rounded-full border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] px-1.5 py-0.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-wb-text-muted)] ${
        compact ? "w-auto" : "w-fit"
      } ${className}`}
    >
      {LOCALES.map((item) => (
        <Link
          key={item.code}
          href={`${pathname}${currentSearch}`}
          locale={item.code}
          className={`rounded-full px-3 py-1 transition ${
            locale === item.code
              ? "bg-[var(--color-wb-primary)] text-white"
              : "hover:bg-white hover:text-[var(--color-wb-text)]"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
