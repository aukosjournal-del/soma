import type { Difficulty, Exercise } from "../entities/Exercise";

export interface NewExercise {
  name: string;
  muscleGroup: string;
  equipment: string;
  difficulty: Difficulty;
  description: string;
}

/** Bibliothèque d'exercices (globaux + personnalisés de l'utilisateur). */
export interface ExerciseRepository {
  listExercises(): Promise<Exercise[]>;
  /** Crée un exercice personnalisé appartenant à l'utilisateur courant. */
  createExercise(exercise: NewExercise): Promise<Exercise>;
  /** Met à jour la difficulté globale d'un exercice. */
  updateDifficulty(exerciseId: string, difficulty: Difficulty): Promise<void>;
}
