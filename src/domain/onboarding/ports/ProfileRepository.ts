import type { ExperienceLevel } from "@domain/onboarding/value-objects/ExperienceLevel";
// ExperienceLevel sert aussi de niveau par défaut pour la Séance Libre.

export interface NewProfile {
  id: string; // = auth.users.id
  username: string;
  firstName: string;
  lastName: string;
  birthDate: string | null; // 'YYYY-MM-DD'
  experienceLevel: ExperienceLevel;
}

/**
 * Port de persistance du profil. La création d'un profil déclenche en base
 * le trigger `seed_onboarding_state` (ouverture de l'onboarding).
 */
export interface ProfileRepository {
  create(profile: NewProfile): Promise<void>;
  /** Clôture l'onboarding (physical/experience posés, étape finale). */
  completeOnboarding(userId: string, physicalProvided: boolean): Promise<void>;
  /** Niveau d'expérience de l'utilisateur courant. */
  getExperienceLevel(): Promise<ExperienceLevel>;
  /** Coefficient de charge de l'utilisateur courant (0.7 / 1 / 1.3). */
  getExperienceCoefficient(): Promise<number>;
}
