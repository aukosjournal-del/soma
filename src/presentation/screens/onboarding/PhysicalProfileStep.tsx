import { useState } from "react";
import { AuthShell } from "@presentation/components/AuthShell";
import { BrandHeader } from "@presentation/components/BrandHeader";
import { ProgressBar } from "@presentation/components/ProgressBar";
import { GlassInput } from "@presentation/components/GlassInput";
import { selectZeroOnFocus } from "@presentation/design-system/numericField";
import {
  type PhysicalProfileInput,
  emptyPhysicalProfile,
  digitsOnly,
} from "@domain/onboarding/value-objects/PhysicalProfile";

const accentButton = {
  width: "100%",
  minHeight: "52px",
  marginTop: "20px",
  fontWeight: "var(--weight-medium)",
  fontSize: "15px",
  borderRadius: "12px",
  background: "var(--color-accent)",
  color: "var(--color-on-accent)",
  border: "none",
  cursor: "pointer",
  boxSizing: "border-box",
} as const;

export interface PhysicalProfileStepProps {
  initial?: PhysicalProfileInput;
  onContinue: (data: PhysicalProfileInput) => void;
  onSkip: () => void;
}

/**
 * Onboarding — Étape 2/3 : profil physique (date de naissance, taille, poids).
 * Clone pixel-perfect de SOMA.dc.html (bloc signupStepIs3, lignes 99-118).
 * Champs facultatifs : bouton « Passer cette étape » fidèle au prototype.
 */
export function PhysicalProfileStep({ initial, onContinue, onSkip }: PhysicalProfileStepProps) {
  const [data, setData] = useState<PhysicalProfileInput>(initial ?? emptyPhysicalProfile());
  const set = (patch: Partial<PhysicalProfileInput>) => setData((d) => ({ ...d, ...patch }));

  return (
    <AuthShell>
      <BrandHeader />

      <ProgressBar percent={66} />
      <p style={{ color: "var(--color-text-faint)", fontSize: "11px", margin: "0 0 18px" }}>
        Étape 2 sur 3
      </p>

      <h1 style={{ color: "#fff", fontSize: "20px", fontWeight: "var(--weight-medium)", margin: "0 0 16px" }}>
        Parle-nous de toi
      </h1>

      <p
        style={{
          color: "var(--color-text-muted)",
          fontSize: "12px",
          fontWeight: "var(--weight-medium)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          margin: "0 0 8px",
        }}
      >
        Date de naissance
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "12px" }}>
        <GlassInput
          inputMode="numeric"
          onFocus={selectZeroOnFocus}
          align="center"
          size={13}
          maxLength={2}
          value={data.birthDay}
          onChange={(e) => set({ birthDay: digitsOnly(e.target.value) })}
          placeholder="Jour"
          aria-label="Jour de naissance"
        />
        <GlassInput
          inputMode="numeric"
          onFocus={selectZeroOnFocus}
          align="center"
          size={13}
          maxLength={2}
          value={data.birthMonth}
          onChange={(e) => set({ birthMonth: digitsOnly(e.target.value) })}
          placeholder="Mois"
          aria-label="Mois de naissance"
        />
        <GlassInput
          inputMode="numeric"
          onFocus={selectZeroOnFocus}
          align="center"
          size={13}
          maxLength={4}
          value={data.birthYear}
          onChange={(e) => set({ birthYear: digitsOnly(e.target.value) })}
          placeholder="Année"
          aria-label="Année de naissance"
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <GlassInput
          inputMode="numeric"
          onFocus={selectZeroOnFocus}
          value={data.heightCm}
          onChange={(e) => set({ heightCm: digitsOnly(e.target.value) })}
          placeholder="Taille (cm)"
          aria-label="Taille en centimètres"
        />
        <GlassInput
          inputMode="numeric"
          onFocus={selectZeroOnFocus}
          value={data.weightKg}
          onChange={(e) => set({ weightKg: digitsOnly(e.target.value) })}
          placeholder="Poids actuel (kg)"
          aria-label="Poids en kilogrammes"
        />
      </div>

      <button type="button" onClick={() => onContinue(data)} style={accentButton}>
        CONTINUER
      </button>

      <button
        type="button"
        onClick={onSkip}
        style={{
          width: "100%",
          marginTop: "12px",
          background: "none",
          border: "none",
          color: "var(--color-text-faint)",
          fontSize: "12px",
          fontWeight: "var(--weight-medium)",
          cursor: "pointer",
        }}
      >
        Passer cette étape
      </button>
    </AuthShell>
  );
}
