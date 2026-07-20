import type { NewProfile, ProfileRepository } from "@domain/onboarding/ports/ProfileRepository";
import {
  EXPERIENCE_COEFFICIENT,
  type ExperienceLevel,
} from "@domain/onboarding/value-objects/ExperienceLevel";
import { supabase } from "@infrastructure/supabase/client";

export class SupabaseProfileRepository implements ProfileRepository {
  async create(profile: NewProfile): Promise<void> {
    const { error } = await supabase.from("profiles").insert({
      id: profile.id,
      username: profile.username,
      first_name: profile.firstName,
      last_name: profile.lastName,
      birth_date: profile.birthDate,
      experience_level: profile.experienceLevel,
    });
    if (error) throw new Error(traduireErreur(error.message));
  }

  async completeOnboarding(userId: string, physicalProvided: boolean): Promise<void> {
    // La ligne onboarding_state a été créée par le trigger seed_onboarding_state
    // au moment de l'INSERT profil ; on la clôture ici.
    const { error } = await supabase
      .from("onboarding_state")
      .update({
        current_step: 4,
        physical_profile_set: physicalProvided,
        experience_set: true,
        completed_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
    if (error) throw new Error(traduireErreur(error.message));
  }

  async getExperienceLevel(): Promise<ExperienceLevel> {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return "intermediaire";
    const { data } = await supabase
      .from("profiles")
      .select("experience_level")
      .eq("id", auth.user.id)
      .maybeSingle();
    const level = data?.experience_level as ExperienceLevel | undefined;
    return level ?? "intermediaire";
  }

  async getExperienceCoefficient(): Promise<number> {
    const level = await this.getExperienceLevel();
    return EXPERIENCE_COEFFICIENT[level] ?? 1;
  }
}

function traduireErreur(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("duplicate key") && m.includes("username"))
    return "Ce pseudo vient d'être pris. Choisis-en un autre.";
  if (m.includes("row-level security"))
    return "Session non active : confirme ton email puis réessaie.";
  return msg;
}
