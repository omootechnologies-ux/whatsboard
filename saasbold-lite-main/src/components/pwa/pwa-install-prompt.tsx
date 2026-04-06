"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const PROMPT_DISMISS_KEY = "whatsboard-pwa-install-dismissed";

function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(true);
  const [isPrompting, setIsPrompting] = useState(false);

  const isIos = useMemo(() => {
    if (typeof window === "undefined") return false;
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandaloneMode()) return;
    if (window.localStorage.getItem(PROMPT_DISMISS_KEY) === "1") return;

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setHidden(false);
    };

    const onInstalled = () => {
      setDeferredPrompt(null);
      setHidden(true);
      window.localStorage.setItem(PROMPT_DISMISS_KEY, "1");
    };

    window.addEventListener(
      "beforeinstallprompt",
      onBeforeInstallPrompt as EventListener,
    );
    window.addEventListener("appinstalled", onInstalled);

    if (isIos) {
      setHidden(false);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        onBeforeInstallPrompt as EventListener,
      );
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [isIos]);

  const dismiss = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PROMPT_DISMISS_KEY, "1");
    }
    setHidden(true);
  };

  const triggerInstall = async () => {
    if (!deferredPrompt) return;
    setIsPrompting(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        dismiss();
      }
    } finally {
      setIsPrompting(false);
      setDeferredPrompt(null);
    }
  };

  if (hidden || isStandaloneMode()) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:max-w-sm">
      <div className="wb-shell-card p-3.5 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--color-wb-text)]">
              Install Folapp
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--color-wb-text-muted)]">
              Use Folapp as a full-screen app on your phone for faster daily
              order tracking.
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--color-wb-border)] bg-white text-[var(--color-wb-text-muted)]"
            aria-label="Dismiss install prompt"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {deferredPrompt ? (
          <button
            type="button"
            onClick={triggerInstall}
            disabled={isPrompting}
            className="wb-button-primary mt-3 w-full justify-center"
          >
            <Download className="h-4 w-4" />
            {isPrompting ? "Preparing..." : "Install app"}
          </button>
        ) : isIos ? (
          <p className="mt-3 rounded-xl border border-[var(--color-wb-border)] bg-[var(--color-wb-surface-alt)] px-3 py-2 text-xs text-[var(--color-wb-text-muted)]">
            On iPhone: tap Share, then choose Add to Home Screen.
          </p>
        ) : null}
      </div>
    </div>
  );
}

