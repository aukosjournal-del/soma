/**
 * Formule de Brzycki — estimation du 1RM (répétition maximale).
 *
 *   1RM = Poids / (1.0278 - 0.0278 × Répétitions)
 *
 * Valide pour 1..36 répétitions : au-delà le dénominateur devient nul ou
 * négatif et la formule perd tout sens physiologique.
 */
export function brzycki(weightKg: number, reps: number): number {
  if (!Number.isFinite(weightKg) || weightKg <= 0) return 0;
  if (!Number.isFinite(reps) || reps <= 0 || reps > 36) return 0;
  const denominator = 1.0278 - 0.0278 * reps;
  if (denominator <= 0) return 0;
  return weightKg / denominator;
}

export interface BestSet {
  exerciseName: string;
  weightKg: number;
  reps: number;
}

/** Série la plus lourde d'une liste (critère : charge, puis répétitions). */
export function heaviestSet(sets: BestSet[]): BestSet | null {
  if (sets.length === 0) return null;
  return sets.reduce((best, s) => {
    if (s.weightKg > best.weightKg) return s;
    if (s.weightKg === best.weightKg && s.reps > best.reps) return s;
    return best;
  });
}

/**
 * Intensité relative de la série par rapport au 1RM estimé.
 * Seuils et libellés repris du prototype (loadCategory).
 */
export function loadCategory(ratio: number): { label: string; color: string } {
  if (ratio >= 0.85) return { label: "Lourde", color: "#EF4444" };
  if (ratio >= 0.7) return { label: "Modérée", color: "#F59E71" };
  return { label: "Légère", color: "#10B981" };
}
