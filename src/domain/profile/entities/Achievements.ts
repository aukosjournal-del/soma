/** Données brutes nécessaires au calcul de la discipline. */
export interface TrainingHistory {
  /** Nombre de séances terminées (toutes périodes). */
  sessionsCompleted: number;
  /** Semaines consécutives avec au moins une séance. */
  streakWeeks: number;
  /** Tonnage cumulé en kg. */
  totalTonnageKg: number;
  /** true si un record de charge a été battu récemment. */
  personalRecordBeaten: boolean;
}

export interface Badge {
  id: string;
  label: string;
  unlocked: boolean;
}

/** Seuils repris du prototype. */
export const BADGE_THRESHOLDS = {
  regularity: 3,
  steel: 4,
  tonnage: 10_000,
} as const;

export function buildBadges(history: TrainingHistory): Badge[] {
  return [
    {
      id: "regularity",
      label: "Régularité",
      unlocked: history.sessionsCompleted >= BADGE_THRESHOLDS.regularity,
    },
    { id: "steel", label: "Acier", unlocked: history.streakWeeks >= BADGE_THRESHOLDS.steel },
    {
      id: "tonnage",
      label: "Tonnage",
      unlocked: history.totalTonnageKg >= BADGE_THRESHOLDS.tonnage,
    },
    { id: "overload", label: "Surcharge", unlocked: history.personalRecordBeaten },
  ];
}

/** Clé de semaine ISO 'YYYY-Www' — sert à mesurer les semaines consécutives. */
export function isoWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Jeudi de la semaine courante détermine l'année ISO.
  const dayNumber = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNumber + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstDayNumber = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNumber + 3);
  const week = 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 86_400_000));
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/**
 * Semaines consécutives avec au moins une séance, en remontant depuis la
 * semaine courante. Une semaine sans séance interrompt la série.
 */
export function computeStreakWeeks(sessionDates: Date[], now: Date = new Date()): number {
  if (sessionDates.length === 0) return 0;
  const weeks = new Set(sessionDates.map(isoWeekKey));

  let streak = 0;
  const cursor = new Date(now);
  for (;;) {
    if (!weeks.has(isoWeekKey(cursor))) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}
