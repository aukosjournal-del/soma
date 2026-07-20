import type {
  AccountUpdate,
  DailyGoalsUpdate,
  ProfileReadRepository,
  ProfileSummary,
} from "@domain/profile/ports/ProfileReadRepository";
import { type TrainingHistory, computeStreakWeeks } from "@domain/profile/entities/Achievements";
import {
  type BodyMetrics,
  DEFAULT_VISIBLE_BIO,
  DEFAULT_VISIBLE_INDICATORS,
  emptyBodyMetrics,
} from "@domain/profile/entities/BodyMetrics";
import { supabase } from "@infrastructure/supabase/client";

const num = (v: unknown): number | null => {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Session expirée. Reconnecte-toi.");
  return data.user.id;
}

function traduireErreur(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("duplicate key") && m.includes("username"))
    return "Ce pseudo est déjà pris. Choisis-en un autre.";
  if (m.includes("profiles_username_check"))
    return "Le pseudo doit faire entre 3 et 30 caractères.";
  if (m.includes("visible_bio_metrics_check")) return "6 mesures visibles maximum.";
  if (m.includes("visible_recap_metrics_check")) return "4 indicateurs visibles maximum.";
  return msg;
}

export class SupabaseProfileReadRepository implements ProfileReadRepository {
  async getSummary(): Promise<ProfileSummary | null> {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("username, first_name, last_name, birth_date, avatar, visible_bio_metrics, visible_recap_metrics, display_name_pref, steps_goal, kcal_goal")
      .eq("id", auth.user.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;

    return {
      username: (data.username as string) ?? "",
      firstName: (data.first_name as string) ?? "",
      lastName: (data.last_name as string) ?? "",
      birthDate: (data.birth_date as string) ?? null,
      avatar: (data.avatar as string) ?? "logo",
      visibleBioMetrics: (data.visible_bio_metrics as string[]) ?? DEFAULT_VISIBLE_BIO,
      visibleIndicators: (data.visible_recap_metrics as string[]) ?? DEFAULT_VISIBLE_INDICATORS,
      displayNamePref: (data.display_name_pref as string) ?? "prenom",
      stepsGoal: Number(data.steps_goal ?? 10000),
      kcalGoal: Number(data.kcal_goal ?? 2800),
    };
  }

  async updateGoals(goals: DailyGoalsUpdate): Promise<void> {
    const userId = await currentUserId();
    const { error } = await supabase
      .from("profiles")
      .update({ steps_goal: goals.stepsGoal, kcal_goal: goals.kcalGoal })
      .eq("id", userId);
    if (error) throw new Error(traduireErreur(error.message));
  }

  /** Agrège l'historique d'entraînement pour la carte Discipline. */
  async getTrainingHistory(): Promise<TrainingHistory> {
    const { data: sessions, error } = await supabase
      .from("workout_sessions")
      .select("id, completed_at")
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: true });
    if (error) throw new Error(error.message);

    const rows = sessions ?? [];
    const dates = rows.map((s) => new Date(s.completed_at as string));

    let totalTonnageKg = 0;
    let personalRecordBeaten = false;

    if (rows.length > 0) {
      const { data: exercises } = await supabase
        .from("session_exercises")
        .select("id, session_id")
        .in("session_id", rows.map((s) => s.id as string));

      const ids = (exercises ?? []).map((e) => e.id as string);
      if (ids.length > 0) {
        const { data: sets } = await supabase
          .from("session_sets")
          .select("weight_kg, reps, completed_at, status")
          .eq("status", "completed")
          .in("session_exercise_id", ids)
          .order("completed_at", { ascending: true });

        let heaviestBefore = 0;
        let heaviestLast = 0;
        const lastSessionDate = dates[dates.length - 1];
        for (const s of sets ?? []) {
          const w = Number(s.weight_kg ?? 0);
          const reps = Number(s.reps ?? 0);
          totalTonnageKg += w * reps;
          const at = s.completed_at ? new Date(s.completed_at as string) : null;
          const isLastSession =
            at && lastSessionDate && at.toDateString() === lastSessionDate.toDateString();
          if (isLastSession) heaviestLast = Math.max(heaviestLast, w);
          else heaviestBefore = Math.max(heaviestBefore, w);
        }
        // Record battu : la dernière séance dépasse le meilleur historique.
        personalRecordBeaten = heaviestLast > 0 && heaviestLast > heaviestBefore;
      }
    }

