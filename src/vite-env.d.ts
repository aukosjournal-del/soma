/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

/** Injecté par Vite (`define`) : date ISO du build servi. */
declare const __BUILD_STAMP__: string;

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
