export interface ChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  /** "muscle" = accent orange actif ; "equipment" = bleu clair actif, plus compact. */
  variant?: "muscle" | "equipment";
}

/**
 * Chip de filtre de la bibliothèque — pilule 999px.
 * Couleurs actives reprises du prototype : orange (groupes), bleu (équipements).
 */
export function Chip({ label, active, onClick, variant = "muscle" }: ChipProps) {
  const isMuscle = variant === "muscle";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        flexShrink: 0,
        padding: isMuscle ? "8px 14px" : "6px 12px",
        borderRadius: "999px",
        fontSize: isMuscle ? "12px" : "11px",
        fontWeight: 600,
        cursor: "pointer",
        border: "1px solid var(--color-border)",
        background: active
          ? isMuscle
            ? "var(--color-accent)"
            : "var(--color-text-secondary)"
          : "rgba(192,235,255,0.05)",
        color: active ? "var(--color-on-accent)" : "var(--color-text-secondary)",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}
