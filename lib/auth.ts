export function isAuthenticated(cookieValue?: string | null) {
  return Boolean(cookieValue);
}
