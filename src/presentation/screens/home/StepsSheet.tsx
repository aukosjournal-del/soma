import { useEffect, useState } from "react";
import { BottomSheet } from "@presentation/components/BottomSheet";

export interface StepsSheetProps {
  open: boolean;
  initial: number;
  onClose: () => void;
  onSave: (steps: number) => Promise<void>;
}

/** Saisie des pas du jour. */
export function StepsSheet({ open, initial, onClose, onSave }: StepsSheetProps) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!open) return;
    setValue(initial ? String(initial) : "");
    setError(undefined);
  }, [open, initial]);

  const submit = async () => {
    setSaving(true);
    setError(undefined);
    try {
      await onSave(Number(value) || 0);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet open={open} title="Saisie des pas" onClose={onClose}>
      <label style={{ display: "block" }}>
        <div
          style={{
            color: "var(--color-text-muted)",
            fontSize: "12px",
            fontWeight: 500,
            letterSpacing: "0.04em",
            marginBottom: "4px",
          }}
        >
          Pas du jour
        </div>
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="1000"
          style={{
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
          }}
        />
      </label>

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
        {saving ? "ENREGISTREMENT…" : "ENREGISTRER"}
      </button>
    </BottomSheet>
  );
}
