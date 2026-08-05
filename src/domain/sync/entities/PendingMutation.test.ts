import { describe, expect, it } from "vitest";
import {
  MAX_ATTEMPTS,
  backoffMs,
  createMutation,
  enqueue,
  isExhausted,
  markAttempt,
  nextPending,
  remove,
} from "./PendingMutation";

// tsconfig.app.json a `noUncheckedIndexedAccess` : un accès `queue[0]` donne
// `T | undefined`. Ces tests savent l'élément présent par construction.
function at<T>(arr: T[], i: number): T {
  const el = arr[i];
  if (el === undefined) throw new Error(`index ${i} inattendu dans le test`);
  return el;
}

describe("backoffMs", () => {
  it("double à chaque tentative jusqu'au plafond de 60s", () => {
    expect(backoffMs(1)).toBe(2000);
    expect(backoffMs(2)).toBe(4000);
    expect(backoffMs(3)).toBe(8000);
    expect(backoffMs(6)).toBe(60_000);
    expect(backoffMs(10)).toBe(60_000); // plafonné, pas d'explosion
  });

  it("ne descend jamais sous la première valeur pour des tentatives <= 0", () => {
    expect(backoffMs(0)).toBe(2000);
  });
});

describe("isExhausted", () => {
  it("épuisée au-delà de MAX_ATTEMPTS tentatives", () => {
    const m = createMutation("session.complete", {});
    expect(isExhausted({ ...m, attempts: MAX_ATTEMPTS - 1 })).toBe(false);
    expect(isExhausted({ ...m, attempts: MAX_ATTEMPTS })).toBe(true);
  });
});

describe("enqueue", () => {
  it("empile une mutation non-collapsible sans toucher aux autres", () => {
    const a = createMutation("session.complete", { id: "a" });
    const b = createMutation("session.complete", { id: "b" });
    const queue = enqueue(enqueue([], a), b);
    expect(queue).toHaveLength(2);
  });

  it("écrase la mutation collapsible précédente du même type (nutrition/pas)", () => {
    const first = createMutation("steps.save", { count: 1000 });
    const second = createMutation("steps.save", { count: 2000 });
    const queue = enqueue(enqueue([], first), second);
    expect(queue).toHaveLength(1);
    expect(at(queue, 0).id).toBe(second.id);
  });

  it("ne mélange pas la logique collapsible entre types différents", () => {
    const steps = createMutation("steps.save", { count: 1000 });
    const nutrition = createMutation("nutrition.save", { kcal: 2000 });
    const queue = enqueue(enqueue([], steps), nutrition);
    expect(queue).toHaveLength(2);
  });
});

describe("markAttempt / remove / nextPending", () => {
  it("incrémente les tentatives et mémorise la dernière erreur", () => {
    const m = createMutation("session.complete", {});
    const queue = markAttempt([m], m.id, "network error");
    expect(at(queue, 0).attempts).toBe(1);
    expect(at(queue, 0).lastError).toBe("network error");
  });

  it("retire une mutation par id", () => {
    const m = createMutation("session.complete", {});
    expect(remove([m], m.id)).toHaveLength(0);
  });

  it("nextPending ignore les mutations épuisées (ordre FIFO)", () => {
    const a = createMutation("session.complete", { id: "a" });
    const b = createMutation("session.complete", { id: "b" });
    const exhausted = { ...a, attempts: MAX_ATTEMPTS };
    expect(nextPending([exhausted, b])?.id).toBe(b.id);
  });

  it("nextPending renvoie null quand tout est épuisé", () => {
    const a = { ...createMutation("session.complete", {}), attempts: MAX_ATTEMPTS };
    expect(nextPending([a])).toBeNull();
  });
});

describe("createMutation", () => {
  it("génère un identifiant d'idempotence unique par mutation", () => {
    const a = createMutation("session.complete", {});
    const b = createMutation("session.complete", {});
    expect(a.id).not.toBe(b.id);
    expect(a.attempts).toBe(0);
  });
});
