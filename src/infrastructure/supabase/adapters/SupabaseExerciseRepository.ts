import type { ExerciseRepository, NewExercise } from "@domain/workout/ports/ExerciseRepository";
import type { Difficulty, Exercise } from "@domain/workout/entities/Exercise";
import { supabase } from "@infrastructure/supabase/client";

const SELECT = "id, name, muscle_group, equipment, difficulty, description";

function toExercise(r: Record<string, unknown>): Exercise {
  return {
    id: r.id as string,
    name: (r.name as string) ?? "Exercice",
    muscleGroup: (r.muscle_group as string) ?? "Autre",
    equipment: (r.equipment as string) ?? "Autre",
    difficulty: ((r.difficulty as Difficulty) ?? "intermediaire") as Difficulty,
    description: (r.description as string) ?? "",
  };
}

/**
 * Bibliothèque : la policy `exercises_select_global_or_own` expose les
 * exercices globaux + ceux créés par l'utilisateur.
 */
export class SupabaseExerciseRepository implements ExerciseRepository {
  async listExercises(): Promise<Exercise[]> {
    const { data, error } = await supabase
      .from("exercises")
      .select(`${SELECT}, deleted_at`)
      .is("deleted_at", null)
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(toExercise);
  }

  async updateDifficulty(exerciseId: string, difficulty: Difficulty): Promise<void> {
    const { error } = await supabase
      .from("exercises")
      .update({ difficulty })
      .eq("id", exerciseId);
    if (error) throw new Error(error.message);
  }

  async createExercise(exercise: NewExercise): Promise<Exercise> {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) throw new Error("Session expirée. Reconnecte-toi.");

    const { data, error } = await supabase
      .from("exercises")
      .insert({
        owner_id: auth.user.id,
        name: exercise.name,
        muscle_group: exercise.muscleGroup,
        equipment: exercise.equipment,
        difficulty: exercise.difficulty,
        description: exercise.description,
      })
      .select(SELECT)
      .single();
    if (error) throw new Error(error.message);
    return toExercise(data);
  }
}
