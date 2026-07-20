import { useState, type CSSProperties } from "react";
import { AuthShell } from "@presentation/components/AuthShell";
import { BrandHeader } from "@presentation/components/BrandHeader";
import { ProgressBar } from "@presentation/components/ProgressBar";
import { useUsernameAvailability } from "@presentation/hooks/useUsernameAvailability";
import type { UsernameCheck } from "@domain/onboarding/use-cases/CheckUsernameAvailability";

/** Libellé + couleur du message de statut — miroir exact du prototype. */
function statusView(check: UsernameCheck): { text: string; color: string } {
  switch (check.status) {
    case "checking":
      return { text: "Vérification en cours…", color: "var(--color-at-prefix)" };
    case "available":
      return { text: "Disponible !", color: "var(--color-success)" };
    case "taken":
      return { text: "Ce pseudo est déjà pris", color: "var(--color-error)" };
    case "invalid":
      return check.reason === "too_short"
        ? { text: "Minimum 3 caractères", color: "var(--color-error)" }
        : { text: "Maximum 30 caractères", color: "var(--color-error)" };
    case "error":
      return { text: "Vérification impossible, réessaie", color: "var(--color-error)" };
    default:
      return { text: " ", color: "var(--color-at-prefix)" };
  }
}

const inputBase: CSSProperties = {
  width: "100%",
  minWidth: 0,
  height: "48px",
  background: "var(--color-bg-elevated)",
  border: "1px solid var(--color-border)",
  borderRadius: "12px",
  padding: "0 14px",
  color: "#fff",
  fontSize: "14px",
  fontWeight: 600,
  boxSizing: "border-box",
};

export interface UsernameStepProps {
  /** Appelé quand l'utilisateur valide un pseudo disponible (étape suivante). */
  onContinue?: (data: { firstName: string; lastName: string; username: string }) => void;
  onHaveAccount?: () => void;
}

/**
 * Onboarding — Étape 1/3 : choix du nom d'utilisateur.
 * Clone pixel-perfect de SOMA.dc.html (bloc signupStepIs2, lignes 83-95),
 * branché sur la vérification de disponibilité RÉELLE (RPC Supabase, debounced 500 ms).
 */
export function UsernameStep({ onContinue, onHaveAccount }: UsernameStepProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const { username, onChange, check, isAvailable } = useUsernameAvailability();
  const status = statusView(check);

  return (
    <AuthShell>
      <BrandHeader />

      <ProgressBar percent={33} />
      <p style={{ color: "var(--color-text-faint)", fontSize: "11px", margin: "0 0 18px" }}>
        Étape 1 sur 3
      </p>

      <h1 style={{ color: "#fff", fontSize: "20px", fontWeight: 900, margin: "0 0 16px" }}>
        Choisissez votre nom d'utilisateur
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Prénom"
          autoComplete="given-name"
          style={inputBase}
        />
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Nom"
          autoComplete="family-name"
          style={inputBase}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "var(--color-bg-elevated)",
          border: "1px solid var(--color-border)",
          borderRadius: "12px",
          padding: "0 14px",
          height: "48px",
        }}
      >
        <span style={{ color: "var(--color-at-prefix)", fontWeight: 700, marginRight: "2px" }}>@</span>
        <input
          type="text"
          value={username}
          onChange={(e) => onChange(e.target.value)}
          placeholder="pseudo"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          aria-label="Nom d'utilisateur"
          style={{
            flex: 1,
            minWidth: 0,
            height: "100%",
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 600,
            outline: "none",
          }}
        />
      </div>

      <p aria-live="polite" style={{ fontSize: "12px", margin: "8px 0 0", color: status.color }}>
        {status.text}
      </p>

      <button
        type="button"
        onClick={() => isAvailable && onContinue?.({ firstName, lastName, username })}
        disabled={!isAvailable}
        style={{
          width: "100%",
          minHeight: "52px",
          marginTop: "20px",
          fontWeight: 800,
          fontSize: "15px",
          borderRadius: "12px",
          background: "var(--color-accent)",
          color: "var(--color-on-accent)",
          border: "none",
          cursor: isAvailable ? "pointer" : "not-allowed",
          boxSizing: "border-box",
          opacity: isAvailable ? 1 : 0.5,
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
