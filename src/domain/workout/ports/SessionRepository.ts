import type { SessionExercise } from "../entities/SessionExercise";

export interface CompletedSession {
  /** Clé d'idempotence = id de la ligne workout_sessions. Un rejeu ne duplique pas. */
  id: string;
  /** null pour une Séance Libre. */
  routineId: string | null;
  source: "routine" | "free";
  routineName: string | null;
  durationSec: number;
  exercises: SessionExercise[];
}

/**
 * Persistance d'une séance terminée (workout_sessions + session_exercises
 * + session_sets). Appelée à la clôture, l'app restant offline-first.
 */
export interface SessionRepository {
  saveCompleted(session: CompletedSession): Promise<string>;
}
