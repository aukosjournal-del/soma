import { useEffect, useMemo, useState } from "react";
import { LoginStep } from "./LoginStep";
import { ForgotPasswordStep } from "./ForgotPasswordStep";
import { SignupFlow } from "@presentation/screens/onboarding/SignupFlow";
import { AppRoot } from "@presentation/screens/AppRoot";
import { SupabaseAuthGateway } from "@infrastructure/supabase/adapters/SupabaseAuthGateway";
import { rememberMe } from "@infrastructure/auth/rememberMe";

type View = "login" | "signup" | "forgot" | "authed";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Racine d'authentification : bascule connexion / inscription / mot de passe
 * oublié (état `authView` du prototype) et branche l'auth réelle Supabase.
 */
export function AuthRoot() {
  const auth = useMemo(() => new SupabaseAuthGateway(), []);
  const [view, setView] = useState<View>("login");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [forgotSent, setForgotSent] = useState(false);
  const [checking, setChecking] = useState(true);

  // Session déjà active : on entre directement, mais seulement si l'utilisateur
  // a coché « se souvenir de moi » (ou s'il s'agit du même onglet).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const active = await auth.hasSession();
        if (cancelled) return;
        if (!active) return;
        if (rememberMe.shouldRestoreSession()) {
          setView("authed");
          return;
        }
        // Session persistée non désirée : on la ferme avant d'afficher le login.
        await auth.signOut();
      } catch {
        /* pas de session exploitable : on reste sur la connexion */
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [auth]);

  const goto = (v: View) => {
    setError(undefined);
    setForgotSent(false);
    setView(v);
  };

  const handleLogin = async (identifier: string, password: string, remember: boolean) => {
    setError(undefined);
    setSubmitting(true);
    try {
      // Email ou @pseudo : le prototype accepte les deux.
      if (EMAIL_RE.test(identifier)) await auth.signInWithEmail(identifier, password);
      else await auth.signInWithUsername(identifier, password);
      rememberMe.set(remember);
      setView("authed");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connexion impossible.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgot = (identifier: string) => {
    // Anti-énumération : on affiche toujours le même message. L'envoi réel
    // n'a lieu que si l'identifiant est un email (Supabase l'exige).
    if (EMAIL_RE.test(identifier)) {
      auth.sendPasswordReset(identifier).catch((e) => console.error("[reset]", e));
    }
    setForgotSent(true);
  };

  // Évite un flash de l'écran de connexion pendant la vérification de session.
  if (checking) return null;

  if (view === "signup") {
    return (
      <SignupFlow
        onBackToLogin={() => goto("login")}
        onCompleted={() => {
          // Nouvelle inscription : on marque l'onglet pour qu'un rechargement
          // ne renvoie pas sur la connexion, sans mémoriser pour autant.
          rememberMe.set(false);
          setView("authed");
        }}
      />
    );
  }

  if (view === "forgot") {
    return (
      <ForgotPasswordStep onBack={() => goto("login")} onSubmit={handleForgot} sent={forgotSent} />
    );
  }

  if (view === "authed") {
    // Sprint 3 : Séance + Planning avec navigation basse.
    return <AppRoot />;
  }

  return (
    <LoginStep
      onSubmit={handleLogin}
      submitting={submitting}
      errorMessage={error}
      onForgot={() => goto("forgot")}
      onCreateAccount={() => goto("signup")}
    />
  );
}
