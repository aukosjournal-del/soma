/** Exercice d'une routine (cible planifiée). */
export interface RoutineExercise {
  exerciseId: string;
  name: string;
  position: number;
  targetSets: number;
  targetWeightKg: number;
  targetReps: string;
  restSec: number;
  /** ⭐ exercice de référence pour le calcul du 1RM. */
  favorite: boolean;
}

export interface Routine {
  id: string;
  name: string;
  focus: string | null;
  exercises: RoutineExercise[];
}

export const DAYS_FULL = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
] as const;

/** Index de jour du prototype : 0 = Lundi (aligné sur weekly_plan.weekday). */
export function todayIndex(now: Date = new Date()): number {
  return (now.getDay() + 6) % 7;
}
