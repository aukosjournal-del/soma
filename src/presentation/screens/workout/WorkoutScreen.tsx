import { useState } from "react";
import { AppShell } from "@presentation/components/AppShell";
import { ExerciseCard } from "@presentation/components/ExerciseCard";
import { RestTimerBar } from "@presentation/components/RestTimerBar";
import { useWorkoutSession } from "@presentation/hooks/useWorkoutSession";
import { sessionProgress, sessionEstimatedSec } from "@domain/workout/entities/SessionExercise";
import { fmtMinSec } from "@domain/workout/value-objects/Duration";
import { DAYS_FULL, todayIndex } from "@domain/workout/entities/Routine";

/**
 * Mode Séance — clone pixel-perfect du bloc `isWorkout` du prototype :
 * en-tête (titre du jour + durée estimée), barre de progression séries,
 * cartes glass par exercice, minuteur de repos global.
 */
export function WorkoutScreen({ onFinished }: { onFinished?: () => void } = {}) {
  const { exercises, routineName, loading, error, check, fail, setField, finish } = useWorkoutSession();
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string>();
  const progress = sessionProgress(exercises);

  const handleFinish = async () => {
    setFinishing(true);
    setFinishError(undefined);
    try {
      await finish();
      onFinished?.();
    } catch (e) {
      setFinishError(e instanceof Error ? e.message : "Enregistrement impossible.");
    } finally {
      setFinishing(false);
    }
  };
  const dayLabel = DAYS_FULL[todayIndex()] ?? "";
  const title = `${dayLabel} : ${(routineName ?? "Libre").toUpperCase()}`;

  return (
    <>
      <AppShell>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ padding: "8px 0 0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
                  Séance en cours
                </p>
                <h1 style={{ color: "#fff", fontSize: "24px", fontWeight: 900, margin: "2px 0 0" }}>
                  {title}
                </h1>
              </div>
              <div style={{ flexShrink: 0, textAlign: "right" }}>
                <p
                  style={{
                    color: "var(--color-at-prefix)",
                    fontSize: "10px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    margin: 0,
                  }}
                >
                  Durée estimée
                </p>
                <p
                  style={{
                    color: "var(--color-accent)",
                    fontSize: "16px",
                    fontWeight: 800,
                    margin: "2px 0 0",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {fmtMinSec(sessionEstimatedSec(exercises))}
                </p>
              </div>
            </div>

            <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  flex: 1,
                  height: "6px",
                  background: "var(--color-border)",
                  borderRadius: "999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background: "var(--color-accent)",
                    borderRadius: "999px",
                    transition: "width 0.5s ease",
                    width: `${progress.percent}%`,
                  }}
                />
              </div>
              <span
                style={{
                  color: "var(--color-text-muted)",
                  fontSize: "12px",
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {progress.done}/{progress.total}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {loading && <EmptyCard title="Chargement de ta séance…" />}

            {!loading && error && <EmptyCard title="Séance indisponible" subtitle={error} />}

            {!loading &&
              !error &&
              exercises.map((exercise, i) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  index={i}
                  total={exercises.length}
                  onWeight={(setId, v) => setField(exercise.id, setId, "weight", v)}
                  onReps={(setId, v) => setField(exercise.id, setId, "reps", v)}
                  onCheck={(setId) => check(exercise.id, setId)}
                  onFail={(setId) => fail(exercise.id, setId)}
                />
              ))}

            {!loading && !error && exercises.length === 0 && (
              <EmptyCard
                title="Aucune routine assignée aujourd'hui."
                subtitle="Va dans Planning pour assigner une routine à ce jour."
              />
            )}

            {!loading && !error && exercises.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={finishing || progress.done === 0}
                  style={{
                    width: "100%",
                    minHeight: "52px",
                    fontWeight: 800,
                    fontSize: "15px",
                    borderRadius: "12px",
                    background: "var(--color-accent)",
                    color: "var(--color-on-accent)",
                    border: "none",
                    cursor: finishing || progress.done === 0 ? "not-allowed" : "pointer",
                    boxSizing: "border-box",
                    opacity: progress.done === 0 ? 0.5 : finishing ? 0.6 : 1,
                  }}
                >
                  {finishing ? "ENREGISTREMENT…" : "TERMINER LA SÉANCE"}
                </button>
                {finishError && (
                  <p style={{ color: "var(--color-error)", fontSize: "12px", margin: 0, textAlign: "center" }}>
                    {finishError}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </AppShell>

      <RestTimerBar />
    </>
  );
}

function EmptyCard({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div
      style={{
        background: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border)",
        borderRadius: "24px",
        padding: "32px 16px",
        textAlign: "center",
        backdropFilter: "var(--blur-glass)",
        WebkitBackdropFilter: "var(--blur-glass)",
      }}
    >
      <p style={{ color: "var(--color-text-muted)", fontSize: "14px", margin: 0 }}>{title}</p>
      {subtitle && (
        <p style={{ color: "var(--color-text-faint)", fontSize: "12px", margin: "6px 0 0" }}>{subtitle}</p>
      )}
    </div>
  );
}
