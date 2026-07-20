import { useMemo, useState } from "react";
import { AppShell } from "@presentation/components/AppShell";
import { DayPicker } from "@presentation/components/DayPicker";
import { Chip } from "@presentation/components/Chip";
import { RoutineEditorSheet } from "./RoutineEditorSheet";
import { FreeSessionSheet } from "./FreeSessionSheet";
import { CustomExerciseSheet } from "./CustomExerciseSheet";
import { ExercisePickerSheet } from "./ExercisePickerSheet";
import { ExerciseInfoSheet } from "./ExerciseInfoSheet";
import type { Difficulty, Exercise } from "@domain/workout/entities/Exercise";
import type { RoutineDraftExercise } from "@domain/workout/ports/RoutineRepository";

export interface PlanningScreenProps {
  /** Lance la séance générée et bascule sur le Mode Séance. */
  onLaunchFreeSession: (exercises: RoutineDraftExercise[]) => void;
}
import { usePlanning } from "@presentation/hooks/usePlanning";
import { ALL_FILTER, DIFFICULTY_COLOR, distinctValues, filterExercises } from "@domain/workout/entities/Exercise";
import { routineEstimatedSec } from "@domain/workout/entities/SessionExercise";
import { DAYS_FULL } from "@domain/workout/entities/Routine";
import type { Routine } from "@domain/workout/entities/Routine";

const card = {
  background: "var(--color-bg-elevated)",
  border: "1px solid var(--color-border)",
  borderRadius: "24px",
  padding: "16px",
  backdropFilter: "var(--blur-glass)",
  WebkitBackdropFilter: "var(--blur-glass)",
  boxShadow: "var(--shadow-card)",
} as const;

const eyebrow = {
  color: "var(--color-at-prefix)",
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "var(--tracking-eyebrow)",
  margin: 0,
} as const;

/**
 * Planning — clone du bloc `isPlanning` : sélecteur 7 jours, routines
 * assignables au tap, bibliothèque d'exercices filtrée par chips.
 */
