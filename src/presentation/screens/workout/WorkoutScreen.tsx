import { useEffect, useState } from "react";
import { AppShell } from "@presentation/components/AppShell";
import { ExerciseCard } from "@presentation/components/ExerciseCard";
import { RestTimerBar } from "@presentation/components/RestTimerBar";
import { useWorkoutSession } from "@presentation/hooks/useWorkoutSession";
import { sessionProgress, sessionVolumeKg } from "@domain/workout/entities/SessionExercise";
import { fmtTime } from "@domain/workout/value-objects/Duration";

/**
 * Mode Séance. Trois principes de hiérarchie, pour un écran lu entre deux
 * séries, à une main, sous effort :
 *  - une seule donnée dominante par niveau, distinguée par la TAILLE
 *    (la graisse 900 uniforme du prototype annulait toute hiérarchie) ;
 *  - tous les chiffres en tabulaire, pour qu'ils ne sautillent pas à la
 *    seconde ni à la saisie ;
 *  - aucune bordure décorative : la séparation se fait par le contraste
 *    des surfaces et par l'espace.
 */
export function WorkoutScreen({ onFinished }: { onFinished?: () => void } = {}) {
  const { exercises, routineName, startedAt, loading, error, check, fail, setField, finish } =
    useWorkoutSession();
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string>();
  const elapsed = useElapsedSec(startedAt);
  const progress = sessionProgress(exercises);
  const volume = sessionVolumeKg(exercises);

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

  const canFinish = progress.done > 0 && !finishing;

  return (
    <>
      <AppShell>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <header style={{ padding: "8px 0 0" }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <h1
                style={{
                  color: "#fff",
                  fontSize: "var(--text-display)",
                  fontWeight: "var(--weight-medium)",
                  margin: 0,
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {routineName ?? "Séance libre"}
              </h1>
              {exercises.length > 0 && (
                <button
                  type="button"
                  className="soma-press"
                  onClick={handleFinish}
                  disabled={!canFinish}
                  style={{
                    flexShrink: 0,
                    height: "32px",
                    padding: "0 14px",
                    borderRadius: "var(--radius-pill)",
                    border: "none",
                    background: canFinish ? "var(--color-accent)" : "var(--color-bg-elevated)",
                    color: canFinish ? "var(--color-on-accent)" : "var(--color-text-faint)",
                    fontSize: "var(--text-label)",
                    fontWeight: "var(--weight-medium)",
                    cursor: canFinish ? "pointer" : "not-allowed",
                  }}
                >
                  {finishing ? "…" : "Terminer"}
                </button>
              )}
            </div>

            <div style={{ display: "flex", gap: "20px", margin: "12px 0 10px" }}>
              <Stat label="Durée" value={fmtTime(elapsed)} />
              <Stat label="Volume" value={`${volume.toLocaleString("fr-FR")} kg`} />
              <Stat label="Séries" value={`${progress.done}/${progress.total}`} align="right" />
            </div>

            <div
              style={{
                height: "3px",
                background: "var(--color-border-soft)",
                borderRadius: "var(--radius-pill)",
                overflow: "hidden",
              }}
              role="progressbar"
              aria-valuenow={progress.percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progression de la séance"
            >
              <div
                style={{
                  height: "100%",
                  background: "var(--color-accent)",
                  borderRadius: "var(--radius-pill)",
                  transition: "width var(--duration-med) var(--ease-spring)",
                  width: `${progress.percent}%`,
                }}
              />
            </div>
          </header>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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

            {finishError && (
              <p
                style={{
                  color: "var(--color-error)",
                  fontSize: "var(--text-label)",
                  margin: 0,
                  textAlign: "center",
                }}
              >
                {finishError}
              </p>
            )}
          </div>
        </div>
      </AppShell>

      <RestTimerBar />
    </>
  );
}

function Stat({
  label,
  value,
  align = "left",
}: {
  label: string;
  value: string;
  align?: "left" | "right";
}) {
  return (
    <div style={{ textAlign: align, marginLeft: align === "right" ? "auto" : undefined }}>
      <p
        style={{
          color: "#fff",
          fontSize: "var(--text-metric)",
          fontWeight: "var(--weight-medium)",
          margin: 0,
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1.2,
        }}
      >
        {value}
      </p>
      <p style={{ color: "var(--color-text-faint)", fontSize: "var(--text-caption)", margin: "1px 0 0" }}>
        {label}
      </p>
    </div>
  );
}

/**
 * Temps écoulé depuis le début de la séance. Recalculé depuis `startedAt` à
 * chaque tick plutôt qu'incrémenté : un compteur incrémental dérive dès que
 * l'onglet passe en arrière-plan (les timers y sont bridés).
 */
function useElapsedSec(startedAt: string | null): number {
  const compute = () =>
    startedAt ? Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)) : 0;
  const [elapsed, setElapsed] = useState(compute);

  useEffect(() => {
    setElapsed(compute);
    if (!startedAt) return;
    const id = window.setInterval(() => setElapsed(compute), 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt]);

  return elapsed;
}

function EmptyCard({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div
      style={{
        background: "var(--color-bg-elevated)",
        borderRadius: "var(--radius-lg)",
        padding: "32px 16px",
        textAlign: "center",
        backdropFilter: "var(--blur-glass)",
        WebkitBackdropFilter: "var(--blur-glass)",
      }}
    >
      <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-body)", margin: 0 }}>{title}</p>
      {subtitle && (
        <p style={{ color: "var(--color-text-faint)", fontSize: "var(--text-label)", margin: "6px 0 0" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
