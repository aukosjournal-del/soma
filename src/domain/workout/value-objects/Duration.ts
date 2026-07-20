/** mm:ss — utilisé par le minuteur de repos et le chrono de séance. */
export function fmtTime(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** "12min 30s" / "45s" — utilisé pour les durées estimées. */
export function fmtMinSec(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = Math.round(totalSec % 60);
  return m > 0 ? `${m}min ${s}s` : `${s}s`;
}

/** Secondes par répétition selon la charge — formules exactes du prototype. */
export function tempoForReps(reps: number): number {
  if (reps <= 5) return 4;
  if (reps <= 12) return 3;
  return 2;
}

/** Repos recommandé selon les répétitions — formule exacte du prototype. */
export function restForReps(reps: number): number {
  if (reps <= 5) return 180;
  if (reps <= 12) return 90;
  return 45;
}

/** Temps de transition entre deux exercices, dérivé du temps de repos. */
export function transitionTimeForRest(restSec: number): number {
  if (restSec >= 150) return 180;
  if (restSec >= 75) return 120;
  return 90;
}
