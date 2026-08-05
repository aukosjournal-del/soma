import { useEffect, useState } from "react";
import { BottomSheet } from "@presentation/components/BottomSheet";
import {
  type BodyMetrics,
  BIO_METRIC_CATALOG,
  MAX_VISIBLE_BIO,
  bioMetricValue,
  toggleSelection,
} from "@domain/profile/entities/BodyMetrics";

export interface BiometricsSheetProps {
  open: boolean;
  metrics: BodyMetrics;
  visibleIds: string[];
  onClose: () => void;
  onSave: (metrics: BodyMetrics, visibleIds: string[]) => Promise<void>;
}

/**
 * Compléter la biométrie — 13 mesures et choix de celles affichées sur le
 * tableau de bord (6 maximum, plafond imposé aussi en base).
 * Sheet long : corps scrollable, pied collant avec VALIDER.
 */
export function BiometricsSheet({ open, metrics, visibleIds, onClose, onSave }: BiometricsSheetProps) {
  const [values, setValues] = useState<BodyMetrics>(metrics);
  const [visible, setVisible] = useState<string[]>(visibleIds);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!open) return;
    setValues(metrics);
    setVisible(visibleIds);
    setError(undefined);
  }, [open, metrics, visibleIds]);

  const submit = async () => {
    setSaving(true);
    setError(undefined);
    try {
      await onSave(values, visible);
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
    <BottomSheet open={open} title="Compléter la biométrie" onClose={onClose} tall footer={footer}>
      <p style={{ color: "var(--color-at-prefix)", fontSize: "12px", margin: "0 0 12px" }}>
        Coche jusqu'à {MAX_VISIBLE_BIO} indicateurs à afficher sur le tableau de bord ({visible.length}/{MAX_VISIBLE_BIO})
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {BIO_METRIC_CATALOG.map((metric) => {
          const checked = visible.includes(metric.id);
          const disabled = !checked && visible.length >= MAX_VISIBLE_BIO;
          const derived = metric.readOnly === true;
          const shown = bioMetricValue(values, metric);

          return (
            <div
              key={metric.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 10px",
                borderRadius: "12px",
                background: "var(--color-bg-elevated)",
                border: "none",
              }}
            >
              <button
                type="button"
              className="soma-press"
                onClick={() => setVisible((v) => toggleSelection(v, metric.id, MAX_VISIBLE_BIO))}
                disabled={disabled}
                aria-pressed={checked}
                aria-label={`Afficher ${metric.label}`}
                style={{
                  flexShrink: 0,
                  height: "22px",
                  width: "22px",
                  borderRadius: "7px",
                  border: "none",
                  background: checked ? "var(--color-accent)" : "transparent",
                  color: "var(--color-on-accent)",
                  cursor: disabled ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: disabled ? 0.4 : 1,
                }}
              >
                {checked && (
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="3,8 6.5,11.5 13,4" />
                  </svg>
                )}
              </button>

              <span style={{ flex: 1, minWidth: 0, color: "#fff", fontSize: "13px", fontWeight: 500 }}>
                {metric.label}
              </span>

              <div style={{ flexShrink: 0, display: "flex", alignItems: "baseline", gap: "3px", width: "72px" }}>
                <input
                  type="text"
                  inputMode="decimal"
                  disabled={derived}
                  value={shown ?? ""}
                  onChange={(e) => {
                    if (derived || !metric.key) return;
                    const cleaned = e.target.value.replace(",", ".").replace(/[^0-9.]/g, "");
                    const key = metric.key;
                    setValues((v) => ({ ...v, [key]: cleaned === "" ? null : Number(cleaned) }));
                  }}
                  aria-label={metric.label}
                  style={{
                    width: "100%",
                    minWidth: 0,
                    height: "34px",
                    background: derived ? "transparent" : "rgba(192,235,255,0.05)",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0 8px",
                    color: derived ? "var(--color-text-muted)" : "#fff",
                    fontSize: "14px",
                    fontWeight: 500,
                    textAlign: "right",
                    boxSizing: "border-box",
                    fontVariantNumeric: "tabular-nums",
                  }}
                />
                <span style={{ color: "var(--color-text-faint)", fontSize: "10px", flexShrink: 0 }}>
                  {metric.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </BottomSheet>
  );
}
