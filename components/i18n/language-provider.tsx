"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { AppLanguage } from "@/lib/i18n"
import { translateUiText } from "@/lib/i18n"

type LanguageContextValue = {
  language: AppLanguage
  setLanguage: (language: AppLanguage) => void
  t: (text: string) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>("en")

  useEffect(() => {
    const stored = window.localStorage.getItem("whatsboard-language")
    if (stored === "sw" || stored === "en") {
      setLanguageState(stored)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem("whatsboard-language", language)
    document.documentElement.lang = language === "sw" ? "sw" : "en"
  }, [language])

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage: setLanguageState,
      t: (text: string) => translateUiText(text, language),
    }),
    [language],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider")
  }
  return context
}
