import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client. Bypasses RLS: server-only (webhook, /api/verify). Never import from client code.
 * Requires the SUPABASE_SERVICE_ROLE_KEY secret (the `sb_secret_...` key from the Supabase dashboard).
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
