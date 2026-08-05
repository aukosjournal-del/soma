import { describe, expect, it } from "vitest";
import { brzycki, heaviestSet, loadCategory } from "./Brzycki";

describe("brzycki", () => {
  it("calcule le 1RM selon la formule officielle", () => {
    // 100kg × 5 reps -> 100 / (1.0278 - 0.139) = 100 / 0.8888 ≈ 112.5
    expect(brzycki(100, 5)).toBeCloseTo(112.51, 1);
  });

  it("renvoie le poids tel quel pour 1 répétition (1RM réel)", () => {
    // dénominateur = 1.0278 - 0.0278 = 1 -> identité
    expect(brzycki(100, 1)).toBeCloseTo(100, 5);
  });

  it("rejette un poids nul, négatif ou non fini", () => {
    expect(brzycki(0, 5)).toBe(0);
    expect(brzycki(-10, 5)).toBe(0);
    expect(brzycki(NaN, 5)).toBe(0);
  });

  it("rejette des répétitions hors de la plage valide (1..36)", () => {
    expect(brzycki(100, 0)).toBe(0);
    expect(brzycki(100, 37)).toBe(0);
    expect(brzycki(100, -1)).toBe(0);
  });

  it("refuse un dénominateur nul ou négatif (garde-fou au-delà de 36 déjà couvert, vérifié explicitement)", () => {
    // 1.0278 - 0.0278*37 = -0.0008 -> nul/négatif, déjà bloqué par la borne 36
    expect(brzycki(100, 36)).toBeGreaterThan(0);
  });
});

describe("heaviestSet", () => {
  const sets = [
    { exerciseName: "Squat", weightKg: 80, reps: 8 },
    { exerciseName: "Squat", weightKg: 100, reps: 3 },
    { exerciseName: "Squat", weightKg: 100, reps: 5 },
  ];

  it("retourne null pour une liste vide", () => {
    expect(heaviestSet([])).toBeNull();
  });

  it("choisit le poids le plus lourd", () => {
    expect(heaviestSet(sets)?.weightKg).toBe(100);
  });

  it("départage à poids égal par le plus de répétitions", () => {
    expect(heaviestSet(sets)).toEqual({ exerciseName: "Squat", weightKg: 100, reps: 5 });
  });
});

describe("loadCategory", () => {
  it("classe correctement les trois paliers", () => {
    expect(loadCategory(0.9).label).toBe("Lourde");
    expect(loadCategory(0.85).label).toBe("Lourde");
    expect(loadCategory(0.75).label).toBe("Modérée");
    expect(loadCategory(0.7).label).toBe("Modérée");
    expect(loadCategory(0.5).label).toBe("Légère");
  });
});
