// `vitest/config` réexporte `defineConfig` de Vite en ajoutant le typage du
// champ `test` — un seul fichier de config pour le build et les tests.
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // PWA + service worker offline. Base commune Web / iOS / Android (Capacitor).
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["soma-logo-orange-navy.png"],
      manifest: {
        name: "SOMA — Suivi d'entraînement",
        short_name: "SOMA",
        description:
          "Carnet d'entraînement connecté. Suivez vos séances, votre progression et vos statistiques.",
        lang: "fr",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#002B4C",
        theme_color: "#002B4C",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // Cache offline raisonnable : assets statiques + navigations.
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallback: "/index.html",
        // Sans ça, les bundles des anciens déploiements restent servis
        // depuis le cache et masquent les correctifs déployés.
        cleanupOutdatedCaches: true,
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@domain": fileURLToPath(new URL("./src/domain", import.meta.url)),
      "@infrastructure": fileURLToPath(new URL("./src/infrastructure", import.meta.url)),
      "@presentation": fileURLToPath(new URL("./src/presentation", import.meta.url)),
    },
  },
  // Empreinte de build : permet de vérifier en un coup d'œil (console) quelle
  // version est réellement servie, plutôt que de la supposer.
  define: {
    __BUILD_STAMP__: JSON.stringify(new Date().toISOString()),
  },
  server: { port: 5173, host: true },
  test: {
    // Environnement node explicite + stub `localStorage` maison. jsdom
    // s'appliquait sous Linux mais pas sur macOS : le résultat des tests
    // dépendait de la machine, ce qui est pire qu'inutile.
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.ts"],
  },
});
