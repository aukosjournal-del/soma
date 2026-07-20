/**
 * Miroir applicatif de la table public.onboarding_state (Sprint 1).
 * Étapes internes 1..4 (le prototype affiche « Étape 1..3 sur 3 » pour 2..4).
 */
export type OnboardingStep = 1 | 2 | 3 | 4;

export interface OnboardingState {
  userId: string;
  currentStep: OnboardingStep;
  emailVerified: boolean;
  usernameSet: boolean;
  physicalProfileSet: boolean;
  experienceSet: boolean;
  completedAt: string | null;
}

/** Correspondance étape interne -> libellé de progression du prototype. */
export const STEP_PROGRESS: Record<Exclude<OnboardingStep, 1>, { label: string; percent: number }> = {
  2: { label: "Étape 1 sur 3", percent: 33 },
  3: { label: "Étape 2 sur 3", percent: 66 },
  4: { label: "Étape 3 sur 3", percent: 100 },
};
