import type { Routine } from "../entities/Routine";

/** Exercice tel qu'édité dans le bottom sheet (valeurs saisies = chaînes). */
export interface RoutineDraftExercise {
  exerciseId: string;
  name: string;
  sets: string;
  weight: string;
  reps: string;
  rest: string;
  favorite: boolean;
}

export interface RoutineDraft {
  /** absent = création */
  id?: string;
  name: string;
  focus: string;
  exercises: RoutineDraftExercise[];
}

/** weekday (0 = Lundi) -> id de routine assignée (ou null). */
export type WeeklyPlan = Record<number, string | null>;

/**
 * Port d'accès aux routines et au planning hebdomadaire.
 * Le domaine ignore Supabase.
 */
export interface RoutineRepository {
  /** Routine assignée à un jour de la semaine (0 = Lundi), ou null si repos. */
  getRoutineForWeekday(weekday: number): Promise<Routine | null>;
  listRoutines(): Promise<Routine[]>;
  getWeeklyPlan(): Promise<WeeklyPlan>;
  /** Assigne (ou retire si routineId = null) une routine à un jour. */
  assignRoutine(weekday: number, routineId: string | null): Promise<void>;
  /** Crée ou met à jour une routine et remplace ses exercices. Retourne l'id. */
  saveRoutine(draft: RoutineDraft): Promise<string>;
  /** Suppression douce (deleted_at). */
  deleteRoutine(routineId: string): Promise<void>;
}
