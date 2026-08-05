import { AuthShell } from "@presentation/components/AuthShell";
import { BrandHeader } from "@presentation/components/BrandHeader";
import { ProgressBar } from "@presentation/components/ProgressBar";
import {
  type ExperienceLevel,
  EXPERIENCE_OPTIONS,
} from "@domain/onboarding/value-objects/ExperienceLevel";

export type FinalizeStatus = "idle" | "submitting" | "confirm_email" | "error";

export interface ExperienceStepProps {
  selected: ExperienceLevel | null;
  onSelect: (level: ExperienceLevel) => void;
  onFinalize: () => void;
  status: FinalizeStatus;
  errorMessage?: string;
}

/**
 * Onboarding — Étape 3/3 : niveau actuel + finalisation.
 * Clone pixel-perfect de SOMA.dc.html (bloc signupStepIs4).
 */
export function ExperienceStep({ selected, onSelect, onFinalize, status, errorMessage }: ExperienceStepProps) {
  const submitting = status === "submitting";
  const disabled = !selected || submitting;

  return (
    <AuthShell>
      <BrandHeader />

      <ProgressBar percent={100} />
      <p style={{ color: "var(--color-text-faint)", fontSize: "11px", margin: "0 0 18px" }}>
        Étape 3 sur 3
      </p>

      <h1 style={{ color: "#fff", fontSize: "20px", fontWeight: 900, margin: "0 0 16px" }}>
        Où en es-tu&nbsp;?
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {EXPERIENCE_OPTIONS.map((opt) => {
          const active = selected === opt.level;
          return (
            <button
              key={opt.level}
              type="button"
              onClick={() => onSelect(opt.level)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "14px",
                borderRadius: "12px",
                border: `1px solid ${active ? "var(--color-accent)" : "var(--color-border)"}`,
                background: active ? "var(--color-accent-soft)" : "var(--color-bg-elevated)",
                cursor: "pointer",
                boxSizing: "border-box",
              }}
            >
              <div style={{ color: "#fff", fontSize: "14px", fontWeight: 800 }}>{opt.title}</div>
              <div style={{ color: "var(--color-at-prefix)", fontSize: "12px", marginTop: "2px" }}>
                {opt.description}
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => !disabled && onFinalize()}
        disabled={disabled}
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
          cursor: disabled ? "not-allowed" : "pointer",
          boxSizing: "border-box",
          opacity: selected ? 1 : 0.5,
        }}
      >
        {submitting ? "Création…" : "C'est parti"}
      </button>

      {status === "error" && errorMessage && (
        <p style={{ color: "var(--color-error)", fontSize: "12px", margin: "12px 0 0", textAlign: "center" }}>
          {errorMessage}
        </p>
      )}
      {status === "confirm_email" && (
        <p style={{ color: "var(--color-success)", fontSize: "12px", margin: "12px 0 0", textAlign: "center" }}>
          Compte créé. Confirme ton e-mail pour activer ton profil.
        </p>
      )}
    </AuthShell>
  );
}
