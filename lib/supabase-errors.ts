export function isMissingRelationError(message?: string) {
  const value = (message || "").toLowerCase();

  return (
    value.includes("schema cache") ||
    value.includes("could not find the table") ||
    value.includes('relation "public.') ||
    (value.includes("relation ") && value.includes(" does not exist"))
  );
}

export function isMissingOptionalFieldError(message?: string) {
  const value = (message || "").toLowerCase();

  return isMissingRelationError(message) || (value.includes("column") && value.includes("does not exist"));
}