export function PlanningScreen({ onLaunchFreeSession }: PlanningScreenProps) {
  const {
    routines,
    plan,
    library,
    level,
    selectedDay,
    setSelectedDay,
    loading,
    error,
    flash,
    assign,
    saveRoutine,
    deleteRoutine,
    createExercise,
    updateDifficulty,
  } = usePlanning();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Routine | null>(null);
  const [freeOpen, setFreeOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [pickerExercise, setPickerExercise] = useState<Exercise | null>(null);
  const [infoExercise, setInfoExercise] = useState<Exercise | null>(null);
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState(ALL_FILTER);
  const [equipment, setEquipment] = useState(ALL_FILTER);

  const muscles = useMemo(() => distinctValues(library, "muscleGroup"), [library]);
  const equipments = useMemo(() => distinctValues(library, "equipment"), [library]);
  const filtered = useMemo(
    () => filterExercises(library, query, muscle, equipment),
    [library, query, muscle, equipment],
  );

  const assignedId = plan[selectedDay] ?? null;
  const assignedName = routines.find((r) => r.id === assignedId)?.name ?? "Aucune routine";

  const openEditor = (routine: Routine | null) => {
    setEditing(routine);
    setEditorOpen(true);
  };

  /** Ajoute l'exercice choisi à la routine, en conservant ses exercices existants. */
  const addExerciseToRoutine = async (routine: Routine, exercise: Exercise) => {
    await saveRoutine({
      id: routine.id,
      name: routine.name,
      focus: routine.focus ?? "",
      exercises: [
        ...routine.exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          name: ex.name,
          sets: String(ex.targetSets),
          weight: String(ex.targetWeightKg),
          reps: ex.targetReps,
          rest: String(ex.restSec),
          favorite: ex.favorite,
        })),
        { exerciseId: exercise.id, name: exercise.name, sets: "4", weight: "0", reps: "8", rest: "90", favorite: false },
      ],
    });
  };

  /** Modifie la difficulté globale d'un exercice depuis sa fiche. */
  const changeDifficulty = async (exercise: Exercise, difficulty: Difficulty) => {
    await updateDifficulty(exercise.id, difficulty);
  };

  /** Suppression rapide, immédiate — comportement du prototype. */
  const quickDelete = async (routine: Routine) => {
    await deleteRoutine(routine.id);
  };

  return (
    <>
      <AppShell>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "24px" }}>
          <header style={{ padding: "8px 0 0" }}>
            <p style={eyebrow}>Cette semaine</p>
            <h1 style={{ color: "#fff", fontSize: "26px", fontWeight: 900, letterSpacing: "-0.02em", margin: "2px 0 0" }}>
              Planning
            </h1>
          </header>

          <div style={card}>
            <DayPicker selected={selectedDay} assigned={plan} onSelect={setSelectedDay} />
            <div
              style={{
                marginTop: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "12px",
                padding: "8px 12px",
                border: `1px solid ${flash ? "rgba(16,185,129,0.4)" : "var(--color-border)"}`,
                background: flash ? "rgba(16,185,129,0.12)" : "var(--color-bg-elevated)",
                transition: "all 0.3s ease",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="rgba(192,235,255,0.6)" strokeWidth="1.6" aria-hidden="true">
                <rect x="2" y="3" width="12" height="11" rx="1.5" />
                <line x1="2" y1="6.5" x2="14" y2="6.5" />
                <line x1="5" y1="1" x2="5" y2="4.5" />
                <line x1="11" y1="1" x2="11" y2="4.5" />
              </svg>
              <span style={{ color: "var(--color-text-secondary)", fontSize: "13px", fontWeight: 500 }}>
                {DAYS_FULL[selectedDay]} :{" "}
                <span style={{ color: "var(--color-accent)", fontWeight: 700 }}>{assignedName}</span>
              </span>
            </div>
          </div>

          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <p style={eyebrow}>Routines disponibles</p>
              <span style={{ color: "var(--color-text-faint)", fontSize: "11px" }}>Tap pour assigner</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "312px", overflowY: "auto", paddingRight: "4px" }}>
              {loading && <Muted>Chargement…</Muted>}
              {!loading && error && <Muted>{error}</Muted>}
              {!loading && !error && routines.length === 0 && <Muted>Aucune routine. Crée-en une.</Muted>}

              {routines.map((r) => {
                const isAssigned = assignedId === r.id;
                return (
                  <div
                    key={r.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => void assign(r.id)}
                    onKeyDown={(e) => e.key === "Enter" && void assign(r.id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      borderRadius: "12px",
                      padding: "12px",
                      border: `1px solid ${isAssigned ? "rgba(245,158,113,0.6)" : "var(--color-border)"}`,
                      background: isAssigned ? "var(--color-accent-soft)" : "var(--color-bg-elevated)",
                      cursor: "pointer",
                      boxSizing: "border-box",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          flexShrink: 0,
                          height: "40px",
                          width: "40px",
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: isAssigned ? "var(--color-accent)" : "var(--color-border)",
                          color: isAssigned ? "var(--color-on-accent)" : "var(--color-text-secondary)",
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                          <rect x="1" y="9" width="3" height="6" rx="1" />
                          <rect x="20" y="9" width="3" height="6" rx="1" />
                          <rect x="5" y="7" width="3" height="10" rx="1" />
                          <rect x="16" y="7" width="3" height="10" rx="1" />
                          <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ color: "#fff", fontSize: "15px", fontWeight: 900 }}>{r.name}</span>
                          {isAssigned && (
                            <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-accent)" }}>
                              Assigné
                            </span>
                          )}
                        </div>
                        <p style={{ color: "var(--color-text-muted)", fontSize: "12px", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {r.focus ?? ""}
                        </p>
                      </div>

                      <div style={{ flexShrink: 0, textAlign: "right" }}>
                        <div style={{ color: "#fff", fontSize: "12px", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                          {r.exercises.length} ex.
                        </div>
                        <div style={{ color: "var(--color-at-prefix)", fontSize: "11px", fontVariantNumeric: "tabular-nums" }}>
                          ~{Math.round(routineEstimatedSec(r) / 60)}min
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditor(r);
                        }}
                        aria-label={`Modifier ${r.name}`}
                        style={{
                          flexShrink: 0,
                          height: "32px",
                          width: "32px",
                          borderRadius: "10px",
                          border: "none",
                          cursor: "pointer",
                          background: "rgba(192,235,255,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M11 2l3 3-8 8-3.5 0.5L3 10z" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void quickDelete(r);
                        }}
                        aria-label={`Supprimer ${r.name}`}
                        style={{
                          flexShrink: 0,
                          height: "32px",
                          width: "32px",
                          borderRadius: "10px",
                          border: "none",
                          cursor: "pointer",
                          background: "rgba(239,68,68,0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--color-error)",
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                          <line x1="4" y1="4" x2="12" y2="12" />
                          <line x1="12" y1="4" x2="4" y2="12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => openEditor(null)}
              style={{
                width: "100%",
                marginTop: "8px",
                height: "48px",
                borderRadius: "12px",
                border: "1px dashed rgba(192,235,255,0.25)",
                background: "rgba(192,235,255,0.05)",
                color: "rgba(192,235,255,0.7)",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                boxSizing: "border-box",
              }}
            >
              + Créer une routine
            </button>

            <button
              type="button"
              onClick={() => setFreeOpen(true)}
              style={{
                width: "100%",
                marginTop: "8px",
                height: "48px",
                borderRadius: "12px",
                border: "none",
                background: "var(--color-accent-soft)",
                color: "var(--color-accent)",
                fontSize: "13px",
                fontWeight: 800,
                cursor: "pointer",
                boxSizing: "border-box",
              }}
            >
              ⚡ Séance libre
            </button>
          </div>

          <div style={card}>
            <p style={eyebrow}>Bibliothèque d'exercices</p>

            <div
              style={{
                marginTop: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border)",
                borderRadius: "12px",
                height: "48px",
                padding: "0 12px",
                boxSizing: "border-box",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="rgba(192,235,255,0.5)" strokeWidth="1.6" aria-hidden="true">
                <circle cx="7" cy="7" r="5" />
                <line x1="11" y1="11" x2="15" y2="15" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Chercher un exercice, un groupe..."
                aria-label="Rechercher un exercice"
                style={{
                  width: "100%",
                  minWidth: 0,
                  background: "transparent",
                  border: "none",
                  color: "var(--color-text-secondary)",
                  fontSize: "14px",
                  fontWeight: 500,
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginTop: "12px", display: "flex", gap: "8px", overflowX: "auto" }}>
              {muscles.map((m) => (
                <Chip key={m} label={m} active={muscle === m} onClick={() => setMuscle(m)} variant="muscle" />
              ))}
            </div>
            <div style={{ marginTop: "8px", display: "flex", gap: "8px", overflowX: "auto" }}>
              {equipments.map((eq) => (
                <Chip key={eq} label={eq} active={equipment === eq} onClick={() => setEquipment(eq)} variant="equipment" />
              ))}
            </div>

            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px", maxHeight: "312px", overflowY: "auto", paddingRight: "4px" }}>
              {filtered.length === 0 && <Muted>Aucun exercice ne correspond.</Muted>}
              {filtered.map((ex) => (
                <div
                  key={ex.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                    padding: "10px",
                    borderRadius: "12px",
                    background: "var(--color-bg-elevated)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      width: "40px",
                      height: "40px",
                      borderRadius: "8px",
                      background:
                        "repeating-linear-gradient(45deg, rgba(192,235,255,0.1) 0px, rgba(192,235,255,0.1) 4px, rgba(192,235,255,0.05) 4px, rgba(192,235,255,0.05) 8px)",
                      border: "1px solid var(--color-border)",
                    }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ color: "#fff", fontSize: "14px", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {ex.name}
                    </div>
                    <div style={{ color: "var(--color-at-prefix)", fontSize: "11px" }}>
                      {ex.muscleGroup} · {ex.equipment}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: DIFFICULTY_COLOR[ex.difficulty],
                        background: "var(--color-bg-elevated)",
                        border: `1px solid ${DIFFICULTY_COLOR[ex.difficulty]}`,
                        borderRadius: "6px",
                        padding: "4px 8px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ex.muscleGroup}
                    </span>
                    <button
                      type="button"
                      onClick={() => setInfoExercise(ex)}
                      aria-label={`Comment exécuter ${ex.name}`}
                      style={{
                        height: "28px",
                        width: "28px",
                        borderRadius: "8px",
                        border: "1px solid rgba(192,235,255,0.2)",
                        cursor: "pointer",
                        background: "var(--color-bg-elevated)",
                        color: "var(--color-text-secondary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: 800,
                        fontStyle: "italic",
                        fontFamily: "Georgia, serif",
                      }}
                    >
                      i
                    </button>
                    <button
                      type="button"
                      onClick={() => setPickerExercise(ex)}
                      aria-label={`Ajouter ${ex.name} à une routine`}
                      style={{
                        height: "28px",
                        width: "28px",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        background: "var(--color-accent-soft)",
                        color: "var(--color-accent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                        <line x1="8" y1="2" x2="8" y2="14" />
                        <line x1="2" y1="8" x2="14" y2="8" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setCustomOpen(true)}
              style={{
                width: "100%",
                marginTop: "10px",
                height: "48px",
                background: "rgba(192,235,255,0.05)",
                border: "1px dashed rgba(192,235,255,0.2)",
                borderRadius: "12px",
                color: "var(--color-text-muted)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                boxSizing: "border-box",
              }}
            >
              + CRÉER UN EXERCICE PERSONNALISÉ
            </button>
          </div>
        </div>
      </AppShell>

      <RoutineEditorSheet
        open={editorOpen}
        routine={editing}
        library={library}
        onClose={() => setEditorOpen(false)}
        onSave={saveRoutine}
        onDelete={deleteRoutine}
      />

      <FreeSessionSheet
        open={freeOpen}
        library={library}
        defaultLevel={level}
        onClose={() => setFreeOpen(false)}
        onLaunch={(exercises) => {
          setFreeOpen(false);
          onLaunchFreeSession(exercises);
        }}
      />

      <CustomExerciseSheet open={customOpen} library={library} onClose={() => setCustomOpen(false)} onCreate={createExercise} />

      <ExercisePickerSheet
        open={pickerExercise !== null}
        exercise={pickerExercise}
        routines={routines}
        onClose={() => setPickerExercise(null)}
        onAdd={addExerciseToRoutine}
      />

      <ExerciseInfoSheet
        open={infoExercise !== null}
        exercise={infoExercise}
        onClose={() => setInfoExercise(null)}
        onChangeDifficulty={changeDifficulty}
      />
    </>
  );
}

function Muted({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ color: "var(--color-text-faint)", fontSize: "12px", textAlign: "center", padding: "12px 0", margin: 0 }}>
      {children}
    </p>
  );
}
