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

/**
 * Séance du jour — offline-first. L'état vit dans `activeSessionStore`
 * (localStorage) ; la routine n'est chargée depuis Supabase que s'il n'y a pas
 * déjà une séance du jour en cours (reprise sans réseau, ou Séance Libre).
 */
export function useWorkoutSession() {
  const routines = useMemo(() => new SupabaseRoutineRepository(), []);
  const profiles = useMemo(() => new SupabaseProfileRepository(), []);

  const session = useActiveSession();
  // Une séance vide (aucun exercice) n'est pas un cache valide : le planning a
  // pu être renseigné depuis. On retente le chargement à chaque affichage.
  const cached = session !== null && session.exercises.length > 0;
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (cached) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const [routine, coefficient] = await Promise.all([
          routines.getRoutineForWeekday(todayIndex()),
          profiles.getExperienceCoefficient(),
        ]);
        if (cancelled) return;
        activeSessionStore.start(
          routine?.name ?? null,
          buildSessionExercises(routine as Routine | null, coefficient),
          routine?.id ?? null,
        );
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Chargement impossible.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cached, routines, profiles]);

  const check = useCallback((exerciseId: string, setId: number) => {
    activeSessionStore.updateExercises((current) => {
      const { exercises, justChecked, restSec } = toggleSetChecked(current, exerciseId, setId);
      // Valider une série démarre le repos (comportement du prototype).
      if (justChecked) restTimerStore.start(restSec);
      return exercises;
    });
  }, []);

  const fail = useCallback((exerciseId: string, setId: number) => {
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
      source: session.routineId ? "routine" : "free",
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
    loading,
    error,
    check,
    fail,
    setField,
    finish,
  };
}
