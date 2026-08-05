import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

/**
 * Retour haptique — adaptateur d'infrastructure.
 *
 * Trois garde-fous, parce qu'un retour tactile ne doit JAMAIS pouvoir casser
 * une validation de série :
 *  1. `void` + `.catch()` : jamais attendu, jamais propagé à l'appelant ;
 *  2. `try/catch` synchrone : sur navigateur non compatible, le plugin peut
 *     lever avant même de retourner une promesse ;
 *  3. respect de `prefers-reduced-motion` : les utilisateurs sensibles au
 *     mouvement désactivent aussi les vibrations sur iOS/Android.
 *
 * Sur navigateur desktop l'implémentation web retombe sur `navigator.vibrate`,
 * absent hors mobile : l'appel devient un no-op silencieux, ce qui est le
 * comportement voulu.
 */
function reducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function safe(run: () => Promise<unknown>): void {
  if (reducedMotion()) return;
  try {
    void run().catch(() => {
      /* plateforme sans haptique : on ignore */
    });
  } catch {
    /* plugin indisponible : on ignore */
  }
}

export const haptics = {
  /** Validation d'une série — impulsion brève, non intrusive en pleine série. */
  setValidated(): void {
    safe(() => Haptics.impact({ style: ImpactStyle.Light }));
  },
  /** Série marquée en échec — plus sourd, distinct de la validation. */
  setFailed(): void {
    safe(() => Haptics.impact({ style: ImpactStyle.Medium }));
  },
  /**
   * Fin du temps de repos — motif de notification, perceptible téléphone
   * posé sur un banc, contrairement à un simple impact.
   */
  restFinished(): void {
    safe(() => Haptics.notification({ type: NotificationType.Success }));
  },
};
