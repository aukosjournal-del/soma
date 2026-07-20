import type { AnalyticsRepository, WeeklyAnalytics } from "@domain/analytics/ports/AnalyticsRepository";
import { emptyWeek, weekdayIndexOf } from "@domain/analytics/entities/WeeklySeries";
import type { BestSet } from "@domain/analytics/value-objects/Brzycki";
import type { ExerciseHistoryEntry } from "@domain/analytics/entities/Progression";
import { supabase } from "@infrastructure/supabase/client";

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Agrégats hebdomadaires. Les requêtes restent simples (RLS filtre déjà par
 * utilisateur) et l'agrégation se fait côté client : volume de données faible,
 * et aucune vue SQL supplémentaire à maintenir.
 */
export class SupabaseAnalyticsRepository implements AnalyticsRepository {
  async getWeeklyAnalytics(weekStart: Date): Promise<WeeklyAnalytics> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const volume = emptyWeek();
    const steps = emptyWeek();
    const kcal = emptyWeek();
    const todaySets: BestSet[] = [];

    // 1) Séances terminées de la semaine.
    const { data: sessions, error: sessionsError } = await supabase
      .from("workout_sessions")
      .select("id, completed_at")
      .not("completed_at", "is", null)
      .gte("completed_at", weekStart.toISOString())
      .lt("completed_at", weekEnd.toISOString());
    if (sessionsError) throw new Error(sessionsError.message);

    if (sessions && sessions.length > 0) {
      const dayBySession = new Map<string, number>();
      for (const s of sessions) {
        const idx = weekdayIndexOf(new Date(s.completed_at as string), weekStart);
        if (idx !== null) dayBySession.set(s.id as string, idx);
      }

      // 2) Exercices de ces séances.
      const { data: exercises, error: exError } = await supabase
        .from("session_exercises")
        .select("id, session_id, exercise_name")
        .in("session_id", Array.from(dayBySession.keys()));
      if (exError) throw new Error(exError.message);

      const exerciseMeta = new Map<string, { day: number; name: string }>();
      for (const ex of exercises ?? []) {
        const day = dayBySession.get(ex.session_id as string);
        if (day !== undefined) {
          exerciseMeta.set(ex.id as string, { day, name: (ex.exercise_name as string) ?? "Exercice" });
        }
      }

      // 3) Séries validées -> tonnage par jour + séries du jour pour le 1RM.
      if (exerciseMeta.size > 0) {
        const { data: sets, error: setsError } = await supabase
          .from("session_sets")
          .select("session_exercise_id, weight_kg, reps, status")
          .eq("status", "completed")
          .in("session_exercise_id", Array.from(exerciseMeta.keys()));
        if (setsError) throw new Error(setsError.message);

        const todayIdx = weekdayIndexOf(new Date(), weekStart);
        for (const set of sets ?? []) {
          const meta = exerciseMeta.get(set.session_exercise_id as string);
          if (!meta) continue;
          const weightKg = Number(set.weight_kg ?? 0);
          const reps = Number(set.reps ?? 0);
          volume[meta.day] = (volume[meta.day] ?? 0) + weightKg * reps;
          if (meta.day === todayIdx && weightKg > 0 && reps > 0) {
            todaySets.push({ exerciseName: meta.name, weightKg, reps });
          }
        }
      }
    }

    // 4) Pas et calories (une ligne par jour).
    const [stepsRes, kcalRes] = await Promise.all([
      supabase
        .from("step_entries")
        .select("entry_date, steps")
        .gte("entry_date", isoDate(weekStart))
        .lt("entry_date", isoDate(weekEnd)),
      supabase
        .from("nutrition_entries")
        .select("entry_date, kcal")
        .gte("entry_date", isoDate(weekStart))
        .lt("entry_date", isoDate(weekEnd)),
    ]);
    if (stepsRes.error) throw new Error(stepsRes.error.message);
    if (kcalRes.error) throw new Error(kcalRes.error.message);

    for (const row of stepsRes.data ?? []) {
      const idx = weekdayIndexOf(new Date(`${row.entry_date as string}T00:00:00`), weekStart);
      if (idx !== null) steps[idx] = (steps[idx] ?? 0) + Number(row.steps ?? 0);
    }
    for (const row of kcalRes.data ?? []) {
      const idx = weekdayIndexOf(new Date(`${row.entry_date as string}T00:00:00`), weekStart);
      if (idx !== null) kcal[idx] = (kcal[idx] ?? 0) + Number(row.kcal ?? 0);
    }

    return { volume: volume.map(Math.round), steps, kcal, todaySets };
  }

  async getExerciseHistory(): Promise<Record<string, ExerciseHistoryEntry[]>> {
    // Toutes les séries validées de l'utilisateur (RLS), avec le nom de l'exercice.
    const { data, error } = await supabase
      .from("session_sets")
      .select("weight_kg, reps, completed_at, session_exercises!inner(exercise_name)")
      .eq("status", "completed")
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: true });
    if (error) throw new Error(error.message);

    const history: Record<string, ExerciseHistoryEntry[]> = {};
    for (const row of (data ?? []) as HistoryRow[]) {
      const rel = row.session_exercises;
      const name = Array.isArray(rel) ? rel[0]?.exercise_name : rel?.exercise_name;
      if (!name) continue;
      const entry: ExerciseHistoryEntry = {
        weightKg: Number(row.weight_kg ?? 0),
        reps: Number(row.reps ?? 0),
        completedAt: row.completed_at ?? "",
      };
      if (entry.weightKg <= 0) continue;
      (history[name] ??= []).push(entry);
    }
    return history;
  }
}

interface HistoryRow {
  weight_kg: number | string | null;
  reps: number | null;
  completed_at: string | null;
  session_exercises: { exercise_name: string } | { exercise_name: string }[] | null;
}
