export interface SignUpResult {
  userId: string;
  /** true si une session est active immédiatement (confirmations email désactivées). */
  hasSession: boolean;
}

export type OAuthProvider = "apple" | "google";

/**
 * Port d'authentification. Le domaine ignore Supabase : il ne connaît que ce contrat.
 */
export interface AuthGateway {
  signUpWithEmail(email: string, password: string): Promise<SignUpResult>;
  signInWithEmail(email: string, password: string): Promise<void>;
  /** Connexion par @pseudo (résolution serveur, email jamais exposé). */
  signInWithUsername(username: string, password: string): Promise<void>;
  signInWithOAuth(provider: OAuthProvider): Promise<void>;
  /** Envoie un email de réinitialisation de mot de passe. */
  sendPasswordReset(email: string): Promise<void>;
  /** Définit un nouveau mot de passe (session de récupération active). */
  updatePassword(newPassword: string): Promise<void>;
  /** true si une session est active (ex. lien de récupération consommé). */
  hasSession(): Promise<boolean>;
  signOut(): Promise<void>;
}
