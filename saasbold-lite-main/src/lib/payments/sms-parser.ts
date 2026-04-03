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

function parseAmount(raw?: string | null) {
  if (!raw) return null;
  const cleaned = raw.replace(/[^\d.]/g, "");
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
  const normalized = normalizeWhitespace(value);
  const digits = normalized.replace(/[^\d+]/g, "");
  return digits.length >= 7 ? digits : null;
}

function cleanReference(value?: string | null) {
  if (!value) return null;
  const normalized = normalizeWhitespace(value).replace(/[^\w-]/g, "");
  return normalized.length ? normalized : null;
}

function parseTimestampFromText(smsText: string) {
  const pattern =
    /\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?)\b/;
  const match = smsText.match(pattern);
  if (!match) return null;
  const parsed = new Date(match[1]);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function parseMpesaTz(smsText: string): ParsedSmsPayment | null {
  const pattern =
    /Umepokea\s+TZS\s*([\d,]+(?:\.\d+)?)\s+kutoka\s+(.+?)\s+([+\d][\d\s-]{6,})\.\s*Kumbukumbu namba\s+([A-Za-z0-9-]+)/i;
  const match = smsText.match(pattern);
  if (!match) return null;

  return {
    provider: "mpesa",
    amount: parseAmount(match[1]),
    senderName: cleanName(match[2]),
    senderPhone: cleanPhone(match[3]),
    reference: cleanReference(match[4]),
    timestamp: parseTimestampFromText(smsText),
    rawSms: smsText,
  };
}

function parseTigopesa(smsText: string): ParsedSmsPayment | null {
  const pattern =
    /Umepokea\s+([\d,]+(?:\.\d+)?)\/-\s*TZS\s+kutoka\s+(.+?)\(([^)]+)\)\.\s*Namba ya Kumbukumbu:\s*([A-Za-z0-9-]+)/i;
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
    /Confirmed\.\s*You have received\s+TZS\s*([\d,]+(?:\.\d+)?)\s+from\s+(.+?)\s*-\s*([+\d][\d\s-]{6,})\.\s*Transaction ID\s*([A-Za-z0-9-]+)/i;
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
  const smsText = normalizeWhitespace(String(rawInput || ""));

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

  const parsers = [parseMpesaTz, parseTigopesa, parseAirtelMoney];
  for (const parse of parsers) {
    const parsed = parse(smsText);
    if (parsed) return parsed;
  }

  return {
    provider: "unknown",
    amount: null,
    senderName: null,
    senderPhone: null,
    reference: null,
    timestamp: parseTimestampFromText(smsText),
    rawSms: smsText,
  };
}

export function parsePaymentSmsPreview(rawInput: string): SmsParsePreview {
  const parsed = parsePaymentSms(rawInput);
  const parseable = Boolean(
    parsed.provider !== "unknown" &&
      parsed.amount !== null &&
      parsed.senderName &&
      parsed.reference,
  );
  return {
    ...parsed,
    parseable,
    parserLabel:
      parsed.provider === "mpesa"
        ? "M-Pesa TZ"
        : parsed.provider === "tigo"
          ? "Tigopesa"
          : parsed.provider === "airtel"
            ? "Airtel Money"
            : "Unknown format",
  };
}
