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

const columnLabel = {
  fontSize: "var(--text-micro)",
  fontWeight: "var(--weight-medium)",
  letterSpacing: "0.08em",
  color: "var(--color-text-faint)",
  textTransform: "uppercase",
} as const;

/**
 * Carte d'un exercice. Le glassmorphism (blur 20px) est conservé — c'est
 * l'identité SOMA — mais la bordure disparaît : la carte se détache déjà par
 * son fond, et trois bordures imbriquées (carte / ligne / champ) créaient un
 * bruit visuel qui écrasait la seule donnée qui compte en séance, les chiffres.
 */
export function ExerciseCard({ exercise, index, total, onWeight, onReps, onCheck, onFail }: ExerciseCardProps) {
  return (
    <section
      style={{
        background: "var(--color-bg-elevated)",
        borderRadius: "var(--radius-lg)",
        padding: "16px",
        backdropFilter: "var(--blur-glass)",
        WebkitBackdropFilter: "var(--blur-glass)",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "14px",
        }}
      >
        {/* Hiérarchie par la TAILLE, plus par la graisse : le poids 900
            partout supprimait toute distinction entre les niveaux. */}
        <h2 style={{ color: "#fff", fontSize: "var(--text-heading)", fontWeight: "var(--weight-medium)", margin: 0, minWidth: 0 }}>
          {exercise.name}
        </h2>
        <span
          style={{
            flexShrink: 0,
            color: "var(--color-text-faint)",
            fontSize: "var(--text-caption)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {index + 1} / {total} · {fmtMinSec(exerciseEstimatedSec(exercise))}
        </span>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "16px 1fr 1fr 48px 48px",
          gap: "6px",
          marginBottom: "8px",
        }}
      >
        <span />
        <span style={columnLabel}>Charge</span>
        <span style={columnLabel}>Reps</span>
        <span />
        <span />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
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
    </section>
  );
}
