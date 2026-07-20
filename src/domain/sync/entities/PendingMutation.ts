/** Écritures différables : tout ce que l'utilisateur peut produire hors-ligne. */
export type MutationKind =
  | "session.complete"
  | "nutrition.save"
  | "steps.save"
  | "biometrics.save";

export interface PendingMutation<T = unknown> {
  /**
   * Clé d'idempotence générée côté client. Elle sert aussi de clé primaire
   * de la ligne créée en base : un rejeu ne peut donc pas produire de doublon.
   */
  id: string;
  kind: MutationKind;
  payload: T;
  createdAt: string;
  attempts: number;
  lastError?: string;
}

/** Au-delà, on cesse de réessayer automatiquement et on alerte l'utilisateur. */
export const MAX_ATTEMPTS = 6;

/**
 * Backoff exponentiel plafonné : 2s, 4s, 8s, 16s, 32s, puis 60s.
 * Évite de marteler le serveur pendant une coupure prolongée.
 */
export function backoffMs(attempts: number): number {
  return Math.min(2000 * 2 ** Math.max(0, attempts - 1), 60_000);
}

export function isExhausted(mutation: PendingMutation): boolean {
  return mutation.attempts >= MAX_ATTEMPTS;
}

/** Identifiant unique, avec repli si crypto.randomUUID est indisponible. */
export function newMutationId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  // Repli RFC-4122 v4 suffisant pour une clé d'idempotence locale.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function createMutation<T>(kind: MutationKind, payload: T): PendingMutation<T> {
  return {
    id: newMutationId(),
    kind,
    payload,
    createdAt: new Date().toISOString(),
    attempts: 0,
  };
}

/**
 * Ajoute une mutation à la file. Les saisies journalières (pas, nutrition)
 * écrasent la précédente encore en attente : seule la dernière valeur compte,
 * ce qui évite d'empiler des écritures devenues obsolètes.
 */
export function enqueue(queue: PendingMutation[], mutation: PendingMutation): PendingMutation[] {
  const collapsible: MutationKind[] = ["nutrition.save", "steps.save"];
  const base = collapsible.includes(mutation.kind)
    ? queue.filter((m) => m.kind !== mutation.kind)
    : queue;
  return [...base, mutation];
}

export function markAttempt(
  queue: PendingMutation[],
  id: string,
  error: string,
): PendingMutation[] {
  return queue.map((m) => (m.id === id ? { ...m, attempts: m.attempts + 1, lastError: error } : m));
}

export function remove(queue: PendingMutation[], id: string): PendingMutation[] {
  return queue.filter((m) => m.id !== id);
}

/** Première mutation encore rejouable (la file est traitée dans l'ordre). */
export function nextPending(queue: PendingMutation[]): PendingMutation | null {
  return queue.find((m) => !isExhausted(m)) ?? null;
}
