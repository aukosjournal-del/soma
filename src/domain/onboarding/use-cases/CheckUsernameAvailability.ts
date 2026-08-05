import { Username, type UsernameError } from "@domain/onboarding/value-objects/Username";
import type { UsernameAvailabilityPort } from "@domain/onboarding/ports/UsernameAvailabilityPort";

export type UsernameCheck =
  | { status: "idle" }
  | { status: "invalid"; reason: UsernameError }
  | { status: "checking" }
  | { status: "available" }
  | { status: "taken" }
  | { status: "error" };

/**
 * Use-case : valide le pseudo (règles domaine) puis interroge le port de
 * disponibilité. La validation locale évite tout appel réseau inutile
 * (ex. < 3 caractères), exactement comme le prototype.
 */
export class CheckUsernameAvailability {
  constructor(private readonly port: UsernameAvailabilityPort) {}

  async execute(raw: string, signal?: AbortSignal): Promise<UsernameCheck> {
    const validation = Username.validate(raw);
    if (!validation.ok) {
      return validation.error === "empty"
        ? { status: "idle" }
        : { status: "invalid", reason: validation.error };
    }
    try {
      const free = await this.port.isAvailable(validation.value.value, signal);
      return free ? { status: "available" } : { status: "taken" };
    } catch {
      if (signal?.aborted) return { status: "checking" };
      return { status: "error" };
    }
  }
}
