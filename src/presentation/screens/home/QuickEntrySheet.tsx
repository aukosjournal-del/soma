import { useEffect, useState } from "react";
import { BottomSheet } from "@presentation/components/BottomSheet";
import type { NutritionEntry } from "@domain/home/entities/DailySummary";

const field = {
  width: "100%",
  height: "48px",
  background: "var(--color-bg-elevated)",
  borderRadius: "12px",
  padding: "0 12px",
  color: "#fff",
  fontSize: "15px",
  fontWeight: 500,
  boxSizing: "border-box",
  fontVariantNumeric: "tabular-nums",
} as const;

const label = {
  color: "var(--color-text-muted)",
  fontSize: "12px",
  fontWeight: 500,
  letterSpacing: "0.04em",
  marginBottom: "4px",
} as const;

/** Champs et placeholders repris à l'identique du prototype. */
const FIELDS: { key: keyof NutritionEntry; label: string; placeholder: string }[] = [
  { key: "kcal", label: "Calories (kcal)", placeholder: "2435" },
  { key: "proteinG", label: "Protéines (g)", placeholder: "211.3" },
  { key: "carbsG", label: "Glucides (g)", placeholder: "196.3" },
  { key: "fatG", label: "Lipides (g)", placeholder: "69.1" },
  { key: "saltG", label: "Sel (g)", placeholder: "4.70" },
];

export interface QuickEntrySheetProps {
  open: boolean;
  initial: NutritionEntry;
  onClose: () => void;
  onSave: (entry: NutritionEntry) => Promise<void>;
}

/** Saisie rapide — apport nutritionnel du jour. */
export function QuickEntrySheet({ open, initial, onClose, onSave }: QuickEntrySheetProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!open) return;
    setValues({
      kcal: initial.kcal ? String(initial.kcal) : "",
      proteinG: initial.proteinG ? String(initial.proteinG) : "",
      carbsG: initial.carbsG ? String(initial.carbsG) : "",
      fatG: initial.fatG ? String(initial.fatG) : "",
      saltG: initial.saltG ? String(initial.saltG) : "",
    });
    setError(undefined);
  }, [open, initial]);

  const num = (key: string) => Number((values[key] ?? "").replace(",", ".")) || 0;

  const submit = async () => {
    setSaving(true);
    setError(undefined);
    try {
      await onSave({
        kcal: num("kcal"),
        proteinG: num("proteinG"),
        carbsG: num("carbsG"),
        fatG: num("fatG"),
        saltG: num("saltG"),
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet open={open} title="Saisie rapide" onClose={onClose}>
      {(() => {
        const [kcalField, ...macros] = FIELDS;
        const render = (f: (typeof FIELDS)[number]) => (
          <label key={f.key} style={{ display: "block" }}>
            <div style={label}>{f.label}</div>
            <input
              type="text"
              inputMode="decimal"
              value={values[f.key] ?? ""}
              onChange={(e) =>
                setValues((v) => ({ ...v, [f.key]: e.target.value.replace(/[^0-9.,]/g, "") }))
              }
              placeholder={f.placeholder}
              style={field}
            />
          </label>
        );
        return (
          <>
            {kcalField && render(kcalField)}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
              {macros.map(render)}
            </div>
          </>
        );
      })()}

      {error && (
        <p style={{ color: "var(--color-error)", fontSize: "12px", margin: "12px 0 0", textAlign: "center" }}>{error}</p>
      )}

      <button
        type="button"
        className="soma-press"
        onClick={submit}
        disabled={saving}
        style={{
          width: "100%",
          minHeight: "52px",
          marginTop: "20px",
          fontWeight: 500,
          fontSize: "15px",
          borderRadius: "12px",
          background: "var(--color-accent)",
          color: "var(--color-on-accent)",
          border: "none",
          cursor: saving ? "not-allowed" : "pointer",
          boxSizing: "border-box",
          opacity: saving ? 0.6 : 1,
        }}
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>
    </BottomSheet>
  );
}
