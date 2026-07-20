-- Bibliothèque globale d'exercices (owner_id NULL) : ajout des mouvements
-- listés par le co-founder, absents des 19 existants. `Face Pull` couvre déjà
-- "Face Pulls ou Oiseau haltères" (variante du même mouvement) ; les Fentes,
-- le Squat et le Soulevé de Terre génériques couvrent leurs variantes citées
-- (arrière/marchées, barre/haltères) sans doublon nécessaire.
insert into exercises (owner_id, name, muscle_group, equipment, difficulty, description)
select null, v.name, v.muscle_group, v.equipment, v.difficulty::difficulty, v.description
from (values
  ('Soulevé de Terre Roumain (RDL)', 'Jambes', 'Barre', 'intermediaire',
   'Jambes quasi tendues, barre proche des tibias. Faire pivoter le bassin en poussant les fessiers en arrière, dos plat, jusqu''à sentir l''étirement des ischio-jambiers, puis revenir en contractant les fessiers.'),
  ('Développé Incliné (Haltères)', 'Pectoraux', 'Haltères', 'intermediaire',
   'Allongé sur banc incliné à 30-45°. Pousser les haltères au-dessus du haut de la poitrine, coudes à ~45°, puis redescendre contrôlé jusqu''à sentir l''étirement pectoral.'),
  ('Rowing Bûcheron', 'Dos', 'Haltères', 'intermediaire',
   'Un genou et une main en appui sur un banc, dos plat. Tirer l''haltère vers la hanche en reculant le coude, puis redescendre contrôlé sans tourner le buste.'),
  ('Dips', 'Triceps', 'Poids du corps', 'intermediaire',
   'En appui sur barres parallèles, buste légèrement penché en avant. Descendre en fléchissant les coudes jusqu''à ~90°, puis pousser pour remonter sans hausser les épaules.'),
  ('Enroulement de Bassin', 'Abdominaux', 'Poids du corps', 'debutant',
   'Allongé, jambes fléchies à la verticale. Décoller le bassin du sol en enroulant les hanches vers la cage thoracique, contraction abdominale, puis redescendre contrôlé.'),
  ('Cardio Basse Intensité (Zone 2)', 'Cardio', 'Aucun', 'debutant',
   'Effort continu à allure conversationnelle (marche rapide, vélo, rameur), 30 à 60 minutes, fréquence cardiaque stable en zone 2.'),
  ('Cat-Cow (Chat-Vache)', 'Mobilité', 'Poids du corps', 'debutant',
   'À quatre pattes. Alterner creusement du dos en inspirant (vache) et arrondi du dos en expirant (chat), mouvement lent et continu de la colonne.'),
  ('World''s Greatest Stretch', 'Mobilité', 'Poids du corps', 'debutant',
   'Fente avant profonde, main opposée au sol. Ouvrir le buste en tournant vers la jambe avancée, bras vers le plafond, puis alterner les côtés.'),
  ('Dislocations d''épaules', 'Épaules', 'Élastique', 'debutant',
   'Bras tendus, prise large sur l''élastique. Faire passer l''élastique de l''avant vers l''arrière du corps, bras toujours tendus, en gardant les épaules basses.'),
  ('Deadbug (Insecte mort)', 'Abdominaux', 'Poids du corps', 'debutant',
   'Allongé, bras tendus vers le plafond, hanches et genoux fléchis à 90°. Abaisser un bras et la jambe opposée vers le sol sans décoller le bas du dos, puis revenir et alterner.')
) as v(name, muscle_group, equipment, difficulty, description)
where not exists (
  select 1 from exercises e
  where e.owner_id is null and e.deleted_at is null and e.name = v.name
);
