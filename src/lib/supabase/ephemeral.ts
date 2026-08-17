import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { supabaseFetch } from "@/lib/supabase/fetch";

/**
 * Client sans cookies — pour vérifier un mot de passe
 * sans écraser la session MFA (AAL2) du navigateur.
 */
export function createSupabaseEphemeralClient() {
  const config = getSupabaseConfig();
  if (!config.ok) {
    throw new Error("Supabase non configuré.");
  }

  return createClient(config.config.url, config.config.anonKey, {
    global: { fetch: supabaseFetch },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
