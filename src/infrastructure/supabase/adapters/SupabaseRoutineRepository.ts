import type {
  RoutineRepository,
  RoutineDraft,
  WeeklyPlan,
} from "@domain/workout/ports/RoutineRepository";
import type { Routine, RoutineExercise } from "@domain/workout/entities/Routine";
import { supabase } from "@infrastructure/supabase/client";

interface RoutineExerciseRow {
  routine_id?: string;
  exercise_id: string;
  position: number | null;
  target_sets: number | null;
  target_weight_kg: number | string | null;
  target_reps: string | null;
  rest_sec: number | null;
  is_favorite?: boolean | null;
  exercises: { name: string } | { name: string }[] | null;
}

const EXERCISE_SELECT =
  "routine_id, exercise_id, position, target_sets, target_weight_kg, target_reps, rest_sec, is_favorite, exercises(name)";

/** Le nom vient de la jointure `exercises` (peut revenir en tableau). */
function exerciseName(rel: RoutineExerciseRow["exercises"]): string {
  if (!rel) return "Exercice";
  return Array.isArray(rel) ? (rel[0]?.name ?? "Exercice") : rel.name;
}

function toRoutineExercise(r: RoutineExerciseRow, i: number): RoutineExercise {
  return {
    exerciseId: r.exercise_id,
    name: exerciseName(r.exercises),
    position: r.position ?? i,
    targetSets: r.target_sets ?? 1,
    targetWeightKg: Number(r.target_weight_kg ?? 0),
    targetReps: r.target_reps ?? "",
    restSec: r.rest_sec ?? 90,
    favorite: r.is_favorite ?? false,
  };
}

async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Session expirée. Reconnecte-toi.");
  return data.user.id;
}

export class SupabaseRoutineRepository implements RoutineRepository {
  async getRoutineForWeekday(weekday: number): Promise<Routine | null> {
    const { data: plan, error: planError } = await supabase
      .from("weekly_plan")
      .select("routine_id")
      .eq("weekday", weekday)
      .maybeSingle();
    if (planError) throw new Error(planError.message);
    if (!plan?.routine_id) return null;

    const routines = await this.listRoutines();
    return routines.find((r) => r.id === plan.routine_id) ?? null;
  }

  async listRoutines(): Promise<Routine[]> {
    const { data: routines, error } = await supabase
      .from("routines")
      .select("id, name, focus")
      .is("deleted_at", null)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    if (!routines || routines.length === 0) return [];

    const ids = routines.map((r) => r.id as string);
    const { data: rows, error: exError } = await supabase
      .from("routine_exercises")
      .select(EXERCISE_SELECT)
      .in("routine_id", ids)
      .order("position", { ascending: true });
    if (exError) throw new Error(exError.message);

    const byRoutine = new Map<string, RoutineExercise[]>();
    ((rows ?? []) as RoutineExerciseRow[]).forEach((r, i) => {
      const key = r.routine_id as string;
      const list = byRoutine.get(key) ?? [];
      list.push(toRoutineExercise(r, i));
      byRoutine.set(key, list);
    });

    return routines.map((r) => ({
      id: r.id as string,
      name: (r.name as string) ?? "Routine",
      focus: (r.focus as string) ?? null,
      exercises: byRoutine.get(r.id as string) ?? [],
    }));
  }

  async getWeeklyPlan(): Promise<WeeklyPlan> {
    const { data, error } = await supabase.from("weekly_plan").select("weekday, routine_id");
    if (error) throw new Error(error.message);
    const plan: WeeklyPlan = {};
    for (let d = 0; d < 7; d += 1) plan[d] = null;
    for (const row of data ?? []) plan[row.weekday as number] = (row.routine_id as string) ?? null;
    return plan;
  }

  async assignRoutine(weekday: number, routineId: string | null): Promise<void> {
    const userId = await currentUserId();
    if (routineId === null) {
      const { error } = await supabase
        .from("weekly_plan")
        .delete()
        .eq("user_id", userId)
        .eq("weekday", weekday);
      if (error) throw new Error(error.message);
      return;
    }
    const { error } = await supabase
      .from("weekly_plan")
      .upsert(
        { user_id: userId, weekday, routine_id: routineId, updated_at: new Date().toISOString() },
        { onConflict: "user_id,weekday" },
      );
    if (error) throw new Error(error.message);
  }

  async saveRoutine(draft: RoutineDraft): Promise<string> {
    const userId = await currentUserId();
    let routineId = draft.id;

    if (routineId) {
      const { error } = await supabase
        .from("routines")
        .update({ name: draft.name, focus: draft.focus, updated_at: new Date().toISOString() })
        .eq("id", routineId);
      if (error) throw new Error(error.message);
    } else {
      const { data, error } = await supabase
        .from("routines")
        .insert({ user_id: userId, name: draft.name, focus: draft.focus })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      routineId = data.id as string;
    }

    // Remplacement complet des exercices : simple et cohérent avec l'éditeur.
    const { error: delError } = await supabase
      .from("routine_exercises")
      .delete()
      .eq("routine_id", routineId);
    if (delError) throw new Error(delError.message);

    if (draft.exercises.length > 0) {
      const rows = draft.exercises.map((ex, i) => ({
        routine_id: routineId,
        exercise_id: ex.exerciseId,
        position: i,
        target_sets: parseInt(ex.sets, 10) || 1,
        target_weight_kg: parseFloat(ex.weight) || 0,
        target_reps: ex.reps,
        rest_sec: parseInt(ex.rest, 10) || 90,
        is_favorite: ex.favorite,
      }));
      const { error: insError } = await supabase.from("routine_exercises").insert(rows);
      if (insError) throw new Error(insError.message);
    }

    return routineId;
  }

  async deleteRoutine(routineId: string): Promise<void> {
    const { error } = await supabase
      .from("routines")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", routineId);
    if (error) throw new Error(error.message);
  }
}
