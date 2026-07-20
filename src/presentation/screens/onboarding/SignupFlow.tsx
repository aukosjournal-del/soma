import { useMemo, useState } from "react";
import { AccountStep } from "./AccountStep";
import { UsernameStep } from "./UsernameStep";
import { PhysicalProfileStep } from "./PhysicalProfileStep";
import { ExperienceStep, type FinalizeStatus } from "./ExperienceStep";
import {
  type PhysicalProfileInput,
  emptyPhysicalProfile,
} from "@domain/onboarding/value-objects/PhysicalProfile";
import type { ExperienceLevel } from "@domain/onboarding/value-objects/ExperienceLevel";
import type { OAuthProvider } from "@domain/onboarding/ports/AuthGateway";
import { FinalizeSignup } from "@domain/onboarding/use-cases/FinalizeSignup";
import { SupabaseAuthGateway } from "@infrastructure/supabase/adapters/SupabaseAuthGateway";
import { SupabaseProfileRepository } from "@infrastructure/supabase/adapters/SupabaseProfileRepository";

type Step = "account" | "username" | "physical" | "experience" | "done";

interface Identity {
  firstName: string;
  lastName: string;
  username: string;
}

/**
 * Orchestrateur du parcours d'inscription complet :
 * compte (email/mdp) → pseudo (Étape 1/3) → profil physique (2/3) →
 * niveau + finalisation réelle (3/3). Conserve les données entre écrans,
 * comme la machine à état unique du prototype.
 */
export function SignupFlow({
  onBackToLogin,
  onCompleted,
}: {
  onBackToLogin?: () => void;
  /** Inscription finalisée : on entre dans l'application. */
  onCompleted?: () => void;
}) {
  const authGateway = useMemo(() => new SupabaseAuthGateway(), []);
  const finalizeSignup = useMemo(
    () => new FinalizeSignup(authGateway, new SupabaseProfileRepository()),
    [authGateway],
  );

  const [step, setStep] = useState<Step>("account");
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [identity, setIdentity] = useState<Identity>({ firstName: "", lastName: "", username: "" });
  const [physical, setPhysical] = useState<PhysicalProfileInput>(emptyPhysicalProfile());
  const [level, setLevel] = useState<ExperienceLevel | null>(null);
  const [status, setStatus] = useState<FinalizeStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>();

  const handleOAuth = (provider: OAuthProvider) => {
    authGateway.signInWithOAuth(provider).catch((e) => {
      console.error("[oauth]", e);
    });
  };

  const handleFinalize = async () => {
    if (!level) return;
    setStatus("submitting");
    setErrorMessage(undefined);
    const result = await finalizeSignup.execute({
      email: credentials.email,
      password: credentials.password,
      firstName: identity.firstName,
      lastName: identity.lastName,
      username: identity.username,
      physical,
      experienceLevel: level,
    });
    // Profil créé : on entre directement dans l'application (Accueil).
    if (result.status === "completed") onCompleted?.();
    else if (result.status === "confirm_email") setStatus("confirm_email");
    else {
      setStatus("error");
      setErrorMessage(result.message);
    }
  };

  if (step === "account") {
    return (
      <AccountStep
        initialEmail={credentials.email}
        initialPassword={credentials.password}
        onOAuth={handleOAuth}
        onHaveAccount={onBackToLogin}
        onContinue={(data) => {
          setCredentials(data);
          setStep("username");
        }}
      />
    );
  }

  if (step === "username") {
    return (
      <UsernameStep
        onHaveAccount={onBackToLogin}
        onContinue={(data) => {
          setIdentity(data);
          setStep("physical");
        }}
      />
    );
  }

  if (step === "physical") {
    return (
      <PhysicalProfileStep
        initial={physical}
        onContinue={(data) => {
          setPhysical(data);
          setStep("experience");
        }}
        onSkip={() => setStep("experience")}
      />
    );
  }

  if (step === "experience") {
    return (
      <ExperienceStep
        selected={level}
        onSelect={setLevel}
        onFinalize={handleFinalize}
        status={status}
        errorMessage={errorMessage}
      />
    );
  }

  // La finalisation appelle onCompleted : le parent bascule sur l'application.
  // Cet écran ne devrait donc jamais rester affiché.
  return null;
}
