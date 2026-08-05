import { useEffect, useState } from "react";
import { selectZeroOnFocus } from "@presentation/design-system/numericField";

const card = {
  background: "var(--color-bg-elevated)",
  border: "1px solid var(--color-border)",
  borderRadius: "24px",
  padding: "16px",
  backdropFilter: "var(--blur-glass)",
  WebkitBackdropFilter: "var(--blur-glass)",
  boxShadow: "var(--shadow-card)",
} as const;

const eyebrow = {
  color: "var(--color-at-prefix)",
  fontSize: "var(--text-caption)",
  fontWeight: "var(--weight-medium)",
  textTransform: "uppercase",
  letterSpacing: "var(--tracking-eyebrow)",
  margin: 0,
} as const;

const numberInput = {
  width: "100%",
  minWidth: 0,
  background: "transparent",
  border: "none",
  outline: "none",
  color: "#fff",
  fontSize: "var(--text-display)",
  fontWeight: "var(--weight-medium)",
  fontVariantNumeric: "tabular-nums",
  padding: 0,
} as const;

export interface GoalsCardProps {
  stepsGoal: number;
  kcalGoal: number;
  onSave: (goals: { stepsGoal: number; kcalGoal: number }) => Promise<void>;
}

/** Objectifs du moment — objectif de pas et objectif calorique quotidiens. */
export function GoalsCard({ stepsGoal, kcalGoal, onSave }: GoalsCardProps) {
  const [steps, setSteps] = useState(String(stepsGoal));
  const [kcal, setKcal] = useState(String(kcalGoal));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSteps(String(stepsGoal));
    setKcal(String(kcalGoal));
  }, [stepsGoal, kcalGoal]);

  const dirty = Number(steps) !== stepsGoal || Number(kcal) !== kcalGoal;

  const submit = async () => {
    // Les CHECK en base imposent des objectifs strictement positifs.
    await onSave({ stepsGoal: Math.max(1, Number(steps) || 0), kcalGoal: Math.max(1, Number(kcal) || 0) });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div style={card}>
      <p style={eyebrow}>Objectifs du moment</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
        <label style={{ display: "block", background: "rgba(192,235,255,0.05)", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "10px 12px" }}>
          <div style={{ color: "var(--color-text-muted)", fontSize: "var(--text-micro)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", marginBottom: "4px" }}>
            Objectif pas
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
            <input
              type="text"
              inputMode="numeric"
              onFocus={selectZeroOnFocus}
              value={steps}
              onChange={(e) => setSteps(e.target.value.replace(/[^0-9]/g, ""))}
              aria-label="Objectif de pas"
              style={numberInput}
            />
            <span style={{ color: "var(--color-text-faint)", fontSize: "var(--text-caption)", flexShrink: 0 }}>pas</span>
          </div>
        </label>

        <label style={{ display: "block", background: "rgba(192,235,255,0.05)", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "10px 12px" }}>
          <div style={{ color: "var(--color-text-muted)", fontSize: "var(--text-micro)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", marginBottom: "4px" }}>
            Objectif calorique
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
            <input
              type="text"
              inputMode="numeric"
              onFocus={selectZeroOnFocus}
              value={kcal}
              onChange={(e) => setKcal(e.target.value.replace(/[^0-9]/g, ""))}
              aria-label="Objectif calorique"
              style={numberInput}
            />
            <span style={{ color: "var(--color-text-faint)", fontSize: "var(--text-caption)", flexShrink: 0 }}>kcal</span>
          </div>
        </label>
      </div>

      {(dirty || saved) && (
        <button
          type="button"
          onClick={submit}
          disabled={!dirty}
          style={{
            width: "100%",
            minHeight: "44px",
            marginTop: "12px",
            fontWeight: "var(--weight-medium)",
            fontSize: "var(--text-label)",
            borderRadius: "12px",
            background: saved ? "rgba(16,185,129,0.15)" : "var(--color-accent)",
            color: saved ? "var(--color-success)" : "var(--color-on-accent)",
            border: "none",
            cursor: dirty ? "pointer" : "default",
            boxSizing: "border-box",
          }}
        >
          {saved ? "Objectifs enregistrés" : "Enregistrer les objectifs"}
        </button>
      )}
    </div>
  );
}
