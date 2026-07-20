-- Complète la bibliothèque avec les mouvements listés par le co-founder,
-- absents des 29 existants. Les variantes Salle/Maison d'un même mouvement
-- (ex. Squat barre vs poids du corps) ne créent pas de ligne séparée — c'est
-- la même entrée, seule la charge change. Seuls les mouvements au nom et à
-- l'exécution distincts sont ajoutés ici (ex. Bulgarian Split Squat, Curl
-- Marteau), suivant la convention déjà en place (Squat vs Squat Gobelet).
insert into exercises (owner_id, name, muscle_group, equipment, difficulty, description)
select null, v.name, v.muscle_group, v.equipment, v.difficulty::difficulty, v.description
from (values
  ('Leg Extension', 'Jambes', 'Machine', 'debutant',
   'Assis sur la machine, tibias sous les rouleaux. Tendre les jambes en contractant les quadriceps, marquer un temps en haut, puis redescendre contrôlé sans à-coup.'),
  ('Hack Squat', 'Jambes', 'Machine', 'intermediaire',
   'Dos calé contre le dossier incliné, pieds à plat sur la plateforme. Fléchir les genoux jusqu''à ~90°, puis pousser pour remonter sans décoller le bas du dos.'),
  ('Bulgarian Split Squat', 'Jambes', 'Haltères', 'intermediaire',
   'Pied arrière surélevé sur un banc, haltères en mains. Descendre en fléchissant le genou avant jusqu''à ~90°, buste droit, puis pousser pour remonter.'),
  ('Sissy Squat', 'Jambes', 'Poids du corps', 'avance',
   'Talons ancrés au sol ou pointes fixées, genoux vers l''avant. Descendre en inclinant le buste en arrière, quadriceps sous tension, puis remonter contrôlé.'),
  ('Glute Bridge (Élévation du Bassin)', 'Jambes', 'Poids du corps', 'debutant',
   'Allongé, genoux fléchis, pieds à plat. Pousser dans les talons pour décoller le bassin en contractant les fessiers, puis redescendre contrôlé sans creuser le dos.'),
  ('Good Morning', 'Jambes', 'Barre', 'avance',
   'Barre sur les trapèzes, genoux légèrement fléchis. Basculer le buste vers l''avant en poussant les hanches en arrière, dos plat, puis revenir en contractant les fessiers.'),
  ('Abducteurs (Machine)', 'Jambes', 'Machine', 'debutant',
   'Assis, genoux contre les appuis de la machine. Écarter les jambes contre la résistance en contractant les fessiers moyens, puis revenir contrôlé.'),
  ('Développé Décliné', 'Pectoraux', 'Barre', 'intermediaire',
   'Allongé sur banc décliné, pieds calés. Descendre la barre vers le bas de la poitrine, coudes à ~45°, puis pousser en expirant sans verrouiller brutalement.'),
  ('Écartés (Pec Deck)', 'Pectoraux', 'Machine', 'debutant',
   'Assis, avant-bras contre les appuis. Rapprocher les bras devant la poitrine en gardant un angle de coude fixe, puis revenir contrôlé jusqu''à l''étirement pectoral.'),
  ('Pull-over', 'Pectoraux', 'Haltères', 'intermediaire',
   'Allongé en travers d''un banc, haltère tenu à deux mains au-dessus de la poitrine. Descendre la charge derrière la tête bras semi-tendus, puis remonter.'),
  ('Rowing Poulie Basse', 'Dos', 'Poulie', 'debutant',
   'Assis, pieds calés, buste droit. Tirer la poignée vers l''abdomen en reculant les coudes, omoplates rapprochées, puis revenir contrôlé sans arrondir le dos.'),
  ('Tirage Bras Tendus', 'Dos', 'Poulie', 'debutant',
   'Debout face à la poulie haute, bras tendus. Pousser la corde vers les cuisses en gardant les coudes fixes et légèrement fléchis, puis revenir contrôlé.'),
  ('Superman (Extensions Lombaires)', 'Dos', 'Poids du corps', 'debutant',
   'Allongé à plat ventre, ou sur banc à 45°. Relever le buste (et les jambes si au sol) en contractant les lombaires, puis redescendre contrôlé sans à-coup.'),
  ('Élévations Frontales', 'Épaules', 'Haltères', 'debutant',
   'Debout, haltères devant les cuisses. Lever un bras tendu jusqu''à hauteur d''épaule, puis redescendre contrôlé avant d''alterner ou lever les deux ensemble.'),
  ('Oiseau (Reverse Fly)', 'Épaules', 'Haltères', 'debutant',
   'Buste penché en avant, haltères sous les épaules. Écarter les bras sur les côtés jusqu''à hauteur d''épaule, coudes légèrement fléchis, puis redescendre contrôlé.'),
  ('Curl Marteau', 'Biceps', 'Haltères', 'debutant',
   'Debout, haltères en prise neutre le long du corps. Fléchir les coudes pour remonter vers les épaules sans tourner les poignets, puis redescendre lentement.'),
  ('Curl Incliné', 'Biceps', 'Haltères', 'intermediaire',
   'Dos calé sur un banc incliné à 45°, bras pendants. Fléchir les coudes pour remonter les haltères, étirement maximal en bas, puis redescendre contrôlé.'),
  ('Barre au Front (Skullcrusher)', 'Triceps', 'Barre', 'intermediaire',
   'Allongé sur banc, barre EZ tendue au-dessus du visage. Fléchir uniquement les coudes pour amener la barre près du front, puis tendre les bras sans bouger les épaules.'),
  ('Pompes Diamant', 'Triceps', 'Poids du corps', 'intermediaire',
   'En position de pompe, mains jointes sous le sternum en losange. Descendre coudes près du corps, puis pousser pour remonter.'),
  ('Crunch à la Poulie', 'Abdominaux', 'Poulie', 'intermediaire',
   'À genoux face à la poulie haute, corde tenue près du visage. Enrouler le buste vers le bassin en contractant les abdominaux, puis remonter contrôlé.'),
  ('Relevé de Jambes', 'Abdominaux', 'Poids du corps', 'intermediaire',
   'Suspendu à une barre ou allongé au sol, jambes tendues. Lever les jambes vers la poitrine en contractant les abdominaux sans balancer, puis redescendre contrôlé.'),
  ('Ab Wheel (Roulette)', 'Abdominaux', 'Roulette', 'avance',
   'À genoux, roulette tenue à deux mains. Rouler vers l''avant en gainant le tronc jusqu''à l''extension maximale sans creuser le dos, puis revenir en contractant les abdominaux.'),
  ('Russian Twists', 'Abdominaux', 'Poids du corps', 'debutant',
   'Assis, buste incliné en arrière, pieds au sol ou levés. Faire pivoter le buste d''un côté à l''autre en touchant le sol de part et d''autre du bassin.'),
  ('Pallof Press', 'Abdominaux', 'Poulie', 'intermediaire',
   'Debout de profil à la poulie, poignée tenue devant le sternum. Pousser les bras devant soi en résistant à la rotation du buste, puis revenir contrôlé.')
) as v(name, muscle_group, equipment, difficulty, description)
where not exists (
  select 1 from exercises e
  where e.owner_id is null and e.deleted_at is null and e.name = v.name
);
