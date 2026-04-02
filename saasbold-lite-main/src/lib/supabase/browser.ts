"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

function required(names: string[]) {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }

  throw new Error(`Missing required env var: one of ${names.join(", ")}`);
}

export function createSupabaseBrowserClient() {
  if (cachedClient) return cachedClient;

  cachedClient = createClient(
    required(["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"]),
    required([
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "NEXT_PUBLIC_SUPABASE_KEY",
      "SUPABASE_ANON_KEY",
    ]),
  );

  return cachedClient;
}
