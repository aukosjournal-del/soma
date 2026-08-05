import { useEffect, useState } from "react";
import { BottomSheet } from "@presentation/components/BottomSheet";
import type { Routine } from "@domain/workout/entities/Routine";
import type { Exercise } from "@domain/workout/entities/Exercise";
import type { RoutineDraft, RoutineDraftExercise } from "@domain/workout/ports/RoutineRepository";
import {
  fmtMinSec,
  restForReps,
  tempoForReps,
  transitionTimeForRest,
} from "@domain/workout/value-objects/Duration";

export interface RoutineEditorSheetProps {
  open: boolean;
  /** null = création. */
  routine: Routine | null;
  library: Exercise[];
  onClose: () => void;
  onSave: (draft: RoutineDraft) => Promise<void>;
  onDelete: (routineId: string) => Promise<void>;
}

const field = {
  width: "100%",
  height: "48px",
  background: "var(--color-bg-elevated)",
  borderRadius: "12px",
  padding: "0 12px",
  color: "#fff",
  boxSizing: "border-box",
} as const;

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

const sectionLabel = {
  color: "var(--color-text-muted)",
  fontSize: "12px",
  fontWeight: 500,
  marginBottom: "4px",
} as const;

/** Durée estimée d'un brouillon (mêmes formules que la séance). */
function draftDurationSec(exercises: RoutineDraftExercise[]): number {
  const core = exercises.reduce((total, ex) => {
    const sets = parseInt(ex.sets, 10) || 1;
    const reps = parseInt(ex.reps, 10) || 0;
    const rest = parseInt(ex.rest, 10) || 90;
    return total + sets * reps * tempoForReps(reps) + Math.max(0, sets - 1) * rest;
  }, 0);
  const transitions = exercises
    .slice(0, -1)
    .reduce((a, ex) => a + transitionTimeForRest(parseInt(ex.rest, 10) || 90), 0);
  return core + transitions;
}

function toDraftExercises(routine: Routine | null): RoutineDraftExercise[] {
  if (!routine) return [];
  return routine.exercises.map((ex) => ({
    exerciseId: ex.exerciseId,
    name: ex.name,
    sets: String(ex.targetSets),
    weight: String(ex.targetWeightKg),
    reps: ex.targetReps,
    rest: String(ex.restSec),
    favorite: ex.favorite,
  }));
}

/**
 * Bottom sheet d'édition de routine — clone du prototype.
 * ⭐ marque l'exercice de référence pour le calcul du 1RM.
 */
