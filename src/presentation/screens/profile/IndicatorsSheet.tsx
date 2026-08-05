import { useEffect, useState } from "react";
import { BottomSheet } from "@presentation/components/BottomSheet";
import {
  type BodyMetrics,
  MAX_VISIBLE_INDICATORS,
  allIndicators,
  toggleSelection,
} from "@domain/profile/entities/BodyMetrics";

export interface IndicatorsSheetProps {
  open: boolean;
  metrics: BodyMetrics;
  visibleIds: string[];
  onClose: () => void;
  onSave: (ids: string[]) => Promise<void>;
}

/**
 * Choisir les indicateurs affichés dans le Profil (4 maximum).
 * Chaque ligne montre la catégorie et la valeur actuelle en lecture seule.
 */
export function IndicatorsSheet({ open, metrics, visibleIds, onClose, onSave }: IndicatorsSheetProps) {
  const [visible, setVisible] = useState<string[]>(visibleIds);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!open) return;
    setVisible(visibleIds);
    setError(undefined);
  }, [open, visibleIds]);

  const submit = async () => {
    setSaving(true);
    setError(undefined);
    try {
      await onSave(visible);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  };

  const footer = (
    <>
      {error && (
        <p style={{ color: "var(--color-error)", fontSize: "12px", margin: "0 0 10px", textAlign: "center" }}>{error}</p>
      )}
      <button
        type="button"
              className="soma-press"
        onClick={submit}
        disabled={saving}
        style={{
          width: "100%",
          minHeight: "52px",
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
        {saving ? "ENREGISTREMENT…" : "VALIDER"}
      </button>
    </>
  );

  return (
    <BottomSheet open={open} title="Choisir les indicateurs" onClose={onClose} tall footer={footer}>
      <p style={{ color: "var(--color-at-prefix)", fontSize: "12px", margin: "0 0 12px" }}>
        Coche jusqu'à {MAX_VISIBLE_INDICATORS} indicateurs à afficher dans Récap ({visible.length}/
        {MAX_VISIBLE_INDICATORS})
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {allIndicators(metrics).map((indicator) => {
          const checked = visible.includes(indicator.id);
          const disabled = !checked && visible.length >= MAX_VISIBLE_INDICATORS;
          return (
            <button
              key={indicator.id}
              type="button"
              className="soma-press"
              onClick={() => setVisible((v) => toggleSelection(v, indicator.id, MAX_VISIBLE_INDICATORS))}
              disabled={disabled}
              aria-pressed={checked}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "12px",
                background: "var(--color-bg-elevated)",
                border: "none",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.5 : 1,
                textAlign: "left",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  height: "22px",
                  width: "22px",
                  borderRadius: "7px",
                  border: "none",
                  background: checked ? "var(--color-accent)" : "transparent",
                  color: "var(--color-on-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {checked && (
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="3,8 6.5,11.5 13,4" />
                  </svg>
                )}
              </span>

              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", color: "#fff", fontSize: "13px", fontWeight: 500 }}>
                  {indicator.label}
                </span>
                <span style={{ display: "block", color: "var(--color-text-faint)", fontSize: "11px", marginTop: "2px" }}>
                  {indicator.category}
                </span>
              </span>

              <span
                style={{
                  flexShrink: 0,
                  color: "var(--color-text-secondary)",
                  fontSize: "14px",
                  fontWeight: 500,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {indicator.value || "—"} {indicator.unit}
              </span>
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}
