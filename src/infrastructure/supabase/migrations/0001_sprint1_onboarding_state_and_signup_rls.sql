-- =====================================================================
-- SOMA · Sprint 1 · Fondations Auth & Onboarding
-- Statut : APPLIQUÉE en direct sur le projet Supabase "soma"
--          (ujanhmwreipxeypkpcoc, eu-west-1) le 2026-07-20.
--
-- Contexte : le schéma existant fournit déjà `public.profiles` avec
--   - username citext NOT NULL, UNIQUE (index profiles_username_key),
--     CHECK char_length between 3 and 30  -> "@pseudo unique indexé" ✔
--   - FK id -> auth.users(id) ON DELETE CASCADE, RLS activée
--   - fonction set_updated_at() + RPC is_username_available(text)
-- Cette migration complète UNIQUEMENT les manques du périmètre Sprint 1.
-- Idempotente : ré-exécutable sans effet de bord.
-- =====================================================================

-- 1) Table d'état d'avancement de l'onboarding (1:1 avec auth.users) -----
create table if not exists public.onboarding_state (
  user_id              uuid        primary key references auth.users(id) on delete cascade,
  current_step         smallint    not null default 1 check (current_step between 1 and 4),
  email_verified       boolean     not null default false,
  username_set         boolean     not null default false,
  physical_profile_set boolean     not null default false,
  experience_set       boolean     not null default false,
  completed_at         timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

comment on table public.onboarding_state is
  'Progression du parcours d''inscription en 3 étapes (interne 1..4). 1:1 avec auth.users.';

-- updated_at auto (réutilise la fonction existante set_updated_at)
drop trigger if exists onboarding_state_updated_at on public.onboarding_state;
create trigger onboarding_state_updated_at
  before update on public.onboarding_state
  for each row execute function public.set_updated_at();

-- 2) RLS : chaque utilisateur ne voit/écrit que sa propre ligne ---------
alter table public.onboarding_state enable row level security;

drop policy if exists onboarding_select_own on public.onboarding_state;
create policy onboarding_select_own on public.onboarding_state
  for select using ((select auth.uid()) = user_id);

drop policy if exists onboarding_insert_own on public.onboarding_state;
create policy onboarding_insert_own on public.onboarding_state
  for insert with check ((select auth.uid()) = user_id);

drop policy if exists onboarding_update_own on public.onboarding_state;
create policy onboarding_update_own on public.onboarding_state
  for update using ((select auth.uid()) = user_id)
             with check ((select auth.uid()) = user_id);

-- 3) Seeding automatique : à la création d'un profil, on ouvre l'onboarding
create or replace function public.seed_onboarding_state()
  returns trigger
  language plpgsql
  security definer
  set search_path = public
as $$
begin
  insert into public.onboarding_state (user_id, current_step, username_set, email_verified)
  values (
    new.id,
    2, -- le profil (donc le @pseudo) vient d'être posé -> prochaine étape = profil physique
    true,
    exists (select 1 from auth.users u where u.id = new.id and u.email_confirmed_at is not null)
  )
  on conflict (user_id) do update
    set username_set = true,
        current_step = greatest(public.onboarding_state.current_step, 2);
  return new;
end
$$;

drop trigger if exists profiles_seed_onboarding on public.profiles;
create trigger profiles_seed_onboarding
  after insert on public.profiles
  for each row execute function public.seed_onboarding_state();

-- 4) Policy INSERT manquante sur profiles (sinon l'inscription échoue) ---
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert with check ((select auth.uid()) = id);

-- 5) Le check de disponibilité doit fonctionner avant session (anon) -----
grant execute on function public.is_username_available(text) to anon;
