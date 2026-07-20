import { useState } from "react";
import { BottomSheet } from "@presentation/components/BottomSheet";
import type { Exercise } from "@domain/workout/entities/Exercise";
import type { Routine } from "@domain/workout/entities/Routine";

export interface ExercisePickerSheetProps {
  open: boolean;
  /** Exercice à ajouter (null = sheet fermé). */
  exercise: Exercise | null;
  routines: Routine[];
  onClose: () => void;
  onAdd: (routine: Routine, exercise: Exercise) => Promise<void>;
}

/**
 * « Ajouter <exercice> à… » — choix de la routine de destination.
 * Déclenché par le bouton + de la bibliothèque.
 */
export function ExercisePickerSheet({ open, exercise, routines, onClose, onAdd }: ExercisePickerSheetProps) {
  const [busyId, setBusyId] = useState<string>();
  const [error, setError] = useState<string>();

  const add = async (routine: Routine) => {
    if (!exercise) return;
    setBusyId(routine.id);
    setError(undefined);
    try {
      await onAdd(routine, exercise);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ajout impossible.");
    } finally {
      setBusyId(undefined);
    }
  };

  return (
    <BottomSheet open={open} title={`Ajouter « ${exercise?.name ?? ""} » à…`} onClose={onClose}>
      {routines.length === 0 ? (
        <p style={{ color: "var(--color-at-prefix)", fontSize: "13px", textAlign: "center", padding: "16px 0", margin: 0 }}>
          Aucune routine. Crée-en une d'abord dans Planning.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {routines.map((routine) => (
            <button
              key={routine.id}
              type="button"
              onClick={() => void add(routine)}
              disabled={busyId !== undefined}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                padding: "12px",
                borderRadius: "12px",
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border)",
                cursor: busyId ? "not-allowed" : "pointer",
                textAlign: "left",
                boxSizing: "border-box",
                opacity: busyId && busyId !== routine.id ? 0.5 : 1,
              }}
            >
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", color: "#fff", fontSize: "15px", fontWeight: 900 }}>{routine.name}</span>
                <span style={{ display: "block", color: "var(--color-text-muted)", fontSize: "12px" }}>
                  {routine.focus ?? ""}
                </span>
              </span>
              <span style={{ flexShrink: 0, color: "var(--color-accent)", fontSize: "12px", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
                {busyId === routine.id ? "Ajout…" : `${routine.exercises.length} ex.`}
              </span>
            </button>
          ))}
        </div>
      )}

      {error && (
        <p style={{ color: "var(--color-error)", fontSize: "12px", margin: "12px 0 0", textAlign: "center" }}>{error}</p>
      )}
    </BottomSheet>
  );
}
