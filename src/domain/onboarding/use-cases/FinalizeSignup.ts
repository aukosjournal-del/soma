import type { AuthGateway } from "@domain/onboarding/ports/AuthGateway";
import type { ProfileRepository } from "@domain/onboarding/ports/ProfileRepository";
import type { ExperienceLevel } from "@domain/onboarding/value-objects/ExperienceLevel";
import {
  type PhysicalProfileInput,
  birthDateISO,
} from "@domain/onboarding/value-objects/PhysicalProfile";
import { Username } from "@domain/onboarding/value-objects/Username";

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
  physical: PhysicalProfileInput;
  experienceLevel: ExperienceLevel;
}

export type FinalizeResult =
  | { status: "completed" }
  | { status: "confirm_email" } // compte créé, en attente de confirmation email
  | { status: "error"; message: string };

/**
 * Use-case de finalisation : crée le compte (auth), puis le profil (@pseudo),
 * ce qui ouvre l'onboarding via trigger, puis le clôture. Toute la mécanique
 * technique est déléguée aux ports — le domaine reste pur.
 */
export class FinalizeSignup {
  constructor(
    private readonly auth: AuthGateway,
    private readonly profiles: ProfileRepository,
  ) {}

  async execute(data: SignupData): Promise<FinalizeResult> {
    const username = Username.validate(data.username);
    if (!username.ok) return { status: "error", message: "Nom d'utilisateur invalide." };

    try {
      const { userId, hasSession } = await this.auth.signUpWithEmail(
        data.email.trim(),
        data.password,
      );

      // Confirmations email activées : pas de session -> on ne peut pas encore
      // écrire le profil (RLS). On demande la confirmation.
      if (!hasSession) return { status: "confirm_email" };

      const birthDate = birthDateISO(data.physical);
      await this.profiles.create({
        id: userId,
        username: username.value.value,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        birthDate,
        experienceLevel: data.experienceLevel,
      });

      const physicalProvided =
        birthDate !== null || data.physical.heightCm !== "" || data.physical.weightKg !== "";
      await this.profiles.completeOnboarding(userId, physicalProvided);

      return { status: "completed" };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Une erreur est survenue.";
      return { status: "error", message };
    }
  }
}
