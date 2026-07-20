import { useState, type CSSProperties } from "react";
import { AuthShell } from "@presentation/components/AuthShell";
import { BrandHeader } from "@presentation/components/BrandHeader";
import { GlassInput } from "@presentation/components/GlassInput";
import type { OAuthProvider } from "@domain/onboarding/ports/AuthGateway";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isEmailValid = (v: string) => EMAIL_RE.test(v.trim());

const oauthBtnBase: CSSProperties = {
  width: "100%",
  minHeight: "48px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  fontWeight: 700,
  fontSize: "14px",
  borderRadius: "12px",
  cursor: "pointer",
  boxSizing: "border-box",
};

export interface AccountStepProps {
  initialEmail?: string;
  initialPassword?: string;
  onContinue: (data: { email: string; password: string }) => void;
  onOAuth: (provider: OAuthProvider) => void;
  onHaveAccount?: () => void;
}

/**
 * Onboarding — entrée de compte (signupStepIs1 du prototype) : OAuth Apple/Google
 * + email/mot de passe, validation email en direct. Précède les 3 étapes.
 */
export function AccountStep({
  initialEmail = "",
  initialPassword = "",
  onContinue,
  onOAuth,
  onHaveAccount,
}: AccountStepProps) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword);

  const emailInvalid = email.length > 0 && !isEmailValid(email);
  const valid = isEmailValid(email) && password.trim().length > 0;

  return (
    <AuthShell>
      <BrandHeader />

      <h1 style={{ color: "#fff", fontSize: "20px", fontWeight: 900, margin: "0 0 4px", textAlign: "center" }}>
        SOMA. Votre carnet d'entraînement connecté.
      </h1>
      <p style={{ color: "var(--color-at-prefix)", fontSize: "13px", margin: "0 0 20px", textAlign: "center" }}>
        Zéro friction. Connecte-toi en un clic.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <button type="button" onClick={() => onOAuth("apple")} style={{ ...oauthBtnBase, background: "#fff", color: "#002B4C", border: "none" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M11.2 2.3c-.6.7-1.5 1.2-2.4 1.1-.1-.9.3-1.9.9-2.5.6-.7 1.6-1.2 2.4-1.1.1.9-.3 1.8-.9 2.5zM13.5 11.4c-.4.9-.6 1.3-1.1 2.1-.7 1.1-1.7 2.5-3 2.5-1.1 0-1.4-.7-2.9-.7s-1.9.7-2.9.7c-1.3 0-2.3-1.3-3-2.4C-1 10.7-.3 6.4 2.6 6.2c1.1-.1 1.9.6 2.9.6.9 0 1.4-.6 2.9-.6 1.2 0 2.5.7 3.3 1.8-2.9 1.7-2.4 5.6 1.8 3.4z" />
          </svg>
          <span>Continuer avec Apple</span>
        </button>
        <button type="button" onClick={() => onOAuth("google")} style={{ ...oauthBtnBase, background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)", color: "#fff" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path fill="#4285F4" d="M15.5 8.2c0-.6-.1-1.1-.2-1.6H8v3h4.2c-.2 1-.8 1.9-1.7 2.4v2h2.9c1.7-1.6 2.6-3.9 2.6-6.6z" />
            <path fill="#34A853" d="M8 16c2.2 0 4-.7 5.4-2l-2.9-2c-.6.4-1.5.7-2.5.7-1.9 0-3.6-1.3-4.1-3H.5v2.1C1.9 14 4.7 16 8 16z" />
            <path fill="#FBBC05" d="M3.9 9.7c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7V4.2H.5C.2 5.1 0 6.1 0 8s.2 2.9.5 3.8l3.4-2.1z" />
            <path fill="#EA4335" d="M8 3.2c1.2 0 2.2.4 3 1.1l2.6-2.6C12 .5 10.2 0 8 0 4.7 0 1.9 2 .5 4.2l3.4 2.1C4.4 4.5 6.1 3.2 8 3.2z" />
          </svg>
          <span>Continuer avec Google</span>
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "18px 0" }}>
        <div style={{ flex: 1, height: "1px", background: "var(--color-border)" }} />
        <span style={{ color: "var(--color-text-faint)", fontSize: "12px" }}>ou utiliser votre adresse email</span>
        <div style={{ flex: 1, height: "1px", background: "var(--color-border)" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Adresse email"
          autoComplete="email"
          style={{
            width: "100%",
            height: "48px",
            background: "var(--color-bg-elevated)",
            border: `1px solid ${emailInvalid ? "var(--color-error)" : "var(--color-border)"}`,
            borderRadius: "12px",
            padding: "0 14px",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 600,
            boxSizing: "border-box",
            transition: "border-color 0.2s ease",
          }}
        />
        {emailInvalid && (
          <p style={{ color: "var(--color-error)", fontSize: "12px", margin: 0 }}>Adresse email invalide.</p>
        )}
        <GlassInput
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          autoComplete="new-password"
        />
      </div>

      <button
        type="button"
        onClick={() => valid && onContinue({ email, password })}
        disabled={!valid}
        style={{
          width: "100%",
          minHeight: "52px",
          marginTop: "16px",
          fontWeight: 800,
          fontSize: "15px",
          borderRadius: "12px",
          background: "var(--color-accent)",
          color: "var(--color-on-accent)",
          border: "none",
          cursor: valid ? "pointer" : "not-allowed",
          boxSizing: "border-box",
          opacity: valid ? 1 : 0.5,
        }}
      >
        CONTINUER
      </button>

      <button
        type="button"
        onClick={onHaveAccount}
        style={{
          width: "100%",
          marginTop: "14px",
          background: "none",
          border: "none",
          color: "var(--color-text-muted)",
          fontSize: "13px",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        J'ai déjà un compte
      </button>
    </AuthShell>
  );
}
