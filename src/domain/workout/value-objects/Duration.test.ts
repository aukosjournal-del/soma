import { describe, expect, it } from "vitest";
import { fmtMinSec, fmtTime, restForReps, tempoForReps, transitionTimeForRest } from "./Duration";

describe("fmtTime", () => {
  it("formate en mm:ss avec zéro-padding", () => {
    expect(fmtTime(0)).toBe("00:00");
    expect(fmtTime(65)).toBe("01:05");
    expect(fmtTime(600)).toBe("10:00");
  });
});

describe("fmtMinSec", () => {
  it("omet les minutes quand la durée est sous la minute", () => {
    expect(fmtMinSec(45)).toBe("45s");
  });

  it("affiche minutes et secondes au-delà d'une minute", () => {
    expect(fmtMinSec(750)).toBe("12min 30s");
  });
});

describe("tempoForReps", () => {
  it("suit les paliers du prototype", () => {
    expect(tempoForReps(1)).toBe(4);
    expect(tempoForReps(5)).toBe(4);
    expect(tempoForReps(6)).toBe(3);
    expect(tempoForReps(12)).toBe(3);
    expect(tempoForReps(13)).toBe(2);
  });
});

describe("restForReps", () => {
  it("suit les paliers du prototype", () => {
    expect(restForReps(5)).toBe(180);
    expect(restForReps(12)).toBe(90);
    expect(restForReps(13)).toBe(45);
  });
});

describe("transitionTimeForRest", () => {
  it("dérive la transition du repos de l'exercice précédent", () => {
    expect(transitionTimeForRest(150)).toBe(180);
    expect(transitionTimeForRest(75)).toBe(120);
    expect(transitionTimeForRest(74)).toBe(90);
    expect(transitionTimeForRest(0)).toBe(90);
  });
});
