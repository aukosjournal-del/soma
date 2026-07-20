import type { PendingMutation } from "../entities/PendingMutation";

/**
 * Exécute une mutation différée. L'implémentation DOIT être idempotente :
 * une même mutation peut être rejouée plusieurs fois (coupure réseau au
 * moment de la réponse, relance de l'app, etc.).
 */
export interface MutationExecutor {
  execute(mutation: PendingMutation): Promise<void>;
}
