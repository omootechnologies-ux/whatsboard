"use client"

import { useLanguage } from "@/components/i18n/language-provider"

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-sm">
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={[
          "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
          language === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
        ].join(" ")}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage("sw")}
        className={[
          "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
          language === "sw" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
        ].join(" ")}
      >
        SW
      </button>
    </div>
  )
}
