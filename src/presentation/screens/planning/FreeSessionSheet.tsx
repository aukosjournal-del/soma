import { useEffect, useState } from "react";
import { BottomSheet } from "@presentation/components/BottomSheet";
import type { Exercise, Difficulty } from "@domain/workout/entities/Exercise";
import { DIFFICULTY_LABEL, DIFFICULTY_COLOR, DIFFICULTY_ORDER } from "@domain/workout/entities/Exercise";
import type { RoutineDraftExercise } from "@domain/workout/ports/RoutineRepository";
import { type Objective, generateFreeSession } from "@domain/workout/use-cases/GenerateFreeSession";
import { restForReps } from "@domain/workout/value-objects/Duration";

const microInput = {
  width: "100%",
  height: "32px",
  background: "var(--color-bg-elevated)",
  borderRadius: "8px",
  textAlign: "center",
  color: "#fff",
  fontSize: "12px",
  fontWeight: 500,
  boxSizing: "border-box",
  fontVariantNumeric: "tabular-nums",
} as const;

const microLabel = {
  color: "var(--color-at-prefix)",
  fontSize: "9px",
  fontWeight: 500,
  marginBottom: "2px",
} as const;

const eyebrow = {
  color: "var(--color-at-prefix)",
  fontSize: "11px",
  fontWeight: 500,
  letterSpacing: "var(--tracking-eyebrow)",
} as const;

export interface FreeSessionSheetProps {
  open: boolean;
  library: Exercise[];
  /** Niveau du profil, pré-sélectionné. */
  defaultLevel: Difficulty;
  onClose: () => void;
  onLaunch: (exercises: RoutineDraftExercise[]) => void;
}

/**
 * Séance Libre — génération 100 % locale et déterministe à partir de la
 * bibliothèque, de l'objectif et du niveau. Aucun appel réseau, aucune clé.
 */
