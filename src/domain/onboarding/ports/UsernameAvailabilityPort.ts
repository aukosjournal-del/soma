/**
 * Port (interface DDD) : abstraction de la vérification de disponibilité.
 * L'implémentation concrète vit dans /infrastructure (adapter Supabase).
 * Le domaine ne connaît PAS Supabase.
 */
export interface UsernameAvailabilityPort {
  /** true si le pseudo est libre ET valide côté serveur (RPC is_username_available). */
  isAvailable(username: string, signal?: AbortSignal): Promise<boolean>;
}
