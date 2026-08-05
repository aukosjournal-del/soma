-- Complète la bibliothèque avec les mouvements des 4 séances du co-founder
-- (2026-07) absents des 52 existants. Après audit, seuls 3 mouvements ne sont
-- couverts par aucune entrée : la marche fractionnée, le port de charge et le
-- bloc mobilité générique de fin de séance. Tout le reste correspond déjà à une
-- entrée existante (Presse à Cuisses = Leg Press, Face-Pull = Face Pull,
-- Écartés Pecs = Écartés/Pec Deck, Fentes Marchées = Fentes, Deadlift = Soulevé
-- de Terre, etc.). muscle_group/equipment sont des colonnes text libres ; on
-- réutilise les libellés déjà en place pour rester cohérent avec les filtres.
insert into exercises (owner_id, name, muscle_group, equipment, difficulty, description)
select null, v.name, v.muscle_group, v.equipment, v.difficulty::difficulty, v.description
from (values
  ('Marche Japonaise', 'Cardio', 'Aucun', 'debutant',
   'Marche fractionnée par intervalles : alterner 3 min de marche lente (allure de récupération) et 3 min de marche rapide (allure soutenue mais tenable), en commençant toujours par la phase lente. Répéter le cycle selon la durée visée (ex. 3x3 = 18 min, 4x3 = 24 min).'),
  ('Farmer''s Walk (Marche du Fermier)', 'Abdominaux', 'Haltères', 'intermediaire',
   'Port de charge lourde dans chaque main, bras le long du corps. Marcher sur une distance donnée (40 à 60 m) en gardant le tronc gainé, les épaules basses et le dos droit, sans balancer la charge. Travaille la poigne, les trapèzes et le gainage anti-latéral.'),
  ('Mobilité / Déverrouillage', 'Mobilité', 'Poids du corps', 'debutant',
   'Séquence libre d''étirements et de déverrouillage articulaire (5 min) en fin de séance : cibler hanches, épaules, chevilles et colonne par des mouvements lents et contrôlés pour relâcher les tensions et récupérer.')
) as v(name, muscle_group, equipment, difficulty, description)
where not exists (
  select 1 from exercises e
  where e.owner_id is null and e.deleted_at is null and e.name = v.name
);
