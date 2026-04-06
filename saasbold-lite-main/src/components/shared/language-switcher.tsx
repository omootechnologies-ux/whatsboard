"use client";

import { useLanguage } from "@/components/i18n/language-provider";

const LOCALES = [
  { code: "en", label: "English" },
  { code: "sw", label: "Kiswahili" },
];

type LanguageSwitcherProps = {
  compact?: boolean;
  className?: string;
};

export function LanguageSwitcher({ compact = false, className = "" }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`flex items-center gap-1 rounded-full border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] px-1.5 py-0.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-wb-text-muted)] ${
        compact ? "w-auto" : "w-fit"
      } ${className}`}
    >
      {LOCALES.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() => setLanguage(item.code as Parameters<typeof setLanguage>[0])}
          className={`rounded-full px-3 py-1 transition focus:outline-none ${
            language === item.code
              ? "bg-[var(--color-wb-primary)] text-white"
              : "hover:bg-white hover:text-[var(--color-wb-text)]"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
