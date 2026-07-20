import type { DailySummary, NutritionEntry } from "../entities/DailySummary";

/** Journal quotidien : pas, nutrition et objectifs du profil. */
export interface DailyLogRepository {
  getToday(): Promise<DailySummary>;
  /**
   * Remplace la saisie nutritionnelle d'une journée.
   * `date` ('YYYY-MM-DD') est explicite : lors d'un rejeu hors-ligne, la donnée
   * doit atterrir sur le jour où elle a été saisie, pas sur celui du rejeu.
   */
  saveNutrition(entry: NutritionEntry, date: string): Promise<void>;
  /** Remplace le nombre de pas d'une journée. */
  saveSteps(steps: number, date: string): Promise<void>;
}

/** Date locale au format 'YYYY-MM-DD' (sans décalage UTC). */
export function localISODate(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
