/**
 * « Se souvenir de moi ».
 *
 * La session Supabase est persistée dans le localStorage : sans garde-fou,
 * on resterait connecté indéfiniment, coché ou non. Deux marqueurs suffisent
 * à distinguer les trois situations :
 *
 *  - `soma_remember` (localStorage)  : l'utilisateur a demandé à rester connecté ;
 *  - `soma_session`  (sessionStorage): l'onglet courant a déjà servi à se connecter.
 *
 * Au démarrage : sans « se souvenir » et sans marqueur d'onglet, on ferme la
 * session. Un simple rechargement d'onglet ne déconnecte donc pas — seule une
 * vraie réouverture le fait.
 */

const REMEMBER_KEY = "soma_remember";
const SESSION_KEY = "soma_session";

function safeGet(store: Storage | undefined, key: string): string | null {
  try {
    return store?.getItem(key) ?? null;
  } catch {
    // Mode privé ou stockage refusé : on se comporte comme « non mémorisé ».
    return null;
  }
}

function safeSet(store: Storage | undefined, key: string, value: string | null) {
  try {
    if (value === null) store?.removeItem(key);
    else store?.setItem(key, value);
  } catch {
    /* stockage indisponible : rien à faire */
  }
}

export const rememberMe = {
  /** Enregistre le choix fait sur l'écran de connexion. */
  set(remember: boolean) {
    safeSet(localStorage, REMEMBER_KEY, remember ? "1" : null);
    safeSet(sessionStorage, SESSION_KEY, "1");
  },
  isRemembered(): boolean {
    return safeGet(localStorage, REMEMBER_KEY) === "1";
  },
  /** Vrai si la connexion a eu lieu dans cet onglet (rechargement inclus). */
  isSameBrowsingSession(): boolean {
    return safeGet(sessionStorage, SESSION_KEY) === "1";
  },
  /**
   * Une session persistée ne doit être reprise que si l'utilisateur l'a
   * demandé, ou s'il s'agit du même onglet qu'à la connexion.
   */
  shouldRestoreSession(): boolean {
    return this.isRemembered() || this.isSameBrowsingSession();
  },
  clear() {
    safeSet(localStorage, REMEMBER_KEY, null);
    safeSet(sessionStorage, SESSION_KEY, null);
  },
};
