/** Saisie nutritionnelle du jour (table nutrition_entries). */
export interface NutritionEntry {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  saltG: number;
}

export function emptyNutrition(): NutritionEntry {
  return { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0, saltG: 0 };
}

/** Objectifs quotidiens, stockés sur le profil. */
export interface DailyGoals {
  stepsGoal: number;
  kcalGoal: number;
}

export interface DailySummary {
  steps: number;
  nutrition: NutritionEntry;
  goals: DailyGoals;
}

/**
 * `stroke-dasharray` d'un anneau de rayon r pour un ratio 0..1.
 * Formule exacte du prototype : la portion pleine est plafonnée à 1 tour.
 */
export function ringDash(radius: number, ratio: number): string {
  const circumference = 2 * Math.PI * radius;
  return `${Math.min(ratio, 1) * circumference} ${circumference}`;
}

export interface Ratios {
  steps: number;
  nutrition: number;
  workout: number;
  /** Moyenne des trois, en pourcentage entier — valeur au centre des anneaux. */
  averagePct: number;
}

/**
 * Ratios des trois anneaux. Repris du prototype : la nutrition est plafonnée
 * à 1, les pas ne le sont pas (on peut dépasser son objectif de pas).
 */
export function computeRatios(
  summary: DailySummary,
  setsDone: number,
  setsTotal: number,
): Ratios {
  const nutrition = summary.goals.kcalGoal > 0 ? Math.min(summary.nutrition.kcal / summary.goals.kcalGoal, 1) : 0;
  const steps = summary.goals.stepsGoal > 0 ? summary.steps / summary.goals.stepsGoal : 0;
  const workout = setsTotal > 0 ? setsDone / setsTotal : 0;
  return {
    steps,
    nutrition,
    workout,
    averagePct: Math.round(((steps + nutrition + workout) / 3) * 100),
  };
}

export const pct = (ratio: number): number => Math.round(Math.min(ratio, 1) * 100);
