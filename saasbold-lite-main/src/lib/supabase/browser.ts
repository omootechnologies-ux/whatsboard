"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

function resolvePublicSupabaseUrl() {
  // NOTE: Keep direct NEXT_PUBLIC_* access so Next.js can inline on client builds.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error("Missing required env var: NEXT_PUBLIC_SUPABASE_URL");
  }
  return url;
}

function resolvePublicSupabaseAnonKey() {
  // NOTE: Only NEXT_PUBLIC_* vars are available in browser bundles.
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_KEY;

  if (!key) {
    throw new Error(
      "Missing required env var: NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)",
    );
  }
  return key;
}

export function createSupabaseBrowserClient() {
  if (cachedClient) return cachedClient;

  cachedClient = createClient(
    resolvePublicSupabaseUrl(),
    resolvePublicSupabaseAnonKey(),
  );

  return cachedClient;
}
