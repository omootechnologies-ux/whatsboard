type DisplayLabelKind = "customer" | "order";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const COMPACT_UUID_PATTERN = /^[0-9a-f]{32}$/i;
const INTERNAL_IDENTIFIER_PATTERN =
  /^(?:id|order[_\s-]?id|customer[_\s-]?id|uuid|record[_\s-]?id|pk|fk)\b[:\s#_-]*[a-z0-9-]{4,}$/i;
const DEV_PLACEHOLDER_PATTERN =
  /\b(?:crud|deploy|seed(?:ed)?|dummy|placeholder|demo\s*data|sample\s*data|test\s*data)\b/i;
const EMPTY_PATTERN =
  /^(?:unknown(?: customer)?|not provided|n\/a|null|undefined)$/i;
const ORDER_REF_PATTERN = /\b(?:WB|ORD|ORDER)[-#\s]?(\d{1,8})\b/i;

function normalize(value?: string | null) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function titleCase(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function shortHash(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return String((hash % 99999) + 1).padStart(5, "0");
}

function looksLikeInternalIdentifier(value: string) {
  if (UUID_PATTERN.test(value) || COMPACT_UUID_PATTERN.test(value)) {
    return true;
  }
  if (INTERNAL_IDENTIFIER_PATTERN.test(value)) {
    return true;
  }
  const maybeInternalToken = /\b(?:uuid|order_id|customer_id)\b/i.test(value);
  const mostlyHex = /^[0-9a-f-]{16,}$/i.test(value);
  return maybeInternalToken || mostlyHex;
}

function isDeveloperPlaceholder(value: string) {
  return DEV_PLACEHOLDER_PATTERN.test(value);
}

export function looksLikeUuid(value?: string | null) {
  const normalized = normalize(value);
  if (!normalized) return false;
  return UUID_PATTERN.test(normalized) || COMPACT_UUID_PATTERN.test(normalized);
}

export function sanitizeBusinessLabel(value?: string | null) {
  const normalized = normalize(value);
  if (!normalized) return null;
  if (EMPTY_PATTERN.test(normalized)) return null;
  if (looksLikeInternalIdentifier(normalized)) return null;
  if (isDeveloperPlaceholder(normalized)) return null;
  return normalized;
}

export function sanitizePhoneLabel(value?: string | null) {
  const normalized = normalize(value);
  if (!normalized) return null;
  if (looksLikeInternalIdentifier(normalized)) return null;
  const digits = normalized.replace(/\D/g, "");
  if (digits.length < 7) return null;
  return normalized;
}

export function formatOrderReference(orderId?: string | null) {
  const normalized = normalize(orderId);
  if (!normalized) return null;

  const direct = normalized.match(ORDER_REF_PATTERN);
  if (direct) {
    const digits = direct[1].padStart(5, "0").slice(-5);
    const prefix = normalized.toUpperCase().includes("ORD") ? "ORD" : "WB";
    return `${prefix}-${digits}`;
  }

  if (!looksLikeInternalIdentifier(normalized)) {
    const trailingDigits = normalized.match(/(\d{2,8})(?!.*\d)/);
    if (trailingDigits) {
      return `WB-${trailingDigits[1].padStart(5, "0").slice(-5)}`;
    }
  }

  return `WB-${shortHash(normalized)}`;
}

export function formatPaymentStatusLabel(status?: string | null) {
  const normalized = sanitizeBusinessLabel(status);
  if (!normalized) return "Unknown";
  return titleCase(normalized);
}

export function formatStageLabel(value?: string | null) {
  const normalized = sanitizeBusinessLabel(value);
  if (!normalized) return "Unknown";
  return titleCase(normalized);
}

export function getPrimaryOrderLabel({
  customerName,
  customerPhone,
  orderId,
  kind = "order",
}: {
  customerName?: string | null;
  customerPhone?: string | null;
  orderId?: string | null;
  kind?: DisplayLabelKind;
}) {
  const safeName = sanitizeBusinessLabel(customerName);
  if (safeName) return safeName;

  const safePhone = sanitizePhoneLabel(customerPhone);
  if (safePhone) return safePhone;

  const ref = formatOrderReference(orderId);
  if (ref) return `Order #${ref}`;

  return kind === "customer" ? "Untitled customer" : "Untitled order";
}
