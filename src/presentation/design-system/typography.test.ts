import { describe, expect, it } from "vitest";

/**
 * Garde-fou d'harmonisation typographique.
 *
 * L'app avait dérivé jusqu'à sept graisses différentes (400 → 900), au point
 * que les valeurs d'objectif s'affichaient en 900 pendant que le reste des
 * écrans était à 500 : la hiérarchie n'était plus portée par la taille mais
 * par un gras appliqué au hasard des écrans. Ce test verrouille l'inverse.
 *
 * Il lit les sources plutôt que le rendu : une graisse écrite en dur n'est
 * visible dans aucun test de composant, et c'est précisément comme ça que la
 * dérive s'est réinstallée à chaque écran ajouté.
 */

// Lecture via Vite plutôt que `node:fs` : garde le test exécutable sans les
// types Node, que le tsconfig applicatif n'embarque pas.
const sources = Object.entries(
  import.meta.glob("../**/*.tsx", { query: "?raw", import: "default", eager: true }) as Record<
    string,
    string
  >,
).filter(([path]) => !path.endsWith(".test.tsx"));

describe("harmonisation typographique", () => {
  it("trouve bien les sources à inspecter", () => {
    expect(sources.length).toBeGreaterThan(20);
  });

  it("n'écrit aucune graisse en dur : tout passe par un token", () => {
    const offenders: string[] = [];
    for (const [path, code] of sources) {
      code.split("\n").forEach((line, i) => {
        // On extrait la valeur puis on la teste, plutôt que d'utiliser un
        // lookahead après `\s*` : le quantificateur peut revenir en arrière
        // et faire passer le lookahead, ce qui signalait tous les tokens.
        const value = line.match(/fontWeight:\s*([^,\n}]+)/)?.[1]?.trim();
        if (value && !value.startsWith('"var(--weight-')) {
          offenders.push(`${path}:${i + 1}  ${line.trim()}`);
        }
      });
    }
    expect(offenders, `graisses en dur :\n${offenders.join("\n")}`).toEqual([]);
  });

  it("ne réintroduit pas les tailles retirées du barème", () => {
    // Denylist volontaire, et non liste blanche : 20/24/32/34/40px restent
    // légitimement présents, en attente d'arbitrage (voir
    // docs/typographie-tailles.md). Seules ces quatre valeurs ont été
    // tranchées — les reverrouiller évite qu'un futur écran les ramène.
    const retired = [9, 12, 15, 18];
    const offenders: string[] = [];
    for (const [path, code] of sources) {
      code.split("\n").forEach((line, i) => {
        for (const px of retired) {
          if (line.includes(`fontSize: "${px}px"`)) {
            offenders.push(`${path}:${i + 1}  ${px}px`);
          }
        }
      });
    }
    expect(offenders, `tailles retirées :\n${offenders.join("\n")}`).toEqual([]);
  });

  it("réserve --weight-strong au wordmark", () => {
    // Une seule graisse forte dans l'app : la hiérarchie se joue sur la
    // taille. Si ce compte augmente, c'est que le gras redevient un outil
    // de hiérarchie — le défaut qu'on vient de corriger.
    const strong = sources.filter(([, code]) => code.includes("--weight-strong)")).map(([p]) => p);
    expect(strong).toEqual(["../components/BrandHeader.tsx"]);
  });
});
