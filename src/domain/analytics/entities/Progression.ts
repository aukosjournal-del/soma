import { brzycki } from "../value-objects/Brzycki";

/** Historique brut d'un exercice : séries validées, ordonnées dans le temps. */
export interface ExerciseHistoryEntry {
  weightKg: number;
  reps: number;
  completedAt: string;
}

export interface ExerciseProgression {
  name: string;
  firstKg: number;
  lastKg: number;
  deltaLabel: string;
  deltaColor: string;
  /** "1RM ≈ 133kg", ou chaîne vide si non pertinent. */
  rmLabel: string;
}

/**
 * Évolution de la charge d'un exercice entre sa première et sa dernière série
 * validée. Logique reprise du prototype : le 1RM n'est affiché que pour des
 * séries de 1 à 10 répétitions (au-delà, l'estimation devient peu fiable).
 */
export function buildProgression(
  name: string,
  history: ExerciseHistoryEntry[],
): ExerciseProgression | null {
  if (history.length === 0) return null;

  const sorted = [...history].sort((a, b) => a.completedAt.localeCompare(b.completedAt));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (!first || !last) return null;

  const delta = Math.round((last.weightKg - first.weightKg) * 10) / 10;
  const rmValue = last.reps > 0 && last.reps <= 10 ? Math.round(brzycki(last.weightKg, last.reps)) : 0;

  return {
    name,
    firstKg: first.weightKg,
    lastKg: last.weightKg,
    deltaLabel: delta > 0 ? `+${delta}kg` : delta < 0 ? `${delta}kg` : "=",
    deltaColor: delta > 0 ? "#10B981" : delta < 0 ? "#EF4444" : "rgba(192,235,255,0.5)",
    rmLabel: rmValue > 0 ? `1RM ≈ ${rmValue}kg` : "",
  };
}
