import type { SessionSet } from "@domain/workout/entities/SessionExercise";
import { selectZeroOnFocus } from "@presentation/design-system/numericField";

export interface SetRowProps {
  set: SessionSet;
  onWeight: (value: string) => void;
  onReps: (value: string) => void;
  onCheck: () => void;
  onFail: () => void;
}

const actionButton = {
  height: "48px",
  width: "48px",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  // On ne transitionne QUE les couleurs : `all` forçait un repaint complet
  // à chaque frame et sortait l'animation du compositeur.
  transition: "background var(--duration-fast) ease, color var(--duration-fast) ease",
} as const;

/**
 * Ligne de série.
 *
 * VERROUILLAGE : dès que la série est validée (`checked`), les deux inputs
 * passent en `disabled` — plus aucune saisie possible, comme le prototype.
 *
 * Grille à 5 colonnes (n° / charge / reps / échec / valider). Les deux
 * actions restent visibles en permanence : le geste de swipe testé en salle
 * ne se déclenchait pas de façon fiable, un bouton toujours là est plus sûr
 * qu'un geste à découvrir sous effort.
 */
export function SetRow({ set, onWeight, onReps, onCheck, onFail }: SetRowProps) {
  const inputStyle = {
    height: "48px",
    minWidth: 0,
    width: "100%",
    background: set.checked ? "rgba(16,185,129,0.10)" : "var(--color-bg-elevated)",
    border: "none",
    borderRadius: "10px",
    padding: "0 6px",
    textAlign: "center",
    fontWeight: "var(--weight-medium)",
    fontSize: "var(--text-body)",
    color: set.checked ? "#fff" : "var(--color-text-secondary)",
    boxSizing: "border-box",
    fontVariantNumeric: "tabular-nums",
  } as const;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "16px 1fr 1fr 48px 48px",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <span
        style={{
          fontSize: "var(--text-label)",
          color: set.failed ? "var(--color-error)" : "var(--color-text-faint)",
          fontVariantNumeric: "tabular-nums",
          textAlign: "center",
        }}
      >
        {set.id}
      </span>

      <input
        type="text"
        inputMode="decimal"
        onFocus={selectZeroOnFocus}
        disabled={set.checked}
        value={set.weight}
        onChange={(e) => onWeight(e.target.value)}
        placeholder={set.weightPlaceholder}
        aria-label={`Charge en kilos, série ${set.id}`}
        style={inputStyle}
      />
      <input
        type="text"
        inputMode="numeric"
        onFocus={selectZeroOnFocus}
        disabled={set.checked}
        value={set.reps}
        onChange={(e) => onReps(e.target.value)}
        placeholder={set.repsPlaceholder}
        aria-label={`Répétitions, série ${set.id}`}
        style={inputStyle}
      />

      <button
        type="button"
        className="soma-press"
        onClick={onFail}
        aria-label={`Marquer la série ${set.id} en échec`}
        aria-pressed={set.failed}
        style={{
          ...actionButton,
          // Plus de halo néon : l'état se lit au remplissage du bouton.
          background: set.failed ? "var(--color-error)" : "var(--color-bg-elevated)",
          color: set.failed ? "#fff" : "var(--color-text-faint)",
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <line x1="4" y1="4" x2="12" y2="12" />
          <line x1="12" y1="4" x2="4" y2="12" />
        </svg>
      </button>

      <button
        type="button"
        className="soma-press"
        onClick={onCheck}
        aria-label={`Valider la série ${set.id}`}
        aria-pressed={set.checked}
        style={{
          ...actionButton,
          background: set.checked ? "var(--color-success)" : "var(--color-bg-elevated)",
          color: set.checked ? "var(--color-on-accent)" : "var(--color-text-faint)",
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="3,8 6.5,11.5 13,4" />
        </svg>
      </button>
    </div>
  );
}
