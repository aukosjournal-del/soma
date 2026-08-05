import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildSessionExercises,
  toggleSetChecked,
  toggleSetFailed,
  updateSetField,
} from "@domain/workout/entities/SessionExercise";
import { type Routine, todayIndex } from "@domain/workout/entities/Routine";
import { SupabaseRoutineRepository } from "@infrastructure/supabase/adapters/SupabaseRoutineRepository";
import { SupabaseProfileRepository } from "@infrastructure/supabase/adapters/SupabaseProfileRepository";
import { syncQueueStore } from "./syncQueueStore";
import { flushQueue } from "@infrastructure/sync/SyncRunner";
import type { SessionPayload } from "@infrastructure/sync/SupabaseMutationExecutor";
import { restTimerStore } from "./restTimerStore";
import { activeSessionStore, useActiveSession } from "./activeSessionStore";
import { haptics } from "@infrastructure/haptics/haptics";

/**
 * Séance du jour — offline-first. L'état vit dans `activeSessionStore`
 * (localStorage) ; la routine n'est chargée depuis Supabase que s'il n'y a pas
 * déjà une séance du jour en cours (reprise sans réseau, ou Séance Libre).
 */
export function useWorkoutSession() {
  const routines = useMemo(() => new SupabaseRoutineRepository(), []);
  const profiles = useMemo(() => new SupabaseProfileRepository(), []);

  const session = useActiveSession();
  const [loading, setLoading] = useState(session === null);
  const [error, setError] = useState<string>();

  /**
   * À chaque affichage de l'écran, on confronte la séance en cache au planning
   * réel. Le cache seul ne suffit pas : il peut avoir été construit avant
   * l'assignation d'une routine, ou sur un autre appareil.
   *
   * Règles :
   *  - la routine du jour a changé et la séance n'est pas entamée -> on rebâtit ;
   *  - la séance est entamée -> on n'y touche pas, le travail prime ;
   *  - le réseau échoue -> on garde le cache (offline-first).
   */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [routine, coefficient] = await Promise.all([
          routines.getRoutineForWeekday(todayIndex()),
          profiles.getExperienceCoefficient(),
        ]);
        if (cancelled) return;

        const current = activeSessionStore.getSnapshot();
        // Une Séance Libre est un choix explicite : le planning ne la remplace pas.
        if (current?.source === "free") return;
        const sameRoutine = current !== null && current.routineId === (routine?.id ?? null);
        if (sameRoutine) return; // le cache est à jour, on conserve la progression

        // Séance déjà entamée sur une autre routine : on ne détruit rien.
        if (current !== null && !activeSessionStore.invalidateIfUntouched()) return;

        activeSessionStore.start(
          routine?.name ?? null,
          buildSessionExercises(routine as Routine | null, coefficient),
          routine?.id ?? null,
        );
      } catch (e) {
        // Hors-ligne ou erreur réseau : on conserve la séance locale.
        if (!cancelled && activeSessionStore.getSnapshot() === null) {
          setError(e instanceof Error ? e.message : "Chargement impossible.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Volontairement sans `session` en dépendance : on ne veut re-synchroniser
    // qu'au montage de l'écran, pas à chaque série validée.
  }, [routines, profiles]);

  const check = useCallback((exerciseId: string, setId: number) => {
    activeSessionStore.updateExercises((current) => {
      const { exercises, justChecked, restSec } = toggleSetChecked(current, exerciseId, setId);
      // Valider une série démarre le repos (comportement du prototype).
      // L'haptique n'accompagne que la validation, pas la dévalidation :
      // annuler est une correction, pas un accomplissement.
      if (justChecked) {
        haptics.setValidated();
        restTimerStore.start(restSec);
      }
      return exercises;
    });
  }, []);

  const fail = useCallback((exerciseId: string, setId: number) => {
    haptics.setFailed();
    activeSessionStore.updateExercises((current) => toggleSetFailed(current, exerciseId, setId));
  }, []);

  const setField = useCallback(
    (exerciseId: string, setId: number, field: "weight" | "reps", value: string) => {
      activeSessionStore.updateExercises((current) =>
        updateSetField(current, exerciseId, setId, field, value),
      );
    },
    [],
  );

  /**
   * Clôture : la séance part dans la file de synchronisation, puis l'état
   * local est effacé. Fonctionne hors-ligne — le rejeu se fait tout seul au
   * retour du réseau, sans risque de doublon (clé d'idempotence).
   */
  const finish = useCallback(async () => {
    if (!session || session.exercises.length === 0) return;
    const durationSec = Math.max(
      0,
      Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000),
    );
    syncQueueStore.push<SessionPayload>("session.complete", {
      routineId: session.routineId,
      source: session.source,
      routineName: session.routineName,
      durationSec,
      exercises: session.exercises,
    });
    activeSessionStore.clear();
    restTimerStore.close();
    void flushQueue();
  }, [session]);

  return {
    exercises: session?.exercises ?? [],
    routineName: session?.routineName ?? null,
    /** ISO de démarrage — permet d'afficher le temps écoulé réel en séance. */
    startedAt: session?.startedAt ?? null,
    loading,
    error,
    check,
    fail,
    setField,
    finish,
  };
}
