import { describe, expect, it } from "vitest";
import { todayIndex } from "./Routine";

describe("todayIndex", () => {
  it("aligne Lundi sur 0 (Date.getDay() renvoie 1 pour lundi)", () => {
    expect(todayIndex(new Date("2026-08-03T12:00:00"))).toBe(0); // lundi
  });

  it("aligne Dimanche sur 6 (Date.getDay() renvoie 0 pour dimanche)", () => {
    expect(todayIndex(new Date("2026-08-09T12:00:00"))).toBe(6); // dimanche
  });

  it("couvre les jours intermédiaires dans l'ordre du prototype", () => {
    expect(todayIndex(new Date("2026-08-04T12:00:00"))).toBe(1); // mardi
    expect(todayIndex(new Date("2026-08-08T12:00:00"))).toBe(5); // samedi
  });
});
