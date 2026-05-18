import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase con service role key.
 * SOLO usar en server-side (API routes, webhooks).
 * NUNCA exponer al cliente.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase service role key no configurada");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
