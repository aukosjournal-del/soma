import type { CompletedSession, SessionRepository } from "@domain/workout/ports/SessionRepository";
import { supabase } from "@infrastructure/supabase/client";

/** Code Postgres d'une violation de contrainte d'unicité. */
const UNIQUE_VIOLATION = "23505";

/**
 * Écrit une séance terminée en trois temps : séance -> exercices -> séries.
 * Les séries non validées sont conservées avec le statut `pending`, celles
 * marquées ratées avec `failed` : l'historique reflète la réalité de la séance.
 *
 * IDEMPOTENT : l'id de la séance vient du client. Si la séance existe déjà
 * (rejeu après coupure réseau), on repart de zéro sur ses lignes filles plutôt
 * que de créer un doublon.
 */
export class SupabaseSessionRepository implements SessionRepository {
  async saveCompleted(session: CompletedSession): Promise<string> {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) throw new Error("Session expirée. Reconnecte-toi.");

    const now = new Date();
    const startedAt = new Date(now.getTime() - session.durationSec * 1000);

    const { error } = await supabase.from("workout_sessions").insert({
      id: session.id,
      user_id: auth.user.id,
      routine_id: session.routineId,
      source: session.source,
      started_at: startedAt.toISOString(),
      completed_at: now.toISOString(),
      duration_sec: session.durationSec,
    });

    if (error && error.code !== UNIQUE_VIOLATION) throw new Error(error.message);

    // Rejeu : on efface les lignes filles éventuellement écrites lors de la
    // tentative précédente, pour éviter des séries en double.
    if (error?.code === UNIQUE_VIOLATION) {
      const { data: previous } = await supabase
        .from("session_exercises")
        .select("id")
        .eq("session_id", session.id);
      const ids = (previous ?? []).map((r) => r.id as string);
      if (ids.length > 0) {
        await supabase.from("session_sets").delete().in("session_exercise_id", ids);
        await supabase.from("session_exercises").delete().eq("session_id", session.id);
      }
    }

    for (const [position, exercise] of session.exercises.entries()) {
      const { data: exRow, error: exError } = await supabase
        .from("session_exercises")
        .insert({
          session_id: session.id,
          exercise_name: exercise.name,
          position,
          rest_sec: exercise.restSec,
        })
        .select("id")
        .single();
      if (exError) throw new Error(exError.message);

      const rows = exercise.sets.map((set) => ({
        session_exercise_id: exRow.id as string,
        set_number: set.id,
        // `set_type` n'est plus envoyé : la colonne porte un DEFAULT 'N' en
        // base et le client n'a jamais produit d'autre valeur. La colonne est
        // conservée telle quelle pour les séries dégressives à venir — rien
        // n'est supprimé côté base, seule l'écriture redondante disparaît.
        weight_kg: parseFloat(set.weight || set.weightPlaceholder) || 0,
        reps: parseInt(set.reps || set.repsPlaceholder, 10) || 0,
        status: set.checked ? "completed" : set.failed ? "failed" : "pending",
        completed_at: set.checked ? now.toISOString() : null,
      }));

      if (rows.length > 0) {
        const { error: setsError } = await supabase.from("session_sets").insert(rows);
        if (setsError) throw new Error(setsError.message);
      }
    }

    return session.id;
  }
}
