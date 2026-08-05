import type { Routine } from "./Routine";
import { tempoForReps, transitionTimeForRest } from "../value-objects/Duration";

/** Une série. `checked` verrouille la ligne (inputs désactivés). */
export interface SessionSet {
  id: number;
  /** Placeholders = cibles planifiées, pondérées par le coefficient d'expérience. */
  weightPlaceholder: string;
  repsPlaceholder: string;
  weight: string;
  reps: string;
  checked: boolean;
  failed: boolean;
}

export interface SessionExercise {
  id: string;
  name: string;
  restSec: number;
  sets: SessionSet[];
}

/**
 * Construit la séance à partir de la routine du jour. Le coefficient
 * d'expérience pondère la charge cible (0.7 / 1 / 1.3) — logique du prototype.
 */
export function buildSessionExercises(routine: Routine | null, coefficient = 1): SessionExercise[] {
  if (!routine) return [];
  return routine.exercises.map((exo, exIdx) => ({
    id: `${routine.id}-${exIdx}`,
    name: exo.name,
    restSec: exo.restSec || 90,
    sets: Array.from({ length: exo.targetSets || 1 }, (_, i) => ({
      id: i + 1,
      weightPlaceholder: String(Math.round((exo.targetWeightKg || 0) * coefficient)),
      repsPlaceholder: exo.targetReps,
      weight: "",
      reps: "",
      checked: false,
      failed: false,
    })),
  }));
}

/** Convertit un brouillon (Séance Libre / éditeur) en séance exécutable. */
export function buildSessionFromDraft(
  drafts: { exerciseId: string; name: string; sets: string; weight: string; reps: string; rest: string }[],
): SessionExercise[] {
  return drafts.map((d, i) => ({
    id: `free-${i}-${d.exerciseId}`,
    name: d.name,
    restSec: parseInt(d.rest, 10) || 90,
    sets: Array.from({ length: parseInt(d.sets, 10) || 1 }, (_, k) => ({
      id: k + 1,
      weightPlaceholder: String(parseFloat(d.weight) || 0),
      repsPlaceholder: d.reps,
      weight: "",
      reps: "",
      checked: false,
      failed: false,
    })),
  }));
}

// --- Transitions pures (aucun effet de bord) ---------------------------

/**
 * Valide/dévalide une série. À la validation, les champs vides sont remplis
 * par les cibles — comportement exact du prototype (toggleCheck).
 */
export function toggleSetChecked(
  exercises: SessionExercise[],
  exerciseId: string,
  setId: number,
): { exercises: SessionExercise[]; justChecked: SessionSet | null; restSec: number } {
  let justChecked: SessionSet | null = null;
  let restSec = 90;

  const next = exercises.map((exo) => {
    if (exo.id !== exerciseId) return exo;
    restSec = exo.restSec || 90;
    return {
      ...exo,
      sets: exo.sets.map((st) => {
        if (st.id !== setId) return st;
        const updated: SessionSet = { ...st, checked: !st.checked };
        if (updated.checked) {
          if (!updated.weight) updated.weight = updated.weightPlaceholder;
          if (!updated.reps && !Number.isNaN(parseInt(updated.repsPlaceholder, 10))) {
            updated.reps = updated.repsPlaceholder;
          }
          justChecked = updated;
        }
        return updated;
      }),
    };
  });

  return { exercises: next, justChecked, restSec };
}

export function toggleSetFailed(
  exercises: SessionExercise[],
  exerciseId: string,
  setId: number,
): SessionExercise[] {
  return exercises.map((exo) =>
    exo.id !== exerciseId
      ? exo
      : { ...exo, sets: exo.sets.map((st) => (st.id !== setId ? st : { ...st, failed: !st.failed })) },
  );
}

export function updateSetField(
  exercises: SessionExercise[],
  exerciseId: string,
  setId: number,
  field: "weight" | "reps",
  value: string,
): SessionExercise[] {
  return exercises.map((exo) =>
    exo.id !== exerciseId
      ? exo
      : {
          ...exo,
          sets: exo.sets.map((st) => (st.id !== setId ? st : { ...st, [field]: value })),
        },
  );
}

// --- Sélecteurs --------------------------------------------------------

export function sessionProgress(exercises: SessionExercise[]): {
  done: number;
  total: number;
  percent: number;
} {
  const total = exercises.reduce((a, e) => a + e.sets.length, 0);
  const done = exercises.reduce((a, e) => a + e.sets.filter((s) => s.checked).length, 0);
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

/**
 * Volume total soulevé (kg) — somme de charge × répétitions sur les seules
 * séries validées. Les séries non validées ne comptent pas : le volume est un
 * bilan de travail réellement effectué, pas une projection.
 */
export function sessionVolumeKg(exercises: SessionExercise[]): number {
  return exercises.reduce(
    (total, exo) =>
      total +
      exo.sets.reduce((sum, st) => {
        if (!st.checked) return sum;
        const weight = parseFloat(st.weight || st.weightPlaceholder) || 0;
        const reps = parseInt(st.reps || st.repsPlaceholder, 10) || 0;
        return sum + weight * reps;
      }, 0),
    0,
  );
}

/** Durée estimée d'un exercice : séries (tempo × reps) + repos intercalaires. */
export function exerciseEstimatedSec(exo: SessionExercise): number {
  const setsTime = exo.sets.reduce((a, st) => {
    const reps = parseInt(st.reps || st.repsPlaceholder, 10) || 0;
    return a + reps * tempoForReps(reps);
  }, 0);
  return setsTime + Math.max(0, exo.sets.length - 1) * (exo.restSec || 90);
}

/** Durée estimée d'une routine planifiée (avant démarrage de la séance). */
export function routineEstimatedSec(routine: Routine): number {
  return sessionEstimatedSec(buildSessionExercises(routine, 1));
}

/** Durée estimée de la séance : exercices + transitions entre exercices. */
export function sessionEstimatedSec(exercises: SessionExercise[]): number {
  const core = exercises.reduce((a, exo) => a + exerciseEstimatedSec(exo), 0);
  const transitions = exercises
    .slice(0, -1)
    .reduce((a, exo) => a + transitionTimeForRest(exo.restSec || 90), 0);
  return core + transitions;
}
