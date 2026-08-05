import { describe, expect, it } from "vitest";
import { USERNAME_MAX, USERNAME_MIN, Username } from "./Username";

describe("Username.normalize", () => {
  it("retire les '@' en tête et coupe les espaces", () => {
    expect(Username.normalize("@@stephane  ")).toBe("stephane");
  });

  it("ne strip pas le '@' si des espaces le précèdent (ordre strip -> trim, pas trim -> strip)", () => {
    // Comportement actuel, volontairement conservé à l'identique du prototype :
    // le strip agit sur la chaîne brute avant le trim, donc un '@' précédé
    // d'espaces n'est pas considéré comme "en tête".
    expect(Username.normalize("  @stephane")).toBe("@stephane");
  });

  it("ne touche pas à un '@' qui n'est pas en tête", () => {
    expect(Username.normalize("steph@ne")).toBe("steph@ne");
  });
});

describe("Username.validate", () => {
  it("rejette une chaîne vide (y compris après normalisation)", () => {
    const r = Username.validate("   ");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("empty");
  });

  it(`rejette moins de ${USERNAME_MIN} caractères`, () => {
    const r = Username.validate("ab");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("too_short");
  });

  it(`rejette plus de ${USERNAME_MAX} caractères`, () => {
    const r = Username.validate("a".repeat(USERNAME_MAX + 1));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("too_long");
  });

  it("accepte un pseudo valide et le normalise", () => {
    const r = Username.validate("@Stephane");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("Stephane");
  });

  it("accepte exactement les bornes min et max", () => {
    expect(Username.validate("a".repeat(USERNAME_MIN)).ok).toBe(true);
    expect(Username.validate("a".repeat(USERNAME_MAX)).ok).toBe(true);
  });
});
