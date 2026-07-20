import type { BodyMetrics } from "../entities/BodyMetrics";
import type { TrainingHistory } from "../entities/Achievements";

export interface ProfileSummary {
  username: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  avatar: string;
  visibleBioMetrics: string[];
  visibleIndicators: string[];
  displayNamePref: string;
  stepsGoal: number;
  kcalGoal: number;
}

export interface AccountUpdate {
  firstName: string;
  lastName: string;
  username: string;
  /** 'prenom' | 'nom' | 'pseudo' — nom affiché dans l'application. */
  displayNamePref: string;
}

export interface DailyGoalsUpdate {
  stepsGoal: number;
  kcalGoal: number;
}

/**
 * Lecture/écriture du profil affiché et des mesures corporelles.
 * Séparé de l'inscription (ProfileRepository) : lectures fréquentes,
 * responsabilités distinctes.
 */
export interface ProfileReadRepository {
  getSummary(): Promise<ProfileSummary | null>;
  /** Dernier relevé biométrique en date. */
  getLatestMetrics(): Promise<BodyMetrics>;
  /**
   * Enregistre un nouveau relevé (historisé, jamais écrasé).
   * `id` sert de clé d'idempotence lors d'un rejeu hors-ligne.
   */
  saveMetrics(metrics: BodyMetrics, id?: string): Promise<void>;
  updateAccount(update: AccountUpdate): Promise<void>;
  updateAvatar(avatar: string): Promise<void>;
  updateVisibleBioMetrics(ids: string[]): Promise<void>;
  updateVisibleIndicators(ids: string[]): Promise<void>;
  updateGoals(goals: DailyGoalsUpdate): Promise<void>;
  /** Historique agrégé pour la discipline et les badges. */
  getTrainingHistory(): Promise<TrainingHistory>;
}
