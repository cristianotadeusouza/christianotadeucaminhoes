import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

const env = import.meta.env as Record<string, string | undefined>;

export const supabaseUrl = env.VITE_SUPABASE_URL ?? "";
export const supabasePublishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";
export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase não configurado neste ambiente.");
  }
  return supabase;
}
