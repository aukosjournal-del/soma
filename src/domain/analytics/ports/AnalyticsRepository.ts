import type { WeeklyValues } from "../entities/WeeklySeries";
import type { BestSet } from "../value-objects/Brzycki";
import type { ExerciseHistoryEntry } from "../entities/Progression";

export interface WeeklyAnalytics {
  /** Tonnage par jour (kg) = Σ charge × répétitions des séries validées. */
  volume: WeeklyValues;
  steps: WeeklyValues;
  kcal: WeeklyValues;
  /** Séries validées aujourd'hui, pour le 1RM estimé. */
  todaySets: BestSet[];
}

export interface AnalyticsRepository {
  getWeeklyAnalytics(weekStart: Date): Promise<WeeklyAnalytics>;
  /** Historique des séries validées, groupé par nom d'exercice. */
  getExerciseHistory(): Promise<Record<string, ExerciseHistoryEntry[]>>;
}
