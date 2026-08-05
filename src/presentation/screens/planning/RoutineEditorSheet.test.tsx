// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RoutineEditorSheet } from "./RoutineEditorSheet";
import type { Routine } from "@domain/workout/entities/Routine";
import type { Exercise } from "@domain/workout/entities/Exercise";

afterEach(cleanup);

const routine: Routine = {
  id: "r1",
  name: "Push",
  focus: "Pectoraux",
  exercises: [
    {
      exerciseId: "e1",
      name: "Développé couché",
      targetSets: 4,
      targetWeightKg: 60,
      targetReps: "8",
      restSec: 90,
      favorite: true,
    },
  ],
} as Routine;

const library: Exercise[] = [
  { id: "e1", name: "Développé couché", muscleGroup: "Pectoraux", equipment: "Barre", difficulty: "intermediaire", description: "" },
];

function setup(overrides: Partial<Parameters<typeof RoutineEditorSheet>[0]> = {}) {
  const onDelete = vi.fn().mockResolvedValue(undefined);
  const onClose = vi.fn();
  const onSave = vi.fn().mockResolvedValue(undefined);
  render(
    <RoutineEditorSheet
      open
      routine={routine}
      library={library}
      onClose={onClose}
      onSave={onSave}
      onDelete={onDelete}
      {...overrides}
    />,
  );
  return { onDelete, onClose, onSave, user: userEvent.setup() };
}

describe("RoutineEditorSheet — confirmation de suppression", () => {
  it("ne supprime pas au premier clic", async () => {
    const { onDelete, user } = setup();
    await user.click(screen.getByRole("button", { name: "Supprimer" }));
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("supprime au second clic, sur le même bouton", async () => {
    const { onDelete, onClose, user } = setup();
    await user.click(screen.getByRole("button", { name: "Supprimer" }));
    await user.click(screen.getByRole("button", { name: "Confirmer" }));
    expect(onDelete).toHaveBeenCalledExactlyOnceWith("r1");
    expect(onClose).toHaveBeenCalled();
  });

  it("n'expose jamais deux actions destructrices en même temps", async () => {
    // La première version affichait « Confirmer la suppression » (inerte) et
    // « Oui, supprimer » côte à côte, tous deux rouges.
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Supprimer" }));
    const destructive = screen
      .getAllByRole("button")
      .filter((b) => /supprim|confirm/i.test(b.textContent ?? ""));
    expect(destructive).toHaveLength(1);
  });

  it("laisse annuler sans supprimer", async () => {
    const { onDelete, user } = setup();
    await user.click(screen.getByRole("button", { name: "Supprimer" }));
    await user.click(screen.getByRole("button", { name: "Annuler" }));
    expect(screen.getByRole("button", { name: "Supprimer" })).toBeTruthy();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("nomme la routine visée pendant la confirmation", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Supprimer" }));
    expect(within(screen.getByRole("status")).getByText(/Push/)).toBeTruthy();
  });

  it("garde le focus sur le bouton armé", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Supprimer" }));
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Confirmer" }));
  });

  it("reste sur la feuille et affiche l'erreur si la suppression échoue", async () => {
    const onDelete = vi.fn().mockRejectedValue(new Error("Réseau indisponible"));
    const { user } = setup({ onDelete });
    await user.click(screen.getByRole("button", { name: "Supprimer" }));
    await user.click(screen.getByRole("button", { name: "Confirmer" }));
    expect(screen.getByText("Réseau indisponible")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Supprimer" })).toBeTruthy();
  });
});

describe("RoutineEditorSheet — cibles tactiles", () => {
  it("donne au moins 44px aux commandes d'icône de la liste", () => {
    setup();
    for (const name of ["Favori pour le 1RM", "Retirer Développé couché"]) {
      const el = screen.getByRole("button", { name });
      expect(parseInt(el.style.height, 10)).toBeGreaterThanOrEqual(44);
      expect(parseInt(el.style.width, 10)).toBeGreaterThanOrEqual(44);
    }
  });
});
