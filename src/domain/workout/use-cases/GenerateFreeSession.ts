import {
  type Difficulty,
  type Exercise,
  DIFFICULTY_ORDER,
  isCompound,
} from "../entities/Exercise";
import type { RoutineDraftExercise } from "../ports/RoutineRepository";
import { restForReps } from "../value-objects/Duration";

export type Objective = "force" | "hypertrophie" | "endurance";

/**
 * Prescription par objectif — séries, répétitions et priorité aux mouvements
 * polyarticulaires. Le repos est dérivé des reps (restForReps), comme le prototype.
 */
const PRESCRIPTION: Record<Objective, { sets: number; reps: number; compoundFirst: boolean }> = {
  force: { sets: 5, reps: 5, compoundFirst: true },
  hypertrophie: { sets: 4, reps: 10, compoundFirst: true },
  endurance: { sets: 3, reps: 15, compoundFirst: false },
};

/** Un débutant ne se voit jamais proposer un mouvement au-dessus de son niveau. */
function withinLevel(exercise: Exercise, level: Difficulty): boolean {
  return DIFFICULTY_ORDER.indexOf(exercise.difficulty) <= DIFFICULTY_ORDER.indexOf(level);
}

/** Correspondance texte libre -> groupe / équipement / nom (logique du prototype). */
function matchesDescription(exercise: Exercise, description: string): boolean {
  const q = description.toLowerCase();
  if (!q.trim()) return true;
  return (
    q.includes(exercise.muscleGroup.toLowerCase()) ||
    q.includes(exercise.equipment.toLowerCase()) ||
    q.includes(exercise.name.toLowerCase())
  );
}

export interface FreeSessionInput {
  library: Exercise[];
  description: string;
  objective: Objective;
  level: Difficulty;
  /** Nombre d'exercices retenus (5 par défaut, comme le prototype). */
  count?: number;
}

/**
 * Moteur de « Séance Libre » — 100 % local et déterministe : aucune dépendance
 * réseau, aucune clé secrète, fonctionne hors-ligne.
 *
 * Sélection : description libre -> filtre niveau -> priorité polyarticulaire
 * selon l'objectif -> diversification des groupes musculaires.
 */
export function generateFreeSession(input: FreeSessionInput): RoutineDraftExercise[] {
  const { library, description, objective, level, count = 5 } = input;
  const prescription = PRESCRIPTION[objective];

  // 1) Filtre par description ; si rien ne matche, on repart de la bibliothèque entière.
  let pool = library.filter((e) => matchesDescription(e, description));
  if (pool.length === 0) pool = [...library];

  // 2) Filtre de sécurité par niveau ; si trop restrictif, on garde le pool.
  const atLevel = pool.filter((e) => withinLevel(e, level));
  if (atLevel.length > 0) pool = atLevel;

  // 3) Tri : polyarticulaires d'abord si l'objectif l'exige, puis nom (déterminisme).
  const sorted = [...pool].sort((a, b) => {
    if (prescription.compoundFirst) {
      const diff = Number(isCompound(b)) - Number(isCompound(a));
      if (diff !== 0) return diff;
    }
    return a.name.localeCompare(b.name, "fr");
  });

  // 4) Diversification : un exercice par groupe musculaire tant que possible.
  const picked: Exercise[] = [];
  const usedGroups = new Set<string>();
  for (const ex of sorted) {
    if (picked.length >= count) break;
    if (usedGroups.has(ex.muscleGroup)) continue;
    picked.push(ex);
    usedGroups.add(ex.muscleGroup);
  }
  for (const ex of sorted) {
    if (picked.length >= count) break;
    if (!picked.includes(ex)) picked.push(ex);
  }

  // 5) Prescription des charges/volumes.
  return picked.map((ex) => ({
    exerciseId: ex.id,
    name: ex.name,
    sets: String(prescription.sets),
    weight: "0",
    reps: String(prescription.reps),
    rest: String(restForReps(prescription.reps)),
    favorite: false,
  }));
}
