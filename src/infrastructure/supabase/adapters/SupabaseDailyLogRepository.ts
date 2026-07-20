import type { DailyLogRepository } from "@domain/home/ports/DailyLogRepository";
import {
  type DailySummary,
  type NutritionEntry,
  emptyNutrition,
} from "@domain/home/entities/DailySummary";
import { supabase } from "@infrastructure/supabase/client";

/** Date locale au format 'YYYY-MM-DD' (sans décalage UTC). */
function todayISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Session expirée. Reconnecte-toi.");
  return data.user.id;
}

export class SupabaseDailyLogRepository implements DailyLogRepository {
  async getToday(): Promise<DailySummary> {
    const date = todayISO();

    const [stepsRes, nutritionRes, profileRes] = await Promise.all([
      supabase.from("step_entries").select("steps").eq("entry_date", date).maybeSingle(),
      supabase
        .from("nutrition_entries")
        .select("kcal, protein_g, carbs_g, fat_g, salt_g")
        .eq("entry_date", date)
        .maybeSingle(),
      supabase.from("profiles").select("steps_goal, kcal_goal").maybeSingle(),
    ]);
    if (stepsRes.error) throw new Error(stepsRes.error.message);
    if (nutritionRes.error) throw new Error(nutritionRes.error.message);
    if (profileRes.error) throw new Error(profileRes.error.message);

    const n = nutritionRes.data;
    const nutrition: NutritionEntry = n
      ? {
          kcal: Number(n.kcal ?? 0),
          proteinG: Number(n.protein_g ?? 0),
          carbsG: Number(n.carbs_g ?? 0),
          fatG: Number(n.fat_g ?? 0),
          saltG: Number(n.salt_g ?? 0),
        }
      : emptyNutrition();

    return {
      steps: Number(stepsRes.data?.steps ?? 0),
      nutrition,
      goals: {
        stepsGoal: Number(profileRes.data?.steps_goal ?? 10000),
        kcalGoal: Number(profileRes.data?.kcal_goal ?? 2800),
      },
    };
  }

  async saveNutrition(entry: NutritionEntry, date: string = todayISO()): Promise<void> {
    const userId = await currentUserId();
    const { error } = await supabase.from("nutrition_entries").upsert(
      {
        user_id: userId,
        entry_date: date,
        kcal: Math.round(entry.kcal),
        protein_g: entry.proteinG,
        carbs_g: entry.carbsG,
        fat_g: entry.fatG,
        salt_g: entry.saltG,
      },
      { onConflict: "user_id,entry_date" },
    );
    if (error) throw new Error(error.message);
  }

  async saveSteps(steps: number, date: string = todayISO()): Promise<void> {
    const userId = await currentUserId();
    const { error } = await supabase.from("step_entries").upsert(
      { user_id: userId, entry_date: date, steps: Math.round(steps) },
      { onConflict: "user_id,entry_date" },
    );
    if (error) throw new Error(error.message);
  }
}
