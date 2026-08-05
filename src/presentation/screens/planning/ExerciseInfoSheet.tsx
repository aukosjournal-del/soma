import { useEffect, useState } from "react";
import { BottomSheet } from "@presentation/components/BottomSheet";
import {
  type Difficulty,
  type Exercise,
  DIFFICULTY_COLOR,
  DIFFICULTY_LABEL,
  DIFFICULTY_ORDER,
  isCompound,
} from "@domain/workout/entities/Exercise";

const eyebrow = {
  color: "var(--color-at-prefix)",
  fontSize: "11px",
  fontWeight: "var(--weight-medium)",
  letterSpacing: "var(--tracking-eyebrow)",
  margin: "0 0 10px",
} as const;

export interface ExerciseInfoSheetProps {
  open: boolean;
  exercise: Exercise | null;
  onClose: () => void;
  /** Modifie la difficulté globale de l'exercice. */
  onChangeDifficulty: (exercise: Exercise, difficulty: Difficulty) => Promise<void>;
}

/** Fiche exercice — déclenchée par le bouton « i » de la bibliothèque. */
export function ExerciseInfoSheet({ open, exercise, onClose, onChangeDifficulty }: ExerciseInfoSheetProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediaire");
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!open || !exercise) return;
    setDifficulty(exercise.difficulty);
    setError(undefined);
  }, [open, exercise]);

  if (!exercise) return null;

  const compound = isCompound(exercise);
  const fallback = compound
    ? "Mouvement polyarticulaire : il sollicite plusieurs articulations et groupes musculaires. À placer en début de séance, quand la fatigue est faible et la technique la plus sûre."
    : "Mouvement d'isolation : il cible un groupe musculaire précis. À placer en fin de séance, après les mouvements polyarticulaires.";

  const pick = async (level: Difficulty) => {
    setDifficulty(level);
    setError(undefined);
    try {
      await onChangeDifficulty(exercise, level);
    } catch (e) {
      setDifficulty(exercise.difficulty);
      setError(e instanceof Error ? e.message : "Modification impossible.");
    }
  };

  return (
    <BottomSheet open={open} title={exercise.name} onClose={onClose}>
      <div
        style={{
          width: "100%",
          height: "180px",
          borderRadius: "12px",
          background:
            "repeating-linear-gradient(45deg, rgba(192,235,255,0.1) 0px, rgba(192,235,255,0.1) 4px, rgba(192,235,255,0.05) 4px, rgba(192,235,255,0.05) 8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-muted)",
          fontSize: "13px",
          fontWeight: "var(--weight-medium)",
          marginBottom: "18px",
          boxSizing: "border-box",
        }}
      >
        GIF démonstration (2s, boucle)
      </div>

      <p style={eyebrow}>Difficulté</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "6px" }}>
        {DIFFICULTY_ORDER.map((lvl) => {
          const active = difficulty === lvl;
          return (
            <button
              key={lvl}
              type="button"
              className="soma-press"
              onClick={() => void pick(lvl)}
              aria-pressed={active}
              style={{
                height: "36px",
                borderRadius: "10px",
                border: "none",
                background: active ? DIFFICULTY_COLOR[lvl] : "rgba(192,235,255,0.05)",
                color: active ? "var(--color-on-accent)" : "var(--color-text-secondary)",
                fontSize: "11px",
                fontWeight: "var(--weight-medium)",
                cursor: "pointer",
              }}
            >
              {DIFFICULTY_LABEL[lvl]}
            </button>
          );
        })}
      </div>

      {error && (
        <p style={{ color: "var(--color-error)", fontSize: "var(--text-label)", margin: "10px 0 0", textAlign: "center" }}>{error}</p>
      )}

      <p style={{ ...eyebrow, marginTop: "18px" }}>Exécution</p>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
        {exercise.description?.trim() ? exercise.description : fallback}
      </p>

      <p style={{ color: "var(--color-text-faint)", fontSize: "var(--text-label)", margin: "12px 0 0" }}>
        {exercise.muscleGroup} · {exercise.equipment} · {compound ? "Polyarticulaire" : "Isolation"}
      </p>
    </BottomSheet>
  );
}
