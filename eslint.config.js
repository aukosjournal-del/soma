import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

// Flat config (ESLint 9). `.eslintrc.*` n'est plus lu par eslint@9 : sans ce
// fichier, `npm run lint` échouait immédiatement ("couldn't find a
// configuration file") — la commande n'avait jamais tourné avec succès.
//
// `@typescript-eslint/eslint-plugin` + `@typescript-eslint/parser` sont déjà
// des dépendances du projet ; on les câble directement plutôt que d'ajouter
// le paquet unifié `typescript-eslint`, absent du lockfile.
export default [
  {
    // dist/dev-dist : sorties de build. functions/ : Edge Functions Deno,
    // hors du tsconfig du projet (déjà exclues dans tsconfig.app.json) —
    // parserOptions.project échouerait dessus sinon.
    ignores: ["dist", "dev-dist", "src/infrastructure/supabase/functions"],
  },
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parser: tsParser,
      parserOptions: {
        project: ["./tsconfig.app.json", "./tsconfig.node.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      // Les erreurs Supabase/DOM transitent typées `unknown` ; le domaine
      // s'appuie sur `error instanceof Error` partout (SignupFlow,
      // useWorkoutSession, AuthRoot...). Interdire `any` casserait ce
      // pattern volontaire sans gain réel ici.
      "@typescript-eslint/no-explicit-any": "warn",
      // Déjà respecté partout dans le repo (`import type { X }`) ; on le
      // fait tenir plutôt que de le redécouvrir au prochain écart.
      "@typescript-eslint/consistent-type-imports": "warn",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      // `no-undef` ne connaît pas les `declare const` globaux (ex.
      // `__BUILD_STAMP__` dans vite-env.d.ts) ni les namespaces de types
      // globaux (`React.ReactNode` sans import valeur, JSX automatique) —
      // faux positifs classiques en TS. tsc fait déjà ce travail, mieux.
      "no-undef": "off",
    },
  },
];
