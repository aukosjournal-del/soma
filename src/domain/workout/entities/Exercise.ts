export type Difficulty = "debutant" | "intermediaire" | "avance" | "expert";

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé",
  expert: "Expert",
};

export const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  debutant: "#10B981",
  intermediaire: "#FBBF24",
  avance: "#F59E71",
  expert: "#EF4444",
};

export const DIFFICULTY_ORDER: Difficulty[] = ["debutant", "intermediaire", "avance", "expert"];

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  difficulty: Difficulty;
  /** Consignes d'exécution, affichées dans la fiche exercice. */
  description: string;
}

/** Chip "Tous" + groupes/équipements distincts présents dans la bibliothèque. */
export const ALL_FILTER = "Tous";

export function distinctValues(items: Exercise[], key: "muscleGroup" | "equipment"): string[] {
  const set = new Set<string>();
  for (const it of items) if (it[key]) set.add(it[key]);
  return [ALL_FILTER, ...Array.from(set).sort((a, b) => a.localeCompare(b, "fr"))];
}

/** Filtre bibliothèque : recherche texte + chips groupe/équipement. */
export function filterExercises(
  items: Exercise[],
  query: string,
  muscle: string,
  equipment: string,
): Exercise[] {
  const q = query.trim().toLowerCase();
  return items.filter((ex) => {
    if (muscle !== ALL_FILTER && ex.muscleGroup !== muscle) return false;
    if (equipment !== ALL_FILTER && ex.equipment !== equipment) return false;
    if (!q) return true;
    return (
      ex.name.toLowerCase().includes(q) ||
      ex.muscleGroup.toLowerCase().includes(q) ||
      ex.equipment.toLowerCase().includes(q)
    );
  });
}

/**
 * Détection heuristique des mouvements polyarticulaires, par mot-clé du nom.
 * Choix assumé : évite d'ajouter une colonne au schéma, reste déterministe.
 */
const COMPOUND_KEYWORDS = [
  "squat",
  "soulevé",
  "souleve",
  "développé",
  "developpe",
  "presse",
  "traction",
  "rowing",
  "tirage",
  "fente",
  "dips",
  "épaulé",
  "epaule",
  "arraché",
  "arrache",
  "hip thrust",
];

export function isCompound(exercise: Exercise): boolean {
  const name = exercise.name.toLowerCase();
  return COMPOUND_KEYWORDS.some((k) => name.includes(k));
}
