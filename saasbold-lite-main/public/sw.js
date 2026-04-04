const CACHE_VERSION = "whatsboard-v1";
const STATIC_CACHE = `wb-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `wb-runtime-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  "/",
  "/pricing",
  "/login",
  "/register",
  "/privacy",
  "/terms",
  "/offline.html",
  "/manifest.webmanifest",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/apple-touch-icon.png",
];

const PUBLIC_ROUTES = new Set([
  "/",
  "/pricing",
  "/login",
  "/register",
  "/privacy",
  "/terms",
]);

const NETWORK_ONLY_PREFIXES = [
  "/api/",
  "/dashboard",
  "/orders",
  "/customers",
  "/follow-ups",
  "/payments",
  "/analytics",
  "/settings",
  "/team",
  "/billing",
  "/products",
  "/receipt/",
  "/r/",
];

function isNetworkOnlyPath(pathname) {
  return NETWORK_ONLY_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isStaticAsset(pathname) {
  return (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/icons/") ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/favicon.ico"
  );
}

async function putIfOk(cacheName, request, response) {
  if (!response || response.status !== 200 || response.type !== "basic") {
    return response;
  }
  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
  return response;
}

async function networkFirst(request, cacheName, fallbackUrl) {
  try {
    const response = await fetch(request);
    await putIfOk(cacheName, request, response);
    return response;
  } catch {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;
    if (fallbackUrl) {
      const fallback = await cache.match(fallbackUrl);
      if (fallback) return fallback;
    }
    throw new Error("No cached response");
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then((response) => putIfOk(cacheName, request, response))
    .catch(() => null);

  if (cached) {
    return cached;
  }

  const network = await networkPromise;
  if (network) return network;

  throw new Error("No response available");
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const pathname = url.pathname;

  if (isNetworkOnlyPath(pathname)) return;

  if (request.mode === "navigate") {
    if (PUBLIC_ROUTES.has(pathname)) {
      event.respondWith(networkFirst(request, STATIC_CACHE, "/offline.html"));
    }
    return;
  }

  if (isStaticAsset(pathname)) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
  }
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

