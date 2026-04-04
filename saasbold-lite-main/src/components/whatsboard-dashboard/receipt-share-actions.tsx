"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Copy, MessageCircle } from "lucide-react";

function buildAbsoluteReceiptUrl(token: string) {
  if (typeof window === "undefined") return `/receipt/${token}`;
  return `${window.location.origin}/receipt/${token}`;
}

export function ReceiptShareActions({
  token,
  className = "",
}: {
  token: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const receiptUrl = useMemo(() => buildAbsoluteReceiptUrl(token), [token]);
  const whatsappHref = useMemo(() => {
    const message = `Asante kwa order yako! 🙏 Hii ni receipt yako: ${receiptUrl}`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }, [receiptUrl]);

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <button
        type="button"
        className="wb-button-secondary"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(receiptUrl);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : "Copy receipt link"}
      </button>

      <Link
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="wb-button-primary"
      >
        <MessageCircle className="h-4 w-4" />
        Send via WhatsApp
      </Link>
    </div>
  );
}
