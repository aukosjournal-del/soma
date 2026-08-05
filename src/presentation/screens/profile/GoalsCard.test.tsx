// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GoalsCard } from "./GoalsCard";

afterEach(cleanup);

function setup(stepsGoal = 0, kcalGoal = 2000) {
  const onSave = vi.fn().mockResolvedValue(undefined);
  render(<GoalsCard stepsGoal={stepsGoal} kcalGoal={kcalGoal} onSave={onSave} />);
  return { onSave, user: userEvent.setup() };
}

const steps = () => screen.getByLabelText("Objectif de pas") as HTMLInputElement;
const kcal = () => screen.getByLabelText("Objectif calorique") as HTMLInputElement;

describe("GoalsCard — saisie numérique", () => {
  it("remplace le zéro au lieu de s'y ajouter", async () => {
    // Régression signalée : taper 8 sur un champ à 0 donnait « 08 ».
    const { user } = setup(0);
    await user.click(steps());
    await user.keyboard("8000");
    expect(steps().value).toBe("8000");
  });

  it("ne touche pas à une valeur déjà saisie", async () => {
    // L'inverse serait pire : effacer 2000 kcal d'une simple frappe.
    const { user } = setup(0, 2000);
    await user.click(kcal());
    expect(kcal().selectionStart).toBe(kcal().selectionEnd);
    expect(kcal().value).toBe("2000");
  });

  it("traite un champ vidé comme un champ à zéro", async () => {
    const { user } = setup(0);
    await user.clear(steps());
    await user.click(steps());
    await user.keyboard("500");
    expect(steps().value).toBe("500");
  });
});

describe("GoalsCard — typographie", () => {
  it("affiche les valeurs saisies avec la graisse commune, pas en gras", () => {
    // Le champ était figé à 900 : c'est le gras que l'app n'utilise plus.
    setup(8000);
    expect(steps().style.fontWeight).toBe("var(--weight-medium)");
    expect(kcal().style.fontWeight).toBe("var(--weight-medium)");
  });
});
