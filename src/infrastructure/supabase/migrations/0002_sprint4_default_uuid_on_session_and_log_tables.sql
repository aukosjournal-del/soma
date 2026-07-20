-- =====================================================================
-- SOMA · Sprint 4 · Correctif : clés primaires sans valeur par défaut
-- Statut : APPLIQUÉE sur le projet Supabase "soma" (ujanhmwreipxeypkpcoc)
--          le 2026-07-20.
--
-- Problème détecté en test : `session_sets`, `session_exercises`,
-- `workout_sessions`, `step_entries` et `nutrition_entries` exigeaient un id
-- fourni par le client. Tout INSERT depuis supabase-js échouait avec
-- « null value in column "id" violates not-null constraint ».
--
-- `profiles` est volontairement exclue : son id EST celui de auth.users.
-- Idempotent.
-- =====================================================================

alter table public.workout_sessions  alter column id set default gen_random_uuid();
alter table public.session_exercises alter column id set default gen_random_uuid();
alter table public.session_sets      alter column id set default gen_random_uuid();
alter table public.step_entries      alter column id set default gen_random_uuid();
alter table public.nutrition_entries alter column id set default gen_random_uuid();
