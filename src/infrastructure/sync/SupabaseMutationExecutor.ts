import type { MutationExecutor } from "@domain/sync/ports/MutationExecutor";
import type { PendingMutation } from "@domain/sync/entities/PendingMutation";
import type { CompletedSession } from "@domain/workout/ports/SessionRepository";
import type { NutritionEntry } from "@domain/home/entities/DailySummary";
import type { BodyMetrics } from "@domain/profile/entities/BodyMetrics";
import { SupabaseSessionRepository } from "@infrastructure/supabase/adapters/SupabaseSessionRepository";
import { SupabaseDailyLogRepository } from "@infrastructure/supabase/adapters/SupabaseDailyLogRepository";
import { SupabaseProfileReadRepository } from "@infrastructure/supabase/adapters/SupabaseProfileReadRepository";

/** Payloads transportés dans la file (sérialisables en JSON). */
export type SessionPayload = Omit<CompletedSession, "id">;
export type NutritionPayload = { entry: NutritionEntry; date: string };
export type StepsPayload = { steps: number; date: string };
export type BiometricsPayload = { metrics: BodyMetrics };

/**
 * Traduit une mutation différée en appel Supabase.
 * Chaque branche est idempotente : rejouer produit le même état final.
 */
export class SupabaseMutationExecutor implements MutationExecutor {
  private readonly sessions = new SupabaseSessionRepository();
  private readonly dailyLog = new SupabaseDailyLogRepository();
  private readonly profiles = new SupabaseProfileReadRepository();

  async execute(mutation: PendingMutation): Promise<void> {
    switch (mutation.kind) {
      case "session.complete": {
        // L'id de la mutation devient l'id de la séance : pas de doublon possible.
        const payload = mutation.payload as SessionPayload;
        await this.sessions.saveCompleted({ ...payload, id: mutation.id });
        return;
      }
      case "nutrition.save": {
        // Upsert sur (user_id, entry_date) : naturellement idempotent.
        const { entry, date } = mutation.payload as NutritionPayload;
        await this.dailyLog.saveNutrition(entry, date);
        return;
      }
      case "steps.save": {
        const { steps, date } = mutation.payload as StepsPayload;
        await this.dailyLog.saveSteps(steps, date);
        return;
      }
      case "biometrics.save": {
        const { metrics } = mutation.payload as BiometricsPayload;
        await this.profiles.saveMetrics(metrics, mutation.id);
        return;
      }
      default: {
        // Type inconnu (ancienne version de l'app) : on ne bloque pas la file.
        throw new Error(`Type de mutation inconnu : ${String(mutation.kind)}`);
      }
    }
  }
}
