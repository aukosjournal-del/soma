import { useCallback, useEffect, useMemo, useState } from "react";
import type { Routine } from "@domain/workout/entities/Routine";
import type { Difficulty, Exercise } from "@domain/workout/entities/Exercise";
import type { RoutineDraft, WeeklyPlan } from "@domain/workout/ports/RoutineRepository";
import type { NewExercise } from "@domain/workout/ports/ExerciseRepository";
import { todayIndex } from "@domain/workout/entities/Routine";
import { activeSessionStore } from "./activeSessionStore";
import { SupabaseRoutineRepository } from "@infrastructure/supabase/adapters/SupabaseRoutineRepository";
import { SupabaseExerciseRepository } from "@infrastructure/supabase/adapters/SupabaseExerciseRepository";
import { SupabaseProfileRepository } from "@infrastructure/supabase/adapters/SupabaseProfileRepository";
import type { ExperienceLevel } from "@domain/onboarding/value-objects/ExperienceLevel";

/**
 * État du Planning : routines, plan hebdomadaire, bibliothèque d'exercices.
 * Toutes les écritures repassent par Supabase puis rafraîchissent l'état.
 */
export function usePlanning() {
  const routinesRepo = useMemo(() => new SupabaseRoutineRepository(), []);
  const exercisesRepo = useMemo(() => new SupabaseExerciseRepository(), []);
  const profilesRepo = useMemo(() => new SupabaseProfileRepository(), []);

  const [routines, setRoutines] = useState<Routine[]>([]);
  const [plan, setPlan] = useState<WeeklyPlan>({});
  const [library, setLibrary] = useState<Exercise[]>([]);
  const [selectedDay, setSelectedDay] = useState(todayIndex());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [flash, setFlash] = useState(false);
  const [level, setLevel] = useState<ExperienceLevel>("intermediaire");

  const refresh = useCallback(async () => {
    try {
      const [r, p, lib, lvl] = await Promise.all([
        routinesRepo.listRoutines(),
        routinesRepo.getWeeklyPlan(),
        exercisesRepo.listExercises(),
        profilesRepo.getExperienceLevel(),
      ]);
      setRoutines(r);
      setPlan(p);
      setLibrary(lib);
      setLevel(lvl);
      setError(undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }, [routinesRepo, exercisesRepo, profilesRepo]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /** Tap sur une routine : assigne au jour sélectionné, ou retire si déjà assignée. */
  const assign = useCallback(
    async (routineId: string) => {
      const next = plan[selectedDay] === routineId ? null : routineId;
      setPlan((p) => ({ ...p, [selectedDay]: next })); // optimiste
      try {
        await routinesRepo.assignRoutine(selectedDay, next);
        // Le planning du jour a changé : la séance en cache doit se
        // reconstruire (sauf si elle est déjà commencée).
        if (selectedDay === todayIndex()) activeSessionStore.invalidateIfUntouched();
        setFlash(true);
        window.setTimeout(() => setFlash(false), 1200);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Assignation impossible.");
        await refresh();
      }
    },
    [plan, selectedDay, routinesRepo, refresh],
  );

  const saveRoutine = useCallback(
    async (draft: RoutineDraft) => {
      await routinesRepo.saveRoutine(draft);
      // Si la routine modifiée est celle d'aujourd'hui, la séance doit refléter
      // les nouveaux exercices.
      if (draft.id && plan[todayIndex()] === draft.id) {
        activeSessionStore.invalidateIfUntouched();
      }
      await refresh();
    },
    [plan, routinesRepo, refresh],
  );

  const deleteRoutine = useCallback(
    async (routineId: string) => {
      await routinesRepo.deleteRoutine(routineId);
      await refresh();
    },
    [routinesRepo, refresh],
  );

  const createExercise = useCallback(
    async (exercise: NewExercise) => {
      await exercisesRepo.createExercise(exercise);
      await refresh();
    },
    [exercisesRepo, refresh],
  );

  const updateDifficulty = useCallback(
    async (exerciseId: string, difficulty: Difficulty) => {
      await exercisesRepo.updateDifficulty(exerciseId, difficulty);
      await refresh();
    },
    [exercisesRepo, refresh],
  );

  return {
    updateDifficulty,
    createExercise,
    level,
    routines,
    plan,
    library,
    selectedDay,
    setSelectedDay,
    loading,
    error,
    flash,
    assign,
    saveRoutine,
    deleteRoutine,
  };
}