    return {
      sessionsCompleted: rows.length,
      streakWeeks: computeStreakWeeks(dates),
      totalTonnageKg: Math.round(totalTonnageKg),
      personalRecordBeaten,
    };
  }

  async getLatestMetrics(): Promise<BodyMetrics> {
    const { data, error } = await supabase
      .from("biometric_snapshots")
      .select("height_cm, weight_kg, waist_cm, hip_cm, neck_cm, arm_cm, resting_hr, body_fat_pct, muscle_mass_kg, bp_sys, bp_dia, hydration_l")
      .order("measured_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return emptyBodyMetrics();

    return {
      heightCm: num(data.height_cm),
      weightKg: num(data.weight_kg),
      waistCm: num(data.waist_cm),
      hipCm: num(data.hip_cm),
      neckCm: num(data.neck_cm),
      armCm: num(data.arm_cm),
      restingHr: num(data.resting_hr),
      bodyFatPct: num(data.body_fat_pct),
      muscleMassKg: num(data.muscle_mass_kg),
      bpSys: num(data.bp_sys),
      bpDia: num(data.bp_dia),
      hydrationL: num(data.hydration_l),
    };
  }

  async saveMetrics(metrics: BodyMetrics, id?: string): Promise<void> {
    const userId = await currentUserId();

    // Chaque enregistrement crée un nouveau relevé : l'historique est conservé.
    // `id` fourni = clé d'idempotence : un rejeu écrase le relevé au lieu d'en créer un second.
    const { error } = await supabase.from("biometric_snapshots").upsert({
      ...(id ? { id } : {}),
      user_id: userId,
      measured_at: new Date().toISOString(),
      height_cm: metrics.heightCm,
      weight_kg: metrics.weightKg,
      waist_cm: metrics.waistCm,
      hip_cm: metrics.hipCm,
      neck_cm: metrics.neckCm,
      arm_cm: metrics.armCm,
      resting_hr: metrics.restingHr,
      body_fat_pct: metrics.bodyFatPct,
      muscle_mass_kg: metrics.muscleMassKg,
      bp_sys: metrics.bpSys,
      bp_dia: metrics.bpDia,
      hydration_l: metrics.hydrationL,
    });
    if (error) throw new Error(traduireErreur(error.message));
  }

  async updateAccount(update: AccountUpdate): Promise<void> {
    const userId = await currentUserId();
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: update.firstName,
        last_name: update.lastName,
        username: update.username,
        display_name_pref: update.displayNamePref,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
    if (error) throw new Error(traduireErreur(error.message));
  }

  async updateAvatar(avatar: string): Promise<void> {
    const userId = await currentUserId();
    const { error } = await supabase.from("profiles").update({ avatar }).eq("id", userId);
    if (error) throw new Error(traduireErreur(error.message));
  }

  async updateVisibleBioMetrics(ids: string[]): Promise<void> {
    const userId = await currentUserId();
    const { error } = await supabase
      .from("profiles")
      .update({ visible_bio_metrics: ids })
      .eq("id", userId);
    if (error) throw new Error(traduireErreur(error.message));
  }

  async updateVisibleIndicators(ids: string[]): Promise<void> {
    const userId = await currentUserId();
    const { error } = await supabase
      .from("profiles")
      .update({ visible_recap_metrics: ids })
      .eq("id", userId);
    if (error) throw new Error(traduireErreur(error.message));
  }
}
