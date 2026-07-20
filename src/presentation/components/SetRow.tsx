import type { SessionSet } from "@domain/workout/entities/SessionExercise";

export interface SetRowProps {
  set: SessionSet;
  onWeight: (value: string) => void;
  onReps: (value: string) => void;
  onCheck: () => void;
  onFail: () => void;
}

const iconButton = {
  height: "40px",
  width: "40px",
  borderRadius: "12px",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.3s ease",
} as const;

/**
 * Ligne de série. Clone pixel-perfect du prototype (grille 36/16/1fr/1fr/40/40).
 * VERROUILLAGE : dès que la série est validée (`checked`), les deux inputs
 * passent en `disabled` — plus aucune saisie possible, comme le prototype.
 */
export function SetRow({ set, onWeight, onReps, onCheck, onFail }: SetRowProps) {
  const inputStyle = {
    height: "40px",
    minWidth: 0,
    background: "var(--color-bg-elevated)",
    border: "1px solid var(--color-border)",
    borderRadius: "12px",
    padding: "0 6px",
    textAlign: "center",
    fontWeight: 700,
    fontSize: "13px",
    color: "var(--color-text-secondary)",
    boxSizing: "border-box",
    fontVariantNumeric: "tabular-nums",
  } as const;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "36px 16px 1fr 1fr 40px 40px",
        alignItems: "center",
        gap: "6px",
        padding: "8px",
        borderRadius: "12px",
        transition: "all 0.3s ease",
        background: set.checked ? "rgba(16,185,129,0.12)" : "transparent",
        border: `1px solid ${set.checked ? "rgba(16,185,129,0.4)" : "transparent"}`,
      }}
    >
      <div
        style={{
          height: "36px",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          fontSize: "13px",
          background: "rgba(192,235,255,0.25)",
          color: "var(--color-text-secondary)",
        }}
      >
        {set.type}
      </div>

      <span
        style={{
          color: "var(--color-at-prefix)",
          fontWeight: 700,
          fontSize: "13px",
          textAlign: "center",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {set.id}
      </span>

      <input
        type="text"
        inputMode="decimal"
        disabled={set.checked}
        value={set.weight}
        onChange={(e) => onWeight(e.target.value)}
        placeholder={`${set.weightPlaceholder}kg`}
        aria-label={`Poids série ${set.id}`}
        style={inputStyle}
      />
      <input
        type="text"
        inputMode="numeric"
        disabled={set.checked}
        value={set.reps}
        onChange={(e) => onReps(e.target.value)}
        placeholder={`×${set.repsPlaceholder}`}
        aria-label={`Répétitions série ${set.id}`}
        style={inputStyle}
      />

      <button
        type="button"
        onClick={onFail}
        aria-label="Répétition ratée"
        aria-pressed={set.failed}
        style={{
          ...iconButton,
          background: set.failed ? "var(--color-error)" : "var(--color-bg-elevated)",
          color: set.failed ? "#fff" : "rgba(192,235,255,0.7)",
          boxShadow: set.failed ? "0 0 20px -4px rgba(239,68,68,0.6)" : "none",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
          <line x1="4" y1="4" x2="12" y2="12" />
          <line x1="12" y1="4" x2="4" y2="12" />
        </svg>
      </button>

      <button
        type="button"
        onClick={onCheck}
        aria-label={`Valider série ${set.id}`}
        aria-pressed={set.checked}
        style={{
          ...iconButton,
          background: set.checked ? "var(--color-success)" : "var(--color-bg-elevated)",
          color: set.checked ? "#fff" : "rgba(192,235,255,0.7)",
          boxShadow: set.checked ? "0 0 20px -4px rgba(16,185,129,0.6)" : "none",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="3,8 6.5,11.5 13,4" />
        </svg>
      </button>
    </div>
  );
}
