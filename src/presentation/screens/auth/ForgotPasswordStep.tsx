import { useState } from "react";
import { AuthShell } from "@presentation/components/AuthShell";
import { BrandHeader } from "@presentation/components/BrandHeader";
import { GlassInput } from "@presentation/components/GlassInput";

export interface ForgotPasswordStepProps {
  onBack: () => void;
  /** Déclenche l'envoi réel du lien (uniquement si l'identifiant est un email). */
  onSubmit: (identifier: string) => void;
  /** true une fois la demande envoyée (message générique anti-énumération). */
  sent: boolean;
}

/**
 * Écran mot de passe oublié (isForgotView du prototype). Clone pixel-perfect.
 * Message volontairement générique : ne révèle pas si le compte existe.
 */
export function ForgotPasswordStep({ onBack, onSubmit, sent }: ForgotPasswordStepProps) {
  const [identifier, setIdentifier] = useState("");

  return (
    <AuthShell>
      <BrandHeader />

      <button
        type="button"
        onClick={onBack}
        aria-label="Retour"
        style={{
          height: "36px",
          width: "36px",
          borderRadius: "12px",
          background: "var(--color-bg-elevated)",
          border: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-secondary)",
          cursor: "pointer",
          marginBottom: "16px",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" aria-hidden="true">
          <polyline points="10,3 5,8 10,13" />
        </svg>
      </button>

      <h1 style={{ color: "#fff", fontSize: "20px", fontWeight: "var(--weight-medium)", margin: "0 0 4px" }}>
        Retrouve ton compte
      </h1>
      <p style={{ color: "var(--color-at-prefix)", fontSize: "13px", margin: "0 0 20px" }}>
        Entre ton e-mail ou ton pseudo.
      </p>

      <GlassInput
        type="text"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        placeholder="E-mail ou pseudo"
        autoComplete="username"
        autoCapitalize="none"
      />

      <button
        type="button"
        onClick={() => identifier.trim() && onSubmit(identifier.trim())}
        style={{
          width: "100%",
          minHeight: "52px",
          marginTop: "16px",
          fontWeight: "var(--weight-medium)",
          fontSize: "15px",
          borderRadius: "12px",
          background: "var(--color-accent)",
          color: "var(--color-on-accent)",
          border: "none",
          cursor: "pointer",
          boxSizing: "border-box",
        }}
      >
        CONTINUER
      </button>

      {sent && (
        <p style={{ color: "var(--color-success)", fontSize: "13px", textAlign: "center", margin: "14px 0 0" }}>
          Si ce compte existe, un lien de réinitialisation a été envoyé.
        </p>
      )}
    </AuthShell>
  );
}
