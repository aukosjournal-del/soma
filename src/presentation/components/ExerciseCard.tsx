import { SetRow } from "./SetRow";
import {
  type SessionExercise,
  exerciseEstimatedSec,
} from "@domain/workout/entities/SessionExercise";
import { fmtMinSec } from "@domain/workout/value-objects/Duration";

export interface ExerciseCardProps {
  exercise: SessionExercise;
  index: number;
  total: number;
  onWeight: (setId: number, value: string) => void;
  onReps: (setId: number, value: string) => void;
  onCheck: (setId: number) => void;
  onFail: (setId: number) => void;
}

/** Carte glassmorphism d'un exercice (radius 24, blur 20px). */
export function ExerciseCard({ exercise, index, total, onWeight, onReps, onCheck, onFail }: ExerciseCardProps) {
  return (
    <div
      style={{
        background: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border)",
        borderRadius: "24px",
        padding: "16px",
        backdropFilter: "var(--blur-glass)",
        WebkitBackdropFilter: "var(--blur-glass)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              color: "var(--color-at-prefix)",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "var(--tracking-eyebrow)",
              margin: 0,
            }}
          >
            Exercice {index + 1} / {total}
          </p>
          <h2 style={{ color: "#fff", fontSize: "20px", fontWeight: 900, margin: "2px 0 0" }}>
            {exercise.name}
          </h2>
        </div>
        <span style={{ flexShrink: 0, color: "var(--color-at-prefix)", fontSize: "12px", fontWeight: 700 }}>
          {fmtMinSec(exerciseEstimatedSec(exercise))}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {exercise.sets.map((set) => (
          <SetRow
            key={set.id}
            set={set}
            onWeight={(v) => onWeight(set.id, v)}
            onReps={(v) => onReps(set.id, v)}
            onCheck={() => onCheck(set.id)}
            onFail={() => onFail(set.id)}
          />
        ))}
      </div>
    </div>
  );
}
