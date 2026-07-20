# SOMA · PWA multiplateforme (React + Vite + TS)

Base de code **unique** Web / iOS / Android (packaging natif via Capacitor/Tauri),
clonée à l'identique du Ground Truth `SOMA.dc.html` (thème navy `#002B4C` / accent
orange `#F59E71`, glassmorphism `backdrop-filter: blur(20px)`).

## Architecture (DDD)

```
src/
├── domain/                     # Cœur métier — pur TS, zéro dépendance framework/infra
│   ├── shared/Result.ts
│   └── onboarding/
│       ├── value-objects/Username.ts        # règles pseudo (3..30, strip @)
│       ├── entities/OnboardingState.ts
│       ├── ports/UsernameAvailabilityPort.ts # interface (inversion de dépendance)
│       └── use-cases/CheckUsernameAvailability.ts
├── infrastructure/             # Détails techniques (remplaçables)
│   └── supabase/
│       ├── client.ts
│       ├── adapters/SupabaseUsernameAvailability.ts   # implémente le port via RPC
│       └── migrations/0001_sprint1_onboarding_state_and_signup_rls.sql
└── presentation/               # UI React + design system
    ├── design-system/          # tokens.css (Ground Truth) + globals.css
    ├── components/             # RadialHalos, AuthShell, BrandHeader, ProgressBar
    ├── hooks/useUsernameAvailability.ts       # debounce 500 ms + AbortController
    └── screens/onboarding/UsernameStep.tsx    # Étape 1/3 — clone pixel-perfect
```

Le flux des dépendances va **presentation → domain ← infrastructure** : le domaine
ne dépend de rien ; l'infra implémente ses ports. On peut swapper Supabase sans
toucher au métier.

## Démarrage

```bash
cp .env.local.example .env.local   # déjà pré-rempli avec la clé publiable soma
npm install
npm run dev                        # http://localhost:5173
```

## Qualité

```bash
npm run typecheck   # tsc --noEmit (strict)
npm run build       # tsc -b && vite build (+ service worker PWA)
```

## Cap vers le natif (prochaine étape)

```bash
npm i @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init SOMA fr.vivalea.soma --web-dir=dist
npm run build && npx cap add ios && npx cap add android && npm run cap:sync
```

## Déploiement (Sprint 4)

Cible : Vercel branché sur le repo Git (builds auto, previews par PR, rollback).

Le dépôt : <https://github.com/aukosjournal-del/soma> — **la racine du repo est l'application**
(pas de sous-dossier), donc rien à configurer côté *Root Directory*.

```bash
git push --force origin main   # remplace intégralement le contenu distant
```

Puis, sur Vercel : *Add New Project* → importer le repo. `vercel.json` fixe déjà
framework, build, rewrites SPA (nécessaires pour `/reset`) et les en-têtes de
cache du service worker.

Variables d'environnement à déclarer dans Vercel (Production + Preview) :

| Clé | Valeur |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://ujanhmwreipxeypkpcoc.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | la clé publiable du projet |

`.github/workflows/ci.yml` lance typecheck strict + build à chaque push et PR.

## Périmètre livré (Sprint 1)

- Arborescence DDD complète (domain / infrastructure / presentation).
- Design system fidèle au prototype (tokens, halos, glass, `tabular-nums`).
- Migration Supabase Sprint 1 **appliquée** (onboarding_state, RLS, seeding, RPC anon).
- **Onboarding Étape 1/3** : choix du pseudo avec vérification de disponibilité
  **réelle** (RPC `is_username_available`, debounce 500 ms, statuts live).
