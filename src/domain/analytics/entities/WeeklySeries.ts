import { todayIndex } from "@domain/workout/entities/Routine";

export const DAYS_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"] as const;

export interface WeeklyBar {
  day: string;
  value: number;
  /** Hauteur relative en %, 0 si la semaine est vide. */
  heightPct: number;
  isToday: boolean;
}

/** Série hebdomadaire : 7 valeurs indexées 0 = Lundi. */
export type WeeklyValues = number[];

export function emptyWeek(): WeeklyValues {
  return [0, 0, 0, 0, 0, 0, 0];
}

export function weekTotal(values: WeeklyValues): number {
  return values.reduce((a, v) => a + v, 0);
}

/**
 * Transforme 7 valeurs brutes en barres prêtes à l'affichage.
 * La hauteur est relative au maximum de la semaine (barres compactes).
 */
export function toBars(values: WeeklyValues, now: Date = new Date()): WeeklyBar[] {
  const max = Math.max(...values, 0);
  const today = todayIndex(now);
  return values.map((value, i) => ({
    day: DAYS_SHORT[i] ?? "",
    value,
    heightPct: max > 0 ? Math.round((value / max) * 100) : 0,
    isToday: i === today,
  }));
}

/** Lundi 00:00 de la semaine courante (semaine ISO, cohérent avec weekly_plan). */
export function startOfWeek(now: Date = new Date()): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - todayIndex(now));
  return d;
}

/** Index 0..6 (Lundi..Dimanche) d'une date, ou null hors de la semaine. */
export function weekdayIndexOf(date: Date, weekStart: Date): number | null {
  const diffDays = Math.floor((date.getTime() - weekStart.getTime()) / 86_400_000);
  return diffDays >= 0 && diffDays < 7 ? diffDays : null;
}
