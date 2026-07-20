# Infrastructure · Supabase

Projet **soma** — `ujanhmwreipxeypkpcoc` (eu-west-1).

## État du schéma (Sprint 1)

Le schéma préexistant fournissait déjà l'essentiel du modèle « User » :

- `public.profiles` : `username citext NOT NULL UNIQUE` (index `profiles_username_key`),
  `CHECK char_length(username) between 3 and 30` → **@pseudo unique indexé** ✔,
  FK `id → auth.users(id) ON DELETE CASCADE`, RLS activée.
- Fonction `set_updated_at()` + RPC `is_username_available(text)`.

La migration `0001_sprint1_onboarding_state_and_signup_rls.sql` (appliquée en
direct le 2026-07-20) complète **uniquement** les manques du Sprint 1 :

1. Table `onboarding_state` (1:1 `auth.users`, étapes internes 1..4) + RLS + `updated_at`.
2. Trigger `profiles_seed_onboarding` : ouvre l'onboarding à la création d'un profil.
3. Policy `profiles_insert_own` (l'inscription peut créer sa ligne).
4. `grant execute on is_username_available(text) to anon` (check pré-session).

## Vérification du pseudo

Le front n'interroge jamais la table `profiles` directement : il appelle le RPC
`is_username_available(p_username)` (STABLE, SECURITY DEFINER). Longueur et
unicité (insensible à la casse via `citext`) sont donc une **source de vérité
unique en base**.

## Types générés

```bash
npm run gen:types   # nécessite la CLI supabase authentifiée
```
