// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BiometricsSheet } from "./BiometricsSheet";
import { BIO_METRIC_CATALOG, type BodyMetrics } from "@domain/profile/entities/BodyMetrics";

afterEach(cleanup);

const metrics = {} as BodyMetrics;

function setup(visibleIds: string[] = []) {
  const onSave = vi.fn().mockResolvedValue(undefined);
  const onClose = vi.fn();
  render(
    <BiometricsSheet open metrics={metrics} visibleIds={visibleIds} onClose={onClose} onSave={onSave} />,
  );
  return { onSave, onClose, user: userEvent.setup() };
}

/** La pastille peinte est le `<span>` interne du bouton. */
function checkboxVisual(label: string): HTMLElement {
  const btn = screen.getByRole("button", { name: `Afficher ${label}` });
  const span = btn.querySelector("span");
  if (!span) throw new Error(`pastille introuvable pour ${label}`);
  return span as HTMLElement;
}

describe("BiometricsSheet — case à cocher", () => {
  const first = BIO_METRIC_CATALOG[0]!;

  it("dessine un fond visible quand la case est décochée", () => {
    // Régression : le retrait en masse des bordures 1px avait laissé la case
    // décochée en `background: transparent`, donc invisible sur la ligne.
    setup([]);
    const bg = checkboxVisual(first.label).style.background;
    expect(bg).not.toBe("");
    expect(bg).not.toContain("transparent");
  });

  it("distingue coché et décoché par le fond", () => {
    setup([]);
    const off = checkboxVisual(first.label).style.background;
    cleanup();
    setup([first.id]);
    const on = checkboxVisual(first.label).style.background;
    expect(on).not.toBe(off);
  });

  it("offre une cible tactile d'au moins 44px", () => {
    setup([]);
    const btn = screen.getByRole("button", { name: `Afficher ${first.label}` });
    expect(parseInt(btn.style.height, 10)).toBeGreaterThanOrEqual(44);
    expect(parseInt(btn.style.width, 10)).toBeGreaterThanOrEqual(44);
  });

  it("garde la pastille à sa taille dessinée malgré la cible élargie", () => {
    setup([]);
    expect(checkboxVisual(first.label).style.height).toBe("22px");
  });

  it("bascule l'état à la sélection", async () => {
    const { user } = setup([]);
    const btn = screen.getByRole("button", { name: `Afficher ${first.label}` });
    expect(btn.getAttribute("aria-pressed")).toBe("false");
    await user.click(btn);
    expect(
      screen.getByRole("button", { name: `Afficher ${first.label}` }).getAttribute("aria-pressed"),
    ).toBe("true");
  });
});
