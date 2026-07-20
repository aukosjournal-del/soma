import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    "Config Supabase manquante : renseigner VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY dans .env.local",
  );
}

/**
 * Client unique côté navigateur. Persiste la session (auth) — utile aussi
 * pour le wrapper natif Capacitor (WebView partage le storage).
 */
export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
