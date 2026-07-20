import type { UsernameAvailabilityPort } from "@domain/onboarding/ports/UsernameAvailabilityPort";
import { supabase } from "@infrastructure/supabase/client";

/**
 * Adapter concret : branche le port domaine sur le RPC Postgres
 * `is_username_available(p_username text) returns boolean`
 * (STABLE SECURITY DEFINER, exécutable par anon + authenticated).
 * La logique de validité (longueur 3..30) et d'unicité citext vit en base :
 * une seule source de vérité, insensible à la casse.
 */
export class SupabaseUsernameAvailability implements UsernameAvailabilityPort {
  async isAvailable(username: string, signal?: AbortSignal): Promise<boolean> {
    let query = supabase.rpc("is_username_available", { p_username: username });
    if (signal) query = query.abortSignal(signal);

    const { data, error } = await query;
    if (error) throw error;
    return data === true;
  }
}
