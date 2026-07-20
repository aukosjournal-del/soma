import { useSyncExternalStore } from "react";
import {
  type MutationKind,
  type PendingMutation,
  createMutation,
  enqueue,
  isExhausted,
  markAttempt,
  remove,
} from "@domain/sync/entities/PendingMutation";

const STORAGE_KEY = "soma_sync_queue";

function load(): PendingMutation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PendingMutation[]) : [];
  } catch {
    return [];
  }
}

let queue: PendingMutation[] = load();
const listeners = new Set<() => void>();

function set(next: PendingMutation[]) {
  queue = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* quota / mode privé : la file reste en mémoire pour la session */
  }
  listeners.forEach((l) => l());
}

/**
 * File d'attente des écritures, persistée hors de React.
 * Survit à la fermeture de l'app : rien n'est perdu en cas de coupure réseau.
 */
export const syncQueueStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): PendingMutation[] {
    return queue;
  },
  /** Empile une écriture et retourne son identifiant d'idempotence. */
  push<T>(kind: MutationKind, payload: T): string {
    const mutation = createMutation(kind, payload);
    set(enqueue(queue, mutation));
    return mutation.id;
  },
  succeed(id: string) {
    set(remove(queue, id));
  },
  fail(id: string, error: string) {
    set(markAttempt(queue, id, error));
  },
  /** Relance manuelle : remet à zéro les compteurs des mutations épuisées. */
  retryExhausted() {
    set(queue.map((m) => (isExhausted(m) ? { ...m, attempts: 0, lastError: undefined } : m)));
  },
  /** Abandon explicite d'une écriture définitivement en échec. */
  discard(id: string) {
    set(remove(queue, id));
  },
};

export function useSyncQueue(): PendingMutation[] {
  return useSyncExternalStore(syncQueueStore.subscribe, syncQueueStore.getSnapshot);
}