export function RoutineEditorSheet({ open, routine, library, onClose, onSave, onDelete }: RoutineEditorSheetProps) {
  const [name, setName] = useState("");
  const [focus, setFocus] = useState("");
  const [exercises, setExercises] = useState<RoutineDraftExercise[]>([]);
  const [pick, setPick] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!open) return;
    setName(routine?.name ?? "");
    setFocus(routine?.focus ?? "");
    setExercises(toDraftExercises(routine));
    setPick(library[0]?.id ?? "");
    setError(undefined);
  }, [open, routine, library]);

  const patch = (index: number, values: Partial<RoutineDraftExercise>) =>
    setExercises((list) =>
      list.map((ex, i) => {
        if (i !== index) return ex;
        const updated = { ...ex, ...values };
        // Le repos se recalcule automatiquement quand les reps changent.
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
      { exerciseId: found.id, name: found.name, sets: "4", weight: "0", reps: "8", rest: "90", favorite: false },
    ]);
  };

  const submit = async () => {
    if (!name.trim()) {
      setError("Donne un nom à la routine.");
      return;
    }
    setSaving(true);
    setError(undefined);
    try {
      await onSave({ id: routine?.id, name: name.trim(), focus: focus.trim(), exercises });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet open={open} title={routine ? "Modifier la routine" : "Nouvelle routine"} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <label style={{ display: "block" }}>
          <div style={sectionLabel}>Nom de la routine</div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Push"
            style={{ ...field, fontSize: "15px", fontWeight: 500 }}
          />
        </label>

        <label style={{ display: "block" }}>
          <div style={sectionLabel}>Focus / groupes musculaires</div>
          <input
            type="text"
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="Ex: Pectoraux · Épaules · Triceps"
            style={{ ...field, fontSize: "14px", fontWeight: 500 }}
          />
        </label>

        <div>
          <div style={sectionLabel}>Durée estimée</div>
          <div
            style={{
              ...field,
              background: "rgba(192,235,255,0.05)",
              color: "var(--color-accent)",
              fontSize: "16px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {fmtMinSec(draftDurationSec(exercises))}
          </div>
        </div>

        <div>
          <div style={sectionLabel}>Exercices ({exercises.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "260px", overflowY: "auto" }}>
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
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => patch(i, { favorite: !ex.favorite })}
                      aria-label="Favori pour le 1RM"
                      aria-pressed={ex.favorite}
                      style={{
                        height: "24px",
                        width: "24px",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        background: "rgba(192,235,255,0.1)",
                        color: ex.favorite ? "#FBBF24" : "var(--color-at-prefix)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                        <path d="M8 1l2.1 4.6 5 .6-3.7 3.5.9 5-4.3-2.5-4.3 2.5.9-5-3.7-3.5 5-.6z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setExercises((list) => list.filter((_, k) => k !== i))}
                      aria-label={`Retirer ${ex.name}`}
                      style={{
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
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "6px" }}>
                  <label style={{ display: "block" }}>
                    <div style={microLabel}>Séries</div>
                    <input type="text" inputMode="numeric" value={ex.sets} onChange={(e) => patch(i, { sets: e.target.value })} style={microInput} />
                  </label>
                  <label style={{ display: "block" }}>
                    <div style={microLabel}>Charge (kg)</div>
                    <input type="text" inputMode="decimal" value={ex.weight} onChange={(e) => patch(i, { weight: e.target.value })} style={microInput} />
                  </label>
                  <label style={{ display: "block" }}>
                    <div style={microLabel}>Reps</div>
                    <input type="text" inputMode="numeric" value={ex.reps} onChange={(e) => patch(i, { reps: e.target.value })} style={microInput} />
                  </label>
                  <label style={{ display: "block" }}>
                    <div style={microLabel}>Repos (s)</div>
                    <input type="text" inputMode="numeric" value={ex.rest} onChange={(e) => patch(i, { rest: e.target.value })} style={microInput} />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <select
              value={pick}
              onChange={(e) => setPick(e.target.value)}
              aria-label="Choisir un exercice"
              style={{ ...field, flex: 1, height: "44px", fontSize: "13px", fontWeight: 500, padding: "0 10px" }}
            >
              {library.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addExercise}
              className="soma-press"
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
        </div>
      </div>

      {error && (
        <p style={{ color: "var(--color-error)", fontSize: "12px", margin: "12px 0 0", textAlign: "center" }}>{error}</p>
      )}

      <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
        {routine && (
          <button
            type="button"
            className="soma-press"
            onClick={async () => {
              await onDelete(routine.id);
              onClose();
            }}
            style={{
              height: "52px",
              padding: "0 18px",
              borderRadius: "12px",
              background: "rgba(239,68,68,0.12)",
              color: "var(--color-error)",
              fontWeight: 500,
              fontSize: "14px",
              cursor: "pointer",
              border: "none",
            }}
          >
            Supprimer
          </button>
        )}
        <button
          type="button"
          className="soma-press"
          onClick={submit}
          disabled={saving}
          style={{
            flex: 1,
            minHeight: "52px",
            fontWeight: 500,
            fontSize: "15px",
            borderRadius: "12px",
            background: "var(--color-accent)",
            color: "var(--color-on-accent)",
            border: "none",
            cursor: saving ? "not-allowed" : "pointer",
            boxSizing: "border-box",
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </BottomSheet>
  );
}
