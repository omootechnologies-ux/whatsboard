export type SmsPaymentProvider = "mpesa" | "tigo" | "airtel" | "unknown";

export type ParsedSmsPayment = {
  provider: SmsPaymentProvider;
  amount: number | null;
  senderName: string | null;
  senderPhone: string | null;
  reference: string | null;
  timestamp: string | null;
  rawSms: string;
};

export type SmsParsePreview = ParsedSmsPayment & {
  parseable: boolean;
  parserLabel: string;
};

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function stripInvisibleCharacters(value: string) {
  return value
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");
}

function normalizeInput(rawInput: string) {
  return normalizeWhitespace(stripInvisibleCharacters(String(rawInput || "")));
}

function normalizeAmountToken(raw: string) {
  const token = raw
    .replace(/[^\d,.'\s]/g, "")
    .replace(/['’\s]/g, "")
    .trim();
  if (!token) return "";

  const hasComma = token.includes(",");
  const hasDot = token.includes(".");

  if (hasComma && hasDot) {
    const lastComma = token.lastIndexOf(",");
    const lastDot = token.lastIndexOf(".");
    if (lastComma > lastDot) {
      return token.replace(/\./g, "").replace(",", ".");
    }
    return token.replace(/,/g, "");
  }

  if (hasComma) {
    const parts = token.split(",");
    const last = parts[parts.length - 1] || "";
    if (parts.length > 1 && last.length <= 2) {
      return `${parts.slice(0, -1).join("")}.${last}`;
    }
    return parts.join("");
  }

  if (hasDot) {
    const parts = token.split(".");
    const last = parts[parts.length - 1] || "";
    if (parts.length > 1 && last.length <= 2) {
      return `${parts.slice(0, -1).join("")}.${last}`;
    }
    return parts.join("");
  }

  return token;
}

function parseAmount(raw?: string | null) {
  if (!raw) return null;
  const cleaned = normalizeAmountToken(raw);
  if (!cleaned) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value)) return null;
  return value;
}

function cleanName(value?: string | null) {
  if (!value) return null;
  const normalized = normalizeWhitespace(value)
    .replace(/[().]/g, "")
    .trim();
  return normalized.length ? normalized : null;
}

function cleanPhone(value?: string | null) {
  if (!value) return null;
  const normalized = normalizeWhitespace(value).replace(/[()]/g, "");
  const digits = normalized.replace(/[^\d+]/g, "").replace(/\+{2,}/g, "+");
  return digits.length >= 7 ? digits : null;
}

function cleanReference(value?: string | null) {
  if (!value) return null;
  const normalized = normalizeWhitespace(value).replace(/[^\w-]/g, "");
  return normalized.length ? normalized : null;
}

function parseTimestampFromText(smsText: string) {
  const patterns = [
    /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?\b/,
    /\b\d{4}-\d{1,2}-\d{1,2}(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?\b/,
    /\b\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4}(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?\b/,
  ];

  for (const pattern of patterns) {
    const match = smsText.match(pattern);
    if (!match) continue;
    const parsed = new Date(match[0]);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }
  return null;
}

function inferProviderFromText(smsText: string): SmsPaymentProvider {
  const lower = smsText.toLowerCase();
  if (/\bm[\s-]?pesa\b/.test(lower)) return "mpesa";
  if (/\btigopesa\b|\btigo\s*peza\b|\btigo\s*pesa\b/.test(lower)) return "tigo";
  if (/\bairtel\s*money\b|\bairtel\b/.test(lower)) return "airtel";
  return "unknown";
}

function extractAmountFromText(smsText: string) {
  const patterns = [
    /\b(?:tzs|tsh)\s*([0-9][0-9,.'\s]*(?:[.,][0-9]{1,2})?)/i,
    /\b([0-9][0-9,.'\s]*(?:[.,][0-9]{1,2})?)\s*(?:\/-\s*)?(?:tzs|tsh)\b/i,
    /\bumepokea\s+([0-9][0-9,.'\s]*(?:[.,][0-9]{1,2})?)/i,
    /\breceived\s+([0-9][0-9,.'\s]*(?:[.,][0-9]{1,2})?)/i,
  ];

  for (const pattern of patterns) {
    const match = smsText.match(pattern);
    if (!match?.[1]) continue;
    const value = parseAmount(match[1]);
    if (value !== null) return value;
  }
  return null;
}

function extractNameAndPhoneFromText(smsText: string) {
  const patterns = [
    /\bkutoka\s+(.+?)\s*(?:\(([+\d][\d\s-]{6,})\)|([+\d][\d\s-]{6,}))(?=[.\s]|$)/i,
    /\bfrom\s+(.+?)\s*-\s*([+\d][\d\s-]{6,})(?=[.\s]|$)/i,
    /\bfrom\s+(.+?)\s+([+\d][\d\s-]{6,})(?=[.\s]|$)/i,
  ];

  for (const pattern of patterns) {
    const match = smsText.match(pattern);
    if (!match) continue;
    const name = cleanName(match[1]);
    const phone = cleanPhone(match[2] || match[3] || null);
    if (name || phone) {
      return { name, phone };
    }
  }

  return { name: null, phone: null };
}

function extractReferenceFromText(smsText: string) {
  const patterns = [
    /(?:kumbukumbu(?:\s*namba)?|namba ya kumbukumbu)\s*[:.-]?\s*([A-Za-z0-9-]{5,})/i,
    /(?:transaction(?:\s*id)?|trans(?:action)?\s*id|txn(?:\s*id)?)\s*[:.-]?\s*([A-Za-z0-9-]{5,})/i,
    /(?:reference|ref(?:erence)?)\s*[:.-]?\s*([A-Za-z0-9-]{5,})/i,
    /\b([A-Z]{2,}[A-Z0-9-]{4,})\b/,
  ];

  for (const pattern of patterns) {
    const match = smsText.match(pattern);
    const cleaned = cleanReference(match?.[1]);
    if (cleaned) return cleaned;
  }
  return null;
}

function parseWithFlexibleExtractor(
  smsText: string,
  provider: SmsPaymentProvider,
): ParsedSmsPayment | null {
  const amount = extractAmountFromText(smsText);
  const { name, phone } = extractNameAndPhoneFromText(smsText);
  const reference = extractReferenceFromText(smsText);

  if (amount === null && !name && !phone && !reference) {
    return null;
  }

  return {
    provider,
    amount,
    senderName: name,
    senderPhone: phone,
    reference,
    timestamp: parseTimestampFromText(smsText),
    rawSms: smsText,
  };
}

function parseMpesaTz(smsText: string): ParsedSmsPayment | null {
  const pattern =
    /Umepokea\s+(?:TZS|TSh)?\s*([\d,.'\s]+(?:[.,]\d+)?)\s+kutoka\s+(.+?)\s*(?:\(([+\d][\d\s-]{6,})\)|([+\d][\d\s-]{6,}))?.*?Kumbukumbu(?:\s*namba)?\s*[:.-]?\s*([A-Za-z0-9-]+)/i;
  const match = smsText.match(pattern);
  if (!match) return null;

  return {
    provider: "mpesa",
    amount: parseAmount(match[1]),
    senderName: cleanName(match[2]),
    senderPhone: cleanPhone(match[3] || match[4]),
    reference: cleanReference(match[5]),
    timestamp: parseTimestampFromText(smsText),
    rawSms: smsText,
  };
}

function parseTigopesa(smsText: string): ParsedSmsPayment | null {
  const pattern =
    /Umepokea\s+([\d,.'\s]+(?:[.,]\d+)?)\/-\s*(?:TZS|TSh)?\s+kutoka\s+(.+?)\(([^)]+)\).*?(?:Namba ya Kumbukumbu|Kumbukumbu(?:\s*namba)?)\s*[:.-]?\s*([A-Za-z0-9-]+)/i;
  const match = smsText.match(pattern);
  if (!match) return null;

  return {
    provider: "tigo",
    amount: parseAmount(match[1]),
    senderName: cleanName(match[2]),
    senderPhone: cleanPhone(match[3]),
    reference: cleanReference(match[4]),
    timestamp: parseTimestampFromText(smsText),
    rawSms: smsText,
  };
}

function parseAirtelMoney(smsText: string): ParsedSmsPayment | null {
  const pattern =
    /Confirmed\.\s*You have received\s+(?:TZS|TSh)?\s*([\d,.'\s]+(?:[.,]\d+)?)\s+from\s+(.+?)\s*-\s*([+\d][\d\s-]{6,}).*?(?:Transaction ID|Trans(?:action)?\s*ID|Ref(?:erence)?)\s*[:.-]?\s*([A-Za-z0-9-]+)/i;
  const match = smsText.match(pattern);
  if (!match) return null;

  return {
    provider: "airtel",
    amount: parseAmount(match[1]),
    senderName: cleanName(match[2]),
    senderPhone: cleanPhone(match[3]),
    reference: cleanReference(match[4]),
    timestamp: parseTimestampFromText(smsText),
    rawSms: smsText,
  };
}

export function parsePaymentSms(rawInput: string): ParsedSmsPayment {
  const smsText = normalizeInput(rawInput);

  if (!smsText) {
    return {
      provider: "unknown",
      amount: null,
      senderName: null,
      senderPhone: null,
      reference: null,
      timestamp: null,
      rawSms: "",
    };
  }

  const parserEntries: Array<{
    provider: SmsPaymentProvider;
    parse: (text: string) => ParsedSmsPayment | null;
  }> = [
    { provider: "mpesa", parse: parseMpesaTz },
    { provider: "tigo", parse: parseTigopesa },
    { provider: "airtel", parse: parseAirtelMoney },
  ];

  for (const { parse } of parserEntries) {
    const parsed = parse(smsText);
    if (parsed) return parsed;
  }

  const inferredProvider = inferProviderFromText(smsText);
  const flexParsed = parseWithFlexibleExtractor(smsText, inferredProvider);
  if (flexParsed) return flexParsed;

  const fallbackParty = extractNameAndPhoneFromText(smsText);
  return {
    provider: inferredProvider,
    amount: extractAmountFromText(smsText),
    senderName: fallbackParty.name,
    senderPhone: fallbackParty.phone,
    reference: extractReferenceFromText(smsText),
    timestamp: parseTimestampFromText(smsText),
    rawSms: smsText,
  };
}

export function parsePaymentSmsPreview(rawInput: string): SmsParsePreview {
  const parsed = parsePaymentSms(rawInput);
  const parseable = Boolean(
      parsed.amount !== null &&
      (parsed.senderName || parsed.senderPhone) &&
      parsed.reference,
  );

  const parserLabel =
    parsed.provider === "mpesa"
      ? "M-Pesa TZ"
      : parsed.provider === "tigo"
        ? "Tigopesa"
        : parsed.provider === "airtel"
          ? "Airtel Money"
          : parseable
            ? "Generic payment SMS"
            : "Unknown format";

  return {
    ...parsed,
    parseable,
    parserLabel,
  };
}
