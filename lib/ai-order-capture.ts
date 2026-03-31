export type ParsedAiOrderCapture = {
  customer_name: string;
  phone: string;
  product_name: string;
  quantity: string;
  variant: string;
  location: string;
  payment_status: "unpaid" | "partial" | "paid" | "cod" | "";
  notes: string;
  confidence: number;
  missing_fields: string[];
};

const ORDER_INTENT_PATTERNS = [
  /\bnataka\b/i,
  /\bninataka\b/i,
  /\bnaomba\b/i,
  /\bnitumie\b/i,
  /\border\b/i,
];

const PRODUCT_STOP_WORDS = /\b(size|color|colour|rangi|location|area|delivery|pair|pairs|pcs?|pieces?|box|boxes|kg|kgs?)\b.*$/i;

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function cleanPhone(value: string) {
  const digits = value.replace(/[^\d+]/g, "");
  return digits.startsWith("+") ? digits : digits.replace(/^\+*/, "");
}

function extractPhone(chat: string) {
  const match = chat.match(/(?:\+?\d[\d\s-]{7,}\d)/);
  return match ? cleanPhone(match[0]) : "";
}

function extractCustomerName(chat: string) {
  const patterns = [
    /\b(?:my name is|name is|jina langu ni|jina ni|naitwa)\s+([a-z][a-z' -]{1,40})/i,
    /^\s*name\s*[:\-]\s*([a-z][a-z' -]{1,40})$/im,
  ];

  for (const pattern of patterns) {
    const match = chat.match(pattern);
    if (match?.[1]) return cleanText(match[1]);
  }

  return "";
}

function extractQuantity(chat: string) {
  const match = chat.match(/\b(\d+)\s*(pairs?|pair|pcs?|pieces?|boxes?|box|kgs?|kg)\b/i);
  if (match?.[1]) return match[1];

  const fallback = chat.match(/\bqty\s*[:\-]?\s*(\d+)\b/i);
  return fallback?.[1] ?? "";
}

function extractVariant(chat: string) {
  const parts: string[] = [];

  const size = chat.match(/\bsize\s*[:\-]?\s*([a-z0-9/-]+)/i);
  if (size?.[1]) parts.push(`Size ${cleanText(size[1])}`);

  const color = chat.match(/\b(?:color|colour|rangi)\s*[:\-]?\s*([a-z0-9/-]+)/i);
  if (color?.[1]) parts.push(`Color ${cleanText(color[1])}`);

  return parts.join(" • ");
}

function extractLocation(chat: string) {
  const patterns = [
    /\b(?:location|area)\s*[:\-]?\s*([a-z0-9 ,.'-]{2,40})/i,
    /\b(?:delivery to|send to|peleka|nipelekee|niko|ipo|kwa|at)\s+([a-z0-9 ,.'-]{2,40})/i,
  ];

  for (const pattern of patterns) {
    const match = chat.match(pattern);
    if (match?.[1]) return cleanText(match[1]);
  }

  return "";
}

function extractPaymentStatus(chat: string): ParsedAiOrderCapture["payment_status"] {
  if (/\b(?:cod|cash on delivery|lipa nikifika)\b/i.test(chat)) return "cod";
  if (/\b(?:partial|deposit|nusu|kidogo kwanza)\b/i.test(chat)) return "partial";
  if (/\b(?:nimelipa|nimeshalipa|paid|payment sent|already paid|nimetuma hela)\b/i.test(chat)) return "paid";
  if (/\b(?:nitatuma|nitumie namba ya malipo|send payment number|waiting payment)\b/i.test(chat)) return "unpaid";
  return "";
}

function extractProductName(chat: string) {
  const lines = chat
    .split(/\n+/)
    .map((line) => cleanText(line))
    .filter(Boolean);

  for (const line of lines) {
    if (!ORDER_INTENT_PATTERNS.some((pattern) => pattern.test(line))) continue;

    const extracted = line
      .replace(/^.*?\b(?:nataka|ninataka|naomba|nitumie|order(?:\s+ya)?)\b[:\-]?\s*/i, "")
      .replace(PRODUCT_STOP_WORDS, "")
      .replace(/\b\d+\s*(pairs?|pair|pcs?|pieces?|boxes?|box|kgs?|kg)\b/gi, "")
      .replace(/\b(?:size|color|colour|rangi)\s*[:\-]?\s*[a-z0-9/-]+\b/gi, "")
      .replace(/^[^a-z0-9]+/i, "");

    const normalized = cleanText(extracted);
    if (normalized) return normalized;
  }

  return "";
}

function buildNotes(chat: string) {
  return cleanText(chat).slice(0, 500);
}

export function parseAiOrderChat(chat: string): ParsedAiOrderCapture {
  const normalizedChat = cleanText(chat);
  const hasIntent = ORDER_INTENT_PATTERNS.some((pattern) => pattern.test(normalizedChat));
  const customer_name = extractCustomerName(chat);
  const phone = extractPhone(chat);
  const product_name = extractProductName(chat);
  const quantity = extractQuantity(chat);
  const variant = extractVariant(chat);
  const location = extractLocation(chat);
  const payment_status = extractPaymentStatus(chat);
  const notes = buildNotes(chat);

  const missing_fields = [
    !customer_name ? "customer_name" : null,
    !phone ? "phone" : null,
    !product_name ? "product_name" : null,
    !location ? "location" : null,
  ].filter(Boolean) as string[];

  let confidence = 0;
  if (hasIntent) confidence += 0.2;
  if (product_name) confidence += 0.25;
  if (phone) confidence += 0.2;
  if (customer_name) confidence += 0.1;
  if (location) confidence += 0.15;
  if (quantity) confidence += 0.05;
  if (variant) confidence += 0.025;
  if (payment_status) confidence += 0.025;

  return {
    customer_name,
    phone,
    product_name,
    quantity,
    variant,
    location,
    payment_status,
    notes,
    confidence: Math.min(1, Number(confidence.toFixed(2))),
    missing_fields,
  };
}
