import { backoffMs, nextPending } from "@domain/sync/entities/PendingMutation";
import type { MutationExecutor } from "@domain/sync/ports/MutationExecutor";
import { syncQueueStore } from "@presentation/hooks/syncQueueStore";
import { SupabaseMutationExecutor } from "./SupabaseMutationExecutor";

let running = false;
let timer: ReturnType<typeof setTimeout> | null = null;
let started = false;

/**
 * Rejoue la file d'attente, dans l'ordre, une mutation à la fois.
 *
 * L'ordre est préservé : en cas d'échec on s'arrête et on reprogramme, plutôt
 * que de sauter l'élément bloquant. Cela garantit qu'une séance terminée est
 * écrite avant les saisies qui la suivent.
 */
export async function flushQueue(executor: MutationExecutor = new SupabaseMutationExecutor()): Promise<void> {
  if (running) return;
  if (typeof navigator !== "undefined" && navigator.onLine === false) return;

  running = true;
  try {
    for (;;) {
      const mutation = nextPending(syncQueueStore.getSnapshot());
      if (!mutation) return;

      try {
        await executor.execute(mutation);
        syncQueueStore.succeed(mutation.id);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Échec de synchronisation.";
        syncQueueStore.fail(mutation.id, message);
        schedule(backoffMs(mutation.attempts + 1), executor);
        return;
      }
    }
  } finally {
    running = false;
  }
}

function schedule(delay: number, executor: MutationExecutor) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => void flushQueue(executor), delay);
}

/**
 * Démarre la synchronisation : tentative immédiate, reprise au retour du
 * réseau et au retour de l'app au premier plan (utile en contexte natif).
 */
export function startSync(executor: MutationExecutor = new SupabaseMutationExecutor()): void {
  if (started || typeof window === "undefined") return;
  started = true;

  const attempt = () => void flushQueue(executor);

  window.addEventListener("online", attempt);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") attempt();
  });

  attempt();
}
