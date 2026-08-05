import { describe, expect, it } from "vitest";
import type { Routine, RoutineExercise } from "./Routine";
import {
  buildSessionExercises,
  buildSessionFromDraft,
  exerciseEstimatedSec,
  sessionEstimatedSec,
  sessionProgress,
  toggleSetChecked,
  toggleSetFailed,
  updateSetField,
} from "./SessionExercise";

// tsconfig.app.json a `noUncheckedIndexedAccess` : la déstructuration d'un
// tableau donne `T | undefined`. Ces tests savent par construction que
// l'élément existe (routine à 1 exercice) — ce helper évite de parsemer `!`.
function first<T>(arr: T[]): T {
  return at(arr, 0);
}

function at<T>(arr: T[], i: number): T {
  const el = arr[i];
  if (el === undefined) throw new Error(`index ${i} inattendu dans le test`);
  return el;
}

const routineExercise: RoutineExercise = {
  exerciseId: "e1",
  name: "Développé Couché",
  position: 0,
  targetSets: 3,
  targetWeightKg: 80,
  targetReps: "8",
  restSec: 90,
  favorite: true,
};

const routine: Routine = {
  id: "r1",
  name: "Push",
  focus: "Haut du corps",
  exercises: [routineExercise],
};

describe("buildSessionExercises", () => {
  it("renvoie une liste vide sans routine", () => {
    expect(buildSessionExercises(null)).toEqual([]);
  });

  it("construit les séries d'après les cibles de la routine", () => {
    const exo = first(buildSessionExercises(routine, 1));
    expect(exo.sets).toHaveLength(3);
    expect(at(exo.sets, 0).weightPlaceholder).toBe("80");
    expect(at(exo.sets, 0).repsPlaceholder).toBe("8");
    expect(at(exo.sets, 0).checked).toBe(false);
  });

  it("pondère la charge cible par le coefficient d'expérience", () => {
    const exo = first(buildSessionExercises(routine, 0.7));
    // 80 * 0.7 = 56
    expect(at(exo.sets, 0).weightPlaceholder).toBe("56");
  });

  it("retombe sur 90s de repos et 1 série si absents", () => {
    const bare: Routine = {
      ...routine,
      exercises: [{ ...routineExercise, restSec: 0, targetSets: 0 }],
    };
    const exo = first(buildSessionExercises(bare));
    expect(exo.restSec).toBe(90);
    expect(exo.sets).toHaveLength(1);
  });
});

describe("buildSessionFromDraft", () => {
  it("convertit un brouillon Séance Libre en séance exécutable", () => {
    const exo = first(
      buildSessionFromDraft([
        { exerciseId: "e9", name: "Squat", sets: "4", weight: "100", reps: "5", rest: "120" },
      ]),
    );
    expect(exo.sets).toHaveLength(4);
    expect(exo.restSec).toBe(120);
    expect(at(exo.sets, 0).weightPlaceholder).toBe("100");
  });
});

describe("toggleSetChecked", () => {
  it("valide une série vide en la remplissant avec les cibles (comportement prototype)", () => {
    const exo = first(buildSessionExercises(routine, 1));
    const { exercises, justChecked, restSec } = toggleSetChecked([exo], exo.id, 1);
    const updated = at(first(exercises).sets, 0);
    expect(updated.checked).toBe(true);
    expect(updated.weight).toBe("80");
    expect(updated.reps).toBe("8");
    expect(justChecked?.checked).toBe(true);
    expect(restSec).toBe(90);
  });

  it("ne réécrase pas une saisie déjà présente", () => {
    const exo = first(buildSessionExercises(routine, 1));
    const withInput = {
      ...exo,
      sets: exo.sets.map((s) => (s.id === 1 ? { ...s, weight: "82.5", reps: "6" } : s)),
    };
    const { exercises } = toggleSetChecked([withInput], exo.id, 1);
    const set = at(first(exercises).sets, 0);
    expect(set.weight).toBe("82.5");
    expect(set.reps).toBe("6");
  });

  it("dévalide sans justChecked au second appel", () => {
    const exo = first(buildSessionExercises(routine, 1));
    const firstToggle = toggleSetChecked([exo], exo.id, 1);
    const second = toggleSetChecked(firstToggle.exercises, exo.id, 1);
    expect(at(first(second.exercises).sets, 0).checked).toBe(false);
    expect(second.justChecked).toBeNull();
  });
});

describe("toggleSetFailed", () => {
  it("bascule le drapeau failed sans toucher aux autres séries", () => {
    const exo = first(buildSessionExercises(routine, 1));
    const next = toggleSetFailed([exo], exo.id, 2);
    const sets = first(next).sets;
    expect(at(sets, 1).failed).toBe(true);
    expect(at(sets, 0).failed).toBe(false);
  });
});

describe("updateSetField", () => {
  it("met à jour uniquement le champ ciblé de la bonne série", () => {
    const exo = first(buildSessionExercises(routine, 1));
    const next = updateSetField([exo], exo.id, 2, "weight", "82.5");
    const sets = first(next).sets;
    expect(at(sets, 1).weight).toBe("82.5");
    expect(at(sets, 0).weight).toBe("");
  });
});

describe("sessionProgress", () => {
  it("compte les séries validées sur le total", () => {
    const exo = first(buildSessionExercises(routine, 1));
    const { exercises } = toggleSetChecked([exo], exo.id, 1);
    const progress = sessionProgress(exercises);
    expect(progress).toEqual({ done: 1, total: 3, percent: 33 });
  });

  it("renvoie 0% sans division par zéro pour une séance vide", () => {
    expect(sessionProgress([])).toEqual({ done: 0, total: 0, percent: 0 });
  });
});

describe("exerciseEstimatedSec / sessionEstimatedSec", () => {
  it("estime la durée d'un exercice à partir du tempo et du repos", () => {
    const exo = first(buildSessionExercises(routine, 1));
    // 3 séries de 8 reps à tempo 3s/rep = 72s, + 2 intervalles de repos à 90s = 180s
    expect(exerciseEstimatedSec(exo)).toBe(72 + 180);
  });

  it("ajoute les transitions entre exercices mais pas après le dernier", () => {
    const twoExo = buildSessionExercises(
      { ...routine, exercises: [routineExercise, routineExercise] },
      1,
    );
    const total = sessionEstimatedSec(twoExo);
    const perExo = exerciseEstimatedSec(first(twoExo));
    // une seule transition (entre les 2 exercices, pas après le dernier)
    expect(total).toBe(perExo * 2 + 120);
  });
});
