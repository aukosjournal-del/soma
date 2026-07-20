import type { AuthGateway, OAuthProvider, SignUpResult } from "@domain/onboarding/ports/AuthGateway";
import { supabase } from "@infrastructure/supabase/client";

export class SupabaseAuthGateway implements AuthGateway {
  async signUpWithEmail(email: string, password: string): Promise<SignUpResult> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(traduireErreur(error.message));
    if (!data.user) throw new Error("Création du compte impossible.");
    return { userId: data.user.id, hasSession: data.session !== null };
  }

  async signInWithEmail(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(traduireErreur(error.message));
  }

  async sendPasswordReset(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset`,
    });
    if (error) throw new Error(traduireErreur(error.message));
  }

  /**
   * Délègue à l'Edge Function `login-with-username` : elle résout le pseudo
   * côté serveur (service role) et vérifie le mot de passe. L'email de
   * l'utilisateur n'est jamais renvoyé au client.
   */
  async signInWithUsername(username: string, password: string): Promise<void> {
    const { data, error } = await supabase.functions.invoke<{
      access_token: string;
      refresh_token: string;
    }>("login-with-username", { body: { username, password } });

    if (error || !data?.access_token) throw new Error("Identifiants incorrects.");

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });
    if (sessionError) throw new Error(traduireErreur(sessionError.message));
  }

  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(traduireErreur(error.message));
  }

  /** Email du compte connecté (affiché en lecture seule dans le profil). */
  async currentEmail(): Promise<string> {
    const { data } = await supabase.auth.getUser();
    return data.user?.email ?? "";
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(traduireErreur(error.message));
  }

  async hasSession(): Promise<boolean> {
    const { data } = await supabase.auth.getSession();
    return data.session !== null;
  }

  async signInWithOAuth(provider: OAuthProvider): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) throw new Error(traduireErreur(error.message));
  }
}

/** Messages Supabase (EN) -> FR, pour rester cohérent avec l'UI. */
function traduireErreur(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Un compte existe déjà avec cet email.";
  if (m.includes("password") && m.includes("at least"))
    return "Mot de passe trop court (6 caractères minimum).";
  if (m.includes("provider is not enabled"))
    return "Connexion externe non activée pour le moment.";
  if (m.includes("invalid login credentials"))
    return "Email ou mot de passe incorrect.";
  if (m.includes("email not confirmed"))
    return "Confirme ton email avant de te connecter.";
  return msg;
}
