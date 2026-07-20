-- =====================================================================
-- SOMA · Journal quotidien : une seule ligne par utilisateur et par jour
-- Statut : APPLIQUÉE sur le projet Supabase "soma" (ujanhmwreipxeypkpcoc)
--          le 2026-07-20.
--
-- Sans contrainte d'unicité, chaque « Saisie rapide » créait une ligne
-- supplémentaire : les totaux hebdomadaires (pas, kcal) auraient additionné
-- les doublons. La contrainte permet aussi l'upsert côté client.
-- Idempotent.
-- =====================================================================

-- Dédoublonnage préalable : on conserve la ligne la plus récente.
delete from public.step_entries a
using public.step_entries b
where a.user_id = b.user_id
  and a.entry_date = b.entry_date
  and a.created_at < b.created_at;

delete from public.nutrition_entries a
using public.nutrition_entries b
where a.user_id = b.user_id
  and a.entry_date = b.entry_date
  and a.created_at < b.created_at;

create unique index if not exists step_entries_user_date_key
  on public.step_entries (user_id, entry_date);

create unique index if not exists nutrition_entries_user_date_key
  on public.nutrition_entries (user_id, entry_date);
