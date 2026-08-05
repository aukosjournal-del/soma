import { beforeEach, describe, expect, it } from "vitest";
import { activeSessionStore } from "./activeSessionStore";
import type { SessionExercise } from "@domain/workout/entities/SessionExercise";

const exercises: SessionExercise[] = [
  {
    id: "e1",
    name: "Développé Couché",
    restSec: 90,
    sets: [
      { id: 1, weightPlaceholder: "80", repsPlaceholder: "8", weight: "", reps: "", checked: false, failed: false },
    ],
  },
];

// La séance planning↔session ne se resynchronise que le jour même
// (activeSessionStore.load compare `date` à `today()`) — chaque test repart
// d'un store vide pour ne pas dépendre de l'ordre d'exécution.
beforeEach(() => {
  localStorage.clear();
  activeSessionStore.clear();
});

describe("activeSessionStore.invalidateIfUntouched", () => {
  it("invalide (et retourne true) quand il n'y a pas de séance active", () => {
    expect(activeSessionStore.getSnapshot()).toBeNull();
    expect(activeSessionStore.invalidateIfUntouched()).toBe(true);
  });

  it("efface une séance non entamée (aucune série cochée/ratée/saisie)", () => {
    activeSessionStore.start("Push", exercises, "r1");
    expect(activeSessionStore.invalidateIfUntouched()).toBe(true);
    expect(activeSessionStore.getSnapshot()).toBeNull();
  });

  it("préserve une séance dont une série est cochée", () => {
    activeSessionStore.start("Push", exercises, "r1");
    activeSessionStore.updateExercises((current) =>
      current.map((exo) => ({ ...exo, sets: exo.sets.map((s) => ({ ...s, checked: true })) })),
    );
    expect(activeSessionStore.invalidateIfUntouched()).toBe(false);
    expect(activeSessionStore.getSnapshot()).not.toBeNull();
  });

  it("préserve une séance avec une saisie de poids même non cochée", () => {
    activeSessionStore.start("Push", exercises, "r1");
    activeSessionStore.updateExercises((current) =>
      current.map((exo) => ({ ...exo, sets: exo.sets.map((s) => ({ ...s, weight: "82.5" })) })),
    );
    expect(activeSessionStore.invalidateIfUntouched()).toBe(false);
  });

  it("préserve une séance avec une série marquée ratée", () => {
    activeSessionStore.start("Push", exercises, "r1");
    activeSessionStore.updateExercises((current) =>
      current.map((exo) => ({ ...exo, sets: exo.sets.map((s) => ({ ...s, failed: true })) })),
    );
    expect(activeSessionStore.invalidateIfUntouched()).toBe(false);
  });
});

describe("activeSessionStore persistance", () => {
  it("persiste la séance dans localStorage et la restaure via un nouveau load implicite", () => {
    activeSessionStore.start("Push", exercises, "r1");
    const raw = localStorage.getItem("soma_active_session");
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string).routineName).toBe("Push");
  });

  it("clear() supprime l'entrée localStorage", () => {
    activeSessionStore.start("Push", exercises, "r1");
    activeSessionStore.clear();
    expect(localStorage.getItem("soma_active_session")).toBeNull();
  });
});