export function FreeSessionSheet({ open, library, defaultLevel, onClose, onLaunch }: FreeSessionSheetProps) {
  const [description, setDescription] = useState("");
  // Objectif figé sur l'hypertrophie : le prototype n'expose que la difficulté.
  const objective: Objective = "hypertrophie";
  const [level, setLevel] = useState<Difficulty>(defaultLevel);
  const [exercises, setExercises] = useState<RoutineDraftExercise[]>([]);
  const [pick, setPick] = useState("");

  useEffect(() => {
    if (!open) return;
    setLevel(defaultLevel);
    setPick(library[0]?.id ?? "");
  }, [open, defaultLevel, library]);

  const generate = () => {
    setExercises(generateFreeSession({ library, description, objective, level }));
  };

  const patch = (index: number, values: Partial<RoutineDraftExercise>) =>
    setExercises((list) =>
      list.map((ex, i) => {
        if (i !== index) return ex;
        const updated = { ...ex, ...values };
        // Le repos suit les répétitions, comme dans le prototype.
        if (values.reps !== undefined) {
          updated.rest = String(restForReps(parseInt(values.reps, 10) || 0));
        }
        return updated;
      }),
    );

  const addExercise = () => {
    const found = library.find((l) => l.id === pick);
    if (!found) return;
    setExercises((list) => [
      ...list,
      { exerciseId: found.id, name: found.name, sets: "3", weight: "0", reps: "10", rest: "90", favorite: false },
    ]);
  };

  return (
    <BottomSheet open={open} title="Séance libre" onClose={onClose}>
      <p style={{ ...eyebrow, margin: "0 0 8px" }}>Décris ta séance</p>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Ex: jambes et dos, charges moyennes..."
        style={{
          width: "100%",
          height: "64px",
          background: "var(--color-bg-elevated)",
          borderRadius: "12px",
          padding: "10px 12px",
          color: "#fff",
          fontSize: "13px",
          fontWeight: 500,
          boxSizing: "border-box",
          resize: "none",
          fontFamily: "inherit",
        }}
      />

      <p style={{ ...eyebrow, margin: "8px 0" }}>Difficulté</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "6px", marginBottom: "8px" }}>
        {DIFFICULTY_ORDER.map((lvl) => {
          const active = level === lvl;
          return (
            <button
              key={lvl}
              type="button"
              className="soma-press"
              onClick={() => setLevel(lvl)}
              aria-pressed={active}
              style={{
                height: "36px",
                borderRadius: "10px",
                // Même traitement que les sélecteurs de difficulté de
                // CustomExerciseSheet et ExerciseInfoSheet : l'état actif est
                // porté par le fond, le contour doublait l'information.
                border: "none",
                background: active ? DIFFICULTY_COLOR[lvl] : "rgba(192,235,255,0.05)",
                color: active ? "var(--color-on-accent)" : "var(--color-text-secondary)",
                fontSize: "11px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {DIFFICULTY_LABEL[lvl]}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="soma-press"
        onClick={generate}
        style={{
          width: "100%",
          height: "44px",
          marginBottom: "16px",
          fontWeight: 500,
          fontSize: "13px",
          borderRadius: "12px",
          background: "var(--color-bg-elevated)",
          color: "var(--color-text-secondary)",
          cursor: "pointer",
          boxSizing: "border-box",
        }}
      >
        Générer
      </button>

      <p style={{ ...eyebrow, margin: "0 0 8px" }}>Exercices ({exercises.length})</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "280px", overflowY: "auto", marginBottom: "8px" }}>
        {exercises.length === 0 && (
          <p style={{ color: "var(--color-text-faint)", fontSize: "12px", textAlign: "center", padding: "12px 0", margin: 0 }}>
            Ajoute au moins un exercice pour lancer ta séance.
          </p>
        )}

        {exercises.map((ex, i) => (
          <div
            key={`${ex.exerciseId}-${i}`}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              padding: "8px 10px",
              borderRadius: "10px",
              background: "var(--color-bg-elevated)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
              <span style={{ color: "#fff", fontSize: "13px", fontWeight: 500 }}>{ex.name}</span>
              <button
                type="button"
                onClick={() => setExercises((list) => list.filter((_, k) => k !== i))}
                aria-label={`Retirer ${ex.name}`}
                style={{
                  flexShrink: 0,
                  height: "24px",
                  width: "24px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  background: "rgba(239,68,68,0.15)",
                  color: "var(--color-error)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="11" height="11" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                  <line x1="4" y1="4" x2="12" y2="12" />
                  <line x1="12" y1="4" x2="4" y2="12" />
                </svg>
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "6px" }}>
              <label style={{ display: "block" }}>
                <div style={microLabel}>Séries</div>
                <input type="text" inputMode="numeric" value={ex.sets} onChange={(e) => patch(i, { sets: e.target.value })} style={microInput} />
              </label>
              <label style={{ display: "block" }}>
                <div style={microLabel}>Charge</div>
                <input type="text" inputMode="decimal" value={ex.weight} onChange={(e) => patch(i, { weight: e.target.value })} style={microInput} />
              </label>
              <label style={{ display: "block" }}>
                <div style={microLabel}>Reps</div>
                <input type="text" inputMode="numeric" value={ex.reps} onChange={(e) => patch(i, { reps: e.target.value })} style={microInput} />
              </label>
              <label style={{ display: "block" }}>
                <div style={microLabel}>Repos</div>
                <input type="text" inputMode="numeric" value={ex.rest} onChange={(e) => patch(i, { rest: e.target.value })} style={microInput} />
              </label>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <select
          value={pick}
          onChange={(e) => setPick(e.target.value)}
          aria-label="Choisir un exercice"
          style={{
            flex: 1,
            height: "44px",
            background: "var(--color-bg-elevated)",
            borderRadius: "12px",
            padding: "0 10px",
            color: "#fff",
            fontSize: "13px",
            fontWeight: 500,
            boxSizing: "border-box",
          }}
        >
          {library.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="soma-press"
          onClick={addExercise}
          style={{
            flexShrink: 0,
            height: "44px",
            padding: "0 16px",
            borderRadius: "12px",
            border: "none",
            background: "var(--color-accent-soft)",
            color: "var(--color-accent)",
            fontWeight: 500,
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          + Ajouter
        </button>
      </div>

      <button
        type="button"
        className="soma-press"
        onClick={() => onLaunch(exercises)}
        disabled={exercises.length === 0}
        style={{
          width: "100%",
          minHeight: "52px",
          marginTop: "18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          fontWeight: 500,
          fontSize: "15px",
          borderRadius: "12px",
          background: "var(--color-accent)",
          color: "var(--color-on-accent)",
          border: "none",
          cursor: exercises.length === 0 ? "not-allowed" : "pointer",
          boxSizing: "border-box",
          opacity: exercises.length === 0 ? 0.5 : 1,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <polygon points="3,2 14,8 3,14" fill="currentColor" />
        </svg>
        <span>Lancer la séance</span>
      </button>
    </BottomSheet>
  );
}
