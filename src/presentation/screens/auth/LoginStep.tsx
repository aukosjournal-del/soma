import { useState } from "react";
import { AuthShell } from "@presentation/components/AuthShell";
import { BrandHeader } from "@presentation/components/BrandHeader";
import { GlassInput } from "@presentation/components/GlassInput";
import { rememberMe } from "@infrastructure/auth/rememberMe";

export interface LoginStepProps {
  onSubmit: (identifier: string, password: string, remember: boolean) => void;
  submitting?: boolean;
  errorMessage?: string;
  onForgot: () => void;
  onCreateAccount: () => void;
}

/**
 * Écran de connexion (isLoginView du prototype). Clone pixel-perfect.
 * Auth réelle : email + mot de passe via Supabase (délégué au parent).
 */
export function LoginStep({ onSubmit, submitting, errorMessage, onForgot, onCreateAccount }: LoginStepProps) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(rememberMe.isRemembered());

  const submit = () => {
    if (submitting) return;
    if (identifier.trim() && password.trim()) onSubmit(identifier.trim(), password, remember);
  };

  return (
    <AuthShell>
      <BrandHeader />

      <h1 style={{ color: "#fff", fontSize: "22px", fontWeight: "var(--weight-medium)", margin: "0 0 4px", textAlign: "center" }}>
        Te revoilà
      </h1>
      <p style={{ color: "var(--color-at-prefix)", fontSize: "13px", margin: "0 0 20px", textAlign: "center" }}>
        Reprends où tu t'es arrêté.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <GlassInput
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="E-mail ou pseudo"
          autoComplete="username"
          autoCapitalize="none"
        />
        <GlassInput
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          autoComplete="current-password"
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
      </div>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginTop: "14px",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          style={{
            width: "18px",
            height: "18px",
            accentColor: "var(--color-accent)",
            cursor: "pointer",
            flexShrink: 0,
            margin: 0,
          }}
        />
        <span style={{ color: "var(--color-text-secondary)", fontSize: "13px", fontWeight: "var(--weight-medium)" }}>
          Rester connecté
        </span>
      </label>

      <button
        type="button"
        onClick={submit}
        disabled={submitting}
        style={{
          width: "100%",
          minHeight: "52px",
          marginTop: "16px",
          fontWeight: "var(--weight-medium)",
          fontSize: "var(--text-body)",
          borderRadius: "12px",
          background: "var(--color-accent)",
          color: "var(--color-on-accent)",
          border: "none",
          cursor: submitting ? "not-allowed" : "pointer",
          boxSizing: "border-box",
          opacity: submitting ? 0.6 : 1,
        }}
      >
        {submitting ? "Connexion…" : "Se connecter"}
      </button>

      {errorMessage && (
        <p style={{ color: "var(--color-error)", fontSize: "var(--text-label)", margin: "12px 0 0", textAlign: "center" }}>
          {errorMessage}
        </p>
      )}

      <button
        type="button"
        onClick={onForgot}
        style={{
          width: "100%",
          marginTop: "14px",
          background: "none",
          border: "none",
          color: "var(--color-text-muted)",
          fontSize: "13px",
          fontWeight: "var(--weight-medium)",
          cursor: "pointer",
        }}
      >
        Mot de passe oublié&nbsp;?
      </button>

      <div style={{ height: "1px", background: "var(--color-border)", margin: "18px 0" }} />

      <button
        type="button"
        onClick={onCreateAccount}
        style={{
          width: "100%",
          minHeight: "48px",
          fontWeight: "var(--weight-medium)",
          fontSize: "14px",
          borderRadius: "12px",
          background: "var(--color-bg-elevated)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text-secondary)",
          cursor: "pointer",
          boxSizing: "border-box",
        }}
      >
        Créer un compte
      </button>
    </AuthShell>
  );
}
